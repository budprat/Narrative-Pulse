
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, Lightbulb } from "lucide-react";

const DemoFeature = () => {
  const [inputText, setInputText] = useState("");
  const [toneSelected, setToneSelected] = useState("activist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputText, setOutputText] = useState("");

  const tones = [
    { id: "activist", label: "Activist" },
    { id: "scientific", label: "Scientific" },
    { id: "political", label: "Political" },
    { id: "inspirational", label: "Inspirational" }
  ];

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      const outputs = {
        activist: "The unprecedented loss of biodiversity in our region isn't just a statistic—it's a call to action. Every day we wait, more species face extinction and more ecosystems collapse. Join our movement to demand immediate policy changes that protect our natural heritage before it's too late.",
        scientific: "Analysis of biodiversity metrics across the region reveals a significant decline of 37% in native species abundance over the past decade. This data correlates strongly with increased industrial activity (p<0.001), suggesting urgent conservation interventions are required to maintain ecosystem stability.",
        political: "Our administration recognizes that environmental protection and economic growth can coexist. The proposed Biodiversity Protection Act balances the needs of industry stakeholders while ensuring sustainable management of our natural resources for future generations.",
        inspirational: "Imagine a world where our children can experience the same natural wonders we cherished growing up. Together, we can create this reality. Every conservation action, no matter how small, contributes to a magnificent tapestry of renewal and hope for our planet."
      };
      
      setOutputText(outputs[toneSelected]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="gradient-text mb-4">Experience the Intelligence</h2>
          <p className="text-muted-foreground">
            Try our Narrative Intelligence Engine with this interactive demo. Input your data and see how it transforms into compelling narratives with different tones.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Input your data or research findings:
              </label>
              <Textarea 
                placeholder="Enter environmental data, research findings, survey results, or any information you want to transform..."
                className="min-h-32"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select your narrative tone:
              </label>
              <Tabs defaultValue={toneSelected}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  {tones.map(tone => (
                    <TabsTrigger 
                      key={tone.id} 
                      value={tone.id}
                      onClick={() => setToneSelected(tone.id)}
                      className={toneSelected === tone.id ? "bg-primary text-primary-foreground" : ""}
                    >
                      {tone.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!inputText.trim() || isGenerating}
              className="w-full mb-6"
            >
              {isGenerating ? "Generating..." : "Generate Narrative"}
            </Button>

            {outputText && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Generated {tones.find(t => t.id === toneSelected)?.label} Narrative:
                </label>
                <div className="p-4 bg-muted rounded-md relative">
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lightbulb size={14} />
                      <span>{tones.find(t => t.id === toneSelected)?.label} Tone</span>
                    </div>
                  </div>
                  <p className="text-foreground">{outputText}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DemoFeature;
