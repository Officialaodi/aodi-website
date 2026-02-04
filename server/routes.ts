import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- Programs ---
  app.get(api.programs.list.path, async (req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  app.get(api.programs.get.path, async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const program = await storage.getProgramBySlug(slug);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  });

  // --- Applications ---
  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const application = await storage.createApplication(input);
      res.status(201).json({ success: true, id: application.id });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Content ---
  app.get(api.content.metrics.path, async (req, res) => {
    const metrics = await storage.getMetrics();
    res.json(metrics);
  });

  app.get(api.content.testimonials.path, async (req, res) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });

  // Seed data if empty
  await seedDatabase();

  return httpServer;
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
