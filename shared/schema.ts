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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const userRoleEnum = pgEnum("user_role", ["talent", "manager", "producer", "admin"]);
export const talentTypeEnum = pgEnum("talent_type", ["actor", "musician", "voice_artist", "model", "profile"]);
export const availabilityStatusEnum = pgEnum("availability_status", ["available", "busy", "unavailable"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "in_progress", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// User profiles with role-specific data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
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
  credits: jsonb("credits"), // Past work credits
  representations: jsonb("representations"), // Manager/agency info
  
  // Analytics
  profileViews: integer("profile_views").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media files for portfolios
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: varchar("filename"),
  originalName: varchar("original_name"),
  mimeType: varchar("mime_type"),
  size: integer("size"),
  url: varchar("url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  mediaType: varchar("media_type").notNull(), // 'image', 'video', 'audio', 'external'
  tags: text("tags").array(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  // External video links
  externalUrl: varchar("external_url"), // For YouTube, Vimeo, etc.
  externalPlatform: varchar("external_platform"), // 'youtube', 'vimeo', 'tiktok', etc.
  externalId: varchar("external_id"), // Video ID from platform
  duration: integer("duration"), // in seconds
  isExternal: boolean("is_external").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Availability calendar for talent
export const availabilityCalendar = pgTable("availability_calendar", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: availabilityStatusEnum("status").notNull().default("available"),
  notes: text("notes"),
  allDay: boolean("all_day").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skill endorsement system
export const skillEndorsements = pgTable("skill_endorsements", {
  id: serial("id").primaryKey(),
  endorserId: varchar("endorser_id").references(() => users.id).notNull(),
  endorsedUserId: varchar("endorsed_user_id").references(() => users.id).notNull(),
  skill: varchar("skill").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job postings
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  talentType: talentTypeEnum("talent_type").notNull(),
  location: varchar("location"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  projectDate: timestamp("project_date"),
  requirements: text("requirements"),
  status: jobStatusEnum("status").default("open"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  coverLetter: text("cover_letter"),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  status: varchar("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Talent-Manager relationships
export const talentManagers = pgTable("talent_managers", {
  id: serial("id").primaryKey(),
  talentId: varchar("talent_id").references(() => users.id).notNull(),
  managerId: varchar("manager_id").references(() => users.id).notNull(),
  status: varchar("status").default("active"), // active, inactive, pending
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin-specific tables
export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in days
  features: text("features").array().notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profileQuestions = pgTable("profile_questions", {
  id: serial("id").primaryKey(),
  talentType: talentTypeEnum("talent_type").notNull(),
  question: text("question").notNull(),
  fieldName: varchar("field_name").notNull(),
  fieldType: varchar("field_type").notNull(), // text, select, checkbox, textarea, number
  required: boolean("required").default(false),
  options: text("options").array(), // for select/checkbox fields
  order: integer("order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // general, email, payment, security, etc.
  dataType: varchar("data_type").notNull(), // string, number, boolean, json
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // create, update, delete, login, etc.
  resource: varchar("resource").notNull(), // user, job, pricing, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  event: varchar("event").notNull(), // page_view, user_signup, job_post, etc.
  userId: varchar("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meetingStatusEnum = pgEnum("meeting_status", ["scheduled", "confirmed", "cancelled", "completed"]);
export const meetingTypeEnum = pgEnum("meeting_type", ["in_person", "virtual"]);

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  attendeeId: varchar("attendee_id").references(() => users.id).notNull(),
  meetingDate: timestamp("meeting_date").notNull(),
  duration: integer("duration").default(60), // duration in minutes
  type: meetingTypeEnum("type").notNull(),
  status: meetingStatusEnum("status").default("scheduled").notNull(),
  location: text("location"), // for in-person meetings
  virtualLink: text("virtual_link"), // for virtual meetings (Zoom, Meet, Teams, etc.)
  platform: varchar("platform"), // zoom, meet, teams, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  permission: varchar("permission").notNull(), // e.g., "admin.users.create", "admin.jobs.edit"
  granted: boolean("granted").default(true).notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // meeting_request, password_reset, job_application, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  mediaFiles: many(mediaFiles),
  jobs: many(jobs),
  jobApplications: many(jobApplications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  talents: many(talentManagers, { relationName: "managerTalents" }),
  managers: many(talentManagers, { relationName: "talentManagers" }),
  organizedMeetings: many(meetings, { relationName: "organizedMeetings" }),
  attendedMeetings: many(meetings, { relationName: "attendedMeetings" }),
  passwordResetTokens: many(passwordResetTokens),
  permissions: many(userPermissions),
  notifications: many(notifications),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  user: one(users, {
    fields: [mediaFiles.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const talentManagersRelations = relations(talentManagers, ({ one }) => ({
  talent: one(users, {
    fields: [talentManagers.talentId],
    references: [users.id],
    relationName: "talentManagers",
  }),
  manager: one(users, {
    fields: [talentManagers.managerId],
    references: [users.id],
    relationName: "managerTalents",
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  organizer: one(users, {
    fields: [meetings.organizerId],
    references: [users.id],
    relationName: "organizedMeetings",
  }),
  attendee: one(users, {
    fields: [meetings.attendeeId],
    references: [users.id],
    relationName: "attendedMeetings",
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  grantedBy: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const availabilityCalendarRelations = relations(availabilityCalendar, ({ one }) => ({
  user: one(users, {
    fields: [availabilityCalendar.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileQuestionSchema = createInsertSchema(profileQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilityCalendarSchema = createInsertSchema(availabilityCalendar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillEndorsementSchema = createInsertSchema(skillEndorsements).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type UserWithProfile = User & { profile?: UserProfile };
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type TalentManager = typeof talentManagers.$inferSelect;
export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type ProfileQuestion = typeof profileQuestions.$inferSelect;
export type InsertProfileQuestion = z.infer<typeof insertProfileQuestionSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AvailabilityCalendar = typeof availabilityCalendar.$inferSelect;
export type InsertAvailabilityCalendar = z.infer<typeof insertAvailabilityCalendarSchema>;
export type SkillEndorsement = typeof skillEndorsements.$inferSelect;
export type InsertSkillEndorsement = z.infer<typeof insertSkillEndorsementSchema>;
