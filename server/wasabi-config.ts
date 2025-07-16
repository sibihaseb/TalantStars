import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Wasabi S3 configuration
const s3Client = new S3Client({
  region: process.env.WASABI_REGION || "us-east-1",
  endpoint: `https://s3.${process.env.WASABI_REGION || "us-east-1"}.wasabisys.com`,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.WASABI_BUCKET!;

export interface FileUploadResult {
  key: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
}

export async function uploadFileToWasabi(
  file: Express.Multer.File,
  folder: string = "media"
): Promise<FileUploadResult> {
  const fileExtension = file.originalname.split('.').pop();
  const key = `${folder}/${uuidv4()}.${fileExtension}`;
  
  // Debug: Check file buffer integrity
  console.log("WASABI UPLOAD DEBUG:", {
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    bufferLength: file.buffer?.length || 0,
    hasBuffer: !!file.buffer,
    bufferType: typeof file.buffer,
    key: key
  });
  
  if (!file.buffer || file.buffer.length === 0) {
    console.error("CRITICAL: File buffer is empty or undefined");
    throw new Error("File buffer is empty or corrupted");
  }
  
  // Additional buffer integrity check
  if (file.buffer.length !== file.size) {
    console.error("CRITICAL: File buffer size mismatch", {
      bufferLength: file.buffer.length,
      reportedSize: file.size,
      filename: file.originalname
    });
    throw new Error(`File buffer size mismatch: buffer=${file.buffer.length}, size=${file.size}`);
  }
  
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read" as const,
  };

  // Retry upload logic to handle intermittent failures
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`WASABI UPLOAD ATTEMPT ${attempt}/${maxRetries}:`, {
        key,
        bufferLength: file.buffer.length,
        size: file.size,
        mimetype: file.mimetype
      });
      
      const result = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log("WASABI UPLOAD SUCCESS:", {
        key,
        etag: result.ETag,
        versionId: result.VersionId,
        attempt
      });
      
      const url = `https://s3.${process.env.WASABI_REGION}.wasabisys.com/${BUCKET_NAME}/${key}`;
      
      return {
        key,
        url,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      lastError = error;
      console.error(`WASABI UPLOAD ATTEMPT ${attempt} FAILED:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error("Error uploading file to Wasabi after all retries:", lastError);
  throw new Error("Failed to upload file to cloud storage after " + maxRetries + " attempts");
}

export async function deleteFileFromWasabi(key: string): Promise<void> {
  const deleteParams = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("Error deleting file from Wasabi:", error);
    throw new Error("Failed to delete file from cloud storage");
  }
}

export async function generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export function getFileTypeFromMimeType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}