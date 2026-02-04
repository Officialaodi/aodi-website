import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Globe, Shield, Users, Target, Heart, ArrowRight, Building, Award } from "lucide-react";

const leadership = [
  {
    name: "Dr. [Founder Name]",
    role: "Founder & Executive Director",
    bio: "A visionary leader with over 15 years of experience in education and youth development across Africa and the UK.",
  },
  {
    name: "[Board Chair Name]",
    role: "Chair, Board of Trustees",
    bio: "Brings extensive governance experience from leading NGOs and academic institutions.",
  },
  {
    name: "[Program Director Name]",
    role: "Director of Programs",
    bio: "Oversees the design and delivery of all AODI programs, ensuring quality and impact.",
  },
];

const values = [
  {
    icon: Target,
    title: "Impact First",
    description: "Every decision we make is guided by the potential for real, measurable impact.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Transparency and accountability are at the core of our governance.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in the power of partnerships to achieve what no single entity can alone.",
  },
  {
    icon: Heart,
    title: "Empowerment",
    description: "We don't just support—we equip individuals and communities to lead their own growth.",
  },
];

export default function About() {
  return (
    <div>
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About AODI</h1>
            <p className="text-lg text-muted-foreground">
              Africa of Our Dream Initiative is a UK-registered NGO dedicated to empowering 
              African youth and institutions through mentorship, partnerships, and capacity building.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                AODI was founded with a simple but powerful belief: that Africa's future depends on 
                investing in its people—particularly its youth and women—and building bridges between 
                African institutions and the global community.
              </p>
              <p className="text-muted-foreground mb-4">
                What started as a grassroots mentorship initiative has grown into a multi-program 
                organization reaching thousands of mentees across 25+ countries, supported by a 
                global network of mentors and institutional partners.
              </p>
              <p className="text-muted-foreground">
                Today, AODI operates with UK governance standards while maintaining deep roots in 
                African communities, ensuring that our work is both accountable and locally relevant.
              </p>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">UK</div>
                  <div className="text-sm text-muted-foreground">Registered HQ</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">Nigeria</div>
                  <div className="text-sm text-muted-foreground">Operations Hub</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">1,200+</div>
                  <div className="text-sm text-muted-foreground">Mentees</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Years Active</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Vision & Mission</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Our Vision
                </h3>
                <p className="text-muted-foreground">
                  An Africa where every young person has access to the mentorship, resources, 
                  and opportunities needed to realize their full potential and contribute to 
                  sustainable development.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Our Mission
                </h3>
                <p className="text-muted-foreground">
                  To empower African youth and women through education, mentorship, and 
                  institutional partnerships that build capacity and create pathways to 
                  academic and professional success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="text-center" data-testid={`value-${value.title.toLowerCase().replace(" ", "-")}`}>
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Leadership</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            AODI is led by a diverse team of professionals committed to governance excellence 
            and program impact.
          </p>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {leadership.map((person) => (
              <Card key={person.name} data-testid={`leader-${person.role.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-primary mb-2">{person.role}</p>
                  <p className="text-sm text-muted-foreground">{person.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Governance & Policies</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "UK Charity Registered",
                "Transparent Financial Reporting",
                "Safeguarding Policy",
                "Data Protection Compliance",
                "Anti-Discrimination Policy",
                "Environmental Responsibility",
              ].map((policy) => (
                <Card key={policy}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{policy}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether as a mentor, partner, volunteer, or supporter, 
            there's a place for you in the AODI community.
          </p>
          <Link href="/get-involved">
            <Button size="lg" variant="secondary" data-testid="cta-join-mission">
              Get Involved
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
