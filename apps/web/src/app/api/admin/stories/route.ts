import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stories } from "@/lib/schema"
import { desc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const storySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  body: z.string().min(1, "Body is required"),
  category: z.string().min(1, "Category is required"),
  featuredImage: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  publishDate: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

function verifySession(token: string): boolean {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [payload, signature] = parts
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex")
  
  try {
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")
    if (sigBuffer.length !== expectedBuffer.length) return false
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false
    
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())
    if (decoded.exp && Date.now() > decoded.exp) return false
    
    return true
  } catch {
    return false
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  if (!sessionToken) return false
  return verifySession(sessionToken)
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await db.select().from(stories).orderBy(desc(stories.publishDate))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = storySchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newStory = await db.insert(stories).values({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      category: data.category,
      featuredImage: data.featuredImage || null,
      tags: data.tags || null,
      publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
      isFeatured: data.isFeatured,
      isActive: data.isActive,
    }).returning()
    
    await auditLog({
      entityType: "story",
      entityId: newStory[0].id,
      action: "create",
      details: `Created story: ${data.title}`,
      metadata: { createdFields: Object.keys(data) },
    })
    
    return NextResponse.json(newStory[0], { status: 201 })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
  }
}
