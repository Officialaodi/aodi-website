import { Hero } from '@/components/sections/Hero'
import { TrustStrip } from '@/components/sections/TrustStrip'
import { ProblemStatement } from '@/components/sections/ProblemStatement'
import { Pillars } from '@/components/sections/Pillars'
import { FeaturedProgram } from '@/components/sections/FeaturedProgram'
import { InitiativeScope } from '@/components/sections/InitiativeScope'
import { ImpactSnapshot } from '@/components/sections/ImpactSnapshot'
import { GovernanceBlock } from '@/components/sections/GovernanceBlock'
import { CTACards } from '@/components/sections/CTACards'
import { ClosingStatement } from '@/components/sections/ClosingStatement'

export default function HomePage() {
  return (
    <>
      <Hero
        headline="Building Africa's Next Generation of Leaders"
        subheadline="Africa of Our Dream Education Initiative (AODI) is a globally governed leadership and talent development institution, supporting high-potential students and early-career professionals across Africa through structured programs, mentorship, and institutional partnerships."
        ctaPrimaryText="Partner with AODI"
        ctaPrimaryUrl="/get-involved/partner"
        ctaSecondaryText="Join as a Mentor"
        ctaSecondaryUrl="/get-involved/mentor"
      />

      <TrustStrip
        items={[
          "UK-governed",
          "Africa-focused",
          "Outcome-driven programs",
          "Institutional partnerships"
        ]}
      />

      <ProblemStatement
        title="Africa's Talent Is Abundant. Opportunity Is Not."
        body="Across Africa, millions of talented young people demonstrate exceptional potential — yet lack access to mentorship, leadership development, global networks, and structured pathways into academia, entrepreneurship, and high-impact careers.

The challenge is not ambition. It is access, structure, and exposure.

AODI exists to close this gap — systematically and at scale."
      />

      <Pillars
        title="A Leadership & Talent Development Model Built for Impact"
        pillars={[
          {
            name: "Leadership & Talent Development",
            description: "We design structured programs that build leadership capacity, career clarity, and professional confidence at critical transition points — from secondary school through university and into early careers."
          },
          {
            name: "Global Mentorship & Capability Building",
            description: "Through carefully matched mentors, workshops, and targeted initiatives, participants gain guidance, skills, and perspective from experienced leaders across academia, industry, and the diaspora."
          },
          {
            name: "Institutional Partnerships & Exposure",
            description: "We collaborate with schools, universities, NGOs, and foundations to expand access, deliver high-quality programs, and connect participants to global opportunities."
          }
        ]}
      />

      <FeaturedProgram
        title="Global Mentorship & Leadership Program"
        bullets={[
          "Structured mentorship and guidance",
          "Leadership and professional development support",
          "Exposure to global academic and professional pathways",
          "A values-driven community focused on long-term impact"
        ]}
        ctaText="Explore the Program"
        ctaUrl="/programs/global-mentorship-leadership"
      />

      <InitiativeScope
        title="Supporting Talent Across the Education-to-Leadership Journey"
        bullets={[
          "Campus-based engagement and ambassador programs",
          "Women-focused leadership and empowerment initiatives",
          "Youth and secondary-school access programs",
          "Conferences, workshops, and entrepreneurial initiatives"
        ]}
        closingLine="Each initiative serves a single purpose: to identify talent early, develop leadership capacity, and unlock access to opportunity."
      />

      <ImpactSnapshot
        title="Measured Progress. Real Outcomes."
        metrics={[
          { label: "Young People Reached", value: "27,000+" },
          { label: "African Countries", value: "13" },
          { label: "Mentees Supported", value: "1,000+" },
          { label: "Global Mentors", value: "400+" },
          { label: "Flagship Programs", value: "5+" },
          { label: "Institutional Partners", value: "15+" }
        ]}
      />

      <GovernanceBlock
        title="Globally Governed. Africa Focused."
        body="AODI operates with governance and coordination based in the United Kingdom, delivering programs across Africa in partnership with trusted institutions and community stakeholders."
        bullets={[
          "Accountability and transparency",
          "Safeguarding and ethical practice",
          "Measurable outcomes and continuous improvement"
        ]}
      />

      <CTACards
        cards={[
          {
            title: "Partners & Donors",
            description: "Collaborate with AODI to support scalable, high-impact leadership and talent development initiatives.",
            buttonText: "Partner with AODI",
            url: "/get-involved/partner"
          },
          {
            title: "Mentors",
            description: "Contribute your experience and perspective to guide the next generation of African leaders.",
            buttonText: "Join as a Mentor",
            url: "/get-involved/mentor"
          },
          {
            title: "Mentees",
            description: "Access structured programs designed to support your growth, clarity, and leadership potential.",
            buttonText: "Apply as a Mentee",
            url: "/get-involved/mentee"
          },
          {
            title: "Volunteers",
            description: "Support program delivery, operations, and community engagement.",
            buttonText: "Volunteer with Us",
            url: "/get-involved/volunteer"
          }
        ]}
      />

      <ClosingStatement
        title="Investing in People. Unlocking Potential. Shaping the Future."
        body="Africa's future depends on the leadership capacity of its people.

At AODI, we are committed to building that capacity — deliberately, inclusively, and with lasting impact."
      />
    </>
  )
}
