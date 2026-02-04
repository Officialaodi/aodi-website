import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { getCachedImpactMetrics, getCachedTestimonials } from '@/lib/cache'
import { Users, GraduationCap, Globe, Handshake, Award, TrendingUp, Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Impact | Africa of Our Dream Education Initiative (AODI)',
  description: 'Measured impact across education, leadership, and access. See AODI\'s reach, delivery, and outcomes since inception.',
}

export const revalidate = 300

const categoryIcons: Record<string, React.ReactNode> = {
  "Beneficiaries & Reach": <Users className="w-6 h-6" />,
  "Education & Capacity Building": <GraduationCap className="w-6 h-6" />,
  "Mentorship & Career Advancement": <TrendingUp className="w-6 h-6" />,
  "Programs & Partnerships": <Handshake className="w-6 h-6" />,
}

const categoryDescriptions: Record<string, string> = {
  "Beneficiaries & Reach": "These figures reflect AODI's commitment to equitable access and pan-African reach.",
  "Education & Capacity Building": "These activities form the foundation of AODI's education-to-leadership pipeline.",
  "Mentorship & Career Advancement": "Outcome indicators are based on structured program feedback and post-engagement follow-up.",
  "Programs & Partnerships": "Partnerships play a critical role in scaling delivery, strengthening governance, and extending reach.",
}

type MetricItem = {
  label: string
  value: string
  description?: string | null
}

type MetricsData = Record<string, MetricItem[]>

const defaultMetrics: MetricsData = {
  "Beneficiaries & Reach": [
    { label: "Young People Reached", value: "27,000+", description: "Individuals reached through AODI programs, workshops, mentorship, and outreach initiatives" },
    { label: "Nigerian States Represented", value: "10+", description: "Geographic spread of beneficiaries across Nigeria" },
    { label: "African Countries Represented", value: "13", description: "African countries represented across AODI activities" },
    { label: "Underserved Backgrounds", value: "40%+", description: "Proportion of beneficiaries from underserved or low-income backgrounds" },
  ],
  "Education & Capacity Building": [
    { label: "Students Trained (STEM)", value: "5,000+", description: "Students trained through STEM workshops, lectures, and bootcamps" },
    { label: "Students Supported (Mentorship)", value: "1,000+", description: "Participants supported through structured mentorship programs" },
    { label: "Cambridge Outreach Participants", value: "5,900+", description: "Participants reached through the Higher Education & Accessibility Cambridge Outreach" },
  ],
  "Mentorship & Career Advancement": [
    { label: "Global Mentors Engaged", value: "400+", description: "Mentors engaged across academia and industry" },
    { label: "Positive Program Outcomes", value: "70%+", description: "GMP mentees reporting improved academic clarity, career direction, or scholarship readiness" },
    { label: "Progression Outcomes", value: "50+", description: "Mentees securing scholarships, internships, or academic placements" },
  ],
  "Programs & Partnerships": [
    { label: "Flagship Programs Delivered", value: "5+", description: "Core leadership, mentorship, and access initiatives delivered" },
    { label: "Institutional Partners", value: "15+", description: "Strategic and institutional partners engaged" },
  ],
}

const programs = [
  { name: "Global Mentorship Program (GMP)", description: "Structured mentorship connecting high-potential students with global professionals" },
  { name: "Campus Ambassadors Program (CAP)", description: "University-based leadership and community engagement" },
  { name: "EmpowerHer Initiative", description: "Women-focused leadership and empowerment programs" },
  { name: "STEM Education Workshops", description: "Technical training and capacity building in science and technology" },
  { name: "Higher Education & Accessibility Outreach", description: "Cambridge partnership for higher education access" },
]

async function getMetrics(): Promise<MetricsData> {
  try {
    const metrics = await getCachedImpactMetrics()

    if (metrics.length === 0) {
      return defaultMetrics
    }

    const grouped = metrics.reduce((acc: MetricsData, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = []
      }
      acc[metric.category].push({
        label: metric.label,
        value: metric.value,
        description: metric.description
      })
      return acc
    }, {})

    return grouped
  } catch {
    return defaultMetrics
  }
}

async function getTestimonials() {
  try {
    return getCachedTestimonials()
  } catch {
    return []
  }
}

