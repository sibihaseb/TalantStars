import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import path from 'path';
import { uploadFileToWasabi } from './upload';

// Configure ffmpeg to use the static binary
ffmpeg.setFfmpegPath(ffmpegStatic!);

interface VideoProcessingOptions {
  inputPath: string;
  outputDir: string;
  resolution?: string;
  quality?: string;
  segments?: number;
}

interface ProcessingResult {
  hlsUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
  fileSize: number;
}

export class VideoProcessor {
  private static readonly RESOLUTIONS = {
    '240p': '426x240',
    '360p': '640x360',
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080'
  };

  private static readonly BITRATES = {
    '240p': '400k',
    '360p': '800k',
    '480p': '1200k',
    '720p': '2500k',
    '1080p': '5000k'
  };

  static async processVideo(options: VideoProcessingOptions): Promise<ProcessingResult> {
    const { inputPath, outputDir, resolution = '720p', quality = 'medium', segments = 10 } = options;

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    const outputPlaylist = path.join(outputDir, 'playlist.m3u8');
    const outputPattern = path.join(outputDir, 'segment_%03d.ts');
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');

    // Get video info
    const videoInfo = await this.getVideoInfo(inputPath);
    
    // Process video to HLS
    await this.convertToHLS(inputPath, outputPlaylist, outputPattern, resolution, quality, segments);
    
    // Generate thumbnail
    await this.generateThumbnail(inputPath, thumbnailPath);

    // Upload all files to Wasabi
    const hlsUrl = await this.uploadHLSFiles(outputDir, outputPlaylist);
    const thumbnailUrl = await this.uploadThumbnail(thumbnailPath);

    // Clean up local files
    await this.cleanup(outputDir);

    return {
      hlsUrl,
      thumbnailUrl,
      duration: videoInfo.duration,
      resolution: videoInfo.resolution,
      fileSize: videoInfo.fileSize
    };
  }

  private static async getVideoInfo(inputPath: string): Promise<{ duration: number; resolution: string; fileSize: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const duration = metadata.format.duration || 0;
        const resolution = `${videoStream.width}x${videoStream.height}`;
        const fileSize = metadata.format.size || 0;

        resolve({ duration, resolution, fileSize });
      });
    });
  }

  private static async convertToHLS(
    inputPath: string,
    outputPlaylist: string,
    outputPattern: string,
    resolution: string,
    quality: string,
    segments: number
  ): Promise<void> {
    const targetResolution = this.RESOLUTIONS[resolution as keyof typeof this.RESOLUTIONS] || this.RESOLUTIONS['720p'];
    const bitrate = this.BITRATES[resolution as keyof typeof this.BITRATES] || this.BITRATES['720p'];

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(targetResolution)
        .videoBitrate(bitrate)
        .audioBitrate('128k')
        .addOptions([
          '-preset', quality === 'high' ? 'slow' : quality === 'low' ? 'fast' : 'medium',
          '-crf', quality === 'high' ? '18' : quality === 'low' ? '28' : '23',
          '-f', 'hls',
          '-hls_time', '10',
          '-hls_list_size', '0',
          '-hls_segment_filename', outputPattern,
          '-hls_flags', 'delete_segments'
        ])
        .output(outputPlaylist)
        .on('start', (commandLine) => {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('HLS conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during HLS conversion:', err);
          reject(err);
        })
        .run();
    });
  }

  private static async generateThumbnail(inputPath: string, thumbnailPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          folder: path.dirname(thumbnailPath),
          filename: path.basename(thumbnailPath),
          size: '1280x720'
        })
        .on('end', () => {
          console.log('Thumbnail generated');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error generating thumbnail:', err);
          reject(err);
        });
    });
  }

  private static async uploadHLSFiles(outputDir: string, playlistPath: string): Promise<string> {
    // Read all files in the output directory
    const files = await fs.readdir(outputDir);
    
    // Upload playlist and segments
    const uploadPromises = files.map(async (file) => {
      const filePath = path.join(outputDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        const fileBuffer = await fs.readFile(filePath);
        const mockFile = {
          buffer: fileBuffer,
          originalname: file,
          mimetype: file.endsWith('.m3u8') ? 'application/x-mpegurl' : 'video/mp2t',
          size: stats.size
        };
        
        const uploadResult = await uploadFileToWasabi(mockFile as any, 'hls-videos');
        return uploadResult;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    // Return the URL of the playlist file
    const playlistResult = uploadResults.find(result => result?.originalName.endsWith('.m3u8'));
    return playlistResult?.url || '';
  }

  private static async uploadThumbnail(thumbnailPath: string): Promise<string> {
    const thumbnailBuffer = await fs.readFile(thumbnailPath);
    const mockFile = {
      buffer: thumbnailBuffer,
      originalname: 'thumbnail.jpg',
      mimetype: 'image/jpeg',
      size: (await fs.stat(thumbnailPath)).size
    };
    
    const uploadResult = await uploadFileToWasabi(mockFile as any, 'video-thumbnails');
    return uploadResult.url;
  }

  private static async cleanup(outputDir: string): Promise<void> {
    try {
      await fs.rmdir(outputDir, { recursive: true });
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  static async generateThumbnailFromVideo(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(10) // Seek to 10 seconds
        .frames(1)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
}

export default VideoProcessor;