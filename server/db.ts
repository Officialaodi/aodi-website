// import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/neon-http";
// import pg from "pg";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pg;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool, { schema });

export function getDb(env: any) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}
