import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { events, programs, stories, resources, trustees, executiveDirector } from "@/lib/schema"
import { ilike, or, sql, eq } from "drizzle-orm"
export const dynamic = "force-dynamic";

const staticPages = [
  {
    id: "governance",
    title: "Governance & Leadership",
    description: "Learn about AODI's Board of Trustees, Executive Director, and governance structure.",
    keywords: ["governance", "board", "trustees", "leadership", "director", "david", "robert", "executive"],
    type: "page",
    url: "/governance"
  },
  {
    id: "about",
    title: "About AODI",
    description: "Africa of Our Dream Education Initiative - our mission, vision, and story.",
    keywords: ["about", "mission", "vision", "story", "history", "aodi", "africa", "dream", "education", "initiative"],
    type: "page",
    url: "/about"
  },
  {
    id: "impact",
    title: "Our Impact",
    description: "See the measurable difference AODI is making across Africa through mentorship and education.",
    keywords: ["impact", "results", "metrics", "outcomes", "mentees", "scholarships", "countries"],
    type: "page",
    url: "/impact"
  },
  {
    id: "programs",
    title: "Our Programs",
    description: "Explore AODI's leadership, mentorship, and educational programs for young Africans.",
    keywords: ["programs", "mentorship", "leadership", "empowerher", "stem", "education"],
    type: "page",
    url: "/programs"
  },
  {
    id: "get-involved",
    title: "Get Involved",
    description: "Join AODI as a mentor, volunteer, partner, or supporter.",
    keywords: ["get involved", "volunteer", "mentor", "partner", "join", "support", "donate", "help"],
    type: "page",
    url: "/get-involved"
  },
  {
    id: "contact",
    title: "Contact Us",
    description: "Get in touch with AODI for inquiries, partnerships, or support.",
    keywords: ["contact", "email", "phone", "address", "reach", "inquiries"],
    type: "page",
    url: "/contact"
  },
  {
    id: "support",
    title: "Support AODI",
    description: "Donate or contribute to support young African leaders and our educational programs.",
    keywords: ["support", "donate", "donation", "give", "contribute", "fund", "sponsor"],
    type: "page",
    url: "/support"
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "AODI's privacy policy and data protection practices.",
    keywords: ["privacy", "policy", "data", "gdpr", "protection"],
    type: "page",
    url: "/privacy"
  },
  {
    id: "terms",
    title: "Terms of Service",
    description: "Terms and conditions for using AODI's website and services.",
    keywords: ["terms", "conditions", "service", "agreement"],
    type: "page",
    url: "/terms"
  },
  {
    id: "safeguarding",
    title: "Safeguarding Policy",
    description: "AODI's commitment to safeguarding children and vulnerable adults.",
    keywords: ["safeguarding", "child", "protection", "safety", "vulnerable"],
    type: "page",
    url: "/safeguarding"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }
    
    const searchPattern = `%${query}%`
    const queryLower = query.toLowerCase()
    
    const [eventResults, programResults, storyResults, resourceResults, trusteeResults, directorResults] = await Promise.all([
      db.select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.subtitle,
        type: sql<string>`'event'`,
      })
      .from(events)
      .where(
        or(
          ilike(events.title, searchPattern),
          ilike(events.subtitle, searchPattern),
          ilike(events.summary, searchPattern)
        )
      )
      .limit(5),
      
      db.select({
        id: programs.id,
        title: programs.title,
        slug: programs.slug,
        description: programs.summary,
        type: sql<string>`'program'`,
      })
      .from(programs)
      .where(
        or(
          ilike(programs.title, searchPattern),
          ilike(programs.summary, searchPattern),
          ilike(programs.description, searchPattern)
        )
      )
      .limit(5),
      
      db.select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        description: stories.excerpt,
        type: sql<string>`'story'`,
      })
      .from(stories)
      .where(
        or(
          ilike(stories.title, searchPattern),
          ilike(stories.excerpt, searchPattern),
          ilike(stories.body, searchPattern)
        )
      )
      .limit(5),
      
      db.select({
        id: resources.id,
        title: resources.title,
        slug: sql<string>`''`,
        description: resources.description,
        type: sql<string>`'resource'`,
      })
      .from(resources)
      .where(
        or(
          ilike(resources.title, searchPattern),
          ilike(resources.description, searchPattern)
        )
      )
      .limit(5),
      
      db.select({
        id: trustees.id,
        title: trustees.name,
        slug: sql<string>`''`,
        description: trustees.role,
        type: sql<string>`'trustee'`,
      })
      .from(trustees)
      .where(
        or(
          ilike(trustees.name, searchPattern),
          ilike(trustees.role, searchPattern),
          ilike(trustees.bio, searchPattern)
        )
      )
      .limit(5),
      
      db.select({
        id: executiveDirector.id,
        title: executiveDirector.name,
        slug: sql<string>`''`,
        description: executiveDirector.title,
        type: sql<string>`'director'`,
      })
      .from(executiveDirector)
      .where(
        or(
          ilike(executiveDirector.name, searchPattern),
          ilike(executiveDirector.title, searchPattern),
          ilike(executiveDirector.bio, searchPattern)
        )
      )
      .limit(3),
    ])
    
    const staticResults = staticPages
      .filter(page => 
        page.title.toLowerCase().includes(queryLower) ||
        page.description.toLowerCase().includes(queryLower) ||
        page.keywords.some(k => k.toLowerCase().includes(queryLower))
      )
      .slice(0, 3)
      .map(page => ({
        id: page.id,
        title: page.title,
        slug: "",
        description: page.description,
        type: page.type,
        url: page.url
      }))
    
    const results = [
      ...staticResults,
      ...trusteeResults.map(r => ({ ...r, url: `/governance` })),
      ...directorResults.map(r => ({ ...r, url: `/governance` })),
      ...eventResults.map(r => ({ ...r, url: `/events/${r.slug}` })),
      ...programResults.map(r => ({ ...r, url: `/programs/${r.slug}` })),
      ...storyResults.map(r => ({ ...r, url: `/stories/${r.slug}` })),
      ...resourceResults.map(r => ({ ...r, url: `/resources` })),
    ].slice(0, 12)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
