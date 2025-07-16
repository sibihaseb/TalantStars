import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums (define first)
export const userRoleEnum = pgEnum("user_role", ["talent", "manager", "producer", "admin"]);
export const talentTypeEnum = pgEnum("talent_type", ["actor", "musician", "voice_artist", "model", "profile"]);
export const availabilityStatusEnum = pgEnum("availability_status", ["available", "busy", "unavailable"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "in_progress", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for traditional auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("talent"),
  pricingTierId: integer("pricing_tier_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles with role-specific data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: userRoleEnum("role").notNull(),
  talentType: talentTypeEnum("talent_type"),
  displayName: varchar("display_name"),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  phoneNumber: varchar("phone_number"),
  isVerified: boolean("is_verified").default(false),
  availabilityStatus: availabilityStatusEnum("availability_status").default("available"),
  
  // Talent-specific fields
  height: varchar("height"),
  weight: varchar("weight"),
  eyeColor: text("eye_color").array(),
  hairColor: text("hair_color").array(),
  unionStatus: text("union_status").array(),
  shoeSize: varchar("shoe_size"),
  languages: text("languages").array(),
  accents: text("accents").array(),
  instruments: text("instruments").array(),
  genres: text("genres").array(),
  vocalRange: text("vocal_range").array(),
  bodyStats: text("body_stats"),
  walkType: varchar("walk_type"),
  
  // Extended talent fields
  affiliations: text("affiliations").array(),
  stunts: text("stunts").array(),
  activities: text("activities").array(),
  awards: text("awards").array(),
  experiences: text("experiences").array(),
  skills: text("skills").array(),
  wardrobe: text("wardrobe").array(),
  
  // Additional physical attributes
  tattoos: varchar("tattoos"),
  piercings: varchar("piercings"),
  scars: varchar("scars"),
  
  // Performance specific
  dancingStyles: text("dancing_styles").array(),
  sportingActivities: text("sporting_activities").array(),
  drivingLicenses: text("driving_licenses").array(),
  
  // Rates and availability
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  weeklyRate: decimal("weekly_rate", { precision: 10, scale: 2 }),
  projectRate: decimal("project_rate", { precision: 10, scale: 2 }),
  
  // Professional details
  resume: text("resume"),
  credits: jsonb("credits"),
  representations: jsonb("representations"),
  
  // Analytics
  profileViews: integer("profile_views").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;