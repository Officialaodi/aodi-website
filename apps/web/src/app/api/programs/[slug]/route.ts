import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { programs } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const program = await db
      .select()
      .from(programs)
      .where(and(eq(programs.slug, slug), eq(programs.isActive, true)))
      .limit(1)

    if (program.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const formattedProgram = {
      ...program[0],
      steps: program[0].steps ? JSON.parse(program[0].steps) : null,
      benefits: program[0].benefits ? JSON.parse(program[0].benefits) : null,
      eligibility: program[0].eligibility ? JSON.parse(program[0].eligibility) : null,
      faqs: program[0].faqs ? JSON.parse(program[0].faqs) : null,
    }

    return NextResponse.json(formattedProgram)
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 })
  }
}
