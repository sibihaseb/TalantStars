import { questionnaireStorage } from "./questionnaire-storage";
import type { InsertQuestionnaireCategory, InsertQuestionnaireQuestion } from "@shared/schema";

// Seed data for questionnaire system
export async function seedQuestionnaires() {
  console.log("🌱 Seeding questionnaire system...");

  try {
    // 1. Create Acting Category
    const actingCategory = await questionnaireStorage.createCategory({
      name: "Acting",
      slug: "acting",
      description: "Comprehensive acting questionnaire for talent profiles",
      targetRoles: ["talent"],
      sortOrder: 1
    });

    console.log(`✅ Created category: ${actingCategory.name}`);

    // 2. Create Acting Questions
    const actingQuestions: Omit<InsertQuestionnaireQuestion, 'categoryId'>[] = [
      {
        question: "What are your primary acting specialties?",
        slug: "primary_specialty",
        questionType: "multiselect",
        options: [
          { value: "film", label: "Film" },
          { value: "television", label: "Television" },
          { value: "theater", label: "Theater" },
          { value: "commercial", label: "Commercial" },
          { value: "voice_over", label: "Voice Over" },
          { value: "musical_theater", label: "Musical Theater" },
          { value: "improv", label: "Improvisation" },
          { value: "stand_up", label: "Stand-up Comedy" }
        ],
        isRequired: true,
        sortOrder: 1,
        helpText: "Select all acting areas where you have experience"
      },
      {
        question: "How many years of acting experience do you have?",
        slug: "years_experience",
        questionType: "select",
        options: [
          { value: "0-1", label: "0-1 years" },
          { value: "2-5", label: "2-5 years" },
          { value: "6-10", label: "6-10 years" },
          { value: "11-15", label: "11-15 years" },
          { value: "16-20", label: "16-20 years" },
          { value: "20+", label: "20+ years" }
        ],
        isRequired: true,
        sortOrder: 2
      },
      {
        question: "What acting methods or techniques have you studied?",
        slug: "acting_method",
        questionType: "multiselect",
        options: [
          { value: "meisner", label: "Meisner Technique" },
          { value: "method", label: "Method Acting" },
          { value: "stanislavski", label: "Stanislavski System" },
          { value: "adler", label: "Stella Adler Technique" },
          { value: "uta_hagen", label: "Uta Hagen Technique" },
          { value: "alexander", label: "Alexander Technique" },
          { value: "other", label: "Other" }
        ],
        sortOrder: 3
      },
      {
        question: "How comfortable are you with improvisation?",
        slug: "improvisation_comfort",
        questionType: "select",
        options: [
          { value: "very_comfortable", label: "Very Comfortable" },
          { value: "comfortable", label: "Comfortable" },
          { value: "somewhat_comfortable", label: "Somewhat Comfortable" },
          { value: "not_comfortable", label: "Not Comfortable" }
        ],
        isRequired: true,
        sortOrder: 4
      },
      {
        question: "What is your experience level with intimate scenes?",
        slug: "intimate_scenes_comfort",
        questionType: "select",
        options: [
          { value: "very_comfortable", label: "Very Comfortable" },
          { value: "comfortable", label: "Comfortable" },
          { value: "somewhat_comfortable", label: "Somewhat Comfortable" },
          { value: "not_comfortable", label: "Not Comfortable" }
        ],
        sortOrder: 5,
        helpText: "This helps directors understand your comfort level with romantic scenes"
      },
      {
        question: "What is your experience with motion capture/performance capture?",
        slug: "motion_capture",
        questionType: "select",
        options: [
          { value: "extensive", label: "Extensive Experience" },
          { value: "some", label: "Some Experience" },
          { value: "limited", label: "Limited Experience" },
          { value: "none", label: "No Experience" }
        ],
        sortOrder: 6
      },
      {
        question: "How easily can you cry on cue?",
        slug: "crying_on_cue",
        questionType: "select",
        options: [
          { value: "easily", label: "Very Easily" },
          { value: "with_preparation", label: "With Some Preparation" },
          { value: "difficult", label: "Difficult for Me" },
          { value: "cannot", label: "Cannot Do It" }
        ],
        sortOrder: 7
      },
      {
        question: "What is your comfort level with stunt work?",
        slug: "stunt_comfort",
        questionType: "select",
        options: [
          { value: "very_comfortable", label: "Very Comfortable" },
          { value: "comfortable", label: "Comfortable" },
          { value: "basic_only", label: "Basic Stunts Only" },
          { value: "not_comfortable", label: "Not Comfortable" }
        ],
        sortOrder: 8
      },
      {
        question: "Do you currently have representation?",
        slug: "representation_status",
        questionType: "select",
        options: [
          { value: "fully_represented", label: "Fully Represented (Agent & Manager)" },
          { value: "agent_only", label: "Agent Only" },
          { value: "manager_only", label: "Manager Only" },
          { value: "seeking", label: "Seeking Representation" },
          { value: "not_seeking", label: "Not Currently Seeking" }
        ],
        sortOrder: 9
      },
      {
        question: "Current agent or representation (optional)",
        slug: "current_agent",
        questionType: "text",
        sortOrder: 10,
        helpText: "Name of your current agent, manager, or representation company"
      }
    ];

    for (const questionData of actingQuestions) {
      const question = await questionnaireStorage.createQuestion({
        ...questionData,
        categoryId: actingCategory.id
      });
      console.log(`  ✅ Created question: ${question.question}`);
    }

    // 3. Create Music Category
    const musicCategory = await questionnaireStorage.createCategory({
      name: "Music",
      slug: "music",
      description: "Music and audio performance questionnaire",
      targetRoles: ["talent"],
      sortOrder: 2
    });

    console.log(`✅ Created category: ${musicCategory.name}`);

    // 4. Create Music Questions
    const musicQuestions: Omit<InsertQuestionnaireQuestion, 'categoryId'>[] = [
      {
        question: "What instruments do you play?",
        slug: "instruments",
        questionType: "multiselect",
        options: [
          { value: "piano", label: "Piano" },
          { value: "guitar", label: "Guitar" },
          { value: "bass", label: "Bass" },
          { value: "drums", label: "Drums" },
          { value: "violin", label: "Violin" },
          { value: "saxophone", label: "Saxophone" },
          { value: "trumpet", label: "Trumpet" },
          { value: "flute", label: "Flute" },
          { value: "other", label: "Other" }
        ],
        sortOrder: 1
      },
      {
        question: "What is your vocal range?",
        slug: "vocal_range",
        questionType: "select",
        options: [
          { value: "soprano", label: "Soprano" },
          { value: "mezzo_soprano", label: "Mezzo-Soprano" },
          { value: "alto", label: "Alto" },
          { value: "tenor", label: "Tenor" },
          { value: "baritone", label: "Baritone" },
          { value: "bass", label: "Bass" },
          { value: "not_sure", label: "Not Sure" }
        ],
        sortOrder: 2
      },
      {
        question: "What genres do you specialize in?",
        slug: "music_genres",
        questionType: "multiselect",
        options: [
          { value: "pop", label: "Pop" },
          { value: "rock", label: "Rock" },
          { value: "jazz", label: "Jazz" },
          { value: "classical", label: "Classical" },
          { value: "country", label: "Country" },
          { value: "hip_hop", label: "Hip Hop" },
          { value: "r_and_b", label: "R&B" },
          { value: "folk", label: "Folk" },
          { value: "electronic", label: "Electronic" }
        ],
        sortOrder: 3
      }
    ];

    for (const questionData of musicQuestions) {
      const question = await questionnaireStorage.createQuestion({
        ...questionData,
        categoryId: musicCategory.id
      });
      console.log(`  ✅ Created question: ${question.question}`);
    }

    console.log("🎉 Questionnaire system seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding questionnaires:", error);
    throw error;
  }
}