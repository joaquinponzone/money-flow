import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, decimal } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow()
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id).notNull(),
  paidAt: timestamp('paid_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow()
});