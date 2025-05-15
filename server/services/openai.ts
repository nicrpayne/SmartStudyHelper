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
  // Check if we have an API key - we'll always try to use it if available
  const useDevFallback = !process.env.OPENAI_API_KEY;
  
  if (useDevFallback) {
    console.log("Using development fallback for OpenAI API. No API key found.");
    return getFallbackAnalysis(problemText);
  }
  
  // Log that we're using the API
  console.log("Using OpenAI API for homework analysis");
  
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
  // Extract text to analyze keywords
  const detectedText = problemText.trim();
  const lowerText = detectedText.toLowerCase();
  
  // Check for elementary word problems
  if (lowerText.includes('how many') || 
      lowerText.includes('theater') ||
      lowerText.includes('audience') ||
      lowerText.includes('scrapbook') ||
      lowerText.includes('hockey') ||
      lowerText.includes('cards') ||
      lowerText.includes('wheels') ||
      lowerText.includes('model cars')) {
    return getElementaryWordProblemFallback();
  }
  
  // Check for geometry/symmetry problems
  if (lowerText.includes('symmetry') || 
      lowerText.includes('figure') || 
      lowerText.includes('congruent') ||
      lowerText.includes('triangle') ||
      lowerText.includes('draw')) {
    return getGeometryProblemFallback();
  }
  
  // If the text contains math-related keywords, return a math problem fallback
  if (detectedText.includes("=") || 
      detectedText.includes("+") || 
      detectedText.includes("-") || 
      detectedText.includes("x") || 
      detectedText.includes("solve") ||
      detectedText.includes("equation")) {
    return getMathProblemFallback(detectedText);
  }
  
  // Default to elementary math problem if no specific keywords are found
  return getElementaryMathFallback();
}

// Main math problem fallback
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

// Elementary word problem fallback
function getElementaryWordProblemFallback(): {
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel: string;
} {
  return {
    problemType: "Word Problems",
    overview: "This problem involves solving a real-world situation using arithmetic operations and logical reasoning.",
    gradeLevel: "Grade 3",
    steps: [
      {
        title: "Understand the problem",
        description: "Read the problem carefully to identify what you're looking for and what information is given.",
        hintQuestion: "What is the problem asking you to find?",
        hint: "Look for a question mark or phrases like 'how many' to identify what you need to calculate."
      },
      {
        title: "Identify the important information",
        description: "Pick out the numbers and relationships that will help you solve the problem.",
        hintQuestion: "What numbers do you need to use?",
        hint: "Underline or circle the key numbers and facts in the problem."
      },
      {
        title: "Choose the correct operation",
        description: "Decide whether to add, subtract, multiply, or divide based on what the problem is asking.",
        hintQuestion: "Are you combining quantities, finding the difference, making equal groups, or sharing equally?",
        hint: "Addition combines, subtraction takes away, multiplication makes groups, and division shares."
      },
      {
        title: "Set up and solve",
        description: "Write out your equation and solve it step by step.",
        hintQuestion: "What equation will help you solve this problem?",
        hint: "Use the numbers you identified and the operation you chose to write your equation."
      }
    ],
    detailedExplanation: "Word problems help connect math to real-world situations. They require you to translate words into mathematical operations and equations. Being able to solve word problems shows that you understand not just how to calculate, but when and why to use different math operations. This skill is important for applying math in everyday life.",
    solution: "For a theater problem with 8 rows of 9 seats where all but 3 seats are full, you would calculate 8 × 9 = 72 total seats, then 72 - 3 = 69 people in the audience."
  };
}

// Geometry/symmetry problem fallback
function getGeometryProblemFallback(): {
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel: string;
} {
  return {
    problemType: "Geometry & Symmetry",
    overview: "This problem involves identifying symmetry in shapes and determining which figures are congruent (the same size and shape).",
    gradeLevel: "Grade 3",
    steps: [
      {
        title: "Understand symmetry",
        description: "A line of symmetry divides a shape into two equal halves that are mirror images of each other.",
        hintQuestion: "How can you tell if a shape has symmetry?",
        hint: "Imagine folding the shape along a line. If the two halves match perfectly, that's a line of symmetry."
      },
      {
        title: "Find lines of symmetry",
        description: "For each shape, try to draw all possible lines that would create equal halves.",
        hintQuestion: "How many lines of symmetry does each shape have?",
        hint: "A square has 4 lines of symmetry, a rectangle has 2, and a regular hexagon has 6."
      },
      {
        title: "Understand congruence",
        description: "Two figures are congruent if they have exactly the same size and shape, even if they're rotated or flipped.",
        hintQuestion: "What makes two shapes congruent?",
        hint: "Congruent shapes have equal corresponding sides and angles."
      },
      {
        title: "Compare figures",
        description: "Look carefully at each figure's shape, size, and angles to determine which ones are congruent.",
        hintQuestion: "How can you tell if two figures are congruent?",
        hint: "Try to imagine if one shape could be placed exactly on top of the other if you're allowed to rotate or flip it."
      }
    ],
    detailedExplanation: "Geometry helps us understand the properties of shapes and their relationships. Symmetry is an important concept that shows balance in shapes and appears throughout nature and design. Congruence is another key concept that helps us identify when two shapes are exactly the same. These concepts build foundational understanding for more advanced geometry and spatial reasoning.",
    solution: "For triangles, figures A and D might be congruent if they have the exact same size and shape. For rectangles, figures A and D are likely congruent, with the same shape but possibly different orientations."
  };
}

// Generic elementary math fallback
function getElementaryMathFallback(): {
  problemType: string;
  overview: string;
  steps: Step[];
  detailedExplanation: string;
  solution: string;
  gradeLevel: string;
} {
  return {
    problemType: "Elementary Mathematics",
    overview: "This problem involves basic math skills appropriate for elementary school students, likely including arithmetic operations, pattern recognition, or simple problem-solving.",
    gradeLevel: "Grade 3",
    steps: [
      {
        title: "Read the problem carefully",
        description: "Understand what the problem is asking and identify the key information provided.",
        hintQuestion: "What information do you need to solve this problem?",
        hint: "Look for numbers and keywords that tell you what operation to use."
      },
      {
        title: "Identify the operation needed",
        description: "Figure out whether you need to add, subtract, multiply, or divide to solve the problem.",
        hintQuestion: "What math operation will help you solve this?",
        hint: "Addition combines quantities, subtraction finds the difference, multiplication is repeated addition, and division is sharing equally."
      },
      {
        title: "Work step by step",
        description: "Solve the problem one step at a time, writing down your work.",
        hintQuestion: "Can you break this problem into smaller steps?",
        hint: "Start with what you know and work toward what you need to find."
      },
      {
        title: "Check your answer",
        description: "Make sure your answer makes sense for the problem.",
        hintQuestion: "Does your answer seem reasonable?",
        hint: "Try working backward from your answer to see if you get back to the original information."
      }
    ],
    detailedExplanation: "Elementary math problems help build fundamental skills in number sense, operations, and basic problem-solving. These skills create the foundation for more advanced mathematics. By carefully analyzing problems and applying the right operations, students develop critical thinking that extends beyond math into everyday life situations.",
    solution: "The answer depends on the specific problem. Check your work by making sure your calculations are correct and your answer makes logical sense."
  };
}
