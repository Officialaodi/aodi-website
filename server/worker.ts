import { Hono } from "hono";
import { logger } from "hono/logger";
import { createMiddleware } from "hono/factory";
import {cors} from "hono/cors";
import {serve} from "@hono/node-server";
import { serveStatic } from '@hono/node-server/serve-static'
import { registerRoutes } from "./route";
import dotenv from "dotenv";
import path from "path";
// import { Bindings } from "hono/types";

dotenv.config();

const app = new Hono<any>();

app.use(cors())

// app.use(
//   '/assets/*',
//   serveStatic({
//     root: path.join(__dirname, '../client/public'),
//     rewriteRequestPath: (path) => path.replace(/^\/assets/, ''),
//   })
// );


// app.get('/', async (c) => {
//   return c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url)))
// })

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
app.use("/api/*", rawBodyMiddleware);
// Register API routes
registerRoutes(app);

app.get('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})



serve(app)


export default {
  fetch: app.fetch,
};