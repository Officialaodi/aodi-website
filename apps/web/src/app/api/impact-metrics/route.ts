import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { impactMetrics } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

 export const runtime = 'edge';

export async function GET() {
  try {
    const metrics = await db
      .select()
      .from(impactMetrics)
      .where(eq(impactMetrics.isActive, true))
      .orderBy(asc(impactMetrics.displayOrder))

    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = []
      }
      acc[metric.category].push(metric)
      return acc
    }, {} as Record<string, typeof metrics>)

    const homepageMetrics = metrics.filter(m => m.showOnHomepage)

    return NextResponse.json({ 
      metrics: grouped,
      homepage: homepageMetrics
    })
  } catch (error) {
    console.error("Error fetching impact metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
