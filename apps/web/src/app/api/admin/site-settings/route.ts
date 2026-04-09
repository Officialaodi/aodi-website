import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { siteSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auditLog } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

function getSessionSecret() {
  return process.env.SESSION_SECRET
}

const DEFAULT_SETTINGS = [
  { key: "hero_title", value: "Building Africa's Next Generation of Leaders", category: "homepage", label: "Hero Title", fieldType: "text", description: "Main headline on homepage" },
  { key: "hero_subtitle", value: "Africa of Our Dream Education Initiative (AODI) is a globally governed leadership and talent development institution, supporting high-potential students and early-career professionals across Africa through structured programs, mentorship, and institutional partnerships.", category: "homepage", label: "Hero Subtitle", fieldType: "textarea", description: "Subtitle under the main headline" },
  { key: "hero_image", value: "", category: "homepage", label: "Hero Background Image", fieldType: "image", description: "Background image for the hero section" },
  { key: "hero_cta_text", value: "Partner with AODI", category: "homepage", label: "Hero CTA Button Text", fieldType: "text", description: "Primary call-to-action button text" },
  { key: "hero_cta_link", value: "/get-involved/partner", category: "homepage", label: "Hero CTA Link", fieldType: "text", description: "Link for the primary CTA button" },
  { key: "hero_cta2_text", value: "Join as a Mentor", category: "homepage", label: "Hero Secondary CTA Text", fieldType: "text", description: "Secondary call-to-action button text" },
  { key: "hero_cta2_link", value: "/get-involved/mentor", category: "homepage", label: "Hero Secondary CTA Link", fieldType: "text", description: "Link for secondary CTA button" },
  { key: "trust_strip_items", value: '["UK-governed","Africa-focused","Outcome-driven programs","Institutional partnerships"]', category: "homepage", label: "Trust Strip Items", fieldType: "json", description: "Trust strip items shown below hero (JSON array of strings)" },
  { key: "problem_title", value: "Africa's Talent Is Abundant. Opportunity Is Not.", category: "homepage", label: "Problem Statement Title", fieldType: "text", description: "Title for the problem statement section" },
  { key: "problem_body", value: "Across Africa, millions of talented young people demonstrate exceptional potential — yet lack access to mentorship, leadership development, global networks, and structured pathways into academia, entrepreneurship, and high-impact careers.\n\nThe challenge is not ambition. It is access, structure, and exposure.\n\nAODI exists to close this gap — systematically and at scale.", category: "homepage", label: "Problem Statement Body", fieldType: "textarea", description: "Body text for the problem statement section" },
  { key: "pillars_title", value: "A Leadership & Talent Development Model Built for Impact", category: "homepage", label: "Pillars Section Title", fieldType: "text", description: "Title for the pillars section" },
  { key: "pillars_items", value: '[{"name":"Leadership & Talent Development","description":"We design structured programs that build leadership capacity, career clarity, and professional confidence at critical transition points — from secondary school through university and into early careers."},{"name":"Global Mentorship & Capability Building","description":"Through carefully matched mentors, workshops, and targeted initiatives, participants gain guidance, skills, and perspective from experienced leaders across academia, industry, and the diaspora."},{"name":"Institutional Partnerships & Exposure","description":"We collaborate with schools, universities, NGOs, and foundations to expand access, deliver high-quality programs, and connect participants to global opportunities."}]', category: "homepage", label: "Pillars Items", fieldType: "json", description: "Three pillars with name and description (JSON array)" },
  { key: "featured_title", value: "Global Mentorship & Leadership Program", category: "homepage", label: "Featured Program Title", fieldType: "text", description: "Title of the featured program on homepage" },
  { key: "featured_bullets", value: '["Structured mentorship and guidance","Leadership and professional development support","Exposure to global academic and professional pathways","A values-driven community focused on long-term impact"]', category: "homepage", label: "Featured Program Bullets", fieldType: "json", description: "Featured program bullet points (JSON array)" },
  { key: "featured_cta_text", value: "Explore the Program", category: "homepage", label: "Featured Program CTA Text", fieldType: "text", description: "CTA text for featured program" },
  { key: "featured_cta_link", value: "/programs/global-mentorship-leadership", category: "homepage", label: "Featured Program CTA Link", fieldType: "text", description: "CTA link for featured program" },
  { key: "scope_title", value: "Supporting Talent Across the Education-to-Leadership Journey", category: "homepage", label: "Initiative Scope Title", fieldType: "text", description: "Title for initiative scope section" },
  { key: "scope_bullets", value: '["Campus-based engagement and ambassador programs","Women-focused leadership and empowerment initiatives","Youth and secondary-school access programs","Conferences, workshops, and entrepreneurial initiatives"]', category: "homepage", label: "Initiative Scope Bullets", fieldType: "json", description: "Initiative scope bullet points (JSON array)" },
  { key: "scope_closing", value: "Each initiative serves a single purpose: to identify talent early, develop leadership capacity, and unlock access to opportunity.", category: "homepage", label: "Initiative Scope Closing Line", fieldType: "text", description: "Closing line for initiative scope section" },
  { key: "governance_title", value: "Governance & Accountability", category: "homepage", label: "Governance Section Title", fieldType: "text", description: "Title for governance section on homepage" },
  { key: "governance_body", value: "AODI is governed by an independent Board of Trustees, registered in the United Kingdom, and committed to transparency, ethical practice, and outcome tracking.", category: "homepage", label: "Governance Section Body", fieldType: "textarea", description: "Body text for governance section" },
  { key: "governance_cta_text", value: "View Governance", category: "homepage", label: "Governance CTA Text", fieldType: "text", description: "CTA text for governance section" },
  { key: "governance_cta_link", value: "/governance", category: "homepage", label: "Governance CTA Link", fieldType: "text", description: "CTA link for governance section" },
  { key: "cta_cards", value: '[{"title":"Partner with AODI","description":"Support scalable leadership development across Africa.","href":"/get-involved/partner","buttonText":"Explore Partnership"},{"title":"Join as a Mentor","description":"Contribute your experience and guide the next generation.","href":"/get-involved/mentor","buttonText":"Mentor Application"},{"title":"Apply as a Mentee","description":"Access structured programs, mentorship, and global exposure.","href":"/get-involved/mentee","buttonText":"Mentee Application"}]', category: "homepage", label: "CTA Cards", fieldType: "json", description: "Call-to-action cards at bottom of homepage (JSON array)" },
  { key: "closing_text", value: "Africa's brightest minds deserve more than potential. They deserve access, structure, and support. AODI exists to make that possible.", category: "homepage", label: "Closing Statement", fieldType: "textarea", description: "Final closing statement on homepage" },
  { key: "about_title", value: "About AODI", category: "homepage", label: "About Section Title", fieldType: "text", description: "Title for the about section" },
  { key: "about_content", value: "The Africa of Our Dream Education Initiative (AODI) is dedicated to transforming lives through quality education and mentorship programs across Africa.", category: "homepage", label: "About Content", fieldType: "richtext", description: "About section content" },
  { key: "about_image", value: "", category: "homepage", label: "About Section Image", fieldType: "image", description: "Image for the about section" },
  { key: "programs_hero_image", value: "", category: "programs", label: "Hero Background Image", fieldType: "image", description: "Background image for the programs page hero section" },
  { key: "events_hero_image", value: "", category: "events", label: "Hero Background Image", fieldType: "image", description: "Background image for the events page hero section" },
  { key: "resources_hero_image", value: "", category: "resources", label: "Hero Background Image", fieldType: "image", description: "Background image for the resources page hero section" },
  { key: "footer_about", value: "AODI is a UK-registered NGO dedicated to educational empowerment and leadership development across Africa.", category: "footer", label: "Footer About Text", fieldType: "textarea", description: "Short about text in footer" },
  { key: "footer_address", value: "London, United Kingdom", category: "footer", label: "Address", fieldType: "text", description: "Organization address" },
  { key: "footer_email", value: "aodi.info@africaofourdreaminitiative.org", category: "footer", label: "Email", fieldType: "text", description: "Contact email" },
  { key: "footer_phone", value: "", category: "footer", label: "Phone", fieldType: "text", description: "Contact phone number" },
  { key: "social_facebook", value: "", category: "social", label: "Facebook URL", fieldType: "text", description: "Facebook page URL" },
  { key: "social_twitter", value: "", category: "social", label: "X (Twitter) URL", fieldType: "text", description: "X/Twitter profile URL" },
  { key: "social_linkedin", value: "", category: "social", label: "LinkedIn URL", fieldType: "text", description: "LinkedIn page URL" },
  { key: "social_instagram", value: "", category: "social", label: "Instagram URL", fieldType: "text", description: "Instagram profile URL" },
  { key: "social_youtube", value: "", category: "social", label: "YouTube URL", fieldType: "text", description: "YouTube channel URL" },
  { key: "about_hero_headline", value: "About AODI", category: "about", label: "Hero Headline", fieldType: "text", description: "Headline for the about page hero section" },
  { key: "about_hero_subheadline", value: "Africa of Our Dream Education Initiative (AODI) is a globally governed leadership and talent development institution supporting high-potential students and early-career professionals across Africa.", category: "about", label: "Hero Subheadline", fieldType: "textarea", description: "Subheadline for the about page hero section" },
  { key: "about_mission", value: "Build leadership capacity and unlock access to opportunity for high-potential students and early-career professionals across Africa.", category: "about", label: "Mission Statement", fieldType: "textarea", description: "Mission statement text" },
  { key: "about_vision", value: "An Africa where every talented young person — regardless of background — has access to the mentorship, development, and institutional support needed to lead.", category: "about", label: "Vision Statement", fieldType: "textarea", description: "Vision statement text" },
  { key: "about_differentiators", value: '["Structured approach to leadership development","Outcome-driven programs with clear metrics","Strong governance and accountability","Institutional partnerships for scale"]', category: "about", label: "Differentiators", fieldType: "json", description: "Key differentiators list (JSON array of strings)" },
  { key: "about_approach", value: '[{"title":"Identification & Access","description":"We identify high-potential talent and remove barriers to opportunity."},{"title":"Development & Capability","description":"We build leadership capacity through structured programs and mentorship."},{"title":"Exposure & Partnerships","description":"We connect participants to global networks, opportunities, and institutional partners."}]', category: "about", label: "Our Approach", fieldType: "json", description: "Approach steps with title and description (JSON array)" },
  { key: "getinvolved_hero_image", value: "", category: "getinvolved", label: "Hero Background Image", fieldType: "image", description: "Background image for the get involved page hero section" },
  { key: "getinvolved_hero_headline", value: "Get Involved", category: "getinvolved", label: "Hero Headline", fieldType: "text", description: "Headline for the get involved page" },
  { key: "getinvolved_hero_subheadline", value: "Join us in building Africa's next generation of leaders — as a partner, mentor, mentee, or volunteer.", category: "getinvolved", label: "Hero Subheadline", fieldType: "textarea", description: "Subheadline for the get involved page" },
  { key: "getinvolved_pathways", value: '[{"title":"Partners & Donors","description":"Collaborate with AODI to support scalable, high-impact leadership and talent development initiatives.","href":"/forms/partner","buttonText":"Partner with AODI","icon":"Users"},{"title":"Mentors","description":"Contribute your experience and perspective to guide the next generation of African leaders.","href":"/forms/mentor","buttonText":"Join as a Mentor","icon":"Heart"},{"title":"Mentees","description":"Access structured programs designed to support your growth, clarity, and leadership potential.","href":"/forms/mentee","buttonText":"Apply as a Mentee","icon":"GraduationCap"},{"title":"Volunteers","description":"Support program delivery, operations, and community engagement.","href":"/forms/volunteer","buttonText":"Volunteer with Us","icon":"HandHelping"}]', category: "getinvolved", label: "Pathways", fieldType: "json", description: "Involvement pathway cards with title, description, href, buttonText, icon (JSON array)" },
  { key: "partners_hero_image", value: "", category: "partners", label: "Hero Background Image", fieldType: "image", description: "Background image for the partners page hero section" },
  { key: "partners_hero_headline", value: "Partner with AODI", category: "partners", label: "Hero Headline", fieldType: "text", description: "Headline for the partners page" },
  { key: "partners_hero_subheadline", value: "We collaborate with foundations, corporates, schools, universities, NGOs, and institutions to scale leadership and talent development across Africa.", category: "partners", label: "Hero Subheadline", fieldType: "textarea", description: "Subheadline for the partners page" },
  { key: "partners_models", value: '[{"title":"Cohort Sponsorship","description":"Sponsor a structured cohort of mentees and program delivery.","details":"Support a defined group of participants through their leadership development journey with clear outcomes and reporting."},{"title":"Program Sponsorship","description":"Fund a specific initiative (e.g., women\'s leadership, campus engagement).","details":"Enable the launch or expansion of targeted programs that align with your organization\'s goals and values."},{"title":"Institutional Partnership","description":"Co-deliver programs through your institution or network.","details":"Partner with AODI to bring leadership development programs to your students, employees, or community members."}]', category: "partners", label: "Partnership Models", fieldType: "json", description: "Partnership model cards with title, description, details (JSON array)" },
  { key: "partners_cta_text", value: "Interested in partnering? Get in touch to explore collaboration opportunities.", category: "partners", label: "CTA Text", fieldType: "textarea", description: "Call-to-action text at bottom of partners page" },
  { key: "impact_hero_image", value: "", category: "impact", label: "Hero Background Image", fieldType: "image", description: "Background image for the impact page hero section" },
  { key: "impact_hero_headline", value: "Our Impact", category: "impact", label: "Hero Headline", fieldType: "text", description: "Headline for the impact page" },
  { key: "impact_hero_subheadline", value: "Measured impact across education, leadership, and access since inception.", category: "impact", label: "Hero Subheadline", fieldType: "textarea", description: "Subheadline for the impact page" },
  { key: "impact_category_descriptions", value: '{"Beneficiaries & Reach":"These figures reflect AODI\'s commitment to equitable access and pan-African reach.","Education & Capacity Building":"These activities form the foundation of AODI\'s education-to-leadership pipeline.","Mentorship & Career Advancement":"Outcome indicators are based on structured program feedback and post-engagement follow-up.","Programs & Partnerships":"Partnerships play a critical role in scaling delivery, strengthening governance, and extending reach."}', category: "impact", label: "Category Descriptions", fieldType: "json", description: "Description for each impact metric category (JSON object)" },
  { key: "support_hero_image", value: "", category: "support", label: "Hero Background Image", fieldType: "image", description: "Background image for the support page hero section" },
  { key: "support_hero_headline", value: "Support AODI", category: "support", label: "Hero Headline", fieldType: "text", description: "Headline for the support/donation page" },
  { key: "support_hero_subheadline", value: "Your contribution helps us build leadership capacity and unlock opportunity for talented young people across Africa.", category: "support", label: "Hero Subheadline", fieldType: "textarea", description: "Subheadline for the support page" },
  { key: "support_benefits", value: '["Education and mentorship programs for students and early-career professionals","Leadership and capacity-building initiatives","Program delivery, coordination, and safeguarding","Operational sustainability of AODI\'s work"]', category: "support", label: "Donation Benefits", fieldType: "json", description: "What donations support (JSON array of strings)" },
  { key: "support_naira_amounts", value: '[{"value":5000,"label":"₦5,000"},{"value":10000,"label":"₦10,000"},{"value":25000,"label":"₦25,000"}]', category: "support", label: "Naira Donation Amounts", fieldType: "json", description: "Preset Naira donation amounts (JSON array)" },
  { key: "support_dollar_amounts", value: '[{"value":10,"label":"$10"},{"value":25,"label":"$25"},{"value":50,"label":"$50"}]', category: "support", label: "Dollar Donation Amounts", fieldType: "json", description: "Preset Dollar donation amounts (JSON array)" },
  { key: "support_giving_reasons", value: '[{"value":"","label":"Select a reason (optional)"},{"value":"general","label":"General Support"},{"value":"mentorship","label":"Mentorship Programs"},{"value":"empowerher","label":"EmpowerHer Initiative"},{"value":"education","label":"Education & Scholarships"},{"value":"events","label":"Conferences & Events"},{"value":"other","label":"Other (please specify)"}]', category: "support", label: "Giving Reasons", fieldType: "json", description: "Reasons for donation dropdown options (JSON array)" },
  { key: "governance_hero_image", value: "", category: "governance", label: "Hero Background Image", fieldType: "image", description: "Background image for the governance page hero section" },
  { key: "contact_email", value: "aodi.info@africaofourdreaminitiative.org", category: "general", label: "Public Contact Email", fieldType: "text", description: "The main contact email shown in emails sent to applicants and on the website (e.g. info@ or aodi.info@)" },
  { key: "admin_notification_email", value: "admin.board@africaofourdreaminitiative.org", category: "general", label: "Admin Notification Email", fieldType: "text", description: "Where new form submission notifications are sent (admin inbox email)" },
]

