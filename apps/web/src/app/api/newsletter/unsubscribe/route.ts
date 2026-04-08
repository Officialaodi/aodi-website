import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new NextResponse('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Invalid unsubscribe link</h2></body></html>', { headers: { 'content-type': 'text/html' } })
  }

  try {
    const email = Buffer.from(token, 'base64').toString('utf8')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new NextResponse('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Invalid unsubscribe link</h2></body></html>', { headers: { 'content-type': 'text/html' } })
    }

    await db
      .update(newsletterSubscribers)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))

    const html = `<!DOCTYPE html><html><head><title>Unsubscribed — AODI</title></head>
<body style="margin:0;padding:0;background:#f5f7f9;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:8px;padding:48px;max-width:480px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="font-size:22px;font-weight:700;color:#0F3D2E;margin-bottom:4px;">AODI</div>
    <div style="font-size:11px;color:#C9A24D;text-transform:uppercase;letter-spacing:1px;margin-bottom:32px;">Africa of Our Dream Education Initiative</div>
    <h2 style="color:#0F3D2E;margin:0 0 16px;">You have been unsubscribed</h2>
    <p style="color:#6b7280;margin:0 0 24px;">We have removed <strong>${email}</strong> from our mailing list. You will no longer receive newsletter emails from AODI.</p>
    <a href="/" style="display:inline-block;background:#0F3D2E;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">Return to Website</a>
  </div>
</body></html>`

    return new NextResponse(html, { headers: { 'content-type': 'text/html' } })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return new NextResponse('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Something went wrong. Please try again.</h2></body></html>', { headers: { 'content-type': 'text/html' } })
  }
}
