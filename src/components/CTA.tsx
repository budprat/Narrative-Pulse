
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="gradient-text mb-4 text-3xl md:text-4xl">Ready to Transform Your Storytelling?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join organizations worldwide using NarrativePulse to create impactful narratives that drive real change.
          </p>
          <div className="bg-gradient-to-r from-narrativepulse-600/10 to-storytelling-500/10 p-6 rounded-xl border border-border">
            <h3 className="text-xl font-semibold mb-4">Start Your Free 14-Day Trial</h3>
            <p className="mb-4 text-sm">No credit card required. Full access to all features.</p>
            <Button size="lg" className="px-6">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
