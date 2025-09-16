import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { BookOpen, Clock, User, Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Finding Your Way Out When Feeling Depressed",
    excerpt: "Practical strategies and coping mechanisms to help navigate through difficult emotional periods and find hope again.",
    category: "Depression",
    readTime: "8 min read",
    author: "Dr. Sarah Johnson",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "How to Avoid Stress During Exam Season",
    excerpt: "Evidence-based techniques for managing academic pressure and maintaining mental balance during high-stress periods.",
    category: "Stress Management",
    readTime: "6 min read",
    author: "Dr. Michael Chen",
    date: "2024-01-12",
  },
  {
    id: "3",
    title: "Best Practices for Staying Mentally Healthy",
    excerpt: "Daily habits and lifestyle choices that contribute to long-term mental wellness and emotional resilience.",
    category: "Wellness",
    readTime: "10 min read",
    author: "Dr. Emily Rodriguez",
    date: "2024-01-10",
  },
  {
    id: "4",
    title: "Building Resilience as a Student",
    excerpt: "Learn how to develop mental toughness and bounce back from setbacks in your academic and personal life.",
    category: "Resilience",
    readTime: "7 min read",
    author: "Dr. David Kim",
    date: "2024-01-08",
  },
  {
    id: "5",
    title: "Managing Social Anxiety in College",
    excerpt: "Strategies to overcome social fears and build meaningful connections in your college environment.",
    category: "Anxiety",
    readTime: "9 min read",
    author: "Dr. Lisa Thompson",
    date: "2024-01-05",
  },
  {
    id: "6",
    title: "The Power of Mindfulness for Students",
    excerpt: "How incorporating mindfulness practices can improve focus, reduce anxiety, and enhance overall well-being.",
    category: "Mindfulness",
    readTime: "5 min read",
    author: "Dr. James Wilson",
    date: "2024-01-03",
  },
];

const Blog = () => {
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-wellness rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Mental Wellness Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert insights, practical tips, and evidence-based strategies for student mental health and wellness.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            All Posts
          </Badge>
          {categories.map((category) => (
            <Badge key={category} variant="outline" className="cursor-pointer hover:bg-accent">
              {category}
            </Badge>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="h-full shadow-card hover:shadow-wellness transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-gradient-card shadow-wellness">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription>
                Get the latest mental wellness tips and insights delivered to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-2 bg-gradient-wellness text-white rounded-md hover:shadow-soft transition-shadow">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;