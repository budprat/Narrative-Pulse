
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Use Cases", href: "#usecases" },
    { name: "Pricing", href: "#" },
    { name: "About", href: "#" },
  ];

  return (
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
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline">Log in</Button>
          <Button>Try for free</Button>
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
                  className="text-foreground/80 hover:text-foreground transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col space-y-4">
                <Button variant="outline">Log in</Button>
                <Button>Try for free</Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
