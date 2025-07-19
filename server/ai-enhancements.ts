import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function enhanceJobDescription(job: any): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional career coach and entertainment industry expert. You help talent enhance their job descriptions to be more compelling and professional. 

          Guidelines:
          - Keep the same core information but make it more impactful
          - Use industry-specific terminology when appropriate
          - Highlight achievements and skills demonstrated
          - Keep it concise but engaging
          - Maintain professional tone
          - Focus on what makes this experience valuable
          
          Return only the enhanced description without any additional text or formatting.`
        },
        {
          role: "user",
          content: `Please enhance this job experience description:
          
          Title: ${job.title}
          Company: ${job.company}
          Role: ${job.role}
          Current Description: ${job.description || 'No description provided'}
          
          Please provide an enhanced, professional description that highlights the value and impact of this experience.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || job.description || '';
  } catch (error) {
    console.error('Error enhancing job description:', error);
    throw new Error('Failed to enhance job description with AI');
  }
}

export async function validateJobSkills(job: any): Promise<string[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an entertainment industry skills validator. Analyze job experiences and identify key skills demonstrated. 

          Guidelines:
          - Focus on transferable and industry-specific skills
          - Include both technical and soft skills
          - Be specific (e.g., "Character Development" not just "Acting")
          - Limit to 3-6 most relevant skills
          - Use standard industry terminology
          
          Return only a JSON array of skills, no additional text.
          Example: ["Voice Acting", "Character Development", "Studio Recording", "Script Analysis"]`
        },
        {
          role: "user",
          content: `Analyze this job experience and identify key skills demonstrated:
          
          Title: ${job.title}
          Company: ${job.company}
          Role: ${job.role}
          Description: ${job.description || 'No description provided'}
          Job Type: ${job.job_type || 'Not specified'}
          
          Return a JSON array of 3-6 key skills demonstrated in this role.`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"skills": []}');
    return result.skills || [];
  } catch (error) {
    console.error('Error validating job skills:', error);
    throw new Error('Failed to validate skills with AI');
  }
}

export async function generateJobSuggestions(userProfile: any): Promise<string[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a career advisor for entertainment professionals. Based on user profiles, suggest realistic job titles they should add to their experience.

          Guidelines:
          - Suggest 3-5 relevant job titles for their talent type
          - Consider their current experience level
          - Include both entry-level and aspirational roles
          - Use standard industry job titles
          - Focus on roles that build career progression
          
          Return only a JSON array of job titles, no additional text.`
        },
        {
          role: "user",
          content: `Based on this profile, suggest relevant job titles for their work experience:
          
          Talent Type: ${userProfile.talentType || 'General'}
          Role: ${userProfile.role || 'talent'}
          Bio: ${userProfile.bio || 'No bio provided'}
          Current Experience Count: ${userProfile.jobHistoryCount || 0}
          
          Suggest 3-5 job titles they might want to add to their experience.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || [];
  } catch (error) {
    console.error('Error generating job suggestions:', error);
    return [];
  }
}