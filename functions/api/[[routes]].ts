import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createMiddleware } from 'hono/factory'
import { registerRoutes } from '../../server/route'
import { getDb } from '../../server/db'
import { DatabaseStorage } from '../../server/storage'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Raw body middleware (your existing logic)
const rawBodyMiddleware = createMiddleware(async (c, next) => {
  const raw = await c.req.text()

  c.set('rawBody', raw)

  try {
    const json = JSON.parse(raw)
    c.set('jsonBody', json)
  } catch {}

  await next()
})

// Apply ONLY to API routes
app.use('/api/*', rawBodyMiddleware)

// Your routes


// 🔥 THIS connects Hono to Cloudflare
export const onRequest = (context: any) => {
  const db = getDb(context.env);
  const storage = new DatabaseStorage(db);
  registerRoutes(app, storage)
  return app.fetch(context.request)
}