import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Clock, User, Calendar, Share2, BookOpen } from "lucide-react";

const blogContent = {
  "1": {
    title: "Finding Your Way Out When Feeling Depressed",
    category: "Depression",
    readTime: "8 min read",
    author: "Dr. Sarah Johnson",
    date: "2024-01-15",
    content: `
      <p>Depression can feel like being trapped in a dark tunnel with no visible way out. As a student facing academic pressures, social challenges, and life transitions, these feelings can be particularly overwhelming. However, it's important to remember that depression is treatable, and there are concrete steps you can take to begin your journey toward healing.</p>

      <h2>Understanding Depression in Students</h2>
      <p>Student depression often manifests differently than in adults. You might experience:</p>
      <ul>
        <li>Persistent feelings of sadness or emptiness</li>
        <li>Loss of interest in activities you once enjoyed</li>
        <li>Difficulty concentrating on studies</li>
        <li>Changes in sleep patterns or appetite</li>
        <li>Feelings of worthlessness or guilt</li>
      </ul>

      <h2>Practical Strategies for Recovery</h2>
      
      <h3>1. Establish Small, Achievable Goals</h3>
      <p>When depression makes everything feel impossible, start small. Set micro-goals like making your bed, taking a shower, or attending one class. These small victories can build momentum.</p>

      <h3>2. Maintain Social Connections</h3>
      <p>Depression often pushes us to isolate, but connection is crucial for healing. Reach out to one friend or family member daily, even if it's just a text message.</p>

      <h3>3. Practice Self-Compassion</h3>
      <p>Treat yourself with the same kindness you'd show a good friend. Depression often comes with harsh self-criticism, but learning to be gentle with yourself is essential for recovery.</p>

      <h2>When to Seek Professional Help</h2>
      <p>If your symptoms persist for more than two weeks or interfere with your daily functioning, it's time to seek professional support. Remember, asking for help is a sign of strength, not weakness.</p>

      <p>Recovery from depression is possible. With the right support, strategies, and professional help when needed, you can find your way back to mental wellness and academic success.</p>
    `,
  },
  "2": {
    title: "How to Avoid Stress During Exam Season",
    category: "Stress Management",
    readTime: "6 min read",
    author: "Dr. Michael Chen",
    date: "2024-01-12",
    content: `
      <p>Exam season can be one of the most stressful times in a student's life. The pressure to perform, combined with tight deadlines and high stakes, can create overwhelming anxiety. However, with the right strategies, you can navigate this challenging period while maintaining your mental health.</p>

      <h2>Understanding Exam Stress</h2>
      <p>Exam stress is your body's natural response to perceived pressure. While some stress can be motivating, excessive stress can:</p>
      <ul>
        <li>Impair memory and concentration</li>
        <li>Disrupt sleep patterns</li>
        <li>Cause physical symptoms like headaches</li>
        <li>Lead to procrastination or avoidance</li>
      </ul>

      <h2>Effective Stress Management Techniques</h2>
      
      <h3>1. Create a Realistic Study Schedule</h3>
      <p>Break your study material into manageable chunks. Use techniques like the Pomodoro method (25 minutes of focused study followed by a 5-minute break) to maintain concentration without burnout.</p>

      <h3>2. Practice Deep Breathing</h3>
      <p>When you feel overwhelmed, try the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. This activates your body's relaxation response.</p>

      <h3>3. Maintain Physical Health</h3>
      <p>Don't sacrifice sleep, exercise, or proper nutrition for extra study time. Your brain needs these fundamentals to function optimally during exams.</p>

      <h2>The Night Before and Day of Exams</h2>
      <p>Avoid cramming the night before. Instead, do a light review, prepare everything you need, and focus on relaxation. On exam day, arrive early, bring water, and remember that you've prepared as best you can.</p>
    `,
  },
  "3": {
    title: "Best Practices for Staying Mentally Healthy",
    category: "Wellness",
    readTime: "10 min read",
    author: "Dr. Emily Rodriguez",
    date: "2024-01-10",
    content: `
      <p>Mental health isn't just the absence of mental illness—it's a state of well-being where you can cope with life's stresses, work productively, and contribute to your community. For students, maintaining mental health is crucial for academic success and personal growth.</p>

      <h2>The Foundation of Mental Wellness</h2>
      
      <h3>1. Prioritize Sleep Hygiene</h3>
      <p>Aim for 7-9 hours of quality sleep each night. Create a consistent bedtime routine, limit screen time before bed, and keep your sleeping environment cool and dark.</p>

      <h3>2. Nourish Your Body</h3>
      <p>What you eat directly impacts your mental health. Focus on:</p>
      <ul>
        <li>Regular meals to maintain stable blood sugar</li>
        <li>Omega-3 rich foods like fish and walnuts</li>
        <li>Plenty of fruits and vegetables</li>
        <li>Limiting caffeine and alcohol</li>
      </ul>

      <h3>3. Stay Physically Active</h3>
      <p>Exercise is a powerful mood booster. Even 30 minutes of walking daily can significantly improve mental health by releasing endorphins and reducing stress hormones.</p>

      <h2>Building Emotional Resilience</h2>
      
      <h3>4. Develop Mindfulness Practices</h3>
      <p>Regular mindfulness or meditation practice can help you stay present, reduce anxiety, and improve emotional regulation. Start with just 5 minutes daily.</p>

      <h3>5. Cultivate Meaningful Relationships</h3>
      <p>Strong social connections are protective factors for mental health. Invest time in relationships that are supportive, authentic, and reciprocal.</p>

      <h3>6. Set Healthy Boundaries</h3>
      <p>Learn to say no to commitments that drain your energy. It's okay to prioritize your well-being over pleasing others.</p>

      <h2>Managing Academic Stress</h2>
      <p>Remember that your worth isn't determined by your grades. Develop a growth mindset, celebrate small wins, and view challenges as opportunities to learn and grow.</p>
    `,
  },
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = id ? blogContent[id as keyof typeof blogContent] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button variant="outline">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/blog" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Link>
          </Button>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {post.readTime}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <Card className="shadow-card">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  lineHeight: "1.7",
                }}
              />
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card hover:shadow-wellness transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-wellness rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Building Resilience as a Student</h4>
                      <p className="text-sm text-muted-foreground">Learn how to develop mental toughness and bounce back from setbacks.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card hover:shadow-wellness transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-wellness rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">The Power of Mindfulness for Students</h4>
                      <p className="text-sm text-muted-foreground">How mindfulness practices can improve focus and reduce anxiety.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;