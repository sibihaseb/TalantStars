import {
  users,
  userProfiles,
  pricingTiers,
  emailTemplates,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type PricingTier,
  type EmailTemplate,
  type InsertEmailTemplate,
} from "@shared/schema";
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
  
  // Tier operations
  updateUserTier(userId: number, tierId: number): Promise<User>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  
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

  // Email template operations
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;
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

  async getMediaFile(id: number): Promise<any | undefined> {
    // Find media file by ID across all users
    for (const [userId, userMedia] of this.mediaFiles.entries()) {
      const media = userMedia.find(media => media.id === id);
      if (media) {
        return media;
      }
    }
    return undefined;
  }

  async createMediaFile(mediaData: any): Promise<any> {
    const userId = mediaData.userId;
    const media = {
      id: Date.now(),
      ...mediaData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in memory
    const userMedia = this.mediaFiles.get(userId) || [];
    userMedia.push(media);
    this.mediaFiles.set(userId, userMedia);
    
    return media;
  }

  async updateMediaFile(id: number, mediaData: any): Promise<any> {
    // Find and update the media file
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
    // Find and delete the media file
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
    // Return null for now - user limits would be stored in a real database
    return null;
  }

  // Profile sharing storage
  private profileSharing: Map<number, any> = new Map();

  async getProfileSharingSettings(userId: number): Promise<any> {
    return this.profileSharing.get(userId) || {
      customUrl: null,
      isPublic: false,
      allowDirectMessages: false,
      showContactInfo: false,
      showSocialLinks: false,
      showMediaGallery: false,
      shareableFields: [],
      profileViews: 0,
      lastShared: null
    };
  }

  async updateProfileSharingSettings(userId: number, settings: any): Promise<any> {
    const currentSettings = await this.getProfileSharingSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    this.profileSharing.set(userId, updatedSettings);
    return updatedSettings;
  }

  async getProfileByCustomUrl(customUrl: string): Promise<any> {
    // Find profile by custom URL
    for (const [userId, settings] of this.profileSharing.entries()) {
      if (settings.customUrl === customUrl) {
        return { userId, ...settings };
      }
    }
    return null;
  }

  async incrementProfileViews(userId: number): Promise<void> {
    const settings = await this.getProfileSharingSettings(userId);
    settings.profileViews = (settings.profileViews || 0) + 1;
    this.profileSharing.set(userId, settings);
  }

  async checkCustomUrlAvailable(customUrl: string, excludeUserId?: number): Promise<boolean> {
    for (const [userId, settings] of this.profileSharing.entries()) {
      if (settings.customUrl === customUrl && userId !== excludeUserId) {
        return false;
      }
    }
    return true;
  }

  // In-memory storage for admin settings
  private adminSettings: Map<string, any> = new Map([
    ['session_duration_hours', { 
      key: 'session_duration_hours', 
      value: '48', 
      description: 'User session duration in hours. Users will be automatically logged out after this many hours of inactivity.',
      category: 'security',
      updatedBy: 'system',
      updatedAt: new Date().toISOString()
    }]
  ]);

  async getAdminSettings(): Promise<any[]> {
    return Array.from(this.adminSettings.values());
  }

  async updateAdminSetting(key: string, value: string, updatedBy: string): Promise<any> {
    const setting = {
      key,
      value,
      description: this.adminSettings.get(key)?.description || '',
      category: this.adminSettings.get(key)?.category || 'general',
      updatedBy,
      updatedAt: new Date().toISOString()
    };
    
    this.adminSettings.set(key, setting);
    return setting;
  }

  async recordLegalAcceptance(userId: number, acceptanceData: {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    termsVersion?: number;
    privacyVersion?: number;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {};
    
    if (acceptanceData.termsAccepted !== undefined) {
      updateData.termsAccepted = acceptanceData.termsAccepted;
      updateData.termsAcceptedAt = new Date().toISOString();
    }
    
    if (acceptanceData.privacyAccepted !== undefined) {
      updateData.privacyAccepted = acceptanceData.privacyAccepted;
      updateData.privacyAcceptedAt = new Date().toISOString();
    }
    
    if (acceptanceData.termsVersion !== undefined) {
      updateData.termsVersion = acceptanceData.termsVersion;
    }
    
    if (acceptanceData.privacyVersion !== undefined) {
      updateData.privacyVersion = acceptanceData.privacyVersion;
    }

    const updatedUser = {
      ...user,
      ...updateData
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Email template operations
  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    const templates = await db.select().from(emailTemplates);
    return templates;
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template || undefined;
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    return template || undefined;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db
      .insert(emailTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set(template)
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();