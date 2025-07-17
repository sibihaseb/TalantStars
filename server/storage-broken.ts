import { eq, like, desc, asc, and, or, gte, lte } from 'drizzle-orm';
import { db } from './db';
import {
  users,
  userProfiles,
  mediaFiles,
  userTags,
  mediaFileTags,
  socialPosts,
  availabilityCalendar,
  skillEndorsements,
  jobs,
  jobApplications,
  jobHistory,
  socialConnections,
  socialInteractions,
  userFeatureAccess,
  pricingTiers,
  userTier,
  notifications,
  messages,
  chatRooms,
  userChatRooms,
  chatMessages,
  meetings,
  professionalConnections,
  userPrivacySettings,
  passwordResetTokens,
  rolePermissions,
  userPermissions,
  analytics,
  paymentTransactions,
  paymentRefunds,
  paymentAnalytics,
  promoCodes,
  promoCodeUsage,
  questions,
  questionOptions,
  userAnswers,
  legalDocuments,
  userLegalAcceptance,
  systemSettings,
  adminLogs,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type MediaFile,
  type InsertMediaFile,
  type UserTag,
  type InsertUserTag,
  type MediaFileTag,
  type InsertMediaFileTag,
  type SocialPost,
  type InsertSocialPost,
  type AvailabilityCalendar,
  type InsertAvailabilityCalendar,
  type SkillEndorsement,
  type InsertSkillEndorsement,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type JobHistory,
  type InsertJobHistory,
  type SocialConnection,
  type InsertSocialConnection,
  type SocialInteraction,
  type InsertSocialInteraction,
  type UserFeatureAccess,
  type InsertUserFeatureAccess,
  type PricingTier,
  type InsertPricingTier,
  type UserTier,
  type InsertUserTier,
  type Notification,
  type InsertNotification,
  type Message,
  type InsertMessage,
  type ChatRoom,
  type InsertChatRoom,
  type UserChatRoom,
  type InsertUserChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type Meeting,
  type InsertMeeting,
  type ProfessionalConnection,
  type InsertProfessionalConnection,
  type UserPrivacySettings,
  type InsertUserPrivacySettings,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type RolePermission,
  type InsertRolePermission,
  type UserPermission,
  type InsertUserPermission,
  type Analytics,
  type InsertAnalytics,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type PaymentRefund,
  type InsertPaymentRefund,
  type PaymentAnalytics,
  type InsertPaymentAnalytics,
  type PromoCode,
  type InsertPromoCode,
  type PromoCodeUsage,
  type InsertPromoCodeUsage,
  type Question,
  type InsertQuestion,
  type QuestionOption,
  type InsertQuestionOption,
  type UserAnswer,
  type InsertUserAnswer,
  type LegalDocument,
  type InsertLegalDocument,
  type UserLegalAcceptance,
  type InsertUserLegalAcceptance,
  type SystemSetting,
  type InsertSystemSetting,
  type AdminLog,
  type InsertAdminLog,
} from '../shared/schema';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  deleteUserProfile(userId: string): Promise<void>;
  
  // Media operations
  createMediaFile(media: InsertMediaFile): Promise<MediaFile>;
  getUserMediaFiles(userId: string): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  updateMediaFile(id: number, media: Partial<InsertMediaFile>): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<void>;
  
  // Social operations
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  getSocialPosts(userId: number, limit?: number, offset?: number): Promise<SocialPost[]>;
  getUserSocialPosts(userId: number): Promise<SocialPost[]>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: { talentType?: string; location?: string; status?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(jobId: number): Promise<JobApplication[]>;
  updateJobApplication(id: number, application: Partial<InsertJobApplication>): Promise<JobApplication>;
  deleteJobApplication(id: number): Promise<void>;
  
  // Job history operations
  createJobHistory(jobHistory: InsertJobHistory): Promise<JobHistory>;
  getJobHistory(userId: number): Promise<JobHistory[]>;
  updateJobHistory(id: number, jobHistory: Partial<InsertJobHistory>): Promise<JobHistory>;
  deleteJobHistory(id: number): Promise<void>;
  
  // Pricing tier operations
  getPricingTiers(): Promise<PricingTier[]>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  updatePricingTier(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier>;
  deletePricingTier(id: number): Promise<void>;
  
  // User tier operations
  getUserTier(userId: number): Promise<UserTier | undefined>;
  updateUserTier(userId: number, tierId: number): Promise<UserTier>;
  
  // Legal document operations
  getLegalDocuments(): Promise<LegalDocument[]>;
  getLegalDocument(id: number): Promise<LegalDocument | undefined>;
  createLegalDocument(document: InsertLegalDocument): Promise<LegalDocument>;
  updateLegalDocument(id: number, document: Partial<InsertLegalDocument>): Promise<LegalDocument>;
  deleteLegalDocument(id: number): Promise<void>;
  
  // User legal acceptance operations
  getUserLegalAcceptance(userId: number): Promise<UserLegalAcceptance[]>;
  recordLegalAcceptance(acceptance: InsertUserLegalAcceptance): Promise<UserLegalAcceptance>;
  
  // System settings operations
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
  
  // Question operations
  getQuestions(filters?: { category?: string; talentType?: string }): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  
  // User answer operations
  getUserAnswers(userId: number): Promise<UserAnswer[]>;
  createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  updateUserAnswer(id: number, answer: Partial<InsertUserAnswer>): Promise<UserAnswer>;
  deleteUserAnswer(id: number): Promise<void>;
  
  // Search operations
  searchUsers(query: string, currentUserId: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters?.role) {
      query = query.where(eq(users.role, filters.role as any));
    }
    
    return await query;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, parseInt(userId)));
    return result[0];
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(profile).returning();
    return result[0];
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const result = await db.update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, parseInt(userId)))
      .returning();
    return result[0];
  }

  async deleteUserProfile(userId: string): Promise<void> {
    await db.delete(userProfiles).where(eq(userProfiles.userId, parseInt(userId)));
  }

  // Media operations
  async createMediaFile(media: InsertMediaFile): Promise<MediaFile> {
    const result = await db.insert(mediaFiles).values(media).returning();
    return result[0];
  }

  async getUserMediaFiles(userId: string): Promise<MediaFile[]> {
    return await db.select().from(mediaFiles).where(eq(mediaFiles.userId, parseInt(userId)));
  }

  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    const result = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
    return result[0];
  }

  async updateMediaFile(id: number, media: Partial<InsertMediaFile>): Promise<MediaFile> {
    const result = await db.update(mediaFiles).set(media).where(eq(mediaFiles.id, id)).returning();
    return result[0];
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  }

  // Social operations
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const result = await db.insert(socialPosts).values(post).returning();
    return result[0];
  }

  async getSocialPosts(userId: number, limit = 20, offset = 0): Promise<SocialPost[]> {
    return await db.select().from(socialPosts)
      .orderBy(desc(socialPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserSocialPosts(userId: number): Promise<SocialPost[]> {
    return await db.select().from(socialPosts)
      .where(eq(socialPosts.userId, userId))
      .orderBy(desc(socialPosts.createdAt));
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async getJobs(filters?: { talentType?: string; location?: string; status?: string }): Promise<Job[]> {
    let query = db.select().from(jobs).orderBy(desc(jobs.createdAt));
    
    if (filters?.status) {
      query = query.where(eq(jobs.status, filters.status as any));
    }
    
    if (filters?.talentType) {
      query = query.where(eq(jobs.talentType, filters.talentType as any));
    }
    
    return await query;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(application).returning();
    return result[0];
  }

  async getJobApplications(jobId: number): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
  }

  async updateJobApplication(id: number, application: Partial<InsertJobApplication>): Promise<JobApplication> {
    const result = await db.update(jobApplications).set(application).where(eq(jobApplications.id, id)).returning();
    return result[0];
  }

  async deleteJobApplication(id: number): Promise<void> {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
  }

  // Job history operations
  async createJobHistory(jobHistory: InsertJobHistory): Promise<JobHistory> {
    const result = await db.insert(jobHistory).values(jobHistory).returning();
    return result[0];
  }

  async getJobHistory(userId: number): Promise<JobHistory[]> {
    return await db.select().from(jobHistory).where(eq(jobHistory.userId, userId));
  }

  async updateJobHistory(id: number, jobHistoryData: Partial<InsertJobHistory>): Promise<JobHistory> {
    const result = await db.update(jobHistory).set(jobHistoryData).where(eq(jobHistory.id, id)).returning();
    return result[0];
  }

  async deleteJobHistory(id: number): Promise<void> {
    await db.delete(jobHistory).where(eq(jobHistory.id, id));
  }

  // Pricing tier operations
  async getPricingTiers(): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers).orderBy(asc(pricingTiers.price));
  }

  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    const result = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
    return result[0];
  }

  async createPricingTier(tier: InsertPricingTier): Promise<PricingTier> {
    const result = await db.insert(pricingTiers).values(tier).returning();
    return result[0];
  }

  async updatePricingTier(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier> {
    const result = await db.update(pricingTiers).set(tier).where(eq(pricingTiers.id, id)).returning();
    return result[0];
  }

  async deletePricingTier(id: number): Promise<void> {
    await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
  }

  // User tier operations
  async getUserTier(userId: number): Promise<UserTier | undefined> {
    const result = await db.select().from(userTier).where(eq(userTier.userId, userId));
    return result[0];
  }

  async updateUserTier(userId: number, tierId: number): Promise<UserTier> {
    const existingTier = await this.getUserTier(userId);
    
    if (existingTier) {
      const result = await db.update(userTier)
        .set({ tierId, updatedAt: new Date() })
        .where(eq(userTier.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userTier)
        .values({ userId, tierId })
        .returning();
      return result[0];
    }
  }

  // Legal document operations
  async getLegalDocuments(): Promise<LegalDocument[]> {
    return await db.select().from(legalDocuments).orderBy(asc(legalDocuments.type));
  }

  async getLegalDocument(id: number): Promise<LegalDocument | undefined> {
    const result = await db.select().from(legalDocuments).where(eq(legalDocuments.id, id));
    return result[0];
  }

  async createLegalDocument(document: InsertLegalDocument): Promise<LegalDocument> {
    const result = await db.insert(legalDocuments).values(document).returning();
    return result[0];
  }

  async updateLegalDocument(id: number, document: Partial<InsertLegalDocument>): Promise<LegalDocument> {
    const result = await db.update(legalDocuments).set(document).where(eq(legalDocuments.id, id)).returning();
    return result[0];
  }

  async deleteLegalDocument(id: number): Promise<void> {
    await db.delete(legalDocuments).where(eq(legalDocuments.id, id));
  }

  // User legal acceptance operations
  async getUserLegalAcceptance(userId: number): Promise<UserLegalAcceptance[]> {
    return await db.select().from(userLegalAcceptance).where(eq(userLegalAcceptance.userId, userId));
  }

  async recordLegalAcceptance(acceptance: InsertUserLegalAcceptance): Promise<UserLegalAcceptance> {
    const result = await db.insert(userLegalAcceptance).values(acceptance).returning();
    return result[0];
  }

  // System settings operations
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const result = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return result[0];
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    
    if (existing) {
      const result = await db.update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(systemSettings)
        .values({ key, value })
        .returning();
      return result[0];
    }
  }

  // Question operations
  async getQuestions(filters?: { category?: string; talentType?: string }): Promise<Question[]> {
    let query = db.select().from(questions).orderBy(asc(questions.order));
    
    if (filters?.category) {
      query = query.where(eq(questions.category, filters.category));
    }
    
    if (filters?.talentType) {
      query = query.where(eq(questions.talentType, filters.talentType as any));
    }
    
    return await query;
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }

  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question> {
    const result = await db.update(questions).set(question).where(eq(questions.id, id)).returning();
    return result[0];
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // User answer operations
  async getUserAnswers(userId: number): Promise<UserAnswer[]> {
    return await db.select().from(userAnswers).where(eq(userAnswers.userId, userId));
  }

  async createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const result = await db.insert(userAnswers).values(answer).returning();
    return result[0];
  }

  async updateUserAnswer(id: number, answer: Partial<InsertUserAnswer>): Promise<UserAnswer> {
    const result = await db.update(userAnswers).set(answer).where(eq(userAnswers.id, id)).returning();
    return result[0];
  }

  async deleteUserAnswer(id: number): Promise<void> {
    await db.delete(userAnswers).where(eq(userAnswers.id, id));
  }

  // Search operations
  async searchUsers(query: string, currentUserId: number): Promise<User[]> {
    return await db.select().from(users)
      .where(
        and(
          or(
            like(users.firstName, `%${query}%`),
            like(users.lastName, `%${query}%`),
            like(users.username, `%${query}%`)
          )
        )
      )
      .limit(20);
  }
}

export const storage = new DatabaseStorage();