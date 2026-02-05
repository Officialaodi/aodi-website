import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { permissions, roles, rolePermissions, forms, formFields } from "@/lib/schema"
import { eq } from "drizzle-orm"

const DEFAULT_PERMISSIONS = [
  { key: "applications.view", name: "View Applications", category: "Applications", description: "View all applications" },
  { key: "applications.manage", name: "Manage Applications", category: "Applications", description: "Update application status and details" },
  { key: "applications.delete", name: "Delete Applications", category: "Applications", description: "Delete applications" },
  { key: "crm.view", name: "View CRM", category: "CRM", description: "Access CRM contacts and data" },
  { key: "crm.manage", name: "Manage CRM", category: "CRM", description: "Edit contacts and send emails" },
  { key: "content.view", name: "View Content", category: "Content", description: "View all website content" },
  { key: "content.manage", name: "Manage Content", category: "Content", description: "Edit website content" },
  { key: "governance.view", name: "View Governance", category: "Governance", description: "View governance information" },
  { key: "governance.manage", name: "Manage Governance", category: "Governance", description: "Edit governance content" },
  { key: "impact.view", name: "View Impact", category: "Impact", description: "View impact metrics" },
  { key: "impact.manage", name: "Manage Impact", category: "Impact", description: "Edit impact metrics" },
  { key: "users.view", name: "View Users", category: "User Management", description: "View admin users" },
  { key: "users.manage", name: "Manage Users", category: "User Management", description: "Create and edit admin users" },
  { key: "users.delete", name: "Delete Users", category: "User Management", description: "Delete admin users" },
  { key: "roles.view", name: "View Roles", category: "User Management", description: "View roles and permissions" },
  { key: "roles.manage", name: "Manage Roles", category: "User Management", description: "Create and edit roles" },
  { key: "analytics.view", name: "View Analytics", category: "Analytics", description: "View website analytics" },
  { key: "settings.view", name: "View Settings", category: "Settings", description: "View system settings" },
  { key: "settings.manage", name: "Manage Settings", category: "Settings", description: "Edit system settings" },
  { key: "forms.view", name: "View Forms", category: "Forms", description: "View form configurations" },
  { key: "forms.manage", name: "Manage Forms", category: "Forms", description: "Create and edit forms" },
  { key: "events.view", name: "View Events", category: "Events", description: "View events" },
  { key: "events.manage", name: "Manage Events", category: "Events", description: "Create and edit events" },
]

const BUILT_IN_FORMS = [
  {
    slug: "mentor",
    name: "Become a Mentor",
    description: "Application form for mentors who want to guide and support young African leaders",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for your interest in becoming a mentor! We will review your application and get back to you within 5 business days.",
  },
  {
    slug: "mentee",
    name: "Apply as Mentee",
    description: "Application form for young Africans seeking mentorship and guidance",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for applying to our mentorship program! We will review your application and match you with a suitable mentor.",
  },
  {
    slug: "volunteer",
    name: "Volunteer Application",
    description: "Join AODI as a volunteer and contribute to our mission",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for volunteering with AODI! We will contact you about upcoming opportunities.",
  },
  {
    slug: "partner",
    name: "Partnership Inquiry",
    description: "For organizations interested in partnering with AODI",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for your partnership interest! Our team will review and contact you shortly.",
  },
  {
    slug: "contact",
    name: "Contact Us",
    description: "General contact form for inquiries",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for contacting us! We will respond to your inquiry within 2 business days.",
  },
  {
    slug: "empowerher",
    name: "EmpowerHer Application",
    description: "Application for the EmpowerHer women leadership program",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for applying to EmpowerHer! We will review your application and notify you of the outcome.",
  },
  {
    slug: "campus-ambassador",
    name: "Campus Ambassador Application",
    description: "Become an AODI Campus Ambassador at your university",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for applying to be a Campus Ambassador! We will review your application shortly.",
  },
  {
    slug: "stem-workshops",
    name: "STEM Workshops Registration",
    description: "Register for AODI STEM education workshops",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for registering! You will receive workshop details via email.",
  },
  {
    slug: "partner-africa",
    name: "Partner Africa Application",
    description: "Application for the Partner Africa initiative",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for your Partner Africa application! We will be in touch soon.",
  },
  {
    slug: "chembridge-2026",
    name: "ChemBridge 2026 Registration",
    description: "Registration for the ChemBridge Inclusion Accelerator 2026 event",
    isBuiltIn: true,
    isEnabled: true,
    successMessage: "Thank you for registering for ChemBridge 2026! You will receive confirmation and event details via email.",
  },
]

