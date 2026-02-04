interface ClosingStatementProps {
  title: string
  body: string
}

export function ClosingStatement({ title, body }: ClosingStatementProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl" data-testid="text-closing-title">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate whitespace-pre-line" data-testid="text-closing-body">
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
