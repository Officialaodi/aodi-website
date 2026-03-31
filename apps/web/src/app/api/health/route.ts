import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

 export const runtime = 'edge';

export async function GET() {
  try {
    const dbCheck = await db.execute(sql`SELECT 1`)
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        web: 'running'
      },
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        web: 'running'
      },
      error: 'Database connection failed'
    }, { status: 503 })
  }
}
