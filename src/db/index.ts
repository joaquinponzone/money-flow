import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Connection with SSL configuration
const client = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false
  }
})

export const db = drizzle(client, { schema })