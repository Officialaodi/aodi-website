import { db } from "@/lib/db"
import { analyticsConversions } from "@/lib/schema"

export type ConversionType = 
  | "application"
  | "donation"
  | "newsletter"
  | "contact"

export interface ConversionData {
  conversionType: ConversionType
  conversionName: string
  conversionReference?: string
  value?: number
  currency?: string
  metadata?: Record<string, unknown>
  path?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

interface PostgresError extends Error {
  code?: string
  constraint?: string
}

export async function trackConversion(data: ConversionData): Promise<boolean> {
  try {
    await db.insert(analyticsConversions).values({
      conversionType: data.conversionType,
      conversionName: data.conversionName,
      conversionReference: data.conversionReference || null,
      value: data.value || 0,
      currency: data.currency || "USD",
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      path: data.path || null,
      referrer: data.referrer || null,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
    })
    return true
  } catch (error) {
    const pgError = error as PostgresError
    // PostgreSQL unique constraint violation code: 23505
    const isUniqueViolation = 
      pgError.code === '23505' || 
      pgError.constraint?.includes('conversion_reference') ||
      pgError.message?.toLowerCase().includes('unique') ||
      pgError.message?.toLowerCase().includes('duplicate')
    
    if (isUniqueViolation) {
      console.log("Conversion already tracked:", data.conversionReference)
      return false
    }
    console.error("Failed to track conversion:", error)
    return false
  }
}
