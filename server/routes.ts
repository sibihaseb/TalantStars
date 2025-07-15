import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { storage as simpleStorage } from "./simple-storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
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
  insertSkillEndorsementSchema
} from "@shared/schema";
import { z } from "zod";
import { requestPasswordReset, validatePasswordResetToken, resetPassword } from "./passwordUtils";
import { sendMeetingInvitation, sendWelcomeEmail, sendEmail } from "./email";
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { uploadFileToWasabi, deleteFileFromWasabi, getFileTypeFromMimeType } from "./wasabi-config";
import multer from "multer";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup traditional authentication for all routes
  setupAuth(app);

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
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration endpoint
  app.post('/api/register', async (req: any, res) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;
      
      // Check if user already exists
      const existingUser = await simpleStorage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'talent'
      };
      
      const user = await simpleStorage.createUser(userData);
      
      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });



  // Profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
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

  // Media routes
  app.post('/api/media', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      const { title, description, category, externalUrl } = req.body;
      
      if (!file && !externalUrl) {
        return res.status(400).json({ message: "Either file or external URL is required" });
      }

      let mediaData;

      if (file) {
        // Upload file to Wasabi
        const uploadResult = await uploadFileToWasabi(file, `user-${userId}/media`);
        
        // Create media record in database
        mediaData = {
          userId,
          filename: uploadResult.key,
          originalName: uploadResult.originalName,
          mimeType: uploadResult.type,
          size: uploadResult.size,
          url: uploadResult.url,
          thumbnailUrl: null,
          mediaType: getFileTypeFromMimeType(uploadResult.type),
          tags: [],
          title: title || '',
          description: description || '',
          isPublic: true,
          category: category || 'portfolio'
        };
      } else if (externalUrl) {
        // Handle external URL
        let mediaType = 'video';
        if (externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be')) {
          mediaType = 'video';
        } else if (externalUrl.includes('vimeo.com')) {
          mediaType = 'video';
        } else if (externalUrl.includes('soundcloud.com') || externalUrl.includes('spotify.com')) {
          mediaType = 'audio';
        }
        
        mediaData = {
          userId,
          filename: `external_${Date.now()}`,
          originalName: title || 'External Media',
          mimeType: `${mediaType}/external`,
          size: 0,
          url: null,
          thumbnailUrl: null,
          mediaType,
          tags: [],
          title: title || '',
          description: description || '',
          isPublic: true,
          category: category || 'portfolio',
          externalUrl: externalUrl,
          isExternal: true
        };
      }
      
      const media = await storage.createMediaFile(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.post('/api/media/external', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { url, title, description, category } = req.body;
      
      // Determine media type from URL
      let mediaType = 'video';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        mediaType = 'video';
      } else if (url.includes('vimeo.com')) {
        mediaType = 'video';
      } else if (url.includes('soundcloud.com') || url.includes('spotify.com')) {
        mediaType = 'audio';
      }
      
      const mediaData = {
        userId,
        filename: `external_${Date.now()}`,
        originalName: title || 'External Media',
        mimeType: `${mediaType}/external`,
        size: 0,
        url: null,
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
      
      const media = await storage.createMediaFile(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error creating external media file:", error);
      res.status(500).json({ message: "Failed to create external media file" });
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const media = await storage.getUserMediaFiles(userId);
      res.json(media);
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
      const mediaFiles = await storage.getUserMediaFiles(userId);
      const mediaFile = mediaFiles.find(m => m.id === id);
      
      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }
      
      // Update media file
      const updatedMedia = await storage.updateMediaFile(id, {
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
      const mediaFiles = await storage.getUserMediaFiles(req.user.id);
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
      
      await storage.deleteMediaFile(id);
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

  // Search routes
  app.get('/api/search/talents', async (req, res) => {
    try {
      const { q, talentType, location } = req.query;
      const talents = await storage.searchTalents(q as string, {
        talentType: talentType as string,
        location: location as string,
      });
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
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(parseInt(notificationId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read", error: error.message });
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

  // Profile questions management
  app.get('/api/admin/profile-questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const questions = await storage.getProfileQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching profile questions:", error);
      res.status(500).json({ message: "Failed to fetch profile questions" });
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

  const httpServer = createServer(app);

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

  return httpServer;
}
