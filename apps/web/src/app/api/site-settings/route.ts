import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { siteSettings } from "@/lib/schema"

 export const runtime = 'edge';

export async function GET() {
  try {
    const settings = await db.select().from(siteSettings)
    
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}
