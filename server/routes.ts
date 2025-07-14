import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { enhanceProfile, generateBio } from "./openai";
import { 
  insertUserProfileSchema, 
  insertMediaFileSchema, 
  insertJobSchema, 
  insertJobApplicationSchema, 
  insertMessageSchema,
  insertMeetingSchema,
  insertNotificationSchema,
  insertUserPermissionSchema
} from "@shared/schema";
import { z } from "zod";
import { requestPasswordReset, validatePasswordResetToken, resetPassword } from "./passwordUtils";
import { sendMeetingInvitation, sendWelcomeEmail, sendEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      
      const profile = await storage.createUserProfile(profileData);
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
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // AI enhancement routes
  app.post('/api/profile/enhance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const enhanced = await enhanceProfile(profile);
      const updatedProfile = await storage.updateUserProfile(userId, enhanced);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error enhancing profile:", error);
      res.status(500).json({ message: "Failed to enhance profile" });
    }
  });

  app.post('/api/profile/generate-bio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mediaData = insertMediaFileSchema.parse({ ...req.body, userId });
      const media = await storage.createMediaFile(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.post('/api/media/external', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mediaData = await storage.createMediaFile({
        userId,
        filename: `external_${Date.now()}`,
        originalName: req.body.title || 'External Video',
        mimeType: 'video/external',
        size: 0,
        url: req.body.external_url,
        thumbnailUrl: null,
        mediaType: 'video',
        tags: [],
        description: req.body.description || '',
        isPublic: true,
        external_url: req.body.external_url,
        external_platform: req.body.external_platform,
        external_id: req.body.external_id,
        is_external: true,
      });
      res.json(mediaData);
    } catch (error) {
      console.error("Error creating external media file:", error);
      res.status(500).json({ message: "Failed to create external media file" });
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const media = await storage.getUserMediaFiles(userId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.delete('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMediaFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Job routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const senderId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating user:", req.body);
      const user = await storage.upsertUser(req.body);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user", error: error.message });
    }
  });

  app.put('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log("Updating user:", userId, req.body);
      const user = await storage.upsertUser({ ...req.body, id: userId });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/users/:userId/reset-password', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/mass-email', isAuthenticated, async (req: any, res) => {
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
      const organizerId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
  app.get('/api/admin/users/:userId/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post('/api/admin/users/:userId/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const grantedBy = req.user.claims.sub;
      const permission = await storage.createUserPermission({
        userId,
        permission: req.body.permission,
        granted: req.body.granted,
        grantedBy,
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
      const userId = req.user.claims.sub;
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

  app.put('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/admin/users/:userId/verify', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/pricing-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const tiers = await storage.getPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.post('/api/admin/pricing-tiers', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating pricing tier:", req.body);
      const tier = await storage.createPricingTier(req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ message: "Failed to create pricing tier", error: error.message });
    }
  });

  app.put('/api/admin/pricing-tiers/:tierId', isAuthenticated, async (req: any, res) => {
    try {
      const tierId = parseInt(req.params.tierId);
      const tier = await storage.updatePricingTier(tierId, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      res.status(500).json({ message: "Failed to update pricing tier" });
    }
  });

  app.delete('/api/admin/pricing-tiers/:tierId', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/profile-questions', isAuthenticated, async (req: any, res) => {
    try {
      const questions = await storage.getProfileQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching profile questions:", error);
      res.status(500).json({ message: "Failed to fetch profile questions" });
    }
  });

  app.post('/api/admin/profile-questions', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating profile question:", req.body);
      const question = await storage.createProfileQuestion(req.body);
      res.json(question);
    } catch (error) {
      console.error("Error creating profile question:", error);
      res.status(500).json({ message: "Failed to create profile question", error: error.message });
    }
  });

  app.put('/api/admin/profile-questions/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const question = await storage.updateProfileQuestion(questionId, req.body);
      res.json(question);
    } catch (error) {
      console.error("Error updating profile question:", error);
      res.status(500).json({ message: "Failed to update profile question" });
    }
  });

  app.delete('/api/admin/profile-questions/:questionId', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating system setting:", req.body);
      const setting = await storage.createSystemSetting(req.body);
      res.json(setting);
    } catch (error) {
      console.error("Error creating system setting:", error);
      res.status(500).json({ message: "Failed to create system setting", error: error.message });
    }
  });

  app.put('/api/admin/settings/:key', isAuthenticated, async (req: any, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const updatedBy = req.user.claims.sub;
      const setting = await storage.updateSystemSetting(key, value, updatedBy);
      res.json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  app.delete('/api/admin/settings/:key', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAdminLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  app.post('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const logData = { ...req.body, adminId, ipAddress: req.ip, userAgent: req.get('User-Agent') };
      const log = await storage.createAdminLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Error creating admin log:", error);
      res.status(500).json({ message: "Failed to create admin log" });
    }
  });

  // Analytics
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/admin/analytics/summary', isAuthenticated, async (req: any, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  app.post('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.createAnalytics(req.body);
      res.json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(500).json({ message: "Failed to create analytics" });
    }
  });

  // Admin Job Management
  app.get('/api/admin/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/admin/jobs', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating job:", req.body);
      const job = await storage.createJob(req.body);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job", error: error.message });
    }
  });

  app.put('/api/admin/jobs/:jobId', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/admin/jobs/:jobId', isAuthenticated, async (req: any, res) => {
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

  // Talent-Manager routes
  app.post('/api/talent-manager', isAuthenticated, async (req: any, res) => {
    try {
      const managerId = req.user.claims.sub;
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
      const managerId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const availability = await storage.getUserAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  return httpServer;
}
