interface TrustStripProps {
  items: string[]
}

export function TrustStrip({ items }: TrustStripProps) {
  return (
    <section className="bg-soft-grey py-4 border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-aodi-teal" />
              <span className="text-sm font-medium text-charcoal" data-testid={`text-trust-item-${index}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
