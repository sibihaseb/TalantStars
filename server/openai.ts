import OpenAI from "openai";
import { UserProfile } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function enhanceProfile(profile: UserProfile): Promise<Partial<UserProfile>> {
  try {
    const prompt = `Enhance this entertainment professional's profile. Current profile:
    
    Name: ${profile.displayName}
    Type: ${profile.talentType}
    Bio: ${profile.bio}
    Location: ${profile.location}
    
    Please provide suggestions for improvement in JSON format with these fields:
    - bio: enhanced bio text
    - tags: array of relevant skill/genre tags
    - recommendations: array of improvement suggestions
    
    Focus on making the profile more searchable and appealing to producers/casting directors.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert entertainment industry consultant who helps talents optimize their profiles for maximum visibility and booking opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      bio: result.bio || profile.bio,
      // Note: You might want to store tags in a separate field or as part of the profile
    };
  } catch (error) {
    console.error("Error enhancing profile:", error);
    throw new Error("Failed to enhance profile");
  }
}

export async function generateBio(profile: UserProfile): Promise<string> {
  try {
    const prompt = `Generate a professional bio for this entertainment professional:
    
    Name: ${profile.displayName}
    Type: ${profile.talentType}
    Location: ${profile.location}
    Languages: ${profile.languages?.join(", ")}
    Instruments: ${profile.instruments?.join(", ")}
    Genres: ${profile.genres?.join(", ")}
    
    Create a compelling 2-3 sentence bio that highlights their unique qualities and experience.
    Make it professional but engaging, suitable for casting directors and producers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert entertainment industry copywriter who creates compelling bios for actors, musicians, models, and voice artists."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating bio:", error);
    throw new Error("Failed to generate bio");
  }
}

export async function generateJobDescription(jobDetails: any): Promise<string> {
  try {
    const prompt = `Create a professional job posting for this entertainment opportunity:
    
    Title: ${jobDetails.title}
    Type: ${jobDetails.talentType}
    Location: ${jobDetails.location}
    Budget: ${jobDetails.budget}
    
    Create a compelling job description that will attract the right talent.
    Include requirements, expectations, and what makes this opportunity exciting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert casting director who writes compelling job postings for entertainment industry opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating job description:", error);
    throw new Error("Failed to generate job description");
  }
}

export async function suggestTalentMatches(jobDetails: any): Promise<string[]> {
  try {
    const prompt = `Suggest search keywords and filters for finding talent for this job:
    
    Title: ${jobDetails.title}
    Type: ${jobDetails.talentType}
    Description: ${jobDetails.description}
    Location: ${jobDetails.location}
    
    Provide a JSON array of suggested search terms and keywords that would help find the right talent.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI matching expert who understands entertainment industry requirements and can suggest relevant search terms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.keywords || [];
  } catch (error) {
    console.error("Error suggesting talent matches:", error);
    throw new Error("Failed to suggest talent matches");
  }
}
