import {
  users,
  userProfiles,
  pricingTiers,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type PricingTier,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (for traditional auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
}

export const storage = new DatabaseStorage();