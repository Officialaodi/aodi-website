import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, Globe, Building, Quote, TrendingUp, Award, Target } from "lucide-react";
import type { ImpactMetric, Testimonial } from "@shared/schema";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  "graduation-cap": GraduationCap,
  globe: Globe,
  building: Building,
};

export default function Impact() {
  const { data: metrics } = useQuery<ImpactMetric[]>({
    queryKey: ["/api/content/metrics"],
  });

  const { data: testimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/content/testimonials"],
  });

  return (
    <div>
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Impact</h1>
            <p className="text-lg text-muted-foreground">
              Evidence-driven results. We measure what matters and share our progress openly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Impact at a Glance</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics?.map((metric) => {
              const IconComponent = iconMap[metric.icon || "users"] || Users;
              return (
                <Card key={metric.id} className="text-center" data-testid={`impact-metric-${metric.id}`}>
                  <CardContent className="pt-6">
                    <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-4xl font-bold text-primary mb-2">{metric.value}</div>
                    <div className="text-muted-foreground font-medium">{metric.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Outcomes That Matter</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Career Advancement</h3>
                <p className="text-muted-foreground">
                  85% of mentees report significant career progress within 12 months of program completion.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Academic Success</h3>
                <p className="text-muted-foreground">
                  40+ mentees have secured graduate positions at top universities globally.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Research Output</h3>
                <p className="text-muted-foreground">
                  15+ joint research publications through our Partner Africa Project.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Geographic Reach</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            UK-based with operations spanning West Africa, East Africa, and partnerships across 4 continents.
          </p>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">Nigeria</div>
                <p className="text-muted-foreground">Primary operations hub</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">United Kingdom</div>
                <p className="text-muted-foreground">Registered headquarters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">25+ Countries</div>
                <p className="text-muted-foreground">Mentor network reach</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Voices of Impact</h2>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-primary-foreground/10 rounded-lg p-6" data-testid={`impact-testimonial-${testimonial.id}`}>
                  <Quote className="h-8 w-8 text-primary-foreground/50 mb-4" />
                  <p className="text-primary-foreground/90 mb-4 italic text-lg">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-primary-foreground/70">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
