import { db } from "./db";
import { 
  questionnaireCategories, 
  questionnaireQuestions, 
  questionnaireResponses,
  type QuestionnaireCategory,
  type QuestionnaireQuestion,
  type QuestionnaireResponse,
  type InsertQuestionnaireCategory,
  type InsertQuestionnaireQuestion,
  type InsertQuestionnaireResponse,
  type CategoryWithQuestions,
  type FormattedQuestion
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class QuestionnaireStorage {
  // Category management
  async getCategories(): Promise<QuestionnaireCategory[]> {
    return await db.select()
      .from(questionnaireCategories)
      .where(eq(questionnaireCategories.isActive, true))
      .orderBy(questionnaireCategories.sortOrder, questionnaireCategories.name);
  }

  async getCategoryById(id: number): Promise<QuestionnaireCategory | undefined> {
    const [category] = await db.select()
      .from(questionnaireCategories)
      .where(eq(questionnaireCategories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<QuestionnaireCategory | undefined> {
    const [category] = await db.select()
      .from(questionnaireCategories)
      .where(eq(questionnaireCategories.slug, slug));
    return category;
  }

  async createCategory(data: InsertQuestionnaireCategory): Promise<QuestionnaireCategory> {
    const [category] = await db.insert(questionnaireCategories)
      .values(data)
      .returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<InsertQuestionnaireCategory>): Promise<QuestionnaireCategory> {
    const [category] = await db.update(questionnaireCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questionnaireCategories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.update(questionnaireCategories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(questionnaireCategories.id, id));
  }

  // Question management
  async getQuestionsByCategory(categoryId: number): Promise<FormattedQuestion[]> {
    const questions = await db.select()
      .from(questionnaireQuestions)
      .where(and(
        eq(questionnaireQuestions.categoryId, categoryId),
        eq(questionnaireQuestions.isActive, true)
      ))
      .orderBy(questionnaireQuestions.sortOrder, questionnaireQuestions.question);

    return questions.map(question => ({
      ...question,
      formattedOptions: Array.isArray(question.options) ? question.options : []
    }));
  }

  async getQuestionById(id: number): Promise<QuestionnaireQuestion | undefined> {
    const [question] = await db.select()
      .from(questionnaireQuestions)
      .where(eq(questionnaireQuestions.id, id));
    return question;
  }

  async createQuestion(data: InsertQuestionnaireQuestion): Promise<QuestionnaireQuestion> {
    const [question] = await db.insert(questionnaireQuestions)
      .values(data)
      .returning();
    return question;
  }

  async updateQuestion(id: number, data: Partial<InsertQuestionnaireQuestion>): Promise<QuestionnaireQuestion> {
    const [question] = await db.update(questionnaireQuestions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(questionnaireQuestions.id, id))
      .returning();
    return question;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.update(questionnaireQuestions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(questionnaireQuestions.id, id));
  }

  // Response management
  async getUserResponse(userId: string, questionId: number): Promise<QuestionnaireResponse | undefined> {
    const [response] = await db.select()
      .from(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.userId, userId),
        eq(questionnaireResponses.questionId, questionId)
      ));
    return response;
  }

  async getUserResponses(userId: string): Promise<QuestionnaireResponse[]> {
    return await db.select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId))
      .orderBy(desc(questionnaireResponses.updatedAt));
  }

  async getUserResponsesByCategory(userId: string, categoryId: number): Promise<QuestionnaireResponse[]> {
    return await db.select({
      id: questionnaireResponses.id,
      userId: questionnaireResponses.userId,
      questionId: questionnaireResponses.questionId,
      response: questionnaireResponses.response,
      createdAt: questionnaireResponses.createdAt,
      updatedAt: questionnaireResponses.updatedAt
    })
    .from(questionnaireResponses)
    .innerJoin(questionnaireQuestions, eq(questionnaireResponses.questionId, questionnaireQuestions.id))
    .where(and(
      eq(questionnaireResponses.userId, userId),
      eq(questionnaireQuestions.categoryId, categoryId)
    ));
  }

  async saveResponse(data: InsertQuestionnaireResponse): Promise<QuestionnaireResponse> {
    // Check if response exists
    const existingResponse = await this.getUserResponse(data.userId, data.questionId);
    
    if (existingResponse) {
      // Update existing response
      const [response] = await db.update(questionnaireResponses)
        .set({ response: data.response, updatedAt: new Date() })
        .where(and(
          eq(questionnaireResponses.userId, data.userId),
          eq(questionnaireResponses.questionId, data.questionId)
        ))
        .returning();
      return response;
    } else {
      // Create new response
      const [response] = await db.insert(questionnaireResponses)
        .values(data)
        .returning();
      return response;
    }
  }

  async saveMultipleResponses(responses: InsertQuestionnaireResponse[]): Promise<QuestionnaireResponse[]> {
    const savedResponses: QuestionnaireResponse[] = [];
    
    for (const responseData of responses) {
      const saved = await this.saveResponse(responseData);
      savedResponses.push(saved);
    }
    
    return savedResponses;
  }

  async deleteResponse(userId: string, questionId: number): Promise<void> {
    await db.delete(questionnaireResponses)
      .where(and(
        eq(questionnaireResponses.userId, userId),
        eq(questionnaireResponses.questionId, questionId)
      ));
  }

  // Combined data retrieval
  async getCategoriesWithQuestions(targetRole?: string): Promise<CategoryWithQuestions[]> {
    let categories = await this.getCategories();
    console.log("Fetched categories:", categories);
    // Filter by target role if specified
    if (targetRole) {
      categories = categories.filter(cat => 
        !cat.targetRoles || cat.targetRoles.includes(targetRole)
      );
    }

    const categoriesWithQuestions: CategoryWithQuestions[] = [];
    
    for (const category of categories) {
      const questions = await this.getQuestionsByCategory(category.id);
      categoriesWithQuestions.push({
        ...category,
        questions
      });
    }
    
    return categoriesWithQuestions;
  }

  async getUserProfile(userId: string): Promise<Record<string, any>> {
    const responses = await this.getUserResponses(userId);
    const categories = await this.getCategoriesWithQuestions();
    
    const profile: Record<string, any> = {};
    
    // Organize responses by question slug for easy access
    for (const response of responses) {
      // Find the question to get its slug
      for (const category of categories) {
        const question = category.questions.find(q => q.id === response.questionId);
        if (question) {
          profile[question.slug] = response.response;
          break;
        }
      }
    }
    
    return profile;
  }
}

export const questionnaireStorage = new QuestionnaireStorage();