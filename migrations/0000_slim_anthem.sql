CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"performed_by" text DEFAULT 'Admin',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "application_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"author_name" text DEFAULT 'Admin',
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text,
	"message" text NOT NULL,
	"payload" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new',
	"payload" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_name" text NOT NULL,
	"donor_email" text NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"donation_type" text DEFAULT 'one-time',
	"program_slug" text,
	"message" text,
	"is_anonymous" boolean DEFAULT false,
	"status" text DEFAULT 'completed',
	"payload" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"template_id" integer,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'sent',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"category" text NOT NULL,
	"variables" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "governance_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "governance_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "impact_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"icon" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"category" text NOT NULL,
	"benefits" text[],
	"eligibility" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"avatar" text,
	"type" text DEFAULT 'general'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trustees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text NOT NULL,
	"photo_url" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
