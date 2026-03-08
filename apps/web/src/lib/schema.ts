import { pgTable, text, serial, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core"

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  message: text("message").notNull(),
  payload: text("payload"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("applications_type_idx").on(table.type),
  statusIdx: index("applications_status_idx").on(table.status),
  createdAtIdx: index("applications_created_at_idx").on(table.createdAt),
}))

export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert

export const trustees = pgTable("trustees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Trustee = typeof trustees.$inferSelect
export type NewTrustee = typeof trustees.$inferInsert

export const governanceContent = pgTable("governance_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type GovernanceContent = typeof governanceContent.$inferSelect
export type NewGovernanceContent = typeof governanceContent.$inferInsert

export const executiveDirector = pgTable("executive_director", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default("Executive Director"),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type ExecutiveDirector = typeof executiveDirector.$inferSelect
export type NewExecutiveDirector = typeof executiveDirector.$inferInsert

export const impactMetrics = pgTable("impact_metrics", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  period: text("period").default("Since inception"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  showOnHomepage: boolean("show_on_homepage").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type ImpactMetric = typeof impactMetrics.$inferSelect
export type NewImpactMetric = typeof impactMetrics.$inferInsert

export const programClusters = [
  "Leadership & Mentorship",
  "Campus & Youth Engagement", 
  "Skills, Gender & Economic Empowerment",
  "STEM Education & Research Capacity",
  "Foundational Education Access"
] as const

export type ProgramCluster = typeof programClusters[number];

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description"),
  primaryCluster: text("primary_cluster"),
  isFeatured: boolean("is_featured").default(false),
  ctaText: text("cta_text").default("Learn More"),
  accentColor: text("accent_color").default("bg-aodi-teal"),
  borderColor: text("border_color").default("border-aodi-teal"),
  steps: text("steps"),
  benefits: text("benefits"),
  eligibility: text("eligibility"),
  faqs: text("faqs"),
  ctaLink: text("cta_link"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("programs_is_active_idx").on(table.isActive),
  displayOrderIdx: index("programs_display_order_idx").on(table.displayOrder),
}))

export type Program = typeof programs.$inferSelect
export type NewProgram = typeof programs.$inferInsert

export const eventModes = ["Virtual", "In-person", "Hybrid"] as const
export const eventStatuses = ["Upcoming", "Past"] as const

export type EventMode = typeof eventModes[number]
export type EventStatus = typeof eventStatuses[number]

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subtitle: text("subtitle"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  mode: text("mode").default("Virtual"),
  summary: text("summary").notNull(),
  body: text("body"),
  registrationLabel: text("registration_label").default("Register"),
  registrationUrl: text("registration_url"),
  status: text("status").default("Upcoming"),
  isFeatured: boolean("is_featured").default(false),
  heroImage: text("hero_image"),
  gallery: text("gallery"),
  pageTemplate: text("page_template").default("standard"),
  overviewTitle: text("overview_title").default("Overview"),
  objectives: jsonb("objectives"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  eligibilityTitle: text("eligibility_title").default("Who Should Apply"),
  eligibilityIntro: text("eligibility_intro"),
  deliveryTitle: text("delivery_title").default("Delivery Mode"),
  deliveryDescription: text("delivery_description"),
  duration: text("duration"),
  certificate: text("certificate"),
  ctaTitle: text("cta_title"),
  ctaDescription: text("cta_description"),
  ctaButtonText: text("cta_button_text").default("Submit Your Application"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("events_is_active_idx").on(table.isActive),
  startDateIdx: index("events_start_date_idx").on(table.startDate),
  statusIdx: index("events_status_idx").on(table.status),
}))

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  type: text("type").notNull(),
  url: text("url"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Partner = typeof partners.$inferSelect
export type NewPartner = typeof partners.$inferInsert

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  country: text("country").notNull(),
  quote: text("quote").notNull(),
  programSlug: text("program_slug"),
  photoUrl: text("photo_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  featuredImage: text("featured_image"),
  tags: text("tags"),
  publishDate: timestamp("publish_date").defaultNow(),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Story = typeof stories.$inferSelect
export type NewStory = typeof stories.$inferInsert

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url"),
  externalUrl: text("external_url"),
  fileType: text("file_type"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Resource = typeof resources.$inferSelect
export type NewResource = typeof resources.$inferInsert

// CRM Tables

export const applicationNotes = pgTable("application_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  authorName: text("author_name").default("Admin"),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type ApplicationNote = typeof applicationNotes.$inferSelect
export type NewApplicationNote = typeof applicationNotes.$inferInsert

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  action: text("action").notNull(),
  details: text("details"),
  performedBy: text("performed_by").default("Admin"),
  userId: integer("user_id"),
  userEmail: text("user_email"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert

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
})

export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert

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
})

export type EmailLog = typeof emailLogs.$inferSelect
export type NewEmailLog = typeof emailLogs.$inferInsert

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
})

export type Donation = typeof donations.$inferSelect
export type NewDonation = typeof donations.$inferInsert

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
})

export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert

export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  provider: text("provider").notNull(),
  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  useTls: boolean("use_tls").default(true),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type EmailAccount = typeof emailAccounts.$inferSelect
export type NewEmailAccount = typeof emailAccounts.$inferInsert

