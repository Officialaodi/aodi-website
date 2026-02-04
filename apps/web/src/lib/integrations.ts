import { db } from "@/lib/db"
import { integrationSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export type IntegrationKey = 
  | "sendgrid" 
  | "google_analytics" 
  | "paystack" 
  | "paypal" 
  | "sentry" 
  | "hcaptcha"

interface IntegrationStatus {
  isEnabled: boolean
  isConfigured: boolean
  configValue: string | null
}

function checkSecretConfigured(secretsRequired: string | null): boolean {
  if (!secretsRequired) return true
  const secrets = secretsRequired.split(",").map(s => s.trim())
  return secrets.every(secret => {
    const value = process.env[secret]
    return value && value.length > 0
  })
}

async function fetchIntegrationStatus(key: IntegrationKey): Promise<IntegrationStatus> {
  try {
    const result = await db.select()
      .from(integrationSettings)
      .where(eq(integrationSettings.integrationKey, key))
    
    if (result.length === 0) {
      return { isEnabled: false, isConfigured: false, configValue: null }
    }
    
    const integration = result[0]
    const isConfigured = checkSecretConfigured(integration.secretsRequired)
    
    return {
      isEnabled: integration.isEnabled ?? false,
      isConfigured,
      configValue: integration.configValue
    }
  } catch (error) {
    console.error(`Error checking integration ${key}:`, error)
    return { isEnabled: false, isConfigured: false, configValue: null }
  }
}

export async function getIntegrationStatus(key: IntegrationKey): Promise<IntegrationStatus> {
  const getCachedStatus = unstable_cache(
    async () => fetchIntegrationStatus(key),
    [`integration-status-${key}`],
    { revalidate: 60, tags: ["integrations", `integration-${key}`] }
  )
  return getCachedStatus()
}

export async function isIntegrationActive(key: IntegrationKey): Promise<boolean> {
  const status = await getIntegrationStatus(key)
  return status.isEnabled && status.isConfigured
}

export async function getGoogleAnalyticsId(): Promise<string | null> {
  const envValue = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (envValue) return envValue
  
  const status = await getIntegrationStatus("google_analytics")
  if (status.isEnabled && status.configValue) {
    return status.configValue
  }
  return null
}

export async function isPaystackActive(): Promise<boolean> {
  return isIntegrationActive("paystack")
}

export async function isPayPalActive(): Promise<boolean> {
  return isIntegrationActive("paypal")
}

export async function isSendGridActive(): Promise<boolean> {
  return isIntegrationActive("sendgrid")
}

export async function isHCaptchaActive(): Promise<boolean> {
  return isIntegrationActive("hcaptcha")
}
