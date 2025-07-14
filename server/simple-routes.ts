import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertUserProfileSchema } from "@shared/simple-schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      console.log("Creating profile for user:", userId);
      console.log("Request body:", req.body);
      
      if (!userId) {
        console.error("No userId found in request");
        return res.status(400).json({ message: "User ID is required" });
      }
      
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
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create profile" });
      }
    }
  });

  app.get('/api/profile/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}