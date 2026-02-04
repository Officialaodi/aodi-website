import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trustees, governanceContent } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

export async function GET() {
  try {
    const [trusteesData, contentData] = await Promise.all([
      db.select().from(trustees).where(eq(trustees.isActive, true)).orderBy(asc(trustees.displayOrder)),
      db.select().from(governanceContent)
    ])

    const contentMap: Record<string, string> = {}
    contentData.forEach(item => {
      contentMap[item.key] = item.value
    })

    return NextResponse.json({
      trustees: trusteesData,
      content: contentMap
    })
  } catch (error) {
    console.error("Error fetching governance data:", error)
    return NextResponse.json({ error: "Failed to fetch governance data" }, { status: 500 })
  }
}
