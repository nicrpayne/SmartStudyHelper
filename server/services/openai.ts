import OpenAI from "openai";
import { Step } from "@shared/schema";

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key-placeholder" 
});

// Function to analyze a problem using OpenAI
export async function analyzeProblem(problemText: string): Promise<{
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
}> {
  try {
    const prompt = `
      Analyze this homework problem: "${problemText}"
      
      As an educational tutor, provide a detailed but accessible explanation for a student.
      Include:
      1. The type of problem and core concepts involved
      2. A brief overview of the approach to solve it
      3. Step-by-step solution process with hints for each step
      4. A detailed explanation that connects this problem to broader concepts
      5. The final answer/solution
      
      Format your response in this exact JSON structure:
      {
        "problemType": "Brief description of the problem type (e.g., 'Quadratic Equation')",
        "overview": "A brief explanation of the approach to solve this problem",
        "steps": [
          {
            "title": "Step title",
            "description": "Clear explanation of this step",
            "hintQuestion": "Optional question that prompts thinking (if applicable)",
            "hint": "Optional helpful hint for this step (if applicable)"
          }
          // more steps as needed
        ],
        "detailedExplanation": "Comprehensive explanation connecting this to broader concepts",
        "solution": "The final answer in a concise format"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an expert homework tutor who helps students understand concepts through interactive step-by-step guidance." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const analysis = JSON.parse(content);
    
    // Validate the structure has required fields
    if (!analysis.problemType || !analysis.overview || !Array.isArray(analysis.steps) || 
        !analysis.detailedExplanation || !analysis.solution) {
      throw new Error("Invalid response structure from AI analysis");
    }

    return {
      problemType: analysis.problemType,
      overview: analysis.overview,
      steps: analysis.steps,
      detailedExplanation: analysis.detailedExplanation,
      solution: analysis.solution
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error(`Failed to analyze problem with AI: ${(error as Error).message}`);
  }
}
