'use server'

import { cache } from 'react'
import { db } from '@/db'
import { expenses, categories } from '@/db/schema'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'


interface Expense {
  id: string;
  name: string;
  amount: string;
  dueDate: Date;
  description: string | null;
  categoryId: string;
  paidAt: Date | null;
  note: string | null;
  createdAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface UpcomingExpense {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  categoryId: string;
  daysUntilDue: number;
}

export const getExpenses = cache(async (): Promise<Expense[]> => {
  const data = await db.select().from(expenses).orderBy(desc(expenses.amount));
  return data.map(expense => ({
    ...expense,
    amount: expense.amount.toString()
  }));
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const data = await db.select().from(categories);
  return data.map(category => ({
    id: category.id,
    name: category.name
  }));
});

export const getExpensesByCategory = cache(async () => {
  const data = await db
    .select({
      name: categories.name,
      value: sql<number>`sum(${expenses.amount})`,
      expenses: sql`json_agg(json_build_object(
        'id', ${expenses.id},
        'name', ${expenses.name}, 
        'amount', ${expenses.amount},
        'dueDate', ${expenses.dueDate},
        'description', ${expenses.description}
      ))`
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .groupBy(categories.name);

  return data.map(category => ({
    name: category.name,
    value: Number(category.value),
    expenses: category.expenses as Array<{
      id: string;
      name: string;
      amount: number;
      dueDate: Date;
      description: string | null;
    }>
  }));
});

export const getUpcomingExpenses = cache(async (): Promise<UpcomingExpense[]> => {
  const today = toUTCMidnight(new Date());
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);

  const data = await db
    .select()
    .from(expenses)
    .where(
      and(
        gte(expenses.dueDate, today),
        lte(expenses.dueDate, tenDaysFromNow)
      )
    )
    .orderBy(asc(expenses.dueDate));

  return data.map(expense => {
    const daysUntilDue = Math.ceil((expense.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: expense.id,
      name: expense.name,
      amount: expense.amount.toString(),
      dueDate: format(expense.dueDate, 'dd/MM/yyyy'),
      categoryId: expense.categoryId,
      daysUntilDue
    };
  });
});

export const getExpenseById = cache(async (id: string): Promise<Expense | null> => {
  const results = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, id))
    .limit(1);
  
  if (!results[0]) return null;
  
  return {
    ...results[0],
    amount: results[0].amount.toString()
  };
});

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const dueDate = toUTCMidnight(new Date(expense.dueDate));
  
  const [insertedExpense] = await db.insert(expenses).values({
    name: expense.name,
    amount: expense.amount,
    dueDate,
    description: expense.description,
    categoryId: expense.categoryId,
    paidAt: expense.paidAt,
    note: expense.note
  }).returning();

  revalidatePath('/')

  return {
    ...insertedExpense,
    amount: insertedExpense.amount.toString()
  };
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const { id, ...updateData } = expense;
  const dueDate = toUTCMidnight(new Date(updateData.dueDate));

  const [updatedExpense] = await db.update(expenses)
    .set({
      ...updateData,
      dueDate
    })
    .where(eq(expenses.id, id))
    .returning();

  revalidatePath('/')

  return {
    ...updatedExpense,
    amount: updatedExpense.amount.toString()
  };
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await db.delete(expenses)
      .where(eq(expenses.id, id))

    revalidatePath('/')
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw new Error('Failed to delete expense')
  }
}

export async function getPayments() {
  try {
    return db.select().from(expenses);
  } catch (error) {
    console.error('Error getting payments:', error)
    throw new Error('Failed to get payments')
  }
}

function toUTCMidnight(date: Date): Date {
  const utcDate = new Date(date.toUTCString());
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}