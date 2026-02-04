import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Volunteer with AODI | Africa of Our Dream Education Initiative',
  description: 'Apply to volunteer with AODI and support program delivery, operations, and community engagement.',
}

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
