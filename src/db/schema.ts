import { 
  pgTable, 
  bigserial,
  numeric, 
  text, 
  timestamp, 
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

export const expenses = pgTable('expenses', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  amount: numeric('amount').notNull(),
  description: text('description'),
  category: text('category'),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
  isRecurring: boolean('is_recurring').default(false),
  paidAt: timestamp('paid_at'),
  dueDate: timestamp('due_date', { withTimezone: true })
});

export const incomes = pgTable('incomes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  source: text('source').notNull(),
  amount: numeric('amount').notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
});

export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;