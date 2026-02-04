import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { programs } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const allPrograms = await db
      .select()
      .from(programs)
      .where(eq(programs.isActive, true))
      .orderBy(asc(programs.displayOrder))

    const formattedPrograms = allPrograms.map((program) => ({
      ...program,
      steps: program.steps ? JSON.parse(program.steps) : null,
      benefits: program.benefits ? JSON.parse(program.benefits) : null,
      eligibility: program.eligibility ? JSON.parse(program.eligibility) : null,
      faqs: program.faqs ? JSON.parse(program.faqs) : null,
    }))

    return NextResponse.json(formattedPrograms)
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}
