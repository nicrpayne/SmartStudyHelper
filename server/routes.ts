import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { processOCR } from "./services/ocr";
import { analyzeProblem } from "./services/openai";
import { insertProblemSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

// Declare multer to fix TypeScript errors
declare module 'express-serve-static-core' {
  interface Request {
    file?: {
      path: string;
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
    };
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req: any, file: any, cb: (error: Error | null, destination: string) => void) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads");
      fs.mkdir(uploadDir, { recursive: true })
        .then(() => cb(null, uploadDir))
        .catch(err => cb(err as Error, uploadDir));
    },
    filename: function (req: any, file: any, cb: (error: Error | null, filename: string) => void) {
      // Create unique filename
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: function (req: any, file: any, cb: (error: Error | null, acceptFile: boolean) => void) {
    // Accept only images and PDFs
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Only images (JPEG, PNG) and PDF files are allowed"), false);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Get all problems
  app.get("/api/problems", async (req: Request, res: Response) => {
    try {
      const problems = await storage.getAllProblems();
      return res.json(problems);
    } catch (error) {
      console.error("Error fetching all problems:", error);
      return res.status(500).json({ 
        message: "Failed to fetch problems", 
        error: (error as Error).message 
      });
    }
  });
  
  // Analyze a problem (upload image and process)
  app.post("/api/analyze-problem", upload.single("problemImage"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageFilePath = req.file.path;
      const source = req.body.source || "upload";
      
      // Perform OCR on the image
      const ocrResult = await processOCR(imageFilePath);
      
      if (!ocrResult || !ocrResult.text) {
        return res.status(422).json({ message: "Could not extract text from the image" });
      }
      
      // Analyze the problem with OpenAI
      const analysis = await analyzeProblem(ocrResult.text);
      
      // Create problem in storage
      const problem = {
        imageFilename: req.file.filename,
        detectedText: ocrResult.text,
        problemType: analysis.problemType,
        overview: analysis.overview,
        steps: analysis.steps,
        detailedExplanation: analysis.detailedExplanation,
        solution: analysis.solution
      };
      
      const newProblem = await storage.createProblem(problem);
      
      // Log problem creation for debugging
      console.log("Created new problem with ID:", newProblem.id);
      console.log("Problem details:", JSON.stringify(newProblem, null, 2));
      
      return res.status(201).json({ 
        message: "Problem analyzed successfully", 
        problemId: newProblem.id 
      });
      
    } catch (error) {
      console.error("Error analyzing problem:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid problem data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze problem", 
        error: (error as Error).message 
      });
    }
  });
  
  // Get a specific problem
  app.get("/api/problems/:id", async (req: Request, res: Response) => {
    try {
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const problem = await storage.getProblemById(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      return res.json(problem);
      
    } catch (error) {
      console.error("Error fetching problem:", error);
      return res.status(500).json({ 
        message: "Failed to fetch problem", 
        error: (error as Error).message 
      });
    }
  });
  
  // Get problem image
  app.get("/api/problems/:id/image", async (req: Request, res: Response) => {
    try {
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const problem = await storage.getProblemById(problemId);
      
      if (!problem || !problem.imageFilename) {
        return res.status(404).json({ message: "Problem image not found" });
      }
      
      const imagePath = path.join(process.cwd(), "uploads", problem.imageFilename);
      
      // Check if file exists
      try {
        await fs.access(imagePath);
      } catch (err) {
        return res.status(404).json({ message: "Problem image file not found" });
      }
      
      return res.sendFile(imagePath);
      
    } catch (error) {
      console.error("Error fetching problem image:", error);
      return res.status(500).json({ 
        message: "Failed to fetch problem image", 
        error: (error as Error).message 
      });
    }
  });
  
  // Update problem text
  app.patch("/api/problems/:id", async (req: Request, res: Response) => {
    try {
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const { detectedText } = req.body;
      
      if (!detectedText || typeof detectedText !== "string") {
        return res.status(400).json({ message: "Valid detected text is required" });
      }
      
      const problem = await storage.getProblemById(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      // Update the problem text
      const updatedProblem = await storage.updateProblemText(problemId, detectedText);
      
      // Re-analyze the problem with the new text
      const analysis = await analyzeProblem(detectedText);
      
      // Update problem with new analysis
      const finalProblem = await storage.updateProblemAnalysis(problemId, {
        problemType: analysis.problemType,
        overview: analysis.overview,
        steps: analysis.steps,
        detailedExplanation: analysis.detailedExplanation,
        solution: analysis.solution
      });
      
      return res.json(finalProblem);
      
    } catch (error) {
      console.error("Error updating problem text:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid problem data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to update problem text", 
        error: (error as Error).message 
      });
    }
  });

  return httpServer;
}
