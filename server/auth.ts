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

export function setupAuth(app: Express) {
  // Use memory store for development to avoid cookie issues
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  // Force development environment for cookie settings
  const isDev = process.env.NODE_ENV !== 'production';
  console.log("Environment:", process.env.NODE_ENV, "isDev:", isDev);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: true, // Force save session on every request
    saveUninitialized: true, // Save empty sessions for debugging
    store: sessionStore,
    name: "connect.sid",
    cookie: {
      httpOnly: true,
      secure: false, // Force secure to false for all environments
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax"
    },
  };

  // Force cookie to be non-secure in development
  if (process.env.NODE_ENV === 'development') {
    sessionSettings.cookie!.secure = false;
  }

  // Debug: log the cookie configuration
  console.log("Session cookie configuration:", sessionSettings.cookie);

  // Remove trust proxy setting for development
  // app.set("trust proxy", 1);
  
  // Completely disable trust proxy for development
  app.set("trust proxy", false);
  
  // Test middleware to see if session is working
  app.use(session(sessionSettings));
  
  // Ensure cookies are not secure in development - more aggressive override
  app.use((req: any, res: any, next: any) => {
    if (req.session && req.session.cookie) {
      req.session.cookie.secure = false;
      req.session.cookie.httpOnly = true;
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
    res.status(200).json({ ...user, password: undefined });
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
  console.log("Traditional auth middleware - isAuthenticated:", req.isAuthenticated());
  console.log("Traditional auth middleware - user:", req.user);
  console.log("Traditional auth middleware - session:", req.session);
  console.log("Traditional auth middleware - sessionID:", req.sessionID);
  
  if (req.isAuthenticated()) {
    return next();
  }
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