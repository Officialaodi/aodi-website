import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken, getUserWithPermissions } from "@/lib/admin-auth"

 export const runtime = 'edge';

export async function GET() {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  
  if (!adminSession) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const payload = verifySignedToken(adminSession.value, sessionSecret)
  
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const user = await getUserWithPermissions(payload.userId)
  
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ 
    authenticated: true,
    user
  })
}