async function seedDefaultSettings() {
  // Incremental seeding: always add any missing settings, even if the table already has data
  const existingKeys = await db.select({ key: siteSettings.key }).from(siteSettings)
  const existingSet = new Set(existingKeys.map(r => r.key))

  const missing = DEFAULT_SETTINGS.filter(s => !existingSet.has(s.key))
  if (missing.length > 0) {
    await db.insert(siteSettings).values(missing)
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    const sessionSecret = getSessionSecret()
    if (!sessionSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, sessionSecret)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await seedDefaultSettings()
    
    const settings = await db.select().from(siteSettings).orderBy(siteSettings.category, siteSettings.key)
    
    const grouped: Record<string, typeof settings> = {}
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = []
      }
      grouped[setting.category].push(setting)
    }

    return NextResponse.json(grouped)
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    const sessionSecret = getSessionSecret()
    if (!sessionSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, sessionSecret)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1)

    if (existing.length === 0) {
      await db.insert(siteSettings).values({
        key,
        value: value || "",
        category: body.category || "general",
        label: body.label,
        description: body.description,
        fieldType: body.fieldType || "text",
      })
    } else {
      await db.update(siteSettings)
        .set({ value: value || "", updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
    }

    await auditLog({
      entityType: "site_setting",
      entityId: null,
      action: "update",
      details: `Updated site setting: ${key}`,
      metadata: { key, category: body.category },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    const sessionSecret = getSessionSecret()
    if (!sessionSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, sessionSecret)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const updates = body.updates as { key: string; value: string }[]

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Updates must be an array" }, { status: 400 })
    }

    for (const update of updates) {
      await db.update(siteSettings)
        .set({ value: update.value || "", updatedAt: new Date() })
        .where(eq(siteSettings.key, update.key))
    }

    await auditLog({
      entityType: "site_setting",
      entityId: null,
      action: "bulk_action",
      details: `Bulk updated ${updates.length} site settings`,
      metadata: { updatedKeys: updates.map((u: { key: string }) => u.key) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
