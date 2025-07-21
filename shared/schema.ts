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
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums (define first before tables)
export const userRoleEnum = pgEnum("user_role", ["talent", "manager", "producer", "admin"]);
export const talentTypeEnum = pgEnum("talent_type", ["actor", "musician", "voice_artist", "model", "profile"]);
export const availabilityStatusEnum = pgEnum("availability_status", ["available", "busy", "unavailable"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "in_progress", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);



// User storage table for username/password auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  mainImageUrl: varchar("main_image_url"), // 1:1 cropped main profile image
  role: userRoleEnum("role").default("talent"),
  pricingTierId: integer("pricing_tier_id"),
  language: varchar("language").default("en"), // User's preferred language
  // Legal document acceptance tracking
  termsAccepted: boolean("terms_accepted").default(false),
  privacyAccepted: boolean("privacy_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  termsVersion: integer("terms_version"), // Track which version was accepted
  privacyVersion: integer("privacy_version"), // Track which version was accepted
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
  credits: jsonb("credits"), // Past work credits
  representations: jsonb("representations"), // Manager/agency info
  
  // Analytics
  profileViews: integer("profile_views").default(0),
  
  // Featured talent system
  isFeatured: boolean("is_featured").default(false),
  featuredAt: timestamp("featured_at"),
  featuredTier: varchar("featured_tier"), // premium, gold, platinum, etc.
  
  // Public profile visibility (commented out until database is updated)
  // isPublic: boolean("is_public").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media files for portfolios
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: varchar("filename"),
  originalName: varchar("original_name"),
  mimeType: varchar("mime_type"),
  size: integer("size"),
  url: varchar("url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  mediaType: varchar("media_type").notNull(), // 'image', 'video', 'audio', 'external'
  tags: text("tags").array(), // Keep in database but not used in frontend
  title: varchar("title"),
  description: text("description"),
  category: varchar("category").default("portfolio"), // portfolio, demo, headshot, resume, other
  isPublic: boolean("is_public").default(true),
  // External video links
  externalUrl: varchar("external_url"), // For YouTube, Vimeo, etc.
  externalPlatform: varchar("external_platform"), // 'youtube', 'vimeo', 'tiktok', etc.
  externalId: varchar("external_id"), // Video ID from platform
  duration: integer("duration"), // in seconds
  isExternal: boolean("is_external").default(false),
  // HLS streaming support and metadata - temporarily disabled due to database column mismatch
  // hlsUrl: varchar("hls_url"), // URL to HLS playlist file (.m3u8)
  // metadata: jsonb("metadata"), // Additional media metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// User-created tags for media organization
export const userTags = pgTable("user_tags", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  color: varchar("color").default("#3B82F6"), // Hex color code
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Many-to-many relationship between media files and tags
export const mediaFileTags = pgTable("media_file_tags", {
  id: serial("id").primaryKey(),
  mediaFileId: integer("media_file_id").references(() => mediaFiles.id).notNull(),
  tagId: integer("tag_id").references(() => userTags.id).notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  talentType: talentTypeEnum("talent_type").notNull(),
  location: varchar("location"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  projectDate: timestamp("project_date"),
  requirements: text("requirements"),
  status: jobStatusEnum("status").default("open"),
  isPublic: boolean("is_public").default(true),
  allowCommunication: boolean("allow_communication").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  coverLetter: text("cover_letter"),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  status: varchar("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Job communication messages
export const jobCommunications = pgTable("job_communications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
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
export const categoryEnum = pgEnum("category", ["talent", "manager", "producer", "agent"]);

export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }).default("0"),
  duration: integer("duration").notNull(), // in days
  features: text("features").array().notNull(),
  active: boolean("is_active").default(true),
  category: categoryEnum("category").notNull().default("talent"),
  
  // Resource limits
  maxPhotos: integer("max_photos").default(0), // 0 = unlimited
  maxVideos: integer("max_videos").default(0),
  maxAudio: integer("max_audio").default(0),
  maxExternalLinks: integer("max_external_links").default(0), // 0 = unlimited
  maxStorageGB: integer("max_storage_gb").default(1),
  maxProjects: integer("max_projects").default(0),
  maxApplications: integer("max_applications").default(0),
  
  // Feature access
  hasAnalytics: boolean("has_analytics").default(false),
  hasMessaging: boolean("has_messaging").default(false),
  hasAIFeatures: boolean("has_ai_features").default(false),
  hasPrioritySupport: boolean("has_priority_support").default(false),
  
  // Permissions
  canCreateJobs: boolean("can_create_jobs").default(false),
  canViewProfiles: boolean("can_view_profiles").default(true),
  canExportData: boolean("can_export_data").default(false),
  hasSocialFeatures: boolean("has_social_features").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  stripeChargeId: varchar("stripe_charge_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("usd"),
  status: varchar("status").notNull(), // pending, succeeded, failed, refunded, partially_refunded
  paymentMethod: varchar("payment_method"), // card, bank_transfer, etc.
  tierId: integer("tier_id").references(() => pricingTiers.id),
  isAnnual: boolean("is_annual").default(false),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional payment data
  stripeCustomerId: varchar("stripe_customer_id"),
  receiptUrl: varchar("receipt_url"),
  refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }).default("0.00"),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  refundedBy: integer("refunded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment refunds table for detailed refund tracking
export const paymentRefunds = pgTable("payment_refunds", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => paymentTransactions.id).notNull(),
  stripeRefundId: varchar("stripe_refund_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: varchar("reason"), // requested_by_customer, duplicate, fraudulent, etc.
  status: varchar("status").notNull(), // pending, succeeded, failed, canceled
  adminNotes: text("admin_notes"),
  processedBy: integer("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment analytics aggregation table
export const paymentAnalytics = pgTable("payment_analytics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
  totalTransactions: integer("total_transactions").default(0),
  successfulTransactions: integer("successful_transactions").default(0),
  failedTransactions: integer("failed_transactions").default(0),
  refundedTransactions: integer("refunded_transactions").default(0),
  totalRefunds: decimal("total_refunds", { precision: 10, scale: 2 }).default("0.00"),
  averageTransactionAmount: decimal("average_transaction_amount", { precision: 10, scale: 2 }).default("0.00"),
  newCustomers: integer("new_customers").default(0),
  monthlySubscriptions: integer("monthly_subscriptions").default(0),
  annualSubscriptions: integer("annual_subscriptions").default(0),
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

// Promo code system
export const promoCodeTypeEnum = pgEnum("promo_code_type", [
  "percentage", "fixed_amount", "first_month_free", "first_month_discount"
]);

export const promoCodePlanEnum = pgEnum("promo_code_plan", [
  "all", "monthly_only", "annual_only", "specific_tier"
]);

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(), // Display name for admin
  description: text("description"),
  type: promoCodeTypeEnum("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // Amount or percentage
  
  // Plan restrictions
  planRestriction: promoCodePlanEnum("planRestriction").default("all"),
  specificTierId: integer("specificTierId").references(() => pricingTiers.id),
  categoryRestriction: categoryEnum("categoryRestriction"), // null = all categories
  
  // Usage limits
  maxUses: integer("maxUses"), // null = unlimited
  usedCount: integer("usedCount").default(0),
  maxUsesPerUser: integer("maxUsesPerUser").default(1),
  
  // Time restrictions
  startsAt: timestamp("startsAt"),
  expiresAt: timestamp("expiresAt"),
  
  // Status
  active: boolean("active").default(true),
  
  // Metadata
  createdBy: integer("createdBy").references(() => users.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Track promo code usage
export const promoCodeUsage = pgTable("promo_code_usage", {
  id: serial("id").primaryKey(),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  pricingTierId: integer("pricing_tier_id").references(() => pricingTiers.id).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  planType: varchar("plan_type").notNull(), // "monthly" or "annual"
  usedAt: timestamp("used_at").defaultNow(),
});

// Job/Gig history for talents and their managers
export const jobHistoryEnum = pgEnum("job_history_type", [
  "feature_film", "short_film", "tv_show", "tv_series", "commercial", 
  "fashion_show", "advertisement", "music_concert", "theater", "voice_over",
  "modeling", "documentary", "web_series", "music_video", "corporate_video",
  "live_performance", "radio", "podcast", "audiobook", "gaming", "animation"
]);

export const jobHistory = pgTable("job_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  company: varchar("company").notNull(),
  jobType: jobHistoryEnum("job_type").notNull(),
  role: varchar("role").notNull(), // Actor, Lead Singer, Model, etc.
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  location: varchar("location"),
  description: text("description"),

  credits: text("credits"), // How they want to be credited
  isPublic: boolean("is_public").default(true),
  verified: boolean("verified").default(false), // Admin verification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feature access control system
export const featureAccessEnum = pgEnum("feature_access_type", [
  "social_media", "job_posting", "advanced_search", "media_upload", 
  "messaging", "analytics", "ai_features", "profile_verification",
  "team_collaboration", "video_conferencing", "export_data", "api_access",
  "custom_branding", "priority_support", "advanced_analytics", "reports"
]);

export const userFeatureAccess = pgTable("user_feature_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  featureType: featureAccessEnum("feature_type").notNull(),
  hasAccess: boolean("has_access").default(false),
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at"),
  expiresAt: timestamp("expires_at"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social media posts - removed duplicate, using the one below

// Social connections/friendships
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  friendId: integer("friend_id").references(() => users.id).notNull(),
  status: varchar("status").default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social post interactions
export const socialInteractions = pgTable("social_interactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => socialPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  interactionType: varchar("interaction_type").notNull(), // like, comment, share
  content: text("content"), // For comments
  createdAt: timestamp("created_at").defaultNow(),
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

// Social media features
export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "blocked"]);
export const postPrivacyEnum = pgEnum("post_privacy", ["public", "friends", "private"]);

// User friendships and connections
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  addresseeId: integer("addressee_id").references(() => users.id).notNull(),
  status: friendshipStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social posts
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mediaIds: integer("media_ids").array(), // references to mediaFiles
  privacy: postPrivacyEnum("privacy").default("public").notNull(),
  taggedUsers: integer("tagged_users").array(), // references to users
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media Uploads
export const mediaUploads = pgTable("media_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: integer("file_size"),
  mediaUrl: varchar("media_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Availability
export const userAvailability = pgTable("user_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).default("available"),
  eventTitle: varchar("event_title", { length: 255 }),
  eventDescription: text("event_description"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification Documents
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  documentUrl: varchar("document_url", { length: 500 }).notNull(),
  documentName: varchar("document_name", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending"),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
});

// User representation (managers, agents, etc.)
export const representationTypeEnum = pgEnum("representation_type", [
  "manager", "agent", "publicist", "attorney", "brand_manager", "booking_agent", "assistant"
]);

export const userRepresentation = pgTable("user_representation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  representationType: representationTypeEnum("representation_type").notNull(),
  name: varchar("name").notNull(),
  company: varchar("company"),
  email: varchar("email"),
  phone: varchar("phone"),
  website: varchar("website"),
  notes: text("notes"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => socialPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => socialPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  parentCommentId: integer("parent_comment_id").references(() => postComments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional connections (managers, agents, PR, etc.)
export const professionalConnectionTypeEnum = pgEnum("professional_connection_type", [
  "manager", "agent", "pr", "publicist", "attorney", "accountant", "coach", "mentor"
]);

export const professionalConnections = pgTable("professional_connections", {
  id: serial("id").primaryKey(),
  talentId: integer("talent_id").references(() => users.id).notNull(),
  professionalId: integer("professional_id").references(() => users.id).notNull(),
  connectionType: professionalConnectionTypeEnum("connection_type").notNull(),
  status: varchar("status").default("active"), // active, inactive, pending
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User privacy settings
export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  profileVisibility: varchar("profile_visibility").default("public"), // public, friends, private
  searchable: boolean("searchable").default(true),
  allowFriendRequests: boolean("allow_friend_requests").default(true),
  allowMessages: boolean("allow_messages").default(true),
  allowTagging: boolean("allow_tagging").default(true),
  showOnlineStatus: boolean("show_online_status").default(true),
  showActivity: boolean("show_activity").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced permissions system with granular control
export const permissionCategoryEnum = pgEnum("permission_category", [
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
]);

export const permissionActionEnum = pgEnum("permission_action", [
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
]);

// Role-based default permissions
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  category: permissionCategoryEnum("category").notNull(),
  action: permissionActionEnum("action").notNull(),
  resource: varchar("resource"), // optional specific resource like "own_profile", "all_profiles"
  granted: boolean("granted").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual user permissions (overrides role permissions)
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: permissionCategoryEnum("category").notNull(),
  action: permissionActionEnum("action").notNull(),
  resource: varchar("resource"), // optional specific resource like "own_profile", "all_profiles", "user_123"
  granted: boolean("granted").default(true).notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"), // optional expiration
  conditions: jsonb("conditions"), // optional conditions like time restrictions, IP restrictions, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// User subscriptions for tiered pricing
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  pricingTierId: integer("pricing_tier_id").references(() => pricingTiers.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  status: varchar("status").default("active"), // active, cancelled, expired, pending
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat rooms for group messaging
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").default("group"), // group, broadcast, direct
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  isPublic: boolean("is_public").default(false),
  maxMembers: integer("max_members").default(50),
  encrypted: boolean("encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat room participants
export const chatRoomParticipants = pgTable("chat_room_participants", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").references(() => chatRooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
});

// Enhanced messages table for chat rooms
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").references(() => chatRooms.id),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, video, audio, file, system
  metadata: jsonb("metadata"), // For file attachments, media info, etc.
  encrypted: boolean("encrypted").default(true),
  editedAt: timestamp("edited_at"),
  replyToId: integer("reply_to_id"),
  status: messageStatusEnum("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job matching system
export const jobMatches = pgTable("job_matches", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }), // AI-generated match score
  matchReasons: text("match_reasons").array(), // Why they match
  notified: boolean("notified").default(false),
  viewed: boolean("viewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email templates for notifications
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  category: varchar("category").notNull(), // welcome, job_alert, password_reset, etc.
  active: boolean("active").default(true),
  description: text("description"),
  content: text("content"),
  elements: jsonb("elements").array(),
  previewText: text("preview_text"),
  isDefault: boolean("is_default").default(false),
  variables: jsonb("variables").default('[]'), // Available variables for this template like {{userName}}, {{companyName}}, etc.
  fromName: varchar("from_name").default("Talents & Stars"), // Sender name
  fromEmail: varchar("from_email").default("noreply@talentsandstars.com"), // Sender email
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-generated content cache
export const aiGeneratedContent = pgTable("ai_generated_content", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contentType: varchar("content_type").notNull(), // bio, job_description, profile_summary, etc.
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  model: varchar("model").notNull(), // gpt-4o, gpt-3.5-turbo, etc.
  tokens: integer("tokens"),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media processing queue
export const mediaProcessingQueue = pgTable("media_processing_queue", {
  id: serial("id").primaryKey(),
  mediaFileId: integer("media_file_id").references(() => mediaFiles.id).notNull(),
  status: varchar("status").default("pending"), // pending, processing, completed, failed
  processingType: varchar("processing_type").notNull(), // thumbnail, transcoding, analysis
  progress: integer("progress").default(0), // 0-100
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User verification requests
export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  documentType: varchar("document_type").notNull(), // id, passport, professional_license, etc.
  documentUrl: varchar("document_url").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected, requires_review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Meeting requests system
export const meetingRequests = pgTable("meeting_requests", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  requestedDate: timestamp("requested_date").notNull(),
  requestedTime: time("requested_time"),
  duration: integer("duration").default(60), // in minutes
  meetingType: varchar("meeting_type").default("video"), // video, phone, in_person
  location: varchar("location"), // for in-person meetings
  status: varchar("status").default("pending"), // pending, accepted, declined, cancelled
  responseMessage: text("response_message"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO settings for global site configuration
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name").default("Talents & Stars").notNull(),
  siteDescription: text("site_description").default("AI-powered platform connecting entertainment professionals with their next big break").notNull(),
  siteKeywords: text("site_keywords").array().default([]),
  siteUrl: varchar("site_url").default("https://talentsandstars.com").notNull(),
  defaultSeoImageUrl: varchar("default_seo_image_url"),
  twitterHandle: varchar("twitter_handle"),
  facebookAppId: varchar("facebook_app_id"),
  googleAnalyticsId: varchar("google_analytics_id"),
  googleTagManagerId: varchar("google_tag_manager_id"),
  verificationCodes: jsonb("verification_codes").default({}), // Google, Bing, etc.
  structuredDataEnabled: boolean("structured_data_enabled").default(true),
  openGraphEnabled: boolean("open_graph_enabled").default(true),
  twitterCardEnabled: boolean("twitter_card_enabled").default(true),
  robotsConfig: jsonb("robots_config").default({}),
  sitemapEnabled: boolean("sitemap_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO page configurations for specific pages/routes
export const seoPages = pgTable("seo_pages", {
  id: serial("id").primaryKey(),
  route: varchar("route").notNull().unique(), // /about, /pricing, /talent/[id], etc.
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords").array().default([]),
  seoImageUrl: varchar("seo_image_url"),
  ogTitle: varchar("og_title"),
  ogDescription: text("og_description"),
  ogImageUrl: varchar("og_image_url"),
  twitterTitle: varchar("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImageUrl: varchar("twitter_image_url"),
  canonicalUrl: varchar("canonical_url"),
  noIndex: boolean("no_index").default(false),
  noFollow: boolean("no_follow").default(false),
  structuredData: jsonb("structured_data").default({}),
  priority: decimal("priority", { precision: 2, scale: 1 }).default("0.5"), // Sitemap priority
  changeFreq: varchar("change_freq").default("monthly"), // daily, weekly, monthly, yearly
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO images management
export const seoImages = pgTable("seo_images", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  alt: varchar("alt").notNull(),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  format: varchar("format"), // jpg, png, webp
  isDefault: boolean("is_default").default(false),
  usageCount: integer("usage_count").default(0),
  tags: text("tags").array().default([]),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile sharing configuration for social media
export const profileSharing = pgTable("profile_sharing", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shareTitle: varchar("share_title"),
  shareDescription: text("share_description"),
  shareImageUrl: varchar("share_image_url"),
  showContact: boolean("show_contact").default(true),
  showSkills: boolean("show_skills").default(true),
  showExperience: boolean("show_experience").default(true),
  showMedia: boolean("show_media").default(true),
  customMessage: text("custom_message"),
  shareCount: integer("share_count").default(0),
  lastSharedAt: timestamp("last_shared_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile sharing settings for public profile access
export const profileSharingSettings = pgTable("profile_sharing_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  customUrl: varchar("custom_url").unique(), // Custom URL slug for profile
  isPublic: boolean("is_public").default(true), // Profile is public by default
  allowDirectMessages: boolean("allow_direct_messages").default(true), // Allow messages by default
  showContactInfo: boolean("show_contact_info").default(false), // Don't show contact by default
  showSocialLinks: boolean("show_social_links").default(true), // Show social links by default
  showMediaGallery: boolean("show_media_gallery").default(true), // Show gallery by default
  allowNonAccountHolders: boolean("allow_non_account_holders").default(true), // Allow non-account holders by default
  completelyPrivate: boolean("completely_private").default(false), // Not completely private by default
  shareableFields: text("shareable_fields").array().default([]), // Fields that can be shared
  profileViews: integer("profile_views").default(0),
  lastShared: timestamp("last_shared"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin settings for OpenAI keys and other configurations
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  description: text("description"),
  encrypted: boolean("encrypted").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legal documents table for Terms of Service and Privacy Policy
export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'terms_of_service' or 'privacy_policy'
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  paymentTransactions: many(paymentTransactions),
  refundedPayments: many(paymentTransactions, { relationName: "refundedPayments" }),
  tags: many(userTags),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one, many }) => ({
  user: one(users, {
    fields: [mediaFiles.userId],
    references: [users.id],
  }),
  tags: many(mediaFileTags),
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

// Additional relations for new tables
export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  pricingTier: one(pricingTiers, {
    fields: [userSubscriptions.pricingTierId],
    references: [pricingTiers.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
  tier: one(pricingTiers, {
    fields: [paymentTransactions.tierId],
    references: [pricingTiers.id],
  }),
  refundedByUser: one(users, {
    fields: [paymentTransactions.refundedBy],
    references: [users.id],
  }),
  refunds: many(paymentRefunds),
}));

export const paymentRefundsRelations = relations(paymentRefunds, ({ one }) => ({
  transaction: one(paymentTransactions, {
    fields: [paymentRefunds.transactionId],
    references: [paymentTransactions.id],
  }),
  processedBy: one(users, {
    fields: [paymentRefunds.processedBy],
    references: [users.id],
  }),
}));

export const userRepresentationRelations = relations(userRepresentation, ({ one }) => ({
  user: one(users, {
    fields: [userRepresentation.userId],
    references: [users.id],
  }),
}));



export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  participants: many(chatRoomParticipants),
  messages: many(chatMessages),
}));

export const chatRoomParticipantsRelations = relations(chatRoomParticipants, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatRoomParticipants.chatRoomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatRoomParticipants.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatMessages.chatRoomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const jobMatchesRelations = relations(jobMatches, ({ one }) => ({
  job: one(jobs, {
    fields: [jobMatches.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobMatches.userId],
    references: [users.id],
  }),
}));

export const aiGeneratedContentRelations = relations(aiGeneratedContent, ({ one }) => ({
  user: one(users, {
    fields: [aiGeneratedContent.userId],
    references: [users.id],
  }),
}));

export const mediaProcessingQueueRelations = relations(mediaProcessingQueue, ({ one }) => ({
  mediaFile: one(mediaFiles, {
    fields: [mediaProcessingQueue.mediaFileId],
    references: [mediaFiles.id],
  }),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const meetingRequestsRelations = relations(meetingRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [meetingRequests.fromUserId],
    references: [users.id],
    relationName: "sentMeetingRequests",
  }),
  toUser: one(users, {
    fields: [meetingRequests.toUserId],
    references: [users.id],
    relationName: "receivedMeetingRequests",
  }),
}));

export const seoImagesRelations = relations(seoImages, ({ one }) => ({
  creator: one(users, {
    fields: [seoImages.createdBy],
    references: [users.id],
  }),
}));

export const profileSharingRelations = relations(profileSharing, ({ one }) => ({
  user: one(users, {
    fields: [profileSharing.userId],
    references: [users.id],
  }),
}));

export const adminSettingsRelations = relations(adminSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [adminSettings.updatedBy],
    references: [users.id],
  }),
}));

export const userTagsRelations = relations(userTags, ({ one, many }) => ({
  user: one(users, {
    fields: [userTags.userId],
    references: [users.id],
  }),
  mediaFiles: many(mediaFileTags),
}));

export const mediaFileTagsRelations = relations(mediaFileTags, ({ one }) => ({
  mediaFile: one(mediaFiles, {
    fields: [mediaFileTags.mediaFileId],
    references: [mediaFiles.id],
  }),
  tag: one(userTags, {
    fields: [mediaFileTags.tagId],
    references: [userTags.id],
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

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertMediaUploadSchema = createInsertSchema(mediaUploads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAvailabilitySchema = createInsertSchema(userAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  submittedAt: true,
});



export const insertSkillEndorsementSchema = createInsertSchema(skillEndorsements).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new tables
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatRoomParticipantSchema = createInsertSchema(chatRoomParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertJobMatchSchema = createInsertSchema(jobMatches).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Email template types
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export const insertAiGeneratedContentSchema = createInsertSchema(aiGeneratedContent).omit({
  id: true,
  createdAt: true,
});

export const insertMediaProcessingQueueSchema = createInsertSchema(mediaProcessingQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertMeetingRequestSchema = createInsertSchema(meetingRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SEO related insert schemas
export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeoPageSchema = createInsertSchema(seoPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeoImageSchema = createInsertSchema(seoImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSharingSchema = createInsertSchema(profileSharing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Promo code insert schemas
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usedCount: true,
});

export const insertPromoCodeUsageSchema = createInsertSchema(promoCodeUsage).omit({
  id: true,
  usedAt: true,
});

// Additional type definitions for new tables
export type MeetingRequest = typeof meetingRequests.$inferSelect;
export type InsertMeetingRequest = z.infer<typeof insertMeetingRequestSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect;
export type InsertPromoCodeUsage = z.infer<typeof insertPromoCodeUsageSchema>;

// SEO related type definitions
export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoPage = typeof seoPages.$inferSelect;
export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoImage = typeof seoImages.$inferSelect;
export type InsertSeoImage = z.infer<typeof insertSeoImageSchema>;
export type ProfileSharing = typeof profileSharing.$inferSelect;
export type InsertProfileSharing = z.infer<typeof insertProfileSharingSchema>;

// Email campaign tables
export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'instant' or 'scheduled'
  status: varchar('status', { length: 50 }).notNull(), // 'draft', 'scheduled', 'sending', 'sent', 'failed'
  targetGroups: text('target_groups').array().notNull(),
  template: jsonb('template').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  sentCount: integer('sent_count').default(0),
  failedCount: integer('failed_count').default(0),
  totalTargets: integer('total_targets').default(0),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  creator: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id]
  })
}));

// Email campaign types
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns);

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;

// Insert schemas for social media features
export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalConnectionSchema = createInsertSchema(professionalConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPrivacySettingsSchema = createInsertSchema(userPrivacySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New enhanced features schemas
export const insertJobHistorySchema = createInsertSchema(jobHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserFeatureAccessSchema = createInsertSchema(userFeatureAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTagSchema = createInsertSchema(userTags).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserRepresentationSchema = createInsertSchema(userRepresentation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentRefundSchema = createInsertSchema(paymentRefunds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentAnalyticsSchema = createInsertSchema(paymentAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaFileTagSchema = createInsertSchema(mediaFileTags).omit({
  id: true,
  createdAt: true,
});

export const insertSocialInteractionSchema = createInsertSchema(socialInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserWithProfile = User & { profile?: UserProfile };
export type UserRepresentation = typeof userRepresentation.$inferSelect;
export type InsertUserRepresentation = z.infer<typeof insertUserRepresentationSchema>;
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
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AvailabilityCalendar = typeof availabilityCalendar.$inferSelect;
export type InsertAvailabilityCalendar = z.infer<typeof insertAvailabilityCalendarSchema>;
export type SkillEndorsement = typeof skillEndorsements.$inferSelect;
export type InsertSkillEndorsement = z.infer<typeof insertSkillEndorsementSchema>;
export type UserTag = typeof userTags.$inferSelect;
export type InsertUserTag = z.infer<typeof insertUserTagSchema>;
export type MediaFileTag = typeof mediaFileTags.$inferSelect;
export type InsertMediaFileTag = z.infer<typeof insertMediaFileTagSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentRefund = typeof paymentRefunds.$inferSelect;
export type InsertPaymentRefund = z.infer<typeof insertPaymentRefundSchema>;
export type PaymentAnalytics = typeof paymentAnalytics.$inferSelect;
export type InsertPaymentAnalytics = z.infer<typeof insertPaymentAnalyticsSchema>;

// Types for new tables
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoomParticipant = typeof chatRoomParticipants.$inferSelect;
export type InsertChatRoomParticipant = z.infer<typeof insertChatRoomParticipantSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type JobMatch = typeof jobMatches.$inferSelect;
export type InsertJobMatch = z.infer<typeof insertJobMatchSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type AiGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type InsertAiGeneratedContent = z.infer<typeof insertAiGeneratedContentSchema>;
export type MediaProcessingQueue = typeof mediaProcessingQueue.$inferSelect;
export type InsertMediaProcessingQueue = z.infer<typeof insertMediaProcessingQueueSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;



// Social media types
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type ProfessionalConnection = typeof professionalConnections.$inferSelect;
export type InsertProfessionalConnection = z.infer<typeof insertProfessionalConnectionSchema>;
export type UserPrivacySettings = typeof userPrivacySettings.$inferSelect;
export type InsertUserPrivacySettings = z.infer<typeof insertUserPrivacySettingsSchema>;

// New enhanced features types
export type JobHistory = typeof jobHistory.$inferSelect;
export type InsertJobHistory = z.infer<typeof insertJobHistorySchema>;
export type UserFeatureAccess = typeof userFeatureAccess.$inferSelect;
export type InsertUserFeatureAccess = z.infer<typeof insertUserFeatureAccessSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type SocialInteraction = typeof socialInteractions.$inferSelect;
export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;

// Legal documents types
export type LegalDocument = typeof legalDocuments.$inferSelect;
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
