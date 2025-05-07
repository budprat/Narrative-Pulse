
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="gradient-text mb-6">Ready to Transform Your Storytelling?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join organizations worldwide using NarrativePulse to create impactful narratives that drive real change.
          </p>
          <div className="bg-gradient-to-r from-narrativepulse-600/10 to-storytelling-500/10 p-8 rounded-xl border border-border">
            <h3 className="text-2xl font-semibold mb-6">Start Your Free 14-Day Trial</h3>
            <p className="mb-6">No credit card required. Full access to all features.</p>
            <Button size="lg" className="px-8">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
