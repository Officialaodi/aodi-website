import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stories } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const storyUpdateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  featuredImage: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  publishDate: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const storyId = parseInt(id)
    
    if (isNaN(storyId)) {
      return NextResponse.json({ error: "Invalid story ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = storyUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.title !== undefined) updateData.title = data.title
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.body !== undefined) updateData.body = data.body
    if (data.category !== undefined) updateData.category = data.category
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.publishDate !== undefined) updateData.publishDate = data.publishDate ? new Date(data.publishDate) : null
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db.update(stories).set(updateData).where(eq(stories.id, storyId)).returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "story",
      entityId: storyId,
      action: "update",
      details: `Updated story: ${updated[0].title}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const storyId = parseInt(id)
    
    if (isNaN(storyId)) {
      return NextResponse.json({ error: "Invalid story ID" }, { status: 400 })
    }
    
    const deleted = await db.delete(stories).where(eq(stories.id, storyId)).returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "story",
      entityId: storyId,
      action: "delete",
      details: `Deleted story: ${deleted[0].title}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}
