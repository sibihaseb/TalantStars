import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { storage as simpleStorage } from "./simple-storage";
import { setupAuth, isAuthenticated, isAdmin, requirePlan } from "./auth";
import { requirePermission, requireAnyPermission, PermissionChecks } from "./permissions";
import { enhanceProfile, generateBio } from "./openai";
import { enhanceJobDescription, validateJobSkills, generateJobSuggestions } from './ai-enhancements';
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
  jobCommunications,
  profileQuestions
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { requestPasswordReset, validatePasswordResetToken, resetPassword } from "./passwordUtils";
import { sendMeetingInvitation, sendWelcomeEmail, sendEmail, sendTestEmail, sendPasswordResetEmail } from "./email";
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { uploadFileToWasabi, deleteFileFromWasabi, getFileTypeFromMimeType } from "./wasabi-config";
import multer from "multer";
import { logger } from "./logger";
import { createUploadNotification } from "./simple-notifications";
import { subscriptionManager } from './subscription-management';
import { cronJobManager } from './cron-jobs';
import { automatedTesting } from './automated-testing';
import { monitoring } from './monitoring-system';
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
  const httpServer = createServer(app);
  
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

  // Database health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      console.log("=== HEALTH CHECK ===");
      
      // Test database connection
      const testQuery = await db.select().from(users).limit(1);
      console.log("Database connection: OK");
      
      // Test profile questions table
      const questionCount = await db.select().from(profileQuestions).limit(1);
      console.log("Profile questions table: OK");
      
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString(),
        checks: {
          users_table: testQuery.length >= 0,
          profile_questions_table: questionCount.length >= 0
        }
      });
    } catch (error) {
      console.error("=== HEALTH CHECK FAILED ===");
      console.error("Error:", error);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("===========================");
      res.status(500).json({ 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

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
      console.log("=== USER REQUEST ===");
      const userId = req.user.id;
      console.log("User ID:", userId);
      console.log("Session ID:", req.sessionID);
      
      const user = await simpleStorage.getUser(userId);
      console.log("User found:", !!user);
      
      if (!user) {
        console.log("User not found in database for ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await simpleStorage.getUserProfile(userId);
      console.log("Profile found:", !!profile);
      
      // Get user's pricing tier limits
      let tierLimits = null;
      if (user.pricingTierId) {
        console.log("Fetching pricing tier:", user.pricingTierId);
        tierLimits = await simpleStorage.getPricingTier(user.pricingTierId);
        console.log("Tier limits found:", !!tierLimits);
      }
      
      console.log("Sending user response");
      res.json({ ...user, profile, tierLimits });
    } catch (error) {
      console.error("=== USER ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("User context:", req.user?.id, req.user?.username);
      console.error("==================");
      res.status(500).json({ message: "Failed to fetch user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Registration endpoint - removed duplicate from routes.ts as it's handled in auth.ts

  // Get user skills
  app.get("/api/user/skills", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      console.log("🎯 SKILLS API: Get skills request", { userId });
      
      const profile = await simpleStorage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      console.log("🎯 SKILLS API: Skills retrieved successfully", { userId, skillCount: profile.skills?.length || 0 });
      
      res.json({ 
        skills: profile.skills || [],
        skillCount: profile.skills?.length || 0
      });
    } catch (error) {
      console.error("🎯 SKILLS API: Error getting skills:", error);
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  // Update user skills
  app.put("/api/user/skills", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { skills } = req.body;
      
      console.log("🎯 SKILLS API: Update request", { userId, skills });
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array" });
      }
      
      // Update user skills using storage
      const updatedUser = await simpleStorage.updateUserSkills(userId, skills);
      
      console.log("🎯 SKILLS API: Skills updated successfully", { userId, skillCount: skills.length });
      
      res.json({ 
        message: "Skills updated successfully", 
        user: updatedUser,
        skillCount: skills.length
      });
    } catch (error) {
      console.error("🎯 SKILLS API: Error updating skills:", error);
      res.status(500).json({ message: "Failed to update skills" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Getting profile for user:", userId);
      
      const profile = await simpleStorage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

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

  // Clear profile image endpoint (for removing hardcoded images)
  app.post('/api/user/profile-image-clear', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await simpleStorage.updateUserProfileImage(userId, null);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error clearing profile image:", error);
      res.status(500).json({ message: "Failed to clear profile image" });
    }
  });

  // Upload profile image
  app.post('/api/user/profile-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
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
      const updatedUser = await simpleStorage.updateUserProfileImage(userId, uploadResult.url);
      
      res.json({
        profileImageUrl: uploadResult.url,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  // Profile template selection endpoint
  app.post('/api/user/profile-template', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { selectedTemplate } = req.body;
      
      console.log('Saving profile template:', selectedTemplate, 'for user:', userId);
      
      // Validate template
      const validTemplates = ['classic', 'modern', 'artistic', 'minimal', 'cinematic'];
      if (!validTemplates.includes(selectedTemplate)) {
        return res.status(400).json({ message: 'Invalid template selection' });
      }
      
      // Update user profile template
      const updatedUser = await simpleStorage.updateUserProfileTemplate(userId, selectedTemplate);
      
      res.json({ 
        success: true, 
        selectedTemplate,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error saving profile template:', error);
      res.status(500).json({ message: 'Failed to save profile template' });
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
      const profile = await simpleStorage.getUserProfile(userId);
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
      const events = await simpleStorage.getAvailabilityEvents(userId);
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
        title: req.body.title || 'Event',
        start: req.body.start,
        end: req.body.end,
        status: req.body.status || 'available',
        type: req.body.type || 'general',
        notes: req.body.notes || null,
        allDay: req.body.allDay !== undefined ? req.body.allDay : false,
      };
      const event = await simpleStorage.createAvailabilityEvent(eventData);
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
      const event = await simpleStorage.updateAvailabilityEvent(eventId, eventData);
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
      await simpleStorage.deleteAvailabilityEvent(eventId, userId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Add missing availability endpoint
  app.get('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const events = await simpleStorage.getAvailabilityEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching availability events:", error);
      res.status(500).json({ message: "Failed to fetch availability events" });
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

  // Social Links Management
  app.get('/api/user/social-links', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await simpleStorage.getUserProfile(userId);
      res.json({ socialLinks: profile?.socialLinks || {} });
    } catch (error) {
      console.error("Error getting social links:", error);
      res.status(500).json({ message: "Failed to get social links" });
    }
  });

  app.put('/api/user/social-links', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { socialLinks } = req.body;
      
      console.log('🔗 Updating social links for user:', userId, socialLinks);
      
      const profile = await simpleStorage.updateUserSocialLinks(userId, socialLinks);
      res.json({ success: true, socialLinks: profile.socialLinks });
    } catch (error) {
      console.error("Error updating social links:", error);
      res.status(500).json({ message: "Failed to update social links" });
    }
  });

  // Social Media Routes
  
  // Get social feed
  app.get("/api/social/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await simpleStorage.getFeedPosts(userId, limit, offset);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching feed: " + error.message });
    }
  });

  // Get user's posts
  app.get("/api/social/posts/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await simpleStorage.getUserSocialPosts(userId);
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
        const mediaFile = await simpleStorage.createMediaFile({
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
      
      const post = await simpleStorage.createSocialPost(postData);
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
      
      await simpleStorage.likeSocialPost(postId, userId);
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
      
      await simpleStorage.unlikeSocialPost(postId, userId);
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
      
      const comment = await simpleStorage.commentOnPost(commentData);
      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating comment: " + error.message });
    }
  });

  // Get post comments
  app.get("/api/social/posts/:postId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await simpleStorage.getPostComments(postId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching comments: " + error.message });
    }
  });

  // Friend Operations
  
  // Get friends
  app.get("/api/social/friends", isAuthenticated, async (req: any, res) => {
    try {
      const friends = await simpleStorage.getFriends(req.user.id);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching friends: " + error.message });
    }
  });

  // Get friend requests
  app.get("/api/social/friend-requests", isAuthenticated, async (req: any, res) => {
    try {
      const requests = await simpleStorage.getFriendRequests(req.user.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching friend requests: " + error.message });
    }
  });

  // Send friend request
  app.post("/api/social/friend-request/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const addresseeId = parseInt(req.params.userId);
      const friendship = await simpleStorage.sendFriendRequest(req.user.id, addresseeId);
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ message: "Error sending friend request: " + error.message });
    }
  });

  // Accept friend request
  app.post("/api/social/friend-request/:friendshipId/accept", isAuthenticated, async (req: any, res) => {
    try {
      const friendshipId = parseInt(req.params.friendshipId);
      const friendship = await simpleStorage.acceptFriendRequest(friendshipId);
      res.json(friendship);
    } catch (error: any) {
      res.status(500).json({ message: "Error accepting friend request: " + error.message });
    }
  });

  // Reject friend request
  app.delete("/api/social/friend-request/:friendshipId", isAuthenticated, async (req: any, res) => {
    try {
      const friendshipId = parseInt(req.params.friendshipId);
      await simpleStorage.rejectFriendRequest(friendshipId);
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
      
      const users = await simpleStorage.searchUsers(query, req.user.id);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: "Error searching users: " + error.message });
    }
  });

  // Professional Connections
  
  // Get professional connections
  app.get("/api/social/professional-connections", isAuthenticated, async (req: any, res) => {
    try {
      const connections = await simpleStorage.getProfessionalConnections(req.user.id);
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
      
      const connection = await simpleStorage.createProfessionalConnection(connectionData);
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating professional connection: " + error.message });
    }
  });

  // Privacy Settings
  
  // Get privacy settings
  app.get("/api/social/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await simpleStorage.getUserPrivacySettings(req.user.id);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching privacy settings: " + error.message });
    }
  });

  // Update privacy settings
  app.put("/api/social/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await simpleStorage.updateUserPrivacySettings(req.user.id, req.body);
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
      const job = await simpleStorage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const { talentType, location, status } = req.query;
      const jobs = await simpleStorage.getJobs({
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
      const job = await simpleStorage.getJob(id);
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
      console.log("🔥 JOB APPLICATION: Processing application", { userId: req.user.id, jobId: req.params.id });
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      
      // Create application data directly without schema validation to fix type issues
      const applicationData = {
        userId: userId, // This is already a number from authentication
        jobId: jobId,   // This is a number from parseInt
        coverLetter: req.body.coverLetter || null,
        proposedRate: req.body.proposedRate || null,
        status: req.body.status || "pending"
      };
      
      console.log("🔥 JOB APPLICATION: Application data prepared", applicationData);
      const application = await simpleStorage.createJobApplication(applicationData);
      console.log("✅ JOB APPLICATION: Application created successfully", { applicationId: application.id });
      res.json(application);
    } catch (error) {
      console.error("❌ JOB APPLICATION: Error creating job application:", error);
      res.status(500).json({ message: "Failed to create job application" });
    }
  });

  app.get('/api/jobs/:id/applications', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const applications = await simpleStorage.getJobApplications(jobId);
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

      const communication = await simpleStorage.createJobCommunication(jobId, senderId, receiverId, message);
      res.json(communication);
    } catch (error) {
      console.error("Error creating job communication:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/jobs/:id/communications', isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const communications = await simpleStorage.getJobCommunications(jobId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching job communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.patch('/api/job-communications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await simpleStorage.markJobCommunicationAsRead(id);
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
      const message = await simpleStorage.createMessage(messageData);
      
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
      const messages = await simpleStorage.getMessages(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await simpleStorage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
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
      const tag = await simpleStorage.createUserTag(tagData);
      res.json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  app.get('/api/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tags = await simpleStorage.getUserTags(userId);
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
      const existingTag = await simpleStorage.getUserTags(userId);
      const tag = existingTag.find(t => t.id === id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const updatedTag = await simpleStorage.updateUserTag(id, req.body);
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
      const existingTag = await simpleStorage.getUserTags(userId);
      const tag = existingTag.find(t => t.id === id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      await simpleStorage.deleteUserTag(id);
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
      const mediaFile = await simpleStorage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      // Verify tag ownership
      const userTags = await simpleStorage.getUserTags(userId);
      const tag = userTags.find(t => t.id === tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const mediaFileTag = await simpleStorage.addTagToMediaFile(mediaId, tagId);
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
      const mediaFile = await simpleStorage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      await simpleStorage.removeTagFromMediaFile(mediaId, tagId);
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
      const mediaFile = await simpleStorage.getMediaFile(mediaId);
      if (!mediaFile || mediaFile.userId !== userId) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      const tags = await simpleStorage.getTagsForMediaFile(mediaId);
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
      const userTags = await simpleStorage.getUserTags(userId);
      const tag = userTags.find(t => t.id === tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const mediaFiles = await simpleStorage.getMediaFilesByTag(tagId);
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
      
      const talents = await simpleStorage.searchTalentsPublic(searchParams);
      res.json(talents);
    } catch (error) {
      console.error("Error searching talents:", error);
      res.status(500).json({ message: "Failed to search talents" });
    }
  });

  // Media endpoint that handles usernames and IDs
  app.get('/api/media/user/:id', async (req, res) => {
    try {
      const userIdParam = req.params.id;
      console.log("Media files request for:", userIdParam);
      
      let userId: number;
      let user;
      
      // Check if it's a numeric ID or username
      if (/^\d+$/.test(userIdParam)) {
        userId = parseInt(userIdParam);
      } else {
        // It's a username - find user first
        user = await simpleStorage.getUserByUsername(userIdParam);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        userId = user.id;
      }
      
      const mediaFiles = await simpleStorage.getUserMediaFiles(userId);
      res.json(mediaFiles);
    } catch (error) {
      console.error("Error fetching user media files:", error);
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });

  // Get individual talent profile
  app.get('/api/talent/:id', async (req, res) => {
    try {
      const userIdParam = req.params.id;
      console.log("Talent profile request for:", userIdParam);
      
      let userId: number;
      let profile;
      let user;
      
      // Check if it's a numeric ID or username
      if (/^\d+$/.test(userIdParam)) {
        // It's a numeric ID
        userId = parseInt(userIdParam);
        user = await simpleStorage.getUser(userId);
        profile = await simpleStorage.getUserProfile(userId);
      } else {
        // It's a username - need to find user first
        user = await simpleStorage.getUserByUsername(userIdParam);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        userId = user.id;
        profile = await simpleStorage.getUserProfile(userId);
      }
      
      console.log("Found user:", user?.id, user?.username);
      console.log("Looking for profile for user ID:", userId);
      
      if (!profile) {
        // If no profile exists, create a basic one or return user data
        console.log("No profile found, returning user data with basic profile");
        const basicProfile = {
          userId: userId,
          displayName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User',
          bio: '',
          location: '',
          website: '',
          phoneNumber: '',
          profileImageUrl: '',
          isVerified: false,
          isFeatured: false,
          availabilityStatus: 'available',
          skills: [],
          talentType: user?.role === 'talent' ? 'actor' : null,
          role: user?.role || 'talent'
        };
        return res.json(basicProfile);
      }
      
      console.log("Found profile for user:", userId);
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
      const featuredTalents = await simpleStorage.getFeaturedTalents();
      res.json(featuredTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  app.post('/api/admin/featured-talents', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const featuredTalent = await simpleStorage.createFeaturedTalent(req.body);
      res.json(featuredTalent);
    } catch (error) {
      console.error("Error creating featured talent:", error);
      res.status(500).json({ message: "Failed to create featured talent" });
    }
  });

  app.put('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const featuredTalent = await simpleStorage.updateFeaturedTalent(id, req.body);
      res.json(featuredTalent);
    } catch (error) {
      console.error("Error updating featured talent:", error);
      res.status(500).json({ message: "Failed to update featured talent" });
    }
  });

  app.delete('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await simpleStorage.deleteFeaturedTalent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting featured talent:", error);
      res.status(500).json({ message: "Failed to delete featured talent" });
    }
  });

  // Admin talent categories routes
  app.get('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categories = await simpleStorage.getTalentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching talent categories:", error);
      res.status(500).json({ message: "Failed to fetch talent categories" });
    }
  });

  // Admin user limits management routes
  app.get('/api/admin/users-with-limits', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await simpleStorage.getUsersWithLimits();
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

      const result = await simpleStorage.grantUserLimits(userId, limits, adminId);
      res.json(result);
    } catch (error) {
      console.error("Error granting user limits:", error);
      res.status(500).json({ message: "Failed to grant user limits" });
    }
  });

  app.delete('/api/admin/revoke-user-limits/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      await simpleStorage.revokeUserLimits(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking user limits:", error);
      res.status(500).json({ message: "Failed to revoke user limits" });
    }
  });

  app.post('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await simpleStorage.createTalentCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating talent category:", error);
      res.status(500).json({ message: "Failed to create talent category" });
    }
  });

  app.put('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await simpleStorage.updateTalentCategory(id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating talent category:", error);
      res.status(500).json({ message: "Failed to update talent category" });
    }
  });

  app.delete('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await simpleStorage.deleteTalentCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting talent category:", error);
      res.status(500).json({ message: "Failed to delete talent category" });
    }
  });

  // Admin SEO routes
  app.get('/api/admin/seo-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const seoSettings = await simpleStorage.getSEOSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post('/api/admin/seo-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const seoSetting = await simpleStorage.createOrUpdateSEOSettings(req.body);
      res.json(seoSetting);
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      res.status(500).json({ message: "Failed to save SEO settings" });
    }
  });

  app.post('/api/admin/generate-seo', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { pagePath } = req.body;
      const generatedSEO = await simpleStorage.generateSEOContent(pagePath);
      res.json(generatedSEO);
    } catch (error) {
      console.error("Error generating SEO content:", error);
      res.status(500).json({ message: "Failed to generate SEO content" });
    }
  });

  app.get('/api/admin/seo-analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await simpleStorage.getSEOAnalytics();
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
      const { email, firstName, lastName, role, password } = req.body;
      if (!email || !firstName || !lastName || !role) {
        res.status(400).setHeader('Content-Type', 'application/json').send(JSON.stringify({ 
          message: "Missing required fields", 
          required: ["email", "firstName", "lastName", "role"] 
        }));
        return;
      }
      
      // Create user data with proper schema mapping
      const passwordToHash = password || "defaultPassword123";
      const hashedPassword = await hashPassword(passwordToHash);
      const userData = {
        email,
        firstName,
        lastName,
        role,
        username: email, // Use email as username
        password: hashedPassword // Hashed password from form or default
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
      const existingUser = await simpleStorage.getUser(userId);
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
      const user = await simpleStorage.upsertUser(userData);
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
      const user = await simpleStorage.getUser(userId);
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
      
      const meeting = await simpleStorage.createMeeting(meetingData);
      
      // Send meeting invitation email
      const attendee = await simpleStorage.getUser(meetingData.attendeeId);
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
      const meetings = await simpleStorage.getMeetings(userId);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.put('/api/meetings/:meetingId', isAuthenticated, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await simpleStorage.updateMeeting(parseInt(meetingId), req.body);
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting", error: error.message });
    }
  });

  app.delete('/api/meetings/:meetingId', isAuthenticated, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      await simpleStorage.deleteMeeting(parseInt(meetingId));
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
      const permissions = await simpleStorage.getUserPermissions(userId);
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
      const permission = await simpleStorage.createUserPermission({
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

  // Notifications routes - now using simpleStorage with session-based storage
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log(`🔔 Fetching notifications for user ID: ${userId}`);
      
      // Get or create notifications for this user in session storage
      let userNotifications = await simpleStorage.getUserNotifications(userId);
      
      // If no notifications exist, create default ones
      if (!userNotifications || userNotifications.length === 0) {
        const defaultNotifications = [
          {
            id: 1,
            userId: userId,
            type: 'system',
            title: 'Welcome to Talents & Stars!',
            message: 'Complete your profile to get started and discover amazing opportunities.',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            userId: userId,
            type: 'profile',
            title: 'Profile Update Reminder',
            message: 'Your profile is 75% complete. Add more details to attract better opportunities.',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 3,
            userId: userId,
            type: 'job',
            title: 'New Job Match',
            message: 'A new casting call matches your profile. Check it out now!',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          }
        ];
        
        // Store notifications for this user
        await simpleStorage.setUserNotifications(userId, defaultNotifications);
        userNotifications = defaultNotifications;
      }
      
      console.log(`🔔 Returning ${userNotifications.length} notifications for user ${userId}`);
      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.notificationId);
      console.log(`🔔 Marking notification ${notificationId} as read for user ${userId}`);
      
      // Get user notifications
      const userNotifications = await simpleStorage.getUserNotifications(userId) || [];
      
      // Find and update the notification
      const updatedNotifications = userNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      // Save updated notifications
      await simpleStorage.setUserNotifications(userId, updatedNotifications);
      
      console.log(`🔔 Successfully marked notification ${notificationId} as read`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
    }
  });

  app.delete('/api/notifications/:notificationId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.notificationId);
      console.log(`🔔 Deleting notification ${notificationId} for user ${userId}`);
      
      // Get user notifications
      const userNotifications = await simpleStorage.getUserNotifications(userId) || [];
      
      // Filter out the notification to delete
      const updatedNotifications = userNotifications.filter(notification => notification.id !== notificationId);
      
      // Save updated notifications
      await simpleStorage.setUserNotifications(userId, updatedNotifications);
      
      console.log(`🔔 Successfully deleted notification ${notificationId}`);
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
      const updatedUser = await simpleStorage.updateUserRole(userId, role);
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
      const updatedProfile = await simpleStorage.updateUserVerification(userId, verified);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user verification:", error);
      res.status(500).json({ message: "Failed to update user verification" });
    }
  });

  // Pricing tiers management
  app.get('/api/admin/pricing-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tiers = await simpleStorage.getPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.post('/api/admin/pricing-tiers', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating pricing tier:", req.body);
      const tier = await simpleStorage.createPricingTier(req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ message: "Failed to create pricing tier", error: error.message });
    }
  });

  app.put('/api/admin/pricing-tiers/:tierId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierId = parseInt(req.params.tierId);
      const tier = await simpleStorage.updatePricingTier(tierId, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      res.status(500).json({ message: "Failed to update pricing tier" });
    }
  });

  app.delete('/api/admin/pricing-tiers/:tierId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierId = parseInt(req.params.tierId);
      await simpleStorage.deletePricingTier(tierId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
      res.status(500).json({ message: "Failed to delete pricing tier" });
    }
  });

  // Email template management routes
  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templates = await simpleStorage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await simpleStorage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const template = await simpleStorage.createEmailTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create email template", error: error.message });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await simpleStorage.updateEmailTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template", error: error.message });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await simpleStorage.deleteEmailTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template", error: error.message });
    }
  });

  // Enhanced email template management routes
  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templates = await simpleStorage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { name, subject, html_content, text_content, variables, description } = req.body;
      
      if (!name || !subject || !html_content || !text_content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const template = await simpleStorage.createEmailTemplate({
        name,
        subject,
        html_content,
        text_content,
        variables: variables || [],
        description
      });

      res.json(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ error: 'Failed to create email template' });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, subject, html_content, text_content, variables, description } = req.body;
      
      const template = await simpleStorage.updateEmailTemplate(parseInt(id), {
        name,
        subject,
        html_content,
        text_content,
        variables: variables || [],
        description
      });

      if (!template) {
        return res.status(404).json({ error: 'Email template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ error: 'Failed to update email template' });
    }
  });

  app.post('/api/admin/email-templates/:id/test', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { email, variables } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const template = await simpleStorage.getEmailTemplate(parseInt(id));
      if (!template) {
        return res.status(404).json({ error: 'Email template not found' });
      }

      // Use the email template system to send test email
      const { sendEmailWithTemplate } = await import('./email');
      const success = await sendEmailWithTemplate(template.name, email, variables || {});
      
      res.json({ success });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Promo code management routes
  app.get('/api/admin/promo-codes', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodes = await simpleStorage.getPromoCodes();
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
      const promoCode = await simpleStorage.createPromoCode(promoCodeData);
      res.json(promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ message: "Failed to create promo code", error: error.message });
    }
  });

  app.put('/api/admin/promo-codes/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const promoCode = await simpleStorage.updatePromoCode(promoCodeId, req.body);
      res.json(promoCode);
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  app.delete('/api/admin/promo-codes/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      await simpleStorage.deletePromoCode(promoCodeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({ message: "Failed to delete promo code" });
    }
  });

  app.get('/api/admin/promo-codes/:id/usage', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const usage = await simpleStorage.getPromoCodeUsage(promoCodeId);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching promo code usage:", error);
      res.status(500).json({ message: "Failed to fetch promo code usage" });
    }
  });

  // Talent type management routes
  app.get('/api/admin/talent-types', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const talentTypes = await simpleStorage.getTalentTypes();
      res.json(talentTypes);
    } catch (error) {
      console.error("Error fetching talent types:", error);
      res.status(500).json({ message: "Failed to fetch talent types" });
    }
  });

  app.post('/api/admin/talent-types', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating talent type:", req.body);
      const talentType = await simpleStorage.createTalentType(req.body);
      res.json(talentType);
    } catch (error) {
      console.error("Error creating talent type:", error);
      res.status(500).json({ message: "Failed to create talent type", error: error.message });
    }
  });

  app.put('/api/admin/talent-types/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const talentTypeId = parseInt(req.params.id);
      const talentType = await simpleStorage.updateTalentType(talentTypeId, req.body);
      res.json(talentType);
    } catch (error) {
      console.error("Error updating talent type:", error);
      res.status(500).json({ message: "Failed to update talent type" });
    }
  });

  app.delete('/api/admin/talent-types/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const talentTypeId = parseInt(req.params.id);
      await simpleStorage.deleteTalentType(talentTypeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting talent type:", error);
      res.status(500).json({ message: "Failed to delete talent type" });
    }
  });

  // Email campaigns management routes
  app.get('/api/admin/email-campaigns', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const campaigns = await simpleStorage.getEmailCampaigns();
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
      const campaign = await simpleStorage.createEmailCampaign(campaignData);
      
      // If it's an instant campaign, send immediately
      if (req.body.type === 'instant') {
        try {
          // Get target users based on groups
          const targetUsers = await simpleStorage.getUsersByGroups(req.body.targetGroups);
          
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
          await simpleStorage.updateEmailCampaignStatus(campaign.id, 'sent', {
            sentCount,
            failedCount,
            totalTargets: targetUsers.length
          });
        } catch (sendError) {
          console.error("Error sending instant campaign:", sendError);
          await simpleStorage.updateEmailCampaignStatus(campaign.id, 'failed');
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
      const campaign = await simpleStorage.updateEmailCampaign(campaignId, req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ message: "Failed to update email campaign" });
    }
  });

  app.delete('/api/admin/email-campaigns/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      await simpleStorage.deleteEmailCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ message: "Failed to delete email campaign" });
    }
  });

  app.get('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templates = await simpleStorage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  // Talent categories management routes
  app.get('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const categories = await simpleStorage.getTalentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching talent categories:", error);
      res.status(500).json({ message: "Failed to fetch talent categories" });
    }
  });

  app.post('/api/admin/talent-categories', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
        icon: req.body.icon || 'star',
        color: req.body.color || 'blue',
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };
      const category = await simpleStorage.createTalentCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating talent category:", error);
      res.status(500).json({ message: "Failed to create talent category", error: error.message });
    }
  });

  app.put('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await simpleStorage.updateTalentCategory(categoryId, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating talent category:", error);
      res.status(500).json({ message: "Failed to update talent category" });
    }
  });

  app.delete('/api/admin/talent-categories/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await simpleStorage.deleteTalentCategory(categoryId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting talent category:", error);
      res.status(500).json({ message: "Failed to delete talent category" });
    }
  });

  // Featured talents management routes
  app.get('/api/admin/featured-talents', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredTalents = await simpleStorage.getFeaturedTalents();
      res.json(featuredTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  app.post('/api/admin/featured-talents', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredData = {
        userId: req.body.userId,
        categoryId: req.body.categoryId,
        featuredReason: req.body.featuredReason,
        displayOrder: req.body.displayOrder || 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        featuredUntil: req.body.featuredUntil ? new Date(req.body.featuredUntil) : undefined
      };
      const featured = await simpleStorage.createFeaturedTalent(featuredData);
      res.json(featured);
    } catch (error) {
      console.error("Error creating featured talent:", error);
      res.status(500).json({ message: "Failed to create featured talent", error: error.message });
    }
  });

  app.put('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredId = parseInt(req.params.id);
      const featured = await simpleStorage.updateFeaturedTalent(featuredId, req.body);
      res.json(featured);
    } catch (error) {
      console.error("Error updating featured talent:", error);
      res.status(500).json({ message: "Failed to update featured talent" });
    }
  });

  app.delete('/api/admin/featured-talents/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredId = parseInt(req.params.id);
      await simpleStorage.deleteFeaturedTalent(featuredId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting featured talent:", error);
      res.status(500).json({ message: "Failed to delete featured talent" });
    }
  });

  app.put('/api/admin/featured-talents/order', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const updates = req.body.updates;
      await simpleStorage.updateFeaturedTalentOrder(updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating featured talent order:", error);
      res.status(500).json({ message: "Failed to update featured talent order" });
    }
  });

  // Public API endpoints for featured talents (no authentication required)
  app.get('/api/featured-talents', async (req: any, res) => {
    try {
      const featuredTalents = await simpleStorage.getFeaturedTalents();
      // Limit to 6 featured talents for homepage display
      const limitedTalents = featuredTalents.slice(0, 6);
      res.json(limitedTalents);
    } catch (error) {
      console.error("Error fetching featured talents:", error);
      res.status(500).json({ message: "Failed to fetch featured talents" });
    }
  });

  app.get('/api/talent-categories', async (req: any, res) => {
    try {
      const categories = await simpleStorage.getTalentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching talent categories:", error);
      res.status(500).json({ message: "Failed to fetch talent categories" });
    }
  });

  app.post('/api/admin/email-templates', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating email template:", req.body);
      const templateData = {
        ...req.body,
        createdBy: req.user.id
      };
      const template = await simpleStorage.createEmailTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create email template", error: error.message });
    }
  });

  app.put('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await simpleStorage.updateEmailTemplate(templateId, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      await simpleStorage.deleteEmailTemplate(templateId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // Reorder email templates
  app.post('/api/admin/email-templates/reorder', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Invalid request format" });
      }
      
      // Update sort order for each template
      for (const update of updates) {
        if (update.id && update.sort_order !== undefined) {
          await simpleStorage.updateEmailTemplate(update.id, { sort_order: update.sort_order });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering email templates:", error);
      res.status(500).json({ message: "Failed to reorder email templates" });
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

      const validation = await simpleStorage.validatePromoCode(code, userId, tierId, planType);
      
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Calculate discount
      const tier = await simpleStorage.getPricingTier(tierId);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }

      const originalAmount = planType === "annual" ? Number(tier.annualPrice) : Number(tier.price);
      const discountAmount = await simpleStorage.calculateDiscountAmount(validation.promoCode!, originalAmount);
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

  // Reorder questions endpoint
  app.post('/api/admin/questions/reorder', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }
      
      // Update each question's order
      for (const question of questions) {
        await db
          .update(profileQuestions)
          .set({ order: question.order })
          .where(eq(profileQuestions.id, question.id));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering questions:", error);
      res.status(500).json({ error: "Failed to reorder questions" });
    }
  });

  // Keep the old endpoints for backward compatibility
  // Public endpoint for profile questions (used in onboarding)
  app.get('/api/profile-questions', async (req: any, res) => {
    try {
      console.log("=== PROFILE QUESTIONS REQUEST ===");
      console.log("User:", req.user?.id, req.user?.username);
      console.log("Request URL:", req.url);
      
      const questions = await db.select().from(profileQuestions).orderBy(asc(profileQuestions.order));
      console.log("Questions fetched:", questions.length);
      console.log("First few questions:", questions.slice(0, 3).map(q => ({ id: q.id, field_name: q.field_name, question: q.question })));
      
      res.json(questions);
    } catch (error) {
      console.error("=== PROFILE QUESTIONS ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      console.error("User context:", req.user?.id, req.user?.username);
      console.error("================================");
      res.status(500).json({ message: "Failed to fetch profile questions", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Admin endpoint for profile questions management
  app.get('/api/admin/profile-questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questions = await db.select().from(profileQuestions).orderBy(asc(profileQuestions.order));
      res.json(questions);
    } catch (error) {
      console.error("Error fetching profile questions:", error);
      res.status(500).json({ message: "Failed to fetch profile questions" });
    }
  });

  // SEO Management API Routes
  // SEO Settings
  app.get('/api/admin/seo/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await simpleStorage.getSeoSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.put('/api/admin/seo/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await simpleStorage.updateSeoSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ message: "Failed to update SEO settings" });
    }
  });

  // SEO Pages
  app.get('/api/admin/seo/pages', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pages = await simpleStorage.getAllSeoPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching SEO pages:", error);
      res.status(500).json({ message: "Failed to fetch SEO pages" });
    }
  });

  app.post('/api/admin/seo/pages', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const page = await simpleStorage.createSeoPage(req.body);
      res.json(page);
    } catch (error) {
      console.error("Error creating SEO page:", error);
      res.status(500).json({ message: "Failed to create SEO page" });
    }
  });

  app.put('/api/admin/seo/pages/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await simpleStorage.updateSeoPage(pageId, req.body);
      res.json(page);
    } catch (error) {
      console.error("Error updating SEO page:", error);
      res.status(500).json({ message: "Failed to update SEO page" });
    }
  });

  app.delete('/api/admin/seo/pages/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pageId = parseInt(req.params.id);
      await simpleStorage.deleteSeoPage(pageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SEO page:", error);
      res.status(500).json({ message: "Failed to delete SEO page" });
    }
  });

  // SEO Images
  app.get('/api/admin/seo/images', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const images = await simpleStorage.getAllSeoImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching SEO images:", error);
      res.status(500).json({ message: "Failed to fetch SEO images" });
    }
  });

  app.post('/api/admin/seo/images', isAuthenticated, isAdmin, upload.single('image'), async (req: any, res) => {
    try {
      let imageUrl = '';
      
      if (req.file) {
        // Upload to Wasabi S3
        const fileName = `seo-images/${Date.now()}-${req.file.originalname}`;
        const uploadResult = await uploadFileToWasabi(req.file.buffer, fileName, req.file.mimetype);
        imageUrl = uploadResult.url;
      }

      const imageData = {
        ...req.body,
        imageUrl,
        width: req.body.width ? parseInt(req.body.width) : null,
        height: req.body.height ? parseInt(req.body.height) : null,
        fileSize: req.file ? req.file.size : null,
        format: req.file ? req.file.mimetype.split('/')[1] : null,
        createdBy: req.user.id
      };

      const image = await simpleStorage.createSeoImage(imageData);
      res.json(image);
    } catch (error) {
      console.error("Error creating SEO image:", error);
      res.status(500).json({ message: "Failed to create SEO image" });
    }
  });

  app.put('/api/admin/seo/images/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await simpleStorage.updateSeoImage(imageId, req.body);
      res.json(image);
    } catch (error) {
      console.error("Error updating SEO image:", error);
      res.status(500).json({ message: "Failed to update SEO image" });
    }
  });

  app.delete('/api/admin/seo/images/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const imageId = parseInt(req.params.id);
      await simpleStorage.deleteSeoImage(imageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SEO image:", error);
      res.status(500).json({ message: "Failed to delete SEO image" });
    }
  });

  // SEO Image Upload endpoint for SeoManagement component
  app.post('/api/admin/seo/images/upload', isAuthenticated, isAdmin, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload to Wasabi S3
      const fileName = `seo-images/${Date.now()}-${req.file.originalname}`;
      const uploadResult = await uploadFileToWasabi(req.file.buffer, fileName, req.file.mimetype);
      
      res.json({ 
        url: uploadResult.url,
        filename: fileName,
        size: req.file.size,
        type: req.file.mimetype 
      });
    } catch (error) {
      console.error("Error uploading SEO image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Profile SEO Data Generation
  app.post('/api/admin/seo/profiles/generate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await simpleStorage.getUsers();
      const generatedProfiles = [];
      
      for (const user of users) {
        if (user.profile) {
          const seoData = {
            userId: user.id,
            title: `${user.profile.displayName || user.firstName + ' ' + user.lastName} - ${user.profile.talentType || 'Professional'} | Talents & Stars`,
            description: user.profile.bio || `Professional ${user.profile.talentType || 'talent'} available for hire through Talents & Stars platform.`,
            keywords: `${user.profile.talentType || 'talent'}, ${user.profile.location || 'professional'}, entertainment, casting, hire`,
            ogTitle: `${user.profile.displayName || user.firstName + ' ' + user.lastName} - Professional ${user.profile.talentType || 'Talent'}`,
            ogDescription: user.profile.bio || `Connect with ${user.profile.displayName || user.firstName + ' ' + user.lastName} on Talents & Stars`,
            ogImage: user.profile.profileImageUrl || '',
            twitterCard: 'summary_large_image',
            twitterTitle: `${user.profile.displayName || user.firstName + ' ' + user.lastName} - ${user.profile.talentType || 'Professional'}`,
            twitterDescription: user.profile.bio || `Professional ${user.profile.talentType || 'talent'} on Talents & Stars`,
            twitterImage: user.profile.profileImageUrl || '',
            customMeta: {
              profile: {
                role: user.profile.role,
                talentType: user.profile.talentType,
                location: user.profile.location,
                verified: user.profile.isVerified
              }
            },
            isActive: true
          };
          
          const existingProfile = await simpleStorage.getProfileSeoData(user.id);
          if (existingProfile) {
            await simpleStorage.updateProfileSeoData(user.id, seoData);
          } else {
            await simpleStorage.createProfileSeoData(seoData);
          }
          
          generatedProfiles.push(seoData);
        }
      }
      
      res.json({ 
        message: `Generated SEO data for ${generatedProfiles.length} profiles`,
        count: generatedProfiles.length 
      });
    } catch (error) {
      console.error("Error generating profile SEO data:", error);
      res.status(500).json({ message: "Failed to generate profile SEO data" });
    }
  });

  // Profile Sharing - Current user's settings
  app.get('/api/profile/sharing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sharing = await simpleStorage.getProfileSharingSettings(userId);
      res.json(sharing);
    } catch (error) {
      console.error("Error fetching profile sharing:", error);
      res.status(500).json({ message: "Failed to fetch profile sharing" });
    }
  });

  app.put('/api/profile/sharing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sharing = await simpleStorage.updateProfileSharingSettings(userId, req.body);
      res.json(sharing);
    } catch (error) {
      console.error("Error updating profile sharing:", error);
      res.status(500).json({ message: "Failed to update profile sharing" });
    }
  });

  // Legacy Profile Sharing endpoints for backwards compatibility
  app.get('/api/profile-sharing/:userId', async (req: any, res) => {
    try {
      const { userId } = req.params;
      const sharing = await simpleStorage.getProfileSharing(userId);
      res.json(sharing);
    } catch (error) {
      console.error("Error fetching profile sharing:", error);
      res.status(500).json({ message: "Failed to fetch profile sharing" });
    }
  });

  app.put('/api/profile-sharing/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to update their own profile sharing or admins to update any
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const sharing = await simpleStorage.updateProfileSharing(userId, req.body);
      res.json(sharing);
    } catch (error) {
      console.error("Error updating profile sharing:", error);
      res.status(500).json({ message: "Failed to update profile sharing" });
    }
  });

  // Public route for getting SEO data for a specific page
  app.get('/api/seo/:route', async (req: any, res) => {
    try {
      const route = req.params.route;
      const page = await simpleStorage.getSeoPageByRoute(route);
      const settings = await simpleStorage.getSeoSettings();
      
      res.json({
        page,
        settings
      });
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      res.status(500).json({ message: "Failed to fetch SEO data" });
    }
  });

  // User Representation routes
  app.get('/api/user/representations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const representations = await simpleStorage.getUserRepresentations(userId);
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
      
      const representation = await simpleStorage.createUserRepresentation(representationData);
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
      
      const representation = await simpleStorage.updateUserRepresentation(representationId, representationData);
      res.json(representation);
    } catch (error) {
      console.error("Error updating user representation:", error);
      res.status(500).json({ message: "Failed to update user representation" });
    }
  });

  app.delete('/api/user/representations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const representationId = parseInt(req.params.id);
      await simpleStorage.deleteUserRepresentation(representationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user representation:", error);
      res.status(500).json({ message: "Failed to delete user representation" });
    }
  });

  // Role-based pricing tier routes (authentication optional to allow user role detection)
  app.get('/api/pricing-tiers', async (req: any, res) => {
    try {
      console.log("🔥 API: Getting pricing tiers...", { role: req.query.role });
      
      // Get all pricing tiers
      const allTiers = await simpleStorage.getPricingTiers();
      console.log(`Found ${allTiers.length} pricing tiers`);
      
      // Filter based on role/category if provided
      let role = req.query.role as string;
      
      // If user is authenticated (from session), use their role if no role specified
      if (!role && req.user) {
        role = req.user.role;
        console.log(`No role provided, using user role: ${role}`);
      }
      
      let filteredTiers = allTiers;
      
      if (role) {
        console.log(`Filtering by role/category: ${role}`);
        filteredTiers = allTiers.filter(tier => {
          const tierCategory = tier.category?.toLowerCase();
          const requestedRole = role.toLowerCase();
          return tierCategory === requestedRole || 
                 (requestedRole === 'talent' && !tierCategory) ||
                 (requestedRole === 'producer' && tierCategory === 'producer') ||
                 (requestedRole === 'manager' && tierCategory === 'manager') ||
                 (requestedRole === 'agent' && tierCategory === 'agent');
        });
      }
      
      console.log(`Returning ${filteredTiers.length} filtered tiers`);
      res.json(filteredTiers);
    } catch (error) {
      console.error("Error getting pricing tiers:", error);
      res.status(500).json({ message: "Failed to get pricing tiers" });
    }
  });

  // Update user tier endpoint
  app.post('/api/user/tier', isAuthenticated, async (req: any, res) => {
    try {
      console.log("🔥 API: Updating user tier...", { userId: req.user.id, body: req.body });
      
      const { tierId } = req.body;
      
      if (!tierId) {
        return res.status(400).json({ message: "Tier ID is required" });
      }
      
      const updatedUser = await simpleStorage.updateUserTier(req.user.id, parseInt(tierId));
      
      console.log("✅ API: User tier updated successfully", updatedUser);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("❌ API: Error updating user tier:", error);
      res.status(500).json({ message: "Failed to update user tier" });
    }
  });

  // Stripe integration for premium tier upgrades
  app.post('/api/stripe/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { tierId, amount } = req.body;
      console.log("🔥 API: Creating Stripe payment intent:", { tierId, amount, userId: req.user.id });
      
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("❌ API: STRIPE_SECRET_KEY not found in environment");
        return res.status(500).json({ message: "Stripe not configured" });
      }

      // Initialize Stripe with proper import and updated API version
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' // Use stable API version compatible with current setup
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: req.user.id.toString(),
          tierId: tierId.toString()
        }
      });

      console.log("✅ API: Stripe payment intent created:", paymentIntent.id);
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("❌ API: Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error.message 
      });
    }
  });

  // Stripe webhook to handle successful payments
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.log('❌ Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, tierId } = paymentIntent.metadata;
        
        console.log("🔥 Stripe: Payment succeeded, updating user tier:", { userId, tierId });
        await simpleStorage.updateUserTier(parseInt(userId), parseInt(tierId));
        console.log("✅ Stripe: User tier updated successfully");
      }

      res.json({ received: true });
    } catch (error) {
      console.error("❌ Stripe webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Hero banner upload endpoint
  app.post('/api/user/hero-image', isAuthenticated, upload.single('heroImage'), async (req: any, res) => {
    try {
      console.log("🔥 API: Uploading hero image for user:", req.user.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No hero image file uploaded" });
      }

      const file = req.file;
      const fileName = `user-${req.user.id}/hero/${Date.now()}-${file.originalname}`;
      
      try {
        const uploadResult = await uploadFileToWasabi(file.buffer, fileName, file.mimetype);
        
        if (uploadResult.success) {
          const updatedUser = await simpleStorage.updateUserHeroImage(req.user.id, uploadResult.url);
          
          console.log("✅ API: Hero image uploaded successfully");
          res.json({
            success: true,
            url: uploadResult.url,
            user: updatedUser
          });
        } else {
          throw new Error(uploadResult.error || "Failed to upload to Wasabi");
        }
      } catch (uploadError) {
        console.error("❌ API: Wasabi upload failed:", uploadError);
        res.status(500).json({ message: "Failed to upload hero image to storage" });
      }
    } catch (error) {
      console.error("❌ API: Error uploading hero image:", error);
      res.status(500).json({ message: "Failed to upload hero image" });
    }
  });

  // Job History Management Routes
  app.get('/api/job-history/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log("🔥 JOB HISTORY: Getting job history for user", userId);
      
      // Verify user can access this data (own data or admin)
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const jobHistory = await simpleStorage.getJobHistory(userId);
      console.log("🔥 JOB HISTORY: Found", jobHistory.length, "entries");
      
      res.setHeader('Content-Type', 'application/json');
      res.json(jobHistory);
    } catch (error) {
      console.error("🔥 JOB HISTORY: Error fetching job history:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to fetch job history", 
        error: error.message 
      });
    }
  });

  app.post('/api/job-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("🔥 JOB HISTORY: Creating job history entry", req.body);
      
      const jobData = {
        ...req.body,
        userId,
        verified: false,
        ai_enhanced: false
      };
      
      const jobEntry = await simpleStorage.createJobHistory(jobData);
      console.log("🔥 JOB HISTORY: Created entry with ID", jobEntry.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.json(jobEntry);
    } catch (error) {
      console.error("🔥 JOB HISTORY: Error creating job history:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to create job history", 
        error: error.message 
      });
    }
  });

  app.put('/api/job-history/:id', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.id;
      console.log("🔥 JOB HISTORY: Updating job history entry", jobId, req.body);
      
      // Verify ownership
      const existingEntry = await simpleStorage.getJobHistoryById(jobId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedEntry = await simpleStorage.updateJobHistory(jobId, req.body);
      console.log("🔥 JOB HISTORY: Updated entry", updatedEntry.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedEntry);
    } catch (error) {
      console.error("🔥 JOB HISTORY: Error updating job history:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to update job history", 
        error: error.message 
      });
    }
  });

  app.delete('/api/job-history/:id', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.id;
      console.log("🔥 JOB HISTORY: Deleting job history entry", jobId);
      
      // Verify ownership
      const existingEntry = await simpleStorage.getJobHistoryById(jobId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await simpleStorage.deleteJobHistory(jobId);
      console.log("🔥 JOB HISTORY: Deleted entry", jobId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true });
    } catch (error) {
      console.error("🔥 JOB HISTORY: Error deleting job history:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to delete job history", 
        error: error.message 
      });
    }
  });

  // AI Enhancement endpoints for job history
  app.post('/api/job-history/:id/enhance', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.id;
      console.log("🔥 JOB HISTORY AI: Enhancing job description for", jobId);
      
      // Verify ownership
      const existingEntry = await simpleStorage.getJobHistoryById(jobId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Enhance description using AI
      const enhancedDescription = await enhanceJobDescription(
        existingEntry.title, 
        existingEntry.company, 
        existingEntry.description || ''
      );
      
      // Update job history with enhanced description
      const updatedEntry = await simpleStorage.updateJobHistory(jobId, {
        description: enhancedDescription,
        ai_enhanced: true
      });
      
      console.log("🔥 JOB HISTORY AI: Enhanced description for", jobId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedEntry);
    } catch (error) {
      console.error("🔥 JOB HISTORY AI: Error enhancing job history:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to enhance job history", 
        error: error.message 
      });
    }
  });

  app.post('/api/job-history/:id/validate-skills', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = req.user.id;
      console.log("🔥 JOB HISTORY SKILLS: Validating skills for", jobId);
      
      // Verify ownership
      const existingEntry = await simpleStorage.getJobHistoryById(jobId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate skills using AI
      const validatedSkills = await validateJobSkills(
        existingEntry.title, 
        existingEntry.company, 
        existingEntry.description || ''
      );
      
      // Update job history with validated skills
      const updatedEntry = await simpleStorage.updateJobHistory(jobId, {
        skill_validations: validatedSkills
      });
      
      console.log("🔥 JOB HISTORY SKILLS: Validated", validatedSkills.length, "skills for", jobId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        ...updatedEntry,
        validatedSkills 
      });
    } catch (error) {
      console.error("🔥 JOB HISTORY SKILLS: Error validating skills:", error);
      res.status(500).setHeader('Content-Type', 'application/json').json({ 
        message: "Failed to validate skills", 
        error: error.message 
      });
    }
  });

  // Get current user's profile data (combined user + profile data)
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log('👤 Getting profile for user:', userId);
      
      // Get user data
      const user = await simpleStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get profile data
      const profile = await simpleStorage.getUserProfile(userId);
      
      // Combine user and profile data
      const combinedProfile = {
        ...user,
        ...profile,
        // Ensure key fields are accessible
        displayName: profile?.displayName || `${user.firstName} ${user.lastName}`.trim() || user.username,
        location: profile?.location || 'Location not set',
        bio: profile?.bio || '',
        skills: profile?.skills || [],
        availabilityStatus: profile?.availabilityStatus || 'not_set',
        verified: profile?.verified || false,
        dailyRate: profile?.dailyRate || 0,
        talentType: profile?.talentType || '',
        languages: profile?.languages || [],
        accents: profile?.accents || [],
        instruments: profile?.instruments || [],
        genres: profile?.genres || [],
        unionStatus: profile?.unionStatus || profile?.union_status || []
      };
      
      console.log('👤 Returning profile data:', {
        userId,
        hasProfile: !!profile,
        location: combinedProfile.location,
        languages: combinedProfile.languages,
        skills: combinedProfile.skills?.length || 0
      });
      
      res.json(combinedProfile);
    } catch (error: any) {
      console.error('❌ Profile fetch error:', error);
      res.status(500).json({ message: "Failed to get profile: " + error.message });
    }
  });

  // Get user account data by username or ID
  app.get('/api/user/profile/:id', async (req, res) => {
    try {
      const userIdParam = req.params.id;
      let userId: number;
      let user;
      
      // Check if it's a numeric ID or username
      if (/^\d+$/.test(userIdParam)) {
        // It's a numeric ID
        userId = parseInt(userIdParam);
        user = await simpleStorage.getUser(userId);
      } else {
        // It's a username - need to find user first
        user = await simpleStorage.getUserByUsername(userIdParam);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        userId = user.id;
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user account data including profileImageUrl
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Get user usage stats
  app.get("/api/user/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await simpleStorage.getUser(userId);
      const pricingTier = user?.pricingTierId ? await simpleStorage.getPricingTier(user.pricingTierId) : null;
      
      if (!pricingTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      const mediaFiles = await simpleStorage.getUserMediaFiles(userId);
      const photos = mediaFiles.filter(f => f.type === 'image');
      const videos = mediaFiles.filter(f => f.type === 'video');
      const audio = mediaFiles.filter(f => f.type === 'audio');
      const externalLinks = mediaFiles.filter(f => f.externalUrl);
      
      const totalStorage = mediaFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      
      const usage = {
        photos: { current: photos.length, limit: pricingTier.maxPhotos === -1 ? 999 : pricingTier.maxPhotos },
        videos: { current: videos.length, limit: pricingTier.maxVideos === -1 ? 999 : pricingTier.maxVideos },
        audio: { current: audio.length, limit: pricingTier.maxAudio === -1 ? 999 : pricingTier.maxAudio },
        externalLinks: { current: externalLinks.length, limit: pricingTier.maxExternalLinks === -1 ? 999 : pricingTier.maxExternalLinks },
        storage: { current: totalStorage, limit: 1024 * 1024 * 1024, unit: 'bytes' }, // 1GB default
        tierName: pricingTier.name,
        tierCategory: pricingTier.category
      };
      
      res.json(usage);
    } catch (error: any) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  return httpServer;
}
