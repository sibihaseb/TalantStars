import {
  users,
  userProfiles,
  pricingTiers,
  seoSettings,
  talentCategories,
  featuredTalents,
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
} from "@shared/simple-schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (for traditional auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  getUsersWithProfiles(filters?: { isFeatured?: boolean }): Promise<Array<User & { profile?: UserProfile }>>;
  
  // Tier operations
  updateUserTier(userId: number, tierId: number): Promise<User>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  getPricingTiers(): Promise<PricingTier[]>;
  
  // Media operations (mock implementation for simple storage)
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
  updateUserProfileImage(userId: number, imageUrl: string): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  private static instance: DatabaseStorage;
  private mediaFiles: Map<number, any[]> = new Map();

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
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [userProfile] = await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, userId))
      .returning();
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
      
      // Join users with their profiles
      const usersWithProfiles = allUsers.map(user => {
        const profile = allProfiles.find(p => p.userId === user.id.toString());
        return { ...user, profile };
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
    return user;
  }
  
  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    try {
      console.log('Getting pricing tier with ID:', id);
      const [tier] = await db
        .select()
        .from(pricingTiers)
        .where(eq(pricingTiers.id, id));
      console.log('Found tier:', tier);
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
      console.error('Error getting pricing tiers:', error);
      throw error;
    }
  }

  // Media operations with simple in-memory storage
  async getUserMediaFiles(userId: number): Promise<any[]> {
    return this.mediaFiles.get(userId) || [];
  }

  async createMediaFile(mediaData: any): Promise<any> {
    const userId = mediaData.userId;
    const media = {
      id: Date.now(),
      ...mediaData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const userMedia = this.mediaFiles.get(userId) || [];
    userMedia.push(media);
    this.mediaFiles.set(userId, userMedia);
    
    return media;
  }

  async updateMediaFile(id: number, mediaData: any): Promise<any> {
    for (const [userId, userMedia] of this.mediaFiles.entries()) {
      const mediaIndex = userMedia.findIndex(media => media.id === id);
      if (mediaIndex !== -1) {
        userMedia[mediaIndex] = {
          ...userMedia[mediaIndex],
          ...mediaData,
          updatedAt: new Date().toISOString()
        };
        return userMedia[mediaIndex];
      }
    }
    throw new Error('Media file not found');
  }

  async deleteMediaFile(id: number): Promise<void> {
    for (const [userId, userMedia] of this.mediaFiles.entries()) {
      const mediaIndex = userMedia.findIndex(media => media.id === id);
      if (mediaIndex !== -1) {
        userMedia.splice(mediaIndex, 1);
        this.mediaFiles.set(userId, userMedia);
        return;
      }
    }
    throw new Error('Media file not found');
  }

  async getUserLimits(userId: number): Promise<any> {
    return {
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxTotalSize: 100 * 1024 * 1024, // 100MB
      currentFiles: (this.mediaFiles.get(userId) || []).length,
      currentSize: (this.mediaFiles.get(userId) || []).reduce((sum, file) => sum + (file.size || 0), 0)
    };
  }

  // Admin settings operations
  async getAdminSettings(): Promise<any[]> {
    return [];
  }

  async updateAdminSetting(key: string, value: string, updatedBy: string): Promise<any> {
    return { key, value, updatedBy };
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
  async updateUserProfileImage(userId: number, imageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl: imageUrl })
      .where(eq(users.id, userId))
      .returning();
    return user;
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
}

export const storage = new DatabaseStorage();