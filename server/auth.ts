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
    interface User {
      id: number;
      username: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      role: string | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
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
  
  // Session debugging middleware with CORS for credentials
  app.use((req: any, res: any, next: any) => {
    // Set CORS headers for credentials
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
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
        console.log("LocalStrategy attempt for username:", username);
        const user = await storage.getUserByUsername(username);
        console.log("User found:", user ? "YES" : "NO");
        
        if (!user) {
          console.log("User not found in database");
          return done(null, false);
        }
        
        console.log("Comparing passwords...");
        const passwordMatch = await comparePasswords(password, user.password);
        console.log("Password match:", passwordMatch);
        
        if (!passwordMatch) {
          console.log("Password mismatch");
          return done(null, false);
        }
        
        console.log("Authentication successful for user:", user.username);
        return done(null, user);
      } catch (error) {
        console.error("LocalStrategy error:", error);
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
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName, role, termsAccepted, privacyAccepted } = req.body;
      
      // Validate legal acceptance fields
      if (!termsAccepted || !privacyAccepted) {
        return res.status(400).json({ 
          message: "You must accept both the Terms of Service and Privacy Policy to register" 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        firstName,
        lastName,
        role: role || 'talent'
      });

      // Record legal document acceptance
      try {
        await storage.recordLegalAcceptance(user.id, {
          termsAccepted: termsAccepted,
          privacyAccepted: privacyAccepted,
          termsVersion: 1, // Default version
          privacyVersion: 1 // Default version
        });
      } catch (legalError) {
        console.error("Error recording legal acceptance:", legalError);
        // Don't fail registration for legal acceptance errors, just log
      }

      // Send welcome email
      try {
        const { sendWelcomeEmail } = await import('./email');
        await sendWelcomeEmail(user);
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail registration for email errors, just log
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ ...user, password: undefined });
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === '23505') {
        if (error.constraint === 'users_email_key') {
          return res.status(400).json({ message: "Email already exists" });
        }
        if (error.constraint === 'users_username_key') {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("Login attempt with:", req.body);
    const { rememberMe } = req.body;
    console.log("🔥 LOGIN: Remember me option:", rememberMe);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      
      if (!user) {
        console.log("Authentication failed:", info);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Handle Remember Me functionality
        if (req.session && req.session.cookie) {
          if (rememberMe) {
            // Get remember me duration from admin settings or default to 30 days
            storage.getAdminSettings().then(settings => {
              const rememberMeDurationDays = settings.find(s => s.key === 'remember_me_duration_days')?.value || '30';
              const durationMs = parseInt(rememberMeDurationDays) * 24 * 60 * 60 * 1000;
              req.session.cookie.maxAge = durationMs;
              console.log("🔥 LOGIN: Extended session duration to", rememberMeDurationDays, "days due to Remember Me");
            }).catch(() => {
              // Fallback to 30 days if admin settings fail
              const thirtyDays = 30 * 24 * 60 * 60 * 1000;
              req.session.cookie.maxAge = thirtyDays;
              console.log("🔥 LOGIN: Extended session duration to 30 days (fallback) due to Remember Me");
            });
          } else {
            // Use default session duration from admin settings
            getSessionDurationFromAdmin().then(duration => {
              req.session.cookie.maxAge = duration;
              console.log("🔥 LOGIN: Using default session duration:", duration / (60 * 60 * 1000), "hours");
            });
          }
          
          // Force secure to false after login
          req.session.cookie.secure = false;
          req.session.cookie.httpOnly = false;
        }
        
        // Force session to be saved properly
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          
          console.log("Login successful for user:", user.username);
          console.log("🔥 LOGIN: Session cookie maxAge set to:", req.session.cookie?.maxAge ? req.session.cookie.maxAge / (60 * 60 * 1000) : 'undefined', "hours");
          console.log("🔥 LOGIN: Session ID:", req.sessionID);
          console.log("🔥 LOGIN: Cookie settings:", req.session.cookie);
          
          // Ensure response headers for CORS and credentials
          res.header('Access-Control-Allow-Credentials', 'true');
          res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5000');
          
          res.status(200).json({ ...user, password: undefined });
        });
      });
    })(req, res, next);
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
    console.log("User endpoint - isAuthenticated:", req.isAuthenticated(), "user:", req.user);
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    res.json({ ...user, password: undefined });
  });

  // Test route to check session middleware and cookies
  app.get("/api/test-session", (req, res) => {
    console.log("Test session route called");
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);
    console.log("Cookies:", req.headers.cookie);
    console.log("User Agent:", req.headers['user-agent']);
    console.log("Referer:", req.headers.referer);
    res.json({ 
      sessionID: req.sessionID,
      hasSession: !!req.session,
      cookies: req.headers.cookie,
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? { ...req.user, password: undefined } : null
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
  
  // Allow both "admin" and "super_admin" roles
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
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
  
  // Admins and super admins bypass all plan requirements - full access
  if (req.user?.role === "admin" || req.user?.role === "super_admin") {
    console.log("Admin/Super admin detected - bypassing plan requirement");
    return next();
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