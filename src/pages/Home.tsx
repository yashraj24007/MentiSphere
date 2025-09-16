import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-wellness.jpg";
import { MessageCircle, BookOpen, Calendar, Shield, Heart, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Mental wellness meditation scene" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Strengthen Your <span className="text-primary-glow">Mental Armor</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              MentiSphere helps students build resilience, find balance, and thrive mentally with AI-powered support and professional guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-wellness">
                <Link to="/emotion-mirror">Start AI Session</Link>
              </Button>
              <Button asChild size="lg" className="bg-primary text-white font-semibold hover:bg-primary-light shadow-wellness">
                <Link to="/therapy">Book Therapy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Journey to Mental Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover powerful tools and resources designed specifically for students to maintain and improve mental health.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-wellness transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-wellness rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Emotion Mirror</CardTitle>
                <CardDescription>
                  Get instant emotional support with our AI-powered chat that analyzes your mood and provides personalized guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full bg-gradient-wellness">
                  <Link to="/emotion-mirror">Try Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-wellness transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-wellness rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Wellness Blog</CardTitle>
                <CardDescription>
                  Explore expert articles on mental health, stress management, and wellness strategies tailored for students.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/blog">Read Articles</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-wellness transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-wellness rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Therapy Sessions</CardTitle>
                <CardDescription>
                  Book one-on-one therapy sessions with qualified therapists. Flexible scheduling to fit your student life.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/therapy">Book Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose MentiSphere */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MentiSphere?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Safe & Confidential</h3>
              <p className="text-muted-foreground">Your privacy is our priority. All sessions and data are completely confidential.</p>
            </div>
            <div className="text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Student-Focused</h3>
              <p className="text-muted-foreground">Designed specifically for student challenges, stress, and mental health needs.</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">Connect with qualified therapists who understand student life and challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MentiSphere</span>
          </div>
          <p className="text-white/70">
            Empowering students to strengthen their mental armor and thrive.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;