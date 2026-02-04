import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Pillar {
  name: string
  description: string
}

interface PillarsProps {
  title: string
  pillars: Pillar[]
}

export function Pillars({ title, pillars }: PillarsProps) {
  return (
    <section className="py-16 md:py-24 bg-soft-grey">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl" data-testid="text-pillars-title">
            {title}
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm" data-testid={`card-pillar-${index}`}>
              <CardHeader>
                <div className="mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-aodi-teal/10 text-aodi-teal font-bold">
                    {index + 1}
                  </span>
                </div>
                <CardTitle className="text-xl text-charcoal">{pillar.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
