import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./simple-storage";
import { User } from "@shared/simple-schema";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { pool } from "./db";
import { logger } from "./logger";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function getSessionDurationFromAdmin(): Promise<number> {
  try {
    const settings = await storage.getAdminSettings();
    const sessionDurationHours = settings.find(s => s.key === 'session_duration_hours')?.value;
    
    if (sessionDurationHours) {
      const hours = parseInt(sessionDurationHours);
      return hours * 60 * 60 * 1000; // Convert hours to milliseconds
    }
    
    // Default to 168 hours (7 days) for testing if no setting found
    return 168 * 60 * 60 * 1000;
  } catch (error) {
    console.error('Error getting session duration from admin settings:', error);
    // Default to 168 hours (7 days) for testing if error
    return 168 * 60 * 60 * 1000;
  }
}

export async function setupAuth(app: Express) {
  // Use memory store for development to avoid cookie issues
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  // Get session duration from admin settings
  const sessionDuration = await getSessionDurationFromAdmin();
  console.log("Session duration set to:", sessionDuration / (60 * 60 * 1000), "hours");

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-here-development-only",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't save empty sessions
    store: sessionStore,
    name: "connect.sid",
    cookie: {
      httpOnly: false, // Allow JavaScript access for debugging
      secure: false, // Never use secure in development
      maxAge: sessionDuration, // Use admin-controlled session duration
      sameSite: "lax"
    },
  };

  console.log("Session cookie configuration:", sessionSettings.cookie);

  // Completely disable trust proxy for development
  app.set("trust proxy", false);
  
  // Session middleware
  app.use(session(sessionSettings));
  
  // Session debugging middleware
  app.use((req: any, res: any, next: any) => {
    console.log("Session middleware - ID:", req.sessionID, "exists:", !!req.session, "user:", req.session?.passport?.user);
    if (req.session && req.session.cookie) {
      req.session.cookie.secure = false;
      req.session.cookie.httpOnly = false;
      req.session.cookie.sameSite = 'lax';
    }
    next();
  });
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user ID:", id);
      const user = await storage.getUser(id);
      console.log("Deserialized user:", user);
      done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        firstName,
        lastName,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ ...user, password: undefined });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    
    // Force secure to false after login
    if (req.session && req.session.cookie) {
      req.session.cookie.secure = false;
    }
    
    res.status(200).json({ ...user, password: undefined });
  });

  // Add admin login endpoint that matches the scratchpad
  app.post("/api/admin/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    console.log("Admin Session after login:", req.session);
    console.log("Admin User after login:", user);
    console.log("Admin IsAuthenticated:", req.isAuthenticated());
    
    // Force session to be saved and ensure cookie is sent
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save failed" });
      }
      
      // Force cookie to be non-secure
      if (req.session && req.session.cookie) {
        req.session.cookie.secure = false;
      }
      
      res.status(200).json({ ...user, password: undefined });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    res.json({ ...user, password: undefined });
  });

  // Test route to check session middleware
  app.get("/api/test-session", (req, res) => {
    console.log("Test session route called");
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);
    res.json({ 
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionData: req.session
    });
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  logger.auth('Authentication check', {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    userId: req.user?.id,
    username: req.user?.username,
    sessionId: req.sessionID,
    hasSession: !!req.session,
    url: req.url,
    method: req.method
  }, req);
  
  if (req.isAuthenticated()) {
    return next();
  }
  logger.auth('Authentication failed - unauthorized', {
    url: req.url,
    method: req.method,
    sessionId: req.sessionID
  }, req);
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin = (req: any, res: any, next: any) => {
  console.log("Admin middleware - isAuthenticated:", req.isAuthenticated());
  console.log("Admin middleware - user:", req.user);
  console.log("Admin middleware - user role:", req.user?.role);
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Not an admin" });
  }
  
  next();
};

export const requirePlan = (req: any, res: any, next: any) => {
  console.log("Plan middleware - isAuthenticated:", req.isAuthenticated());
  console.log("Plan middleware - user:", req.user);
  console.log("Plan middleware - user pricingTierId:", req.user?.pricingTierId);
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if user has selected a pricing tier
  if (!req.user.pricingTierId) {
    return res.status(403).json({ 
      message: "Plan selection required",
      requiresPlan: true 
    });
  }
  
  next();
};