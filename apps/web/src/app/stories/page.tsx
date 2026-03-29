import type { Metadata } from 'next'
import Link from 'next/link'
import { getCachedStories } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Stories | Africa of Our Dream Education Initiative (AODI)',
  description: 'Read inspiring stories from AODI mentees, mentors, and alumni who are transforming Africa through leadership and talent development.',
}

export const revalidate = 300
export const dynamic = 'force-dynamic';

async function getStories() {
  return getCachedStories()
}

export default async function StoriesPage() {
  const storiesList = await getStories()

  return (
    <div className="bg-white">
      <div className="bg-aodi-green py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Stories
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Inspiring journeys from our community of mentees, mentors, and partners who are building Africa&apos;s future together.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {storiesList.map((story) => (
            <Link href={`/stories/${story.slug}`} key={story.id}>
              <article
                className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow h-full"
                data-testid={`card-story-${story.id}`}
              >
                <div className="h-48 bg-aodi-teal/10 flex items-center justify-center">
                  {story.featuredImage ? (
                    <img src={story.featuredImage} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-aodi-teal/40 text-6xl font-bold">{story.id}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-aodi-gold/20 text-aodi-green">
                        {story.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {story.publishDate ? new Date(story.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                      </span>
                      {story.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-aodi-green text-white">
                          Featured
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-aodi-charcoal group-hover:text-aodi-teal transition-colors">
                      {story.title}
                    </h2>
                    <p className="mt-3 text-sm text-aodi-slate line-clamp-3">
                      {story.excerpt}
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="text-sm font-medium text-aodi-teal group-hover:text-aodi-green transition-colors">
                      Read full story &rarr;
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {storiesList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-aodi-slate">No stories available yet. Check back soon!</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-aodi-slate mb-6">
            Have a story to share? We&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-aodi-green hover:bg-aodi-green/90 transition-colors"
            data-testid="button-share-story"
          >
            Share Your Story
          </Link>
        </div>
      </div>
    </div>
  )
}
