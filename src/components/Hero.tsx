
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="gradient-text mb-4 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
            Turn complex data into compelling narratives
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            An AI-powered storytelling assistant that helps policy makers, NGOs, and campaigns
            translate data into stories that influence decisions and public opinion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2 text-base">
              Get started <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Watch demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
