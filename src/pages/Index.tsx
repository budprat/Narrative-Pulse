
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import DemoFeature from "@/components/DemoFeature";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 space-y-0">
        <Hero />
        <Separator className="h-px bg-border/50 my-0" />
        <Features />
        <Separator className="h-px bg-border/50 my-0" />
        <UseCases />
        <Separator className="h-px bg-border/50 my-0" />
        <DemoFeature />
        <Separator className="h-px bg-border/50 my-0" />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
