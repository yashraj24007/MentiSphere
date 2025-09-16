/**
 * Content Moderation Utility
 * 
 * This utility provides functions for detecting and filtering abusive language
 * in user messages for the EmotionMirror chatbot.
 */

// Basic profanity filter implementation using regex for efficiency
export const quickContentCheck = (text: string): {
  isAbusive: boolean;
  moderatedText: string;
} => {
  // Comprehensive list of abusive terms to filter
  // Using regex with word boundaries to avoid false positives
  const profanityRegex = /\b(fuck|shit|bitch|asshole|cunt|bastard|dick|pussy|whore|slut|nigger|faggot|retard|twat|cock|piss|porn|anal|blowjob|handjob|wank|jizz|cum|sex|rimjob|tits|boobs|vagina|penis|jerk|paki|prick|queer|nazi|kike|spic|chink|nigga|dyke|fag|homo|lesbo|tranny|dildo|fellatio|masturbate|masturbation)\b/gi;
  
  const hasAbusiveContent = profanityRegex.test(text);
  
  if (!hasAbusiveContent) {
    return { 
      isAbusive: false, 
      moderatedText: text 
    };
  }
  
  // Replace profanities with asterisks
  const moderatedText = text.replace(profanityRegex, match => 
    '*'.repeat(match.length)
  );
  
  return {
    isAbusive: true,
    moderatedText
  };
};

// Expanded filter that also checks for variations and misspellings
export const deepContentCheck = (text: string): {
  isAbusive: boolean;
  moderatedText: string;
  categories?: string[];
} => {
  // First do a quick check with the basic filter
  const quickCheck = quickContentCheck(text);
  
  if (quickCheck.isAbusive) {
    return {
      ...quickCheck,
      categories: ["profanity"]
    };
  }
  
  // Check for common deliberate misspellings or evasions
  const evasionPatterns = [
    /f+u+c+k+/i, /s+h+[i!1]+t+/i, /b+[i!1]+t+c+h+/i, /a+s+h+o+l+e+/i,
    /[c(]u+n+t+/i, /d+[i!1l]+c+k+/i, /p+u+s+[s$5]+[iy]+/i, /w+h+o+r+e+/i,
    /[s$5]+l+u+t+/i, /n+[i!1]+g+[e3]+r+/i, /f+a+g+g*[o0]+t+/i
  ];
  
  for (const pattern of evasionPatterns) {
    if (pattern.test(text)) {
      // Replace the matched text with asterisks
      const moderatedText = text.replace(pattern, match => 
        '*'.repeat(match.length)
      );
      
      return {
        isAbusive: true,
        moderatedText,
        categories: ["evasive_profanity"]
      };
    }
  }
  
  return {
    isAbusive: false,
    moderatedText: text
  };
};