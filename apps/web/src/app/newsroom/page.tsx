import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Newsroom — AODI',
  description: 'Latest news, press releases, and announcements from Africa of Our Dream Education Initiative.',
}

const newsItems = [
  {
    id: 1,
    title: 'AODI Announces 2026 Global Mentorship Program Applications Now Open',
    excerpt: 'Applications are now being accepted for the 2026 cohort of the Global Mentorship & Leadership Program, with expanded capacity to support 500 mentees.',
    category: 'Press Release',
    date: 'January 15, 2026',
    slug: 'gmp-2026-applications-open',
  },
  {
    id: 2,
    title: 'AODI Partners with Leading African Universities for Campus Ambassador Program',
    excerpt: 'New partnerships with 12 universities across 8 African countries will extend AODI\'s reach to thousands of students.',
    category: 'Partnership',
    date: 'January 8, 2026',
    slug: 'university-partnerships',
  },
  {
    id: 3,
    title: 'Year in Review: 2025 Impact Report Released',
    excerpt: 'Our annual impact report shows significant growth across all programs, with 1,200+ mentees supported and 95% program completion rate.',
    category: 'Report',
    date: 'December 20, 2025',
    slug: '2025-impact-report',
  },
  {
    id: 4,
    title: 'AODI Recognized at Global NGO Excellence Awards',
    excerpt: 'The Africa of Our Dream Education Initiative received the Emerging Impact Award for innovative approaches to youth leadership development.',
    category: 'Award',
    date: 'December 10, 2025',
    slug: 'global-ngo-award',
  },
  {
    id: 5,
    title: 'EmpowerHer Initiative Launches with Founding Cohort of 50 Women Leaders',
    excerpt: 'Our new program focused on women in leadership welcomes its inaugural cohort from 15 African countries.',
    category: 'Program Launch',
    date: 'November 25, 2025',
    slug: 'empowerher-launch',
  },
]

export default function NewsroomPage() {
  return (
    <div className="bg-white">
      <div className="bg-aodi-green py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Newsroom
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Latest news, press releases, and announcements from AODI.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-aodi-charcoal mb-8">Latest News</h2>
            <div className="space-y-8">
              {newsItems.map((item) => (
                <article
                  key={item.id}
                  className="group border-b border-gray-200 pb-8 last:border-0"
                  data-testid={`card-news-${item.id}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-aodi-teal/10 text-aodi-teal">
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-aodi-charcoal group-hover:text-aodi-teal transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-aodi-slate mb-4">
                    {item.excerpt}
                  </p>
                  <span className="text-sm font-medium text-aodi-teal group-hover:text-aodi-green transition-colors cursor-pointer">
                    Read more &rarr;
                  </span>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="bg-aodi-softgrey rounded-lg p-6">
                <h3 className="text-lg font-semibold text-aodi-charcoal mb-4">Media Contact</h3>
                <p className="text-sm text-aodi-slate mb-4">
                  For press inquiries, interviews, or media resources:
                </p>
                <a
                  href="mailto:press@africaofourdreaminitiative.org"
                  className="text-sm font-medium text-aodi-teal hover:text-aodi-green transition-colors"
                >
                  press@africaofourdreaminitiative.org
                </a>
              </div>

              <div className="bg-aodi-softgrey rounded-lg p-6">
                <h3 className="text-lg font-semibold text-aodi-charcoal mb-4">Press Kit</h3>
                <p className="text-sm text-aodi-slate mb-4">
                  Download our press kit including logos, brand guidelines, and key facts.
                </p>
                <button
                  className="text-sm font-medium text-aodi-teal hover:text-aodi-green transition-colors"
                  data-testid="button-download-press-kit"
                >
                  Download Press Kit &darr;
                </button>
              </div>

              <div className="bg-aodi-green rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                <p className="text-sm text-white/80 mb-4">
                  Subscribe to our newsletter for the latest news and updates.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-aodi-gold text-aodi-green rounded hover:bg-aodi-gold/90 transition-colors"
                  data-testid="button-subscribe-news"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