export const syncedEmails = pgTable("synced_emails", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull(),
  accountId: integer("account_id").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name"),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body"),
  htmlBody: text("html_body"),
  receivedAt: timestamp("received_at").notNull(),
  isRead: boolean("is_read").default(false),
  hasAttachments: boolean("has_attachments").default(false),
  linkedEntityType: text("linked_entity_type"),
  linkedEntityId: integer("linked_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type SyncedEmail = typeof syncedEmails.$inferSelect
export type NewSyncedEmail = typeof syncedEmails.$inferInsert

// RBAC - Roles and Permissions
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  permissionKey: text("permission_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  roleId: integer("role_id").notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type AdminUser = typeof adminUsers.$inferSelect
export type NewAdminUser = typeof adminUsers.$inferInsert

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert

export const analyticsSessions = pgTable("analytics_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  visitorId: text("visitor_id").notNull(),
  userAgent: text("user_agent"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  deviceType: text("device_type"),
  screenWidth: integer("screen_width"),
  screenHeight: integer("screen_height"),
  language: text("language"),
  timezone: text("timezone"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  country: text("country"),
  continent: text("continent"),
  city: text("city"),
  entryPage: text("entry_page"),
  exitPage: text("exit_page"),
  pageViews: integer("page_views").default(0),
  duration: integer("duration").default(0),
  isBounce: boolean("is_bounce").default(true),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
}, (table) => ({
  sessionIdIdx: index("analytics_sessions_session_id_idx").on(table.sessionId),
  startedAtIdx: index("analytics_sessions_started_at_idx").on(table.startedAt),
  countryIdx: index("analytics_sessions_country_idx").on(table.country),
}))

export type AnalyticsSession = typeof analyticsSessions.$inferSelect
export type NewAnalyticsSession = typeof analyticsSessions.$inferInsert

export const analyticsPageViews = pgTable("analytics_page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  path: text("path").notNull(),
  title: text("title"),
  referrer: text("referrer"),
  queryParams: text("query_params"),
  timeOnPage: integer("time_on_page").default(0),
  scrollDepth: integer("scroll_depth").default(0),
  exitIntent: boolean("exit_intent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("analytics_page_views_session_id_idx").on(table.sessionId),
  pathIdx: index("analytics_page_views_path_idx").on(table.path),
  createdAtIdx: index("analytics_page_views_created_at_idx").on(table.createdAt),
}))

export type AnalyticsPageView = typeof analyticsPageViews.$inferSelect
export type NewAnalyticsPageView = typeof analyticsPageViews.$inferInsert

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  eventType: text("event_type").notNull(),
  eventCategory: text("event_category"),
  eventAction: text("event_action"),
  eventLabel: text("event_label"),
  eventValue: text("event_value"),
  path: text("path"),
  elementId: text("element_id"),
  elementClass: text("element_class"),
  elementText: text("element_text"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("analytics_events_session_id_idx").on(table.sessionId),
  eventTypeIdx: index("analytics_events_event_type_idx").on(table.eventType),
  createdAtIdx: index("analytics_events_created_at_idx").on(table.createdAt),
}))

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  label: text("label"),
  description: text("description"),
  fieldType: text("field_type").default("text"),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type SiteSetting = typeof siteSettings.$inferSelect
export type NewSiteSetting = typeof siteSettings.$inferInsert

export const integrationSettings = pgTable("integration_settings", {
  id: serial("id").primaryKey(),
  integrationKey: text("integration_key").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  secretsRequired: text("secrets_required"),
  secretsConfigured: boolean("secrets_configured").default(false),
  configValue: text("config_value"),
  category: text("category").default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type IntegrationSetting = typeof integrationSettings.$inferSelect
export type NewIntegrationSetting = typeof integrationSettings.$inferInsert

export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt"),
  caption: text("caption"),
  folder: text("folder").default("uploads"),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type MediaItem = typeof mediaLibrary.$inferSelect
export type NewMediaItem = typeof mediaLibrary.$inferInsert

export const analyticsConversions = pgTable("analytics_conversions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  visitorId: text("visitor_id"),
  conversionType: text("conversion_type").notNull(),
  conversionName: text("conversion_name").notNull(),
  conversionReference: text("conversion_reference").unique(),
  value: integer("value").default(0),
  currency: text("currency").default("USD"),
  metadata: text("metadata"),
  path: text("path"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  createdAt: timestamp("created_at").defaultNow(),
})

export type AnalyticsConversion = typeof analyticsConversions.$inferSelect
export type NewAnalyticsConversion = typeof analyticsConversions.$inferInsert

// Forms Management - Enable/Disable and Dynamic Forms
export const formFieldTypes = [
  "text",
  "email", 
  "phone",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "number",
  "date",
  "url",
  "country"
] as const

export type FormFieldType = typeof formFieldTypes[number]

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(true),
  closedMessage: text("closed_message").default("This form is currently closed for submissions."),
  successMessage: text("success_message").default("Thank you! Your submission has been received."),
  submitButtonText: text("submit_button_text").default("Submit"),
  isBuiltIn: boolean("is_built_in").default(false),
  requiresHcaptcha: boolean("requires_hcaptcha").default(false),
  notifyEmail: text("notify_email"),
  eventId: integer("event_id"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert

export const formFields = pgTable("form_fields", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  fieldKey: text("field_key").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull(),
  placeholder: text("placeholder"),
  defaultValue: text("default_value"),
  helpText: text("help_text"),
  isRequired: boolean("is_required").default(false),
  options: text("options"),
  validation: text("validation"),
  width: text("width").default("full"),
  section: text("section"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type FormField = typeof formFields.$inferSelect
export type NewFormField = typeof formFields.$inferInsert
