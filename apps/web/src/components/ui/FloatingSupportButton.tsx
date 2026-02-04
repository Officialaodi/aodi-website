'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

export function FloatingSupportButton() {
  return (
    <Link
      href="/support"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-aodi-gold hover:bg-aodi-gold/90 text-aodi-charcoal font-semibold px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      data-testid="button-floating-support"
    >
      <Heart className="h-5 w-5 fill-current" />
      <span>Support Us</span>
    </Link>
  )
}
