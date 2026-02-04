# AODI Strapi Seed Pack (MVP)

This pack provides starter content for:
- Pages (Home, About, Programs, Impact, Partners, Get Involved, Governance, Policies, Contact)
- Programs (Global Mentorship & Leadership + EmpowerHer + Campus Ambassador)
- Impact Metrics (placeholders)
- Testimonials (placeholders; consentFlag=false)
- Partners (placeholders)

## How to use
Strapi doesn't offer a universal one-click JSON import for dynamic zones + relations in every setup.
Recommended: implement a small bootstrap seed script that reads `/seed/data/*.json` and upserts.

### Included
- `data/*.json` content
- `scripts/seed.ts` starter bootstrap seed script

## Notes
- Media fields are intentionally empty. Upload images in Strapi Media Library and attach them.
- Replace placeholder metrics and testimonials (and set consentFlag=true) before public launch.
