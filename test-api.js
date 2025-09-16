// Simple test script to verify Gemini API key
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAAzqWZrHNutKEW1w4rwxHTJ2eAPZWUmu0";

async function testAPI() {
  try {
    console.log("Testing Gemini API...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try to list models first
    try {
      const models = await genAI.listModels();
      console.log("Available models:", models.map(m => m.name));
      
      if (models.length > 0) {
        const modelName = models[0].name;
        console.log(`Testing model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, how are you?");
        const response = await result.response;
        const text = response.text();
        
        console.log("✅ API is working!");
        console.log("Response:", text);
      }
    } catch (error) {
      console.log("Model listing failed, trying known models...");
      
      const knownModels = [
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest", 
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-pro"
      ];
      
      for (const modelName of knownModels) {
        try {
          console.log(`Testing ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent("Hello");
          const response = await result.response;
          const text = response.text();
          
          console.log(`✅ ${modelName} works!`);
          console.log("Response:", text);
          break;
        } catch (modelError) {
          console.log(`❌ ${modelName} failed:`, modelError.message);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

testAPI();