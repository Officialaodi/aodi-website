import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { siteSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { auditLog } from "@/lib/audit-log"

const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
  console.error("SESSION_SECRET environment variable is required for site settings endpoint")
}

const DEFAULT_SETTINGS = [
  { key: "hero_title", value: "Building Africa's Future Leaders", category: "homepage", label: "Hero Title", fieldType: "text", description: "Main headline on homepage" },
  { key: "hero_subtitle", value: "Empowering the next generation through education, mentorship, and leadership development", category: "homepage", label: "Hero Subtitle", fieldType: "textarea", description: "Subtitle under the main headline" },
  { key: "hero_image", value: "", category: "homepage", label: "Hero Background Image", fieldType: "image", description: "Background image for the hero section" },
  { key: "hero_cta_text", value: "Get Involved", category: "homepage", label: "Hero CTA Button Text", fieldType: "text", description: "Call-to-action button text" },
  { key: "hero_cta_link", value: "/get-involved", category: "homepage", label: "Hero CTA Link", fieldType: "text", description: "Link for the CTA button" },
  { key: "about_title", value: "About AODI", category: "homepage", label: "About Section Title", fieldType: "text", description: "Title for the about section" },
  { key: "about_content", value: "The Africa of Our Dream Education Initiative (AODI) is dedicated to transforming lives through quality education and mentorship programs across Africa.", category: "homepage", label: "About Content", fieldType: "richtext", description: "About section content" },
  { key: "about_image", value: "", category: "homepage", label: "About Section Image", fieldType: "image", description: "Image for the about section" },
  { key: "footer_about", value: "AODI is a UK-registered NGO dedicated to educational empowerment and leadership development across Africa.", category: "footer", label: "Footer About Text", fieldType: "textarea", description: "Short about text in footer" },
  { key: "footer_address", value: "London, United Kingdom", category: "footer", label: "Address", fieldType: "text", description: "Organization address" },
  { key: "footer_email", value: "aodi.info@africaofourdreaminitiative.org", category: "footer", label: "Email", fieldType: "text", description: "Contact email" },
  { key: "footer_phone", value: "", category: "footer", label: "Phone", fieldType: "text", description: "Contact phone number" },
  { key: "social_facebook", value: "", category: "social", label: "Facebook URL", fieldType: "text", description: "Facebook page URL" },
  { key: "social_twitter", value: "", category: "social", label: "X (Twitter) URL", fieldType: "text", description: "X/Twitter profile URL" },
  { key: "social_linkedin", value: "", category: "social", label: "LinkedIn URL", fieldType: "text", description: "LinkedIn page URL" },
  { key: "social_instagram", value: "", category: "social", label: "Instagram URL", fieldType: "text", description: "Instagram profile URL" },
  { key: "social_youtube", value: "", category: "social", label: "YouTube URL", fieldType: "text", description: "YouTube channel URL" },
]

async function seedDefaultSettings() {
  const existing = await db.select().from(siteSettings).limit(1)
  if (existing.length === 0) {
    await db.insert(siteSettings).values(DEFAULT_SETTINGS)
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    if (!SESSION_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
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
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    if (!SESSION_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
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
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    if (!SESSION_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
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
