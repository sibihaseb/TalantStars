import {
  users,
  userProfiles,
  mediaFiles,
  jobs,
  jobApplications,
  messages,
  talentManagers,
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    let query = db.select().from(jobs);
    
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
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(jobs.createdAt));
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
    for (const [otherUserId, lastMessage] of conversationMap.entries()) {
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
        )
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
}

export const storage = new DatabaseStorage();
