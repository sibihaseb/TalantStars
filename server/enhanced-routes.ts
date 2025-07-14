import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "ws";
import multer from "multer";
import Stripe from "stripe";
import { 
  enhanceProfileWithAI, 
  generateBioFromProfile, 
  generateJobDescription, 
  generateTalentMatches,
  generateEmailReply,
  generateProfileSummary,
  moderateContent,
  generateSearchTags 
} from "./enhanced-openai";
import { sendEmail } from "./email";
import { storage } from "./storage";
import { 
  insertMediaFileSchema, 
  insertJobSchema, 
  insertJobApplicationSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertUserSubscriptionSchema,
  insertPricingTierSchema,
  insertJobMatchSchema,
  insertAiGeneratedContentSchema,
  insertEmailTemplateSchema,
  insertVerificationRequestSchema
} from "@shared/schema";

// Initialize Stripe if secret key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

export async function registerEnhancedRoutes(app: Express): Promise<Server> {
  // ===== MEDIA MANAGEMENT ROUTES =====
  
  // Upload media files
  app.post("/api/media/upload", upload.array("files", 10), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = [];
      
      for (const file of files) {
        // In production, upload to AWS S3 or Wasabi
        // For now, we'll simulate the upload and store metadata
        const mediaFile = await storage.createMediaFile({
          userId: req.user.id,
          filename: `${Date.now()}-${file.originalname}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${Date.now()}-${file.originalname}`, // Simulated URL
          mediaType: file.mimetype.startsWith('image/') ? 'image' : 
                    file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('audio/') ? 'audio' : 'document',
          isPublic: true,
          isExternal: false
        });
        
        uploadedFiles.push(mediaFile);
      }

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Get user's media files
  app.get("/api/media/user/:userId", async (req, res) => {
    try {
      const mediaFiles = await storage.getUserMediaFiles(req.params.userId);
      res.json(mediaFiles);
    } catch (error) {
      console.error("Error fetching media files:", error);
      res.status(500).json({ error: "Failed to fetch media files" });
    }
  });

  // Add external media link (YouTube, Vimeo, etc.)
  app.post("/api/media/external", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { url, platform, title, description } = req.body;
      
      // Extract video ID from URL
      const extractVideoId = (url: string, platform: string) => {
        if (platform === 'youtube') {
          const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          return match ? match[1] : null;
        } else if (platform === 'vimeo') {
          const match = url.match(/vimeo\.com\/(\d+)/);
          return match ? match[1] : null;
        }
        return null;
      };

      const videoId = extractVideoId(url, platform);
      
      const mediaFile = await storage.createMediaFile({
        userId: req.user.id,
        originalName: title,
        url: url,
        externalUrl: url,
        externalPlatform: platform,
        externalId: videoId,
        mediaType: 'video',
        description: description,
        isPublic: true,
        isExternal: true
      });

      res.json(mediaFile);
    } catch (error) {
      console.error("Error adding external media:", error);
      res.status(500).json({ error: "Failed to add external media" });
    }
  });

  // ===== REAL-TIME MESSAGING ROUTES =====

  // Create chat room
  app.post("/api/chat/rooms", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const roomData = insertChatRoomSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });

      const chatRoom = await storage.createChatRoom(roomData);
      res.json(chatRoom);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(500).json({ error: "Failed to create chat room" });
    }
  });

  // Get user's chat rooms
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const chatRooms = await storage.getUserChatRooms(req.user.id);
      res.json(chatRooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  // Send message to chat room
  app.post("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        chatRoomId: parseInt(req.params.roomId),
        senderId: req.user.id
      });

      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to WebSocket clients
      broadcastMessage({
        type: 'new_message',
        roomId: req.params.roomId,
        message: message
      });

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ===== STRIPE INTEGRATION ROUTES =====

  if (stripe) {
    // Create subscription for user
    app.post("/api/subscriptions/create", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const { pricingTierId } = req.body;
        const pricingTier = await storage.getPricingTier(pricingTierId);
        
        if (!pricingTier) {
          return res.status(404).json({ error: "Pricing tier not found" });
        }

        // Create or get Stripe customer
        let customer;
        const existingSubscription = await storage.getUserSubscription(req.user.id);
        
        if (existingSubscription?.stripeCustomerId) {
          customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: req.user.email,
            name: req.user.username,
          });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: pricingTier.stripePrice }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Save subscription to database
        await storage.createUserSubscription({
          userId: req.user.id,
          pricingTierId: pricingTier.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer.id,
          status: 'pending'
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ error: "Failed to create subscription" });
      }
    });

    // Handle Stripe webhooks
    app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const subscription = event.data.object;
          await storage.updateUserSubscriptionStatus(subscription.subscription, 'active');
          break;
        case 'invoice.payment_failed':
          await storage.updateUserSubscriptionStatus(subscription.subscription, 'past_due');
          break;
        case 'customer.subscription.deleted':
          await storage.updateUserSubscriptionStatus(event.data.object.id, 'cancelled');
          break;
      }

      res.json({ received: true });
    });
  }

  // ===== JOB BOARD ROUTES =====

  // Create job posting
  app.post("/api/jobs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const jobData = insertJobSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // AI-enhance job description if requested
      if (req.body.enhanceWithAI && process.env.OPENAI_API_KEY) {
        try {
          jobData.description = await generateJobDescription(jobData);
        } catch (error) {
          console.error("AI enhancement failed:", error);
          // Continue without AI enhancement
        }
      }

      const job = await storage.createJob(jobData);

      // Generate talent matches using AI
      if (process.env.OPENAI_API_KEY) {
        try {
          const talents = await storage.getTalentsByType(job.talentType);
          const matches = await generateTalentMatches(job, talents);
          
          // Save matches to database
          for (const match of matches) {
            await storage.createJobMatch({
              jobId: job.id,
              userId: match.userId,
              matchScore: match.matchScore,
              matchReasons: match.reasons
            });
          }
        } catch (error) {
          console.error("Error generating talent matches:", error);
        }
      }

      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Get job matches for a user
  app.get("/api/jobs/matches", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const matches = await storage.getJobMatchesForUser(req.user.id);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching job matches:", error);
      res.status(500).json({ error: "Failed to fetch job matches" });
    }
  });

  // Apply to job
  app.post("/api/jobs/:jobId/apply", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const applicationData = insertJobApplicationSchema.parse({
        ...req.body,
        jobId: parseInt(req.params.jobId),
        userId: req.user.id
      });

      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ error: "Failed to apply to job" });
    }
  });

  // ===== AI INTEGRATION ROUTES =====

  if (process.env.OPENAI_API_KEY) {
    // AI-enhance profile
    app.post("/api/ai/enhance-profile", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const profile = await storage.getUserProfile(req.user.id);
        if (!profile) {
          return res.status(404).json({ error: "Profile not found" });
        }

        const enhanced = await enhanceProfileWithAI(profile);
        res.json(enhanced);
      } catch (error) {
        console.error("Error enhancing profile:", error);
        res.status(500).json({ error: "Failed to enhance profile" });
      }
    });

    // Generate bio using AI
    app.post("/api/ai/generate-bio", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const profile = await storage.getUserProfile(req.user.id);
        if (!profile) {
          return res.status(404).json({ error: "Profile not found" });
        }

        const bio = await generateBioFromProfile(profile);
        
        // Save AI-generated content
        await storage.createAiGeneratedContent({
          userId: req.user.id,
          contentType: 'bio',
          prompt: 'Generate professional bio',
          generatedContent: bio,
          model: 'gpt-4o'
        });

        res.json({ bio });
      } catch (error) {
        console.error("Error generating bio:", error);
        res.status(500).json({ error: "Failed to generate bio" });
      }
    });

    // Generate email reply
    app.post("/api/ai/generate-email-reply", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: "Authentication required" });
        }

        const { originalMessage, context, tone } = req.body;
        const reply = await generateEmailReply(originalMessage, context, tone);
        
        res.json({ reply });
      } catch (error) {
        console.error("Error generating email reply:", error);
        res.status(500).json({ error: "Failed to generate email reply" });
      }
    });

    // Moderate content
    app.post("/api/ai/moderate-content", async (req, res) => {
      try {
        const { content, type } = req.body;
        const moderation = await moderateContent(content, type);
        res.json(moderation);
      } catch (error) {
        console.error("Error moderating content:", error);
        res.status(500).json({ error: "Failed to moderate content" });
      }
    });
  }

  // ===== ADMIN ROUTES =====

  // Get all pricing tiers
  app.get("/api/admin/pricing-tiers", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const tiers = await storage.getAllPricingTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });

  // Create pricing tier
  app.post("/api/admin/pricing-tiers", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const tierData = insertPricingTierSchema.parse(req.body);
      const tier = await storage.createPricingTier(tierData);
      res.json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ error: "Failed to create pricing tier" });
    }
  });

  // Get verification requests
  app.get("/api/admin/verification-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const requests = await storage.getVerificationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      res.status(500).json({ error: "Failed to fetch verification requests" });
    }
  });

  // Approve/reject verification
  app.post("/api/admin/verification-requests/:id/review", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { status, notes } = req.body;
      const request = await storage.updateVerificationRequest(
        parseInt(req.params.id),
        {
          status,
          reviewNotes: notes,
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      );

      res.json(request);
    } catch (error) {
      console.error("Error reviewing verification request:", error);
      res.status(500).json({ error: "Failed to review verification request" });
    }
  });

  // ===== NOTIFICATION ROUTES =====

  // Send email notification
  app.post("/api/notifications/email", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { to, subject, content, template } = req.body;
      
      const success = await sendEmail({
        to,
        subject,
        html: content,
        from: process.env.FROM_EMAIL || 'noreply@talentsstars.com'
      });

      res.json({ success });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // ===== WEBSOCKET SETUP =====
  const httpServer = createServer(app);
  const wss = new SocketServer({ server: httpServer });

  // WebSocket connection handling
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types
        switch (data.type) {
          case 'join_room':
            // Handle room joining
            break;
          case 'send_message':
            // Handle message sending
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Broadcast function for real-time updates
  function broadcastMessage(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}