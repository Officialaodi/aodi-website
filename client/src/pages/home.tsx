import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, Globe, Building, ArrowRight, Quote, CheckCircle } from "lucide-react";
import type { ImpactMetric, Testimonial } from "@shared/schema";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  "graduation-cap": GraduationCap,
  globe: Globe,
  building: Building,
};

export default function Home() {
  const { data: metrics } = useQuery<ImpactMetric[]>({
    queryKey: ["/api/content/metrics"],
  });

  const { data: testimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/content/testimonials"],
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Empowering Africa's Future Through{" "}
              <span className="text-primary">Mentorship & Partnership</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We connect African youth with global mentors, foster institutional partnerships, 
              and build capacity for sustainable development across the continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-involved">
                <Button size="lg" data-testid="hero-cta-partner">
                  Become a Partner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/get-involved">
                <Button size="lg" variant="outline" data-testid="hero-cta-mentor">
                  Join as Mentor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics?.map((metric) => {
              const IconComponent = iconMap[metric.icon || "users"] || Users;
              return (
                <Card key={metric.id} className="text-center" data-testid={`metric-${metric.id}`}>
                  <CardContent className="pt-6">
                    <IconComponent className="h-10 w-10 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                    <div className="text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes AODI Different</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're not just another NGO. We build lasting bridges between Africa and the global community.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Mentorship</h3>
              <p className="text-muted-foreground">
                Connecting African students and professionals with experienced mentors worldwide for career and academic guidance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Institutional Partnerships</h3>
              <p className="text-muted-foreground">
                Facilitating research collaborations, faculty exchanges, and resource sharing between African and global institutions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">UK Governance, African Impact</h3>
              <p className="text-muted-foreground">
                UK-registered NGO with on-the-ground operations across Africa, ensuring accountability and local relevance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Flagship Program</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              The Global Mentorship Program is the heart of AODI's mission.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-4">What You Get</h3>
                <ul className="space-y-3">
                  {["One-on-one mentorship", "Career guidance", "Skills workshops", "Network access", "Alumni community"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Who Can Apply</h3>
                <ul className="space-y-3">
                  {["University students", "Recent graduates", "Early-career professionals", "STEM & social sciences focus", "African residents"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/programs">
                <Button size="lg" variant="secondary" data-testid="cta-explore-programs">
                  Explore Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stories of Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from our mentees, mentors, and partners about their experience with AODI.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} data-testid={`testimonial-${testimonial.id}`}>
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you want to mentor, partner, volunteer, or apply as a mentee, 
            there's a place for you in the AODI community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved">
              <Button size="lg" data-testid="cta-get-involved">
                Get Involved
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/partners">
              <Button size="lg" variant="outline" data-testid="cta-partner-with-us">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
