
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="gradient-text mb-4 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
            Turn complex data into compelling narratives
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            An AI-powered storytelling assistant that helps policy makers, NGOs, and campaigns
            translate data into stories that influence decisions and public opinion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" className="gap-2 text-base">
              Get started <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Watch demo
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-16 bottom-0 top-auto"></div>
            <div className="bg-gradient-to-br from-narrativepulse-100 to-storytelling-100 dark:from-narrativepulse-900/20 dark:to-storytelling-900/20 rounded-xl overflow-hidden shadow-xl border border-border">
              <img 
                src="/placeholder.svg" 
                alt="NarrativePulse Dashboard" 
                className="w-full h-auto opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
