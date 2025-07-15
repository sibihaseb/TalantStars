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
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
  type Friendship,
  type InsertFriendship,
  type ProfessionalConnection,
  type InsertProfessionalConnection,
  type UserPrivacySettings,
  type InsertUserPrivacySettings,
  socialPosts,
  postLikes,
  postComments,
  friendships,
  professionalConnections,
  userPrivacySettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, ilike, sql, ne } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string | number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: { talentType?: string; location?: string; status?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
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
  
  // AI Profile Enhancement
  enhanceProfileWithAI(userId: string, profile: UserProfile): Promise<UserProfile>;
  
  // Skill Endorsement operations
  createSkillEndorsement(endorsement: InsertSkillEndorsement): Promise<SkillEndorsement>;
  getSkillEndorsements(userId: string): Promise<SkillEndorsement[]>;
  getSkillEndorsementsBySkill(userId: string, skill: string): Promise<SkillEndorsement[]>;
  deleteSkillEndorsement(id: number): Promise<void>;
  hasUserEndorsedSkill(endorserId: string, endorsedUserId: string, skill: string): Promise<boolean>;
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
      .orderBy(desc(userProfiles.profileViews));
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
}

export const storage = new DatabaseStorage();
