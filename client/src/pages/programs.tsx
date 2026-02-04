import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { Program } from "@shared/schema";

export default function Programs() {
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  return (
    <div>
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Programs</h1>
            <p className="text-lg text-muted-foreground">
              Structured, impact-driven programs designed to connect African talent 
              with global opportunities and build lasting institutional partnerships.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {programs?.map((program) => (
                <Card key={program.id} className="flex flex-col" data-testid={`program-${program.slug}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{program.category}</Badge>
                      {program.isActive && <Badge variant="outline">Active</Badge>}
                    </div>
                    <CardTitle className="text-2xl">{program.title}</CardTitle>
                    <CardDescription className="text-base">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {program.longDescription && (
                      <p className="text-muted-foreground mb-6">{program.longDescription}</p>
                    )}
                    
                    {program.benefits && program.benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">What You Get</h4>
                        <ul className="space-y-2">
                          {program.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {program.eligibility && program.eligibility.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Eligibility</h4>
                        <ul className="space-y-2">
                          {program.eligibility.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link href="/get-involved">
                      <Button className="w-full" data-testid={`apply-${program.slug}`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Partner on a Program?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We work with universities, NGOs, and corporations to develop customized 
            programs that address specific needs and create lasting impact.
          </p>
          <Link href="/partners">
            <Button size="lg" data-testid="cta-partner-programs">
              Explore Partnership Options
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
