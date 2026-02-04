import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { stories } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SafeHtml } from '@/components/ui/safe-html'

export const dynamic = 'force-dynamic'

async function getStory(slug: string) {
  const story = await db
    .select()
    .from(stories)
    .where(and(eq(stories.slug, slug), eq(stories.isActive, true)))
    .limit(1)
  
  return story[0] || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    return {
      title: 'Story Not Found | AODI',
    }
  }
  
  return {
    title: `${story.title} | Africa of Our Dream Education Initiative (AODI)`,
    description: story.excerpt,
  }
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await getStory(slug)

  if (!story) {
    notFound()
  }

  return (
    <div className="bg-white">
      <div className="bg-aodi-green py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Link href="/stories" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              {story.category}
            </span>
            <span className="text-white/80">
              {story.publishDate ? new Date(story.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </span>
            {story.isFeatured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-aodi-gold text-charcoal">
                Featured
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {story.title}
          </h1>
          
          <p className="mt-6 text-lg text-white/80">
            {story.excerpt}
          </p>
        </div>
      </div>

      {story.featuredImage && (
        <div className="mx-auto max-w-4xl px-6 lg:px-8 -mt-8">
          <img 
            src={story.featuredImage} 
            alt={story.title} 
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      <article className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <SafeHtml 
          html={story.body}
          className="prose prose-lg max-w-none prose-headings:text-charcoal prose-p:text-slate prose-a:text-aodi-teal"
        />
        
        {story.tags && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-slate mb-3">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {story.tags.split(',').map((tag, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-soft-grey text-charcoal"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      <section className="bg-soft-grey py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">
            Inspired by this story?
          </h2>
          <p className="text-slate mb-8">
            Join AODI and become part of the next generation of African leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved/mentee">
              <Button variant="default" size="lg">
                Apply as Mentee
              </Button>
            </Link>
            <Link href="/get-involved/mentor">
              <Button variant="outline" size="lg">
                Become a Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
