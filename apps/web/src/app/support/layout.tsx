import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Support AODI's Work | Africa of Our Dream Education Initiative",
  description: "Support AODI's mission to build leadership capacity and expand access to opportunity across Africa. Make a contribution via Paystack or PayPal.",
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
