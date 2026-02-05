import type { Metadata } from 'next'
import Link from 'next/link'
import { getCachedStories } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Newsroom — AODI',
  description: 'Latest news, press releases, and announcements from Africa of Our Dream Education Initiative.',
}

export const revalidate = 300

async function getNewsItems() {
  return getCachedStories()
}

export default async function NewsroomPage() {
  const newsItems = await getNewsItems()

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
            {newsItems.length === 0 ? (
              <p className="text-center py-12 text-aodi-slate">No news articles available yet. Check back soon!</p>
            ) : (
              <div className="space-y-8">
                {newsItems.map((item) => (
                  <Link href={`/stories/${item.slug}`} key={item.id}>
                    <article
                      className="group border-b border-gray-200 pb-8 last:border-0"
                      data-testid={`card-news-${item.id}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-aodi-teal/10 text-aodi-teal">
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.publishDate ? new Date(item.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </span>
                        {item.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-aodi-green text-white">
                            Featured
                          </span>
                        )}
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
                  </Link>
                ))}
              </div>
            )}
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
