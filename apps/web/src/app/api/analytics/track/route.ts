import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { analyticsSessions, analyticsPageViews, analyticsEvents } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getCountryFromTimezone, getContinentFromTimezone } from "@/lib/timezone-geo"

const VALID_TYPES = ["session_start", "page_view", "page_update", "session_end", "event"]
const MAX_STRING_LENGTH = 500

function sanitizeString(str: unknown, maxLength = MAX_STRING_LENGTH): string | null {
  if (typeof str !== "string") return null
  return str.substring(0, maxLength)
}

function validateSessionId(sessionId: unknown): boolean {
  return typeof sessionId === "string" && sessionId.length > 0 && sessionId.length <= 100
}

function validateVisitorId(visitorId: unknown): boolean {
  return typeof visitorId === "string" && visitorId.length > 0 && visitorId.length <= 100
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 })
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    if (!validateSessionId(data.sessionId) || !validateVisitorId(data.visitorId)) {
      return NextResponse.json({ error: "Invalid session or visitor ID" }, { status: 400 })
    }

    switch (type) {
      case "session_start": {
        const existingSession = await db
          .select()
          .from(analyticsSessions)
          .where(eq(analyticsSessions.sessionId, data.sessionId))
          .limit(1)

        if (existingSession.length === 0) {
          const country = data.timezone ? getCountryFromTimezone(data.timezone) : null
          const continent = data.timezone ? getContinentFromTimezone(data.timezone) : null
          
          await db.insert(analyticsSessions).values({
            sessionId: data.sessionId,
            visitorId: data.visitorId,
            userAgent: data.userAgent,
            browser: data.browser,
            browserVersion: data.browserVersion,
            os: data.os,
            osVersion: data.osVersion,
            deviceType: data.deviceType,
            screenWidth: data.screenWidth,
            screenHeight: data.screenHeight,
            language: data.language,
            timezone: data.timezone,
            referrer: data.referrer,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
            utmTerm: data.utmTerm,
            utmContent: data.utmContent,
            country: country,
            continent: continent,
            entryPage: data.entryPage,
            pageViews: 0,
            duration: 0,
            isBounce: true,
            isActive: true,
          })
        }
        break
      }

      case "page_view": {
        await db.insert(analyticsPageViews).values({
          sessionId: data.sessionId,
          visitorId: data.visitorId,
          path: data.path,
          title: data.title,
          referrer: data.referrer,
          queryParams: data.queryParams ? JSON.stringify(data.queryParams) : null,
        })

        await db
          .update(analyticsSessions)
          .set({
            pageViews: data.pageCount || 1,
            exitPage: data.path,
            isBounce: (data.pageCount || 1) <= 1,
            isActive: true,
          })
          .where(eq(analyticsSessions.sessionId, data.sessionId))
        break
      }

      case "page_update": {
        if (data.pageViewId) {
          await db
            .update(analyticsPageViews)
            .set({
              timeOnPage: data.timeOnPage,
              scrollDepth: data.scrollDepth,
              exitIntent: data.exitIntent,
            })
            .where(eq(analyticsPageViews.id, data.pageViewId))
        }

        await db
          .update(analyticsSessions)
          .set({
            duration: data.sessionDuration || 0,
            isActive: true,
          })
          .where(eq(analyticsSessions.sessionId, data.sessionId))
        break
      }

      case "session_end": {
        await db
          .update(analyticsSessions)
          .set({
            duration: data.duration,
            isActive: false,
            endedAt: new Date(),
          })
          .where(eq(analyticsSessions.sessionId, data.sessionId))
        break
      }

      case "event": {
        await db.insert(analyticsEvents).values({
          sessionId: data.sessionId,
          visitorId: data.visitorId,
          eventType: data.eventType,
          eventCategory: data.eventCategory,
          eventAction: data.eventAction,
          eventLabel: data.eventLabel,
          eventValue: data.eventValue,
          path: data.path,
          elementId: data.elementId,
          elementClass: data.elementClass,
          elementText: data.elementText?.substring(0, 200),
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        })
        break
      }

      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
