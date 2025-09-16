/**
 * Groq AI API Utility
 * 
 * This utility handles interactions with Groq's AI API for the EmotionMirror chatbot.
 * It manages token tracking, crisis detection, conversation summaries, and session management.
 * 
 * Features:
 * - Fast responses with Groq's optimized inference
 * - Generous rate limits on free tier
 * - Crisis keyword detection
 * - Session token tracking
 * - Conversation summaries
 * - Content moderation integration
 */

import Groq from "groq-sdk";

// Configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Initialize Groq client
let groqClient: Groq;
let workingModel = "llama-3.1-70b-versatile"; // Default model
let modelDetectionComplete = false;
let modelDetectionFailed = false;

// Available Groq models (in order of preference)
const GROQ_MODELS = [
  "llama-3.1-70b-versatile",    // Best for complex conversations
  "llama-3.1-8b-instant",      // Fastest responses
  "mixtral-8x7b-32768",        // Good balance of speed/quality
  "llama3-70b-8192",           // Alternative large model
  "llama3-8b-8192",            // Alternative fast model
];

// Session management
let sessionTokenCount = 0;
const MAX_TOKENS_PER_SESSION = 2000;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (Groq is fast!)

// Crisis keywords to look for
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "don't want to live",
  "want to die", "ending it all", "take my own life", "no reason to live",
  "better off dead", "harming myself", "hurt myself", "self harm", "die"
];

// Initialize Groq client
try {
  console.log("🚀 Initializing Groq AI...");
  
  if (!GROQ_API_KEY) {
    console.error("❌ Groq API key is missing. Please check your .env file.");
    throw new Error("Groq API key missing");
  }
  
  if (GROQ_API_KEY === 'your_groq_api_key_here') {
    console.error("❌ Please set your actual Groq API key in the .env file");
    throw new Error("Invalid Groq API key - using placeholder");
  }
  
  groqClient = new Groq({ 
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
  });
  console.log("✅ Groq client initialized successfully");
  
  // Start model detection
  detectWorkingModel();
} catch (error) {
  console.error("❌ Failed to initialize Groq API:", error);
  modelDetectionFailed = true;
  
  // Create a fallback for development
  groqClient = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ 
            message: { 
              content: "AI service unavailable: " + (error instanceof Error ? error.message : "Unknown error")
            }
          }]
        })
      }
    }
  } as any;
}

