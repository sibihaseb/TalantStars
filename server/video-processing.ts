import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { uploadFileToWasabi } from './wasabi-config';
import { logger } from './logger';
import path from 'path';

/**
 * Generate thumbnail from video file
 * @param videoBuffer - The video file buffer
 * @param originalFilename - Original filename for naming
 * @param userId - User ID for organizing files
 * @returns Promise<string> - URL of uploaded thumbnail
 */
export async function generateVideoThumbnail(
  videoBuffer: Buffer,
  originalFilename: string,
  userId: number
): Promise<string | null> {
  try {
    // Create temporary files for processing
    const tempDir = '/tmp';
    const videoTempPath = path.join(tempDir, `video_${Date.now()}_${originalFilename}`);
    const thumbnailTempPath = path.join(tempDir, `thumb_${Date.now()}.jpg`);
    
    // Write video buffer to temporary file
    await fs.writeFile(videoTempPath, videoBuffer);
    
    // Extract frame at 1 second using ffmpeg
    const thumbnailGenerated = await new Promise<boolean>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoTempPath,
        '-ss', '00:00:01',          // Seek to 1 second
        '-vframes', '1',            // Extract 1 frame
        '-y',                       // Overwrite output file
        thumbnailTempPath
      ]);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
    
    if (!thumbnailGenerated) {
      throw new Error('Failed to generate thumbnail');
    }
    
    // Read the generated thumbnail
    const thumbnailBuffer = await fs.readFile(thumbnailTempPath);
    
    // Optimize thumbnail using Sharp (resize and compress)
    const optimizedThumbnail = await sharp(thumbnailBuffer)
      .resize(320, 240, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Create a file object for upload
    const thumbnailFile = {
      buffer: optimizedThumbnail,
      originalname: `${path.parse(originalFilename).name}_thumbnail.jpg`,
      mimetype: 'image/jpeg',
      size: optimizedThumbnail.length,
      fieldname: 'thumbnail',
      encoding: '7bit',
      stream: null,
      destination: '',
      filename: `${path.parse(originalFilename).name}_thumbnail.jpg`,
      path: ''
    } as any;
    
    // Upload thumbnail to Wasabi
    const uploadResult = await uploadFileToWasabi(thumbnailFile, `user-${userId}/thumbnails`);
    
    // Clean up temporary files
    try {
      await fs.unlink(videoTempPath);
      await fs.unlink(thumbnailTempPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError);
    }
    
    logger.mediaUpload('Video thumbnail generated successfully', {
      originalFilename,
      thumbnailUrl: uploadResult.url,
      thumbnailSize: optimizedThumbnail.length
    });
    
    return uploadResult.url;
    
  } catch (error) {
    logger.error('VIDEO_PROCESSING', 'Failed to generate video thumbnail', {
      error: error.message,
      originalFilename,
      userId
    });
    
    // Clean up any temporary files on error
    try {
      const tempDir = '/tmp';
      const videoTempPath = path.join(tempDir, `video_${Date.now()}_${originalFilename}`);
      const thumbnailTempPath = path.join(tempDir, `thumb_${Date.now()}.jpg`);
      await fs.unlink(videoTempPath).catch(() => {});
      await fs.unlink(thumbnailTempPath).catch(() => {});
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    return null;
  }
}

/**
 * Extract multiple frames from video for preview
 * @param videoBuffer - The video file buffer
 * @param originalFilename - Original filename for naming
 * @param userId - User ID for organizing files
 * @param frameCount - Number of frames to extract (default: 4)
 * @returns Promise<string[]> - Array of frame URLs
 */
export async function extractVideoFrames(
  videoBuffer: Buffer,
  originalFilename: string,
  userId: number,
  frameCount: number = 4
): Promise<string[]> {
  try {
    const tempDir = '/tmp';
    const videoTempPath = path.join(tempDir, `video_${Date.now()}_${originalFilename}`);
    const frameUrls: string[] = [];
    
    // Write video buffer to temporary file
    await fs.writeFile(videoTempPath, videoBuffer);
    
    // Extract frames at different timestamps
    for (let i = 0; i < frameCount; i++) {
      const timestamp = `00:00:${String(i * 2 + 1).padStart(2, '0')}`; // 1s, 3s, 5s, 7s
      const frameTempPath = path.join(tempDir, `frame_${Date.now()}_${i}.jpg`);
      
      const frameGenerated = await new Promise<boolean>((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoTempPath,
          '-ss', timestamp,
          '-vframes', '1',
          '-y',
          frameTempPath
        ]);
        
        ffmpeg.on('close', (code) => {
          resolve(code === 0);
        });
        
        ffmpeg.on('error', (error) => {
          reject(error);
        });
      });
      
      if (frameGenerated) {
        const frameBuffer = await fs.readFile(frameTempPath);
        
        // Optimize frame
        const optimizedFrame = await sharp(frameBuffer)
          .resize(160, 120, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 70 })
          .toBuffer();
        
        // Create file object and upload
        const frameFile = {
          buffer: optimizedFrame,
          originalname: `${path.parse(originalFilename).name}_frame_${i}.jpg`,
          mimetype: 'image/jpeg',
          size: optimizedFrame.length,
          fieldname: 'frame',
          encoding: '7bit',
          stream: null,
          destination: '',
          filename: `${path.parse(originalFilename).name}_frame_${i}.jpg`,
          path: ''
        } as any;
        
        const uploadResult = await uploadFileToWasabi(frameFile, `user-${userId}/frames`);
        frameUrls.push(uploadResult.url);
        
        // Clean up frame file
        await fs.unlink(frameTempPath).catch(() => {});
      }
    }
    
    // Clean up video file
    await fs.unlink(videoTempPath).catch(() => {});
    
    logger.mediaUpload('Video frames extracted successfully', {
      originalFilename,
      frameCount: frameUrls.length,
      frameUrls
    });
    
    return frameUrls;
    
  } catch (error) {
    logger.error('VIDEO_PROCESSING', 'Failed to extract video frames', {
      error: error.message,
      originalFilename,
      userId
    });
    
    return [];
  }
}