import { db } from "./db";
import { users, userProfiles, type User, type UserProfile, type InsertUserProfile } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export class UnifiedProfileStorage {
  
  // UNIFIED SYSTEM: Get profile with clean data isolation per user
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    try {
      console.log(`🔍 UNIFIED: Getting profile for user ${userId}`);
      
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId.toString()));
      
      if (profile) {
        console.log(`✅ UNIFIED: Profile found for user ${userId}`);
        
        // Merge questionnaire responses from JSON field back into profile structure
        if (profile.questionnaireResponses) {
          const questionnaires = profile.questionnaireResponses as any;
          if (questionnaires.acting) {
            // Backward compatibility: merge acting fields into main profile
            Object.assign(profile, questionnaires.acting);
          }
        }
        return profile;
      } else {
        console.log(`❌ UNIFIED: No profile exists for user ${userId} - CLEAN SLATE`);
        return undefined;
      }
    } catch (error) {
      console.error('Error getting unified profile:', error);
      return undefined;
    }
  }

  // UNIFIED SYSTEM: Create profile with all data in one place
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    try {
      console.log(`🆕 UNIFIED CREATE: Creating profile for user ${profile.userId}`);
      
      // CRITICAL: Check for existing profile to prevent Jennifer Capsulo contamination
      const existingProfile = await this.getUserProfile(parseInt(profile.userId));
      if (existingProfile) {
        console.log(`❌ DUPLICATE BLOCKED: Profile exists for user ${profile.userId}, updating instead`);
        return await this.updateUserProfile(parseInt(profile.userId), profile);
      }
      
      // Extract questionnaire data and basic profile data
      const { 
        primarySpecialty, yearsExperience, actingMethod, improvisationComfort, 
        stageCombat, intimateScenesComfort, roleTypes, motionCapture, 
        animalWork, cryingOnCue, periodPieces, physicalComedy, 
        accentExperience, greenScreen, stuntComfort, shakespeareExperience, 
        musicalTheater, horrorThriller, currentAgent, currentPublicist, 
        representationStatus, 
        ...basicProfile 
      } = profile;
      
      // Build unified questionnaire responses
      const questionnaireResponses = {
        acting: {
          primarySpecialty: primarySpecialty || [],
          yearsExperience: yearsExperience || '',
          actingMethod: actingMethod || [],
          improvisationComfort: improvisationComfort || '',
          stageCombat: stageCombat || '',
          intimateScenesComfort: intimateScenesComfort || '',
          roleTypes: roleTypes || [],
          motionCapture: motionCapture || '',
          animalWork: animalWork || '',
          cryingOnCue: cryingOnCue || '',
          periodPieces: periodPieces || '',
          physicalComedy: physicalComedy || '',
          accentExperience: accentExperience || '',
          greenScreen: greenScreen || '',
          stuntComfort: stuntComfort || '',
          shakespeareExperience: shakespeareExperience || '',
          musicalTheater: musicalTheater || '',
          horrorThriller: horrorThriller || [],
          currentAgent: currentAgent || '',
          currentPublicist: currentPublicist || '',
          representationStatus: representationStatus || ''
        }
      };
      
      // Create unified profile data
      const unifiedProfileData = {
        ...basicProfile,
        questionnaireResponses
      };
      
      console.log(`🔧 UNIFIED: Storing basic profile + questionnaire data in single JSON field`);
      
      const [newProfile] = await db
        .insert(userProfiles)
        .values(unifiedProfileData)
        .returning();
      
      console.log(`✅ UNIFIED CREATE SUCCESS: Profile ${newProfile.id} created for user ${profile.userId}`);
      return newProfile;
      
    } catch (error) {
      console.error('Error creating unified profile:', error);
      throw error;
    }
  }

  // UNIFIED SYSTEM: Update profile with all data in one place
  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    try {
      console.log(`📝 UNIFIED UPDATE: Updating profile for user ${userId}`);
      
      // Get existing profile to merge questionnaire data
      const existingProfile = await this.getUserProfile(userId);
      
      // Extract questionnaire data from update
      const { 
        primarySpecialty, yearsExperience, actingMethod, improvisationComfort, 
        stageCombat, intimateScenesComfort, roleTypes, motionCapture, 
        animalWork, cryingOnCue, periodPieces, physicalComedy, 
        accentExperience, greenScreen, stuntComfort, shakespeareExperience, 
        musicalTheater, horrorThriller, currentAgent, currentPublicist, 
        representationStatus, 
        ...basicProfile 
      } = profile;
      
      // Merge questionnaire updates with existing data
      const existingQuestionnaires = (existingProfile?.questionnaireResponses as any) || { acting: {} };
      const updatedQuestionnaires = {
        ...existingQuestionnaires,
        acting: {
          ...existingQuestionnaires.acting,
          ...(primarySpecialty !== undefined && { primarySpecialty }),
          ...(yearsExperience !== undefined && { yearsExperience }),
          ...(actingMethod !== undefined && { actingMethod }),
          ...(improvisationComfort !== undefined && { improvisationComfort }),
          ...(stageCombat !== undefined && { stageCombat }),
          ...(intimateScenesComfort !== undefined && { intimateScenesComfort }),
          ...(roleTypes !== undefined && { roleTypes }),
          ...(motionCapture !== undefined && { motionCapture }),
          ...(animalWork !== undefined && { animalWork }),
          ...(cryingOnCue !== undefined && { cryingOnCue }),
          ...(periodPieces !== undefined && { periodPieces }),
          ...(physicalComedy !== undefined && { physicalComedy }),
          ...(accentExperience !== undefined && { accentExperience }),
          ...(greenScreen !== undefined && { greenScreen }),
          ...(stuntComfort !== undefined && { stuntComfort }),
          ...(shakespeareExperience !== undefined && { shakespeareExperience }),
          ...(musicalTheater !== undefined && { musicalTheater }),
          ...(horrorThriller !== undefined && { horrorThriller }),
          ...(currentAgent !== undefined && { currentAgent }),
          ...(currentPublicist !== undefined && { currentPublicist }),
          ...(representationStatus !== undefined && { representationStatus })
        }
      };
      
      // Build unified update data
      const updateData = {
        ...basicProfile,
        questionnaireResponses: updatedQuestionnaires
      };
      
      // Filter out undefined values
      const filteredUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );
      
      console.log(`🔧 UNIFIED: Updating basic profile + questionnaire data`);
      
      const [updatedProfile] = await db
        .update(userProfiles)
        .set(filteredUpdate)
        .where(eq(userProfiles.userId, userId.toString()))
        .returning();
      
      console.log(`✅ UNIFIED UPDATE SUCCESS: Profile updated for user ${userId}`);
      return updatedProfile;
      
    } catch (error) {
      console.error('Error updating unified profile:', error);
      throw error;
    }
  }

  // CLEAN ONBOARDING: Get fresh questionnaire responses for new users
  async getQuestionnaireResponses(userId: number): Promise<any> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile || !profile.questionnaireResponses) {
        console.log(`🆕 CLEAN SLATE: No questionnaire responses for user ${userId} - returning empty`);
        return {};
      }
      
      console.log(`📋 QUESTIONNAIRE: Found responses for user ${userId}`);
      return profile.questionnaireResponses;
    } catch (error) {
      console.error('Error getting questionnaire responses:', error);
      return {};
    }
  }

  // CLEAN ONBOARDING: Save questionnaire responses to unified field
  async saveQuestionnaireResponses(userId: number, responses: any): Promise<void> {
    try {
      console.log(`💾 UNIFIED: Saving questionnaire responses for user ${userId}`);
      
      const existingProfile = await this.getUserProfile(userId);
      
      if (existingProfile) {
        // Update existing profile
        await this.updateUserProfile(userId, { questionnaireResponses: responses } as any);
      } else {
        // Create new profile with questionnaire data
        await this.createUserProfile({
          userId: userId.toString(),
          role: 'talent',
          talentType: 'actor',
          displayName: '',
          bio: '',
          location: '',
          questionnaireResponses: responses
        } as any);
      }
      
      console.log(`✅ QUESTIONNAIRE SAVED: Responses stored for user ${userId}`);
    } catch (error) {
      console.error('Error saving questionnaire responses:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const unifiedStorage = new UnifiedProfileStorage();