// Function to detect which Groq model works
async function detectWorkingModel() {
  console.log("🔍 Detecting available Groq models...");
  let foundWorkingModel = false;
  
  try {
    for (const modelName of GROQ_MODELS) {
      try {
        console.log(`Testing Groq model: ${modelName}...`);
        const response = await groqClient.chat.completions.create({
          messages: [{ role: "user", content: "Hello" }],
          model: modelName,
          max_tokens: 10,
          temperature: 0.7
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log(`✅ Successfully connected to Groq model: ${modelName}`);
          workingModel = modelName;
          foundWorkingModel = true;
          break;
        }
      } catch (error) {
        console.warn(`❌ Groq model ${modelName} not available:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error during model detection:", error);
  }
  
  if (foundWorkingModel) {
    console.log(`✅ Using Groq model: ${workingModel}`);
  } else {
    console.error("❌ No working Groq models found! Application will use fallback responses.");
    modelDetectionFailed = true;
  }
  
  modelDetectionComplete = true;
}

/**
 * Estimate token count for a given text
 * This is a rough approximation: ~1 token per 4 characters
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if a message contains crisis indicators
 * @param text The message to check
 * @returns boolean indicating if crisis language was detected
 */
export const checkForCrisisIndicators = (text: string): boolean => {
  return CRISIS_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
};

/**
 * Get formatted crisis resources text
 * @returns Formatted string with crisis resources
 */
export const getCrisisResources = (): string => {
  return `If you're experiencing a crisis or having thoughts of suicide, please reach out for help:
  
🆘 **Crisis Hotlines:**
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

🏥 **Emergency Services:**
• Call 911 for immediate emergency assistance
• Go to your nearest emergency room

💙 **Remember:** You are not alone, and help is available. These feelings can be temporary, and with support, things can improve.`;
};

/**
 * Process a message with the Groq AI API
 * @param message The user message to process
 * @param conversationHistory The conversation history so far
 * @param userGender Optional user gender for personalization
 * @returns Response object with AI text and token information
 */
export const getGeminiResponse = async (
  message: string, 
  conversationHistory: string,
  userGender?: string
) => {
  console.log("Groq AI called:", { messageLength: message.length, gender: userGender });
  
  try {
    // Check rate limiting (less restrictive for Groq)
    const now = Date.now();
    if (lastRequestTime > 0 && (now - lastRequestTime) < MIN_REQUEST_INTERVAL) {
      const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
      throw new Error(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before making another request`);
    }
    
    // Check if Groq client is properly initialized
    if (!groqClient) {
      throw new Error("Groq API not properly initialized");
    }
    
    // Wait for model detection to complete if it's still running
    if (!modelDetectionComplete) {
      console.log("Waiting for model detection to complete...");
      let waitAttempts = 0;
      while (!modelDetectionComplete && waitAttempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waitAttempts++;
      }
    }
    
    // Check if we have a working model
    if (!workingModel && modelDetectionFailed) {
      throw new Error("No compatible Groq models found during initialization");
    }

    // Add estimated tokens
    const estimatedTokens = estimateTokenCount(message);
    sessionTokenCount += estimatedTokens;

    // Build system prompt
    let systemPrompt = `You are an empathetic AI assistant called Emotion Mirror, designed to provide emotional support to users. Your responses should be warm, supportive, and understanding.`;
    
    if (userGender) {
      systemPrompt += ` The user identifies as ${userGender}, so tailor your language appropriately.`;
    }
    
    systemPrompt += ` Keep responses concise but helpful. Focus on providing emotional support and practical guidance.`;

    // Build conversation messages
    const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    
    // Add conversation history if available
    if (conversationHistory.trim()) {
      messages.push({
        role: "assistant",
        content: `Previous conversation context: ${conversationHistory}`
      });
    }
    
    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call Groq API
    console.log(`Sending request to Groq (${workingModel})...`);
    const completion = await groqClient.chat.completions.create({
      messages: messages,
      model: workingModel,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    });
    
    // Update last request time on successful request
    lastRequestTime = Date.now();
    
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("Empty response from Groq API");
    }
    
    console.log("Received response from Groq:", response.substring(0, 50) + "...");
    
    // Add response tokens to count
    const responseTokens = estimateTokenCount(response);
    sessionTokenCount += responseTokens;

    return {
      text: response,
      tokensUsed: estimatedTokens + responseTokens,
      totalTokens: sessionTokenCount,
      hasReachedLimit: sessionTokenCount >= MAX_TOKENS_PER_SESSION
    };
    
  } catch (error) {
    console.error("Error with Groq API:", error);
    
    // Return helpful error message
    let errorMessage = "I'm having trouble processing your message right now. Please try again in a moment.";
    let retryDelay = 0;
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      
      if (error.message.includes("API key") || error.message.includes("unauthorized")) {
        errorMessage = "There seems to be an issue with the API configuration. Please check if the Groq API key is properly set up.";
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = "The AI service is experiencing high demand. Please wait a moment before trying again.";
        retryDelay = 5;
      } else if (error.message.includes("quota") || error.message.includes("billing")) {
        errorMessage = "The AI service quota has been reached. Please try again later or check your Groq account billing.";
        retryDelay = 30;
      } else if (error.message.includes("model") || error.message.includes("404")) {
        errorMessage = "The AI model is temporarily unavailable. The system will try an alternative model.";
        retryDelay = 5;
        
        // Trigger model re-detection
        setTimeout(() => {
          workingModel = GROQ_MODELS[0]; // Reset to default
          detectWorkingModel();
        }, 1000);
      } else if (error.message.includes("wait")) {
        errorMessage = error.message; // Use the wait message as-is
        retryDelay = 2;
      }
    }
    
    return {
      text: errorMessage,
      tokensUsed: 0,
      totalTokens: sessionTokenCount,
      hasReachedLimit: false,
      error: true,
      retryDelay: retryDelay
    };
  }
};

/**
 * Generate a summary of the conversation using Groq
 * @param conversationHistory The conversation history
 * @returns Summary text
 */
export const getConversationSummary = async (conversationHistory: string) => {
  console.log("Getting conversation summary with Groq");
  
  try {
    if (!groqClient || !workingModel) {
      return "Session summary unavailable due to API issues.";
    }
    
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, empathetic summaries of emotional support conversations. Focus on key themes, progress, and insights."
        },
        {
          role: "user",
          content: `Please provide a brief, compassionate summary of this emotional support conversation:\n\n${conversationHistory}\n\nSummary:`
        }
      ],
      model: workingModel,
      max_tokens: 200,
      temperature: 0.5
    });
    
    const summary = completion.choices[0]?.message?.content;
    return summary || "Unable to generate conversation summary.";
    
  } catch (error) {
    console.error("Error generating conversation summary:", error);
    return "Session summary unavailable. Thank you for using Emotion Mirror.";
  }
};

/**
 * Reset the session token count
 */
export const resetSession = () => {
  sessionTokenCount = 0;
  lastRequestTime = 0;
  console.log("Session reset - token count and rate limiting cleared");
};

/**
 * Get current token usage information
 * @returns Object with token usage details
 */
export const getTokenUsage = () => {
  return {
    used: sessionTokenCount,
    limit: MAX_TOKENS_PER_SESSION,
    remaining: Math.max(0, MAX_TOKENS_PER_SESSION - sessionTokenCount),
    percentage: Math.round((sessionTokenCount / MAX_TOKENS_PER_SESSION) * 100)
  };
};

/**
 * Check if the session has reached token limits
 * @returns boolean indicating if limits are reached
 */
export const hasReachedTokenLimit = (): boolean => {
  return sessionTokenCount >= MAX_TOKENS_PER_SESSION;
};

// Export the client for testing purposes (optional)
export const getGroqClient = () => groqClient;