
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const navLinks = [
    { name: "Features", href: "#features", enabled: true },
    { name: "Use Cases", href: "#usecases", enabled: true },
    { name: "Pricing", href: "#", enabled: false },
    { name: "About", href: "#", enabled: false },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (!link.enabled) {
      e.preventDefault();
      toast({
        title: "Coming Soon",
        description: `The ${link.name} page is currently under development. Stay tuned!`,
      });
    }
  };

  const handleButtonClick = (action: string) => {
    toast({
      title: "Coming Soon",
      description: `${action} functionality will be available soon. We're working hard to bring you authentication features!`,
    });
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-3">
        <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="font-display font-semibold text-xl">NarrativePulse</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" onClick={() => handleButtonClick("Log in")}>
            Log in
          </Button>
          <Button onClick={() => handleButtonClick("Sign up")}>
            Try for free
          </Button>
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col space-y-6 pt-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-foreground/80 hover:text-foreground transition-colors text-lg cursor-pointer"
                  onClick={(e) => {
                    handleNavClick(e, link);
                    if (link.enabled) setIsOpen(false);
                  }}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleButtonClick("Log in");
                    setIsOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    handleButtonClick("Sign up");
                    setIsOpen(false);
                  }}
                >
                  Try for free
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    </>
  );
};

export default Navbar;
