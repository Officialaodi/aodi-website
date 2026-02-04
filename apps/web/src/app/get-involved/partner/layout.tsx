import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with AODI | Africa of Our Dream Education Initiative',
  description: 'Submit your partnership inquiry to collaborate with AODI on leadership and talent development initiatives.',
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