export default async function ImpactPage() {
  const metricsData = await getMetrics()
  const testimonialsList = await getTestimonials()
  const categories = ["Beneficiaries & Reach", "Education & Capacity Building", "Mentorship & Career Advancement", "Programs & Partnerships"]

  return (
    <>
      <SimpleHero
        headline="Measured Impact Across Education, Leadership, and Access"
        subheadline=""
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-lg text-slate leading-relaxed" data-testid="text-impact-intro">
            Africa of Our Dream Education Initiative (AODI) measures impact across reach, delivery, and outcomes.
            Our work focuses on identifying high-potential talent early, building leadership and academic capacity, 
            and expanding access to opportunity through structured programs and partnerships.
          </p>
          <p className="mt-4 text-slate leading-relaxed">
            All figures below are reported since inception and reflect cumulative delivery across programs and regions.
          </p>
        </div>
      </section>

      {categories.map((category, idx) => {
        const metrics = metricsData[category] || []
        const isAlternate = idx % 2 === 1

        return (
          <section 
            key={category} 
            className={`py-12 md:py-16 ${isAlternate ? 'bg-soft-grey' : 'bg-white'}`}
            data-testid={`section-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-aodi-teal/10 text-aodi-teal">
                  {categoryIcons[category]}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal" data-testid={`text-category-${idx}`}>
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {metrics.map((metric: MetricItem, mIdx: number) => (
                  <div 
                    key={mIdx}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                    data-testid={`metric-${category.toLowerCase().replace(/\s+/g, '-')}-${mIdx}`}
                  >
                    <p className="text-3xl md:text-4xl font-bold text-aodi-green mb-2">
                      {metric.value}
                    </p>
                    <p className="text-charcoal font-medium mb-2">{metric.label}</p>
                    {metric.description && (
                      <p className="text-sm text-slate">{metric.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-slate italic" data-testid={`text-category-context-${idx}`}>
                {categoryDescriptions[category]}
              </p>
            </div>
          </section>
        )
      })}

      <section className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-aodi-gold/10 text-aodi-gold">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal" data-testid="text-programs-header">
              Programs & Initiatives Delivered
            </h2>
          </div>

          <p className="text-slate mb-8">
            AODI delivers impact through structured programs, including:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {programs.map((program, idx) => (
              <div 
                key={idx}
                className="bg-soft-grey rounded-lg p-6"
                data-testid={`program-${idx}`}
              >
                <h3 className="font-semibold text-charcoal mb-2">{program.name}</h3>
                <p className="text-sm text-slate">{program.description}</p>
              </div>
            ))}
          </div>

          <p className="text-slate italic">
            Each program is designed to address specific transition points across secondary education, university, and early career stages.
          </p>
        </div>
      </section>

      {testimonialsList.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-aodi-gold/10 text-aodi-gold">
                <Quote className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal" data-testid="text-testimonials-header">
                Voices from Our Community
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonialsList.map((testimonial, idx) => (
                <div 
                  key={testimonial.id}
                  className="bg-soft-grey rounded-lg p-6 md:p-8"
                  data-testid={`testimonial-${idx}`}
                >
                  <Quote className="w-8 h-8 text-aodi-teal/30 mb-4" />
                  <blockquote className="text-charcoal mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-4">
                    {testimonial.photoUrl ? (
                      <img 
                        src={testimonial.photoUrl} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-aodi-teal/20 flex items-center justify-center">
                        <span className="text-aodi-teal font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-charcoal">{testimonial.name}</p>
                      <p className="text-sm text-slate">{testimonial.role}</p>
                      <p className="text-sm text-aodi-teal">{testimonial.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 bg-aodi-green">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white" data-testid="text-measurement-header">
            How We Measure Impact
          </h2>
          <p className="text-lg leading-relaxed text-white/90" data-testid="text-measurement-content">
            AODI combines quantitative tracking (reach, participation, progression) with qualitative feedback 
            from beneficiaries, mentors, and partners. Outcome indicators are reported conservatively and 
            reflect verified program engagement and self-reported progress, ensuring transparency and credibility.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-soft-grey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-aodi-teal/10 text-aodi-teal">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal" data-testid="text-partnerships-header">
              Partnerships & Institutional Engagement
            </h2>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 max-w-md">
            <p className="text-4xl font-bold text-aodi-green mb-2">15+</p>
            <p className="text-charcoal font-medium mb-2">Institutional Partners</p>
            <p className="text-sm text-slate">
              Strategic and institutional partners engaged across education, development, and leadership ecosystems
            </p>
          </div>

          <p className="text-slate italic mt-8">
            Partnerships play a critical role in scaling delivery, strengthening governance, and extending reach.
          </p>

          <p className="text-sm text-slate mt-8">
            Partner logos will be displayed here once partnerships are formalized and consent is obtained.
          </p>
        </div>
      </section>
    </>
  )
}
