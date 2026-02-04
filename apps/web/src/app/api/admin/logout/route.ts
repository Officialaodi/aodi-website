import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auditLog } from "@/lib/audit-log"

export async function POST() {
  await auditLog({
    entityType: "session",
    action: "logout",
    details: "User logged out",
  })

  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return NextResponse.json({ success: true })
}
