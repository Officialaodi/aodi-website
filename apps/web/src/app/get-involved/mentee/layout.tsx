import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply as a Mentee | Africa of Our Dream Education Initiative (AODI)',
  description: 'Apply to join AODI\'s mentorship programs and access leadership development opportunities.',
}

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
