import { Hono } from "hono";
import { logger } from "hono/logger";
import { createMiddleware } from "hono/factory";
import {cors} from "hono/cors";
import {serve} from "@hono/node-server";
import { serveStatic } from '@hono/node-server/serve-static'
import { registerRoutes } from "./route";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

app.use(cors())

app.use('/assets/*', serveStatic({ root: './client' }))

const serveIndex = serveStatic({ path: './client/index.html' })
app.get('/', serveIndex)

const rawBodyMiddleware = createMiddleware(async (c, next) => {

  const raw = await c.req.text();   // read raw body

  // store raw body
  c.set("rawBody", raw);

  // also store parsed JSON if possible
  try {
    const json = JSON.parse(raw);
    c.set("jsonBody", json);
  } catch {
    // not JSON
  }

  await next();
});

// Logger middleware
app.use(logger());
// Raw body middleware
app.use("*", rawBodyMiddleware);



// Register API routes
registerRoutes(app);
serve(app)


export default {
  fetch: app.fetch,
};