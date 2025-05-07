
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "NarrativePulse transformed how we communicate complex policy initiatives. Our public engagement increased by 45% within three months.",
      author: "Sarah Mitchell",
      role: "Policy Director, Climate Action Network",
      initials: "SM"
    },
    {
      quote: "The EthnoAI agent helped us understand community needs at a deeper level. Our campaign messaging resonated more authentically as a result.",
      author: "Rajiv Patel",
      role: "Campaign Manager, Regional Development Initiative",
      initials: "RP"
    },
    {
      quote: "We translated technical research into compelling stories across 12 languages, dramatically expanding our global advocacy reach.",
      author: "Elena Rodriguez",
      role: "Communications Lead, Human Rights Watch",
      initials: "ER"
    }
  ];

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="gradient-text mb-3 text-3xl md:text-4xl">What Our Users Say</h2>
          <p className="text-muted-foreground">
            Hear from professionals who have transformed their storytelling approach with NarrativePulse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-card border-l-2 border-l-secondary/30 hover:border-l-secondary transition-colors">
              <CardContent className="pt-4 px-4 pb-4">
                <div className="flex flex-col h-full">
                  <div className="mb-3 text-base font-medium text-foreground/90 italic">
                    "{testimonial.quote}"
                  </div>
                  <div className="mt-auto pt-3 flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-gradient-to-br from-narrativepulse-400 to-storytelling-500 text-white text-xs">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
