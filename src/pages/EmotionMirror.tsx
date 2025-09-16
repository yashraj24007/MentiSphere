import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { MessageCircle, Send, Bot, User, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getGeminiResponse, 
  checkForCrisisIndicators, 
  getCrisisResources, 
  getConversationSummary,
  resetSession,
  getTokenUsage
} from "@/utils/groqAPI";
import { quickContentCheck } from "@/utils/contentModeration";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
  isFiltered?: boolean;
}

const EmotionMirror = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(15 * 60); // 15 minutes in seconds
  const [sessionEnded, setSessionEnded] = useState(false);
  const conversationHistoryRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize chat or start timer when gender is selected
  useEffect(() => {
    if (gender && !sessionStarted) {
      setSessionStarted(true);
      resetSession(); // Reset token count
      
      setMessages([
        {
          id: "intro",
          text: `Hello! I'm your AI Emotion Mirror. I notice you identify as ${gender}. How are you feeling today?`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionTime(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gender, sessionStarted]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(sessionTime / 60);
    const seconds = sessionTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // End session and provide summary
  const endSession = async () => {
    if (sessionEnded) return;
    
    setIsTyping(true);
    
    try {
      // Get conversation summary from Gemini
      const summary = await getConversationSummary(conversationHistoryRef.current);
      
      setMessages(prev => [...prev, {
        id: `summary-${Date.now()}`,
        text: `Your session has ended. Here's a summary:\n\n${summary}`,
        sender: "system",
        timestamp: new Date()
      }]);
      
      setSessionEnded(true);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `summary-error-${Date.now()}`,
        text: "Your session has ended. Thank you for using Emotion Mirror.",
        sender: "system",
        timestamp: new Date()
      }]);
      setSessionEnded(true);
    }
    
    setIsTyping(false);
  };

  // Handler for button click to avoid type errors
  const handleSendButtonClick = () => {
    void sendMessage();
  };

  // Send user message and get AI response
  const sendMessage = async (retryInput?: string, retryCount: number = 0) => {
    const messageToSend = retryInput || inputText;
    
    if ((!messageToSend.trim() && !retryInput) || isTyping || sessionEnded) return;
    
    // Store content check result in a variable accessible throughout the function
    let contentCheckResult = { isAbusive: false, moderatedText: messageToSend };
    
    // Only show typing indicator and add user message on first attempt, not retries
    if (!retryInput) {
      // Get token usage information
      const { percentage } = getTokenUsage();
      
      // Check if we're near the token limit
      if (percentage > 90) {
        toast({
          title: "Session Limit Approaching",
          description: "You're nearing the end of this conversation's capacity.",
        });
      }
      
      // Check for abusive content
      contentCheckResult = quickContentCheck(messageToSend);
      const isAbusiveContent = contentCheckResult.isAbusive;
      const moderatedContent = contentCheckResult.moderatedText;
      
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: isAbusiveContent ? moderatedContent : messageToSend,
        sender: "user",
        timestamp: new Date(),
        isFiltered: isAbusiveContent
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      setIsTyping(true);
      
      // Update conversation history
      conversationHistoryRef.current += `\nUser: ${messageToSend}`;
    }
    
    // Check for crisis keywords
    const containsCrisisLanguage = checkForCrisisIndicators(messageToSend);
    
    try {
      // If abusive, respond differently
      if (!retryInput && contentCheckResult.isAbusive) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `ai-${Date.now()}`,
            text: "I'm here to help with your emotional wellbeing. Let's keep our conversation respectful so I can support you better.",
            sender: "ai",
            timestamp: new Date(),
          }]);
          setIsTyping(false);
        }, 1000);
        
        return;
      }
      
      // Get response from Gemini
      const response = await getGeminiResponse(
        messageToSend,
        conversationHistoryRef.current,
        gender || undefined
      );
      
      // Enhanced retry strategy with better backoff and user messaging
      if (response.error && retryCount < 3) {
        // Get retry delay - either from API or use exponential backoff
        const baseDelay = response.retryDelay || 30;
        
        // Different approach for different types of errors
        let retryMultiplier = 1;
        let errorType = "general";
        
        // For rate limit errors, use exponential backoff
        if (baseDelay >= 30) {
          // Likely a rate limit error
          errorType = "rate-limit";
          // Exponential backoff: 1st retry: delay*1, 2nd: delay*2, 3rd: delay*4
          retryMultiplier = Math.pow(2, retryCount);
        } else {
          // For model not found or other errors, use a faster retry
          errorType = "model-issue";
          // Faster retries for model issues as we're trying different models
          retryMultiplier = Math.pow(1.2, retryCount);
        }
        
        const retryTime = baseDelay * 1000 * retryMultiplier;
        
        console.log(`API error (${errorType}). Retrying in ${retryTime/1000} seconds. Attempt: ${retryCount + 1} of 3`);
        
        // Different messages based on error type
        const retryMessages = errorType === "rate-limit" ? 
          [
            "The AI service is busy at the moment. I'll try again shortly...",
            "Still waiting for the AI to respond. Trying again in a moment...",
            "Final attempt to reach the AI service. This may take a bit longer..."
          ] : 
          [
            "Looking for an alternative AI model to use...",
            "Trying a different AI model configuration...",
            "Making one final attempt with available AI models..."
          ];
        
        setMessages(prev => [...prev, {
          id: `retry-notice-${Date.now()}`,
          text: retryMessages[Math.min(retryCount, 2)],
          sender: "system",
          timestamp: new Date(),
        }]);
        
        // Update UI to show retry progress
        toast({
          title: `Retry attempt ${retryCount + 1} of 3`,
          description: `Will retry in ${Math.round(retryTime/1000)} seconds`,
          variant: errorType === "rate-limit" ? "default" : "destructive"
        });
        
        // Wait and retry with appropriate delay
        setTimeout(() => {
          // Don't reset typing indicator for retry
          sendMessage(messageToSend, retryCount + 1);
        }, retryTime);
        
        return;
      }
      
      // Update conversation history
      conversationHistoryRef.current += `\nAI: ${response.text}`;
      
      // Check if this was after retries and still got an error response
      if (retryCount > 0 && response.error) {
        // After multiple retries, provide a helpful fallback response
        setMessages(prev => [...prev, {
          id: `ai-fallback-${Date.now()}`,
          text: "I'm sorry, but I'm currently unable to process your request due to high demand on the AI service. This is a limitation of the free API tier. You might want to try again later when the service is less busy.",
          sender: "system",
          timestamp: new Date(),
        }]);
      } else {
        // Normal AI response
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          text: response.text,
          sender: "ai",
          timestamp: new Date(),
        }]);
      }
      
      // If crisis language detected, add crisis resources message
      if (containsCrisisLanguage) {
        setMessages(prev => [...prev, {
          id: `crisis-${Date.now()}`,
          text: getCrisisResources(),
          sender: "system",
          timestamp: new Date(),
        }]);
      }
      
      // Check if token limit was reached
      if (response.hasReachedLimit) {
        toast({
          title: "Session Limit Reached",
          description: "You've reached the maximum capacity for this conversation.",
        });
        
        setTimeout(() => {
          endSession();
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: "I'm having trouble responding right now. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Start new session
  const startNewSession = () => {
    resetSession();
    setMessages([]);
    setSessionEnded(false);
    setSessionStarted(false);
    setGender(null);
    setSessionTime(15 * 60);
    conversationHistoryRef.current = "";
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Get token usage percentage
  const getTokenUsagePercentage = () => {
    const { percentage } = getTokenUsage();
    return percentage;
  };

  // Initial gender selection screen
  if (!gender) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-wellness">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-wellness rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome to AI Emotion Mirror</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground">
                  To personalize your experience, please let me know how you identify:
                </p>
                
                <RadioGroup value={gender || ""} onValueChange={setGender} className="gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary">Non-binary</Label>
                  </div> */}
                  {/* <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer not to say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer not to say">Prefer not to say</Label>
                  </div> */}
                </RadioGroup>
                
                <Button 
                  onClick={() => gender && setSessionStarted(true)}
                  disabled={!gender}
                  className="w-full bg-gradient-wellness shadow-soft"
                >
                  Start Chat
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Your session will be limited to 15 minutes and approximately 2000 tokens.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-wellness rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Emotion Mirror</h1>
            <p className="text-muted-foreground">
              Your personal AI companion for emotional support and guidance
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTimeRemaining()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {Math.round(getTokenUsagePercentage())}% used
              </span>
            </div>
          </div>
          
          <Progress 
            value={getTokenUsagePercentage()} 
            className="h-1 mb-4" 
          />

          <Card className="shadow-wellness h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-card rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>Emotion Mirror AI</span>
                <div className="ml-auto w-2 h-2 bg-secondary-light rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" 
                          ? "justify-end" 
                          : message.sender === "system" 
                            ? "justify-center" 
                            : "justify-start"
                      }`}
                    >
                      <div
                        className={`${
                          message.sender === "user"
                            ? "bg-gradient-hero text-white max-w-[70%]"
                            : message.sender === "system"
                            ? "bg-yellow-50 border-yellow-200 border text-foreground w-full"
                            : "bg-accent text-foreground border max-w-[70%]"
                        } p-4 rounded-lg ${message.isFiltered ? "opacity-70" : ""}`}
                      >
                        {message.sender === "system" && (
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Important Information</span>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-2">
                          {message.sender === "ai" && (
                            <Bot className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                          )}
                          {message.sender === "user" && (
                            <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === "user" ? "text-white/70" : "text-muted-foreground"
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {message.isFiltered && (
                              <p className="text-xs italic mt-1 text-white/70">
                                Message filtered for inappropriate content
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-accent p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {sessionEnded && (
                    <div className="text-center pt-4">
                      <Button 
                        onClick={startNewSession}
                        variant="outline"
                      >
                        Start New Session
                      </Button>
                    </div>
                  )}
                  
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
              
              <div className="p-6 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="flex-1"
                    disabled={isTyping || sessionEnded}
                  />
                  <Button 
                    onClick={handleSendButtonClick} 
                    disabled={!inputText.trim() || isTyping || sessionEnded}
                    className="bg-gradient-wellness shadow-soft"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    This AI provides emotional support but is not a replacement for professional therapy.
                  </p>
                  {!sessionEnded && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={endSession}
                      className="text-xs"
                    >
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmotionMirror;