import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';

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
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const expensePayments = pgTable('expense_payments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  expenseId: text('expense_id').references(() => expenses.id).notNull(),
  paymentId: text('payment_id').references(() => payments.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp('paid_at').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow()
});