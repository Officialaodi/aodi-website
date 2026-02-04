interface Metric {
  label: string
  value: string
  unit?: string
}

interface ImpactSnapshotProps {
  title: string
  metrics: Metric[]
}

export function ImpactSnapshot({ title, metrics }: ImpactSnapshotProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl" data-testid="text-impact-title">
            {title}
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center" data-testid={`metric-${index}`}>
              <div className="text-4xl font-bold text-aodi-gold" data-testid={`text-metric-value-${index}`}>
                {metric.value}
              </div>
              <div className="mt-2 text-sm font-medium text-charcoal" data-testid={`text-metric-label-${index}`}>
                {metric.label}
              </div>
              {metric.unit && (
                <div className="text-xs text-slate">{metric.unit}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
