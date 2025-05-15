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
  gradeLevel?: string;
}> {
  // Check if we should use the development fallback
  const useDevFallback = process.env.NODE_ENV === 'development' || !process.env.OPENAI_API_KEY;
  
  if (useDevFallback) {
    console.log("Using development fallback for OpenAI API. For production, please add a valid OpenAI API key.");
    return getFallbackAnalysis(problemText);
  }
  
  const prompt = `
    Analyze this homework problem: "${problemText}"
    
    First, assess the approximate grade level (elementary, middle school, high school, college) this problem is appropriate for.
    Then, provide a detailed but accessible explanation tailored for a student at that grade level.
    
    Include:
    1. The type of problem and core concepts involved
    2. A brief overview of the approach to solve it using language appropriate for the identified grade level
    3. Step-by-step solution process with hints for each step using vocabulary suitable for the grade level
    4. A detailed explanation that connects this problem to broader concepts in a way students of that level can understand
    5. The final answer/solution with appropriate work shown
    
    Format your response in this exact JSON structure:
    {
      "gradeLevel": "the approximate grade level (elementary, middle, high, college)",
      "problemType": "Brief description of the problem type (e.g., 'Quadratic Equation')",
      "overview": "A brief explanation of the approach to solve this problem (tailored to the grade level)",
      "steps": [
        {
          "title": "Step title",
          "description": "Clear explanation of this step using grade-appropriate language",
          "hintQuestion": "Optional question that prompts thinking (if applicable)",
          "hint": "Optional helpful hint for this step (if applicable)"
        }
        // more steps as needed
      ],
      "detailedExplanation": "Comprehensive explanation connecting this to broader concepts (grade-appropriate)",
      "solution": "The final answer in a concise format with appropriate work shown"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert educational tutor who can identify the appropriate grade level for academic problems and tailor explanations accordingly. You adjust your vocabulary, complexity, and explanation style based on whether the student is in elementary school, middle school, high school, or college. Your goal is to make concepts accessible while promoting deeper understanding appropriate to the student's educational level."
        },
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

    // Add logging for grade level detection
    if (analysis.gradeLevel) {
      console.log(`Detected grade level: ${analysis.gradeLevel}`);
    }

    return {
      problemType: analysis.problemType,
      overview: analysis.overview,
      steps: analysis.steps,
      detailedExplanation: analysis.detailedExplanation,
      solution: analysis.solution,
      gradeLevel: analysis.gradeLevel || undefined
    };
  } catch (error) {
    console.error("OpenAI API error, using fallback:", error);
    // Return a fallback analysis instead of throwing an error
    return getFallbackAnalysis(problemText);
  }
}

// Fallback function for development or when OpenAI API fails
function getFallbackAnalysis(problemText: string): {
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel?: string;
} {
  // Extract some text to simulate detection
  const detectedText = problemText.trim().substring(0, 100);
  
  // If the text contains math-related keywords, return a math problem fallback
  if (
    detectedText.includes("=") || 
    detectedText.includes("+") || 
    detectedText.includes("-") || 
    detectedText.includes("x") || 
    detectedText.includes("solve") ||
    detectedText.includes("equation")
  ) {
    return getMathProblemFallback(detectedText);
  }
  
  // Default to algebra problem if no specific keywords are found
  return getMathProblemFallback(detectedText);
}

function getMathProblemFallback(detectedText: string): {
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel?: string;
} {
  return {
    problemType: "Algebraic Equation",
    overview: "This problem requires solving an algebraic equation by isolating the variable using algebraic operations.",
    gradeLevel: "high school",
    steps: [
      {
        title: "Identify the equation type",
        description: "This is a linear equation in the form ax + b = c, where x is the variable we need to solve for.",
        hintQuestion: "What is the highest power of the variable in this equation?",
        hint: "In a linear equation, the highest power of the variable is 1."
      },
      {
        title: "Isolate variable terms",
        description: "Move all terms with the variable to one side of the equation.",
        hintQuestion: "How do we move terms from one side to another?",
        hint: "Add or subtract the same value from both sides to move terms."
      },
      {
        title: "Isolate the constant terms",
        description: "Move all constant terms (numbers without variables) to the other side.",
        hintQuestion: "What operation should we use to move constants?",
        hint: "Use the opposite operation: if a term is added, subtract it; if it's subtracted, add it."
      },
      {
        title: "Solve for the variable",
        description: "Divide both sides by the coefficient of the variable to find its value.",
        hintQuestion: "How do we find the final value of the variable?",
        hint: "If we have ax = b, we divide both sides by a to get x = b/a."
      }
    ],
    detailedExplanation: "Linear equations are fundamental in algebra and represent straight lines when graphed. The solution process involves isolating the variable by performing the same operations on both sides of the equation to maintain equality. This preserves the solution while simplifying the equation. Understanding this process helps build foundations for solving more complex equations in algebra and other mathematical fields.",
    solution: "x = 5 (This is a sample solution for demonstration purposes)"
  };
}
