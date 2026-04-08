import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const dynamic = 'force-dynamic'

/**
 * Brevo Transactional Email Webhooks
 *
 * Configure in Brevo → Transactional → Settings → Webhooks
 * Webhook URL: https://yourdomain.com/api/webhooks/brevo?token=YOUR_BREVO_WEBHOOK_SECRET
 *
 * Events tracked: delivered, opened, clicked, hard_bounce, soft_bounce, unsubscribed, spam
 *
 * Set BREVO_WEBHOOK_SECRET in your environment variables and use it as the `token` query param.
 */

interface BrevoEvent {
  event: string
  email: string
  "message-id"?: string
  "MessageId"?: string
  ts?: number
  ts_event?: number
  subject?: string
  link?: string          // present on "clicked" events
  reason?: string        // present on bounce events
  ip?: string
}

function extractMessageId(event: BrevoEvent): string | null {
  const raw = event["message-id"] || event["MessageId"]
  if (!raw) return null
  return raw.replace(/^<|>$/g, "")
}

function eventTimestamp(event: BrevoEvent): Date {
  const ts = event.ts_event ?? event.ts
  return ts ? new Date(ts * 1000) : new Date()
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.BREVO_WEBHOOK_SECRET
  if (webhookSecret) {
    const token = request.nextUrl.searchParams.get("token")
    if (token !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let payload: BrevoEvent | BrevoEvent[]
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const events = Array.isArray(payload) ? payload : [payload]
  const processed: string[] = []
  const skipped: string[] = []

  for (const event of events) {
    const messageId = extractMessageId(event)
    const eventType = event.event
    const eventAt = eventTimestamp(event)

    if (!messageId || !eventType) {
      skipped.push(`missing message-id or event type`)
      continue
    }

    try {
      const [log] = await db
        .select({ id: emailLogs.id, openCount: emailLogs.openCount, clickCount: emailLogs.clickCount })
        .from(emailLogs)
        .where(eq(emailLogs.brevoMessageId, messageId))

      if (!log) {
        skipped.push(`${eventType}:${messageId} — no matching email log`)
        continue
      }

      const updateData: Record<string, unknown> = {
        lastEventAt: eventAt,
        lastEventType: eventType,
      }

      switch (eventType) {
        case "delivered":
          updateData.deliveredAt = eventAt
          updateData.status = "sent"
          break

        case "opened":
          if (!log.openedAt) updateData.openedAt = eventAt
          updateData.openCount = (log.openCount ?? 0) + 1
          break

        case "clicked":
          if (!log.clickedAt) updateData.clickedAt = eventAt
          updateData.clickCount = (log.clickCount ?? 0) + 1
          break

        case "hard_bounce":
          updateData.bouncedAt = eventAt
          updateData.bounceType = "hard"
          updateData.status = "failed"
          updateData.errorMessage = event.reason || "Hard bounce"
          break

        case "soft_bounce":
          updateData.bouncedAt = eventAt
          updateData.bounceType = "soft"
          updateData.errorMessage = event.reason || "Soft bounce"
          break

        case "unsubscribed":
          updateData.lastEventType = "unsubscribed"
          break

        case "spam":
          updateData.lastEventType = "spam"
          break

        default:
          skipped.push(`${eventType} — unhandled event type`)
          continue
      }

      await db
        .update(emailLogs)
        .set(updateData)
        .where(eq(emailLogs.id, log.id))

      processed.push(`${eventType}:${messageId}`)
    } catch (err) {
      console.error("[Brevo webhook] DB update failed:", err)
      skipped.push(`${eventType}:${messageId} — db error`)
    }
  }

  return NextResponse.json({ ok: true, processed: processed.length, skipped: skipped.length })
}
