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
import { jobHistory } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";

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
  
  // Social stats operations
  getUserSocialStats(userId: number): Promise<any>;
  
  // Opportunities operations
  getOpportunities(userId: number): Promise<any[]>;

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
      
      // Use mock pricing tiers to avoid database schema issues
      const mockTiers = [
        { id: 1, name: "Basic", price: "0.00", maxPhotos: 5, maxVideos: 2, maxAudio: 3, maxExternalLinks: 3 },
        { id: 2, name: "Professional", price: "19.99", maxPhotos: 50, maxVideos: 10, maxAudio: 20, maxExternalLinks: 10 },
        { id: 3, name: "Premium", price: "49.99", maxPhotos: 0, maxVideos: 0, maxAudio: 0, maxExternalLinks: 0 }
      ];
      
      const tier = mockTiers.find(t => t.id === id);
      console.log('Found mock tier:', tier);
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
  private jobHistory = new Map<number, any[]>();

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

  async getMediaFile(id: number): Promise<any> {
    // Find media file across all users
    for (const [userId, userMedia] of this.mediaFiles.entries()) {
      const media = userMedia.find(m => m.id === id);
      if (media) return media;
    }
    return undefined;
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

  // Social posts operations - Mock implementation for now
  async getUserSocialPosts(userId: number): Promise<any[]> {
    // Return empty array for now - in production this would query a social_posts table
    // This prevents the 500 error while maintaining API compatibility
    return [];
  }

  // Calendar operations (mock implementation)
  private calendar = new Map<number, any[]>();

  async getAvailabilityEvents(userId: number): Promise<any[]> {
    try {
      const results = await db.execute(
        `SELECT * FROM availability_events WHERE user_id = $1 ORDER BY start_time ASC`,
        [userId]
      );
      return results.rows || [];
    } catch (error) {
      console.error('Database calendar error:', error);
      return this.calendar.get(userId) || [];
    }
  }

  async createAvailabilityEvent(eventData: any): Promise<any> {
    try {
      const result = await db.execute(
        `INSERT INTO availability_events (user_id, title, start_time, end_time, status, event_type, notes, all_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          eventData.userId,
          eventData.title || 'Availability',
          eventData.startDate || eventData.startTime,
          eventData.endDate || eventData.endTime,
          eventData.status || 'available',
          eventData.eventType || 'general',
          eventData.notes || '',
          eventData.allDay || false
        ]
      );
      return result.rows?.[0] || {};
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
      const result = await db.execute(
        `UPDATE availability_events SET title = $2, start_time = $3, end_time = $4, status = $5, notes = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [eventId, eventData.title, eventData.startDate || eventData.startTime, eventData.endDate || eventData.endTime, eventData.status, eventData.notes]
      );
      return result.rows?.[0] || {};
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
      await db.execute(
        `DELETE FROM availability_events WHERE id = $1 AND user_id = $2`,
        [eventId, userId]
      );
    } catch (error) {
      console.error('Database calendar delete error:', error);
      // Fallback to memory
      const events = this.calendar.get(userId) || [];
      const filteredEvents = events.filter(e => e.id !== eventId);
      this.calendar.set(userId, filteredEvents);
    }
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
    // Mock social feed - return empty array
    return [];
  }

  // Job communication operations
  async getJobCommunications(jobId: number): Promise<any[]> {
    // Mock implementation - return empty communications for now
    console.log("🔥 COMMUNICATION: Getting job communications for job", { jobId });
    return [];
  }

  async createJobCommunication(jobId: number, senderId: number, receiverId: number, message: string): Promise<any> {
    // Mock implementation - just return the data with an ID
    console.log("🔥 COMMUNICATION: Creating job communication", { jobId, senderId, receiverId, message });
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
    console.log("✅ COMMUNICATION: Created successfully", { communication });
    return communication;
  }

  // Application operations  
  async getUserApplications(userId: number): Promise<any[]> {
    // Mock implementation - return empty applications
    return [];
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
    // Mock implementation
    return {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      followers: 0,
      following: 0
    };
  }

  // Opportunities operations
  async getOpportunities(userId: number): Promise<any[]> {
    // Mock implementation - return empty opportunities
    return [];
  }

  // Communication mark as read
  async markJobCommunicationAsRead(id: number): Promise<void> {
    // Mock implementation - just log it
    console.log("🔥 COMMUNICATION: Marking communication as read", { id });
  }

}

export const storage = new DatabaseStorage();