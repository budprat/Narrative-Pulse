
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const UseCases = () => {
  const useCases = [
    {
      id: "political",
      label: "Political Campaigns",
      title: "Win Elections with Data-Driven Storytelling",
      description: "Craft compelling campaign narratives that resonate with voters by transforming polling data, demographic insights, and community feedback into powerful stories.",
      benefits: [
        "Personalize messaging for different voter segments",
        "Create emotional connections with your constituency",
        "Develop consistent narrative across all campaign materials",
        "Quickly respond to evolving campaign dynamics"
      ],
      image: "/placeholder.svg"
    },
    {
      id: "ngos",
      label: "NGOs & Advocacy",
      title: "Amplify Your Cause with Emotional Narratives",
      description: "Transform complex social and environmental data into compelling stories that motivate action, influence policy, and drive donations for your cause.",
      benefits: [
        "Translate technical research into accessible stories",
        "Enhance fundraising campaigns with emotional narratives",
        "Build cross-cultural awareness and support",
        "Track narrative impact on advocacy goals"
      ],
      image: "/placeholder.svg"
    },
    {
      id: "sustainability",
      label: "Sustainability",
      title: "Communicate Environmental Impact Effectively",
      description: "Turn sustainability metrics and environmental data into narratives that demonstrate impact, build stakeholder trust, and inspire eco-conscious action.",
      benefits: [
        "Transform technical sustainability reports into engaging content",
        "Visualize environmental impact through compelling narratives",
        "Adapt complex climate science for different audiences",
        "Build emotional connection to sustainability initiatives"
      ],
      image: "/placeholder.svg"
    },
    {
      id: "policy",
      label: "Policy Development",
      title: "Shape Better Policy with Strategic Narratives",
      description: "Convert policy research, public input, and impact assessments into clear, persuasive narratives that drive stakeholder buy-in and policy adoption.",
      benefits: [
        "Build public support through accessible policy narratives",
        "Create compelling briefs and presentations for decision-makers",
        "Integrate diverse community perspectives into coherent narratives",
        "Measure narrative effectiveness on policy outcomes"
      ],
      image: "/placeholder.svg"
    }
  ];

  return (
    <section id="usecases" className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="gradient-text mb-3 text-3xl md:text-4xl">Transforming Industries Through Narrative</h2>
          <p className="text-muted-foreground">
            See how NarrativePulse empowers organizations across sectors to achieve their goals through strategic storytelling.
          </p>
        </div>

        <Tabs defaultValue="political" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            {useCases.map((useCase) => (
              <TabsTrigger key={useCase.id} value={useCase.id} className="text-sm md:text-base">
                {useCase.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {useCases.map((useCase) => (
            <TabsContent key={useCase.id} value={useCase.id} className="animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    {useCase.label}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{useCase.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Benefits:</h4>
                    <ul className="space-y-1.5 text-sm">
                      {useCase.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-4 w-4 min-w-4 rounded-full gradient-bg flex items-center justify-center text-white text-xs mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={useCase.image} 
                    alt={useCase.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default UseCases;
