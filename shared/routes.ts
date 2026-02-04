import { z } from 'zod';
import { insertApplicationSchema, programs, impactMetrics, testimonials } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  programs: {
    list: {
      method: 'GET' as const,
      path: '/api/programs',
      responses: {
        200: z.array(z.custom<typeof programs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/programs/:slug',
      responses: {
        200: z.custom<typeof programs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.object({ success: z.boolean(), id: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
  content: {
    metrics: {
      method: 'GET' as const,
      path: '/api/content/metrics',
      responses: {
        200: z.array(z.custom<typeof impactMetrics.$inferSelect>()),
      },
    },
    testimonials: {
      method: 'GET' as const,
      path: '/api/content/testimonials',
      responses: {
        200: z.array(z.custom<typeof testimonials.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
