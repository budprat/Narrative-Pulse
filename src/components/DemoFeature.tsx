import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Lightbulb, Sparkles, Copy, TrendingUp, Brain, Zap, AlertCircle, Info, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { validateNarrativeInput } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { generateNarrativeDemo } from "@/services/narrative.service";
import type { NarrativeTone, Narrative } from "@/types/api";

const DemoFeature = () => {
  const [inputText, setInputText] = useState("");
  const [toneSelected, setToneSelected] = useState<NarrativeTone>("activist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [generatedNarrative, setGeneratedNarrative] = useState<Narrative | null>(null);
  const { toast } = useToast();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tones = [
    { id: "activist", label: "Activist", icon: <Zap className="h-4 w-4" /> },
    { id: "scientific", label: "Scientific", icon: <Brain className="h-4 w-4" /> },
    { id: "political", label: "Political", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "inspirational", label: "Inspirational", icon: <Sparkles className="h-4 w-4" /> }
  ];

  // Progress animation effect
  useEffect(() => {
    if (isGenerating) {
      progressIntervalRef.current = setInterval(() => {
        setGenerationProgress(prev => {
          // Slow down as we approach 90% (waiting for actual response)
          if (prev >= 90) return prev;
          if (prev >= 70) return prev + 2;
          return prev + 5;
        });
      }, 200);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    } else {
      setGenerationProgress(0);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    // Clear previous state
    setValidationError("");
    setGeneratedNarrative(null);

    // Validate input
    const validation = validateNarrativeInput(inputText, toneSelected);

    if (!validation.success) {
      setValidationError(validation.error);
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setOutputText("");

    try {
      // Call the real API
      const result = await generateNarrativeDemo({
        input: inputText,
        tone: toneSelected,
      });

      // Complete progress
      setGenerationProgress(100);

      if ('error' in result) {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Set the generated narrative
      setGeneratedNarrative(result.narrative);
      setOutputText(result.narrative.outputText);

      toast({
        title: "Narrative Generated",
        description: `Generated in ${result.narrative.generationTime}ms using ${result.narrative.modelUsed}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-narrativepulse-100 dark:bg-narrativepulse-900/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-storytelling-100 dark:bg-storytelling-900/20 rounded-full blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="gradient-text mb-4 relative inline-block">
            Experience the Intelligence
            <div className="absolute -top-6 -right-8 text-yellow-400 animate-pulse-slow">
              <Sparkles className="h-6 w-6" />
            </div>
          </h2>
          <p className="text-muted-foreground">
            Try our Narrative Intelligence Engine with this interactive demo. Input your data and see how it transforms into compelling narratives with different tones.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-primary/70">
          <CardContent className="p-6">
            <div className="mb-6 space-y-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Input your data or research findings:
              </label>
              <Textarea
                placeholder="Enter environmental data, research findings, survey results, or any information you want to transform..."
                className={cn(
                  "min-h-32 transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  validationError && "border-destructive focus:border-destructive focus:ring-destructive/20"
                )}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setValidationError(""); // Clear error on input change
                }}
              />
              {validationError && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            <div className="mb-6 space-y-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Select your narrative tone:
              </label>
              <Tabs defaultValue={toneSelected} onValueChange={setToneSelected} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 rounded-lg bg-muted/80">
                  {tones.map(tone => (
                    <TabsTrigger 
                      key={tone.id} 
                      value={tone.id}
                      className={cn(
                        "flex items-center gap-1.5 transition-all duration-300",
                        "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                        "data-[state=active]:text-primary data-[state=active]:shadow-md",
                        "data-[state=active]:scale-105"
                      )}
                    >
                      {tone.icon}
                      {tone.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!inputText.trim() || isGenerating}
              className={cn(
                "w-full mb-6 relative overflow-hidden transition-all",
                "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
                "shadow-md hover:shadow-lg"
              )}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Generate Narrative</span>
                </div>
              )}
            </Button>

            {isGenerating && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            {outputText && (
              <div className="mt-6 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    Generated {tones.find(t => t.id === toneSelected)?.label} Narrative:
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-xs gap-1 transition-all duration-200"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="p-5 bg-muted rounded-md relative border border-border shadow-inner">
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 bg-secondary/10 rounded-full text-secondary">
                      {tones.find(t => t.id === toneSelected)?.icon}
                      <span>{tones.find(t => t.id === toneSelected)?.label} Tone</span>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed pt-2 pr-24">{outputText}</p>
                </div>

                {/* Authenticity & Provenance Badge */}
                {generatedNarrative && (
                  <div className="mt-3 flex items-center justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1.5 text-xs">
                              <Shield className="h-3 w-3" />
                              AI-Assisted Content
                            </Badge>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="space-y-1.5 text-xs">
                            <p className="font-medium">Provenance Information</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <span className="text-muted-foreground">Model:</span>
                              <span>{generatedNarrative.modelUsed}</span>
                              <span className="text-muted-foreground">Generated:</span>
                              <span>{new Date(generatedNarrative.createdAt).toLocaleString()}</span>
                              <span className="text-muted-foreground">Time:</span>
                              <span>{generatedNarrative.generationTime}ms</span>
                              {generatedNarrative.tokenCount && (
                                <>
                                  <span className="text-muted-foreground">Tokens:</span>
                                  <span>{generatedNarrative.tokenCount}</span>
                                </>
                              )}
                              <span className="text-muted-foreground">Source Hash:</span>
                              <span className="font-mono text-[10px]">
                                {generatedNarrative.sourceDataHash?.slice(0, 12)}...
                              </span>
                            </div>
                            <p className="text-muted-foreground pt-1 border-t">
                              This content was generated by AI. Human review recommended before publication.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {generatedNarrative.isDemo && (
                      <Badge variant="secondary" className="text-xs">
                        Demo Mode
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-1">
                <Lightbulb className="h-3 w-3" />
                <span>Try different tones to see how your message can be adapted for various audiences</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DemoFeature;
