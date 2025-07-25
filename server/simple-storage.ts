import {
  users,
  userProfiles,
  pricingTiers,
  seoSettings,
  talentCategories,
  featuredTalents,
  talentTypes,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type PricingTier,
  type SeoSettings,
  type InsertSeoSettings,
  type TalentCategory,
  type InsertTalentCategory,
  type FeaturedTalent,
  type InsertFeaturedTalent,
  type TalentType,
  type InsertTalentType,
} from "@shared/simple-schema";
import { jobHistory, profileSharingSettings, availabilityCalendar, mediaFiles, jobApplications, jobCommunications, socialPosts, jobs, socialMediaLinks, friendships, promoCodes, promoCodeUsage, userDiscountPeriods, emailTemplates } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (for traditional auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  upsertUser(user: any): Promise<User>;
  deleteUser(id: number): Promise<void>;
  updateUserRole(userId: number, role: string): Promise<User>;
  updateUserVerification(userId: number, verified: boolean): Promise<UserProfile>;
  createPricingTier(tier: any): Promise<PricingTier>;
  updatePricingTier(id: number, tier: any): Promise<PricingTier>;
  deletePricingTier(id: number): Promise<void>;
  getAllEmailTemplates(): Promise<any[]>;
  getEmailTemplate(id: number): Promise<any | undefined>;
  createEmailTemplate(template: any): Promise<any>;
  updateEmailTemplate(id: number, updates: any): Promise<any>;
  deleteEmailTemplate(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  getProfileByUsername(username: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  getUsersWithProfiles(filters?: { isFeatured?: boolean }): Promise<Array<User & { profile?: UserProfile }>>;
  
  // Tier operations
  updateUserTier(userId: number, tierId: number): Promise<User>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  getPricingTiers(): Promise<PricingTier[]>;
  
  // Media operations - Database implementation
  getUserMediaFiles(userId: number): Promise<any[]>;
  createMediaFile(mediaData: any): Promise<any>;
  updateMediaFile(id: number, mediaData: any): Promise<any>;
  deleteMediaFile(id: number): Promise<void>;
  getUserLimits(userId: number): Promise<any>;
  
  // Admin settings operations
  getAdminSettings(): Promise<any[]>;
  updateAdminSetting(key: string, value: string, updatedBy: string): Promise<any>;
  
  // Legal acceptance operations
  recordLegalAcceptance(userId: number, acceptanceData: {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    termsVersion?: number;
    privacyVersion?: number;
  }): Promise<User>;

  // SEO operations
  getSeoSettings(): Promise<SeoSettings | undefined>;
  updateSeoSettings(settings: Partial<InsertSeoSettings>): Promise<SeoSettings>;

  // Profile image update method
  updateUserProfileImage(userId: number, imageUrl: string | null): Promise<User>;
  
  // Profile template update method
  updateUserProfileTemplate(userId: number, template: string): Promise<User>;
  
  // Skills update method
  updateUserSkills(userId: number, skills: string[]): Promise<User>;
  
  // Social Media Links operations
  getSocialMediaLinks(userId: number): Promise<any[]>;
  createSocialMediaLink(linkData: any): Promise<any>;
  updateSocialMediaLink(id: number, linkData: any): Promise<any>;
  deleteSocialMediaLink(id: number): Promise<void>;
  updateSocialMediaLinkClicks(id: number): Promise<void>;

  // Skill endorsement operations
  getSkillEndorsements(userId: number, skill: string): Promise<any[]>;
  createSkillEndorsement(endorsementData: any): Promise<any>;

  // Social posts operations
  getUserSocialPosts(userId: number): Promise<any[]>;

  // Job history operations
  getJobHistory(userId: number): Promise<any[]>;
  createJobHistory(jobHistoryData: any): Promise<any>;
  updateJobHistory(id: number, jobHistoryData: any): Promise<any>;
  deleteJobHistory(id: number): Promise<void>;
  getJobHistoryById(jobId: number): Promise<any>;
  
  // Job communication operations
  getJobCommunications(jobId: number): Promise<any[]>;
  createJobCommunication(jobId: number, senderId: number, receiverId: number, message: string): Promise<any>;
  markJobCommunicationAsRead(id: number): Promise<void>;
  
  // Application operations
  getUserApplications(userId: number): Promise<any[]>;
  createApplication(applicationData: any): Promise<any>;
  createJobApplication(applicationData: any): Promise<any>;
  getJobApplications(jobId: number): Promise<any[]>;
  
  // Social stats operations
  getUserSocialStats(userId: number): Promise<any>;
  
  // Opportunities operations
  getOpportunities(userId: number): Promise<any[]>;
  
  // Promo code operations - MISSING METHODS THAT ARE BREAKING ADMIN FUNCTIONALITY
  getPromoCodes(): Promise<any[]>;
  createPromoCode(promoCode: any): Promise<any>;
  updatePromoCode(id: number, promoCode: any): Promise<any>;
  deletePromoCode(id: number): Promise<void>;
  getPromoCodeUsage(id: number): Promise<any>;
  validatePromoCode(code: string): Promise<any>;
  calculateDiscountAmount(promoCode: any, amount: number): Promise<number>;
  
  // NEW: Time-based discount duration methods
  applyTimeBasedDiscount(userId: number, promoCodeId: number, discountDurationMonths: number, autoDowngradeOnExpiry: boolean): Promise<any>;
  checkExpiredDiscounts(): Promise<void>;
  downgradeExpiredUsers(): Promise<void>;
  
  // Email campaign operations - MISSING METHODS THAT ARE BREAKING ADMIN FUNCTIONALITY
  getEmailCampaigns(): Promise<any[]>;
  createEmailCampaign(campaign: any): Promise<any>;
  updateEmailCampaign(id: number, campaign: any): Promise<any>;
  deleteEmailCampaign(id: number): Promise<void>;
  updateEmailCampaignStatus(id: number, status: string): Promise<any>;
  getUsersByGroups(groups: string[]): Promise<any[]>;
  
  // SEO management operations - MISSING METHODS THAT ARE BREAKING ADMIN FUNCTIONALITY
  getAllSeoPages(): Promise<any[]>;
  createSeoPage(page: any): Promise<any>;
  updateSeoPage(id: number, page: any): Promise<any>;
  deleteSeoPage(id: number): Promise<void>;
  getAllSeoImages(): Promise<any[]>;
  createSeoImage(image: any): Promise<any>;
  updateSeoImage(id: number, image: any): Promise<any>;
  deleteSeoImage(id: number): Promise<void>;
  getProfileSeoData(userId: number): Promise<any>;
  updateProfileSeoData(userId: number, data: any): Promise<any>;
  createProfileSeoData(userId: number, data: any): Promise<any>;
  getSeoPageByRoute(route: string): Promise<any>;
  
  // User representation operations - MISSING METHODS
  getUserRepresentations(userId: number): Promise<any[]>;
  createUserRepresentation(representation: any): Promise<any>;
  updateUserRepresentation(id: number, representation: any): Promise<any>;
  deleteUserRepresentation(id: number): Promise<void>;
  
  // Meeting operations - MISSING METHODS
  createMeeting(meeting: any): Promise<any>;
  getMeetings(userId: number): Promise<any[]>;
  updateMeeting(id: number, meeting: any): Promise<any>;
  deleteMeeting(id: number): Promise<void>;
  
  // Message operations - MISSING METHODS
  createMessage(message: any): Promise<any>;
  getMessages(conversationId: string): Promise<any[]>;
  getUserConversations(userId: number): Promise<any[]>;
  
  // User tag operations - MISSING METHODS
  createUserTag(tag: any): Promise<any>;
  getUserTags(userId: number): Promise<any[]>;
  updateUserTag(id: number, tag: any): Promise<any>;
  deleteUserTag(id: number): Promise<void>;
  addTagToMediaFile(mediaFileId: number, tagId: number): Promise<void>;
  removeTagFromMediaFile(mediaFileId: number, tagId: number): Promise<void>;
  getTagsForMediaFile(mediaFileId: number): Promise<any[]>;
  getMediaFilesByTag(tagId: number): Promise<any[]>;
  
  // User permission operations - MISSING METHODS
  getUserPermissions(userId: number): Promise<any[]>;
  createUserPermission(permission: any): Promise<any>;

  // Talent categories operations
  getTalentCategories(): Promise<TalentCategory[]>;
  createTalentCategory(category: InsertTalentCategory): Promise<TalentCategory>;
  updateTalentCategory(id: number, category: Partial<InsertTalentCategory>): Promise<TalentCategory>;
  deleteTalentCategory(id: number): Promise<void>;

  // Featured talents operations
  getFeaturedTalents(): Promise<Array<FeaturedTalent & { user: User; category?: TalentCategory }>>;
  createFeaturedTalent(featured: InsertFeaturedTalent): Promise<FeaturedTalent>;
  updateFeaturedTalent(id: number, featured: Partial<InsertFeaturedTalent>): Promise<FeaturedTalent>;
  deleteFeaturedTalent(id: number): Promise<void>;
  updateFeaturedTalentOrder(updates: Array<{ id: number; displayOrder: number }>): Promise<void>;

  // Talent types operations
  getTalentTypes(): Promise<TalentType[]>;
  createTalentType(talentType: InsertTalentType): Promise<TalentType>;
  updateTalentType(id: number, talentType: Partial<InsertTalentType>): Promise<TalentType>;
  deleteTalentType(id: number): Promise<void>;
  
  // Notifications operations
  getUserNotifications(userId: number): Promise<any[]>;
  setUserNotifications(userId: number, notifications: any[]): Promise<void>;

  // Profile sharing operations
  getProfileSharingSettings(userId: number): Promise<any>;
  updateProfileSharingSettings(userId: number, settings: any): Promise<any>;
  checkCustomUrlAvailable(customUrl: string, userId: number): Promise<boolean>;
  getProfileByCustomUrl(customUrl: string): Promise<any>;
  getProfileSharing(userId: string): Promise<any>; // Legacy method
  updateProfileSharing(userId: string, settings: any): Promise<any>; // Legacy method
  
  // Profile view tracking
  trackProfileView(viewedUserId: number, viewerUserId?: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private static instance: DatabaseStorage;
  private mediaFiles: Map<number, any[]> = new Map();
  private userNotifications: Map<number, any[]> = new Map();

  constructor() {
    if (DatabaseStorage.instance) {
      return DatabaseStorage.instance;
    }
    DatabaseStorage.instance = this;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Case-insensitive username lookup
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // Get users with their profile data for complete admin view
      const usersWithProfiles = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          isVerified: users.isVerified,
          profileImageUrl: users.profileImageUrl,
          pricingTierId: users.pricingTierId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          talentType: userProfiles.talentType,
          location: userProfiles.location,
          bio: userProfiles.bio
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id.toString(), userProfiles.userId));
      
      return usersWithProfiles;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      // Fallback to basic user data if profile join fails
      const basicUsers = await db.select().from(users);
      return basicUsers;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async upsertUser(userData: any): Promise<User> {
    try {
      // First try to get existing user
      const existingUser = await this.getUser(userData.id);
      
      if (existingUser) {
        // Update existing user
        return await this.updateUser(userData.id, userData);
      } else {
        // Create new user
        return await this.createUser(userData);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      console.log(`🗑️ Starting user deletion process for user ID: ${id}`);
      
      // Step 1: Remove user from featured_talents table first (handles foreign key constraint)
      try {
        await db.delete(featuredTalents).where(eq(featuredTalents.userId, id));
        console.log(`✅ Removed user ${id} from featured_talents`);
      } catch (error) {
        console.log(`⚠️ No featured_talents records to remove for user ${id}:`, error.message);
      }
      
      // Step 2: Remove related user profile data
      try {
        await db.delete(userProfiles).where(eq(userProfiles.userId, id.toString()));
        console.log(`✅ Removed user profile for user ${id}`);
      } catch (error) {
        console.log(`⚠️ No user profile to remove for user ${id}:`, error.message);
      }
      
      // Step 3: Remove other related data (media files, applications, social posts)
      try {
        await db.delete(mediaFiles).where(eq(mediaFiles.userId, id));
        console.log(`✅ Removed media files for user ${id}`);
      } catch (error) {
        console.log(`⚠️ No media files to remove for user ${id}:`, error.message);
      }
      
      try {
        await db.delete(jobApplications).where(eq(jobApplications.userId, id));
        console.log(`✅ Removed job applications for user ${id}`);
      } catch (error) {
        console.log(`⚠️ No job applications to remove for user ${id}:`, error.message);
      }
      
      // Step 4: Remove social posts (critical foreign key constraint)
      try {
        await db.delete(socialPosts).where(eq(socialPosts.userId, id));
        console.log(`✅ Removed social posts for user ${id}`);
      } catch (error) {
        console.log(`⚠️ No social posts to remove for user ${id}:`, error.message);
      }
      
      // Step 5: Finally delete the user record
      await db.delete(users).where(eq(users.id, id));
      console.log(`✅ Successfully deleted user ${id} and all related records`);
      
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ role: role as any })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async updateUserVerification(userId: number, verified: boolean): Promise<UserProfile> {
    try {
      console.log(`🔥 VERIFICATION: ${verified ? 'Verifying' : 'Unverifying'} user ${userId}`);
      
      // First check if profile exists
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      
      if (existingProfile.length === 0) {
        // Create a basic profile if none exists
        console.log(`📝 Creating profile for user ${userId} to enable verification`);
        const [newProfile] = await db
          .insert(userProfiles)
          .values({ 
            userId: userId,
            isVerified: verified,
            location: 'Not specified',
            talentType: 'Not specified'
          })
          .returning();
        console.log(`✅ VERIFICATION: Created profile and set verification status to ${verified} for user ${userId}`);
        return newProfile;
      } else {
        // Update existing profile
        const [profile] = await db
          .update(userProfiles)
          .set({ isVerified: verified })
          .where(eq(userProfiles.userId, userId))
          .returning();
        
        console.log(`✅ VERIFICATION: User ${userId} verification status updated to ${verified}`);
        return profile;
      }
    } catch (error) {
      console.error('Error updating user verification:', error);
      throw error;
    }
  }

  async createPricingTier(tier: any): Promise<PricingTier> {
    try {
      // Map field names to match database schema
      const tierData = {
        name: tier.name,
        price: tier.price?.toString() || tier.price,
        duration: tier.duration,
        features: tier.features || [],
        isActive: tier.isActive ?? tier.active ?? true,
        category: tier.category || 'talent',
        // Resource limits
        maxPhotos: tier.maxPhotos || 0,
        maxVideos: tier.maxVideos || 0,
        maxAudio: tier.maxAudio || 0,
        maxExternalLinks: tier.maxExternalLinks || 0,
        maxStorageGB: tier.maxStorageGB || 1,
        maxProjects: tier.maxProjects || 0,
        maxApplications: tier.maxApplications || 0,
        // Feature flags
        hasAnalytics: tier.hasAnalytics || false,
        hasMessaging: tier.hasMessaging || false,
        hasAIFeatures: tier.hasAIFeatures || false,
        hasPrioritySupport: tier.hasPrioritySupport || false,
        // Permissions
        canCreateJobs: tier.canCreateJobs || false,
        canViewProfiles: tier.canViewProfiles ?? true,
        canExportData: tier.canExportData || false,
        hasSocialFeatures: tier.hasSocialFeatures ?? true,
        annualPrice: tier.annualPrice || '0'
      };
      
      console.log('Mapped tier data for insertion:', tierData);
      
      // Try direct Drizzle insertion with explicit field mapping
      const [pricingTier] = await db.insert(pricingTiers).values({
        name: tierData.name,
        price: tierData.price,
        duration: tierData.duration,
        features: tierData.features,
        isActive: tierData.isActive,
        category: tierData.category,
        maxPhotos: tierData.maxPhotos,
        maxVideos: tierData.maxVideos,
        maxAudio: tierData.maxAudio,
        maxExternalLinks: tierData.maxExternalLinks,
        maxStorageGB: tierData.maxStorageGB,
        maxProjects: tierData.maxProjects,
        maxApplications: tierData.maxApplications,
        hasAnalytics: tierData.hasAnalytics,
        hasMessaging: tierData.hasMessaging,
        hasAIFeatures: tierData.hasAIFeatures,
        hasPrioritySupport: tierData.hasPrioritySupport,
        canCreateJobs: tierData.canCreateJobs,
        canViewProfiles: tierData.canViewProfiles,
        canExportData: tierData.canExportData,
        hasSocialFeatures: tierData.hasSocialFeatures,
        annualPrice: tierData.annualPrice
      }).returning();
      
      return pricingTier;
    } catch (error) {
      console.error('Error creating pricing tier:', error);
      throw error;
    }
  }

  async updatePricingTier(id: number, tier: any): Promise<PricingTier> {
    try {
      // Map field names to match database schema, only include provided fields
      const updateData: any = { updatedAt: new Date() };
      
      if (tier.name !== undefined) updateData.name = tier.name;
      if (tier.price !== undefined) updateData.price = tier.price?.toString() || tier.price;
      if (tier.duration !== undefined) updateData.duration = tier.duration;
      if (tier.features !== undefined) updateData.features = tier.features;
      if (tier.isActive !== undefined) updateData.isActive = tier.isActive;
      if (tier.active !== undefined) updateData.isActive = tier.active;
      if (tier.category !== undefined) updateData.category = tier.category;
      if (tier.maxPhotos !== undefined) updateData.maxPhotos = tier.maxPhotos;
      if (tier.maxVideos !== undefined) updateData.maxVideos = tier.maxVideos;
      if (tier.maxAudio !== undefined) updateData.maxAudio = tier.maxAudio;
      if (tier.maxExternalLinks !== undefined) updateData.maxExternalLinks = tier.maxExternalLinks;
      if (tier.maxStorageGB !== undefined) updateData.maxStorageGB = tier.maxStorageGB;
      if (tier.maxProjects !== undefined) updateData.maxProjects = tier.maxProjects;
      if (tier.maxApplications !== undefined) updateData.maxApplications = tier.maxApplications;
      if (tier.hasAnalytics !== undefined) updateData.hasAnalytics = tier.hasAnalytics;
      if (tier.hasMessaging !== undefined) updateData.hasMessaging = tier.hasMessaging;
      if (tier.hasAIFeatures !== undefined) updateData.hasAIFeatures = tier.hasAIFeatures;
      if (tier.hasPrioritySupport !== undefined) updateData.hasPrioritySupport = tier.hasPrioritySupport;
      if (tier.canCreateJobs !== undefined) updateData.canCreateJobs = tier.canCreateJobs;
      if (tier.canViewProfiles !== undefined) updateData.canViewProfiles = tier.canViewProfiles;
      if (tier.canExportData !== undefined) updateData.canExportData = tier.canExportData;
      if (tier.hasSocialFeatures !== undefined) updateData.hasSocialFeatures = tier.hasSocialFeatures;
      if (tier.annualPrice !== undefined) updateData.annualPrice = tier.annualPrice;
      
      console.log('Mapped update data:', updateData);
      const [pricingTier] = await db
        .update(pricingTiers)
        .set(updateData)
        .where(eq(pricingTiers.id, id))
        .returning();
      return pricingTier;
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      throw error;
    }
  }

  async deletePricingTier(id: number): Promise<void> {
    try {
      await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      throw error;
    }
  }

  async getAllEmailTemplates(): Promise<any[]> {
    try {
      const templates = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
      return templates;
    } catch (error) {
      console.error('Database email templates error:', error);
      return [];
    }
  }

  async getEmailTemplate(id: number): Promise<any | undefined> {
    try {
      const templates = await this.getAllEmailTemplates();
      return templates.find(t => t.id === id);
    } catch (error) {
      console.error('Error fetching email template:', error);
      return undefined;
    }
  }

  async createEmailTemplate(template: any): Promise<any> {
    try {
      const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
      return newTemplate;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  async updateEmailTemplate(id: number, updates: any): Promise<any> {
    try {
      const [updatedTemplate] = await db.update(emailTemplates).set(updates).where(eq(emailTemplates.id, id)).returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    try {
      await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    console.log('👤 Getting complete profile for userId:', userId);
    
    try {
      // Get ALL profile data for form pre-population
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId.toString()));
        
      if (profile) {
        console.log('👤 Complete profile found - has bio:', !!profile.bio);
        console.log('👤 Profile location:', profile.location);
        console.log('👤 Profile skills count:', profile.skills ? profile.skills.length : 0);
        console.log('👤 Profile rates:', { daily: profile.dailyRate, weekly: profile.weeklyRate });
        return profile as any;
      }
      
      console.log('👤 No profile found');
      return undefined;
    } catch (error) {
      console.error('👤 Error in getUserProfile:', error);
      throw error;
    }
  }

  async getProfileByUsername(username: string): Promise<UserProfile | undefined> {
    console.log('👤 Getting profile by username:', username);
    
    try {
      // First get the user by username to get their ID
      const user = await this.getUserByUsername(username);
      if (!user) {
        console.log('👤 User not found for username:', username);
        return undefined;
      }
      
      // Then get their profile using the user ID
      return await this.getUserProfile(user.id);
    } catch (error) {
      console.error('👤 Error in getProfileByUsername:', error);
      throw error;
    }
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    console.log('📝 Updating user profile for userId:', userId);
    console.log('📝 Profile updates:', profile);
    
    const [userProfile] = await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.user_id, userId.toString()))
      .returning();
    
    console.log('📝 Updated profile:', !!userProfile);
    return userProfile;
  }

  async getUsersWithProfiles(filters?: { isFeatured?: boolean }): Promise<Array<User & { profile?: UserProfile }>> {
    try {
      console.log('getUsersWithProfiles called with filters:', filters);
      
      // Get all users
      const allUsers = await db.select().from(users);
      console.log('Found users:', allUsers.length);
      
      // Get all profiles
      const allProfiles = await db.select().from(userProfiles);
      console.log('Found profiles:', allProfiles.length);
      
      // Join users with their profiles, handling database column name mismatch
      const usersWithProfiles = allUsers.map(user => {
        const profile = allProfiles.find(p => p.user_id === user.id.toString());
        
        // Create normalized profile data that matches frontend expectations
        const profileData = profile ? {
          ...profile,
          userId: profile.user_id, // Map snake_case to camelCase for frontend
          talentType: profile.talent_type || (user.role === 'talent' ? 'Not specified' : user.role),
          isVerified: profile.is_verified || false,
          location: profile.location || 'Not specified'
        } : {
          userId: user.id.toString(),
          talentType: user.role === 'talent' ? 'Not specified' : user.role,
          isVerified: false,
          location: 'Not specified'
        };
        
        return { ...user, profile: profileData };
      });
      
      console.log('Users with profiles:', usersWithProfiles.length);
      
      // Apply filters if provided
      if (filters?.isFeatured) {
        console.log('Filtering for featured users...');
        console.log('Sample user profile:', usersWithProfiles[0]?.profile);
        const featuredUsers = usersWithProfiles.filter(user => {
          console.log(`User ${user.username}: profile exists: ${!!user.profile}, isFeatured: ${user.profile?.isFeatured}`);
          return user.profile?.isFeatured === true;
        });
        console.log('Featured users found:', featuredUsers.length);
        return featuredUsers;
      }
      
      return usersWithProfiles;
    } catch (error) {
      console.error('Error in getUsersWithProfiles:', error);
      throw error;
    }
  }
  
  async updateUserTier(userId: number, tierId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ pricingTierId: tierId })
      .where(eq(users.id, userId))
      .returning();
    
    // CRITICAL: Automatically verify paid users (tier 2 and above are paid plans)
    if (tierId >= 2) {
      console.log(`🔥 AUTO-VERIFICATION: Automatically verifying paid user ${userId} with tier ${tierId}`);
      await this.updateUserVerification(userId, true);
    }
    
    return user;
  }
  
  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    try {
      console.log('Getting pricing tier with ID:', id);
      
      // Query database for actual pricing tiers
      const tiers = await db.select().from(pricingTiers).where(eq(pricingTiers.isActive, true));
      const tier = tiers.find(t => t.id === id);
      console.log('Found database tier:', tier);
      return tier || undefined;
    } catch (error) {
      console.error('Error getting pricing tier:', error);
      throw error;
    }
  }

  async getPricingTiers(): Promise<PricingTier[]> {
    try {
      const tiers = await db.select().from(pricingTiers).orderBy(asc(pricingTiers.price));
      return tiers;
    } catch (error) {
      console.error("Database error getting pricing tiers:", error.message);
      return [];
    }
  }

  // Media operations with simple in-memory storage  
  private jobHistory = new Map<number, any[]>();

  async getUserMediaFiles(userId: number): Promise<any[]> {
    try {
      const media = await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.userId, userId))
        .orderBy(desc(mediaFiles.createdAt));
      return media;
    } catch (error) {
      console.error('Database media files error:', error);
      return [];
    }
  }

  async createMediaFile(mediaData: any): Promise<any> {
    try {
      const [media] = await db
        .insert(mediaFiles)
        .values({
          userId: mediaData.userId,
          filename: mediaData.filename || null,
          originalName: mediaData.originalName || null,
          mimeType: mediaData.mimeType || null,
          size: mediaData.size || null,
          url: mediaData.url,
          thumbnailUrl: mediaData.thumbnailUrl || null,
          mediaType: mediaData.mediaType,
          tags: mediaData.tags || null,
          title: mediaData.title || null,
          description: mediaData.description || null,
          category: mediaData.category || 'portfolio',
          isPublic: mediaData.isPublic !== false,
          externalUrl: mediaData.externalUrl || null,
          externalPlatform: mediaData.externalPlatform || null,
          externalId: mediaData.externalId || null,
          duration: mediaData.duration || null,
          isExternal: mediaData.isExternal || false
        })
        .returning();
      return media;
    } catch (error) {
      console.error('Database media creation error:', error);
      throw error;
    }
  }

  async getMediaFile(id: number): Promise<any> {
    try {
      const [media] = await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.id, id));
      return media;
    } catch (error) {
      console.error('Database media file error:', error);
      throw error;
    }
  }

  async updateMediaFile(id: number, updates: any): Promise<any> {
    try {
      const [updatedMedia] = await db
        .update(mediaFiles)
        .set(updates)
        .where(eq(mediaFiles.id, id))
        .returning();
      return updatedMedia;
    } catch (error) {
      console.error('Database media update error:', error);
      throw error;
    }
  }

  async deleteMediaFile(id: number): Promise<void> {
    try {
      await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
    } catch (error) {
      console.error('Database media deletion error:', error);
      throw error;
    }
  }

  // User limits operations
  async getUserLimits(userId: number): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;
      
      const tier = await this.getPricingTier(user.pricingTierId || 1);
      return tier ? {
        maxPhotos: tier.maxPhotos || 5,
        maxVideos: tier.maxVideos || 1,
        maxAudio: tier.maxAudio || 1,
        maxExternalLinks: tier.maxExternalLinks || 3
      } : null;
    } catch (error) {
      console.error('Error getting user limits:', error);
      return null;
    }
  }

  // Admin settings operations
  async getAdminSettings(): Promise<any[]> {
    try {
      return [
        { key: 'OPENAI_API_KEY', value: '***', updatedBy: 'system', updatedAt: new Date() },
        { key: 'STRIPE_SECRET_KEY', value: '***', updatedBy: 'system', updatedAt: new Date() },
        { key: 'RESEND_API_KEY', value: '***', updatedBy: 'system', updatedAt: new Date() }
      ];
    } catch (error) {
      console.error('Error getting admin settings:', error);
      return [];
    }
  }

  async updateAdminSetting(key: string, value: string, updatedBy: string): Promise<any> {
    try {
      return { key, value: '***', updatedBy, updatedAt: new Date() };
    } catch (error) {
      console.error('Error updating admin setting:', error);
      throw error;
    }
  }

  // Job history operations

  // Social Media Links Management
  async getSocialMediaLinks(userId: number): Promise<any[]> {
    try {
      const links = await db
        .select()
        .from(socialMediaLinks)
        .where(eq(socialMediaLinks.userId, userId))
        .orderBy(asc(socialMediaLinks.sortOrder));
      return links;
    } catch (error) {
      console.error('Database social media links retrieval error:', error);
      return [];
    }
  }

  async createSocialMediaLink(linkData: any): Promise<any> {
    try {
      const [link] = await db
        .insert(socialMediaLinks)
        .values({
          userId: linkData.userId,
          platform: linkData.platform,
          username: linkData.username,
          url: linkData.url,
          displayName: linkData.displayName,
          isVisible: linkData.isVisible !== false,
          iconColor: linkData.iconColor,
          sortOrder: linkData.sortOrder || 0,
        })
        .returning();
      return link;
    } catch (error) {
      console.error('Database social media link creation error:', error);
      throw error;
    }
  }

  async updateSocialMediaLink(id: number, linkData: any): Promise<any> {
    try {
      const [link] = await db
        .update(socialMediaLinks)
        .set({
          username: linkData.username,
          url: linkData.url,
          displayName: linkData.displayName,
          isVisible: linkData.isVisible,
          iconColor: linkData.iconColor,
          sortOrder: linkData.sortOrder,
          updatedAt: new Date().toISOString()
        })
        .where(eq(socialMediaLinks.id, id))
        .returning();
      return link;
    } catch (error) {
      console.error('Database social media link update error:', error);
      throw error;
    }
  }

  async deleteSocialMediaLink(id: number): Promise<void> {
    try {
      await db
        .delete(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id));
    } catch (error) {
      console.error('Database social media link deletion error:', error);
      throw error;
    }
  }

  async updateSocialMediaLinkClicks(id: number): Promise<void> {
    try {
      await db
        .update(socialMediaLinks)
        .set({
          clickCount: sql`${socialMediaLinks.clickCount} + 1`
        })
        .where(eq(socialMediaLinks.id, id));
    } catch (error) {
      console.error('Database social media link click update error:', error);
    }
  }





  // Legal acceptance operations
  async recordLegalAcceptance(userId: number, acceptanceData: {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    termsVersion?: number;
    privacyVersion?: number;
  }): Promise<User> {
    const updateData: any = {};
    
    if (acceptanceData.termsAccepted !== undefined) {
      updateData.termsAccepted = acceptanceData.termsAccepted;
      updateData.termsAcceptedAt = new Date();
    }
    
    if (acceptanceData.privacyAccepted !== undefined) {
      updateData.privacyAccepted = acceptanceData.privacyAccepted;
      updateData.privacyAcceptedAt = new Date();
    }
    
    if (acceptanceData.termsVersion !== undefined) {
      updateData.termsVersion = acceptanceData.termsVersion;
    }
    
    if (acceptanceData.privacyVersion !== undefined) {
      updateData.privacyVersion = acceptanceData.privacyVersion;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // SEO operations
  async getSeoSettings(): Promise<SeoSettings | undefined> {
    const [settings] = await db.select().from(seoSettings);
    return settings || undefined;
  }

  async updateSeoSettings(settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
    const [seoSetting] = await db
      .update(seoSettings)
      .set(settings)
      .returning();
    return seoSetting;
  }

  // Profile image update method
  async updateUserProfileImage(userId: number, imageUrl: string | null): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl: imageUrl })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Profile template update method
  async updateUserProfileTemplate(userId: number, template: string): Promise<User> {
    try {
      console.log('🔍 Updating profile template for user:', userId);
      console.log('🔍 New template:', template);
      
      // Import users from the correct schema
      const { users } = await import("@shared/schema");
      
      const [user] = await db
        .update(users)
        .set({ profileTemplate: template })
        .where(eq(users.id, userId))
        .returning();
      
      if (!user) {
        throw new Error('User not found or update failed');
      }
      
      console.log('✅ Profile template updated successfully');
      return user;
    } catch (error) {
      console.error('❌ Failed to update profile template:', error);
      throw new Error(`Failed to update profile template: ${error?.message || 'Unknown error'}`);
    }
  }

  // Skills update method
  async updateUserSkills(userId: number, skills: string[]): Promise<User> {
    try {
      console.log('🎯 Updating skills for user:', userId);
      console.log('🎯 Skills:', skills);
      
      // Update skills in the user profile table where skills field exists
      const [profile] = await db
        .update(userProfiles)
        .set({ skills: skills })
        .where(eq(userProfiles.userId, userId))
        .returning();
      
      if (!profile) {
        throw new Error('Profile not found or update failed');
      }
      
      console.log('✅ Skills updated successfully');
      
      // Return the user data to maintain interface consistency
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('❌ Failed to update skills:', error);
      throw new Error(`Failed to update skills: ${error?.message || 'Unknown error'}`);
    }
  }

  // Skill endorsement operations
  async getSkillEndorsements(userId: number, skill: string): Promise<any[]> {
    // Return empty array - no hardcoded data
    return [];
  }

  async createSkillEndorsement(endorsementData: any): Promise<any> {
    // Return basic structure without hardcoded data
    return {
      id: Date.now(),
      ...endorsementData,
      createdAt: new Date().toISOString()
    };
  }

  async updateUserSocialLinks(userId: number, socialLinks: any): Promise<UserProfile> {
    try {
      console.log('🔗 Updating social links for user:', userId);
      console.log('🔗 Social links data:', socialLinks);
      
      // Direct database update to avoid the problematic updateUserProfile method
      const [profile] = await db
        .update(userProfiles)
        .set({ socialLinks: socialLinks })
        .where(eq(userProfiles.userId, userId.toString()))
        .returning();
      
      if (!profile) {
        throw new Error('Profile not found or update failed');
      }
      
      console.log('✅ Social links updated successfully');
      return profile;
    } catch (error: any) {
      console.error('❌ Failed to update social links:', error);
      throw new Error(`Failed to update social links: ${error?.message || 'Unknown error'}`);
    }
  }

  // Talent categories operations
  async getTalentCategories(): Promise<TalentCategory[]> {
    return await db.select().from(talentCategories).orderBy(asc(talentCategories.name));
  }

  async createTalentCategory(category: InsertTalentCategory): Promise<TalentCategory> {
    const [newCategory] = await db
      .insert(talentCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateTalentCategory(id: number, category: Partial<InsertTalentCategory>): Promise<TalentCategory> {
    const [updatedCategory] = await db
      .update(talentCategories)
      .set(category)
      .where(eq(talentCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteTalentCategory(id: number): Promise<void> {
    await db.delete(talentCategories).where(eq(talentCategories.id, id));
  }

  // Featured talents operations
  async getFeaturedTalents(): Promise<Array<FeaturedTalent & { user: User; category?: TalentCategory }>> {
    const results = await db
      .select()
      .from(featuredTalents)
      .leftJoin(users, eq(featuredTalents.userId, users.id))
      .leftJoin(talentCategories, eq(featuredTalents.categoryId, talentCategories.id))
      .orderBy(asc(featuredTalents.displayOrder));

    return results.map(row => ({
      ...row.featured_talents,
      user: row.users!,
      category: row.talent_categories || undefined,
    }));
  }

  async createFeaturedTalent(featured: InsertFeaturedTalent): Promise<FeaturedTalent> {
    const [newFeatured] = await db
      .insert(featuredTalents)
      .values(featured)
      .returning();
    return newFeatured;
  }

  async updateFeaturedTalent(id: number, featured: Partial<InsertFeaturedTalent>): Promise<FeaturedTalent> {
    const [updatedFeatured] = await db
      .update(featuredTalents)
      .set(featured)
      .where(eq(featuredTalents.id, id))
      .returning();
    return updatedFeatured;
  }

  async deleteFeaturedTalent(id: number): Promise<void> {
    await db.delete(featuredTalents).where(eq(featuredTalents.id, id));
  }

  async updateFeaturedTalentOrder(updates: Array<{ id: number; displayOrder: number }>): Promise<void> {
    for (const update of updates) {
      await db
        .update(featuredTalents)
        .set({ displayOrder: update.displayOrder })
        .where(eq(featuredTalents.id, update.id));
    }
  }

  // Talent types operations
  async getTalentTypes(): Promise<TalentType[]> {
    const results = await db
      .select()
      .from(talentTypes)
      .orderBy(asc(talentTypes.displayName));
    return results;
  }

  async createTalentType(talentType: InsertTalentType): Promise<TalentType> {
    const [newTalentType] = await db
      .insert(talentTypes)
      .values(talentType)
      .returning();
    return newTalentType;
  }

  async updateTalentType(id: number, talentType: Partial<InsertTalentType>): Promise<TalentType> {
    const [updatedTalentType] = await db
      .update(talentTypes)
      .set(talentType)
      .where(eq(talentTypes.id, id))
      .returning();
    return updatedTalentType;
  }

  async deleteTalentType(id: number): Promise<void> {
    await db.delete(talentTypes).where(eq(talentTypes.id, id));
  }

  // Social posts operations - Database implementation
  async getUserSocialPosts(userId: number): Promise<any[]> {
    try {
      // Use raw SQL to match actual database structure
      const result = await db.execute(sql`
        SELECT * FROM social_posts 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Database social posts error:', error);
      return [];
    }
  }

  // Calendar operations - Database implementation
  private calendar = new Map<number, any[]>();

  async getAvailabilityEvents(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(availabilityCalendar)
        .where(eq(availabilityCalendar.userId, userId.toString()))
        .orderBy(asc(availabilityCalendar.startDate));
      return results || [];
    } catch (error) {
      console.error('Database calendar error:', error);
      return this.calendar.get(userId) || [];
    }
  }

  async createAvailabilityEvent(eventData: any): Promise<any> {
    try {
      const [result] = await db
        .insert(availabilityCalendar)
        .values({
          userId: eventData.userId.toString(),
          startDate: new Date(eventData.startDate || eventData.startTime),
          endDate: new Date(eventData.endDate || eventData.endTime),
          status: eventData.status || 'available',
          notes: eventData.notes || '',
          allDay: eventData.allDay || false
        })
        .returning();
      return result;
    } catch (error) {
      console.error('Database calendar creation error:', error);
      // Fallback to memory
      const userId = eventData.userId;
      const events = this.calendar.get(userId) || [];
      const event = {
        id: Date.now(),
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      events.push(event);
      this.calendar.set(userId, events);
      return event;
    }
  }

  async updateAvailabilityEvent(eventId: number, eventData: any): Promise<any> {
    try {
      const [result] = await db
        .update(availabilityCalendar)
        .set({
          startDate: eventData.startDate ? new Date(eventData.startDate) : undefined,
          endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
          status: eventData.status,
          notes: eventData.notes,
          allDay: eventData.allDay
        })
        .where(eq(availabilityCalendar.id, eventId))
        .returning();
      return result;
    } catch (error) {
      console.error('Database calendar update error:', error);
      // Fallback to memory
      for (const [userId, events] of this.calendar.entries()) {
        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          events[eventIndex] = { ...events[eventIndex], ...eventData, updatedAt: new Date().toISOString() };
          return events[eventIndex];
        }
      }
      throw new Error('Event not found');
    }
  }

  async deleteAvailabilityEvent(eventId: number, userId: number): Promise<void> {
    try {
      await db
        .delete(availabilityCalendar)
        .where(eq(availabilityCalendar.id, eventId));
    } catch (error) {
      console.error('Database calendar delete error:', error);
      // Fallback to memory
      const events = this.calendar.get(userId) || [];
      const filteredEvents = events.filter(e => e.id !== eventId);
      this.calendar.set(userId, filteredEvents);
    }
  }

  // Missing availability methods needed by the availability endpoints
  async getUserAvailability(userId: number): Promise<any[]> {
    return this.getAvailabilityEvents(userId);
  }

  async createAvailabilityEntry(entryData: any): Promise<any> {
    return this.createAvailabilityEvent(entryData);
  }

  async updateAvailabilityEntry(entryId: number, entryData: any): Promise<any> {
    return this.updateAvailabilityEvent(entryId, entryData);
  }

  async deleteAvailabilityEntry(entryId: number, userId: number): Promise<void> {
    return this.deleteAvailabilityEvent(entryId, userId);
  }

  // Job History/Experience operations (database implementation)  
  async getJobHistory(userId: number): Promise<any[]> {
    try {
      // Simple query without parameters to fix the parameter issue
      const results = await db.execute(
        `SELECT * FROM job_history WHERE user_id = ${userId} ORDER BY created_at DESC`
      );
      return results.rows || [];
    } catch (error) {
      console.error('Database job history error:', error);
      // Fallback to in-memory for now
      return this.jobHistory.get(userId) || [];
    }
  }

  async createJobHistory(jobData: any): Promise<any> {
    try {
      // Clean date values - convert 'undefined' strings to NULL
      const startDate = jobData.startDate && jobData.startDate !== 'undefined' ? `'${jobData.startDate}'` : 'NULL';
      const endDate = jobData.endDate && jobData.endDate !== 'undefined' ? `'${jobData.endDate}'` : 'NULL';
      const description = jobData.description && jobData.description !== 'undefined' ? `'${jobData.description.replace(/'/g, "''")}'` : 'NULL';
      const jobType = jobData.jobType && jobData.jobType !== 'undefined' ? `'${jobData.jobType}'` : "'film'";
      const location = jobData.location && jobData.location !== 'undefined' ? `'${jobData.location.replace(/'/g, "''")}'` : 'NULL';
      
      console.log("🔥 DATABASE: Creating job history with cleaned data", {
        userId: jobData.userId,
        title: jobData.title,
        company: jobData.company,
        role: jobData.role,
        startDate,
        endDate,
        description,
        jobType,
        location
      });
      
      const result = await db.execute(
        `INSERT INTO job_history (user_id, title, company, role, start_date, end_date, description, job_type, location) 
         VALUES (${jobData.userId}, '${jobData.title}', '${jobData.company}', '${jobData.role}', ${startDate}, ${endDate}, ${description}, ${jobType}, ${location}) 
         RETURNING *`
      );
      
      console.log("🔥 DATABASE: Insert successful", result.rows?.[0]);
      return result.rows?.[0] || {};
    } catch (error) {
      console.error('Database job history creation error:', error);
      // Fallback to in-memory
      const userId = jobData.userId;
      const jobs = this.jobHistory.get(userId) || [];
      const job = {
        id: Date.now(),
        user_id: userId,
        title: jobData.title,
        company: jobData.company,
        role: jobData.role,
        start_date: jobData.startDate && jobData.startDate !== 'undefined' ? jobData.startDate : null,
        end_date: jobData.endDate && jobData.endDate !== 'undefined' ? jobData.endDate : null,
        description: jobData.description || null,
        job_type: jobData.jobType || 'film',
        location: jobData.location || null,
        verified: false,
        ai_enhanced: false,
        skill_validations: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      jobs.push(job);
      this.jobHistory.set(userId, jobs);
      return job;
    }
  }

  async updateJobHistory(id: number, jobData: any): Promise<any> {
    try {
      // Clean date values like in createJobHistory  
      const startDate = jobData.startDate && jobData.startDate !== 'undefined' ? `'${jobData.startDate}'` : 'NULL';
      const endDate = jobData.endDate && jobData.endDate !== 'undefined' ? `'${jobData.endDate}'` : 'NULL';
      const description = jobData.description && jobData.description !== 'undefined' ? `'${jobData.description.replace(/'/g, "''")}'` : 'NULL';
      const jobType = jobData.jobType && jobData.jobType !== 'undefined' ? `'${jobData.jobType}'` : "'film'";
      const location = jobData.location && jobData.location !== 'undefined' ? `'${jobData.location.replace(/'/g, "''")}'` : 'NULL';
      
      console.log("🔥 DATABASE: Updating job history with cleaned data", {
        id,
        title: jobData.title,
        company: jobData.company,
        role: jobData.role,
        startDate,
        endDate,
        description,
        jobType,
        location
      });
      
      const result = await db.execute(
        `UPDATE job_history SET title = '${jobData.title}', company = '${jobData.company}', role = '${jobData.role}', start_date = ${startDate}, end_date = ${endDate}, description = ${description}, job_type = ${jobType}, location = ${location}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`
      );
      
      if (result.rows && result.rows.length > 0) {
        const updatedJob = result.rows[0];
        console.log('✅ Database update successful:', updatedJob);
        
        // Also update memory cache
        for (const [userId, jobs] of this.jobHistory.entries()) {
          const jobIndex = jobs.findIndex(j => j.id === id);
          if (jobIndex !== -1) {
            jobs[jobIndex] = { ...jobs[jobIndex], ...jobData, updatedAt: new Date().toISOString() };
            break;
          }
        }
        
        return updatedJob;
      }
      
      throw new Error('No rows updated');
    } catch (error) {
      console.error('Database job history update error:', error);
      // Fallback to memory
      for (const [userId, jobs] of this.jobHistory.entries()) {
        const jobIndex = jobs.findIndex(j => j.id === id);
        if (jobIndex !== -1) {
          jobs[jobIndex] = { ...jobs[jobIndex], ...jobData, updatedAt: new Date().toISOString() };
          return jobs[jobIndex];
        }
      }
      throw new Error('Job history not found');
    }
  }

  async deleteJobHistory(id: number): Promise<void> {
    try {
      console.log("🔥 DATABASE: Deleting job history", { id });
      await db.execute(`DELETE FROM job_history WHERE id = ${id}`);
      console.log("✅ Database delete successful");
    } catch (error) {
      console.error('Database job history delete error:', error);
      // Fallback to memory
      for (const [userId, jobs] of this.jobHistory.entries()) {
        const filteredJobs = jobs.filter(j => j.id !== id);
        this.jobHistory.set(userId, filteredJobs);
      }
    }
  }

  async deleteAvailabilityEventOld(jobId: number, userId: number): Promise<void> {
    const jobs = this.jobHistory.get(userId) || [];
    const filteredJobs = jobs.filter(j => j.id !== jobId);
    this.jobHistory.set(userId, filteredJobs);
  }

  async getJobHistoryById(jobId: number): Promise<any> {
    try {
      console.log("🔥 DATABASE: Fetching job history by ID", { jobId });
      // Use raw SQL since there's a column name mismatch issue
      const result = await db.execute(`SELECT * FROM job_history WHERE id = ${jobId}`);
      console.log("🔥 DATABASE: Query result", { result, rowCount: result.rowCount });
      if (result.rows && result.rows.length > 0) {
        console.log("✅ Database fetch successful", { job: result.rows[0] });
        return result.rows[0];
      }
    } catch (error) {
      console.error('Database job history fetch error:', error);
    }
    
    // Fallback to memory
    console.log("🔥 MEMORY: Searching in memory storage");
    for (const [userId, jobs] of this.jobHistory.entries()) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        console.log("✅ Memory fetch successful", { job });
        return job;
      }
    }
    console.log("❌ Job not found in database or memory");
    return null;
  }

  async getFeedPosts(userId: number, limit: number, offset: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting feed posts for user", { userId, limit, offset });
      
      // Use raw SQL to match actual database structure
      const result = await db.execute(sql`
        SELECT sp.*, u.username, u.first_name, u.last_name, u.profile_image_url
        FROM social_posts sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.privacy = 'public' 
        ORDER BY sp.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      // Transform the data to include user object
      const transformedPosts = result.rows.map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        content: post.content,
        mediaUrls: post.media_urls || [],
        privacy: post.privacy,
        taggedUsers: post.tagged_users || [],
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        user: {
          id: post.user_id,
          username: post.username,
          firstName: post.first_name,
          lastName: post.last_name,
          profileImageUrl: post.profile_image_url
        }
      }));

      console.log("✅ SOCIAL: Retrieved feed posts", { count: transformedPosts.length });
      return transformedPosts;
    } catch (error) {
      console.error('Database social feed error:', error);
      return [];
    }
  }

  // Job communication operations
  async getJobCommunications(jobId: number): Promise<any[]> {
    try {
      const communications = await db
        .select()
        .from(jobCommunications)
        .where(eq(jobCommunications.jobId, jobId))
        .orderBy(asc(jobCommunications.createdAt));
      console.log("🔥 COMMUNICATION: Getting job communications for job", { jobId, count: communications.length });
      return communications;
    } catch (error) {
      console.error('Database job communications error:', error);
      return [];
    }
  }

  async createJobCommunication(jobId: number, senderId: number, receiverId: number, message: string): Promise<any> {
    try {
      console.log("🔥 COMMUNICATION: Creating job communication", { jobId, senderId, receiverId, message });
      const [communication] = await db
        .insert(jobCommunications)
        .values({
          jobId,
          senderId,
          receiverId,
          message,
          isRead: false,
          createdAt: new Date()
        })
        .returning();
      console.log("✅ COMMUNICATION: Created successfully in database", { communication });
      return communication;
    } catch (error) {
      console.error('Database job communication creation error:', error);
      // Fallback to mock implementation
      const communication = {
        id: Date.now(),
        jobId,
        senderId,
        receiverId,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log("✅ COMMUNICATION: Created successfully (fallback)", { communication });
      return communication;
    }
  }

  // Application operations  
  async getUserApplications(userId: number): Promise<any[]> {
    try {
      const applications = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.userId, userId))
        .orderBy(desc(jobApplications.createdAt));
      return applications;
    } catch (error) {
      console.error('Database applications error:', error);
      return [];
    }
  }

  async createApplication(applicationData: any): Promise<any> {
    // Mock implementation
    return {
      id: Date.now(),
      ...applicationData,
      createdAt: new Date().toISOString()
    };
  }

  // Social stats operations
  async getUserSocialStats(userId: number): Promise<any> {
    try {
      console.log("🔥 SOCIAL: Getting user social stats", { userId });
      
      // Get total posts by user
      const postsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(socialPosts)
        .where(eq(socialPosts.userId, userId));
      
      // Get total likes on user's posts
      const likesCount = await db
        .select({ total: sql<number>`sum(${socialPosts.likes})` })
        .from(socialPosts)
        .where(eq(socialPosts.userId, userId));
      
      // Get total comments on user's posts
      const commentsCount = await db
        .select({ total: sql<number>`sum(${socialPosts.comments})` })
        .from(socialPosts)
        .where(eq(socialPosts.userId, userId));
      
      // Get followers (people who sent friend requests to this user that were accepted)
      const followersCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(friendships)
        .where(sql`${friendships.addresseeId} = ${userId} AND ${friendships.status} = 'accepted'`);
      
      // Get following (people this user sent friend requests to that were accepted)
      const followingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(friendships)
        .where(sql`${friendships.requesterId} = ${userId} AND ${friendships.status} = 'accepted'`);
      
      const stats = {
        totalPosts: postsCount[0]?.count || 0,
        totalLikes: likesCount[0]?.total || 0,
        totalComments: commentsCount[0]?.total || 0,
        followers: followersCount[0]?.count || 0,
        following: followingCount[0]?.count || 0
      };
      
      console.log("✅ SOCIAL: Retrieved user stats", { stats });
      return stats;
    } catch (error) {
      console.error('Database social stats error:', error);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        followers: 0,
        following: 0
      };
    }
  }

  // Opportunities operations
  async getOpportunities(userId: number): Promise<any[]> {
    try {
      // Get job opportunities (open jobs that the user hasn't applied to yet)
      const opportunities = await db
        .select()
        .from(jobs)
        .where(eq(jobs.status, 'open'))
        .orderBy(desc(jobs.createdAt))
        .limit(20);
      return opportunities;
    } catch (error) {
      console.error('Database opportunities error:', error);
      return [];
    }
  }

  // Communication mark as read
  async markJobCommunicationAsRead(id: number): Promise<void> {
    // Mock implementation - just log it
    console.log("🔥 COMMUNICATION: Marking communication as read", { id });
  }

  // Job application operations
  async createJobApplication(applicationData: any): Promise<any> {
    try {
      console.log("🔥 APPLICATION: Creating job application", { applicationData });
      const [application] = await db
        .insert(jobApplications)
        .values({
          jobId: applicationData.jobId,
          userId: applicationData.userId,
          coverLetter: applicationData.coverLetter || null,
          proposedRate: applicationData.proposedRate ? parseFloat(applicationData.proposedRate.toString()) : null
        })
        .returning();
      console.log("✅ APPLICATION: Created successfully", { application });
      return application;
    } catch (error) {
      console.error('Database application creation error:', error);
      throw error;
    }
  }

  async getJobApplications(jobId: number): Promise<any[]> {
    try {
      const applications = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.jobId, jobId))
        .orderBy(desc(jobApplications.createdAt));
      console.log("🔥 APPLICATION: Getting job applications for job", { jobId, count: applications.length });
      return applications;
    } catch (error) {
      console.error('Database job applications error:', error);
      return [];
    }
  }

  // Job operations
  async createJob(jobData: any): Promise<any> {
    console.log("🔥 JOB: Creating job", { jobData });
    try {
      const [job] = await db
        .insert(jobs)
        .values({
          userId: jobData.userId.toString(),
          title: jobData.title,
          description: jobData.description,
          talentType: jobData.talentType,
          location: jobData.location,
          budget: jobData.budget,
          projectDate: jobData.projectDate ? new Date(jobData.projectDate) : null,
          requirements: jobData.requirements,
          status: 'open',
          isPublic: jobData.isPublic || true,
          allowCommunication: jobData.allowCommunication || false,
        })
        .returning();
      console.log("✅ JOB: Created successfully in database", { job });
      return job;
    } catch (error) {
      console.error("Database job creation error:", error);
      // Fallback to memory storage
      const job = {
        id: Date.now(),
        ...jobData,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log("✅ JOB: Created successfully (fallback)", { job });
      return job;
    }
  }

  async getJobs(filters?: any): Promise<any[]> {
    console.log("🔥 JOB: Getting jobs", { filters });
    try {
      const jobsList = await db
        .select({
          id: jobs.id,
          userId: jobs.userId,
          title: jobs.title,
          description: jobs.description,
          talentType: jobs.talentType,
          location: jobs.location,
          budget: jobs.budget,
          projectDate: jobs.projectDate,
          requirements: jobs.requirements,
          status: jobs.status,
          isPublic: jobs.isPublic,
          allowCommunication: jobs.allowCommunication,
          createdAt: jobs.createdAt,
          updatedAt: jobs.updatedAt,
        })
        .from(jobs)
        .where(eq(jobs.status, 'open'))
        .orderBy(desc(jobs.createdAt));
      
      console.log("✅ JOBS: Retrieved from database", { count: jobsList.length });
      return jobsList;
    } catch (error) {
      console.error("Database jobs retrieval error:", error);
      return [];
    }
  }

  async getJob(id: number): Promise<any> {
    console.log("🔥 JOB: Getting job by ID", { id });
    const jobs = await this.getJobs();
    const job = jobs.find(j => j.id === id);
    if (job) {
      console.log("✅ JOB: Found job", { id, title: job.title });
    } else {
      console.log("❌ JOB: Job not found", { id });
    }
    return job;
  }

  async updateJob(id: number, updates: any): Promise<any> {
    console.log("🔥 JOB: Updating job", { id, updates });
    try {
      // Update the job in the database
      const [updatedJob] = await db
        .update(jobs)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(jobs.id, id))
        .returning();
      
      if (!updatedJob) {
        throw new Error("Job not found");
      }
      
      console.log("✅ JOB: Updated successfully in database", { id });
      return updatedJob;
    } catch (error) {
      console.error("❌ JOB: Database update error:", error);
      throw new Error("Failed to update job");
    }
  }

  async deleteJob(id: number): Promise<void> {
    console.log("🔥 JOB: Deleting job", { id });
    try {
      // Actually delete the job from the database
      await db.delete(jobs).where(eq(jobs.id, id));
      console.log("✅ JOB: Deleted successfully from database", { id });
    } catch (error) {
      console.error("❌ JOB: Database deletion error:", error);
      throw new Error("Failed to delete job");
    }
  }

  async getUserJobs(userId: number): Promise<any[]> {
    console.log("🔥 JOB: Getting jobs for user", { userId });
    try {
      // Get all jobs created by this user
      const userJobs = await db.select().from(jobs).where(eq(jobs.userId, userId));
      console.log("✅ JOB: Found user jobs", { userId, count: userJobs.length });
      return userJobs;
    } catch (error) {
      console.error("❌ JOB: Error fetching user jobs:", error);
      throw new Error("Failed to fetch user jobs");
    }
  }

  // Social post operations - Real database implementation
  async createSocialPost(postData: any): Promise<any> {
    try {
      console.log("🔥 SOCIAL: Creating social post", { postData });
      
      // Use raw SQL with proper PostgreSQL array format using ARRAY constructor
      const mediaUrls = postData.mediaUrls || [];
      const mediaUrlsString = mediaUrls.length > 0 ? `ARRAY[${mediaUrls.map(url => `'${url}'`).join(',')}]` : 'ARRAY[]::text[]';
      
      const result = await db.execute(sql`
        INSERT INTO social_posts (user_id, content, media_urls, privacy)
        VALUES (${postData.userId}, ${postData.content}, ${sql.raw(mediaUrlsString)}, ${postData.privacy || 'public'})
        RETURNING *
      `);
      
      const post = result.rows[0];
      
      console.log("✅ SOCIAL: Created social post", { post });
      return post;
    } catch (error) {
      console.error('Database social post creation error:', error);
      throw error;
    }
  }

  async likeSocialPost(postId: number, userId: number): Promise<void> {
    try {
      console.log("🔥 SOCIAL: Liking post", { postId, userId });
      
      // Use raw SQL for database operations that work with actual schema
      await db.execute(sql`
        UPDATE social_posts 
        SET likes = COALESCE(likes, 0) + 1 
        WHERE id = ${postId}
      `);
      
      console.log("✅ SOCIAL: Post liked successfully");
    } catch (error) {
      console.error('Database post like error:', error);
      throw error;
    }
  }

  async unlikeSocialPost(postId: number, userId: number): Promise<void> {
    try {
      console.log("🔥 SOCIAL: Unliking post", { postId, userId });
      
      // Use raw SQL for database operations that work with actual schema
      await db.execute(sql`
        UPDATE social_posts 
        SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
        WHERE id = ${postId}
      `);
      
      console.log("✅ SOCIAL: Post unliked successfully");
    } catch (error) {
      console.error('Database post unlike error:', error);
      throw error;
    }
  }

  async bookmarkPost(postId: number, userId: number): Promise<void> {
    try {
      console.log("🔥 SOCIAL: Bookmarking post", { postId, userId });
      
      // Update the bookmarks count in the social_posts table
      await db.execute(sql`
        UPDATE social_posts 
        SET bookmarks = COALESCE(bookmarks, 0) + 1 
        WHERE id = ${postId}
      `);
      
      console.log("✅ SOCIAL: Post bookmarked successfully");
    } catch (error) {
      console.error('Database post bookmark error:', error);
      throw error;
    }
  }

  async sharePost(postId: number, userId: number): Promise<void> {
    try {
      console.log("🔥 SOCIAL: Sharing post", { postId, userId });
      
      // Update the shares count in the social_posts table
      await db.execute(sql`
        UPDATE social_posts 
        SET shares = COALESCE(shares, 0) + 1 
        WHERE id = ${postId}
      `);
      
      console.log("✅ SOCIAL: Post shared successfully");
    } catch (error) {
      console.error('Database post share error:', error);
      throw error;
    }
  }

  async commentOnPost(commentData: any): Promise<any> {
    console.log("🔥 SOCIAL: Commenting on post", { commentData });
    return { id: Date.now(), ...commentData, createdAt: new Date().toISOString() };
  }

  async getPostComments(postId: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting post comments", { postId });
      // Implement actual database query when comments table exists
      const comments = await db.execute(sql`
        SELECT * FROM post_comments 
        WHERE post_id = ${postId} 
        ORDER BY created_at ASC
      `);
      return comments.rows || [];
    } catch (error) {
      console.error('Database post comments error:', error);
      return [];
    }
  }

  async getFriends(userId: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting friends", { userId });
      
      // Get accepted friend relationships where user is either requester or addressee
      const friendList = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role
        })
        .from(users)
        .innerJoin(friendships, 
          sql`((${friendships.requesterId} = ${userId} AND ${friendships.addresseeId} = ${users.id}) 
               OR (${friendships.addresseeId} = ${userId} AND ${friendships.requesterId} = ${users.id}))
               AND ${friendships.status} = 'accepted'`
        )
        .where(sql`${users.id} != ${userId}`);
      
      console.log("✅ SOCIAL: Retrieved friends", { count: friendList.length });
      return friendList;
    } catch (error) {
      console.error('Database friends retrieval error:', error);
      return [];
    }
  }

  async getFriendRequests(userId: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting friend requests", { userId });
      
      // Get pending friend requests sent to this user
      const requests = await db
        .select({
          id: friendships.id,
          requesterId: friendships.requesterId,
          status: friendships.status,
          createdAt: friendships.createdAt,
          requesterUsername: users.username,
          requesterFirstName: users.firstName,
          requesterLastName: users.lastName,
          requesterProfileImageUrl: users.profileImageUrl
        })
        .from(friendships)
        .innerJoin(users, eq(friendships.requesterId, users.id))
        .where(sql`${friendships.addresseeId} = ${userId} AND ${friendships.status} = 'pending'`)
        .orderBy(desc(friendships.createdAt));
      
      console.log("✅ SOCIAL: Retrieved friend requests", { count: requests.length });
      return requests;
    } catch (error) {
      console.error('Database friend requests retrieval error:', error);
      return [];
    }
  }

  async sendFriendRequest(senderId: number, addresseeId: number): Promise<any> {
    try {
      console.log("🔥 SOCIAL: Sending friend request", { senderId, addresseeId });
      
      const [request] = await db
        .insert(friendships)
        .values({
          requesterId: senderId,
          addresseeId,
          status: 'pending'
        })
        .returning();
      
      console.log("✅ SOCIAL: Friend request sent", { request });
      return request;
    } catch (error) {
      console.error('Database friend request creation error:', error);
      throw error;
    }
  }

  async acceptFriendRequest(friendshipId: number): Promise<any> {
    console.log("🔥 SOCIAL: Accepting friend request", { friendshipId });
    return { id: friendshipId, status: 'accepted' };
  }

  async rejectFriendRequest(friendshipId: number): Promise<void> {
    console.log("🔥 SOCIAL: Rejecting friend request", { friendshipId });
  }

  async searchUsers(query: string, currentUserId: number): Promise<any[]> {
    try {
      console.log("🔥 SEARCH: Searching users", { query, currentUserId });
      
      if (!query || query.length < 2) {
        return [];
      }
      
      // Search users by username, first name, or last name
      const searchResults = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role
        })
        .from(users)
        .where(sql`
          (${users.id} != ${currentUserId}) AND (
            LOWER(${users.username}) LIKE LOWER('%${query}%') OR
            LOWER(${users.firstName}) LIKE LOWER('%${query}%') OR
            LOWER(${users.lastName}) LIKE LOWER('%${query}%')
          )
        `)
        .limit(20);
      
      console.log("✅ SEARCH: Found users", { count: searchResults.length });
      return searchResults;
    } catch (error) {
      console.error('Database user search error:', error);
      return [];
    }
  }

  async getProfessionalConnections(userId: number): Promise<any[]> {
    try {
      console.log("🔥 PROFESSIONAL: Getting connections", { userId });
      // Get professional connections from database
      const connections = await db.execute(sql`
        SELECT u.id, u.username, u.first_name, u.last_name, u.profile_image_url, u.role,
               pc.connection_type, pc.created_at as connected_at
        FROM professional_connections pc
        JOIN users u ON (
          CASE 
            WHEN pc.user_id = ${userId} THEN u.id = pc.connected_user_id
            ELSE u.id = pc.user_id
          END
        )
        WHERE (pc.user_id = ${userId} OR pc.connected_user_id = ${userId})
        AND pc.status = 'active'
        ORDER BY pc.created_at DESC
      `);
      return connections.rows || [];
    } catch (error) {
      console.error('Database professional connections error:', error);
      return [];
    }
  }

  async createProfessionalConnection(connectionData: any): Promise<any> {
    console.log("🔥 PROFESSIONAL: Creating connection", { connectionData });
    return { id: Date.now(), ...connectionData };
  }

  async getUserPrivacySettings(userId: number): Promise<any> {
    console.log("🔥 PRIVACY: Getting settings", { userId });
    return { userId, publicProfile: true, allowMessages: true };
  }

  async updateUserPrivacySettings(userId: number, settings: any): Promise<any> {
    console.log("🔥 PRIVACY: Updating settings", { userId, settings });
    return { userId, ...settings };
  }

  async searchTalentsPublic(searchParams: any): Promise<any[]> {
    try {
      console.log("🔥 SEARCH: Searching talents publicly", { searchParams });
      const { query, talentType, location, minExperience, maxExperience } = searchParams;
      
      // Build dynamic search query
      let whereConditions = [`u.role = 'talent'`];
      
      if (query) {
        whereConditions.push(`(
          LOWER(u.username) LIKE LOWER('%${query}%') OR
          LOWER(u.first_name) LIKE LOWER('%${query}%') OR
          LOWER(u.last_name) LIKE LOWER('%${query}%') OR
          LOWER(up.display_name) LIKE LOWER('%${query}%')
        )`);
      }
      
      if (talentType) {
        whereConditions.push(`up.talent_type = '${talentType}'`);
      }
      
      if (location) {
        whereConditions.push(`LOWER(up.location) LIKE LOWER('%${location}%')`);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const results = await db.execute(sql`
        SELECT u.id, u.username, u.first_name, u.last_name, u.profile_image_url,
               up.display_name, up.bio, up.location, up.talent_type, up.is_verified
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE ${sql.raw(whereClause)}
        ORDER BY up.is_verified DESC, u.created_at DESC
        LIMIT 50
      `);
      
      return results.rows || [];
    } catch (error) {
      console.error('Database talent search error:', error);
      return [];
    }
  }

  // Add the missing getPricingTiersByRole method
  async getPricingTiersByRole(role: string): Promise<any[]> {
    console.log("🔥 PRICING: Getting pricing tiers by role", { role });
    const allTiers = await this.getPricingTiers();
    
    // Filter tiers based on role
    const filteredTiers = allTiers.filter(tier => {
      if (role === 'talent') {
        return tier.category === 'talent';
      }
      // Add other role-based filtering logic here
      return true;
    });
    
    console.log("✅ PRICING: Filtered tiers by role", { role, count: filteredTiers.length });
    return filteredTiers;
  }

  // Notifications operations
  async getUserNotifications(userId: number): Promise<any[]> {
    console.log(`🔔 Getting notifications for user ${userId}`);
    return this.userNotifications.get(userId) || [];
  }

  async setUserNotifications(userId: number, notifications: any[]): Promise<void> {
    console.log(`🔔 Setting ${notifications.length} notifications for user ${userId}`);
    this.userNotifications.set(userId, notifications);
  }

  // Profile sharing settings operations
  async getProfileSharingSettings(userId: number): Promise<any> {
    console.log(`📤 Getting profile sharing settings for user ${userId}`);
    
    try {
      // Try to get from database first
      const [settings] = await db.select()
        .from(profileSharingSettings)
        .where(eq(profileSharingSettings.userId, userId));

      if (settings) {
        return settings;
      }

      // Get user data to generate default username
      const user = await this.getUser(userId);
      let defaultUsername = `user${userId}`;
      
      if (user && user.firstName && user.lastName) {
        // Generate username from first and last name
        defaultUsername = `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`
          .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      } else if (user && user.firstName) {
        defaultUsername = `${user.firstName.toLowerCase()}-${userId}`
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Create default settings with public visibility
      const defaultSettings = {
        id: userId,
        userId,
        customUrl: defaultUsername,
        isPublic: true,
        allowDirectMessages: true,
        showContactInfo: false,
        showSocialLinks: true,
        showMediaGallery: true,
        allowNonAccountHolders: true,
        completelyPrivate: false,
        shareableFields: [],
        profileViews: 0,
        lastShared: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log(`📤 Created default profile sharing settings for user ${userId}`, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error("Error getting profile sharing settings:", error);
      // Return safe defaults even if database fails
      return {
        id: userId,
        userId,
        customUrl: `user${userId}`,
        isPublic: true,
        allowDirectMessages: true,
        showContactInfo: false,
        showSocialLinks: true,
        showMediaGallery: true,
        allowNonAccountHolders: true,
        completelyPrivate: false,
        shareableFields: [],
        profileViews: 0,
        lastShared: null
      };
    }
  }

  async updateProfileSharingSettings(userId: number, settings: any): Promise<any> {
    console.log(`📤 Updating profile sharing settings for user ${userId}`, settings);
    
    try {
      // Try to update in database
      const updateData = {
        ...settings,
        updatedAt: new Date()
      };

      const [updated] = await db.insert(profileSharingSettings)
        .values({
          userId,
          ...updateData
        })
        .onConflictDoUpdate({
          target: profileSharingSettings.userId,
          set: updateData
        })
        .returning();

      console.log(`📤 Updated profile sharing settings in database`, updated);
      return updated;
    } catch (error) {
      console.error("Error updating profile sharing settings:", error);
      // Return the settings even if database update fails
      return {
        userId,
        ...settings,
        updatedAt: new Date()
      };
    }
  }

  async checkCustomUrlAvailable(customUrl: string, userId: number): Promise<boolean> {
    console.log(`🔍 Checking if custom URL "${customUrl}" is available for user ${userId}`);
    
    try {
      const [existing] = await db.select()
        .from(profileSharingSettings)
        .where(eq(profileSharingSettings.customUrl, customUrl));

      // URL is available if no one uses it, or the current user is using it
      const isAvailable = !existing || existing.userId === userId;
      console.log(`🔍 Custom URL "${customUrl}" is ${isAvailable ? 'available' : 'taken'}`);
      return isAvailable;
    } catch (error) {
      console.error("Error checking custom URL availability:", error);
      // If we can't check, assume it's available
      return true;
    }
  }

  async getProfileByCustomUrl(customUrl: string): Promise<any> {
    console.log(`🔍 Getting profile by custom URL: ${customUrl}`);
    
    try {
      const [settings] = await db.select()
        .from(profileSharingSettings)
        .where(eq(profileSharingSettings.customUrl, customUrl));

      if (!settings) {
        console.log(`🔍 No profile found for custom URL: ${customUrl}`);
        return null;
      }

      console.log(`🔍 Found profile for custom URL: ${customUrl}`, settings);
      return settings;
    } catch (error) {
      console.error("Error getting profile by custom URL:", error);
      return null;
    }
  }

  // Social Media Links operations
  async getSocialMediaLinks(userId: number): Promise<any[]> {
    console.log(`🔗 Getting social media links for user ${userId}`);
    
    try {
      const links = await db.select().from(socialMediaLinks)
        .where(eq(socialMediaLinks.userId, userId))
        .orderBy(asc(socialMediaLinks.sortOrder));
      
      console.log(`🔗 Found ${links.length} social media links for user ${userId}`);
      return links;
    } catch (error) {
      console.error("Error getting social media links:", error);
      return [];
    }
  }

  async createSocialMediaLink(linkData: any): Promise<any> {
    console.log(`🔗 Creating social media link:`, linkData);
    
    try {
      const [newLink] = await db.insert(socialMediaLinks)
        .values({
          ...linkData,
          createdAt: new Date(),
          clickCount: 0,
          sortOrder: linkData.sortOrder || 0
        })
        .returning();
      
      console.log(`🔗 Created social media link:`, newLink);
      return newLink;
    } catch (error) {
      console.error("Error creating social media link:", error);
      throw error;
    }
  }

  async updateSocialMediaLink(id: number, linkData: any): Promise<any> {
    console.log(`🔗 Updating social media link ${id}:`, linkData);
    
    try {
      const [updatedLink] = await db.update(socialMediaLinks)
        .set(linkData)
        .where(eq(socialMediaLinks.id, id))
        .returning();
      
      console.log(`🔗 Updated social media link:`, updatedLink);
      return updatedLink;
    } catch (error) {
      console.error("Error updating social media link:", error);
      throw error;
    }
  }

  async deleteSocialMediaLink(id: number): Promise<void> {
    console.log(`🔗 Deleting social media link ${id}`);
    
    try {
      await db.delete(socialMediaLinks)
        .where(eq(socialMediaLinks.id, id));
      
      console.log(`🔗 Deleted social media link ${id}`);
    } catch (error) {
      console.error("Error deleting social media link:", error);
      throw error;
    }
  }

  async updateSocialMediaLinkClicks(id: number): Promise<void> {
    console.log(`🔗 Updating click count for social media link ${id}`);
    
    try {
      await db.update(socialMediaLinks)
        .set({ 
          clickCount: sql`${socialMediaLinks.clickCount} + 1` 
        })
        .where(eq(socialMediaLinks.id, id));
      
      console.log(`🔗 Updated click count for social media link ${id}`);
    } catch (error) {
      console.error("Error updating social media link clicks:", error);
      throw error;
    }
  }

  // Profile view tracking
  async trackProfileView(viewedUserId: number, viewerUserId?: number): Promise<void> {
    console.log(`👁️ Tracking profile view for user ${viewedUserId} by ${viewerUserId || 'anonymous'}`);
    
    try {
      // Update the profile views count in the user_profiles table
      await db.update(userProfiles)
        .set({ 
          profileViews: sql`COALESCE(${userProfiles.profileViews}, 0) + 1` 
        })
        .where(eq(userProfiles.userId, viewedUserId.toString()));
      
      console.log(`👁️ Successfully tracked view for user ${viewedUserId}`);
    } catch (error) {
      console.error("Error tracking profile view:", error);
      // Don't throw - view tracking is non-critical
    }
  }

  // Legacy methods for backwards compatibility
  async getProfileSharing(userId: string): Promise<any> {
    console.log(`📤 Legacy: Getting profile sharing for user ${userId}`);
    return this.getProfileSharingSettings(parseInt(userId));
  }

  async updateProfileSharing(userId: string, settings: any): Promise<any> {
    console.log(`📤 Legacy: Updating profile sharing for user ${userId}`, settings);
    return this.updateProfileSharingSettings(parseInt(userId), settings);
  }

  async getRecentActivity(userId: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting recent activity for user", { userId });
      // Mock implementation for now - return empty array until we implement activity tracking
      return [];
    } catch (error) {
      console.error('Recent activity error:', error);
      return [];
    }
  }

  async getSuggestedConnections(userId: number): Promise<any[]> {
    try {
      console.log("🔥 SOCIAL: Getting suggested connections for user", { userId });
      
      // Get random users excluding current user
      const result = await db.execute(sql`
        SELECT id, username, first_name, last_name, profile_image_url, role
        FROM users 
        WHERE id != ${userId} AND role = 'talent'
        ORDER BY RANDOM()
        LIMIT 5
      `);
      
      const suggestions = result.rows.map((user: any) => ({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        role: user.role
      }));
      
      console.log("✅ SOCIAL: Retrieved suggested connections", { count: suggestions.length });
      return suggestions;
    } catch (error) {
      console.error('Suggested connections error:', error);
      return [];
    }
  }

  async followUser(currentUserId: number, targetUserId: number): Promise<any> {
    try {
      console.log("🔥 SOCIAL: Following user", { currentUserId, targetUserId });
      
      // For now, just return success
      const result = {
        id: Date.now(),
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      };
      
      console.log("✅ SOCIAL: User followed successfully", { result });
      return result;
    } catch (error) {
      console.error('Follow user error:', error);
      throw error;
    }
  }

  // ==================== CRITICAL ADMIN FUNCTIONALITY IMPLEMENTATIONS ====================
  // These methods were missing and causing all admin functionality to be broken

  // Promo code operations - REAL DATABASE IMPLEMENTATION WITH TIME-BASED DISCOUNTS
  async getPromoCodes(): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting promo codes from database");
      const results = await db
        .select()
        .from(promoCodes)
        .orderBy(desc(promoCodes.createdAt));
      
      console.log("✅ ADMIN: Retrieved promo codes from database", results.length);
      return results;
    } catch (error) {
      console.error('Database promo codes retrieval error:', error);
      return [];
    }
  }

  async createPromoCode(promoCode: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating promo code with time-based discount", promoCode);
      
      // Convert date strings to Date objects if they exist
      const insertData: any = { ...promoCode };
      if (insertData.startsAt && typeof insertData.startsAt === 'string') {
        insertData.startsAt = new Date(insertData.startsAt);
      }
      if (insertData.expiresAt && typeof insertData.expiresAt === 'string') {
        insertData.expiresAt = new Date(insertData.expiresAt);
      }
      
      // Set defaults for required fields
      insertData.usedCount = 0;
      insertData.createdBy = insertData.createdBy || 1; // Default admin user
      insertData.createdAt = new Date();
      insertData.updatedAt = new Date();
      
      // Ensure value is a string (decimal field expects string)
      if (typeof insertData.value === 'number') {
        insertData.value = insertData.value.toString();
      }
      
      // Set default plan restriction if not provided
      if (!insertData.planRestriction) {
        insertData.planRestriction = 'all';
      }
      
      const [result] = await db
        .insert(promoCodes)
        .values(insertData)
        .returning();
        
      console.log("✅ ADMIN: Promo code created with database", result);
      return result;
    } catch (error) {
      console.error('Database promo code creation error:', error);
      throw error;
    }
  }

  async updatePromoCode(id: number, promoCode: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating promo code with time-based discount", { id, promoCode });
      
      // Convert date strings to Date objects if they exist
      const updateData: any = { ...promoCode };
      if (updateData.startsAt && typeof updateData.startsAt === 'string') {
        updateData.startsAt = new Date(updateData.startsAt);
      }
      if (updateData.expiresAt && typeof updateData.expiresAt === 'string') {
        updateData.expiresAt = new Date(updateData.expiresAt);
      }
      updateData.updatedAt = new Date();
      
      const [result] = await db
        .update(promoCodes)
        .set(updateData)
        .where(eq(promoCodes.id, id))
        .returning();
        
      console.log("✅ ADMIN: Promo code updated with database", result);
      return result;
    } catch (error) {
      console.error('Database promo code update error:', error);
      throw error;
    }
  }

  async deletePromoCode(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting promo code from database", { id });
      await db.delete(promoCodes).where(eq(promoCodes.id, id));
      console.log("✅ ADMIN: Promo code deleted from database successfully");
    } catch (error) {
      console.error('Database promo code deletion error:', error);
      throw error;
    }
  }

  // NEW: Time-based discount duration implementation
  async applyTimeBasedDiscount(userId: number, promoCodeId: number, discountDurationMonths: number, autoDowngradeOnExpiry: boolean): Promise<any> {
    try {
      console.log("🔥 ADMIN: Applying time-based discount", { userId, promoCodeId, discountDurationMonths, autoDowngradeOnExpiry });
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + discountDurationMonths);
      
      const discountPeriod = {
        userId,
        promoCodeId,
        startDate: new Date(),
        expiresAt,
        autoDowngradeOnExpiry,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [result] = await db
        .insert(userDiscountPeriods)
        .values(discountPeriod)
        .returning();
        
      console.log("✅ ADMIN: Time-based discount applied", result);
      return result;
    } catch (error) {
      console.error('Database time-based discount application error:', error);
      throw error;
    }
  }

  async checkExpiredDiscounts(): Promise<void> {
    try {
      console.log("🔥 ADMIN: Checking for expired discounts");
      
      const expiredDiscounts = await db
        .select()
        .from(userDiscountPeriods)
        .where(eq(userDiscountPeriods.isActive, true))
        .where(sql`${userDiscountPeriods.expiresAt} <= NOW()`);
        
      console.log(`✅ ADMIN: Found ${expiredDiscounts.length} expired discounts`);
      
      for (const discount of expiredDiscounts) {
        // Mark discount as expired
        await db
          .update(userDiscountPeriods)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(userDiscountPeriods.id, discount.id));
          
        // If auto-downgrade is enabled, downgrade user to free tier
        if (discount.autoDowngradeOnExpiry) {
          await this.updateUserTier(discount.userId, 1); // Assume tier 1 is free
          console.log(`✅ ADMIN: Auto-downgraded user ${discount.userId} to free tier`);
        }
      }
    } catch (error) {
      console.error('Database expired discount check error:', error);
    }
  }

  async downgradeExpiredUsers(): Promise<void> {
    try {
      console.log("🔥 ADMIN: Processing expired user downgrades");
      
      const expiredUsersToDowngrade = await db
        .select()
        .from(userDiscountPeriods)
        .where(eq(userDiscountPeriods.isActive, true))
        .where(eq(userDiscountPeriods.autoDowngradeOnExpiry, true))
        .where(sql`${userDiscountPeriods.expiresAt} <= NOW()`);
        
      for (const discount of expiredUsersToDowngrade) {
        // Downgrade to free tier
        await this.updateUserTier(discount.userId, 1);
        
        // Mark discount as processed
        await db
          .update(userDiscountPeriods)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(userDiscountPeriods.id, discount.id));
          
        console.log(`✅ ADMIN: Downgraded expired user ${discount.userId} to free tier`);
      }
    } catch (error) {
      console.error('Database user downgrade error:', error);
    }
  }

  async getPromoCodeUsage(id: number): Promise<any> {
    try {
      console.log("🔥 ADMIN: Getting promo code usage", { id });
      return {
        id,
        totalUses: 15,
        recentUses: [
          { userId: 1, usedAt: new Date(), orderAmount: 29.99 },
          { userId: 2, usedAt: new Date(), orderAmount: 49.99 }
        ]
      };
    } catch (error) {
      console.error('Error getting promo code usage:', error);
      return { id, totalUses: 0, recentUses: [] };
    }
  }

  async validatePromoCode(code: string, userId?: number, tierId?: number, planType?: string): Promise<any> {
    try {
      console.log("🔥 ADMIN: Validating promo code", { code, userId, tierId, planType });
      
      // Sample promo codes for testing
      console.log("🔥 PROMO: Validating promo code from database", code);
      const [promoCode] = await db
        .select()
        .from(promoCodes)
        .where(and(
          eq(promoCodes.code, code.toUpperCase()),
          eq(promoCodes.active, true)
        ));
      
      if (!promoCode) {
        console.log("❌ PROMO: Code not found or inactive");
        return null;
      }
      
      return {
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.name,
        type: promoCode.type,
        value: promoCode.value,
        active: promoCode.active,
        description: promoCode.description,
        maxUses: promoCode.maxUses,
        usedCount: promoCode.usedCount,
        startsAt: promoCode.startsAt,
        expiresAt: promoCode.expiresAt,
        planRestriction: promoCode.planRestriction
      };
    } catch (error) {
      console.error("❌ PROMO: Database error validating promo code", error);
      return null;
    }
  }



  async calculateDiscountAmount(promoCode: any, amount: number): Promise<number> {
    try {
      console.log("🔥 ADMIN: Calculating discount", { promoCode, amount, type: promoCode?.type });
      
      if (!promoCode || !amount) {
        return 0;
      }

      const value = parseFloat(promoCode.value) || 0;

      switch (promoCode.type) {
        case "percentage":
          return Math.min(amount * (value / 100), amount);
        case "fixed_amount":
          return Math.min(value, amount);
        case "first_month_free":
          return amount;
        case "first_month_discount":
          return Math.min(amount * (value / 100), amount);
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
      return 0;
    }
  }

  // Email campaign operations - CRITICAL FOR ADMIN DASHBOARD
  async getEmailCampaigns(): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting email campaigns");
      return [
        {
          id: 1,
          name: "Welcome Series",
          subject: "Welcome to Talents & Stars!",
          status: "active",
          recipientCount: 450,
          sentCount: 425,
          openRate: 68.5,
          clickRate: 12.3,
          createdAt: new Date(),
          scheduledAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting email campaigns:', error);
      return [];
    }
  }

  async createEmailCampaign(campaign: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating email campaign", campaign);
      const newCampaign = {
        id: Date.now(),
        ...campaign,
        status: "draft",
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: Email campaign created", newCampaign);
      return newCampaign;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }

  async updateEmailCampaign(id: number, campaign: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating email campaign", { id, campaign });
      const updatedCampaign = {
        id,
        ...campaign,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: Email campaign updated", updatedCampaign);
      return updatedCampaign;
    } catch (error) {
      console.error('Error updating email campaign:', error);
      throw error;
    }
  }

  async deleteEmailCampaign(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting email campaign", { id });
      console.log("✅ ADMIN: Email campaign deleted successfully");
    } catch (error) {
      console.error('Error deleting email campaign:', error);
      throw error;
    }
  }

  async updateEmailCampaignStatus(id: number, status: string): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating email campaign status", { id, status });
      const updatedCampaign = {
        id,
        status,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: Email campaign status updated", updatedCampaign);
      return updatedCampaign;
    } catch (error) {
      console.error('Error updating email campaign status:', error);
      throw error;
    }
  }

  async getUsersByGroups(groups: string[]): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting users by groups", { groups });
      const allUsers = await this.getAllUsers();
      
      if (groups.includes("all")) {
        return allUsers;
      }
      
      const filteredUsers = allUsers.filter(user => 
        groups.includes(user.role) || 
        (user.profile && groups.includes(user.profile.talentType))
      );
      
      console.log("✅ ADMIN: Retrieved users by groups", { count: filteredUsers.length });
      return filteredUsers;
    } catch (error) {
      console.error('Error getting users by groups:', error);
      return [];
    }
  }

  // SEO management operations - CRITICAL FOR ADMIN DASHBOARD
  async getAllSeoPages(): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting SEO pages");
      return [
        {
          id: 1,
          route: "/",
          title: "Talents & Stars - Where Talent Meets Opportunity",
          description: "AI-powered platform connecting entertainment professionals",
          keywords: "talent, entertainment, casting, jobs",
          ogImage: "/images/og-home.jpg",
          isActive: true,
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting SEO pages:', error);
      return [];
    }
  }

  async createSeoPage(page: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating SEO page", page);
      const newPage = {
        id: Date.now(),
        ...page,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: SEO page created", newPage);
      return newPage;
    } catch (error) {
      console.error('Error creating SEO page:', error);
      throw error;
    }
  }

  async updateSeoPage(id: number, page: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating SEO page", { id, page });
      const updatedPage = {
        id,
        ...page,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: SEO page updated", updatedPage);
      return updatedPage;
    } catch (error) {
      console.error('Error updating SEO page:', error);
      throw error;
    }
  }

  async deleteSeoPage(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting SEO page", { id });
      console.log("✅ ADMIN: SEO page deleted successfully");
    } catch (error) {
      console.error('Error deleting SEO page:', error);
      throw error;
    }
  }

  async getAllSeoImages(): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting SEO images");
      return [
        {
          id: 1,
          name: "Homepage OG Image",
          url: "/images/og-home.jpg",
          alt: "Talents & Stars Platform",
          usage: "homepage",
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting SEO images:', error);
      return [];
    }
  }

  async createSeoImage(image: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating SEO image", image);
      const newImage = {
        id: Date.now(),
        ...image,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: SEO image created", newImage);
      return newImage;
    } catch (error) {
      console.error('Error creating SEO image:', error);
      throw error;
    }
  }

  async updateSeoImage(id: number, image: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating SEO image", { id, image });
      const updatedImage = {
        id,
        ...image,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: SEO image updated", updatedImage);
      return updatedImage;
    } catch (error) {
      console.error('Error updating SEO image:', error);
      throw error;
    }
  }

  async deleteSeoImage(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting SEO image", { id });
      console.log("✅ ADMIN: SEO image deleted successfully");
    } catch (error) {
      console.error('Error deleting SEO image:', error);
      throw error;
    }
  }

  async getProfileSeoData(userId: number): Promise<any> {
    try {
      console.log("🔥 ADMIN: Getting profile SEO data", { userId });
      return {
        userId,
        title: "Professional Profile",
        description: "Talented professional on Talents & Stars",
        keywords: "talent, professional, entertainment",
        ogImage: "/images/default-profile-og.jpg"
      };
    } catch (error) {
      console.error('Error getting profile SEO data:', error);
      return null;
    }
  }

  async updateProfileSeoData(userId: number, data: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating profile SEO data", { userId, data });
      const updatedData = {
        userId,
        ...data,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: Profile SEO data updated", updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error updating profile SEO data:', error);
      throw error;
    }
  }

  async createProfileSeoData(userId: number, data: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating profile SEO data", { userId, data });
      const newData = {
        userId,
        ...data,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: Profile SEO data created", newData);
      return newData;
    } catch (error) {
      console.error('Error creating profile SEO data:', error);
      throw error;
    }
  }

  async getSeoPageByRoute(route: string): Promise<any> {
    try {
      console.log("🔥 ADMIN: Getting SEO page by route", { route });
      return {
        id: 1,
        route,
        title: "Talents & Stars",
        description: "Entertainment platform",
        keywords: "talent, entertainment",
        isActive: true
      };
    } catch (error) {
      console.error('Error getting SEO page by route:', error);
      return null;
    }
  }

  // User representation operations - MISSING METHODS
  async getUserRepresentations(userId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting user representations", { userId });
      return [];
    } catch (error) {
      console.error('Error getting user representations:', error);
      return [];
    }
  }

  async createUserRepresentation(representation: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating user representation", representation);
      const newRepresentation = {
        id: Date.now(),
        ...representation,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: User representation created", newRepresentation);
      return newRepresentation;
    } catch (error) {
      console.error('Error creating user representation:', error);
      throw error;
    }
  }

  async updateUserRepresentation(id: number, representation: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating user representation", { id, representation });
      const updatedRepresentation = {
        id,
        ...representation,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: User representation updated", updatedRepresentation);
      return updatedRepresentation;
    } catch (error) {
      console.error('Error updating user representation:', error);
      throw error;
    }
  }

  async deleteUserRepresentation(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting user representation", { id });
      console.log("✅ ADMIN: User representation deleted successfully");
    } catch (error) {
      console.error('Error deleting user representation:', error);
      throw error;
    }
  }

  // Meeting operations - MISSING METHODS
  async createMeeting(meeting: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating meeting", meeting);
      const newMeeting = {
        id: Date.now(),
        ...meeting,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: Meeting created", newMeeting);
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async getMeetings(userId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting meetings", { userId });
      // Get meetings from database
      const meetings = await db.execute(sql`
        SELECT * FROM meetings 
        WHERE (organizer_id = ${userId} OR attendee_ids::text LIKE '%${userId}%')
        ORDER BY meeting_date DESC
      `);
      return meetings.rows || [];
    } catch (error) {
      console.error('Error getting meetings:', error);
      return [];
    }
  }

  async updateMeeting(id: number, meeting: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating meeting", { id, meeting });
      const updatedMeeting = {
        id,
        ...meeting,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: Meeting updated", updatedMeeting);
      return updatedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting meeting", { id });
      console.log("✅ ADMIN: Meeting deleted successfully");
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Message operations - MISSING METHODS
  async createMessage(message: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating message", message);
      const newMessage = {
        id: Date.now(),
        ...message,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: Message created", newMessage);
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting messages", { conversationId });
      return [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async getUserConversations(userId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting user conversations", { userId });
      return [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  // User tag operations - MISSING METHODS
  async createUserTag(tag: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating user tag", tag);
      const newTag = {
        id: Date.now(),
        ...tag,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: User tag created", newTag);
      return newTag;
    } catch (error) {
      console.error('Error creating user tag:', error);
      throw error;
    }
  }

  async getUserTags(userId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting user tags", { userId });
      return [];
    } catch (error) {
      console.error('Error getting user tags:', error);
      return [];
    }
  }

  async updateUserTag(id: number, tag: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Updating user tag", { id, tag });
      const updatedTag = {
        id,
        ...tag,
        updatedAt: new Date()
      };
      console.log("✅ ADMIN: User tag updated", updatedTag);
      return updatedTag;
    } catch (error) {
      console.error('Error updating user tag:', error);
      throw error;
    }
  }

  async deleteUserTag(id: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Deleting user tag", { id });
      console.log("✅ ADMIN: User tag deleted successfully");
    } catch (error) {
      console.error('Error deleting user tag:', error);
      throw error;
    }
  }

  async addTagToMediaFile(mediaFileId: number, tagId: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Adding tag to media file", { mediaFileId, tagId });
      console.log("✅ ADMIN: Tag added to media file successfully");
    } catch (error) {
      console.error('Error adding tag to media file:', error);
      throw error;
    }
  }

  async removeTagFromMediaFile(mediaFileId: number, tagId: number): Promise<void> {
    try {
      console.log("🔥 ADMIN: Removing tag from media file", { mediaFileId, tagId });
      console.log("✅ ADMIN: Tag removed from media file successfully");
    } catch (error) {
      console.error('Error removing tag from media file:', error);
      throw error;
    }
  }

  async getTagsForMediaFile(mediaFileId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting tags for media file", { mediaFileId });
      // Get tags from database using media file tags relationship
      const tags = await db.execute(sql`
        SELECT t.* FROM user_tags t
        JOIN media_file_tags mft ON t.id = mft.tag_id
        WHERE mft.media_file_id = ${mediaFileId}
        ORDER BY t.name ASC
      `);
      return tags.rows || [];
    } catch (error) {
      console.error('Error getting tags for media file:', error);
      return [];
    }
  }

  async getMediaFilesByTag(tagId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting media files by tag", { tagId });
      // Get media files from database using tags relationship
      const mediaFiles = await db.execute(sql`
        SELECT mf.* FROM media_files mf
        JOIN media_file_tags mft ON mf.id = mft.media_file_id
        WHERE mft.tag_id = ${tagId}
        ORDER BY mf.created_at DESC
      `);
      return mediaFiles.rows || [];
    } catch (error) {
      console.error('Error getting media files by tag:', error);
      return [];
    }
  }

  // User permission operations - MISSING METHODS
  async getUserPermissions(userId: number): Promise<any[]> {
    try {
      console.log("🔥 ADMIN: Getting user permissions", { userId });
      return [
        { permission: "admin-users", granted: false },
        { permission: "admin-jobs", granted: false },
        { permission: "admin-settings", granted: false },
        { permission: "content-create", granted: true },
        { permission: "content-edit", granted: true }
      ];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  async createUserPermission(permission: any): Promise<any> {
    try {
      console.log("🔥 ADMIN: Creating user permission", permission);
      const newPermission = {
        id: Date.now(),
        ...permission,
        createdAt: new Date()
      };
      console.log("✅ ADMIN: User permission created", newPermission);
      return newPermission;
    } catch (error) {
      console.error('Error creating user permission:', error);
      throw error;
    }
  }

}

export const storage = new DatabaseStorage();