import { db } from "./db";
import { 
  programs, applications, impactMetrics, testimonials,
  type Program, type Application, type ImpactMetric, type Testimonial,
  type CreateApplicationRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Programs
  getPrograms(): Promise<Program[]>;
  getProgramBySlug(slug: string): Promise<Program | undefined>;
  
  // Applications
  createApplication(app: CreateApplicationRequest): Promise<Application>;
  
  // Content
  getMetrics(): Promise<ImpactMetric[]>;
  getTestimonials(): Promise<Testimonial[]>;
}

export class DatabaseStorage implements IStorage {
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs).where(eq(programs.isActive, true));
  }

  async getProgramBySlug(slug: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.slug, slug));
    return program;
  }

  async createApplication(app: CreateApplicationRequest): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async getMetrics(): Promise<ImpactMetric[]> {
    return await db.select().from(impactMetrics).orderBy(impactMetrics.order);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }
}

export const storage = new DatabaseStorage();
