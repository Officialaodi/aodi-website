import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, Briefcase, Heart, GraduationCap, Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  organization: z.string().optional(),
  message: z.string().min(10, "Please provide more details (at least 10 characters)"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const pathways = [
  {
    id: "mentor",
    title: "Become a Mentor",
    description: "Share your expertise with ambitious African youth and professionals.",
    icon: Users,
    benefits: [
      "Make a direct impact on someone's career",
      "Flexible time commitment (2-4 hours/month)",
      "Join a global community of changemakers",
      "Receive training and support",
    ],
  },
  {
    id: "partner",
    title: "Partner With Us",
    description: "Collaborate with AODI to create lasting institutional impact.",
    icon: Briefcase,
    benefits: [
      "Co-design programs for your community",
      "Access to AODI's network and expertise",
      "Joint research and publication opportunities",
      "Visibility and impact reporting",
    ],
  },
  {
    id: "volunteer",
    title: "Volunteer",
    description: "Contribute your skills to support AODI's operations and programs.",
    icon: Heart,
    benefits: [
      "Remote and flexible opportunities",
      "Gain experience in the NGO sector",
      "Work on meaningful projects",
      "Join a passionate team",
    ],
  },
  {
    id: "mentee",
    title: "Apply as Mentee",
    description: "Join our Global Mentorship Program and accelerate your growth.",
    icon: GraduationCap,
    benefits: [
      "One-on-one mentorship",
      "Career and academic guidance",
      "Skills workshops and webinars",
      "Alumni network access",
    ],
  },
];

export default function GetInvolved() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mentor");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      organization: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { type: string }) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll be in touch soon. Thank you for your interest in AODI.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    mutation.mutate({ ...data, type: activeTab });
  };

  const currentPathway = pathways.find((p) => p.id === activeTab);

  return (
    <div>
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get Involved</h1>
            <p className="text-lg text-muted-foreground">
              Whether you're a professional looking to mentor, an institution seeking partnership, 
              or a student ready to grow, there's a path for you at AODI.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSubmitted(false); }} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              {pathways.map((pathway) => (
                <TabsTrigger
                  key={pathway.id}
                  value={pathway.id}
                  className="flex flex-col gap-1 py-3"
                  data-testid={`tab-${pathway.id}`}
                >
                  <pathway.icon className="h-5 w-5" />
                  <span className="text-xs">{pathway.title.split(" ").slice(-1)[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {pathways.map((pathway) => (
              <TabsContent key={pathway.id} value={pathway.id} className="mt-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <pathway.icon className="h-6 w-6 text-primary" />
                        {pathway.title}
                      </CardTitle>
                      <CardDescription>{pathway.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-4">What You'll Get</h4>
                      <ul className="space-y-3">
                        {pathway.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Express Interest</CardTitle>
                      <CardDescription>
                        Fill out the form and we'll get back to you within 48 hours.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {submitted ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                          <p className="text-muted-foreground">
                            Your application has been received. We'll be in touch soon.
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setSubmitted(false)}
                            data-testid="button-submit-another"
                          >
                            Submit Another
                          </Button>
                        </div>
                      ) : (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} data-testid="input-fullname" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="organization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Organization (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Company or institution" {...field} data-testid="input-organization" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tell Us About Yourself</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Share your background, motivation, and how you'd like to contribute..."
                                      className="min-h-[100px]"
                                      {...field}
                                      data-testid="input-message"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit">
                              {mutation.isPending ? (
                                "Submitting..."
                              ) : (
                                <>
                                  Submit Application
                                  <Send className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
