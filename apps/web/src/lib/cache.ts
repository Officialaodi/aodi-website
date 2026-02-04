import { unstable_cache } from 'next/cache'
import { db } from './db'
import { programs, events, partners, testimonials, trustees, impactMetrics, stories, resources, siteSettings } from './schema'
import { eq, desc, and } from 'drizzle-orm'

export const revalidateTime = {
  short: 60,
  medium: 60 * 5,
  long: 60 * 60,
  day: 60 * 60 * 24,
}

export const getCachedPrograms = unstable_cache(
  async () => {
    return db.select().from(programs).where(eq(programs.isActive, true)).orderBy(programs.displayOrder)
  },
  ['programs'],
  { revalidate: revalidateTime.medium, tags: ['programs'] }
)

export const getCachedEvents = unstable_cache(
  async () => {
    return db.select().from(events).where(eq(events.isActive, true)).orderBy(desc(events.startDate))
  },
  ['events'],
  { revalidate: revalidateTime.medium, tags: ['events'] }
)

export const getCachedPartners = unstable_cache(
  async () => {
    return db.select().from(partners).where(eq(partners.isActive, true)).orderBy(partners.displayOrder)
  },
  ['partners'],
  { revalidate: revalidateTime.long, tags: ['partners'] }
)

export const getCachedTestimonials = unstable_cache(
  async () => {
    return db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(testimonials.displayOrder)
  },
  ['testimonials'],
  { revalidate: revalidateTime.long, tags: ['testimonials'] }
)

export const getCachedTrustees = unstable_cache(
  async () => {
    return db.select().from(trustees).where(eq(trustees.isActive, true)).orderBy(trustees.displayOrder)
  },
  ['trustees'],
  { revalidate: revalidateTime.long, tags: ['trustees'] }
)

export const getCachedImpactMetrics = unstable_cache(
  async () => {
    return db.select().from(impactMetrics).where(eq(impactMetrics.isActive, true)).orderBy(impactMetrics.displayOrder)
  },
  ['impactMetrics'],
  { revalidate: revalidateTime.medium, tags: ['impact'] }
)

export const getCachedStories = unstable_cache(
  async () => {
    return db.select().from(stories).where(eq(stories.isActive, true)).orderBy(desc(stories.publishDate))
  },
  ['stories'],
  { revalidate: revalidateTime.medium, tags: ['stories'] }
)

export const getCachedResources = unstable_cache(
  async () => {
    return db.select().from(resources).where(eq(resources.isActive, true)).orderBy(resources.displayOrder)
  },
  ['resources'],
  { revalidate: revalidateTime.long, tags: ['resources'] }
)

export const getCachedSiteSettings = unstable_cache(
  async () => {
    const settings = await db.select().from(siteSettings)
    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })
    return settingsMap
  },
  ['siteSettings'],
  { revalidate: revalidateTime.medium, tags: ['settings'] }
)

export const getCachedProgramBySlug = unstable_cache(
  async (slug: string) => {
    const result = await db.select().from(programs).where(and(eq(programs.slug, slug), eq(programs.isActive, true))).limit(1)
    return result[0] || null
  },
  ['program-by-slug'],
  { revalidate: revalidateTime.medium, tags: ['programs'] }
)

export const getCachedEventBySlug = unstable_cache(
  async (slug: string) => {
    const result = await db.select().from(events).where(and(eq(events.slug, slug), eq(events.isActive, true))).limit(1)
    return result[0] || null
  },
  ['event-by-slug'],
  { revalidate: revalidateTime.medium, tags: ['events'] }
)

export const getCachedStoryBySlug = unstable_cache(
  async (slug: string) => {
    const result = await db.select().from(stories).where(and(eq(stories.slug, slug), eq(stories.isActive, true))).limit(1)
    return result[0] || null
  },
  ['story-by-slug'],
  { revalidate: revalidateTime.medium, tags: ['stories'] }
)
