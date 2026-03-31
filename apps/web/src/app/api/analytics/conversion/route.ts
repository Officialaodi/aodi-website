import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { analyticsConversions } from "@/lib/schema"

 export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    const body = await request.json()
    const {
      sessionId,
      visitorId,
      conversionType,
      conversionName,
      value,
      currency,
      metadata,
      path,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    if (!conversionType || !conversionName) {
      return NextResponse.json({ error: "Missing conversion type or name" }, { status: 400 })
    }

    await db.insert(analyticsConversions).values({
      sessionId: sessionId || null,
      visitorId: visitorId || null,
      conversionType,
      conversionName,
      value: value || 0,
      currency: currency || "USD",
      metadata: metadata ? JSON.stringify(metadata) : null,
      path: path || null,
      referrer: referrer || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Conversion tracking error:", error)
    return NextResponse.json({ error: "Failed to track conversion" }, { status: 500 })
  }
}
