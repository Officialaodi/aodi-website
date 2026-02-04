import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, GraduationCap, Users, CheckCircle, BarChart3, Globe, Handshake } from "lucide-react";

const partnershipModels = [
  {
    title: "Cohort Sponsorship",
    description: "Sponsor a cohort of mentees through our Global Mentorship Program.",
    icon: Users,
    features: [
      "Fund 10-50 mentees for one program cycle",
      "Receive detailed impact reports",
      "Brand visibility across communications",
      "Direct engagement with your sponsored cohort",
    ],
  },
  {
    title: "Institutional Partnership",
    description: "Collaborate on research, faculty exchange, and capacity building.",
    icon: GraduationCap,
    features: [
      "Joint research initiatives",
      "Faculty and student exchange programs",
      "Curriculum development support",
      "Collaborative publications",
    ],
  },
  {
    title: "Corporate Partnership",
    description: "Align your CSR goals with high-impact youth development in Africa.",
    icon: Building,
    features: [
      "Employee volunteer programs",
      "Skills-based mentorship",
      "Internship pipeline development",
      "Branded program initiatives",
    ],
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Impact Reporting",
    description: "Transparent, data-driven reports on program outcomes and your contribution.",
  },
  {
    icon: Globe,
    title: "Global Visibility",
    description: "Recognition across our network spanning 25+ countries.",
  },
  {
    icon: Handshake,
    title: "Direct Engagement",
    description: "Opportunities to connect directly with mentees, mentors, and partner institutions.",
  },
];

export default function Partners() {
  return (
    <div>
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Partner With AODI</h1>
            <p className="text-lg text-muted-foreground">
              Join leading institutions and organizations in building a stronger Africa through 
              strategic partnership, shared resources, and collective impact.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Partnership Models</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            We offer flexible partnership structures designed to align with your goals and maximize impact.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {partnershipModels.map((model) => (
              <Card key={model.title} className="flex flex-col" data-testid={`partnership-${model.title.toLowerCase().replace(" ", "-")}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <model.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{model.title}</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {model.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Partners Receive</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How We Work Together</h2>
            <p className="text-muted-foreground text-center mb-12">
              A simple, transparent process from first conversation to lasting impact.
            </p>
            <div className="space-y-8">
              {[
                { step: "1", title: "Initial Conversation", description: "We learn about your goals and explore alignment with AODI's mission." },
                { step: "2", title: "Partnership Design", description: "Together, we define the scope, structure, and metrics for success." },
                { step: "3", title: "Agreement & Launch", description: "Formalize the partnership and kick off collaborative activities." },
                { step: "4", title: "Ongoing Reporting", description: "Regular updates on impact, outcomes, and opportunities for deeper engagement." },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Let's discuss how we can create meaningful impact together. 
            Reach out to start the conversation.
          </p>
          <Link href="/get-involved">
            <Button size="lg" variant="secondary" data-testid="cta-become-partner">
              Start Partnership Inquiry
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
