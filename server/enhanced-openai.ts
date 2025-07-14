import OpenAI from "openai";
import { UserProfile, Job, InsertJob, User } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// AI-powered profile enhancement
export async function enhanceProfileWithAI(profile: UserProfile): Promise<Partial<UserProfile>> {
  try {
    const prompt = `
    You are an expert talent profile optimizer for the entertainment industry. 
    Analyze this talent profile and suggest improvements to make it more compelling and discoverable.
    
    Profile data:
    ${JSON.stringify(profile, null, 2)}
    
    Please provide suggestions for:
    1. Bio improvement (if bio exists)
    2. Smart tags for search optimization
    3. Skills enhancement suggestions
    4. Professional presentation improvements
    
    Respond in JSON format with the following structure:
    {
      "enhancedBio": "improved bio text",
      "suggestedTags": ["tag1", "tag2", "tag3"],
      "skillsSuggestions": ["skill1", "skill2"],
      "improvementNotes": "specific suggestions for profile enhancement"
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional talent profile optimizer. Provide practical, industry-specific suggestions."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      bio: result.enhancedBio || profile.bio,
      // Add suggested skills to existing ones
      skills: profile.skills ? [...profile.skills, ...result.skillsSuggestions] : result.skillsSuggestions,
    };
  } catch (error) {
    console.error("Error enhancing profile with AI:", error);
    throw new Error("Failed to enhance profile with AI");
  }
}

// AI-powered bio generation
export async function generateBioFromProfile(profile: UserProfile): Promise<string> {
  try {
    const prompt = `
    Create a compelling professional bio for this ${profile.talentType} talent based on their profile information.
    
    Profile details:
    - Name: ${profile.displayName}
    - Role: ${profile.role}
    - Talent Type: ${profile.talentType}
    - Location: ${profile.location}
    - Skills: ${profile.skills?.join(", ")}
    - Experience: ${profile.experiences?.join(", ")}
    - Languages: ${profile.languages?.join(", ")}
    - Genres: ${profile.genres?.join(", ")}
    - Awards: ${profile.awards?.join(", ")}
    
    Write a 2-3 paragraph professional bio that highlights their strengths, experience, and unique qualities.
    Make it engaging and industry-appropriate for casting directors and producers.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional bio writer specializing in entertainment industry talent profiles."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating bio:", error);
    throw new Error("Failed to generate bio");
  }
}

// AI-powered job description generation
export async function generateJobDescription(jobDetails: Partial<InsertJob>): Promise<string> {
  try {
    const prompt = `
    Create a compelling job posting for this entertainment industry position:
    
    Job details:
    - Title: ${jobDetails.title}
    - Talent Type: ${jobDetails.talentType}
    - Location: ${jobDetails.location}
    - Budget: ${jobDetails.budget}
    - Project Date: ${jobDetails.projectDate}
    - Requirements: ${jobDetails.requirements}
    - Basic Description: ${jobDetails.description}
    
    Write a professional job description that:
    1. Attracts the right talent
    2. Clearly outlines expectations
    3. Includes compelling project details
    4. Mentions any unique opportunities
    5. Sets clear application instructions
    
    Make it engaging and industry-appropriate.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional job posting writer for the entertainment industry."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating job description:", error);
    throw new Error("Failed to generate job description");
  }
}

// AI-powered talent matching
export async function generateTalentMatches(job: Job, talents: UserProfile[]): Promise<Array<{ userId: string; matchScore: number; reasons: string[] }>> {
  try {
    const prompt = `
    You are an AI casting assistant. Match these talents to the job posting and provide match scores and reasons.
    
    Job posting:
    ${JSON.stringify(job, null, 2)}
    
    Available talents:
    ${JSON.stringify(talents.map(t => ({
      userId: t.userId,
      displayName: t.displayName,
      talentType: t.talentType,
      location: t.location,
      skills: t.skills,
      experiences: t.experiences,
      languages: t.languages,
      genres: t.genres,
      bio: t.bio?.substring(0, 200) // First 200 chars
    })), null, 2)}
    
    For each talent, provide:
    1. Match score (0-100)
    2. 3-5 specific reasons why they match or don't match
    3. Consider: skills, experience, location, availability, talent type
    
    Respond in JSON format:
    {
      "matches": [
        {
          "userId": "user_id",
          "matchScore": 85,
          "reasons": ["reason1", "reason2", "reason3"]
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional casting assistant with expertise in talent matching."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.matches || [];
  } catch (error) {
    console.error("Error generating talent matches:", error);
    throw new Error("Failed to generate talent matches");
  }
}

// AI-powered email reply generation
export async function generateEmailReply(
  originalMessage: string,
  context: string,
  tone: "professional" | "friendly" | "brief" = "professional"
): Promise<string> {
  try {
    const prompt = `
    Generate a ${tone} email reply to this message:
    
    Original message:
    ${originalMessage}
    
    Context:
    ${context}
    
    Write a clear, appropriate response that:
    1. Acknowledges the original message
    2. Provides helpful information
    3. Maintains a ${tone} tone
    4. Ends with appropriate next steps if needed
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional communication assistant for the entertainment industry."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating email reply:", error);
    throw new Error("Failed to generate email reply");
  }
}

// AI-powered profile summary generation
export async function generateProfileSummary(profile: UserProfile): Promise<string> {
  try {
    const prompt = `
    Create a concise professional summary for this talent profile:
    
    ${JSON.stringify(profile, null, 2)}
    
    Write a 1-2 sentence summary that captures:
    1. Their primary talent type and specialization
    2. Key skills or notable experience
    3. What makes them unique
    
    Make it compelling for casting directors and producers.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional talent summarizer for the entertainment industry."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating profile summary:", error);
    throw new Error("Failed to generate profile summary");
  }
}

// AI-powered content moderation
export async function moderateContent(content: string, type: "profile" | "job" | "message"): Promise<{
  isApproved: boolean;
  issues: string[];
  suggestions: string[];
}> {
  try {
    const prompt = `
    Analyze this ${type} content for appropriateness in a professional entertainment platform:
    
    Content:
    ${content}
    
    Check for:
    1. Professional language and tone
    2. Appropriate content for the entertainment industry
    3. No discriminatory language
    4. Clear and helpful information
    5. Compliance with platform guidelines
    
    Respond in JSON format:
    {
      "isApproved": true/false,
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a content moderator for a professional entertainment platform."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      isApproved: result.isApproved || false,
      issues: result.issues || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Error moderating content:", error);
    throw new Error("Failed to moderate content");
  }
}

// AI-powered search optimization tags
export async function generateSearchTags(content: string, talentType: string): Promise<string[]> {
  try {
    const prompt = `
    Generate search optimization tags for this ${talentType} profile content:
    
    Content:
    ${content}
    
    Generate 10-15 relevant tags that would help this profile be discovered by:
    1. Casting directors searching for specific skills
    2. Producers looking for talent types
    3. Managers seeking new talent
    4. Industry professionals
    
    Include:
    - Skills and abilities
    - Industry terminology
    - Genre-specific tags
    - Location-based tags if relevant
    - Experience level indicators
    
    Respond with a JSON array of tags:
    ["tag1", "tag2", "tag3", ...]
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a search optimization expert for entertainment industry profiles."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.tags || [];
  } catch (error) {
    console.error("Error generating search tags:", error);
    throw new Error("Failed to generate search tags");
  }
}