import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { analyticsSessions, analyticsPageViews, analyticsEvents, analyticsConversions } from "@/lib/schema"
import { sql, gte, and, desc, eq, count, avg, sum } from "drizzle-orm"
import { verifySignedToken, getUserWithPermissions } from "@/lib/admin-auth"

 export const runtime = 'edge';

async function verifyAdminAccess() {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return null

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession) return null

  const payload = verifySignedToken(adminSession.value, sessionSecret)
  if (!payload) return null

  const user = await getUserWithPermissions(payload.userId)
  return user
}

export async function GET(request: Request) {
  const user = await verifyAdminAccess()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "7d"
  const type = searchParams.get("type") || "overview"

  let startDate: Date
  const now = new Date()

  switch (range) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  try {
    switch (type) {
      case "overview": {
        const [
          sessionsData,
          pageViewsData,
          eventsData,
          uniqueVisitors,
          avgSessionDuration,
          bounceRate,
          activeNow,
        ] = await Promise.all([
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(gte(analyticsSessions.startedAt, startDate)),
          db
            .select({ count: count() })
            .from(analyticsPageViews)
            .where(gte(analyticsPageViews.createdAt, startDate)),
          db
            .select({ count: count() })
            .from(analyticsEvents)
            .where(gte(analyticsEvents.createdAt, startDate)),
          db
            .select({ count: sql<number>`count(distinct ${analyticsSessions.visitorId})` })
            .from(analyticsSessions)
            .where(gte(analyticsSessions.startedAt, startDate)),
          db
            .select({ avg: avg(analyticsSessions.duration) })
            .from(analyticsSessions)
            .where(gte(analyticsSessions.startedAt, startDate)),
          db
            .select({
              total: count(),
              bounced: sql<number>`sum(case when ${analyticsSessions.isBounce} = true then 1 else 0 end)`,
            })
            .from(analyticsSessions)
            .where(gte(analyticsSessions.startedAt, startDate)),
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                eq(analyticsSessions.isActive, true),
                gte(analyticsSessions.startedAt, new Date(now.getTime() - 5 * 60 * 1000))
              )
            ),
        ])

        const totalSessions = sessionsData[0]?.count || 0
        const bouncedSessions = bounceRate[0]?.bounced || 0
        const bouncePercentage = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0

        return NextResponse.json({
          totalSessions: totalSessions,
          totalPageViews: pageViewsData[0]?.count || 0,
          totalEvents: eventsData[0]?.count || 0,
          uniqueVisitors: uniqueVisitors[0]?.count || 0,
          avgSessionDuration: Math.round(Number(avgSessionDuration[0]?.avg) || 0),
          bounceRate: bouncePercentage,
          activeNow: activeNow[0]?.count || 0,
        })
      }

      case "pageviews_by_day": {
        const data = await db
          .select({
            date: sql<string>`date(${analyticsPageViews.createdAt})`,
            count: count(),
          })
          .from(analyticsPageViews)
          .where(gte(analyticsPageViews.createdAt, startDate))
          .groupBy(sql`date(${analyticsPageViews.createdAt})`)
          .orderBy(sql`date(${analyticsPageViews.createdAt})`)

        return NextResponse.json(data)
      }

      case "sessions_by_day": {
        const data = await db
          .select({
            date: sql<string>`date(${analyticsSessions.startedAt})`,
            count: count(),
          })
          .from(analyticsSessions)
          .where(gte(analyticsSessions.startedAt, startDate))
          .groupBy(sql`date(${analyticsSessions.startedAt})`)
          .orderBy(sql`date(${analyticsSessions.startedAt})`)

        return NextResponse.json(data)
      }

      case "top_pages": {
        const data = await db
          .select({
            path: analyticsPageViews.path,
            views: count(),
            avgTimeOnPage: avg(analyticsPageViews.timeOnPage),
            avgScrollDepth: avg(analyticsPageViews.scrollDepth),
          })
          .from(analyticsPageViews)
          .where(gte(analyticsPageViews.createdAt, startDate))
          .groupBy(analyticsPageViews.path)
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "referrers": {
        const data = await db
          .select({
            referrer: analyticsSessions.referrer,
            count: count(),
          })
          .from(analyticsSessions)
          .where(
            and(
              gte(analyticsSessions.startedAt, startDate),
              sql`${analyticsSessions.referrer} IS NOT NULL AND ${analyticsSessions.referrer} != ''`
            )
          )
          .groupBy(analyticsSessions.referrer)
          .orderBy(desc(count()))
          .limit(10)

        return NextResponse.json(data)
      }

      case "devices": {
        const data = await db
          .select({
            deviceType: analyticsSessions.deviceType,
            count: count(),
          })
          .from(analyticsSessions)
          .where(gte(analyticsSessions.startedAt, startDate))
          .groupBy(analyticsSessions.deviceType)
          .orderBy(desc(count()))

        return NextResponse.json(data)
      }

      case "browsers": {
        const data = await db
          .select({
            browser: analyticsSessions.browser,
            count: count(),
          })
          .from(analyticsSessions)
          .where(gte(analyticsSessions.startedAt, startDate))
          .groupBy(analyticsSessions.browser)
          .orderBy(desc(count()))
          .limit(10)

        return NextResponse.json(data)
      }

      case "os": {
        const data = await db
          .select({
            os: analyticsSessions.os,
            count: count(),
          })
          .from(analyticsSessions)
          .where(gte(analyticsSessions.startedAt, startDate))
          .groupBy(analyticsSessions.os)
          .orderBy(desc(count()))
          .limit(10)

        return NextResponse.json(data)
      }

      case "events": {
        const data = await db
          .select({
            eventType: analyticsEvents.eventType,
            eventCategory: analyticsEvents.eventCategory,
            count: count(),
          })
          .from(analyticsEvents)
          .where(gte(analyticsEvents.createdAt, startDate))
          .groupBy(analyticsEvents.eventType, analyticsEvents.eventCategory)
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "utm": {
        const data = await db
          .select({
            source: analyticsSessions.utmSource,
            medium: analyticsSessions.utmMedium,
            campaign: analyticsSessions.utmCampaign,
            count: count(),
          })
          .from(analyticsSessions)
          .where(
            and(
              gte(analyticsSessions.startedAt, startDate),
              sql`${analyticsSessions.utmSource} IS NOT NULL`
            )
          )
          .groupBy(
            analyticsSessions.utmSource,
            analyticsSessions.utmMedium,
            analyticsSessions.utmCampaign
          )
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "realtime": {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
        
        const [activeSessions, recentPageViews] = await Promise.all([
          db
            .select({
              id: analyticsSessions.id,
              visitorId: analyticsSessions.visitorId,
              deviceType: analyticsSessions.deviceType,
              browser: analyticsSessions.browser,
              os: analyticsSessions.os,
              entryPage: analyticsSessions.entryPage,
              exitPage: analyticsSessions.exitPage,
              pageViews: analyticsSessions.pageViews,
              duration: analyticsSessions.duration,
              startedAt: analyticsSessions.startedAt,
            })
            .from(analyticsSessions)
            .where(
              and(
                eq(analyticsSessions.isActive, true),
                gte(analyticsSessions.startedAt, fiveMinutesAgo)
              )
            )
            .orderBy(desc(analyticsSessions.startedAt))
            .limit(50),
          db
            .select({
              path: analyticsPageViews.path,
              title: analyticsPageViews.title,
              createdAt: analyticsPageViews.createdAt,
            })
            .from(analyticsPageViews)
            .where(gte(analyticsPageViews.createdAt, fiveMinutesAgo))
            .orderBy(desc(analyticsPageViews.createdAt))
            .limit(20),
        ])

        return NextResponse.json({
          activeSessions,
          recentPageViews,
          activeCount: activeSessions.length,
        })
      }

      case "engagement": {
        const [scrollData, timeData] = await Promise.all([
          db
            .select({
              avgScrollDepth: avg(analyticsPageViews.scrollDepth),
              maxScrollDepth: sql<number>`max(${analyticsPageViews.scrollDepth})`,
            })
            .from(analyticsPageViews)
            .where(gte(analyticsPageViews.createdAt, startDate)),
          db
            .select({
              avgTimeOnPage: avg(analyticsPageViews.timeOnPage),
              totalTime: sum(analyticsPageViews.timeOnPage),
            })
            .from(analyticsPageViews)
            .where(gte(analyticsPageViews.createdAt, startDate)),
        ])

        return NextResponse.json({
          avgScrollDepth: Math.round(Number(scrollData[0]?.avgScrollDepth) || 0),
          avgTimeOnPage: Math.round(Number(timeData[0]?.avgTimeOnPage) || 0),
          totalEngagementTime: Number(timeData[0]?.totalTime) || 0,
        })
      }

      case "countries": {
        const data = await db
          .select({
            country: analyticsSessions.country,
            count: count(),
          })
          .from(analyticsSessions)
          .where(
            and(
              gte(analyticsSessions.startedAt, startDate),
              sql`${analyticsSessions.country} IS NOT NULL AND ${analyticsSessions.country} != 'Unknown'`
            )
          )
          .groupBy(analyticsSessions.country)
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "continents": {
        const data = await db
          .select({
            continent: analyticsSessions.continent,
            count: count(),
          })
          .from(analyticsSessions)
          .where(
            and(
              gte(analyticsSessions.startedAt, startDate),
              sql`${analyticsSessions.continent} IS NOT NULL AND ${analyticsSessions.continent} != 'Unknown'`
            )
          )
          .groupBy(analyticsSessions.continent)
          .orderBy(desc(count()))

        return NextResponse.json(data)
      }

      case "conversions": {
        const [summary, byType, byName, recent] = await Promise.all([
          db
            .select({
              totalConversions: count(),
              totalValue: sum(analyticsConversions.value),
            })
            .from(analyticsConversions)
            .where(gte(analyticsConversions.createdAt, startDate)),
          db
            .select({
              conversionType: analyticsConversions.conversionType,
              count: count(),
              totalValue: sum(analyticsConversions.value),
            })
            .from(analyticsConversions)
            .where(gte(analyticsConversions.createdAt, startDate))
            .groupBy(analyticsConversions.conversionType)
            .orderBy(desc(count())),
          db
            .select({
              conversionName: analyticsConversions.conversionName,
              conversionType: analyticsConversions.conversionType,
              count: count(),
              totalValue: sum(analyticsConversions.value),
            })
            .from(analyticsConversions)
            .where(gte(analyticsConversions.createdAt, startDate))
            .groupBy(analyticsConversions.conversionName, analyticsConversions.conversionType)
            .orderBy(desc(count()))
            .limit(20),
          db
            .select()
            .from(analyticsConversions)
            .where(gte(analyticsConversions.createdAt, startDate))
            .orderBy(desc(analyticsConversions.createdAt))
            .limit(10),
        ])

        return NextResponse.json({
          totalConversions: summary[0]?.totalConversions || 0,
          totalValue: Number(summary[0]?.totalValue) || 0,
          byType,
          byName,
          recent,
        })
      }

      case "conversions_by_day": {
        const data = await db
          .select({
            date: sql<string>`date(${analyticsConversions.createdAt})`,
            count: count(),
            totalValue: sum(analyticsConversions.value),
          })
          .from(analyticsConversions)
          .where(gte(analyticsConversions.createdAt, startDate))
          .groupBy(sql`date(${analyticsConversions.createdAt})`)
          .orderBy(sql`date(${analyticsConversions.createdAt})`)

        return NextResponse.json(data)
      }

      case "acquisition": {
        const [direct, organic, referral, social, campaign] = await Promise.all([
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                gte(analyticsSessions.startedAt, startDate),
                sql`(${analyticsSessions.referrer} IS NULL OR ${analyticsSessions.referrer} = '')`
              )
            ),
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                gte(analyticsSessions.startedAt, startDate),
                sql`${analyticsSessions.referrer} LIKE '%google%' OR ${analyticsSessions.referrer} LIKE '%bing%' OR ${analyticsSessions.referrer} LIKE '%yahoo%' OR ${analyticsSessions.referrer} LIKE '%duckduckgo%'`
              )
            ),
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                gte(analyticsSessions.startedAt, startDate),
                sql`${analyticsSessions.referrer} IS NOT NULL AND ${analyticsSessions.referrer} != ''`,
                sql`${analyticsSessions.referrer} NOT LIKE '%google%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%bing%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%yahoo%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%facebook%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%twitter%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%linkedin%'`,
                sql`${analyticsSessions.referrer} NOT LIKE '%instagram%'`,
                sql`${analyticsSessions.utmSource} IS NULL`
              )
            ),
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                gte(analyticsSessions.startedAt, startDate),
                sql`${analyticsSessions.referrer} LIKE '%facebook%' OR ${analyticsSessions.referrer} LIKE '%twitter%' OR ${analyticsSessions.referrer} LIKE '%linkedin%' OR ${analyticsSessions.referrer} LIKE '%instagram%' OR ${analyticsSessions.referrer} LIKE '%youtube%'`
              )
            ),
          db
            .select({ count: count() })
            .from(analyticsSessions)
            .where(
              and(
                gte(analyticsSessions.startedAt, startDate),
                sql`${analyticsSessions.utmSource} IS NOT NULL`
              )
            ),
        ])

        return NextResponse.json([
          { channel: "Direct", count: direct[0]?.count || 0 },
          { channel: "Organic Search", count: organic[0]?.count || 0 },
          { channel: "Referral", count: referral[0]?.count || 0 },
          { channel: "Social", count: social[0]?.count || 0 },
          { channel: "Campaign", count: campaign[0]?.count || 0 },
        ])
      }

      default:
        return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
