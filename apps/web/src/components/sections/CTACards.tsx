import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CTACard {
  title: string
  description: string
  buttonText: string
  url: string
}

interface CTACardsProps {
  cards: CTACard[]
}

export function CTACards({ cards }: CTACardsProps) {
  return (
    <section className="py-16 md:py-24 bg-soft-grey">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Join Our Mission
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-cta-${index}`}>
              <CardHeader>
                <CardTitle className="text-xl text-charcoal">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate mb-6">
                  {card.description}
                </CardDescription>
                <Link href={card.url} data-testid={`link-cta-card-${index}`}>
                  <Button className="w-full" variant="default">
                    {card.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
