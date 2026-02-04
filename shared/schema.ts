import { pgTable, text, serial, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Programs ---
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  category: text("category").notNull(), // e.g., 'Mentorship', 'Partnership', 'Workshop'
  benefits: text("benefits").array(),
  eligibility: text("eligibility").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Applications / Forms ---
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'mentor', 'mentee', 'partner', 'volunteer'
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  message: text("message").notNull(),
  payload: text("payload"), // JSON string with all form fields
  status: text("status").default("new"), // 'new', 'in_review', 'contacted', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Impact Metrics ---
export const impactMetrics = pgTable("impact_metrics", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(), // e.g., 'Mentees Supported'
  value: text("value").notNull(), // e.g., '500+'
  icon: text("icon"), // lucide icon name
  order: integer("order").default(0),
});

// --- Testimonials / Success Stories ---
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  avatar: text("avatar"),
  type: text("type").default("general"), // 'mentee', 'mentor', 'partner'
});

// --- Trustees ---
export const trustees = pgTable("trustees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Governance Content ---
export const governanceContent = pgTable("governance_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Base Schemas ---
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, status: true });
export const insertMetricSchema = createInsertSchema(impactMetrics).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertTrusteeSchema = createInsertSchema(trustees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGovernanceContentSchema = createInsertSchema(governanceContent).omit({ id: true, updatedAt: true });

// --- Types ---
export type Program = typeof programs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Trustee = typeof trustees.$inferSelect;
export type GovernanceContent = typeof governanceContent.$inferSelect;

export type CreateApplicationRequest = z.infer<typeof insertApplicationSchema>;
export type CreateTrusteeRequest = z.infer<typeof insertTrusteeSchema>;
export type CreateGovernanceContentRequest = z.infer<typeof insertGovernanceContentSchema>;
export type ProgramResponse = Program;
export type ImpactResponse = ImpactMetric[];
export type TestimonialResponse = Testimonial[];

// --- CRM Tables ---

export const applicationNotes = pgTable("application_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  authorName: text("author_name").default("Admin"),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type NewApplicationNote = typeof applicationNotes.$inferInsert;

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  performedBy: text("performed_by").default("Admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  variables: text("variables"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id"),
  templateId: integer("template_id"),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("sent"),
  sentAt: timestamp("sent_at").defaultNow(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  donationType: text("donation_type").default("one-time"),
  programSlug: text("program_slug"),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  status: text("status").default("completed"),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export const insertApplicationNoteSchema = createInsertSchema(applicationNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({ id: true, sentAt: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true, status: true });
