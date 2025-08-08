import { pgTable, serial, varchar, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Question types enum for different UI components
export const questionTypeEnum = ["select", "multiselect", "text", "textarea", "number", "boolean", "scale"] as const;

// Questionnaire categories - admin can add more
export const questionnaireCategories = pgTable("questionnaire_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // "Acting", "Music", "Modeling", etc.
  slug: varchar("slug").notNull().unique(), // "acting", "music", "modeling"
  description: text("description"),
  targetRoles: text("target_roles").array(), // ["talent"] or ["talent", "manager"]
  isActive: boolean("is_active").default(true), 
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual questions within categories
export const questionnaireQuestions = pgTable("questionnaire_questions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => questionnaireCategories.id).notNull(),
  question: text("question").notNull(), // "How comfortable are you with improvisation?"
  slug: varchar("slug").notNull(), // "improvisation_comfort"
  questionType: varchar("question_type").notNull(), // "select", "multiselect", etc.
  options: jsonb("options"), // For select/multiselect: ["comfortable", "somewhat", "not_comfortable"]
  isRequired: boolean("is_required").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  helpText: text("help_text"), // Additional guidance for users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User responses to questionnaire questions
export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  questionId: integer("question_id").references(() => questionnaireQuestions.id).notNull(),
  response: jsonb("response").notNull(), // Flexible storage for any response type
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(questionnaireCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questionnaireQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResponseSchema = createInsertSchema(questionnaireResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type QuestionnaireCategory = typeof questionnaireCategories.$inferSelect;
export type InsertQuestionnaireCategory = z.infer<typeof insertCategorySchema>;
export type QuestionnaireQuestion = typeof questionnaireQuestions.$inferSelect;
export type InsertQuestionnaireQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = z.infer<typeof insertResponseSchema>;

// Question type definitions for frontend
export type QuestionType = typeof questionTypeEnum[number];

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormattedQuestion extends QuestionnaireQuestion {
  formattedOptions?: QuestionOption[];
}

export interface CategoryWithQuestions extends QuestionnaireCategory {
  questions: FormattedQuestion[];
}