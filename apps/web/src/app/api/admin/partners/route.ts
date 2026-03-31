import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { partners } from "@/lib/schema"
import { asc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const partnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  logoUrl: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional().default(0),
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
    const data = await db.select().from(partners).orderBy(asc(partners.displayOrder))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = partnerSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newPartner = await db.insert(partners).values({
      name: data.name,
      type: data.type,
      logoUrl: data.logoUrl || null,
      url: data.url || null,
      description: data.description || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }).returning()
    
    await auditLog({
      entityType: "partner",
      entityId: newPartner[0].id,
      action: "create",
      details: `Created partner: ${data.name}`,
      metadata: { createdFields: Object.keys(data) },
    })
    
    return NextResponse.json(newPartner[0], { status: 201 })
  } catch (error) {
    console.error("Error creating partner:", error)
    return NextResponse.json({ error: "Failed to create partner" }, { status: 500 })
  }
}
