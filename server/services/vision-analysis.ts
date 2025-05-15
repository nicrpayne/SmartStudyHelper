import OpenAI from "openai";
import fs from "fs";
import { Step } from "@shared/schema";
import { openaiQueue } from "../lib/request-queue";

// Initialize OpenAI client with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Wrapper function to make OpenAI API calls through the request queue
 * This helps prevent rate limit errors by managing request timing and retries
 */
async function queuedOpenAIRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return openaiQueue.addRequest(requestFn);
}

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
      console.error("OpenAI API key is missing, cannot perform vision analysis");
      throw new Error("OpenAI API key is missing");
    }

    console.log("Reading image file for vision analysis:", imagePath);
    
    // Read the image file as base64
    const imageBuffer = await fs.promises.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Log the image size to help debugging
    console.log(`Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    
    // More detailed logs for better debugging
    console.log("Sending vision API request to OpenAI");
    
    // Prepare the request for vision analysis using the queued request for rate limiting
    const response = await queuedOpenAIRequest(() => 
      openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are an expert educational tutor who can analyze and explain homework problems for any grade level from kindergarten through college. You can precisely identify the grade level a problem is suited for based on curriculum standards and cognitive development expectations. You adjust your vocabulary, explanation detail, and hint directness based on the detected grade level - using simpler language and direct guidance for younger students, while using more advanced terminology and subtle hints for older students."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "This is a photo of a homework problem. Please analyze it with these steps:\n\n1. Extract and clearly describe the exact text/problem shown in the image\n\n2. Carefully determine the precise grade level (K, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade, 12, College) this problem is appropriate for based on:\n   - Vocabulary and language complexity\n   - Mathematical concepts and operations required\n   - Problem-solving techniques needed\n   - Common curriculum standards for different grade levels\n\n3. Identify the specific problem type and core concepts involved\n\n4. Provide step-by-step guidance for solving it, with explanations tailored specifically to the identified grade level:\n   - Use simpler language and more direct hints for younger grades\n   - Use more complex language and subtle hints for higher grades\n   - Adjust the explanation depth based on grade-appropriate expectations\n\n5. Explain the broader concepts in language appropriate for the identified grade level\n\n6. Provide the final answer or solution approach\n\nFormat your response as a JSON object with these properties: detectedText (exact problem text), gradeLevel (specific grade K-12 or College), problemType, overview, steps (an array of {title, description, hintQuestion, hint} tailored to the grade level), detailedExplanation, and solution."
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
        temperature: 0.5 // Lower temperature for more focused response
      })
    );

    // Log that we received a response
    console.log("Received vision analysis response from OpenAI");
    
    // Parse the response
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      
      const result = JSON.parse(content);
      
      // Validate the response structure with detailed error messages
      if (!result.detectedText) {
        throw new Error("Missing detectedText in OpenAI response");
      }
      if (!result.gradeLevel) {
        throw new Error("Missing gradeLevel in OpenAI response");
      }
      if (!result.problemType) {
        throw new Error("Missing problemType in OpenAI response");
      }
      if (!result.overview) {
        throw new Error("Missing overview in OpenAI response");
      }
      if (!Array.isArray(result.steps)) {
        throw new Error("Missing or invalid steps array in OpenAI response");
      }
      if (!result.detailedExplanation) {
        throw new Error("Missing detailedExplanation in OpenAI response");
      }
      if (!result.solution) {
        throw new Error("Missing solution in OpenAI response");
      }
      
      // Log success with detailed information
      console.log(`Successfully analyzed homework image as ${result.problemType} for ${result.gradeLevel} level`);
      console.log(`Detected text length: ${result.detectedText.length} characters`);
      console.log(`Number of solution steps: ${result.steps.length}`);
      
      return {
        detectedText: result.detectedText,
        gradeLevel: result.gradeLevel,
        problemType: result.problemType,
        overview: result.overview,
        steps: result.steps,
        detailedExplanation: result.detailedExplanation,
        solution: result.solution
      };
    } catch (err) {
      const parseError = err as Error;
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Response content:", response.choices[0].message.content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
  } catch (err) {
    const error = err as any;
    console.error("Error in vision-based homework analysis:", error);
    
    // Add more detailed error logging
    if (error.response) {
      console.error("OpenAI API error status:", error.response.status);
      console.error("OpenAI API error data:", error.response.data);
    }
    
    throw error;
  }
}