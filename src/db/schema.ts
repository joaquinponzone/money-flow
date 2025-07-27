import { 
  pgTable, 
  bigserial,
  numeric, 
  text, 
  timestamp, 
  boolean,
  uuid,
  jsonb,
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

// Push notification subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  expenseReminders: boolean('expense_reminders').default(true),
  budgetAlerts: boolean('budget_alerts').default(true),
  paymentReminders: boolean('payment_reminders').default(true),
  weeklyReports: boolean('weekly_reports').default(false),
  monthlyReports: boolean('monthly_reports').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Notification history
export const notificationHistory = pgTable('notification_history', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull(), // 'expense_reminder', 'budget_alert', 'payment_reminder', 'weekly_report', 'monthly_report'
  data: jsonb('data'), // Additional data for the notification
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
  readAt: timestamp('read_at'),
});

export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type NewNotificationHistory = typeof notificationHistory.$inferInsert;