import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { storage as simpleStorage } from "./simple-storage";
import { setupAuth, isAuthenticated, isAdmin, requirePlan } from "./auth";
import { requirePermission, requireAnyPermission, PermissionChecks } from "./permissions";
import { enhanceProfile, generateBio } from "./openai";
import { 
  insertUserProfileSchema, 
  insertMediaFileSchema, 
  insertJobSchema, 
  insertJobApplicationSchema, 
  insertMessageSchema,
  insertMeetingSchema,
  insertNotificationSchema,
  insertUserPermissionSchema,
  insertSkillEndorsementSchema,
  insertSocialPostSchema,
  insertJobHistorySchema,
  insertSocialConnectionSchema,
  insertSocialInteractionSchema,
  insertUserTagSchema,
  insertMediaFileTagSchema,
  jobCommunications
} from "@shared/schema";
import { z } from "zod";
import { requestPasswordReset, validatePasswordResetToken, resetPassword } from "./passwordUtils";
import { sendMeetingInvitation, sendWelcomeEmail, sendEmail } from "./email";
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { uploadFileToWasabi, deleteFileFromWasabi, getFileTypeFromMimeType } from "./wasabi-config";
import multer from "multer";
import { logger } from "./logger";
import { createUploadNotification } from "./simple-notifications";
import { subscriptionManager } from './subscription-management';
import { cronJobManager } from './cron-jobs';
import Stripe from "stripe";

