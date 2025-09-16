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

try {
  console.log(`🚀 Initializing AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  
  if (AI_PROVIDER === 'groq') {
    if (!GROQ_API_KEY) {
      console.error("❌ Groq API key is missing. Please check your .env file.");
      throw new Error("Groq API key missing");
    }
    
    if (GROQ_API_KEY === 'your_groq_api_key_here') {
      console.error("❌ Please set your actual Groq API key in the .env file");
      throw new Error("Invalid Groq API key");
    }
    
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
    console.log("✅ Groq client initialized successfully");
    
  } else {
    // Gemini initialization (existing code)
    if (!GEMINI_API_KEY) {
      console.error("❌ Gemini API key is missing. Please check your .env file.");
      throw new Error("Gemini API key missing");
    }
    
    if (GEMINI_API_KEY.length < 30) {
      console.error("❌ Gemini API key appears to be invalid (too short)");
      throw new Error("Invalid Gemini API key format");
    }
    
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ Gemini API initialized successfully");
  }
  
  // Start the model detection process
  detectWorkingModel();
} catch (error) {
  console.error("❌ Failed to initialize AI API:", error);
  modelDetectionFailed = true;
  // Create a fallback for development
  genAI = {
    getGenerativeModel: () => ({
      generateContent: async (prompt) => ({
        response: { text: () => "API error: " + (error instanceof Error ? error.message : "Unknown error") }
      })
    })
  };
}

// Function to detect which model works with the current AI provider
async function detectWorkingModel() {
  console.log(`🔍 Detecting available ${AI_PROVIDER.toUpperCase()} models...`);
  let foundWorkingModel = false;
  
  try {
    if (AI_PROVIDER === 'groq') {
      // Test Groq models
      for (const modelName of groqModels) {
        try {
          console.log(`Testing Groq model: ${modelName}...`);
          const response = await groqClient.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: modelName,
            max_tokens: 10
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
    } else {
      // Test Gemini models (existing logic)
      // First try to get list of available models
      try {
        console.log("📋 Attempting to list available Gemini models...");
        const models = await genAI.listModels();
        console.log("📋 Available models:", models);
        
        if (models && models.length > 0) {
          const textModel = models.find(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent')
          );
          if (textModel) {
            workingModel = textModel.name;
            foundWorkingModel = true;
            console.log(`✅ Found working Gemini model from API list: ${workingModel}`);
          }
        }
      } catch (listError) {
        console.warn("⚠️ Unable to list Gemini models, will try known model names:", listError.message);
      }
      
      // If we couldn't get the list, try each Gemini model one by one
      if (!foundWorkingModel) {
        for (const modelName of geminiModels) {
          try {
            console.log(`Testing Gemini model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            const text = response.text();
            if (text && text.length > 0) {
              console.log(`✅ Successfully connected to Gemini model: ${modelName}`);
              workingModel = modelName;
              foundWorkingModel = true;
              break;
            }
          } catch (error) {
            console.warn(`❌ Gemini model ${modelName} not available:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error during model detection:", error);
  }
  
  if (foundWorkingModel) {
    console.log(`Using working model: ${workingModel}`);
  } else {
    console.error("No working models found! Application will use fallback responses.");
    modelDetectionFailed = true;
  }
  
  modelDetectionComplete = true;
}

// Session data tracking
let sessionTokenCount = 0;
const MAX_TOKENS_PER_SESSION = 500;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 45000; // 45 seconds between requests to avoid quota

// Crisis keywords to look for
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "don't want to live",
  "want to die", "ending it all", "take my own life", "no reason to live",
  "better off dead", "harming myself", "hurt myself", "self harm","die"
];

// Crisis resources by country
export const CRISIS_RESOURCES = {
  global: {
    name: "International Association for Suicide Prevention",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    phone: null
  },
  usa: {
    name: "National Suicide Prevention Lifeline",
    url: "https://suicidepreventionlifeline.org/",
    phone: "1-800-273-8255"
  },
  india: {
    name: "AASRA",
    url: "http://www.aasra.info/",
    phone: "91-9820466726"
  },
  uk: {
    name: "Samaritans",
    url: "https://www.samaritans.org/",
    phone: "116 123"
  }
};

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
  
• ${CRISIS_RESOURCES.usa.name}: ${CRISIS_RESOURCES.usa.phone}
• ${CRISIS_RESOURCES.india.name}: ${CRISIS_RESOURCES.india.phone}
• ${CRISIS_RESOURCES.global.name}: Visit ${CRISIS_RESOURCES.global.url}

Remember that help is available, and you're not alone.`;
};

/**
 * Estimate token count for a piece of text
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ~= 4 characters
  return Math.ceil(text.length / 4);
};

/**
 * Process a message with the configured AI provider (Groq or Gemini)
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
  console.log(`AI API called (${AI_PROVIDER}):`, { messageLength: message.length, gender: userGender });
  
  try {
    // Check quota timing (less restrictive for Groq)
    const now = Date.now();
    const minInterval = AI_PROVIDER === 'groq' ? 1000 : MIN_REQUEST_INTERVAL; // 1 second for Groq, 45s for Gemini
    
    if (lastRequestTime > 0 && (now - lastRequestTime) < minInterval) {
      const waitTime = Math.ceil((minInterval - (now - lastRequestTime)) / 1000);
      throw new Error(`Please wait ${waitTime} seconds before making another request`);
    }
    
    // Check if API clients are properly initialized
    if (AI_PROVIDER === 'groq' && !groqClient) {
      throw new Error("Groq API not properly initialized");
    } else if (AI_PROVIDER === 'gemini' && !genAI?.getGenerativeModel) {
      throw new Error("Gemini API not properly initialized");
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
      throw new Error(`No compatible ${AI_PROVIDER} models found during initialization`);
    }

    // Add estimated tokens
    const estimatedTokens = estimateTokenCount(message);
    sessionTokenCount += estimatedTokens;

    // Build prompt with gender context and history
    let prompt = `You are an empathetic AI assistant called Emotion Mirror, designed to provide emotional support to users.`;
    
    if (userGender) {
      prompt += ` The user identifies as ${userGender}.`;
    }
    
    prompt += `\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}\n\nRespond with empathy and emotional intelligence. Don't be too verbose, keep responses concise but helpful. Your tone should be warm and supportive.`;

    let response;
    
    if (AI_PROVIDER === 'groq') {
      // Groq API call
      console.log(`Sending prompt to Groq API (${workingModel})...`);
      const completion = await groqClient.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an empathetic AI assistant called Emotion Mirror, designed to provide emotional support to users."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        model: workingModel,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      response = completion.choices[0]?.message?.content;
      
    } else {
      // Gemini API call (existing logic)
      let model;
      try {
        model = genAI.getGenerativeModel({ model: workingModel });
        console.log(`Using working Gemini model: ${workingModel}`);
      } catch (modelError) {
        console.warn(`Failed to load working model ${workingModel}:`, modelError);
        
        // If the working model fails, try to detect again
        console.log("Re-running model detection...");
        await detectWorkingModel();
        
        if (!workingModel) {
          throw new Error("Failed to find any compatible Gemini models");
        }
        
        model = genAI.getGenerativeModel({ model: workingModel });
        console.log(`Using newly detected model: ${workingModel}`);
      }
      
      console.log("Sending prompt to Gemini API...");
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error("Empty response from Gemini API");
      }
      
      response = result.response.text();
    }
    
    // Update last request time on successful request
    lastRequestTime = Date.now();
    
    if (!response) {
      throw new Error(`Empty response from ${AI_PROVIDER} API`);
    }
    
    console.log(`Received response from ${AI_PROVIDER}:`, response.substring(0, 50) + "...");
    
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
    console.error("Error with Gemini API:", error);
    
    // Return a more helpful error message
    let errorMessage = "I'm having trouble processing your message right now. Please try again in a moment.";
    let retryDelay = 0;
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      
      if (error.message.includes("API key")) {
        errorMessage = "There seems to be an issue with my configuration. Please make sure the API key is correctly set up.";
      } else if (error.message.includes("network")) {
        errorMessage = "I'm having trouble connecting to my backend services. Please check your internet connection and try again.";
      } else if (error.message.includes("quota") || error.message.includes("429") || error.message.includes("rate limit")) {
        // Handle rate limit errors with more detailed information
        const waitTime = Math.ceil(MIN_REQUEST_INTERVAL / 1000);
        errorMessage = `The AI service quota has been exceeded. Please wait at least ${waitTime} seconds before trying again. This is a limitation of the free API tier.`;
        retryDelay = MIN_REQUEST_INTERVAL / 1000;
        
        // Try to extract retry delay if available
        const retryDelayMatch = error.message.match(/retryDelay":"(\d+)s"/);
        if (retryDelayMatch && retryDelayMatch[1]) {
          retryDelay = Math.max(parseInt(retryDelayMatch[1], 10), retryDelay);
          errorMessage = `The AI service quota has been exceeded. Please wait ${retryDelay} seconds before trying again.`;
        }
        
        console.log(`Rate limit hit. Will retry after ${retryDelay} seconds.`);
      } else if (error.message.includes("404") || error.message.includes("not found")) {
        // Handle 404 errors - likely an issue with the model name
        errorMessage = "The AI model is currently unavailable. The system will try an alternative model.";
        retryDelay = 5;
        
        // Trigger a new model detection for next time
        console.log("Model not found error. Scheduling model re-detection...");
        setTimeout(() => {
          workingModel = null;
          detectWorkingModel();
        }, 1000);
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
 * Generate a summary of the conversation
 * @param conversationHistory The conversation history
 * @returns Summary text
 */
export const getConversationSummary = async (conversationHistory: string) => {
  console.log("Getting conversation summary");
  
  try {
    // First check if API is available
    if (!genAI.getGenerativeModel) {
      throw new Error("Gemini API not properly initialized");
    }
    
    // Wait for model detection to complete if it's still running
    if (!modelDetectionComplete) {
      console.log("Waiting for model detection to complete before generating summary...");
      let waitAttempts = 0;
      while (!modelDetectionComplete && waitAttempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waitAttempts++;
      }
    }
    
    // Check if we have a working model
    if (!workingModel && modelDetectionFailed) {
      throw new Error("No compatible Gemini models found for generating summary");
    }
    
    // Use the detected working model
    let model;
    try {
      model = genAI.getGenerativeModel({ model: workingModel });
      console.log(`Using working model for summary: ${workingModel}`);
    } catch (modelError) {
      console.warn(`Failed to load working model for summary: ${workingModel}`, modelError);
      
      // If we can't use the model, provide a generic summary
      throw new Error("Unable to use Gemini API for conversation summary");
    }
    
    console.log("Sending summary request to Gemini API...");
    const result = await model.generateContent(`
      Conversation history:
      ${conversationHistory}
      
      Please provide a brief summary of this conversation, highlighting:
      1. Key emotional themes discussed
      2. Any significant insights
      3. Brief suggestions for the user going forward
      
      Keep it concise and supportive.
    `);
    
    if (!result || !result.response) {
      throw new Error("Empty response from Gemini API for summary");
    }
    
    const summaryText = result.response.text();
    console.log("Summary generated successfully");
    
    return summaryText;
  } catch (error) {
    console.error("Error getting conversation summary:", error);
    
    // Provide a generic summary if API fails
    return "Thank you for our conversation today. I hope you found it helpful. Remember that it's important to prioritize your mental well-being, and don't hesitate to reach out for support when needed.";
  }
};

/**
 * Reset the token count for a new session
 */
export const resetSession = () => {
  sessionTokenCount = 0;
};

/**
 * Get token usage information
 * @returns Object with token usage stats
 */
export const getTokenUsage = () => {
  return {
    tokensUsed: sessionTokenCount,
    maxTokens: MAX_TOKENS_PER_SESSION,
    percentageUsed: (sessionTokenCount / MAX_TOKENS_PER_SESSION) * 100
  };
};