const COMMON_FORM_FIELDS = {
  mentor: [
    { name: "fullName", label: "Full Name", type: "text", required: true, displayOrder: 1, placeholder: "Enter your full name" },
    { name: "email", label: "Email Address", type: "email", required: true, displayOrder: 2, placeholder: "Enter your email" },
    { name: "phone", label: "Phone Number", type: "phone", required: true, displayOrder: 3, placeholder: "+44 7XXX XXXXXX" },
    { name: "country", label: "Country", type: "country", required: true, displayOrder: 4 },
    { name: "occupation", label: "Current Occupation", type: "text", required: true, displayOrder: 5, placeholder: "e.g., Software Engineer" },
    { name: "organization", label: "Organization/Company", type: "text", required: false, displayOrder: 6, placeholder: "Your company or organization" },
    { name: "expertise", label: "Areas of Expertise", type: "textarea", required: true, displayOrder: 7, placeholder: "Describe your areas of expertise" },
    { name: "motivation", label: "Why do you want to become a mentor?", type: "textarea", required: true, displayOrder: 8, placeholder: "Share your motivation" },
  ],
  mentee: [
    { name: "fullName", label: "Full Name", type: "text", required: true, displayOrder: 1, placeholder: "Enter your full name" },
    { name: "email", label: "Email Address", type: "email", required: true, displayOrder: 2, placeholder: "Enter your email" },
    { name: "phone", label: "Phone Number", type: "phone", required: true, displayOrder: 3, placeholder: "+234 XXX XXX XXXX" },
    { name: "country", label: "Country", type: "country", required: true, displayOrder: 4 },
    { name: "age", label: "Age", type: "number", required: true, displayOrder: 5 },
    { name: "education", label: "Education Level", type: "select", required: true, displayOrder: 6, options: JSON.stringify(["Secondary School", "Undergraduate", "Graduate", "Postgraduate", "Other"]) },
    { name: "goals", label: "What are your career/life goals?", type: "textarea", required: true, displayOrder: 7, placeholder: "Describe your goals" },
    { name: "expectations", label: "What do you expect from a mentor?", type: "textarea", required: true, displayOrder: 8, placeholder: "Share your expectations" },
  ],
  volunteer: [
    { name: "fullName", label: "Full Name", type: "text", required: true, displayOrder: 1, placeholder: "Enter your full name" },
    { name: "email", label: "Email Address", type: "email", required: true, displayOrder: 2, placeholder: "Enter your email" },
    { name: "phone", label: "Phone Number", type: "phone", required: true, displayOrder: 3 },
    { name: "country", label: "Country", type: "country", required: true, displayOrder: 4 },
    { name: "availability", label: "Availability (hours per week)", type: "select", required: true, displayOrder: 5, options: JSON.stringify(["1-5 hours", "5-10 hours", "10-20 hours", "20+ hours"]) },
    { name: "skills", label: "Skills and Experience", type: "textarea", required: true, displayOrder: 6, placeholder: "Describe your skills" },
    { name: "interests", label: "Areas of Interest", type: "textarea", required: true, displayOrder: 7, placeholder: "What areas interest you?" },
  ],
  partner: [
    { name: "fullName", label: "Contact Name", type: "text", required: true, displayOrder: 1, placeholder: "Your full name" },
    { name: "email", label: "Email Address", type: "email", required: true, displayOrder: 2, placeholder: "Enter your email" },
    { name: "organization", label: "Organization Name", type: "text", required: true, displayOrder: 3, placeholder: "Your organization" },
    { name: "website", label: "Website", type: "url", required: false, displayOrder: 4, placeholder: "https://example.com" },
    { name: "partnershipType", label: "Type of Partnership", type: "select", required: true, displayOrder: 5, options: JSON.stringify(["Funding/Sponsorship", "Program Collaboration", "In-kind Support", "Strategic Alliance", "Other"]) },
    { name: "message", label: "Partnership Proposal", type: "textarea", required: true, displayOrder: 6, placeholder: "Describe your partnership proposal" },
  ],
  contact: [
    { name: "fullName", label: "Full Name", type: "text", required: true, displayOrder: 1, placeholder: "Enter your full name" },
    { name: "email", label: "Email Address", type: "email", required: true, displayOrder: 2, placeholder: "Enter your email" },
    { name: "subject", label: "Subject", type: "text", required: true, displayOrder: 3, placeholder: "What is this about?" },
    { name: "message", label: "Message", type: "textarea", required: true, displayOrder: 4, placeholder: "Your message" },
  ],
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results: Record<string, number> = {}

    const existingPerms = await db.select({ key: permissions.key }).from(permissions)
    const existingPermKeys = new Set(existingPerms.map(p => p.key))
    const newPerms = DEFAULT_PERMISSIONS.filter(p => !existingPermKeys.has(p.key))
    if (newPerms.length > 0) {
      await db.insert(permissions).values(newPerms)
    }
    results.permissions = newPerms.length

    let [superAdminRole] = await db.select().from(roles).where(eq(roles.name, "Super Admin"))
    if (!superAdminRole) {
      const [newRole] = await db.insert(roles).values({
        name: "Super Admin",
        description: "Full system access with all permissions",
        isSystemRole: true,
      }).returning()
      superAdminRole = newRole
      results.rolesCreated = 1
    } else {
      results.rolesCreated = 0
    }

    const allPerms = await db.select({ key: permissions.key }).from(permissions)
    const existingRolePerms = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, superAdminRole.id))
    const existingRolePermKeys = new Set(existingRolePerms.map(p => p.permissionKey))
    const newRolePerms = allPerms
      .filter(p => !existingRolePermKeys.has(p.key))
      .map(p => ({ roleId: superAdminRole.id, permissionKey: p.key }))
    if (newRolePerms.length > 0) {
      await db.insert(rolePermissions).values(newRolePerms)
    }
    results.rolePermissions = newRolePerms.length

    const existingForms = await db.select({ slug: forms.slug }).from(forms)
    const existingSlugs = new Set(existingForms.map(f => f.slug))
    let formsCreated = 0

    for (const form of BUILT_IN_FORMS) {
      if (!existingSlugs.has(form.slug)) {
        const [newForm] = await db.insert(forms).values(form).returning()
        formsCreated++

        const fields = COMMON_FORM_FIELDS[form.slug as keyof typeof COMMON_FORM_FIELDS]
        if (fields && fields.length > 0) {
          await db.insert(formFields).values(
            fields.map(field => ({
              ...field,
              formId: newForm.id,
            }))
          )
        }
      }
    }
    results.formsCreated = formsCreated

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [permCount] = await db.execute<{ count: number }>`SELECT COUNT(*) as count FROM permissions`
    const [roleCount] = await db.execute<{ count: number }>`SELECT COUNT(*) as count FROM roles`
    const [formCount] = await db.execute<{ count: number }>`SELECT COUNT(*) as count FROM forms`
    const [adminCount] = await db.execute<{ count: number }>`SELECT COUNT(*) as count FROM admin_users`

    return NextResponse.json({
      status: "ok",
      counts: {
        permissions: permCount?.count || 0,
        roles: roleCount?.count || 0,
        forms: formCount?.count || 0,
        adminUsers: adminCount?.count || 0,
      },
      needsSeeding: (permCount?.count || 0) === 0 || (formCount?.count || 0) === 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check status", details: String(error) }, { status: 500 })
  }
}
