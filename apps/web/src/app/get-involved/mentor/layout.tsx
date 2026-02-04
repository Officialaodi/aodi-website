import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Mentor | Africa of Our Dream Education Initiative (AODI)',
  description: 'Apply to become an AODI mentor and guide the next generation of African leaders.',
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
