
import { 
  BookOpen, 
  Globe, 
  MessageCircle, 
  ChartPie, 
  Users, 
  Target 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Narrative Intelligence Engine",
      description: "Converts raw data into engaging narratives with customizable tones: Activist, Scientific, Political, or Inspirational."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "EthnoAI Agent",
      description: "Transforms field notes and survey responses into personas, sentiments, and compelling story arcs for deeper audience understanding."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Campaign Companion",
      description: "Suggests high-impact story formats and provides feedback on narrative structure based on your specific campaign goals."
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "StoryCrowd Plugin",
      description: "Crowdsource and verify grassroots submissions, transforming authentic voices into powerful narratives for your cause."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multilingual Adaptation",
      description: "Automatically translates and culturally adapts content for target regions, expanding your reach and resonance globally."
    },
    {
      icon: <ChartPie className="h-6 w-6" />,
      title: "Impact Analytics",
      description: "Measure narrative effectiveness with comprehensive metrics and visualizations to optimize your storytelling strategy."
    }
  ];

  return (
    <section id="features" className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="gradient-text mb-3 text-3xl md:text-4xl">Powerful Features for Strategic Storytelling</h2>
          <p className="text-muted-foreground">
            Our AI-powered platform provides all the tools you need to craft compelling narratives
            that drive real-world change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card border-t-2 border-t-primary/30 hover:border-t-primary transition-colors">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="feature-icon w-10 h-10 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
