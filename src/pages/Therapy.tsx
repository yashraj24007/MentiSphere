import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { Calendar, Clock, DollarSign, Star, User, Video, MessageSquare, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Therapist {
  id: string;
  name: string;
  specialization: string[];
  experience: number;
  rating: number;
  sessionPrice: number;
  image?: string;
  bio: string;
  availableSlots: string[];
}

const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: ["Anxiety", "Depression", "Student Life"],
    experience: 8,
    rating: 4.9,
    sessionPrice: 80,
    bio: "Specialized in helping students navigate academic stress, anxiety, and life transitions. Uses CBT and mindfulness approaches.",
    availableSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialization: ["Stress Management", "Academic Performance", "Sleep Issues"],
    experience: 12,
    rating: 4.8,
    sessionPrice: 90,
    bio: "Expert in stress management and performance optimization for students. Integrates cognitive-behavioral therapy with lifestyle coaching.",
    availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialization: ["Social Anxiety", "Self-Esteem", "Relationships"],
    experience: 6,
    rating: 4.7,
    sessionPrice: 75,
    bio: "Focuses on building confidence and improving social connections. Specializes in helping introverted students thrive in college.",
    availableSlots: ["9:30 AM", "12:00 PM", "2:30 PM", "4:30 PM"],
  },
  {
    id: "4",
    name: "Dr. David Kim",
    specialization: ["ADHD", "Learning Difficulties", "Time Management"],
    experience: 10,
    rating: 4.9,
    sessionPrice: 85,
    bio: "Specializes in neurodevelopmental differences and learning strategies. Helps students with ADHD and learning challenges succeed academically.",
    availableSlots: ["8:00 AM", "11:30 AM", "1:30 PM", "3:30 PM"],
  },
];

const Therapy = () => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("video");
  const { toast } = useToast();

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Session Booked Successfully!",
      description: `Your therapy session with ${selectedTherapist?.name} has been scheduled for ${selectedDate} at ${selectedTime}.`,
    });
    setSelectedTherapist(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-wellness rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Therapy Sessions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with qualified therapists who understand student life. Flexible scheduling that fits your academic calendar.
          </p>
        </div>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="shadow-card hover:shadow-wellness transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{therapist.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{therapist.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{therapist.experience} years experience</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-lg font-semibold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {therapist.sessionPrice}
                    </div>
                    <span className="text-sm text-muted-foreground">per session</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <CardDescription>{therapist.bio}</CardDescription>
                  
                  <div className="pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-wellness shadow-soft"
                          onClick={() => setSelectedTherapist(therapist)}
                        >
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book Session with {therapist.name}</DialogTitle>
                          <DialogDescription>
                            Schedule your therapy session with flexible date and time options.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleBooking} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="session-type">Session Type</Label>
                            <Select value={sessionType} onValueChange={setSessionType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">
                                  <div className="flex items-center space-x-2">
                                    <Video className="h-4 w-4" />
                                    <span>Video Call</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="chat">
                                  <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Text Chat</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="date">Select Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              min={getTomorrowDate()}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="time">Available Time Slots</Label>
                            <Select value={selectedTime} onValueChange={setSelectedTime} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a time" />
                              </SelectTrigger>
                              <SelectContent>
                                {therapist.availableSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{slot}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">Session Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Briefly describe what you'd like to discuss or any specific concerns..."
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="bg-accent/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Session Cost:</span>
                              <span className="text-lg font-bold text-primary">
                                ${therapist.sessionPrice}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Payment will be processed after the session
                            </p>
                          </div>

                          <Button type="submit" className="w-full bg-gradient-hero shadow-soft">
                            Confirm Booking
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-card shadow-wellness">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">How Therapy Sessions Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Book Your Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred therapist, date, and time that fits your schedule.
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Join Your Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect via secure video call or chat from anywhere you feel comfortable.
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Start Healing</h3>
                  <p className="text-sm text-muted-foreground">
                    Work with your therapist to develop coping strategies and improve your mental health.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Therapy;