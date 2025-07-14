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
  userPermissions,
  notifications,
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
  type UserPermission,
  type InsertUserPermission,
  type Notification,
  type InsertNotification,
  type AvailabilityCalendar,
  type InsertAvailabilityCalendar,
  availabilityCalendar,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Media operations
  createMediaFile(media: InsertMediaFile): Promise<MediaFile>;
  getUserMediaFiles(userId: string): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  deleteMediaFile(id: number): Promise<void>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
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

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
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
}

export const storage = new DatabaseStorage();
