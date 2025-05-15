import OpenAI from "openai";
import fs from "fs";
import { Step } from "@shared/schema";

// Initialize OpenAI client with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze a homework problem directly from an image using OpenAI's Vision models
 */
export async function analyzeHomeworkImage(imagePath: string): Promise<{
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel: string;
  detectedText: string;
}> {
  try {
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    console.log("Reading image file for vision analysis:", imagePath);
    
    // Read the image file as base64
    const imageBuffer = await fs.promises.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the request for vision analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an expert educational tutor who can analyze homework problems from images. First identify what the problem is asking, then analyze its difficulty level and appropriate grade level. Provide detailed step-by-step guidance for solving it."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This is a photo of a homework problem. Please analyze it with these steps:\n1. Extract and describe the text/problem shown in the image\n2. Determine the appropriate grade level for this problem\n3. Identify the problem type and core concepts involved\n4. Provide step-by-step guidance for solving it, with clear explanations tailored to the identified grade level\n5. Explain the broader concepts involved\n6. Provide the final answer\n\nFormat your response as a JSON object with these properties: detectedText, gradeLevel, problemType, overview, steps (an array of {title, description, hintQuestion, hint}), detailedExplanation, and solution."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    // Log that we received a response
    console.log("Received vision analysis response from OpenAI");
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.detectedText || !result.gradeLevel || !result.problemType || 
        !result.overview || !Array.isArray(result.steps) || 
        !result.detailedExplanation || !result.solution) {
      throw new Error("Invalid response structure from vision analysis");
    }
    
    // Log success
    console.log(`Successfully analyzed homework image as ${result.problemType} for ${result.gradeLevel} level`);
    
    return {
      detectedText: result.detectedText,
      gradeLevel: result.gradeLevel,
      problemType: result.problemType,
      overview: result.overview,
      steps: result.steps,
      detailedExplanation: result.detailedExplanation,
      solution: result.solution
    };
  } catch (error) {
    console.error("Error in vision-based homework analysis:", error);
    throw error;
  }
}