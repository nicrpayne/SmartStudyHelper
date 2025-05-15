import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Step in the solution process
export interface Step {
  title: string;
  description: string;
  hintQuestion?: string;
  hint?: string;
}

// Schema for homework problems
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  imageFilename: text("image_filename").notNull(),
  detectedText: text("detected_text").notNull(),
  problemType: text("problem_type").notNull(),
  gradeLevel: text("grade_level"),
  overview: text("overview").notNull(),
  steps: jsonb("steps").$type<Step[]>().notNull(),
  detailedExplanation: text("detailed_explanation").notNull(),
  solution: text("solution").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProblemSchema = createInsertSchema(problems).omit({
  id: true,
  createdAt: true,
});

export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type HomeworkProblem = typeof problems.$inferSelect;

// Keep the existing users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
