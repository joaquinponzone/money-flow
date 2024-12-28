import type { Config } from 'drizzle-kit';

const config = {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME!,
    ssl: {
      rejectUnauthorized: false
    }
  },
} satisfies Config;

export default config;