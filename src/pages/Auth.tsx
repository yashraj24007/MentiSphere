import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { Heart, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [userType, setUserType] = useState<"student" | "therapist">("student");
  const [therapistType, setTherapistType] = useState<
    "School/Academic Counselor" | "Child & Adolescent Therapist" | "Student Wellness Coach" | "Peer Support Counselor" | "Mindfulness & Stress-Relief Coach" | "Grief & Adjustment Counselor" | "Substance Use & Behavioral Counselor" | "Family / Relationship Therapist"
  >("School/Academic Counselor");
  const { toast } = useToast();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account Created!",
      description: "Welcome to MentiSphere. You can now access all features.",
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Welcome Back!",
      description: "Successfully logged into MentiSphere.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to MentiSphere</h1>
            <p className="text-muted-foreground">Join our community of mental wellness</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="••••••••" required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-hero shadow-soft">
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join MentiSphere as a student or therapist</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userType">Register as</Label>
                      <Select value={userType} onValueChange={(value: "student" | "therapist") => setUserType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="therapist">Therapist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your full name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="your@email.com" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" required />
                    </div>

                    {userType === "therapist" && (
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" type="number" placeholder="5" min="1" required />
                      </div>
                    )}
                    {userType === "therapist" && (
                      <div className="space-y-2">
                      <Label htmlFor="therapistType">Type of Therapist</Label>
                      <Select value={therapistType} onValueChange={(value: "School/Academic Counselor" | "Child & Adolescent Therapist" | "Student Wellness Coach" | "Peer Support Counselor" | "Mindfulness & Stress-Relief Coach" | "Grief & Adjustment Counselor" | "Substance Use & Behavioral Counselor" | "Family / Relationship Therapist") => setTherapistType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School/Academic Counselor">School/Academic Counselor</SelectItem>
                          <SelectItem value="Child & Adolescent Therapist">Child & Adolescent Therapist</SelectItem>
                          <SelectItem value="Student Wellness Coach">Student Wellness Coach</SelectItem>
                          <SelectItem value="Peer Support Counselor">Peer Support Counselor</SelectItem>
                          <SelectItem value="Mindfulness & Stress-Relief Coach">Mindfulness & Stress-Relief Coach</SelectItem>
                          <SelectItem value="Grief & Adjustment Counselor">Grief & Adjustment Counselor</SelectItem>
                          <SelectItem value="Substance Use & Behavioral Counselor">Substance Use & Behavioral Counselor</SelectItem>
                          <SelectItem value="Family / Relationship Therapist">Family / Relationship Therapist</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="••••••••" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" placeholder="••••••••" required />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-wellness shadow-soft">
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;