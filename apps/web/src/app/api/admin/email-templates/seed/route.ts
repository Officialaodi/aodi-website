import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailTemplates } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"
import { SYSTEM_TEMPLATES, TRANSACTIONAL_TEMPLATES } from "@/lib/email-templates"

export const dynamic = 'force-dynamic'

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

const TRANSACTIONAL_SLUGS = new Set(TRANSACTIONAL_TEMPLATES.map(t => t.slug))

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: { slug: string; action: "created" | "skipped" | "updated" }[] = []

  for (const tmpl of SYSTEM_TEMPLATES) {
    const [existing] = await db.select({ id: emailTemplates.id, category: emailTemplates.category })
      .from(emailTemplates)
      .where(eq(emailTemplates.slug, tmpl.slug))

    if (existing) {
      // If it's a transactional template stored under an old category, update the category
      if (TRANSACTIONAL_SLUGS.has(tmpl.slug) && existing.category !== 'transactional') {
        await db.update(emailTemplates)
          .set({ category: 'transactional' })
          .where(eq(emailTemplates.id, existing.id))
        results.push({ slug: tmpl.slug, action: "updated" })
      } else {
        results.push({ slug: tmpl.slug, action: "skipped" })
      }
      continue
    }

    await db.insert(emailTemplates).values({
      name: tmpl.name,
      slug: tmpl.slug,
      subject: tmpl.subject,
      body: tmpl.body,
      category: tmpl.category,
      variables: tmpl.variables.join(","),
      isActive: true,
    })
    results.push({ slug: tmpl.slug, action: "created" })
  }

  const created = results.filter(r => r.action === "created").length
  const updated = results.filter(r => r.action === "updated").length
  const skipped = results.filter(r => r.action === "skipped").length

  return NextResponse.json({
    success: true,
    message: `Created ${created} template(s), updated ${updated} to transactional category. ${skipped} already up to date.`,
    results,
  })
}