const scryptAsync = promisify(scrypt);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Email template helper functions
function generateEmailHtml(template: any): string {
  const { subject, content, elements } = template;
  
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .content { line-height: 1.6; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Talents & Stars</h1>
          </div>
          <div class="content">
  `;
  
  if (elements && elements.length > 0) {
    elements.forEach((element: any) => {
      switch (element.type) {
        case 'text':
          html += `<p>${element.content}</p>`;
          break;
        case 'heading':
          html += `<h2>${element.content}</h2>`;
          break;
        case 'button':
          html += `<a href="${element.url}" class="button">${element.text}</a>`;
          break;
        case 'image':
          html += `<img src="${element.url}" alt="${element.alt}" style="max-width: 100%; height: auto;">`;
          break;
      }
    });
  } else {
    html += `<p>${content}</p>`;
  }
  
  html += `
          </div>
          <div class="footer">
            <p>You received this email because you're a member of Talents & Stars.</p>
            <p>© 2025 Talents & Stars. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return html;
}

function generateEmailText(template: any): string {
  const { subject, content, elements } = template;
  
  let text = `TALENTS & STARS\n\n`;
  
  if (elements && elements.length > 0) {
    elements.forEach((element: any) => {
      switch (element.type) {
        case 'text':
          text += `${element.content}\n\n`;
          break;
        case 'heading':
          text += `${element.content.toUpperCase()}\n\n`;
          break;
        case 'button':
          text += `${element.text}: ${element.url}\n\n`;
          break;
        case 'image':
          text += `[Image: ${element.alt}]\n\n`;
          break;
      }
    });
  } else {
    text += `${content}\n\n`;
  }
  
  text += `---\nYou received this email because you're a member of Talents & Stars.\n© 2025 Talents & Stars. All rights reserved.`;
  
  return text;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default session duration setting
  try {
    const settings = await simpleStorage.getAdminSettings();
    const sessionDurationExists = settings.find(s => s.key === 'session_duration_hours');
    
    if (!sessionDurationExists) {
      console.log('Initializing default session duration (168 hours for testing)...');
      await simpleStorage.updateAdminSetting('session_duration_hours', '168', 'system');
    } else {
      // Force update for testing to ensure 7-day sessions
      console.log('Updating session duration to 168 hours for testing...');
      await simpleStorage.updateAdminSetting('session_duration_hours', '168', 'system');
    }
  } catch (error) {
    console.error('Error initializing session duration setting:', error);
  }

  // Setup traditional authentication for all routes
  await setupAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images, videos, and audio files
      if (file.mimetype.startsWith('image/') || 
          file.mimetype.startsWith('video/') || 
          file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image, video, and audio files are allowed'));
      }
    }
  });

  // Auth routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await simpleStorage.getUser(userId);
      const profile = await simpleStorage.getUserProfile(userId);
      
      // Get user's pricing tier limits
      let tierLimits = null;
      if (user.pricingTierId) {
        tierLimits = await storage.getPricingTier(user.pricingTierId);
      }
      
      res.json({ ...user, profile, tierLimits });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration endpoint - removed duplicate from routes.ts as it's handled in auth.ts



  // Profile routes
  app.post('/api/profile', isAuthenticated, requirePlan, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Creating profile for user:", userId);
      console.log("Request body:", req.body);
      
      // Validate that userId exists
      if (!userId) {
        console.error("No userId found in request");
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Add userId to the request body before validation
      const dataWithUserId = { ...req.body, userId };
      console.log("Data with userId:", dataWithUserId);
      
      // Clean empty strings to null for numeric fields
      const cleanedData = {
        ...dataWithUserId,
        dailyRate: dataWithUserId.dailyRate === '' ? null : dataWithUserId.dailyRate,
        weeklyRate: dataWithUserId.weeklyRate === '' ? null : dataWithUserId.weeklyRate,
        projectRate: dataWithUserId.projectRate === '' ? null : dataWithUserId.projectRate,
        profileViews: dataWithUserId.profileViews === '' ? null : dataWithUserId.profileViews,
      };
      
      const profileData = insertUserProfileSchema.parse(cleanedData);
      console.log("Parsed profile data:", profileData);
      
      const profile = await simpleStorage.createUserProfile(profileData);
      console.log("Created profile:", profile);
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to create profile", error: errorMessage });
    }
  });

  app.put('/api/profile', isAuthenticated, requirePlan, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await simpleStorage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Upload profile image
  app.post('/api/user/profile-image', isAuthenticated, requirePlan, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      console.log('Profile image upload request received');
      console.log('User ID:', userId);
      console.log('File:', file);
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      
      if (!file) {
        console.log('No file received by server');
        return res.status(400).json({ message: "No image file provided" });
      }

      // Upload to Wasabi S3
      const uploadResult = await uploadFileToWasabi(file, `user-${userId}/profile`);
      
      // Update user profile image URL in database
      const updatedUser = await storage.updateUserProfileImage(userId, uploadResult.url);
      
      res.json({
        profileImageUrl: uploadResult.url,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  // AI enhancement routes
  app.post('/api/profile/enhance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await simpleStorage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const enhanced = await enhanceProfile(profile);
      const updatedProfile = await simpleStorage.updateUserProfile(userId, enhanced);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error enhancing profile:", error);
      res.status(500).json({ message: "Failed to enhance profile" });
    }
  });

  app.post('/api/profile/generate-bio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const bio = await generateBio(profile);
      res.json({ bio });
    } catch (error) {
      console.error("Error generating bio:", error);
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });

  // Calendar routes
  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const events = await storage.getUserAvailabilityEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventData = {
        userId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        status: req.body.status || 'available',
        notes: req.body.notes || null,
        allDay: req.body.allDay !== undefined ? req.body.allDay : true,
      };
      const event = await storage.createAvailabilityEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventId = parseInt(req.params.id);
      const eventData = {
        ...req.body,
        startDateTime: new Date(`${req.body.startDate} ${req.body.startTime}`),
        endDateTime: req.body.endDate && req.body.endTime ? new Date(`${req.body.endDate} ${req.body.endTime}`) : null,
      };
      const event = await storage.updateAvailabilityEvent(eventId, userId, eventData);
      res.json(event);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventId = parseInt(req.params.id);
      await storage.deleteAvailabilityEvent(eventId, userId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Media routes - support single file and external URLs
  app.post('/api/media', (req: any, res: any, next: any) => {
    logger.mediaUpload('🔥 MEDIA UPLOAD ENDPOINT HIT - INITIAL ENTRY', {
      url: req.url,
      method: req.method,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    }, req);
    console.log('🔥 MEDIA UPLOAD ENDPOINT HIT - INITIAL ENTRY', {
      url: req.url,
      method: req.method,
      contentType: req.headers['content-type']
    });
    next();
  }, isAuthenticated, requirePlan, (req: any, res: any, next: any) => {
    logger.mediaUpload('Media upload request passed authentication', {
      userId: req.user?.id,
      sessionId: req.sessionID,
      bodyKeys: Object.keys(req.body || {}),
      hasFile: !!req.file
    }, req);
    
    // Custom error handler for multer
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        logger.error('MEDIA_UPLOAD', 'Multer error occurred', {
          error: err.message,
          code: err.code,
          stack: err.stack
        }, req);
        
        if (err.message && err.message.includes('Multipart: Boundary not found')) {
          return res.status(400).json({ 
            message: "Invalid file upload format. Please try again or use a different file.",
            error: "BOUNDARY_NOT_FOUND"
          });
        }
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: "File too large. Maximum size is 50MB.",
            error: "FILE_TOO_LARGE"
          });
        }
        
        return res.status(400).json({ 
          message: "File upload error: " + err.message,
          error: "UPLOAD_ERROR"
        });
      }
      
      logger.mediaUpload('Multer processing completed successfully', {
        fileReceived: !!req.file,
        fileDetails: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          hasBuffer: !!req.file.buffer
        } : null
      }, req);
      
      next();
    });
  }, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file as Express.Multer.File;
      const { title, description, category, externalUrl, processVideo } = req.body;
      
      logger.mediaUpload('Processing media upload request', {
        userId,
        hasFile: !!file,
        title,
        description,
        category,
        externalUrl,
        processVideo,
        fileDetails: file ? {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        } : null
      }, req);
      
      // This endpoint is now only for file uploads
      if (!file) {
        logger.error('MEDIA_UPLOAD', 'No file received in media upload request', {
          bodyKeys: Object.keys(req.body || {}),
          hasFile: !!file
        }, req);
        return res.status(400).json({ message: "File is required for this endpoint. Use /api/media/external for external URLs." });
      }

      // Check user's pricing tier limits
      const user = await simpleStorage.getUser(userId);
      let tierLimits = null;
      if (user?.pricingTierId) {
        tierLimits = await simpleStorage.getPricingTier(user.pricingTierId);
      }

      // For simple storage, we'll use a simplified approach
      // In a real implementation, you'd track media uploads in the database
      const photoCount = 0; // TODO: Implement actual media counting
      const videoCount = 0; // TODO: Implement actual media counting
      const audioCount = 0; // TODO: Implement actual media counting
      const externalLinkCount = 0; // TODO: Implement actual media counting

      // Handle single file upload
      if (file) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 'audio';
        
        // Check individual file limits
        if (tierLimits) {
          if (fileType === 'image' && tierLimits.maxPhotos > 0 && photoCount >= tierLimits.maxPhotos) {
            return res.status(400).json({ 
              message: `Photo limit reached. Your plan allows ${tierLimits.maxPhotos} photos.`,
              limitType: 'photos',
              currentCount: photoCount,
              maxAllowed: tierLimits.maxPhotos
            });
          }
          
          if (fileType === 'video' && tierLimits.maxVideos > 0 && videoCount >= tierLimits.maxVideos) {
            return res.status(400).json({ 
              message: `Video limit reached. Your plan allows ${tierLimits.maxVideos} videos.`,
              limitType: 'videos',
              currentCount: videoCount,
              maxAllowed: tierLimits.maxVideos
            });
          }
          
          if (fileType === 'audio' && tierLimits.maxAudio > 0 && audioCount >= tierLimits.maxAudio) {
            return res.status(400).json({ 
              message: `Audio limit reached. Your plan allows ${tierLimits.maxAudio} audio files.`,
              limitType: 'audio',
              currentCount: audioCount,
              maxAllowed: tierLimits.maxAudio
            });
          }
        }
        
        try {
          logger.mediaUpload('Attempting to upload file to Wasabi', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer,
            bufferLength: file.buffer?.length || 0,
            bufferType: typeof file.buffer,
            path: `user-${userId}/media`
          }, req);
          
          // Debug: Check if file buffer is properly formed
          console.log("PRE-UPLOAD FILE BUFFER DEBUG:", {
            originalname: file.originalname,
            size: file.size,
            bufferLength: file.buffer?.length || 0,
            bufferMatch: file.buffer?.length === file.size,
            bufferFirst10Bytes: file.buffer?.slice(0, 10),
            bufferLast10Bytes: file.buffer?.slice(-10),
            mimetype: file.mimetype
          });
          
          const uploadResult = await uploadFileToWasabi(file, `user-${userId}/media`);
          
          logger.mediaUpload('Wasabi upload completed successfully', {
            uploadResult,
            wasabiKey: uploadResult.key,
            wasabiUrl: uploadResult.url,
            fileSize: uploadResult.size
          }, req);
          
          let thumbnailUrl = null;
          let hlsUrl = null;
          
          // Generate thumbnail for video files
          if (fileType === 'video' && file.buffer) {
            try {
              const { generateVideoThumbnail } = await import('./video-processing');
              thumbnailUrl = await generateVideoThumbnail(file.buffer, file.originalname, userId);
              
              logger.mediaUpload('Video thumbnail generation attempted', {
                originalFilename: file.originalname,
                thumbnailGenerated: !!thumbnailUrl,
                thumbnailUrl: thumbnailUrl
              }, req);
            } catch (error) {
              logger.error('VIDEO_PROCESSING', 'Failed to generate video thumbnail', {
                error: error.message,
                originalFilename: file.originalname
              }, req);
              // Continue with upload even if thumbnail generation fails
            }
          }
          
          // Process video for HLS streaming if requested and it's a video file
          if (processVideo === 'true' && fileType === 'video') {
            try {
              // Note: Video processing requires disk storage, but we're using memory storage
              // For now, we'll skip video processing when using memory storage
              console.log('Video processing skipped: requires disk storage, but using memory storage');
            } catch (error) {
              console.error("Error processing video:", error);
              // Continue with regular upload if video processing fails
            }
          }
          
          // Create media record using storage interface
          const mediaData = {
            userId,
            filename: uploadResult.key,
            originalName: uploadResult.originalName,
            mimeType: uploadResult.type,
            size: uploadResult.size,
            url: uploadResult.url,
            thumbnailUrl,
            mediaType: fileType,
            tags: [],
            title: title || uploadResult.originalName,
            description: description || '',
            isPublic: true,
            category: category || 'portfolio',
            hlsUrl,
            metadata: {
              processedForHLS: !!hlsUrl,
              originalFileSize: uploadResult.size,
              processingDate: hlsUrl ? new Date().toISOString() : null
            }
          };
          
          logger.database('Creating media file record in database', {
            mediaData,
            userId,
            filename: uploadResult.key
          }, req);
          
          const createdMedia = await simpleStorage.createMediaFile(mediaData);
          
          // Verify the media was created successfully
          if (!createdMedia || !createdMedia.id) {
            throw new Error("Failed to create media record in database");
          }
          
          // Verify the media can be retrieved
          const verificationMedia = await simpleStorage.getMediaFile(createdMedia.id);
          if (!verificationMedia) {
            throw new Error("Media was created but cannot be retrieved - database inconsistency");
          }
          
          // Verify the uploaded file is accessible
          try {
            const headResponse = await fetch(uploadResult.url, { method: 'HEAD' });
            if (!headResponse.ok) {
              logger.error('MEDIA_UPLOAD', `Uploaded file is not accessible: ${headResponse.status}`, {
                url: uploadResult.url,
                mediaId: createdMedia.id
              }, req);
            }
          } catch (error) {
            logger.error('MEDIA_UPLOAD', 'Failed to verify uploaded file accessibility', {
              url: uploadResult.url,
              mediaId: createdMedia.id,
              error: error.message
            }, req);
          }
          
          logger.database('Media file created successfully in database', {
            createdMediaId: createdMedia.id,
            createdMediaUrl: createdMedia.url,
            mediaType: createdMedia.mediaType,
            verified: true
          }, req);
          
          // Create notification for successful upload
          await createUploadNotification(userId, uploadResult.originalName);
          
          logger.mediaUpload('Media upload completed and verified successfully', {
            mediaId: createdMedia.id,
            wasabiUrl: createdMedia.url,
            filename: uploadResult.originalName,
            fileSize: uploadResult.size,
            mediaType: fileType,
            verified: true
          }, req);
          
          return res.json(createdMedia);
        } catch (error) {
          logger.error('MEDIA_UPLOAD', `Error uploading file ${file.originalname}`, {
            error: error.message,
            stack: error.stack,
            fileName: file.originalname,
            fileSize: file.size,
            mimetype: file.mimetype
          }, req);
          return res.status(500).json({ message: "Failed to upload file: " + error.message });
        }
      }
    } catch (error) {
      logger.error('MEDIA_UPLOAD', 'Error creating media', {
        error: error.message,
        stack: error.stack,
        bodyKeys: Object.keys(req.body || {}),
        hasFile: !!req.file
      }, req);
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.post('/api/media/external', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { url, title, description, category } = req.body;
      
      // Validate required fields
      if (!url || !url.trim()) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      // Determine media type from URL
      let mediaType = 'video';
      const urlString = url.toString().toLowerCase();
      if (urlString.includes('youtube.com') || urlString.includes('youtu.be')) {
        mediaType = 'video';
      } else if (urlString.includes('vimeo.com')) {
        mediaType = 'video';
      } else if (urlString.includes('soundcloud.com') || urlString.includes('spotify.com')) {
        mediaType = 'audio';
      }
      
      const mediaData = {
        userId,
        filename: `external_${Date.now()}`,
        originalName: title || 'External Media',
        mimeType: `${mediaType}/external`,
        size: 0,
        url: url, // Use the external URL as the main URL for external media
        thumbnailUrl: null,
        mediaType,
        tags: [],
        title: title || '',
        description: description || '',
        isPublic: true,
        category: category || 'portfolio',
        externalUrl: url,
        isExternal: true
      };
      
      logger.mediaUpload('Creating external media file', {
        mediaData,
        userId,
        url
      }, req);
      
      const media = await simpleStorage.createMediaFile(mediaData);
      
      // Verify the media was created successfully
      if (!media || !media.id) {
        throw new Error("Failed to create media record in database");
      }
      
      // Verify the media can be retrieved
      const verificationMedia = await simpleStorage.getMediaFile(media.id);
      if (!verificationMedia) {
        throw new Error("Media was created but cannot be retrieved - database inconsistency");
      }
      
      logger.mediaUpload('External media upload completed and verified', {
        mediaId: media.id,
        url: media.url,
        title: media.title,
        verified: true
      }, req);
      
      res.json(media);
    } catch (error) {
      console.error("Error creating external media file:", error);
      logger.error('MEDIA_UPLOAD', 'Failed to create external media file', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        userId: req.user?.id
      }, req);
      res.status(500).json({ message: "Failed to create external media file: " + error.message });
    }
  });

  // Enhanced upload verification endpoint with retry logic
  app.post('/api/media/verify/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const mediaId = parseInt(req.params.id);
      const maxRetries = 10;
      const baseDelayMs = 500;
      
      const verificationResults = {
        mediaId,
        exists: false,
        accessible: false,
        databaseConsistent: false,
        fileSize: null,
        mimeType: null,
        url: null,
        errors: [],
        verificationAttempts: 0,
        s3Accessible: false,
        databaseComplete: false,
        finalAttempt: false
      };

      logger.mediaUpload('Starting enhanced verification with retry logic', {
        mediaId,
        userId,
        maxRetries
      }, req);

      // Retry verification with exponential backoff
      let media = null;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        verificationResults.verificationAttempts = attempt;
        verificationResults.finalAttempt = (attempt === maxRetries);
        
        logger.mediaUpload(`Verification attempt ${attempt}/${maxRetries}`, {
          mediaId,
          userId,
          attempt
        }, req);

        // Check if media exists in database
        media = await simpleStorage.getMediaFile(mediaId);
        if (!media) {
          verificationResults.errors.push(`Attempt ${attempt}: Media record not found in database`);
          logger.mediaUpload(`Attempt ${attempt}: No database record`, { mediaId, userId }, req);
          
          if (attempt < maxRetries) {
            // Wait before retrying with exponential backoff
            const delay = baseDelayMs * Math.pow(1.5, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            logger.mediaUpload('Final attempt failed - media not found in database', { mediaId, userId }, req);
            return res.json(verificationResults);
          }
        }

        // Check if user owns the media
        if (media.userId !== userId) {
          verificationResults.errors.push('Access denied: Media belongs to different user');
          logger.mediaUpload('Access denied - wrong user', { 
            mediaId, 
            mediaUserId: media.userId, 
            requestUserId: userId 
          }, req);
          return res.status(403).json(verificationResults);
        }

        verificationResults.exists = true;
        verificationResults.url = media.url;
        verificationResults.mimeType = media.mimeType;
        verificationResults.fileSize = media.size;
        verificationResults.databaseComplete = !!(media.url && media.mimeType && media.size !== undefined);

        logger.mediaUpload(`Attempt ${attempt}: Database record found`, {
          mediaId,
          url: media.url,
          mimeType: media.mimeType,
          size: media.size,
          isExternal: media.isExternal,
          databaseComplete: verificationResults.databaseComplete
        }, req);

        // For external media, validate URL accessibility
        if (media.isExternal) {
          try {
            const response = await fetch(media.url, { 
              method: 'HEAD',
              timeout: 8000,
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TalentStars/1.0)' }
            });
            
            if (response.ok) {
              verificationResults.accessible = true;
              verificationResults.s3Accessible = true;
              verificationResults.databaseConsistent = true;
              logger.mediaUpload(`Attempt ${attempt}: External URL accessible`, {
                mediaId,
                url: media.url,
                status: response.status
              }, req);
              break; // Success, exit retry loop
            } else {
              verificationResults.errors.push(`Attempt ${attempt}: External URL not accessible: ${response.status} ${response.statusText}`);
              logger.mediaUpload(`Attempt ${attempt}: External URL not accessible`, {
                mediaId,
                url: media.url,
                status: response.status
              }, req);
            }
          } catch (error) {
            verificationResults.errors.push(`Attempt ${attempt}: External URL check failed: ${error.message}`);
            logger.mediaUpload(`Attempt ${attempt}: External URL error`, {
              mediaId,
              url: media.url,
              error: error.message
            }, req);
          }
        } else {
          // For uploaded files, check S3 accessibility with comprehensive validation
          try {
            const headResponse = await fetch(media.url, { 
              method: 'HEAD',
              timeout: 8000,
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TalentStars/1.0)' }
            });
            
            if (headResponse.ok) {
              verificationResults.accessible = true;
              verificationResults.s3Accessible = true;
              
              const contentLength = headResponse.headers.get('content-length');
              const contentType = headResponse.headers.get('content-type');
              
              // Validate file size consistency
              if (contentLength && parseInt(contentLength) === media.size) {
                verificationResults.databaseConsistent = true;
                logger.mediaUpload(`Attempt ${attempt}: S3 file fully verified`, {
                  mediaId,
                  url: media.url,
                  status: headResponse.status,
                  contentLength,
                  contentType,
                  expectedSize: media.size
                }, req);
                break; // Success, exit retry loop
              } else {
                verificationResults.errors.push(`Attempt ${attempt}: File size mismatch - expected ${media.size}, got ${contentLength}`);
                logger.mediaUpload(`Attempt ${attempt}: File size mismatch`, {
                  mediaId,
                  expectedSize: media.size,
                  actualSize: contentLength
                }, req);
              }
            } else {
              verificationResults.errors.push(`Attempt ${attempt}: File not accessible: HTTP ${headResponse.status}`);
              logger.mediaUpload(`Attempt ${attempt}: S3 file not accessible`, {
                mediaId,
                url: media.url,
                status: headResponse.status
              }, req);
            }
          } catch (error) {
            verificationResults.errors.push(`Attempt ${attempt}: S3 accessibility check failed: ${error.message}`);
            logger.mediaUpload(`Attempt ${attempt}: S3 accessibility error`, {
              mediaId,
              url: media.url,
              error: error.message
            }, req);
          }
        }

        // If this is the last attempt, break regardless
        if (attempt === maxRetries) {
          logger.mediaUpload('Max retry attempts reached', { mediaId, userId, attempts: attempt }, req);
          break;
        }

        // Wait before next attempt with exponential backoff
        const delay = baseDelayMs * Math.pow(1.5, attempt - 1);
        logger.mediaUpload(`Waiting ${delay}ms before next attempt`, { mediaId, attempt, delay }, req);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const isFullyVerified = verificationResults.exists && 
                             verificationResults.accessible && 
                             verificationResults.databaseConsistent && 
                             verificationResults.s3Accessible &&
                             verificationResults.databaseComplete;

      logger.mediaUpload('Final verification results', {
        mediaId,
        userId,
        isFullyVerified,
        attempts: verificationResults.verificationAttempts,
        exists: verificationResults.exists,
        accessible: verificationResults.accessible,
        databaseConsistent: verificationResults.databaseConsistent,
        s3Accessible: verificationResults.s3Accessible,
        databaseComplete: verificationResults.databaseComplete,
        errorCount: verificationResults.errors.length
      }, req);

      res.json(verificationResults);
      
    } catch (error) {
      logger.error('MEDIA_UPLOAD', 'Media verification failed', {
        error: error.message,
        mediaId: req.params.id,
        userId: req.user?.id
      }, req);
      res.status(500).json({ message: 'Media verification failed: ' + error.message });
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const media = await simpleStorage.getUserMediaFiles(userId);
      
      // Add empty tags array for now to avoid the database column issue
      const mediaWithTags = media.map(mediaFile => ({
        ...mediaFile,
        tags: []
      }));
      
      res.json(mediaWithTags);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Update media endpoint
  app.put('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description, category } = req.body;
      const userId = req.user.id;
      
      // Get media file to verify ownership
      const mediaFiles = await simpleStorage.getUserMediaFiles(userId);
      const mediaFile = mediaFiles.find(m => m.id === id);
      
      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      // Update media file
      const updatedMedia = await simpleStorage.updateMediaFile(id, {
        title,
        description,
        category,
      });
      
      res.json(updatedMedia);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get media file info before deletion
      const mediaFiles = await simpleStorage.getUserMediaFiles(req.user.id);
      const mediaFile = mediaFiles.find(m => m.id === id);
      
      if (mediaFile && mediaFile.filename && !mediaFile.isExternal) {
        // Delete from Wasabi if it's not an external link
        try {
          await deleteFileFromWasabi(mediaFile.filename);
        } catch (error) {
          console.error("Error deleting file from Wasabi:", error);
          // Continue with database deletion even if cloud deletion fails
        }
      }
      
      await simpleStorage.deleteMediaFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Social Media Routes
  
  // Get social feed
  app.get("/api/social/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getFeedPosts(userId, limit, offset);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching feed: " + error.message });
    }
  });

  // Get user's posts
  app.get("/api/social/posts/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getUserSocialPosts(userId);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching posts: " + error.message });
    }
  });

  // Upload media for social posts
  app.post("/api/social/upload", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadResult = await uploadFileToWasabi(req.file, "social");
      
      res.json({
        url: uploadResult.url,
        key: uploadResult.key,
        type: getFileTypeFromMimeType(uploadResult.type),
        originalName: uploadResult.originalName,
        size: uploadResult.size
      });
    } catch (error: any) {
      console.error("Error uploading social media file:", error);
      res.status(500).json({ message: "Error uploading file: " + error.message });
    }
  });

  // Upload media files (general media upload endpoint)
  app.post("/api/media/upload", isAuthenticated, upload.array('files', 10), async (req: any, res) => {
    try {
      logger.mediaUpload("Media upload request received", {
        userId: req.user.id,
        username: req.user.username,
        fileCount: req.files?.length || 0,
        headers: req.headers
      }, req);

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        logger.mediaUpload("No files in upload request", { userId: req.user.id }, req);
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = [];
      
      for (const file of files) {
        logger.mediaUpload(`Processing file: ${file.originalname}`, {
          userId: req.user.id,
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          bufferLength: file.buffer?.length || 0,
          hasBuffer: !!file.buffer,
          bufferType: typeof file.buffer
        }, req);

        // Debug: Check file buffer integrity before upload
        console.log("MULTER FILE DEBUG:", {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          bufferLength: file.buffer?.length || 0,
          hasBuffer: !!file.buffer,
          bufferType: typeof file.buffer,
          encoding: file.encoding,
          fieldname: file.fieldname
        });

        // Upload to Wasabi S3
        const uploadResult = await uploadFileToWasabi(file, `user-${req.user.id}/media`);
        
        // Store media file in database
        const mediaFile = await storage.createMediaFile({
          userId: req.user.id,
          filename: uploadResult.originalName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadResult.url,
          mediaType: file.mimetype.startsWith('image/') ? 'image' : 
                    file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('audio/') ? 'audio' : 'document',
          isPublic: true,
          isExternal: false
        });
        
        uploadedFiles.push({
          id: mediaFile.id,
          url: uploadResult.url,
          key: uploadResult.key,
          type: getFileTypeFromMimeType(file.mimetype),
          originalName: file.originalname,
          size: file.size,
          mediaType: mediaFile.mediaType
        });
      }

      logger.mediaUpload("Media upload completed successfully", {
        userId: req.user.id,
        uploadedCount: uploadedFiles.length,
        files: uploadedFiles.map(f => ({ name: f.originalName, type: f.type }))
      }, req);

      // Add a small delay to ensure images are fully available from Wasabi S3
      await new Promise(resolve => setTimeout(resolve, 500));

      res.json({ files: uploadedFiles });
    } catch (error: any) {
      logger.error("MEDIA_UPLOAD", "Media upload failed", { 
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      }, req);
      console.error("Error uploading media files:", error);
      res.status(500).json({ error: "Failed to upload files: " + error.message });
    }
  });

  // Create post
  app.post("/api/social/posts", isAuthenticated, async (req: any, res) => {
    try {
      const postData = {
        userId: req.user.id,
        content: req.body.content,
        mediaUrls: req.body.mediaUrls || [],
        privacy: req.body.privacy || 'public',
      };
      
      const post = await storage.createSocialPost(postData);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating post: " + error.message });
    }
  });

  // Like post
  app.post("/api/social/posts/:postId/like", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user.id;
      
      await storage.likeSocialPost(postId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error liking post: " + error.message });
    }
  });

  // Unlike post
  app.delete("/api/social/posts/:postId/like", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user.id;
      
      await storage.unlikeSocialPost(postId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error unliking post: " + error.message });
    }
  });

  // Comment on post
  app.post("/api/social/posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const commentData = {
        postId,
        userId: req.user.id,
        content: req.body.content,
      };
      
      const comment = await storage.commentOnPost(commentData);
      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating comment: " + error.message });
    }
  });

  // Get post comments
  app.get("/api/social/posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching comments: " + error.message });
    }
  });

  // Friend Operations
  
  // Get friends
  app.get("/api/social/friends", isAuthenticated, async (req: any, res) => {
    try {
      const friends = await storage.getFriends(req.user.id);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching friends: " + error.message });
    }
  });

  // Get friend requests
  app.get("/api/social/friend-requests", isAuthenticated, async (req: any, res) => {
    try {
      const requests = await storage.getFriendRequests(req.user.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching friend requests: " + error.message });
    }
  });

  // Send friend request
  app.post("/api/social/friend-request/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const addresseeId = parseInt(req.params.userId);
      const friendship = await storage.sendFriendRequest(req.user.id, addresseeId);
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ message: "Error sending friend request: " + error.message });
    }
  });

  // Accept friend request
  app.post("/api/social/friend-request/:friendshipId/accept", isAuthenticated, async (req: any, res) => {
    try {
      const friendshipId = parseInt(req.params.friendshipId);
      const friendship = await storage.acceptFriendRequest(friendshipId);
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ message: "Error accepting friend request: " + error.message });
    }
  });

  // Reject friend request
  app.delete("/api/social/friend-request/:friendshipId", isAuthenticated, async (req: any, res) => {
    try {
      const friendshipId = parseInt(req.params.friendshipId);
      await storage.rejectFriendRequest(friendshipId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error rejecting friend request: " + error.message });
    }
  });

  // Search users
  app.get("/api/social/search", isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const users = await storage.searchUsers(query, req.user.id);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: "Error searching users: " + error.message });
    }
  });

  // Professional Connections
  
  // Get professional connections
  app.get("/api/social/professional-connections", isAuthenticated, async (req: any, res) => {
    try {
      const connections = await storage.getProfessionalConnections(req.user.id);
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching professional connections: " + error.message });
    }
  });

  // Create professional connection
  app.post("/api/social/professional-connections", isAuthenticated, async (req: any, res) => {
    try {
      const connectionData = {
        talentId: req.user.id,
        professionalId: req.body.professionalId,
        connectionType: req.body.connectionType,
        status: req.body.status || 'pending',
        notes: req.body.notes,
      };
      
      const connection = await storage.createProfessionalConnection(connectionData);
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating professional connection: " + error.message });
    }
  });

  // Privacy Settings
  
  // Get privacy settings
  app.get("/api/social/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getUserPrivacySettings(req.user.id);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching privacy settings: " + error.message });
    }
  });

  // Update privacy settings
  app.put("/api/social/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.updateUserPrivacySettings(req.user.id, req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating privacy settings: " + error.message });
    }
  });

  // Job routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobData = insertJobSchema.parse({ ...req.body, userId });
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const { talentType, location, status } = req.query;
      const jobs = await storage.getJobs({
        talentType: talentType as string,
        location: location as string,
        status: status as string,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Job application routes
  app.post('/api/jobs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      const applicationData = insertJobApplicationSchema.parse({
        ...req.body,
        userId,
        jobId,
      });
      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to create job application" });
    }
  });

  app.get('/api/jobs/:id/applications', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const applications = await storage.getJobApplications(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  // Job communications routes
  app.post('/api/jobs/:id/communications', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const senderId = req.user.id;
      const { message, receiverId } = req.body;

      if (!message || !receiverId) {
        return res.status(400).json({ message: "Message and receiver ID are required" });
      }

      const communication = await storage.createJobCommunication(jobId, senderId, receiverId, message);
      res.json(communication);
    } catch (error) {
      console.error("Error creating job communication:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/jobs/:id/communications', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const communications = await storage.getJobCommunications(jobId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching job communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.patch('/api/job-communications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markJobCommunicationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking communication as read:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.id;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      broadcastMessage(message);
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.userId;
      const messages = await storage.getMessages(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Featured talents routes - temporarily returning mock data until tables are created
  app.get('/api/featured-talents', async (req, res) => {
    try {
      // Temporary mock data
      const featuredTalents = [
        {
          id: "1",
          username: "emma_star",
          profileImage: "/mock-profile.jpg",
          fullName: "Emma Star",
          talentType: "actor",
          location: "Los Angeles, CA",
          verificationStatus: "verified",
          featuredReason: "Outstanding performance in recent productions",
          skills: ["Acting", "Voice Acting", "Singing"],
          bio: "Professional actress with 10+ years experience in film and television.",
          rating: 4.8,
          category: "Featured Performer"
        }
      ];
      res.json(featuredTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  // Talent categories routes - temporarily returning mock data until tables are created
  app.get('/api/talent-categories', async (req, res) => {
    try {
      // Temporary mock data
      const categories = [
        {
          id: 1,
          name: "Featured Performer",
          description: "Top-rated performers showcased on our platform",
          icon: "🌟",
          color: "gold",
          isActive: true,
          talentCount: 12
        },
        {
          id: 2,
          name: "Rising Star",
          description: "Up-and-coming talent making waves",
          icon: "⭐",
          color: "silver",
          isActive: true,
          talentCount: 8
        }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching talent categories:", error);
      res.status(500).json({ message: "Failed to fetch talent categories" });
    }
  });

  // Tag management routes
  app.post('/api/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tagData = insertUserTagSchema.parse({ ...req.body, userId });
      const tag = await storage.createUserTag(tagData);
      res.json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  app.get('/api/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tags = await storage.getUserTags(userId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.patch('/api/tags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify tag ownership
      const existingTag = await storage.getUserTags(userId);
      const tag = existingTag.find(t => t.id === id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const updatedTag = await storage.updateUserTag(id, req.body);
      res.json(updatedTag);
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ message: "Failed to update tag" });
    }
  });

  app.delete('/api/tags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify tag ownership
      const existingTag = await storage.getUserTags(userId);
      const tag = existingTag.find(t => t.id === id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      await storage.deleteUserTag(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });

  // Media file tag association routes
  app.post('/api/media/:mediaId/tags/:tagId', isAuthenticated, async (req: any, res) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const tagId = parseInt(req.params.tagId);
      const userId = req.user.id;
      
      // Verify media file ownership
      const mediaFile = await storage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      // Verify tag ownership
      const userTags = await storage.getUserTags(userId);
      const tag = userTags.find(t => t.id === tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const mediaFileTag = await storage.addTagToMediaFile(mediaId, tagId);
      res.json(mediaFileTag);
    } catch (error) {
      console.error("Error adding tag to media file:", error);
      res.status(500).json({ message: "Failed to add tag to media file" });
    }
  });

  app.delete('/api/media/:mediaId/tags/:tagId', isAuthenticated, async (req: any, res) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const tagId = parseInt(req.params.tagId);
      const userId = req.user.id;
      
      // Verify media file ownership
      const mediaFile = await storage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      await storage.removeTagFromMediaFile(mediaId, tagId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing tag from media file:", error);
      res.status(500).json({ message: "Failed to remove tag from media file" });
    }
  });

  app.get('/api/media/:mediaId/tags', isAuthenticated, async (req: any, res) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const userId = req.user.id;
      
      // Verify media file ownership
      const mediaFile = await storage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      const tags = await storage.getTagsForMediaFile(mediaId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching media file tags:", error);
      res.status(500).json({ message: "Failed to fetch media file tags" });
    }
  });

  app.get('/api/tags/:tagId/media', isAuthenticated, async (req: any, res) => {
    try {
      const tagId = parseInt(req.params.tagId);
      const userId = req.user.id;
      
      // Verify tag ownership
      const userTags = await storage.getUserTags(userId);
      const tag = userTags.find(t => t.id === tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const mediaFiles = await storage.getMediaFilesByTag(tagId);
      res.json(mediaFiles);
    } catch (error) {
      console.error("Error fetching media files by tag:", error);
      res.status(500).json({ message: "Failed to fetch media files by tag" });
    }
  });

  // Search routes
  app.get('/api/search/talents', async (req, res) => {
    try {
      const { q, talentType, location, featured } = req.query;
      
      // Build search parameters
      const searchParams = {
        query: q as string,
        talentType: talentType as string,
        location: location as string,
        featured: featured === 'true',
      };
      
      const talents = await storage.searchTalentsPublic(searchParams);
      res.json(talents);
    } catch (error) {
      console.error("Error searching talents:", error);
      res.status(500).json({ message: "Failed to search talents" });
    }
  });

  // Get individual talent profile
  app.get('/api/talent/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Talent profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching talent profile:", error);
      res.status(500).json({ message: "Failed to fetch talent profile" });
    }
  });

  // Admin featured talents routes - temporarily disabled until tables are created
  /*
  app.get('/api/admin/featured-talents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const featuredTalents = await storage.getFeaturedTalents();
      res.json(featuredTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  app.post('/api/admin/featured-talents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const featuredTalent = await storage.createFeaturedTalent(req.body);
      res.json(featuredTalent);
    } catch (error) {
      console.error("Error creating featured talent:", error);
      res.status(500).json({ message: "Failed to create featured talent" });
    }
  });

  app.put('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const featuredTalent = await storage.updateFeaturedTalent(id, req.body);
      res.json(featuredTalent);
    } catch (error) {
      console.error("Error updating featured talent:", error);
      res.status(500).json({ message: "Failed to update featured talent" });
    }
  });

  app.delete('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeaturedTalent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting featured talent:", error);
      res.status(500).json({ message: "Failed to delete featured talent" });
    }
  });

  // Admin talent categories routes
  app.get('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categories = await storage.getTalentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching talent categories:", error);
      res.status(500).json({ message: "Failed to fetch talent categories" });
    }
  });

  // Admin user limits management routes
  app.get('/api/admin/users-with-limits', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersWithLimits();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with limits:", error);
      res.status(500).json({ message: "Failed to fetch users with limits" });
    }
  });

  app.post('/api/admin/grant-user-limits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId, limits } = req.body;
      const adminId = req.user.id;
      
      if (!userId || !limits) {
        return res.status(400).json({ message: "User ID and limits are required" });
      }

      const result = await storage.grantUserLimits(userId, limits, adminId);
      res.json(result);
    } catch (error) {
      console.error("Error granting user limits:", error);
      res.status(500).json({ message: "Failed to grant user limits" });
    }
  });

  app.delete('/api/admin/revoke-user-limits/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      await storage.revokeUserLimits(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking user limits:", error);
      res.status(500).json({ message: "Failed to revoke user limits" });
    }
  });

  app.post('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await storage.createTalentCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating talent category:", error);
      res.status(500).json({ message: "Failed to create talent category" });
    }
  });

  app.put('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.updateTalentCategory(id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating talent category:", error);
      res.status(500).json({ message: "Failed to update talent category" });
    }
  });

  app.delete('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTalentCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting talent category:", error);
      res.status(500).json({ message: "Failed to delete talent category" });
    }
  });

  // Admin SEO routes
  app.get('/api/admin/seo-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const seoSettings = await storage.getSEOSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post('/api/admin/seo-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const seoSetting = await storage.createOrUpdateSEOSettings(req.body);
      res.json(seoSetting);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      res.status(500).json({ message: "Failed to save SEO settings" });
    }
  });

  app.post('/api/admin/generate-seo', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pagePath } = req.body;
      const generatedSEO = await storage.generateSEOContent(pagePath);
      res.json(generatedSEO);
    } catch (error) {
      console.error("Error generating SEO content:", error);
      res.status(500).json({ message: "Failed to generate SEO content" });
    }
  });

  app.get('/api/admin/seo-analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getSEOAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching SEO analytics:", error);
      res.status(500).json({ message: "Failed to fetch SEO analytics" });
    }
  });
  */

  // Admin routes (for user management, pricing, etc.)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await simpleStorage.getAllUsers();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(users));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).setHeader('Content-Type', 'application/json').send(JSON.stringify({ message: "Failed to fetch users" }));
    }
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating user:", req.body);
      
      // Validate required fields
      const { email, firstName, lastName, role } = req.body;
      if (!email || !firstName || !lastName || !role) {
        res.status(400).setHeader('Content-Type', 'application/json').send(JSON.stringify({ 
          message: "Missing required fields", 
          required: ["email", "firstName", "lastName", "role"] 
        }));
        return;
      }
      
      // Create user data with proper schema mapping
      const hashedPassword = await hashPassword("defaultPassword123");
      const userData = {
        email,
        firstName,
        lastName,
        role,
        username: email, // Use email as username
        password: hashedPassword // Hashed default password for admin-created users
      };
      
      console.log("Mapped user data:", userData);
      const user = await simpleStorage.createUser(userData);
      console.log("Created user successfully:", user);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(user));
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).setHeader('Content-Type', 'application/json').send(JSON.stringify({ message: "Failed to create user", error: error.message }));
    }
  });

  app.put('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log("Updating user:", userId, req.body);
      
      // Get existing user to preserve required fields
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Merge request body with existing user data, ensuring username exists
      const userData = {
        ...existingUser,
        ...req.body,
        id: userId,
        username: req.body.username || existingUser.username || req.body.email || existingUser.email
      };
      
      console.log("Merged user data:", userData);
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log("Deleting user:", userId);
      // Note: In a real application, you might want to implement soft delete
      // For now, we'll just return success since the storage doesn't have delete user method
      res.json({ success: true, message: "User deletion requested" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  });

  // Password reset routes
  app.post('/api/admin/users/:userId/reset-password', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const success = await requestPasswordReset(user.email);
      if (success) {
        res.json({ success: true, message: "Password reset email sent" });
      } else {
        res.status(500).json({ message: "Failed to send password reset email" });
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.status(500).json({ message: "Failed to send password reset", error: error.message });
    }
  });

  // Mass email functionality
  app.post('/api/admin/mass-email', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { subject, content, recipients } = req.body;
      
      if (!subject || !content || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ message: "Missing required fields: subject, content, and recipients array" });
      }
      
      // Send emails to all recipients
      const emailPromises = recipients.map(email => 
        sendEmail({
          to: email,
          subject,
          html: content,
          text: content.replace(/<[^>]*>/g, '') // Simple HTML to text conversion
        })
      );
      
      const results = await Promise.allSettled(emailPromises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failureCount = results.filter(result => result.status === 'rejected').length;
      
      res.json({ 
        success: true,
        message: `Mass email campaign completed`,
        stats: {
          total: recipients.length,
          sent: successCount,
          failed: failureCount
        }
      });
    } catch (error) {
      console.error("Error sending mass email:", error);
      res.status(500).json({ message: "Failed to send mass email", error: error.message });
    }
  });

  // Meeting routes
  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const organizerId = req.user.id;
      const meetingData = { ...req.body, organizerId };
      
      const meeting = await storage.createMeeting(meetingData);
      
      // Send meeting invitation email
      const attendee = await storage.getUser(meetingData.attendeeId);
      if (attendee) {
        await sendMeetingInvitation(attendee.email, {
          title: meeting.title,
          date: new Date(meeting.meetingDate).toLocaleDateString(),
          time: new Date(meeting.meetingDate).toLocaleTimeString(),
          location: meeting.location,
          virtualLink: meeting.virtualLink,
          organizer: req.user.claims.name || req.user.claims.email,
          description: meeting.description,
        });
      }
      
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting", error: error.message });
    }
  });

  app.get('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const meetings = await storage.getMeetings(userId);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.put('/api/meetings/:meetingId', isAuthenticated, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await storage.updateMeeting(parseInt(meetingId), req.body);
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting", error: error.message });
    }
  });

  app.delete('/api/meetings/:meetingId', isAuthenticated, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      await storage.deleteMeeting(parseInt(meetingId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting", error: error.message });
    }
  });

  // User permissions routes
  app.get('/api/admin/users/:userId/permissions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post('/api/admin/users/:userId/permissions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const grantedBy = req.user.id; // Use traditional auth user ID
      const permission = await storage.createUserPermission({
        userId,
        category: req.body.category,
        action: req.body.action,
        resource: req.body.resource,
        granted: req.body.granted,
        grantedBy: grantedBy.toString(),
      });
      res.json(permission);
    } catch (error) {
      console.error("Error creating user permission:", error);
      res.status(500).json({ message: "Failed to create user permission", error: error.message });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For now, return mock notifications since we're using simple storage
      const mockNotifications = [
        {
          id: 1,
          type: 'system',
          title: 'Welcome to Talents & Stars!',
          message: 'Complete your profile to get started and discover amazing opportunities.',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'profile',
          title: 'Profile Update Reminder',
          message: 'Your profile is 75% complete. Add more details to attract better opportunities.',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 3,
          type: 'job',
          title: 'New Job Match',
          message: 'A new casting call matches your profile. Check it out now!',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ];
      
      res.json(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      // For now, just return success since we're using mock data
      console.log(`Marking notification ${notificationId} as read`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
    }
  });

  app.delete('/api/notifications/:notificationId', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      // For now, just return success since we're using mock data
      console.log(`Deleting notification ${notificationId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification", error: error.message });
    }
  });

  app.put('/api/admin/users/:userId/role', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/admin/users/:userId/verify', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { verified } = req.body;
      const updatedProfile = await storage.updateUserVerification(userId, verified);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user verification:", error);
      res.status(500).json({ message: "Failed to update user verification" });
    }
  });

  // Pricing tiers management
  app.get('/api/admin/pricing-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tiers = await storage.getPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.post('/api/admin/pricing-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating pricing tier:", req.body);
      const tier = await storage.createPricingTier(req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ message: "Failed to create pricing tier", error: error.message });
    }
  });

  app.put('/api/admin/pricing-tiers/:tierId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierId = parseInt(req.params.tierId);
      const tier = await storage.updatePricingTier(tierId, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      res.status(500).json({ message: "Failed to update pricing tier" });
    }
  });

  app.delete('/api/admin/pricing-tiers/:tierId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierId = parseInt(req.params.tierId);
      await storage.deletePricingTier(tierId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
      res.status(500).json({ message: "Failed to delete pricing tier" });
    }
  });

  // Promo code management routes
  app.get('/api/admin/promo-codes', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({ message: "Failed to fetch promo codes" });
    }
  });

  app.post('/api/admin/promo-codes', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating promo code:", req.body);
      const promoCodeData = {
        ...req.body,
        createdBy: req.user.id,
        usedCount: 0
      };
      const promoCode = await storage.createPromoCode(promoCodeData);
      res.json(promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ message: "Failed to create promo code", error: error.message });
    }
  });

  app.put('/api/admin/promo-codes/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const promoCode = await storage.updatePromoCode(promoCodeId, req.body);
      res.json(promoCode);
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  app.delete('/api/admin/promo-codes/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      await storage.deletePromoCode(promoCodeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({ message: "Failed to delete promo code" });
    }
  });

  app.get('/api/admin/promo-codes/:id/usage', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const usage = await storage.getPromoCodeUsage(promoCodeId);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching promo code usage:", error);
      res.status(500).json({ message: "Failed to fetch promo code usage" });
    }
  });

  // Email campaigns management routes
  app.get('/api/admin/email-campaigns', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      res.status(500).json({ message: "Failed to fetch email campaigns" });
    }
  });

  app.post('/api/admin/email-campaigns', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating email campaign:", req.body);
      const campaignData = {
        ...req.body,
        createdBy: req.user.id,
        status: req.body.type === 'instant' ? 'sending' : 'scheduled'
      };
      const campaign = await storage.createEmailCampaign(campaignData);
      
      // If it's an instant campaign, send immediately
      if (req.body.type === 'instant') {
        try {
          // Get target users based on groups
          const targetUsers = await storage.getUsersByGroups(req.body.targetGroups);
          
          // Send emails to all target users
          let sentCount = 0;
          let failedCount = 0;
          
          for (const user of targetUsers) {
            try {
              await sendEmail({
                to: user.email,
                subject: req.body.template.subject,
                html: generateEmailHtml(req.body.template),
                text: generateEmailText(req.body.template)
              });
              sentCount++;
            } catch (emailError) {
              failedCount++;
              console.error(`Failed to send email to ${user.email}:`, emailError);
            }
          }
          
          // Update campaign status and stats
          await storage.updateEmailCampaignStatus(campaign.id, 'sent', {
            sentCount,
            failedCount,
            totalTargets: targetUsers.length
          });
        } catch (sendError) {
          console.error("Error sending instant campaign:", sendError);
          await storage.updateEmailCampaignStatus(campaign.id, 'failed');
        }
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error creating email campaign:", error);
      res.status(500).json({ message: "Failed to create email campaign", error: error.message });
    }
  });

  app.put('/api/admin/email-campaigns/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.updateEmailCampaign(campaignId, req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ message: "Failed to update email campaign" });
    }
  });

  app.delete('/api/admin/email-campaigns/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      await storage.deleteEmailCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ message: "Failed to delete email campaign" });
    }
  });

  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating email template:", req.body);
      const templateData = {
        ...req.body,
        createdBy: req.user.id
      };
      const template = await storage.createEmailTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create email template", error: error.message });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.updateEmailTemplate(templateId, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      await storage.deleteEmailTemplate(templateId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // Public promo code validation and usage
  app.post('/api/validate-promo-code', isAuthenticated, async (req: any, res) => {
    try {
      const { code, tierId, planType } = req.body;
      const userId = req.user.id;

      if (!code || !tierId || !planType) {
        return res.status(400).json({ message: "Missing required fields: code, tierId, planType" });
      }

      const validation = await storage.validatePromoCode(code, userId, tierId, planType);
      
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Calculate discount
      const tier = await storage.getPricingTier(tierId);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }

      const originalAmount = planType === "annual" ? Number(tier.annualPrice) : Number(tier.price);
      const discountAmount = await storage.calculateDiscountAmount(validation.promoCode!, originalAmount);
      const finalAmount = originalAmount - discountAmount;

      res.json({
        valid: true,
        promoCode: validation.promoCode,
        originalAmount,
        discountAmount,
        finalAmount,
        savings: discountAmount
      });
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  // Profile questions management
  app.get('/api/admin/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const talentType = req.query.talent_type as string;
      let query = db.select().from(profileQuestions);
      
      if (talentType) {
        query = query.where(eq(profileQuestions.talentType, talentType));
      }
      
      const questions = await query.orderBy(asc(profileQuestions.order));
      res.json(questions);
    } catch (error) {
      console.error("Error fetching admin questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post('/api/admin/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating profile question:", req.body);
      const questionData = req.body;
      const [question] = await db.insert(profileQuestions).values(questionData).returning();
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  app.put('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const questionData = req.body;
      
      const [updatedQuestion] = await db
        .update(profileQuestions)
        .set(questionData)
        .where(eq(profileQuestions.id, questionId))
        .returning();
      
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  app.delete('/api/admin/questions/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      
      await db.delete(profileQuestions).where(eq(profileQuestions.id, questionId));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // Keep the old endpoints for backward compatibility
  // Public endpoint for profile questions (used in onboarding)
  app.get('/api/profile-questions', isAuthenticated, async (req: any, res) => {
    try {
      const questions = await storage.getProfileQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching profile questions:", error);
      res.status(500).json({ message: "Failed to fetch profile questions" });
    }
  });

  // Admin endpoint for profile questions management
  app.get('/api/admin/profile-questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questions = await storage.getProfileQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching profile questions:", error);
      res.status(500).json({ message: "Failed to fetch profile questions" });
    }
  });

  // User Representation routes
  app.get('/api/user/representations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const representations = await storage.getUserRepresentations(userId);
      res.json(representations);
    } catch (error) {
      console.error("Error fetching user representations:", error);
      res.status(500).json({ message: "Failed to fetch user representations" });
    }
  });

  app.post('/api/user/representations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const representationData = {
        userId,
        representationType: req.body.representationType,
        name: req.body.name,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
        website: req.body.website,
        notes: req.body.notes,
        isPrimary: req.body.isPrimary || false,
      };
      
      const representation = await storage.createUserRepresentation(representationData);
      res.json(representation);
    } catch (error) {
      console.error("Error creating user representation:", error);
      res.status(500).json({ message: "Failed to create user representation" });
    }
  });

  app.put('/api/user/representations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const representationId = parseInt(req.params.id);
      const representationData = req.body;
      
      const representation = await storage.updateUserRepresentation(representationId, representationData);
      res.json(representation);
    } catch (error) {
      console.error("Error updating user representation:", error);
      res.status(500).json({ message: "Failed to update user representation" });
    }
  });

  app.delete('/api/user/representations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const representationId = parseInt(req.params.id);
      await storage.deleteUserRepresentation(representationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user representation:", error);
      res.status(500).json({ message: "Failed to delete user representation" });
    }
  });

  // Role-based pricing tier routes
  app.get('/api/pricing-tiers', async (req, res) => {
    try {
      const role = req.query.role as string;
      let tiers;
      
      if (role) {
        tiers = await storage.getPricingTiersByRole(role);
      } else {
        tiers = await storage.getPricingTiers();
      }
      
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.get('/api/pricing-tiers/:id', async (req, res) => {
    try {
      const tierId = parseInt(req.params.id);
      const tier = await storage.getPricingTier(tierId);
      
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      res.json(tier);
    } catch (error) {
      console.error("Error fetching pricing tier:", error);
      res.status(500).json({ message: "Failed to fetch pricing tier" });
    }
  });

  app.post('/api/admin/profile-questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating profile question:", req.body);
      const question = await storage.createProfileQuestion(req.body);
      res.json(question);
    } catch (error) {
      console.error("Error creating profile question:", error);
      res.status(500).json({ message: "Failed to create profile question", error: error.message });
    }
  });



  // Featured talent management endpoints
  app.get('/api/admin/featured-talent', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredTalents = await storage.getFeaturedTalents();
      res.json(featuredTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  app.get('/api/admin/all-talent-profiles', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allTalents = await storage.getAllTalentProfiles();
      res.json(allTalents);
    } catch (error) {
      console.error("Error fetching talent profiles:", error);
      res.status(500).json({ message: "Failed to fetch talent profiles" });
    }
  });

  app.post('/api/admin/toggle-featured', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId, isFeatured, featuredTier } = req.body;
      
      const updatedProfile = await storage.toggleFeaturedStatus(userId, isFeatured, featuredTier);
      
      res.json({
        success: true,
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      res.status(500).json({ message: "Failed to toggle featured status" });
    }
  });

  // Get user's media limits based on pricing tier
  app.get('/api/user/media-limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limits = await storage.getUserMediaLimits(userId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching media limits:", error);
      res.status(500).json({ message: "Failed to fetch media limits" });
    }
  });

  // Check if user can upload media
  app.post('/api/user/check-media-upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { mediaType } = req.body; // 'image', 'video', 'audio'
      
      const canUpload = await storage.checkMediaUploadPermission(userId, mediaType);
      res.json({ canUpload });
    } catch (error) {
      console.error("Error checking media upload permission:", error);
      res.status(500).json({ message: "Failed to check upload permission" });
    }
  });

  // User usage dashboard endpoint
  app.get("/api/user/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await simpleStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get tier information - use try-catch to handle potential errors
      let tier = null;
      try {
        if (user.pricingTierId) {
          tier = await simpleStorage.getPricingTier(user.pricingTierId);
        }
      } catch (error) {
        console.log("Error fetching pricing tier:", error);
        // Continue without tier info
      }

      // Mock usage data - in production, this would come from actual database
      const mockUsage = {
        photos: { current: 3, limit: tier?.maxPhotos || 5 },
        videos: { current: 1, limit: tier?.maxVideos || 2 },
        audio: { current: 0, limit: tier?.maxAudio || 3 },
        externalLinks: { current: 2, limit: tier?.maxExternalLinks || 3 },
        storage: { current: 2.1 * 1024 * 1024 * 1024, limit: 20 * 1024 * 1024 * 1024, unit: 'GB' },
        tierName: tier?.name || 'Free Plan',
        tierCategory: tier?.category || 'talent'
      };

      res.json(mockUsage);
    } catch (error) {
      console.error("Error fetching user usage:", error);
      res.status(500).json({ message: "Failed to fetch usage data" });
    }
  });

  // Initialize default pricing tiers
  app.post('/api/admin/init-default-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const defaultTiers = [
        {
          name: "Basic",
          price: 0,
          duration: 30,
          features: ["Basic Profile", "Limited Upload", "Basic Search"],
          active: true,
          maxPhotos: 5,
          maxVideos: 1,
          maxAudio: 2,
          maxStorageGB: 1,
          maxProjects: 1,
          maxApplications: 20,
          hasAnalytics: false,
          hasMessaging: true,
          hasAIFeatures: false,
          hasPrioritySupport: false,
          canCreateJobs: false,
          canViewProfiles: true,
          canExportData: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Professional",
          price: 29.99,
          duration: 30,
          features: ["Enhanced Profile", "Advanced Upload", "Advanced Search", "Priority Support"],
          active: true,
          maxPhotos: 25,
          maxVideos: 10,
          maxAudio: 15,
          maxStorageGB: 5,
          maxProjects: 5,
          maxApplications: 100,
          hasAnalytics: true,
          hasMessaging: true,
          hasAIFeatures: true,
          hasPrioritySupport: true,
          canCreateJobs: true,
          canViewProfiles: true,
          canExportData: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Enterprise",
          price: 99.99,
          duration: 30,
          features: ["Premium Profile", "Unlimited Upload", "Full Platform Access", "24/7 Support"],
          active: true,
          maxPhotos: 0, // Unlimited
          maxVideos: 0, // Unlimited
          maxAudio: 0, // Unlimited
          maxStorageGB: 0, // Unlimited
          maxProjects: 0, // Unlimited
          maxApplications: 0, // Unlimited
          hasAnalytics: true,
          hasMessaging: true,
          hasAIFeatures: true,
          hasPrioritySupport: true,
          canCreateJobs: true,
          canViewProfiles: true,
          canExportData: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Check if tiers already exist
      const existingTiers = await storage.getPricingTiers();
      if (existingTiers.length > 0) {
        return res.json({ 
          message: "Pricing tiers already exist", 
          count: existingTiers.length,
          tiers: existingTiers
        });
      }

      // Create the default tiers
      const createdTiers = [];
      for (const tierData of defaultTiers) {
        const tier = await storage.createPricingTier(tierData);
        createdTiers.push(tier);
      }

      res.json({
        message: "Default pricing tiers created successfully",
        count: createdTiers.length,
        tiers: createdTiers
      });
    } catch (error) {
      console.error("Error creating default pricing tiers:", error);
      res.status(500).json({ message: "Failed to create default pricing tiers" });
    }
  });

  app.put('/api/admin/profile-questions/:questionId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const question = await storage.updateProfileQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error("Error updating profile question:", error);
      res.status(500).json({ message: "Failed to update profile question" });
    }
  });

  app.delete('/api/admin/profile-questions/:questionId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      await storage.deleteProfileQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting profile question:", error);
      res.status(500).json({ message: "Failed to delete profile question" });
    }
  });

  // System Settings management
  app.get('/api/admin/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  // Test email configuration
  app.post('/api/admin/test-email', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: "Missing required fields: to, subject, message" });
      }

      const emailSent = await sendEmail({
        to,
        subject: subject || "Test Email from Talents & Stars",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test Email</h2>
            <p>${message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">This is a test email sent from the Talents & Stars admin panel.</p>
          </div>
        `,
        text: message
      });

      if (emailSent) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ success: false, message: "Failed to send test email", error: error.message });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating system setting:", req.body);
      const setting = await storage.createSystemSetting(req.body);
      res.json(setting);
    } catch (error) {
      console.error("Error creating system setting:", error);
      res.status(500).json({ message: "Failed to create system setting", error: error.message });
    }
  });

  app.put('/api/admin/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const updatedBy = req.user.id;
      const setting = await storage.updateSystemSetting(key, value, updatedBy);
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  app.delete('/api/admin/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const key = req.params.key;
      await storage.deleteSystemSetting(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting system setting:", error);
      res.status(500).json({ message: "Failed to delete system setting" });
    }
  });

  // Admin Logs
  app.get('/api/admin/logs', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAdminLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  app.post('/api/admin/logs', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const logData = { ...req.body, adminId, ipAddress: req.ip, userAgent: req.get('User-Agent') };
      const log = await storage.createAdminLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Error creating admin log:", error);
      res.status(500).json({ message: "Failed to create admin log" });
    }
  });

  // Analytics
  app.get('/api/admin/analytics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await storage.getAnalytics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/analytics/summary', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  app.post('/api/admin/analytics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.createAnalytics(req.body);
      res.json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(500).json({ message: "Failed to create analytics" });
    }
  });

  // Admin usage analytics endpoint
  app.get("/api/admin/usage-analytics", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { timeRange = '7d', userType = 'all' } = req.query;

      // Mock analytics data - in production, this would come from actual database queries
      const mockAnalytics = {
        totalUsers: 1247,
        activeUsers: 892,
        totalStorage: { current: 45.2 * 1024 * 1024 * 1024, limit: 1000 * 1024 * 1024 * 1024, unit: 'GB' },
        totalUploads: {
          photos: 12847,
          videos: 3921,
          audio: 1205,
          externalLinks: 2341
        },
        tierBreakdown: [
          { tierName: 'Free Plan', userCount: 892, storageUsed: 12.3 * 1024 * 1024 * 1024, percentage: 27.2 },
          { tierName: 'Basic Plan', userCount: 234, storageUsed: 18.7 * 1024 * 1024 * 1024, percentage: 41.4 },
          { tierName: 'Pro Plan', userCount: 98, storageUsed: 10.1 * 1024 * 1024 * 1024, percentage: 22.3 },
          { tierName: 'Enterprise', userCount: 23, storageUsed: 4.1 * 1024 * 1024 * 1024, percentage: 9.1 }
        ],
        topUsers: [
          { id: 1, username: 'john_actor', tierName: 'Pro Plan', storageUsed: 1.2 * 1024 * 1024 * 1024, uploadCount: 145, lastActive: '2 hours ago' },
          { id: 2, username: 'sarah_producer', tierName: 'Enterprise', storageUsed: 0.9 * 1024 * 1024 * 1024, uploadCount: 98, lastActive: '1 day ago' },
          { id: 3, username: 'mike_musician', tierName: 'Basic Plan', storageUsed: 0.7 * 1024 * 1024 * 1024, uploadCount: 87, lastActive: '3 hours ago' },
          { id: 4, username: 'lisa_model', tierName: 'Pro Plan', storageUsed: 0.6 * 1024 * 1024 * 1024, uploadCount: 73, lastActive: '5 minutes ago' },
          { id: 5, username: 'david_manager', tierName: 'Basic Plan', storageUsed: 0.5 * 1024 * 1024 * 1024, uploadCount: 62, lastActive: '1 hour ago' }
        ],
        usageByType: {
          talent: { users: 892, storage: 25.3 * 1024 * 1024 * 1024 },
          manager: { users: 234, storage: 12.1 * 1024 * 1024 * 1024 },
          producer: { users: 98, storage: 6.2 * 1024 * 1024 * 1024 },
          admin: { users: 23, storage: 1.6 * 1024 * 1024 * 1024 }
        },
        recentActivity: [
          { date: '2024-01-15', uploads: 287, newUsers: 12, storageUsed: 1.2 * 1024 * 1024 * 1024 },
          { date: '2024-01-14', uploads: 341, newUsers: 18, storageUsed: 1.5 * 1024 * 1024 * 1024 },
          { date: '2024-01-13', uploads: 192, newUsers: 8, storageUsed: 0.8 * 1024 * 1024 * 1024 },
          { date: '2024-01-12', uploads: 423, newUsers: 23, storageUsed: 1.9 * 1024 * 1024 * 1024 },
          { date: '2024-01-11', uploads: 156, newUsers: 5, storageUsed: 0.6 * 1024 * 1024 * 1024 }
        ]
      };

      res.json(mockAnalytics);
    } catch (error) {
      console.error("Error fetching admin usage analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Admin Job Management
  app.get('/api/admin/jobs', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/admin/jobs', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating job:", req.body);
      const job = await storage.createJob(req.body);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job", error: error.message });
    }
  });

  app.put('/api/admin/jobs/:jobId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Updating job:", req.params.jobId, req.body);
      const jobId = parseInt(req.params.jobId);
      const job = await storage.updateJob(jobId, req.body);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job", error: error.message });
    }
  });

  app.delete('/api/admin/jobs/:jobId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Deleting job:", req.params.jobId);
      const jobId = parseInt(req.params.jobId);
      await storage.deleteJob(jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job", error: error.message });
    }
  });

  // Admin - Settings Management
  app.get('/api/admin/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error('Get admin settings error:', error);
      res.status(500).json({ error: 'Failed to get admin settings' });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { key, value, description, encrypted } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      const setting = await storage.updateAdminSetting(key, value, req.user?.username || 'admin');
      res.json(setting);
    } catch (error) {
      console.error('Update admin setting error:', error);
      res.status(500).json({ error: 'Failed to update admin setting' });
    }
  });

  app.delete('/api/admin/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { key } = req.params;
      await storage.deleteAdminSetting(key);
      res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
      console.error('Delete admin setting error:', error);
      res.status(500).json({ error: 'Failed to delete admin setting' });
    }
  });

  // Calendar Events
  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getAvailabilityCalendar(req.user?.id);
      res.json(events);
    } catch (error) {
      console.error('Get calendar events error:', error);
      res.status(500).json({ error: 'Failed to get calendar events' });
    }
  });

  app.post('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const eventData = {
        ...req.body,
        userId: req.user?.id,
      };
      
      const event = await storage.createAvailabilityCalendar(eventData);
      res.json(event);
    } catch (error) {
      console.error('Create calendar event error:', error);
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  });

  app.put('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.updateAvailabilityCalendar(eventId, req.body);
      res.json(event);
    } catch (error) {
      console.error('Update calendar event error:', error);
      res.status(500).json({ error: 'Failed to update calendar event' });
    }
  });

  app.delete('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      await storage.deleteAvailabilityCalendar(eventId);
      res.json({ message: 'Calendar event deleted successfully' });
    } catch (error) {
      console.error('Delete calendar event error:', error);
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  });

  // Meeting Requests
  app.get('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const meetings = await storage.getMeetingRequests(req.user?.id);
      res.json(meetings);
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ error: 'Failed to get meetings' });
    }
  });

  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const meetingData = {
        ...req.body,
        fromUserId: req.user?.id,
        status: 'pending',
      };
      
      const meeting = await storage.createMeetingRequest(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({ error: 'Failed to create meeting request' });
    }
  });

  app.put('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      const meeting = await storage.updateMeetingRequest(meetingId, req.body);
      res.json(meeting);
    } catch (error) {
      console.error('Update meeting error:', error);
      res.status(500).json({ error: 'Failed to update meeting request' });
    }
  });

  app.delete('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      await storage.deleteMeetingRequest(meetingId);
      res.json({ message: 'Meeting request deleted successfully' });
    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ error: 'Failed to delete meeting request' });
    }
  });

  // Job History routes
  app.post('/api/job-history', isAuthenticated, async (req: any, res) => {
    try {
      const jobHistoryData = {
        ...req.body,
        userId: req.user?.id,
      };
      
      const jobHistory = await storage.createJobHistory(jobHistoryData);
      res.json(jobHistory);
    } catch (error) {
      console.error('Create job history error:', error);
      res.status(500).json({ error: 'Failed to create job history' });
    }
  });

  app.get('/api/job-history/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const jobHistory = await storage.getJobHistory(userId);
      res.json(jobHistory);
    } catch (error) {
      console.error('Get job history error:', error);
      res.status(500).json({ error: 'Failed to get job history' });
    }
  });

  // Admin - Permissions Management
  app.get("/api/admin/permissions/roles", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const roles = ["talent", "manager", "producer", "admin"];
      const allRolePermissions = {};
      
      for (const role of roles) {
        const permissions = await storage.getRolePermissions(role);
        allRolePermissions[role] = permissions;
      }
      
      res.json(allRolePermissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ error: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/admin/permissions/roles", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { role, category, action, resource, granted } = req.body;
      
      if (!role || !category || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const permission = await storage.createRolePermission({
        role,
        category,
        action,
        resource,
        granted: granted !== false
      });
      
      res.json(permission);
    } catch (error) {
      console.error("Error creating role permission:", error);
      res.status(500).json({ error: "Failed to create role permission" });
    }
  });

  app.get("/api/admin/permissions/users/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userPermissions = await storage.getUserPermissions(userId);
      const rolePermissions = await storage.getRolePermissions(user.role);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        },
        userPermissions,
        rolePermissions
      });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ error: "Failed to fetch user permissions" });
    }
  });

  app.post("/api/admin/permissions/users/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { category, action, resource, granted, expiresAt, conditions } = req.body;
      
      if (!category || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const permission = await storage.createUserPermission({
        userId,
        category,
        action,
        resource,
        granted: granted !== false,
        grantedBy: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        conditions
      });
      
      res.json(permission);
    } catch (error) {
      console.error("Error creating user permission:", error);
      res.status(500).json({ error: "Failed to create user permission" });
    }
  });

  app.delete("/api/admin/permissions/users/:permissionId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { permissionId } = req.params;
      await storage.deleteUserPermission(parseInt(permissionId));
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting user permission:", error);
      res.status(500).json({ error: "Failed to delete user permission" });
    }
  });

  app.get("/api/admin/permissions/categories", isAuthenticated, isAdmin, (req: any, res) => {
    const categories = [
      "user_management",
      "profile_management", 
      "media_management",
      "job_management",
      "application_management",
      "messaging",
      "analytics",
      "system_settings",
      "content_moderation",
      "billing_payments",
      "verification",
      "notifications",
      "calendar_scheduling",
      "ai_features",
      "reports"
    ];
    
    const actions = [
      "create",
      "read", 
      "update",
      "delete",
      "approve",
      "reject",
      "publish",
      "unpublish",
      "verify",
      "unverify",
      "export",
      "import",
      "moderate",
      "assign",
      "unassign"
    ];
    
    res.json({ categories, actions });
  });

  // Talent-Manager routes
  app.post('/api/talent-manager', isAuthenticated, async (req: any, res) => {
    try {
      const managerId = req.user.id;
      const { talentId } = req.body;
      const relation = await storage.createTalentManagerRelation(talentId, managerId);
      res.json(relation);
    } catch (error) {
      console.error("Error creating talent-manager relation:", error);
      res.status(500).json({ message: "Failed to create talent-manager relation" });
    }
  });

  app.get('/api/manager/talents', isAuthenticated, async (req: any, res) => {
    try {
      const managerId = req.user.id;
      const talents = await storage.getTalentsByManager(managerId);
      res.json(talents);
    } catch (error) {
      console.error("Error fetching manager talents:", error);
      res.status(500).json({ message: "Failed to fetch manager talents" });
    }
  });

  // Availability Calendar routes
  app.get('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const availability = await storage.getUserAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const availability = await storage.createAvailabilityEntry({
        ...req.body,
        userId
      });
      res.json(availability);
    } catch (error) {
      console.error("Error creating availability:", error);
      res.status(500).json({ message: "Failed to create availability" });
    }
  });

  app.put('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const availability = await storage.updateAvailabilityEntry(id, req.body);
      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAvailabilityEntry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // AI Profile Enhancement route
  app.post('/api/profile/ai-enhance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let profile = await storage.getUserProfile(userId);
      
      // If profile doesn't exist, create a basic one first
      if (!profile) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        profile = await storage.createUserProfile({
          userId,
          displayName: user.firstName || "User",
          bio: "",
          location: "",
          role: "talent",
          talentType: "actor",
          languages: [],
          accents: [],
          instruments: [],
          genres: [],
          availabilityStatus: "available",
          dailyRate: null,
          weeklyRate: null,
          projectRate: null,
          skills: [],
          experience: "",
          education: "",
          socialLinks: {},
          verified: false,
          isPublic: true,
          resume: null,
          credits: null,
          representations: null,
        });
      }
      
      const enhancedProfile = await storage.enhanceProfileWithAI(userId, profile);
      res.json(enhancedProfile);
    } catch (error) {
      console.error("Error enhancing profile:", error);
      res.status(500).json({ message: "Failed to enhance profile" });
    }
  });

  // Skill Endorsement routes
  app.post('/api/skill-endorsements', isAuthenticated, async (req: any, res) => {
    try {
      const endorserId = req.user.id;
      const { endorsedUserId, skill, message } = req.body;
      
      // Validate input
      const validatedData = insertSkillEndorsementSchema.parse({
        endorserId,
        endorsedUserId,
        skill,
        message
      });
      
      // Check if user has already endorsed this skill
      const hasEndorsed = await storage.hasUserEndorsedSkill(endorserId, endorsedUserId, skill);
      if (hasEndorsed) {
        return res.status(400).json({ message: "You have already endorsed this skill" });
      }
      
      const endorsement = await storage.createSkillEndorsement(validatedData);
      res.json(endorsement);
    } catch (error) {
      console.error("Error creating skill endorsement:", error);
      res.status(500).json({ message: "Failed to create skill endorsement" });
    }
  });
  
  app.get('/api/skill-endorsements/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const endorsements = await storage.getSkillEndorsements(userId);
      res.json(endorsements);
    } catch (error) {
      console.error("Error fetching skill endorsements:", error);
      res.status(500).json({ message: "Failed to fetch skill endorsements" });
    }
  });
  
  app.get('/api/skill-endorsements/:userId/:skill', async (req, res) => {
    try {
      const { userId, skill } = req.params;
      const endorsements = await storage.getSkillEndorsementsBySkill(userId, skill);
      res.json(endorsements);
    } catch (error) {
      console.error("Error fetching skill endorsements:", error);
      res.status(500).json({ message: "Failed to fetch skill endorsements" });
    }
  });
  
  app.delete('/api/skill-endorsements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSkillEndorsement(Number(id));
      res.json({ message: "Skill endorsement deleted successfully" });
    } catch (error) {
      console.error("Error deleting skill endorsement:", error);
      res.status(500).json({ message: "Failed to delete skill endorsement" });
    }
  });

  // Stripe payment processing endpoints
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, tierId, isAnnual, description } = req.body;
      const userId = req.user.id;
      
      // Get tier information
      const tiers = await storage.getPricingTiers();
      const tier = tiers.find(t => t.id === tierId);
      
      if (!tier) {
        return res.status(400).json({ message: "Invalid tier ID" });
      }
      
      // Calculate the actual amount based on tier pricing
      const actualAmount = isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(actualAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          tierId: tierId.toString(),
          isAnnual: isAnnual.toString(),
          tierName: tier.name,
        },
        description: description || `${tier.name} Plan - ${req.user.firstName} ${req.user.lastName}`,
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: actualAmount,
        tierId,
        isAnnual,
        description: paymentIntent.description
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Confirm payment and update user tier
  app.post('/api/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.id;
      
      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Check if payment was successful
      if (paymentIntent.status === 'succeeded') {
        const tierId = parseInt(paymentIntent.metadata.tierId);
        
        // Update user's selected tier
        const updatedUser = await storage.updateUserTier(userId, tierId);
        
        res.json({ 
          success: true, 
          user: updatedUser,
          message: "Payment successful and tier updated"
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Payment not completed" 
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Direct tier selection for free plans
  app.post('/api/user/select-tier', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { tierId } = req.body;
      
      // Get tier information
      const tiers = await storage.getPricingTiers();
      const tier = tiers.find(t => t.id === tierId);
      
      if (!tier) {
        return res.status(400).json({ message: "Invalid tier ID" });
      }
      
      // Check if it's a free tier
      if (parseFloat(tier.price) === 0) {
        // For free tiers, directly update the user
        const updatedUser = await storage.updateUserTier(userId, tierId);
        res.json(updatedUser);
      } else {
        // For paid tiers, require payment processing
        res.status(400).json({ 
          message: "This tier requires payment. Please use the payment flow.",
          requiresPayment: true
        });
      }
    } catch (error) {
      console.error("Error selecting tier:", error);
      res.status(500).json({ message: "Failed to select tier" });
    }
  });

  const httpServer = createServer(app);

  // Subscription Management API endpoints
  app.post('/api/admin/subscription/trigger-tasks', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log('Admin manually triggering subscription management tasks');
      await subscriptionManager.runDailyTasks();
      res.json({ message: 'Subscription management tasks completed successfully' });
    } catch (error) {
      console.error('Error running subscription management tasks:', error);
      res.status(500).json({ error: 'Failed to run subscription management tasks' });
    }
  });

  app.get('/api/admin/subscription/cron-status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const isActive = cronJobManager.isActive();
      res.json({ isActive });
    } catch (error) {
      console.error('Error checking cron status:', error);
      res.status(500).json({ error: 'Failed to check cron status' });
    }
  });

  app.post('/api/admin/subscription/start-cron', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      cronJobManager.start();
      res.json({ message: 'Cron job manager started successfully' });
    } catch (error) {
      console.error('Error starting cron job manager:', error);
      res.status(500).json({ error: 'Failed to start cron job manager' });
    }
  });

  app.post('/api/admin/subscription/stop-cron', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      cronJobManager.stop();
      res.json({ message: 'Cron job manager stopped successfully' });
    } catch (error) {
      console.error('Error stopping cron job manager:', error);
      res.status(500).json({ error: 'Failed to stop cron job manager' });
    }
  });

  // Start the subscription management cron job system
  cronJobManager.start();

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    // In a production app, you'd validate the user's session here
    let userId: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          clients.set(userId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  function broadcastMessage(message: any) {
    const receiverWs = clients.get(message.receiverId);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      receiverWs.send(JSON.stringify({
        type: 'message',
        data: message
      }));
    }
  }

  // Permission Management Test & Initialization Endpoints
  app.post('/api/admin/test-permissions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Test user permission creation
      const testUserId = "1";
      const testPermission = {
        userId: testUserId,
        category: "CONTENT",
        action: "CREATE",
        resource: "blog_posts",
        granted: true,
        grantedBy: req.user.id.toString(),
        conditions: { maxDailyPosts: 5 }
      };
      
      const permission = await storage.createUserPermission(testPermission);
      
      // Test permission check using the permissions module
      const context = {
        userId: testUserId,
        userRole: "talent",
        timestamp: new Date()
      };
      
      const hasPermissionResult = await storage.hasUserPermission(context.userId, {
        category: "CONTENT",
        action: "CREATE",
        resource: "blog_posts"
      });
      
      res.json({ 
        success: true, 
        permission, 
        hasPermission: hasPermissionResult,
        message: "Permission test completed successfully"
      });
    } catch (error) {
      console.error("Permission test failed:", error);
      res.status(500).json({ message: "Permission test failed", error: error.message });
    }
  });

  app.post('/api/admin/initialize-role-permissions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Initialize default role permissions
      const defaultRolePermissions = [
        // Admin permissions
        { role: "admin", category: "USER", action: "CREATE", resource: "all", granted: true },
        { role: "admin", category: "USER", action: "READ", resource: "all", granted: true },
        { role: "admin", category: "USER", action: "UPDATE", resource: "all", granted: true },
        { role: "admin", category: "USER", action: "DELETE", resource: "all", granted: true },
        { role: "admin", category: "ADMIN", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "CONTENT", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "JOBS", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "MEDIA", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "BILLING", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "SYSTEM", action: "ALL", resource: "all", granted: true },
        { role: "admin", category: "AI", action: "ALL", resource: "all", granted: true },
        
        // Producer permissions
        { role: "producer", category: "USER", action: "READ", resource: "talents", granted: true },
        { role: "producer", category: "JOBS", action: "CREATE", resource: "all", granted: true },
        { role: "producer", category: "JOBS", action: "UPDATE", resource: "own", granted: true },
        { role: "producer", category: "JOBS", action: "DELETE", resource: "own", granted: true },
        { role: "producer", category: "CONTENT", action: "CREATE", resource: "job_posts", granted: true },
        { role: "producer", category: "MEDIA", action: "UPLOAD", resource: "job_media", granted: true },
        { role: "producer", category: "AI", action: "USE", resource: "job_matching", granted: true },
        
        // Manager permissions
        { role: "manager", category: "USER", action: "READ", resource: "talents", granted: true },
        { role: "manager", category: "USER", action: "UPDATE", resource: "managed_talents", granted: true },
        { role: "manager", category: "JOBS", action: "READ", resource: "all", granted: true },
        { role: "manager", category: "JOBS", action: "APPLY", resource: "for_talents", granted: true },
        { role: "manager", category: "CONTENT", action: "CREATE", resource: "talent_profiles", granted: true },
        { role: "manager", category: "MEDIA", action: "UPLOAD", resource: "talent_media", granted: true },
        { role: "manager", category: "AI", action: "USE", resource: "profile_optimization", granted: true },
        
        // Talent permissions
        { role: "talent", category: "USER", action: "READ", resource: "own", granted: true },
        { role: "talent", category: "USER", action: "UPDATE", resource: "own", granted: true },
        { role: "talent", category: "JOBS", action: "READ", resource: "all", granted: true },
        { role: "talent", category: "JOBS", action: "APPLY", resource: "all", granted: true },
        { role: "talent", category: "CONTENT", action: "CREATE", resource: "own_profile", granted: true },
        { role: "talent", category: "CONTENT", action: "UPDATE", resource: "own_profile", granted: true },
        { role: "talent", category: "MEDIA", action: "UPLOAD", resource: "own_media", granted: true },
        { role: "talent", category: "AI", action: "USE", resource: "basic_features", granted: true },
      ];
      
      // Create role permissions
      const createdPermissions = [];
      for (const permission of defaultRolePermissions) {
        try {
          const created = await storage.createRolePermission(permission);
          createdPermissions.push(created);
        } catch (error) {
          console.log(`Permission ${permission.role}-${permission.category}-${permission.action} may already exist`);
        }
      }
      
      res.json({ 
        success: true, 
        created: createdPermissions.length,
        total: defaultRolePermissions.length,
        message: `Initialized ${createdPermissions.length} role permissions` 
      });
    } catch (error) {
      console.error("Role permission initialization failed:", error);
      res.status(500).json({ message: "Role permission initialization failed", error: error.message });
    }
  });

  // Social Media Routes
  app.post('/api/social/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertSocialPostSchema.parse({ 
        ...req.body, 
        userId: parseInt(userId)
      });
      
      const post = await storage.createSocialPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating social post:", error);
      res.status(500).json({ message: "Failed to create social post" });
    }
  });

  app.get('/api/social/feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.id);
      const filter = req.query.filter || 'all';
      
      const posts = await storage.getFeedPosts(userId, 20, 0);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      res.status(500).json({ message: "Failed to fetch social feed" });
    }
  });

  app.post('/api/social/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = parseInt(req.user.id);
      
      await storage.likeSocialPost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.get('/api/social/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.id);
      const userPosts = await storage.getUserSocialPosts(userId);
      
      // Mock stats - in production, calculate from database
      const stats = {
        posts: userPosts.length,
        followers: 0,
        following: 0,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching social stats:", error);
      res.status(500).json({ message: "Failed to fetch social stats" });
    }
  });

  app.get('/api/social/trending', isAuthenticated, async (req: any, res) => {
    try {
      // Mock trending data - in production, calculate from database
      const trending = [
        { tag: "casting", count: 24, trend: "up" },
        { tag: "audition", count: 18, trend: "up" },
        { tag: "filming", count: 12, trend: "down" },
        { tag: "premiere", count: 8, trend: "up" },
      ];
      
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending:", error);
      res.status(500).json({ message: "Failed to fetch trending" });
    }
  });

  // Job History Routes
  app.post('/api/job-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.id);
      const validatedData = insertJobHistorySchema.parse({ 
        ...req.body, 
        userId
      });
      
      const jobHistory = await storage.createJobHistory(validatedData);
      res.json(jobHistory);
    } catch (error) {
      console.error("Error creating job history:", error);
      res.status(500).json({ message: "Failed to create job history" });
    }
  });

  app.get('/api/job-history/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobHistory = await storage.getJobHistory(userId);
      res.json(jobHistory);
    } catch (error) {
      console.error("Error fetching job history:", error);
      res.status(500).json({ message: "Failed to fetch job history" });
    }
  });

  app.put('/api/job-history/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJobHistorySchema.partial().parse(req.body);
      
      const jobHistory = await storage.updateJobHistory(id, validatedData);
      res.json(jobHistory);
    } catch (error) {
      console.error("Error updating job history:", error);
      res.status(500).json({ message: "Failed to update job history" });
    }
  });

  app.delete('/api/job-history/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobHistory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job history:", error);
      res.status(500).json({ message: "Failed to delete job history" });
    }
  });

  // ===== PAYMENT MANAGEMENT ROUTES =====
  
  // Payment Transactions Routes
  app.get('/api/admin/payments', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, status, userId } = req.query;
      const offset = (page - 1) * limit;
      
      let transactions = await storage.getPaymentTransactions(parseInt(limit), offset);
      
      // Filter by status if provided
      if (status && status !== 'all') {
        transactions = transactions.filter(t => t.status === status);
      }
      
      // Filter by user if provided
      if (userId) {
        transactions = transactions.filter(t => t.userId === parseInt(userId));
      }
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });

  app.get('/api/admin/payments/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getPaymentTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Payment transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching payment transaction:", error);
      res.status(500).json({ message: "Failed to fetch payment transaction" });
    }
  });

  app.post('/api/admin/payments/:id/refund', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { amount, reason, adminNotes } = req.body;
      const adminId = parseInt(req.user.id);
      
      // Get the original transaction
      const transaction = await storage.getPaymentTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Payment transaction not found" });
      }
      
      // Check if transaction can be refunded
      if (transaction.status !== 'succeeded') {
        return res.status(400).json({ message: "Transaction cannot be refunded" });
      }
      
      // Create refund in Stripe
      const refundAmount = amount || transaction.amount;
      const stripeRefund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId!,
        amount: Math.round(parseFloat(refundAmount.toString()) * 100), // Convert to cents
        reason: reason || 'requested_by_customer',
        metadata: {
          admin_id: adminId.toString(),
          transaction_id: transactionId.toString(),
        }
      });
      
      // Create refund record
      const refundRecord = await storage.createPaymentRefund({
        transactionId,
        stripeRefundId: stripeRefund.id,
        amount: refundAmount,
        reason: reason || 'requested_by_customer',
        status: stripeRefund.status,
        adminNotes: adminNotes || '',
        processedBy: adminId,
      });
      
      // Update transaction status
      const refundedAmount = parseFloat(transaction.refundedAmount.toString()) + parseFloat(refundAmount.toString());
      const newStatus = refundedAmount >= parseFloat(transaction.amount.toString()) ? 'refunded' : 'partially_refunded';
      
      await storage.updatePaymentTransaction(transactionId, {
        status: newStatus,
        refundedAmount: refundedAmount.toString(),
        refundReason: reason,
        refundedAt: new Date(),
        refundedBy: adminId,
      });
      
      res.json({ 
        success: true, 
        refund: refundRecord, 
        stripeRefund: stripeRefund 
      });
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: "Failed to process refund" });
    }
  });

  app.get('/api/admin/payments/:id/refunds', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const refunds = await storage.getPaymentRefunds(transactionId);
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  // Payment Analytics Routes
  app.get('/api/admin/payments/analytics/summary', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const summary = await storage.getPaymentAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching payment analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch payment analytics summary" });
    }
  });

  app.get('/api/admin/payments/analytics/revenue', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { period = 'daily' } = req.query;
      const revenue = await storage.getRevenueByPeriod(period as 'daily' | 'weekly' | 'monthly');
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // User Payment History Routes
  app.get('/api/user/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.id);
      const transactions = await storage.getUserPaymentTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({ message: "Failed to fetch user payments" });
    }
  });

  // Payment Webhook for Stripe
  app.post('/api/webhook/stripe', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send('Webhook signature verification failed');
      }
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          
          // Update payment transaction
          const transaction = await storage.getPaymentTransactionByStripeId(paymentIntent.id);
          if (transaction) {
            await storage.updatePaymentTransaction(transaction.id, {
              status: 'succeeded',
              stripeChargeId: paymentIntent.latest_charge as string,
              receiptUrl: paymentIntent.receipt_url,
              metadata: paymentIntent.metadata as any,
            });
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          
          // Update payment transaction
          const failedTransaction = await storage.getPaymentTransactionByStripeId(failedPayment.id);
          if (failedTransaction) {
            await storage.updatePaymentTransaction(failedTransaction.id, {
              status: 'failed',
              metadata: failedPayment.metadata as any,
            });
          }
          break;
          
        case 'charge.dispute.created':
          const dispute = event.data.object;
          
          // Handle dispute - could create a dispute record
          console.log('Dispute created:', dispute);
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Enhanced Stripe Payment Routes
  app.post('/api/payments/record-transaction', isAuthenticated, async (req: any, res) => {
    try {
      const { stripePaymentIntentId, tierId, amount, isAnnual } = req.body;
      const userId = parseInt(req.user.id);
      
      const transaction = await storage.createPaymentTransaction({
        userId,
        stripePaymentIntentId,
        amount: amount.toString(),
        currency: 'usd',
        status: 'pending',
        tierId: tierId || null,
        isAnnual: isAnnual || false,
        description: `Payment for ${isAnnual ? 'annual' : 'monthly'} subscription`,
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Error recording payment transaction:", error);
      res.status(500).json({ message: "Failed to record payment transaction" });
    }
  });

  // Debug logging endpoints
  app.get('/api/debug/logs', isAuthenticated, (req: any, res) => {
    const { count = 100, level, category } = req.query;
    const logs = logger.getRecentLogs(parseInt(count), level, category);
    res.json({ logs, totalCount: logs.length });
  });

  app.get('/api/debug/logs/media', isAuthenticated, (req: any, res) => {
    const logs = logger.getRecentLogs(200, undefined, 'MEDIA_UPLOAD');
    res.json({ logs: logs.slice(-50), totalCount: logs.length });
  });

  app.get('/api/debug/logs/auth', isAuthenticated, (req: any, res) => {
    const logs = logger.getRecentLogs(200, undefined, 'AUTH');
    res.json({ logs: logs.slice(-50), totalCount: logs.length });
  });

  app.delete('/api/debug/logs', isAuthenticated, (req: any, res) => {
    logger.clearLogs();
    res.json({ message: 'Logs cleared successfully' });
  });

  // Profile Sharing API
  app.get('/api/profile/sharing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const settings = await simpleStorage.getProfileSharingSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile sharing settings' });
    }
  });

  app.put('/api/profile/sharing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const settings = await simpleStorage.updateProfileSharingSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile sharing settings' });
    }
  });

  app.put('/api/profile/sharing/custom-url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { customUrl } = req.body;

      if (!customUrl) {
        return res.status(400).json({ error: 'Custom URL is required' });
      }

      // Validate URL format (alphanumeric, hyphens, underscores)
      const urlPattern = /^[a-zA-Z0-9-_]+$/;
      if (!urlPattern.test(customUrl)) {
        return res.status(400).json({ error: 'Custom URL can only contain letters, numbers, hyphens, and underscores' });
      }

      // Check if URL is available
      const isAvailable = await simpleStorage.checkCustomUrlAvailable(customUrl, userId);
      if (!isAvailable) {
        return res.status(409).json({ error: 'This custom URL is already taken' });
      }

      const settings = await simpleStorage.updateProfileSharingSettings(userId, { customUrl });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update custom URL' });
    }
  });

  // Public profile view endpoint
  app.get('/api/profile/:identifier', async (req: any, res) => {
    try {
      const { identifier } = req.params;
      let userId: number;
      let profileData: any;

      // Check if identifier is a custom URL
      if (isNaN(Number(identifier))) {
        const customProfile = await simpleStorage.getProfileByCustomUrl(identifier);
        if (!customProfile) {
          return res.status(404).json({ error: 'Profile not found' });
        }
        userId = customProfile.userId;
        profileData = customProfile;
      } else {
        userId = Number(identifier);
        profileData = await simpleStorage.getProfileSharingSettings(userId);
      }

      // Check if profile is public
      if (!profileData.isPublic) {
        return res.status(403).json({ error: 'This profile is private' });
      }

      // Get user and profile data
      const user = await simpleStorage.getUser(userId);
      const profile = await simpleStorage.getUserProfile(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Increment profile views
      await simpleStorage.incrementProfileViews(userId);

      // Build response based on sharing settings
      const response: any = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        bio: profile?.bio,
        location: profile?.location,
        displayName: profile?.displayName,
        isVerified: profile?.isVerified || false,
        profileViews: profileData.profileViews + 1,
        customUrl: profileData.customUrl
      };

      // Add optional fields based on sharing settings
      if (profileData.showContactInfo) {
        response.email = user.email;
        response.phoneNumber = profile?.phoneNumber;
      }

      if (profileData.showSocialLinks) {
        response.website = profile?.website;
        response.socialLinks = profile?.socialLinks;
      }

      if (profileData.showMediaGallery) {
        const mediaFiles = await simpleStorage.getUserMediaFiles(userId);
        response.mediaFiles = mediaFiles;
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // ===== TALENT SEEDING ENDPOINTS =====
  
  // Talent seeding endpoint (admin only)
  app.post('/api/admin/seed-talents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { seedTalentDatabase } = await import('./seed-talents');
      const result = await seedTalentDatabase();
      res.json(result);
    } catch (error) {
      console.error('Error seeding talents:', error);
      res.status(500).json({ error: 'Failed to seed talents', details: error.message });
    }
  });

  // Get featured talents for landing page
  app.get('/api/featured-talents', async (req, res) => {
    try {
      // Get all users with profiles marked as featured
      const featuredUsers = await storage.getUsersWithProfiles({ featured: true });
      
      // Transform to match frontend expectations
      const featuredTalents = featuredUsers.map(user => ({
        id: user.id,
        name: user.profile?.displayName || `${user.firstName} ${user.lastName}`,
        type: user.profile?.talentType || user.role,
        location: user.profile?.location || 'Location not specified',
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews: Math.floor(Math.random() * 200) + 50, // Random reviews 50-250
        image: user.profileImageUrl || 'https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        verified: user.profile?.isVerified || false,
        available: user.profile?.isAvailable !== false,
        specialty: user.profile?.specialties?.[0] || user.profile?.bio?.substring(0, 50) || 'Professional talent',
        role: user.role
      }));
      
      res.json(featuredTalents);
    } catch (error) {
      console.error('Error fetching featured talents:', error);
      
      // Fallback to sample data if database fails
      const fallbackTalents = [
        {
          id: 1,
          name: "Sarah Chen",
          type: "actor",
          location: "Los Angeles, CA",
          rating: 4.9,
          reviews: 127,
          image: "https://images.unsplash.com/photo-1494790108755-2616b86e2390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: true,
          specialty: "Broadway & Film Actor",
          role: "talent"
        },
        {
          id: 2,
          name: "Marcus Rodriguez",
          type: "musician",
          location: "Nashville, TN",
          rating: 4.8,
          reviews: 89,
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: false,
          specialty: "Singer-Songwriter",
          role: "talent"
        },
        {
          id: 3,
          name: "Elena Volkov",
          type: "model",
          location: "New York, NY",
          rating: 5.0,
          reviews: 156,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: true,
          specialty: "Fashion & Editorial Model",
          role: "talent"
        },
        {
          id: 4,
          name: "David Kim",
          type: "voice_artist",
          location: "Chicago, IL",
          rating: 4.9,
          reviews: 73,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: true,
          specialty: "Animation & Gaming Voice",
          role: "talent"
        },
        {
          id: 5,
          name: "John Producer",
          type: "producer",
          location: "Hollywood, CA",
          rating: 4.7,
          reviews: 92,
          image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: true,
          specialty: "Independent Film Producer",
          role: "producer"
        },
        {
          id: 6,
          name: "Mike Manager",
          type: "manager",
          location: "Beverly Hills, CA",
          rating: 4.6,
          reviews: 64,
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          verified: true,
          available: false,
          specialty: "A-List Talent Management",
          role: "manager"
        }
      ];
      
      res.json(fallbackTalents);
    }
  });

  // ===== AI TRANSLATION ENDPOINT =====
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
      
      console.log('=== TRANSLATION REQUEST ===');
      console.log('Text:', text);
      console.log('Target Language:', targetLanguage);
      console.log('Source Language:', sourceLanguage);
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and target language are required' });
      }

      if (targetLanguage === sourceLanguage) {
        console.log('Same language - returning original text');
        return res.json({ translatedText: text });
      }

      // Import OpenAI module
      const { default: OpenAI } = await import('openai');
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      console.log('Calling OpenAI for translation...');
      
      // Use OpenAI for translation
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone, context, and formatting. Only return the translated text, no explanations.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const translatedText = response.choices[0].message.content?.trim() || text;

      console.log('=== TRANSLATION COMPLETE ===');
      console.log('Original:', text);
      console.log('Translated:', translatedText);
      console.log('Language:', targetLanguage);
      
      res.json({ translatedText });
    } catch (error) {
      console.error('=== TRANSLATION ERROR ===');
      console.error('Error:', error);
      console.error('Message:', error.message);
      res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  });

  return httpServer;
}
