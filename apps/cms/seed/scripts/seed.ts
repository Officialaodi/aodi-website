/**
 * Strapi Seed Script (starter)
 * Copy into your Strapi project, e.g.:
 *   apps/cms/src/index.ts (Strapi v5) or apps/cms/src/bootstrap.ts (Strapi v4)
 * and call runSeed(strapi) when SEED=true.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

type Strapi = any;

const DATA_DIR = resolve(process.cwd(), "seed", "data");

function readJson(file: string) {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
}

async function upsertByUnique(strapi: Strapi, uid: string, where: any, data: any) {
  const existing = await strapi.entityService.findMany(uid, { filters: where, limit: 1 });
  if (existing?.length) return strapi.entityService.update(uid, existing[0].id, { data });
  return strapi.entityService.create(uid, { data });
}

export async function runSeed(strapi: Strapi) {
  const UID_PAGE = "api::page.page";
  const UID_PROGRAM = "api::program.program";
  const UID_METRIC = "api::impact-metric.impact-metric";
  const UID_TESTIMONIAL = "api::testimonial.testimonial";
  const UID_PARTNER = "api::partner.partner";

  const pages = readJson("pages.json");
  const programs = readJson("programs.json");
  const metrics = readJson("impact-metrics.json");
  const testimonials = readJson("testimonials.json");
  const partners = readJson("partners.json");

  const programIdBySlug: Record<string, number> = {};

  for (const p of programs) {
    const created = await upsertByUnique(strapi, UID_PROGRAM, { slug: p.slug }, p);
    programIdBySlug[p.slug] = created.id;
  }

  for (const pg of pages) {
    await upsertByUnique(strapi, UID_PAGE, { slug: pg.slug }, pg);
  }

  for (const m of metrics) {
    await upsertByUnique(strapi, UID_METRIC, { slug: m.slug }, m);
  }

  for (const pr of partners) {
    await strapi.entityService.create(UID_PARTNER, { data: pr });
  }

  for (const t of testimonials) {
    const programId = programIdBySlug[t.programSlug];
    const payload: any = { ...t };
    delete payload.programSlug;
    if (programId) payload.program = programId;
    await strapi.entityService.create(UID_TESTIMONIAL, { data: payload });
  }

  strapi.log.info("✅ Seed completed");
}
