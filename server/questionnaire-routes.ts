import type { Express } from "express";
import { questionnaireStorage } from "./questionnaire-storage";
import { seedQuestionnaires } from "./questionnaire-seed";
import { insertCategorySchema, insertQuestionSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export function registerQuestionnaireRoutes(app: Express) {
  // Category routes
  app.get("/api/questionnaire/categories", async (req, res) => {
    try {
      const targetRole = req.query.role as string;
      const categories = await questionnaireStorage.getCategoriesWithQuestions(targetRole);
      console.log("Fetched categories with questions:", categories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/questionnaire/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await questionnaireStorage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Admin category management
  app.post("/api/admin/questionnaire/categories", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await questionnaireStorage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/admin/questionnaire/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await questionnaireStorage.updateCategory(id, validatedData);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/questionnaire/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      await questionnaireStorage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Question routes
  app.get("/api/questionnaire/questions/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const questions = await questionnaireStorage.getQuestionsByCategory(categoryId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Admin question management
  app.post("/api/admin/questionnaire/questions", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await questionnaireStorage.createQuestion(validatedData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  app.put("/api/admin/questionnaire/questions/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertQuestionSchema.partial().parse(req.body);
      const question = await questionnaireStorage.updateQuestion(id, validatedData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  app.delete("/api/admin/questionnaire/questions/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin" && req.user?.role !== "super_admin")) {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      await questionnaireStorage.deleteQuestion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // Response routes
  app.get("/api/questionnaire/responses/my", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    console.log("Fetching user responses for:", req.user.id);
    try {
      const profile = await questionnaireStorage.getUserProfile(req.user.id.toString());
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/questionnaire/responses/category/:categoryId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const categoryId = parseInt(req.params.categoryId);
      const responses = await questionnaireStorage.getUserResponsesByCategory(
        req.user.id.toString(), 
        categoryId
      );
      res.json(responses);
    } catch (error) {
      console.error("Error fetching category responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/questionnaire/responses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { questionId, response } = req.body;
      
      const validatedData = insertResponseSchema.parse({
        userId: req.user.id.toString(),
        questionId,
        response
      });
      
      const savedResponse = await questionnaireStorage.saveResponse(validatedData);
      res.json(savedResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error saving response:", error);
      res.status(500).json({ error: "Failed to save response" });
    }
  });

  app.post("/api/questionnaire/responses/batch", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { responses } = req.body;
      
      if (!Array.isArray(responses)) {
        return res.status(400).json({ error: "Responses must be an array" });
      }

      const validatedResponses = responses.map(resp => 
        insertResponseSchema.parse({
          userId: req.user.id.toString(),
          questionId: resp.questionId,
          response: resp.response
        })
      );
      
      const savedResponses = await questionnaireStorage.saveMultipleResponses(validatedResponses);
      res.json(savedResponses);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error saving responses:", error);
      res.status(500).json({ error: "Failed to save responses" });
    }
  });

  // Admin seed route
  app.post("/api/admin/questionnaire/seed", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "super_admin") {
      return res.status(401).json({ error: "Super admin access required" });
    }

    try {
      await seedQuestionnaires();
      res.json({ success: true, message: "Questionnaires seeded successfully" });
    } catch (error) {
      console.error("Error seeding questionnaires:", error);
      res.status(500).json({ error: "Failed to seed questionnaires" });
    }
  });
}