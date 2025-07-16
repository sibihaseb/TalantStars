import {
  users,
  userProfiles,
  mediaFiles,
  jobs,
  jobApplications,
  messages,
  talentManagers,
  pricingTiers,
  profileQuestions,
  systemSettings,
  adminLogs,
  analytics,
  meetings,
  passwordResetTokens,
  rolePermissions,
  userPermissions,
  notifications,
  availabilityCalendar,
  skillEndorsements,
  userSubscriptions,
  chatRooms,
  chatMessages,
  jobMatches,
  aiGeneratedContent,
  verificationRequests,
  socialPosts,
  socialConnections,
  socialInteractions,
  jobHistory,
  userFeatureAccess,
  userPrivacySettings,
  professionalConnections,
  userRepresentation,
  promoCodes,
  promoCodeUsage,
  paymentTransactions,
  paymentRefunds,
  paymentAnalytics,
  jobCommunications,
  // talentCategories,
  // featuredTalents,
  // seoSettings,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type MediaFile,
  type InsertMediaFile,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type Message,
  type InsertMessage,
  type TalentManager,
  type PricingTier,
  type InsertPricingTier,
  type ProfileQuestion,
  type InsertProfileQuestion,
  type SystemSetting,
  type InsertSystemSetting,
  type AdminLog,
  type InsertAdminLog,
  type Analytics,
  type AvailabilityCalendar,
  type InsertAvailabilityCalendar,
  type InsertAnalytics,
  type Meeting,
  type InsertMeeting,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type RolePermission,
  type InsertRolePermission,
  type UserPermission,
  type InsertUserPermission,
  type Notification,
  type InsertNotification,
  type AvailabilityCalendar,
  type InsertAvailabilityCalendar,
  type SkillEndorsement,
  type InsertSkillEndorsement,
  type UserSubscription,
  type InsertUserSubscription,
  type UserRepresentation,
  type InsertUserRepresentation,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type JobMatch,
  type InsertJobMatch,
  type AiGeneratedContent,
  type InsertAiGeneratedContent,
  type VerificationRequest,
  type InsertVerificationRequest,
  type SocialPost,
  type InsertSocialPost,
  type SocialConnection,
  type InsertSocialConnection,
  type SocialInteraction,
  type InsertSocialInteraction,
  type JobHistory,
  type InsertJobHistory,
  type UserFeatureAccess,
  type InsertUserFeatureAccess,
  type UserPrivacySettings,
  type InsertUserPrivacySettings,
  type ProfessionalConnection,
  type InsertProfessionalConnection,
  type AdminSetting,
  type InsertAdminSetting,
  type MeetingRequest,
  type InsertMeetingRequest,
  type PromoCode,
  type InsertPromoCode,
  type PromoCodeUsage,
  type InsertPromoCodeUsage,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type PaymentRefund,
  type InsertPaymentRefund,
  type PaymentAnalytics,
  type InsertPaymentAnalytics,
  // type TalentCategory,
  // type InsertTalentCategory,
  // type FeaturedTalent,
  // type InsertFeaturedTalent,
  // type SeoSettings,
  // type InsertSeoSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, ilike, sql, ne } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string | number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfileImage(userId: string | number, imageUrl: string): Promise<User>;
  updateUserTier(userId: string | number, tierId: number): Promise<User>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Media operations
  createMediaFile(media: InsertMediaFile): Promise<MediaFile>;
  getUserMediaFiles(userId: string): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  updateMediaFile(id: number, media: Partial<InsertMediaFile>): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<void>;

  // Social media operations
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  getSocialPosts(userId: number, limit?: number, offset?: number): Promise<SocialPost[]>;
  getFeedPosts(userId: number, limit?: number, offset?: number): Promise<SocialPost[]>;
  getUserSocialPosts(userId: number): Promise<SocialPost[]>;
  likeSocialPost(postId: number, userId: number): Promise<void>;
  unlikeSocialPost(postId: number, userId: number): Promise<void>;
  commentOnPost(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: number): Promise<PostComment[]>;
  
  // Friend operations
  sendFriendRequest(requesterId: number, addresseeId: number): Promise<Friendship>;
  acceptFriendRequest(friendshipId: number): Promise<Friendship>;
  rejectFriendRequest(friendshipId: number): Promise<void>;
  getFriendRequests(userId: number): Promise<Friendship[]>;
  getFriends(userId: number): Promise<User[]>;
  searchUsers(query: string, currentUserId: number): Promise<User[]>;
  
  // Professional connections
  createProfessionalConnection(connection: InsertProfessionalConnection): Promise<ProfessionalConnection>;
  getProfessionalConnections(talentId: number): Promise<ProfessionalConnection[]>;
  updateProfessionalConnection(id: number, connection: Partial<InsertProfessionalConnection>): Promise<ProfessionalConnection>;
  
  // Privacy settings
  getUserPrivacySettings(userId: number): Promise<UserPrivacySettings>;
  updateUserPrivacySettings(userId: number, settings: Partial<InsertUserPrivacySettings>): Promise<UserPrivacySettings>;
  
  // Job history operations
  createJobHistory(jobHistory: InsertJobHistory): Promise<JobHistory>;
  getJobHistory(userId: number): Promise<JobHistory[]>;
  updateJobHistory(id: number, jobHistory: Partial<InsertJobHistory>): Promise<JobHistory>;
  deleteJobHistory(id: number): Promise<void>;
  
  // Social connections
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  getSocialConnections(userId: number): Promise<SocialConnection[]>;
  updateSocialConnection(id: number, connection: Partial<InsertSocialConnection>): Promise<SocialConnection>;
  
  // Social interactions
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  getSocialInteractions(postId: number): Promise<SocialInteraction[]>;
  
  // Feature access
  getUserFeatureAccess(userId: number): Promise<UserFeatureAccess[]>;
  updateUserFeatureAccess(userId: number, featureType: string, hasAccess: boolean): Promise<UserFeatureAccess>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: { talentType?: string; location?: string; status?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  // Job communications
  createJobCommunication(jobId: number, senderId: number, receiverId: number, message: string): Promise<any>;
  getJobCommunications(jobId: number): Promise<any[]>;
  markJobCommunicationAsRead(id: number): Promise<void>;
  
  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(jobId: number): Promise<JobApplication[]>;
  getUserJobApplications(userId: string): Promise<JobApplication[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]>;
  
  // Talent-Manager operations
  createTalentManagerRelation(talentId: string, managerId: string): Promise<TalentManager>;
  getTalentsByManager(managerId: string): Promise<User[]>;
  getManagersByTalent(talentId: string): Promise<User[]>;
  
  // Search operations
  searchTalents(query: string, filters?: { talentType?: string; location?: string }): Promise<UserProfile[]>;
  searchTalentsPublic(params: { query?: string; talentType?: string; location?: string; featured?: boolean }): Promise<UserProfile[]>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserVerification(userId: string, verified: boolean): Promise<UserProfile>;
  
  // Admin - Pricing Tiers
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  getPricingTiers(): Promise<PricingTier[]>;
  updatePricingTier(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier>;
  deletePricingTier(id: number): Promise<void>;
  
  // Admin - Profile Questions
  createProfileQuestion(question: InsertProfileQuestion): Promise<ProfileQuestion>;
  getProfileQuestions(): Promise<ProfileQuestion[]>;
  updateProfileQuestion(id: number, question: Partial<InsertProfileQuestion>): Promise<ProfileQuestion>;
  deleteProfileQuestion(id: number): Promise<void>;
  
  // Admin - System Settings
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string, updatedBy: string): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;
  
  // Admin - Logs
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  
  // Additional enhanced features
  // Chat operations
  createChatRoom(room: any): Promise<any>;
  getUserChatRooms(userId: string): Promise<any[]>;
  createChatMessage(message: any): Promise<any>;
  
  // Subscription operations
  createUserSubscription(subscription: any): Promise<any>;
  getUserSubscription(userId: string): Promise<any>;
  updateUserSubscriptionStatus(subscriptionId: string, status: string): Promise<any>;
  
  // Pricing tier operations
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  getAllPricingTiers(): Promise<PricingTier[]>;
  
  // Job matching operations
  createJobMatch(match: any): Promise<any>;
  getJobMatchesForUser(userId: string): Promise<any[]>;
  getTalentsByType(talentType: string): Promise<UserProfile[]>;
  
  // AI content operations
  createAiGeneratedContent(content: any): Promise<any>;
  
  // Verification operations
  getVerificationRequests(): Promise<any[]>;
  updateVerificationRequest(id: number, data: any): Promise<any>;
  
  // Email operations
  sendJobMatchNotification?(jobId: number, userId: string): Promise<boolean>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  
  // Admin - Analytics
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalytics(startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  getAnalyticsSummary(): Promise<{ event: string; count: number }[]>;
  
  // Meeting operations
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeetings(userId: string): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting>;
  deleteMeeting(id: number): Promise<void>;
  
  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  usePasswordResetToken(token: string): Promise<void>;
  
  // Role permissions
  createRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  getRolePermissions(role: string): Promise<RolePermission[]>;
  updateRolePermission(id: number, permission: Partial<InsertRolePermission>): Promise<RolePermission>;
  deleteRolePermission(id: number): Promise<void>;
  
  // User permissions
  createUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  updateUserPermission(id: number, permission: Partial<InsertUserPermission>): Promise<UserPermission>;
  deleteUserPermission(id: number): Promise<void>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Availability Calendar
  createAvailabilityEntry(entry: InsertAvailabilityCalendar): Promise<AvailabilityCalendar>;
  getUserAvailability(userId: string): Promise<AvailabilityCalendar[]>;
  getAvailabilityEntry(id: number): Promise<AvailabilityCalendar | undefined>;
  updateAvailabilityEntry(id: number, entry: Partial<InsertAvailabilityCalendar>): Promise<AvailabilityCalendar>;
  deleteAvailabilityEntry(id: number): Promise<void>;
  getUserAvailabilityEvents(userId: number): Promise<AvailabilityCalendar[]>;
  createAvailabilityEvent(eventData: InsertAvailabilityCalendar): Promise<AvailabilityCalendar>;
  updateAvailabilityEvent(eventId: number, userId: number, eventData: Partial<InsertAvailabilityCalendar>): Promise<AvailabilityCalendar | undefined>;
  deleteAvailabilityEvent(eventId: number, userId: number): Promise<void>;
  
  // AI Profile Enhancement
  enhanceProfileWithAI(userId: string, profile: UserProfile): Promise<UserProfile>;
  
  // Skill Endorsement operations
  createSkillEndorsement(endorsement: InsertSkillEndorsement): Promise<SkillEndorsement>;
  getSkillEndorsements(userId: string): Promise<SkillEndorsement[]>;
  getSkillEndorsementsBySkill(userId: string, skill: string): Promise<SkillEndorsement[]>;
  deleteSkillEndorsement(id: number): Promise<void>;
  hasUserEndorsedSkill(endorserId: string, endorsedUserId: string, skill: string): Promise<boolean>;

  // User limits management
  getUsersWithLimits(): Promise<any[]>;
  grantUserLimits(userId: string, limits: any, adminId: string): Promise<any>;
  revokeUserLimits(userId: string): Promise<void>;
  getUserLimits(userId: string): Promise<any | null>;
  
  // User Representation operations
  createUserRepresentation(representation: InsertUserRepresentation): Promise<UserRepresentation>;
  getUserRepresentations(userId: string): Promise<UserRepresentation[]>;
  getUserRepresentation(id: number): Promise<UserRepresentation | undefined>;
  updateUserRepresentation(id: number, representation: Partial<InsertUserRepresentation>): Promise<UserRepresentation>;
  deleteUserRepresentation(id: number): Promise<void>;
  
  // Pricing Tier operations
  getPricingTiers(): Promise<PricingTier[]>;
  getPricingTiersByRole(role: string): Promise<PricingTier[]>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  
  // Payment Transaction operations
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransactions(limit?: number, offset?: number): Promise<PaymentTransaction[]>;
  getPaymentTransaction(id: number): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionByStripeId(stripeId: string): Promise<PaymentTransaction | undefined>;
  getUserPaymentTransactions(userId: number): Promise<PaymentTransaction[]>;
  updatePaymentTransaction(id: number, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction>;
  updatePaymentTransactionStatus(id: number, status: string): Promise<PaymentTransaction>;
  
  // Payment Refund operations
  createPaymentRefund(refund: InsertPaymentRefund): Promise<PaymentRefund>;
  getPaymentRefunds(transactionId?: number): Promise<PaymentRefund[]>;
  getPaymentRefund(id: number): Promise<PaymentRefund | undefined>;
  updatePaymentRefund(id: number, refund: Partial<InsertPaymentRefund>): Promise<PaymentRefund>;
  
  // Payment Analytics operations
  getPaymentAnalytics(startDate?: Date, endDate?: Date): Promise<PaymentAnalytics[]>;
  createPaymentAnalytics(analytics: InsertPaymentAnalytics): Promise<PaymentAnalytics>;
  getPaymentAnalyticsSummary(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    refundRate: number;
    averageTransaction: number;
  }>;
  getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    period: string;
    revenue: number;
    transactions: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string | number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async updateUserProfileImage(userId: string | number, imageUrl: string): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          profileImageUrl: imageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user profile image:', error);
      throw error;
    }
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Media operations
  async createMediaFile(media: InsertMediaFile): Promise<MediaFile> {
    const [newMedia] = await db
      .insert(mediaFiles)
      .values(media)
      .returning();
    return newMedia;
  }

  async getUserMediaFiles(userId: string): Promise<MediaFile[]> {
    return await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.userId, userId))
      .orderBy(desc(mediaFiles.createdAt));
  }

  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    const [media] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));
    return media;
  }

  async updateMediaFile(id: number, media: Partial<InsertMediaFile>): Promise<MediaFile> {
    const [updatedMedia] = await db
      .update(mediaFiles)
      .set({ ...media, updatedAt: new Date() })
      .where(eq(mediaFiles.id, id))
      .returning();
    return updatedMedia;
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  }

  // Social media operations
  async createSocialPost(post: any): Promise<any> {
    const [newPost] = await db.execute(
      sql`INSERT INTO social_posts (user_id, content, privacy, media_urls) 
          VALUES (${post.userId}, ${post.content}, ${post.privacy}, ${post.mediaUrls}) 
          RETURNING *`
    );
    return newPost.rows[0];
  }

  async getSocialPosts(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM social_posts 
          WHERE user_id = ${userId} 
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows;
  }

  async getFeedPosts(userId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    // Get posts from friends and user's own posts
    const result = await db.execute(
      sql`SELECT sp.*, u.username, u.first_name, u.last_name 
          FROM social_posts sp 
          JOIN users u ON sp.user_id = u.id 
          WHERE sp.user_id = ${userId} 
             OR sp.privacy = 'public'
             OR sp.user_id IN (
               SELECT CASE 
                 WHEN user_id = ${userId} THEN friend_id 
                 ELSE user_id 
               END 
               FROM social_friendships 
               WHERE (user_id = ${userId} OR friend_id = ${userId}) 
                 AND status = 'accepted'
             )
          ORDER BY sp.created_at DESC 
          LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows;
  }

  async getUserSocialPosts(userId: number): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT sp.*, u.username, u.first_name, u.last_name 
          FROM social_posts sp 
          JOIN users u ON sp.user_id = u.id 
          WHERE sp.user_id = ${userId} 
          ORDER BY sp.created_at DESC`
    );
    return result.rows;
  }

  async likeSocialPost(postId: number, userId: number): Promise<void> {
    await db.execute(
      sql`INSERT INTO social_likes (post_id, user_id) VALUES (${postId}, ${userId})`
    );
  }

  async unlikeSocialPost(postId: number, userId: number): Promise<void> {
    await db.execute(
      sql`DELETE FROM social_likes WHERE post_id = ${postId} AND user_id = ${userId}`
    );
  }

  async commentOnPost(comment: any): Promise<any> {
    const result = await db.execute(
      sql`INSERT INTO social_comments (post_id, user_id, content) 
          VALUES (${comment.postId}, ${comment.userId}, ${comment.content}) 
          RETURNING *`
    );
    return result.rows[0];
  }

  async getPostComments(postId: number): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT sc.*, u.username, u.first_name, u.last_name 
          FROM social_comments sc 
          JOIN users u ON sc.user_id = u.id 
          WHERE sc.post_id = ${postId} 
          ORDER BY sc.created_at ASC`
    );
    return result.rows;
  }

  // Friend operations
  async sendFriendRequest(requesterId: number, addresseeId: number): Promise<any> {
    const result = await db.execute(
      sql`INSERT INTO social_friendships (user_id, friend_id, status) 
          VALUES (${requesterId}, ${addresseeId}, 'pending') 
          RETURNING *`
    );
    return result.rows[0];
  }

  async acceptFriendRequest(friendshipId: number): Promise<any> {
    const result = await db.execute(
      sql`UPDATE social_friendships 
          SET status = 'accepted' 
          WHERE id = ${friendshipId} 
          RETURNING *`
    );
    return result.rows[0];
  }

  async rejectFriendRequest(friendshipId: number): Promise<void> {
    await db.execute(
      sql`DELETE FROM social_friendships WHERE id = ${friendshipId}`
    );
  }

  async getFriendRequests(userId: number): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT sf.*, u.username, u.first_name, u.last_name 
          FROM social_friendships sf 
          JOIN users u ON sf.user_id = u.id 
          WHERE sf.friend_id = ${userId} AND sf.status = 'pending' 
          ORDER BY sf.created_at DESC`
    );
    return result.rows;
  }

  async getFriends(userId: number): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT u.* 
          FROM users u 
          JOIN social_friendships sf ON (
            (sf.user_id = ${userId} AND sf.friend_id = u.id) OR 
            (sf.friend_id = ${userId} AND sf.user_id = u.id)
          ) 
          WHERE sf.status = 'accepted'`
    );
    return result.rows;
  }

  async searchUsers(query: string, currentUserId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`)
        ),
        // Exclude current user from search results
        ne(users.id, currentUserId)
      ))
      .limit(20);
  }

  // Professional connections
  async createProfessionalConnection(connection: InsertProfessionalConnection): Promise<ProfessionalConnection> {
    const [newConnection] = await db
      .insert(professionalConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async getProfessionalConnections(talentId: number): Promise<ProfessionalConnection[]> {
    return await db
      .select()
      .from(professionalConnections)
      .where(eq(professionalConnections.talentId, talentId))
      .orderBy(desc(professionalConnections.createdAt));
  }

  async updateProfessionalConnection(id: number, connection: Partial<InsertProfessionalConnection>): Promise<ProfessionalConnection> {
    const [updatedConnection] = await db
      .update(professionalConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(professionalConnections.id, id))
      .returning();
    return updatedConnection;
  }

  // Privacy settings
  async getUserPrivacySettings(userId: number): Promise<UserPrivacySettings> {
    const [settings] = await db
      .select()
      .from(userPrivacySettings)
      .where(eq(userPrivacySettings.userId, userId));
    
    if (!settings) {
      // Create default privacy settings if none exist
      const [newSettings] = await db
        .insert(userPrivacySettings)
        .values({ userId })
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateUserPrivacySettings(userId: number, settings: Partial<InsertUserPrivacySettings>): Promise<UserPrivacySettings> {
    const [updatedSettings] = await db
      .update(userPrivacySettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(userPrivacySettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return newJob;
  }

  async getJobs(filters?: { talentType?: string; location?: string; status?: string }): Promise<Job[]> {
    const conditions = [];
    if (filters?.talentType) {
      conditions.push(eq(jobs.talentType, filters.talentType as any));
    }
    if (filters?.location) {
      conditions.push(like(jobs.location, `%${filters.location}%`));
    }
    if (filters?.status) {
      conditions.push(eq(jobs.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(jobs)
        .where(and(...conditions))
        .orderBy(desc(jobs.createdAt));
    }
    
    return await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id));
    return job;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Job communications
  async createJobCommunication(jobId: number, senderId: number, receiverId: number, message: string): Promise<any> {
    const [newCommunication] = await db
      .insert(jobCommunications)
      .values({
        jobId,
        senderId,
        receiverId,
        message,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();
    return newCommunication;
  }

  async getJobCommunications(jobId: number): Promise<any[]> {
    return await db
      .select({
        id: jobCommunications.id,
        jobId: jobCommunications.jobId,
        senderId: jobCommunications.senderId,
        receiverId: jobCommunications.receiverId,
        message: jobCommunications.message,
        isRead: jobCommunications.isRead,
        createdAt: jobCommunications.createdAt,
        senderName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('senderName'),
        senderImage: users.profileImageUrl,
      })
      .from(jobCommunications)
      .leftJoin(users, eq(jobCommunications.senderId, users.id))
      .where(eq(jobCommunications.jobId, jobId))
      .orderBy(asc(jobCommunications.createdAt));
  }

  async markJobCommunicationAsRead(id: number): Promise<void> {
    await db
      .update(jobCommunications)
      .set({ isRead: true })
      .where(eq(jobCommunications.id, id));
  }

  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getJobApplications(jobId: number): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getUserJobApplications(userId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.createdAt));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async getUserConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]> {
    // This is a simplified implementation - in production, you'd want to optimize this query
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversationMap = new Map<string, Message>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, message);
      }
    }

    const conversations = [];
    for (const [otherUserId, lastMessage] of Array.from(conversationMap.entries())) {
      const user = await this.getUser(otherUserId);
      if (user) {
        conversations.push({ user, lastMessage });
      }
    }

    return conversations;
  }

  // Talent-Manager operations
  async createTalentManagerRelation(talentId: string, managerId: string): Promise<TalentManager> {
    const [relation] = await db
      .insert(talentManagers)
      .values({ talentId, managerId })
      .returning();
    return relation;
  }

  async getTalentsByManager(managerId: string): Promise<User[]> {
    const talents = await db
      .select({ user: users })
      .from(talentManagers)
      .innerJoin(users, eq(talentManagers.talentId, users.id))
      .where(eq(talentManagers.managerId, managerId));
    
    return talents.map(t => t.user);
  }

  async getManagersByTalent(talentId: string): Promise<User[]> {
    const managers = await db
      .select({ user: users })
      .from(talentManagers)
      .innerJoin(users, eq(talentManagers.managerId, users.id))
      .where(eq(talentManagers.talentId, talentId));
    
    return managers.map(m => m.user);
  }

  // Search operations
  async searchTalents(query: string, filters?: { talentType?: string; location?: string }): Promise<UserProfile[]> {
    const conditions = [eq(userProfiles.role, "talent")];

    if (query) {
      conditions.push(
        or(
          ilike(userProfiles.displayName, `%${query}%`),
          ilike(userProfiles.bio, `%${query}%`)
        )!
      );
    }

    if (filters?.talentType) {
      conditions.push(eq(userProfiles.talentType, filters.talentType as any));
    }

    if (filters?.location) {
      conditions.push(ilike(userProfiles.location, `%${filters.location}%`));
    }

    return await db
      .select()
      .from(userProfiles)
      .where(and(...conditions))
      .orderBy(desc(userProfiles.isVerified), desc(userProfiles.updatedAt));
  }

  async searchTalentsPublic(params: { query?: string; talentType?: string; location?: string; featured?: boolean }): Promise<UserProfile[]> {
    const conditions = [eq(userProfiles.role, "talent")];

    if (params.query) {
      conditions.push(
        or(
          ilike(userProfiles.displayName, `%${params.query}%`),
          ilike(userProfiles.bio, `%${params.query}%`)
        )!
      );
    }

    if (params.talentType) {
      conditions.push(eq(userProfiles.talentType, params.talentType as any));
    }

    if (params.location) {
      conditions.push(ilike(userProfiles.location, `%${params.location}%`));
    }

    // Skip featured filter for now
    // if (params.featured) {
    //   conditions.push(eq(userProfiles.isFeatured, true));
    // }

    return await db
      .select()
      .from(userProfiles)
      .where(and(...conditions))
      .orderBy(
        desc(userProfiles.isVerified),
        desc(userProfiles.updatedAt)
      );
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId));
    
    return result.map(row => ({
      ...row.users,
      profile: row.user_profiles
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    // Update the role in the user profile, not the users table
    await db
      .update(userProfiles)
      .set({ role: role as any })
      .where(eq(userProfiles.userId, userId));
    
    // Return the updated user
    const user = await this.getUser(userId);
    return user!;
  }

  async updateUserTier(userId: string | number, tierId: number): Promise<User> {
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    
    // Update the pricing tier in the users table
    await db
      .update(users)
      .set({ pricingTierId: tierId })
      .where(eq(users.id, userIdNum));
    
    // Return the updated user
    const user = await this.getUser(userIdNum);
    return user!;
  }

  async updateUserVerification(userId: string, verified: boolean): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ isVerified: verified })
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    return profile;
  }

  // Admin - Pricing Tiers
  async createPricingTier(tier: InsertPricingTier): Promise<PricingTier> {
    const [pricingTier] = await db.insert(pricingTiers).values(tier).returning();
    return pricingTier;
  }

  async getPricingTiers(): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers).orderBy(asc(pricingTiers.price));
  }

  async updatePricingTier(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier> {
    const [pricingTier] = await db
      .update(pricingTiers)
      .set({ ...tier, updatedAt: new Date() })
      .where(eq(pricingTiers.id, id))
      .returning();
    return pricingTier;
  }

  async deletePricingTier(id: number): Promise<void> {
    await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
  }

  // Admin - Profile Questions
  async createProfileQuestion(question: InsertProfileQuestion): Promise<ProfileQuestion> {
    const [profileQuestion] = await db.insert(profileQuestions).values(question).returning();
    return profileQuestion;
  }

  async getProfileQuestions(): Promise<ProfileQuestion[]> {
    return await db.select().from(profileQuestions).orderBy(asc(profileQuestions.talentType), asc(profileQuestions.order));
  }

  async updateProfileQuestion(id: number, question: Partial<InsertProfileQuestion>): Promise<ProfileQuestion> {
    const [profileQuestion] = await db
      .update(profileQuestions)
      .set({ ...question, updatedAt: new Date() })
      .where(eq(profileQuestions.id, id))
      .returning();
    return profileQuestion;
  }

  async deleteProfileQuestion(id: number): Promise<void> {
    await db.delete(profileQuestions).where(eq(profileQuestions.id, id));
  }

  // Admin - System Settings
  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [systemSetting] = await db.insert(systemSettings).values(setting).returning();
    return systemSetting;
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(asc(systemSettings.category), asc(systemSettings.key));
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(key: string, value: string, updatedBy: string): Promise<SystemSetting> {
    const [setting] = await db
      .update(systemSettings)
      .set({ value, updatedBy, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return setting;
  }

  async deleteSystemSetting(key: string): Promise<void> {
    await db.delete(systemSettings).where(eq(systemSettings.key, key));
  }

  // Admin - Logs
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [adminLog] = await db.insert(adminLogs).values(log).returning();
    return adminLog;
  }

  async getAdminLogs(limit = 100): Promise<AdminLog[]> {
    return await db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(limit);
  }

  // Calendar/Availability Event methods
  async getUserAvailabilityEvents(userId: number): Promise<AvailabilityCalendar[]> {
    const events = await db
      .select()
      .from(availabilityCalendar)
      .where(eq(availabilityCalendar.userId, userId))
      .orderBy(desc(availabilityCalendar.startDateTime));
    return events;
  }

  async createAvailabilityEvent(eventData: InsertAvailabilityCalendar): Promise<AvailabilityCalendar> {
    const [event] = await db.insert(availabilityCalendar).values(eventData).returning();
    return event;
  }

  async updateAvailabilityEvent(eventId: number, userId: number, eventData: Partial<InsertAvailabilityCalendar>): Promise<AvailabilityCalendar | undefined> {
    const [event] = await db
      .update(availabilityCalendar)
      .set(eventData)
      .where(and(eq(availabilityCalendar.id, eventId), eq(availabilityCalendar.userId, userId)))
      .returning();
    return event;
  }

  async deleteAvailabilityEvent(eventId: number, userId: number): Promise<void> {
    await db
      .delete(availabilityCalendar)
      .where(and(eq(availabilityCalendar.id, eventId), eq(availabilityCalendar.userId, userId)));
  }

  // Admin - Analytics
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [analytics] = await db.insert(analytics).values(analyticsData).returning();
    return analytics;
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    let query = db.select().from(analytics);
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(analytics.createdAt, startDate),
        eq(analytics.createdAt, endDate)
      ));
    }
    
    return await query.orderBy(desc(analytics.createdAt));
  }

  async getAnalyticsSummary(): Promise<{ event: string; count: number }[]> {
    const result = await db
      .select({
        event: analytics.event,
        count: analytics.event
      })
      .from(analytics);
    
    // Group by event and count
    const eventCounts: { [key: string]: number } = {};
    result.forEach(row => {
      eventCounts[row.event] = (eventCounts[row.event] || 0) + 1;
    });
    
    return Object.entries(eventCounts).map(([event, count]) => ({ event, count }));
  }

  // Meeting operations
  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [result] = await db.insert(meetings).values(meeting).returning();
    return result;
  }

  async getMeetings(userId: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(or(eq(meetings.organizerId, userId), eq(meetings.attendeeId, userId)))
      .orderBy(desc(meetings.meetingDate));
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [result] = await db.select().from(meetings).where(eq(meetings.id, id));
    return result;
  }

  async updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting> {
    const [result] = await db.update(meetings)
      .set({ ...meeting, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return result;
  }

  async deleteMeeting(id: number): Promise<void> {
    await db.delete(meetings).where(eq(meetings.id, id));
  }

  // Featured talent management
  async getFeaturedTalents(): Promise<any[]> {
    const result = await db.select({
      id: userProfiles.id,
      userId: userProfiles.userId,
      displayName: userProfiles.displayName,
      talentType: userProfiles.talentType,
      profileImageUrl: users.profileImageUrl,
      isFeatured: userProfiles.isFeatured,
      featuredAt: userProfiles.featuredAt,
      featuredTier: userProfiles.featuredTier,
      profileViews: userProfiles.profileViews,
      user: {
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.id))
    .where(eq(userProfiles.isFeatured, true))
    .orderBy(desc(userProfiles.featuredAt));
    
    return result;
  }

  async getAllTalentProfiles(): Promise<any[]> {
    const result = await db.select({
      id: userProfiles.id,
      userId: userProfiles.userId,
      displayName: userProfiles.displayName,
      talentType: userProfiles.talentType,
      profileImageUrl: users.profileImageUrl,
      isFeatured: userProfiles.isFeatured,
      featuredAt: userProfiles.featuredAt,
      featuredTier: userProfiles.featuredTier,
      profileViews: userProfiles.profileViews,
      user: {
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.id))
    .where(eq(userProfiles.role, 'talent'))
    .orderBy(desc(userProfiles.createdAt));
    
    return result;
  }

  async toggleFeaturedStatus(userId: number, isFeatured: boolean, featuredTier?: string): Promise<any> {
    const updateData: any = {
      isFeatured,
      featuredAt: isFeatured ? new Date() : null,
      featuredTier: isFeatured ? featuredTier : null,
    };

    const [updatedProfile] = await db.update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }

  // Media limits and permissions
  async getUserMediaLimits(userId: number): Promise<any> {
    // Get user's current pricing tier (would need to be implemented)
    // For now, return default limits
    return {
      maxPhotos: 10,
      maxVideos: 5,
      maxAudioFiles: 3,
      maxStorageGB: 1,
      currentPhotos: 0,
      currentVideos: 0,
      currentAudioFiles: 0,
      currentStorageGB: 0,
    };
  }

  async checkMediaUploadPermission(userId: number, mediaType: string): Promise<boolean> {
    // Get user's current media count and limits
    const limits = await this.getUserMediaLimits(userId);
    
    switch (mediaType) {
      case 'image':
        return limits.currentPhotos < limits.maxPhotos || limits.maxPhotos === 0;
      case 'video':
        return limits.currentVideos < limits.maxVideos || limits.maxVideos === 0;
      case 'audio':
        return limits.currentAudioFiles < limits.maxAudioFiles || limits.maxAudioFiles === 0;
      default:
        return false;
    }
  }

  // Password reset operations
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [result] = await db.insert(passwordResetTokens).values(token).returning();
    return result;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [result] = await db.select().from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, false)));
    return result;
  }

  async usePasswordResetToken(token: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  // Role permissions
  async createRolePermission(permission: InsertRolePermission): Promise<RolePermission> {
    const [result] = await db.insert(rolePermissions).values(permission).returning();
    return result;
  }

  async getRolePermissions(role: string): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions)
      .where(eq(rolePermissions.role, role));
  }

  async updateRolePermission(id: number, permission: Partial<InsertRolePermission>): Promise<RolePermission> {
    const [result] = await db.update(rolePermissions)
      .set(permission)
      .where(eq(rolePermissions.id, id))
      .returning();
    return result;
  }

  async deleteRolePermission(id: number): Promise<void> {
    await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
  }

  // User permissions
  async createUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [result] = await db.insert(userPermissions).values(permission).returning();
    return result;
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return await db.select().from(userPermissions)
      .where(eq(userPermissions.userId, userId));
  }

  async updateUserPermission(id: number, permission: Partial<InsertUserPermission>): Promise<UserPermission> {
    const [result] = await db.update(userPermissions)
      .set(permission)
      .where(eq(userPermissions.id, id))
      .returning();
    return result;
  }

  async deleteUserPermission(id: number): Promise<void> {
    await db.delete(userPermissions).where(eq(userPermissions.id, id));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
  
  // Availability Calendar operations
  async createAvailabilityEntry(entry: InsertAvailabilityCalendar): Promise<AvailabilityCalendar> {
    const [result] = await db.insert(availabilityCalendar).values(entry).returning();
    return result;
  }
  
  async getUserAvailability(userId: string): Promise<AvailabilityCalendar[]> {
    return await db.select().from(availabilityCalendar).where(eq(availabilityCalendar.userId, userId)).orderBy(asc(availabilityCalendar.startDate));
  }
  
  async getAvailabilityEntry(id: number): Promise<AvailabilityCalendar | undefined> {
    const [result] = await db.select().from(availabilityCalendar).where(eq(availabilityCalendar.id, id));
    return result;
  }
  
  async updateAvailabilityEntry(id: number, entry: Partial<InsertAvailabilityCalendar>): Promise<AvailabilityCalendar> {
    const [result] = await db.update(availabilityCalendar)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(availabilityCalendar.id, id))
      .returning();
    return result;
  }
  
  async deleteAvailabilityEntry(id: number): Promise<void> {
    await db.delete(availabilityCalendar).where(eq(availabilityCalendar.id, id));
  }
  
  // AI Profile Enhancement
  async enhanceProfileWithAI(userId: string, profile: UserProfile): Promise<UserProfile> {
    const { enhanceProfileWithAI } = await import("./openai");
    const enhancedData = await enhanceProfileWithAI(profile);
    
    // Update profile with AI-enhanced content
    const updatedProfile = await this.updateUserProfile(userId, {
      bio: enhancedData.enhancedBio || profile.bio,
      resume: enhancedData.resumeEnhancement || profile.resume,
      skills: enhancedData.suggestedSkills || profile.skills,
    });
    
    return updatedProfile;
  }

  // Skill Endorsement operations
  async createSkillEndorsement(endorsement: InsertSkillEndorsement): Promise<SkillEndorsement> {
    const result = await db.insert(skillEndorsements)
      .values(endorsement)
      .returning();
    return result[0];
  }

  async getSkillEndorsements(userId: string): Promise<SkillEndorsement[]> {
    return await db.select()
      .from(skillEndorsements)
      .where(eq(skillEndorsements.endorsedUserId, userId))
      .orderBy(desc(skillEndorsements.createdAt));
  }

  async getSkillEndorsementsBySkill(userId: string, skill: string): Promise<SkillEndorsement[]> {
    return await db.select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.endorsedUserId, userId),
          eq(skillEndorsements.skill, skill)
        )
      )
      .orderBy(desc(skillEndorsements.createdAt));
  }

  async deleteSkillEndorsement(id: number): Promise<void> {
    await db.delete(skillEndorsements)
      .where(eq(skillEndorsements.id, id));
  }

  async hasUserEndorsedSkill(endorserId: string, endorsedUserId: string, skill: string): Promise<boolean> {
    const result = await db.select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.endorserId, endorserId),
          eq(skillEndorsements.endorsedUserId, endorsedUserId),
          eq(skillEndorsements.skill, skill)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  // Enhanced features implementations
  async createChatRoom(room: any): Promise<any> {
    const [result] = await db.insert(chatRooms).values(room).returning();
    return result;
  }

  async getUserChatRooms(userId: string): Promise<any[]> {
    return await db.select().from(chatRooms).where(eq(chatRooms.createdBy, userId));
  }

  async createChatMessage(message: any): Promise<any> {
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }

  async createUserSubscription(subscription: any): Promise<any> {
    const [result] = await db.insert(userSubscriptions).values(subscription).returning();
    return result;
  }

  async getUserSubscription(userId: string): Promise<any> {
    const [result] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
    return result;
  }

  async updateUserSubscriptionStatus(subscriptionId: string, status: string): Promise<any> {
    const [result] = await db.update(userSubscriptions)
      .set({ status, updatedAt: new Date() })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId))
      .returning();
    return result;
  }

  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    const [result] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
    return result;
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers).orderBy(asc(pricingTiers.price));
  }

  async createJobMatch(match: any): Promise<any> {
    const [result] = await db.insert(jobMatches).values(match).returning();
    return result;
  }

  async getJobMatchesForUser(userId: string): Promise<any[]> {
    return await db.select().from(jobMatches).where(eq(jobMatches.userId, userId));
  }

  async getTalentsByType(talentType: string): Promise<UserProfile[]> {
    return await db.select().from(userProfiles).where(eq(userProfiles.talentType, talentType));
  }

  async createAiGeneratedContent(content: any): Promise<any> {
    const [result] = await db.insert(aiGeneratedContent).values(content).returning();
    return result;
  }

  async getVerificationRequests(): Promise<any[]> {
    return await db.select().from(verificationRequests);
  }

  async updateVerificationRequest(id: number, data: any): Promise<any> {
    const [result] = await db.update(verificationRequests)
      .set(data)
      .where(eq(verificationRequests.id, id))
      .returning();
    return result;
  }

  async sendJobMatchNotification(jobId: number, userId: string): Promise<boolean> {
    // Implementation would go here
    return true;
  }

  // Job history operations
  async createJobHistory(jobHistoryData: InsertJobHistory): Promise<JobHistory> {
    const [result] = await db.insert(jobHistory).values(jobHistoryData).returning();
    return result;
  }

  async getJobHistory(userId: number): Promise<JobHistory[]> {
    return await db.select().from(jobHistory).where(eq(jobHistory.userId, userId)).orderBy(desc(jobHistory.startDate));
  }

  async updateJobHistory(id: number, jobHistoryUpdate: Partial<InsertJobHistory>): Promise<JobHistory> {
    const [result] = await db.update(jobHistory)
      .set({ ...jobHistoryUpdate, updatedAt: new Date() })
      .where(eq(jobHistory.id, id))
      .returning();
    return result;
  }

  async deleteJobHistory(id: number): Promise<void> {
    await db.delete(jobHistory).where(eq(jobHistory.id, id));
  }

  // Social connections
  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const [result] = await db.insert(socialConnections).values(connection).returning();
    return result;
  }

  async getSocialConnections(userId: number): Promise<SocialConnection[]> {
    return await db.select().from(socialConnections).where(eq(socialConnections.userId, userId));
  }

  async updateSocialConnection(id: number, connection: Partial<InsertSocialConnection>): Promise<SocialConnection> {
    const [result] = await db.update(socialConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(socialConnections.id, id))
      .returning();
    return result;
  }

  // Social interactions
  async createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction> {
    const [result] = await db.insert(socialInteractions).values(interaction).returning();
    return result;
  }

  async getSocialInteractions(postId: number): Promise<SocialInteraction[]> {
    return await db.select().from(socialInteractions).where(eq(socialInteractions.postId, postId));
  }

  // Feature access
  async getUserFeatureAccess(userId: number): Promise<UserFeatureAccess[]> {
    return await db.select().from(userFeatureAccess).where(eq(userFeatureAccess.userId, userId));
  }

  async updateUserFeatureAccess(userId: number, featureType: string, hasAccess: boolean): Promise<UserFeatureAccess> {
    const [existing] = await db.select().from(userFeatureAccess)
      .where(and(eq(userFeatureAccess.userId, userId), eq(userFeatureAccess.featureType, featureType)));
    
    if (existing) {
      const [result] = await db.update(userFeatureAccess)
        .set({ hasAccess, updatedAt: new Date() })
        .where(eq(userFeatureAccess.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(userFeatureAccess).values({
        userId,
        featureType,
        hasAccess,
      }).returning();
      return result;
    }
  }

  // Admin settings operations
  async createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const [result] = await db.insert(adminSettings).values(setting).returning();
    return result;
  }

  async getAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings).orderBy(asc(adminSettings.key));
  }

  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting;
  }

  async updateAdminSetting(key: string, value: string, updatedBy: string): Promise<AdminSetting> {
    const [existing] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    
    if (existing) {
      const [result] = await db.update(adminSettings)
        .set({ value, updatedBy, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(adminSettings).values({
        key,
        value,
        updatedBy,
      }).returning();
      return result;
    }
  }

  async deleteAdminSetting(key: string): Promise<void> {
    await db.delete(adminSettings).where(eq(adminSettings.key, key));
  }

  // Meeting request operations
  async createMeetingRequest(request: InsertMeetingRequest): Promise<MeetingRequest> {
    const [result] = await db.insert(meetingRequests).values(request).returning();
    return result;
  }

  async getMeetingRequests(userId: string): Promise<MeetingRequest[]> {
    return await db.select().from(meetingRequests)
      .where(or(eq(meetingRequests.fromUserId, userId), eq(meetingRequests.toUserId, userId)))
      .orderBy(desc(meetingRequests.createdAt));
  }

  async getMeetingRequest(id: number): Promise<MeetingRequest | undefined> {
    const [request] = await db.select().from(meetingRequests).where(eq(meetingRequests.id, id));
    return request;
  }

  async updateMeetingRequest(id: number, request: Partial<InsertMeetingRequest>): Promise<MeetingRequest> {
    const [result] = await db.update(meetingRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(meetingRequests.id, id))
      .returning();
    return result;
  }

  async deleteMeetingRequest(id: number): Promise<void> {
    await db.delete(meetingRequests).where(eq(meetingRequests.id, id));
  }

  // Calendar operations
  async createAvailabilityCalendar(calendar: InsertAvailabilityCalendar): Promise<AvailabilityCalendar> {
    const [result] = await db.insert(availabilityCalendar).values(calendar).returning();
    return result;
  }

  async getAvailabilityCalendar(userId: string): Promise<AvailabilityCalendar[]> {
    return await db.select().from(availabilityCalendar)
      .where(eq(availabilityCalendar.userId, userId))
      .orderBy(asc(availabilityCalendar.startDate));
  }

  async updateAvailabilityCalendar(id: number, calendar: Partial<InsertAvailabilityCalendar>): Promise<AvailabilityCalendar> {
    const [result] = await db.update(availabilityCalendar)
      .set({ ...calendar, updatedAt: new Date() })
      .where(eq(availabilityCalendar.id, id))
      .returning();
    return result;
  }

  async deleteAvailabilityCalendar(id: number): Promise<void> {
    await db.delete(availabilityCalendar).where(eq(availabilityCalendar.id, id));
  }

  // Job History operations
  async createJobHistory(jobHistoryData: any): Promise<any> {
    // For now, we'll just return the data as job history isn't in our schema
    // In a real implementation, we'd add job history to the schema
    return { id: Date.now(), ...jobHistoryData, createdAt: new Date() };
  }

  async getJobHistory(userId: string): Promise<any[]> {
    // For now, return empty array since job history isn't in our schema
    // In a real implementation, we'd query the job history table
    return [];
  }

  // User Representation operations
  async createUserRepresentation(representation: InsertUserRepresentation): Promise<UserRepresentation> {
    const [result] = await db.insert(userRepresentation)
      .values(representation)
      .returning();
    return result;
  }

  async getUserRepresentations(userId: string): Promise<UserRepresentation[]> {
    return await db.select().from(userRepresentation)
      .where(eq(userRepresentation.userId, Number(userId)))
      .orderBy(asc(userRepresentation.representationType));
  }

  async getUserRepresentation(id: number): Promise<UserRepresentation | undefined> {
    const [result] = await db.select().from(userRepresentation)
      .where(eq(userRepresentation.id, id));
    return result;
  }

  async updateUserRepresentation(id: number, representation: Partial<InsertUserRepresentation>): Promise<UserRepresentation> {
    const [result] = await db.update(userRepresentation)
      .set({ ...representation, updatedAt: new Date() })
      .where(eq(userRepresentation.id, id))
      .returning();
    return result;
  }

  async deleteUserRepresentation(id: number): Promise<void> {
    await db.delete(userRepresentation).where(eq(userRepresentation.id, id));
  }

  // Pricing Tier operations
  async getPricingTiers(): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers)
      .where(eq(pricingTiers.active, true))
      .orderBy(asc(pricingTiers.price));
  }

  async getPricingTiersByRole(role: string): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers)
      .where(and(eq(pricingTiers.active, true), eq(pricingTiers.category, role)))
      .orderBy(asc(pricingTiers.price));
  }

  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    const [result] = await db.select().from(pricingTiers)
      .where(eq(pricingTiers.id, id));
    return result;
  }

  // Promo code operations
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes)
      .orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [result] = await db.select().from(promoCodes)
      .where(eq(promoCodes.code, code));
    return result;
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    // Convert date strings to Date objects if they exist
    const insertData: any = { ...promoCode };
    if (insertData.startsAt && typeof insertData.startsAt === 'string') {
      insertData.startsAt = new Date(insertData.startsAt);
    }
    if (insertData.expiresAt && typeof insertData.expiresAt === 'string') {
      insertData.expiresAt = new Date(insertData.expiresAt);
    }
    
    const [result] = await db.insert(promoCodes)
      .values(insertData)
      .returning();
    return result;
  }

  async updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode> {
    // Convert date strings to Date objects if they exist
    const updateData: any = { ...promoCode };
    if (updateData.startsAt && typeof updateData.startsAt === 'string') {
      updateData.startsAt = new Date(updateData.startsAt);
    }
    if (updateData.expiresAt && typeof updateData.expiresAt === 'string') {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    updateData.updatedAt = new Date();
    
    const [result] = await db.update(promoCodes)
      .set(updateData)
      .where(eq(promoCodes.id, id))
      .returning();
    return result;
  }

  async deletePromoCode(id: number): Promise<void> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }

  async validatePromoCode(code: string, userId: number, tierId: number, planType: string): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
  }> {
    const promoCode = await this.getPromoCodeByCode(code);
    
    if (!promoCode) {
      return { valid: false, error: "Invalid promo code" };
    }

    if (!promoCode.active) {
      return { valid: false, error: "Promo code is no longer active" };
    }

    const now = new Date();
    if (promoCode.startsAt && promoCode.startsAt > now) {
      return { valid: false, error: "Promo code is not yet active" };
    }

    if (promoCode.expiresAt && promoCode.expiresAt < now) {
      return { valid: false, error: "Promo code has expired" };
    }

    // Check usage limits
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return { valid: false, error: "Promo code usage limit exceeded" };
    }

    // Check user usage limit
    const userUsage = await db.select().from(promoCodeUsage)
      .where(and(
        eq(promoCodeUsage.promoCodeId, promoCode.id),
        eq(promoCodeUsage.userId, userId)
      ));

    if (userUsage.length >= promoCode.maxUsesPerUser) {
      return { valid: false, error: "You have already used this promo code" };
    }

    // Check plan restrictions
    if (promoCode.planRestriction === "monthly_only" && planType !== "monthly") {
      return { valid: false, error: "This promo code is only valid for monthly plans" };
    }

    if (promoCode.planRestriction === "annual_only" && planType !== "annual") {
      return { valid: false, error: "This promo code is only valid for annual plans" };
    }

    if (promoCode.planRestriction === "specific_tier" && promoCode.specificTierId !== tierId) {
      return { valid: false, error: "This promo code is not valid for this tier" };
    }

    // Check category restrictions
    if (promoCode.categoryRestriction) {
      const tier = await this.getPricingTier(tierId);
      if (tier && tier.category !== promoCode.categoryRestriction) {
        return { valid: false, error: `This promo code is only valid for ${promoCode.categoryRestriction} users` };
      }
    }

    return { valid: true, promoCode };
  }

  async calculateDiscountAmount(promoCode: PromoCode, originalAmount: number): Promise<number> {
    switch (promoCode.type) {
      case "percentage":
        return Math.min(originalAmount * (Number(promoCode.value) / 100), originalAmount);
      case "fixed_amount":
        return Math.min(Number(promoCode.value), originalAmount);
      case "first_month_free":
        return originalAmount;
      case "first_month_discount":
        return Math.min(originalAmount * (Number(promoCode.value) / 100), originalAmount);
      default:
        return 0;
    }
  }

  async recordPromoCodeUsage(usage: InsertPromoCodeUsage): Promise<PromoCodeUsage> {
    const [result] = await db.insert(promoCodeUsage)
      .values(usage)
      .returning();

    // Update usage count
    await db.update(promoCodes)
      .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
      .where(eq(promoCodes.id, usage.promoCodeId));

    return result;
  }

  async getPromoCodeUsage(promoCodeId: number): Promise<PromoCodeUsage[]> {
    return await db.select().from(promoCodeUsage)
      .where(eq(promoCodeUsage.promoCodeId, promoCodeId))
      .orderBy(desc(promoCodeUsage.usedAt));
  }

  // Email campaigns methods
  async getEmailCampaigns() {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async createEmailCampaign(campaign: any) {
    const [newCampaign] = await db
      .insert(emailCampaigns)
      .values({
        ...campaign,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newCampaign;
  }

  async updateEmailCampaign(id: number, updates: any) {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteEmailCampaign(id: number) {
    await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
  }

  async updateEmailCampaignStatus(id: number, status: string, stats?: any) {
    const updates: any = { status, updatedAt: new Date() };
    if (stats) {
      updates.sentCount = stats.sentCount;
      updates.failedCount = stats.failedCount;
      updates.totalTargets = stats.totalTargets;
    }
    
    await db
      .update(emailCampaigns)
      .set(updates)
      .where(eq(emailCampaigns.id, id));
  }

  async getEmailTemplates() {
    return await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async createEmailTemplate(template: any) {
    const [newTemplate] = await db
      .insert(emailTemplates)
      .values({
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, updates: any) {
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number) {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  async getUsersByGroups(groups: string[]) {
    // Build query to get users based on target groups
    const baseQuery = db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.firstName,
      lastName: users.lastName
    }).from(users);

    if (groups.includes('all')) {
      return await baseQuery;
    }

    const conditions = [];
    
    if (groups.includes('talent')) {
      conditions.push(eq(users.role, 'talent'));
    }
    if (groups.includes('manager')) {
      conditions.push(eq(users.role, 'manager'));
    }
    if (groups.includes('producer')) {
      conditions.push(eq(users.role, 'producer'));
    }
    if (groups.includes('agent')) {
      conditions.push(eq(users.role, 'agent'));
    }
    
    if (conditions.length > 0) {
      return await baseQuery.where(or(...conditions));
    }

    return await baseQuery;
  }

  // Payment Transaction operations
  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [result] = await db.insert(paymentTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  async getPaymentTransactions(limit: number = 50, offset: number = 0): Promise<PaymentTransaction[]> {
    return await db.select()
      .from(paymentTransactions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getPaymentTransaction(id: number): Promise<PaymentTransaction | undefined> {
    const [result] = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, id));
    return result;
  }

  async getPaymentTransactionByStripeId(stripeId: string): Promise<PaymentTransaction | undefined> {
    const [result] = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.stripePaymentIntentId, stripeId));
    return result;
  }

  async getUserPaymentTransactions(userId: number): Promise<PaymentTransaction[]> {
    return await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async updatePaymentTransaction(id: number, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction> {
    const [result] = await db.update(paymentTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return result;
  }

  async updatePaymentTransactionStatus(id: number, status: string): Promise<PaymentTransaction> {
    const [result] = await db.update(paymentTransactions)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return result;
  }

  // Payment Refund operations
  async createPaymentRefund(refund: InsertPaymentRefund): Promise<PaymentRefund> {
    const [result] = await db.insert(paymentRefunds)
      .values(refund)
      .returning();
    return result;
  }

  async getPaymentRefunds(transactionId?: number): Promise<PaymentRefund[]> {
    const query = db.select().from(paymentRefunds);
    if (transactionId) {
      query.where(eq(paymentRefunds.transactionId, transactionId));
    }
    return await query.orderBy(desc(paymentRefunds.createdAt));
  }

  async getPaymentRefund(id: number): Promise<PaymentRefund | undefined> {
    const [result] = await db.select()
      .from(paymentRefunds)
      .where(eq(paymentRefunds.id, id));
    return result;
  }

  async updatePaymentRefund(id: number, refund: Partial<InsertPaymentRefund>): Promise<PaymentRefund> {
    const [result] = await db.update(paymentRefunds)
      .set({ ...refund, updatedAt: new Date() })
      .where(eq(paymentRefunds.id, id))
      .returning();
    return result;
  }

  // Payment Analytics operations
  async getPaymentAnalytics(startDate?: Date, endDate?: Date): Promise<PaymentAnalytics[]> {
    const query = db.select().from(paymentAnalytics);
    if (startDate && endDate) {
      query.where(and(
        eq(paymentAnalytics.date, startDate),
        eq(paymentAnalytics.date, endDate)
      ));
    }
    return await query.orderBy(desc(paymentAnalytics.date));
  }

  async createPaymentAnalytics(analytics: InsertPaymentAnalytics): Promise<PaymentAnalytics> {
    const [result] = await db.insert(paymentAnalytics)
      .values(analytics)
      .returning();
    return result;
  }

  async getPaymentAnalyticsSummary(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successRate: number;
    refundRate: number;
    averageTransaction: number;
  }> {
    const [summary] = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END), 0)`,
      totalTransactions: sql<number>`COUNT(*)`,
      successfulTransactions: sql<number>`COUNT(CASE WHEN status = 'succeeded' THEN 1 END)`,
      refundedTransactions: sql<number>`COUNT(CASE WHEN status = 'refunded' OR status = 'partially_refunded' THEN 1 END)`,
      averageTransaction: sql<number>`COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END), 0)`,
    }).from(paymentTransactions);

    const successRate = summary.totalTransactions > 0 ? (summary.successfulTransactions / summary.totalTransactions) * 100 : 0;
    const refundRate = summary.totalTransactions > 0 ? (summary.refundedTransactions / summary.totalTransactions) * 100 : 0;

    return {
      totalRevenue: Number(summary.totalRevenue),
      totalTransactions: summary.totalTransactions,
      successRate: Number(successRate.toFixed(2)),
      refundRate: Number(refundRate.toFixed(2)),
      averageTransaction: Number(summary.averageTransaction),
    };
  }

  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    period: string;
    revenue: number;
    transactions: number;
  }[]> {
    let dateFormat: string;
    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'monthly':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const results = await db.select({
      period: sql<string>`TO_CHAR(created_at, '${dateFormat}')`,
      revenue: sql<number>`SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END)`,
      transactions: sql<number>`COUNT(CASE WHEN status = 'succeeded' THEN 1 END)`,
    })
    .from(paymentTransactions)
    .groupBy(sql`TO_CHAR(created_at, '${dateFormat}')`)
    .orderBy(sql`TO_CHAR(created_at, '${dateFormat}') DESC`)
    .limit(30);

    return results.map(row => ({
      period: row.period,
      revenue: Number(row.revenue),
      transactions: row.transactions,
    }));
  }

  // Featured Talents methods - temporarily commented out until tables are created
  /*
  async getFeaturedTalents(): Promise<any[]> {
    const results = await db.select({
      id: featuredTalents.id,
      userId: featuredTalents.userId,
      categoryId: featuredTalents.categoryId,
      featuredReason: featuredTalents.featuredReason,
      displayOrder: featuredTalents.displayOrder,
      isActive: featuredTalents.isActive,
      username: users.username,
      fullName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      profileImage: users.profileImageUrl,
      talentType: userProfiles.talentType,
      location: userProfiles.location,
      verificationStatus: sql<string>`CASE WHEN ${userProfiles.isVerified} THEN 'verified' ELSE 'unverified' END`,
      skills: userProfiles.skills,
      bio: userProfiles.bio,
      rating: sql<number>`COALESCE(${userProfiles.profileViews}, 0) * 0.01 + 4.0`,
      category: talentCategories.name,
    })
    .from(featuredTalents)
    .leftJoin(users, eq(featuredTalents.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(talentCategories, eq(featuredTalents.categoryId, talentCategories.id))
    .where(eq(featuredTalents.isActive, true))
    .orderBy(featuredTalents.displayOrder);

    return results;
  }

  async createFeaturedTalent(data: InsertFeaturedTalent): Promise<FeaturedTalent> {
    const [result] = await db.insert(featuredTalents).values(data).returning();
    return result;
  }

  async updateFeaturedTalent(id: number, data: Partial<InsertFeaturedTalent>): Promise<FeaturedTalent> {
    const [result] = await db.update(featuredTalents)
      .set(data)
      .where(eq(featuredTalents.id, id))
      .returning();
    return result;
  }

  async deleteFeaturedTalent(id: number): Promise<void> {
    await db.delete(featuredTalents).where(eq(featuredTalents.id, id));
  }

  // Talent Categories methods
  async getTalentCategories(): Promise<any[]> {
    const results = await db.select({
      id: talentCategories.id,
      name: talentCategories.name,
      description: talentCategories.description,
      icon: talentCategories.icon,
      color: talentCategories.color,
      isActive: talentCategories.isActive,
      talentCount: sql<number>`COALESCE(COUNT(${featuredTalents.id}), 0)`,
      createdAt: talentCategories.createdAt,
      updatedAt: talentCategories.updatedAt,
    })
    .from(talentCategories)
    .leftJoin(featuredTalents, eq(talentCategories.id, featuredTalents.categoryId))
    .groupBy(talentCategories.id);

    return results;
  }

  async createTalentCategory(data: InsertTalentCategory): Promise<TalentCategory> {
    const [result] = await db.insert(talentCategories).values(data).returning();
    return result;
  }

  async updateTalentCategory(id: number, data: Partial<InsertTalentCategory>): Promise<TalentCategory> {
    const [result] = await db.update(talentCategories)
      .set(data)
      .where(eq(talentCategories.id, id))
      .returning();
    return result;
  }

  async deleteTalentCategory(id: number): Promise<void> {
    await db.delete(talentCategories).where(eq(talentCategories.id, id));
  }

  // SEO Settings methods
  async getSEOSettings(): Promise<SeoSettings[]> {
    const results = await db.select().from(seoSettings);
    return results;
  }

  async createOrUpdateSEOSettings(data: InsertSeoSettings): Promise<SeoSettings> {
    // Try to update existing record first
    const existing = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, data.pagePath));
    
    if (existing.length > 0) {
      const [result] = await db.update(seoSettings)
        .set(data)
        .where(eq(seoSettings.pagePath, data.pagePath))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(seoSettings).values(data).returning();
      return result;
    }
  }

  async generateSEOContent(pagePath: string): Promise<any> {
    // Generate SEO content based on page path
    const siteName = "Talents & Stars";
    const baseDescription = "Discover exceptional talent in the entertainment industry. Connect with actors, musicians, voice artists, models, and more on our AI-powered platform.";
    
    const pageInfo = {
      '/': { name: 'Home', description: 'Entertainment talent platform connecting artists with opportunities' },
      '/featured-talents': { name: 'Featured Talents', description: 'Showcase of exceptional featured talents' },
      '/browse-talents': { name: 'Browse Talents', description: 'Discover and connect with talented performers' },
      '/jobs': { name: 'Jobs & Opportunities', description: 'Find casting calls and entertainment industry jobs' },
      '/about': { name: 'About Us', description: 'Learn about our mission to connect talent with opportunity' },
      '/contact': { name: 'Contact', description: 'Get in touch with our team' },
      '/pricing': { name: 'Pricing', description: 'Flexible pricing plans for talent and industry professionals' },
      '/auth': { name: 'Authentication', description: 'Join our community of entertainment professionals' }
    };

    const page = pageInfo[pagePath] || { name: 'Page', description: baseDescription };

    return {
      pageTitle: `${page.name} | ${siteName}`,
      metaDescription: `${page.description} - ${baseDescription}`,
      metaKeywords: ['talent', 'entertainment', 'actors', 'musicians', 'voice artists', 'models', 'casting', 'auditions', 'jobs', 'portfolio'],
      ogTitle: `${page.name} | ${siteName}`,
      ogDescription: `${page.description} - ${baseDescription}`,
      ogImage: '/og-image.jpg',
      twitterTitle: `${page.name} | ${siteName}`,
      twitterDescription: `${page.description} - ${baseDescription}`,
      twitterImage: '/twitter-image.jpg',
      favicon: '/favicon.ico',
      robots: 'index, follow',
      canonicalUrl: `https://talents-stars.com${pagePath}`,
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": `https://talents-stars.com${pagePath}`,
        "description": baseDescription
      }, null, 2),
      isActive: true,
      pagePath: pagePath
    };
  }

  async getSEOAnalytics(): Promise<any> {
    return {
      searchRanking: 15.2,
      organicTraffic: 1234,
      keywords: 89,
      pageSpeed: 92
    };
  }
  */

  // User limits management
  async getUsersWithLimits(): Promise<any[]> {
    const users = await this.getAllUsers();
    return users.map(user => ({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      profileImage: user.profileImageUrl,
      role: user.role,
      pricingTier: user.pricingTierId ? `Tier ${user.pricingTierId}` : 'Free',
      currentUsage: {
        photos: Math.floor(Math.random() * 10), // Mock usage data
        videos: Math.floor(Math.random() * 5),
        audio: Math.floor(Math.random() * 5),
        externalLinks: Math.floor(Math.random() * 3),
        storage: Math.floor(Math.random() * 100)
      }
    }));
  }

  async grantUserLimits(userId: string, limits: any, adminId: string): Promise<any> {
    // TODO: Implement when database tables are created
    // For now, return mock success
    return {
      id: Date.now(),
      userId,
      ...limits,
      grantedBy: adminId,
      grantedAt: new Date().toISOString(),
      customLimits: true
    };
  }

  async revokeUserLimits(userId: string): Promise<void> {
    // TODO: Implement when database tables are created
    // For now, just log the action
    console.log(`Revoking limits for user ${userId}`);
  }

  async getUserLimits(userId: string): Promise<any | null> {
    // TODO: Implement when database tables are created
    return null;
  }
}

export const storage = new DatabaseStorage();
