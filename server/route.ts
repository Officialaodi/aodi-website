import type { Hono } from "hono";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(app: Hono) {
  // --- Programs ---
  app.get(api.programs.list.path, async (c) => {
    const programs = await storage.getPrograms();
    return c.json(programs);
  });

  app.get(api.programs.get.path, async (c) => {
    const slug = c.req.param("slug");
    const program = await storage.getProgramBySlug(slug!);
    if (!program) return c.json({ message: "Program not found" }, 404);
    return c.json(program);
  });

  // --- Applications ---
  app.post(api.applications.create.path, async (c) => {
    try {
      const body = await c.req.json();
      const input = api.applications.create.input.parse(body);
      const application = await storage.createApplication(input);
      return c.json({ success: true, id: application.id }, 201);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({
          message: err.errors[0].message,
        }, 400);
      }
      return c.json({ message: "Internal server error" }, 500);
    }
  });

  // --- Content ---
  app.get(api.content.metrics.path, async (c) => {
    const metrics = await storage.getMetrics();
    return c.json(metrics);
  });

  app.get(api.content.testimonials.path, async (c) => {
    const testimonials = await storage.getTestimonials();
    return c.json(testimonials);
  });

  // Seed data if empty
  await seedDatabase();
}

async function seedDatabase() {
  const existingPrograms = await storage.getPrograms();
  if (existingPrograms.length === 0) {
    // Using db directly for seed
    const { db } = await import("./db");
    const { programs, impactMetrics, testimonials } = await import("@shared/schema");

    await db.insert(programs).values([
      {
        title: "Global Mentorship Program",
        slug: "global-mentorship",
        description: "Connecting African youth with global professionals for career and academic growth.",
        longDescription: "Our flagship program matches ambitious students and early-career professionals in Africa with experienced mentors worldwide. We focus on STEM, social sciences, and professional development.",
        category: "Mentorship",
        benefits: ["One-on-one guidance", "Network access", "Skills workshops"],
        eligibility: ["Current students", "Early career professionals", "African residents"],
        isActive: true
      },
      {
        title: "Partner Africa Project",
        slug: "partner-africa",
        description: "Facilitating institutional research and academic exchanges.",
        longDescription: "PAP builds bridges between African universities and global institutions, fostering research collaboration, faculty exchange, and resource sharing.",
        category: "Partnership",
        benefits: ["Joint research opportunities", "Faculty exchange", "Infrastructure support"],
        eligibility: ["Universities", "Research centers", "NGOs"],
        isActive: true
      }
    ]);

    await db.insert(impactMetrics).values([
      { label: "Mentees Supported", value: "1,200+", icon: "users", order: 1 },
      { label: "Active Mentors", value: "450+", icon: "graduation-cap", order: 2 },
      { label: "Countries Reached", value: "25+", icon: "globe", order: 3 },
      { label: "Institutional Partners", value: "40+", icon: "building", order: 4 }
    ]);

    await db.insert(testimonials).values([
      {
        name: "Chinelo Okoro",
        role: "Mentee, Nigeria",
        content: "The AODI Global Mentorship program completely changed my career trajectory. I am now pursuing my PhD in the UK thanks to my mentor.",
        type: "mentee"
      },
      {
        name: "Dr. James Wilson",
        role: "Professor, University of London",
        content: "Partnering with AODI has allowed our faculty to engage in meaningful research that has a direct impact on African communities.",
        type: "partner"
      }
    ]);
  }
}