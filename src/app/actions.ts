'use server'

import { cache } from 'react'
import { db } from '@/db'
import { expenses, incomes } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { Expense, NewExpense } from '@/types/expense'
import { Income, NewIncome } from '@/types/income'
import { getUserSession } from '@/lib/session'

export const getExpenses = cache(async (): Promise<Expense[]> => {
  const user = await getUserSession()
  if (!user) return []

  const expensesResponse = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, user.id))
    .orderBy(desc(expenses.dueDate))
  
  return expensesResponse
})

export const getExpensesByCategory = cache(async () => {
  const data = await db
    .select({
      name: expenses.category,
      value: sql<number>`sum(${expenses.amount})`,
      expenses: sql`json_agg(json_build_object(
        'id', ${expenses.id},
        'name', ${expenses.description}, 
        'amount', ${expenses.amount},
        'dueDate', ${expenses.dueDate},
        'description', ${expenses.description}
      ))`
    })
    .from(expenses)
    .groupBy(expenses.category);

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

export const getExpenseById = cache(async (id: string): Promise<Expense | null> => {
  const results = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, Number(id)))
    .limit(1);
  
  if (!results[0]) return null;
  
  return {
    ...results[0],
    amount: results[0].amount.toString()
  };
});

export async function createExpense(expense: Omit<NewExpense, 'id'>): Promise<Expense> {
  const [insertedExpense] = await db.insert(expenses).values({
    userId: expense.userId,
    title: expense.title,
    amount: expense.amount,
    dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
    date: expense.date ? new Date(expense.date) : null,
    description: expense.description,
    category: expense.category,
    paidAt: expense.paidAt ? new Date(expense.paidAt) : null,
    isRecurring: expense.isRecurring
  }).returning();

  revalidatePath('/')

  return insertedExpense;
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const { id, ...updateData } = expense;
  const [updatedExpense] = await db.update(expenses)
    .set({
      ...updateData,
      dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
      date: updateData.date ? new Date(updateData.date) : null,
      paidAt: updateData.paidAt ? new Date(updateData.paidAt) : null
    })
    .where(eq(expenses.id, id))
    .returning();

  revalidatePath('/')

  return updatedExpense;
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await db.delete(expenses)
      .where(eq(expenses.id, Number(id)))

    revalidatePath('/')
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw new Error('Failed to delete expense')
  }
}

export const getIncomes = cache(async (): Promise<Income[]> => {
  const user = await getUserSession()
  if (!user) return []

  const incomesResponse = await db
    .select()
    .from(incomes)
    .where(eq(incomes.userId, user.id))
    .orderBy(desc(incomes.date))
  
  return incomesResponse.map(income => ({
    ...income,
    amount: income.amount.toString()
  }))
})

export async function createIncome(income: Omit<NewIncome, 'id'>): Promise<Income> {
  const [insertedIncome] = await db.insert(incomes).values({
    userId: income.userId,
    source: income.source,
    amount: income.amount,
    date: income.date ? new Date(income.date) : null,
  }).returning();

  revalidatePath('/')
  return {
    ...insertedIncome,
    amount: insertedIncome.amount.toString()
  };
}

export async function updateIncome(income: Income): Promise<Income> {
  const { id, ...updateData } = income;
  const [updatedIncome] = await db.update(incomes)
    .set({
      ...updateData,
      date: updateData.date ? new Date(updateData.date) : null
    })
    .where(eq(incomes.id, id))
    .returning();

  revalidatePath('/')
  return {
    ...updatedIncome,
    amount: updatedIncome.amount.toString()
  };
}

export async function deleteIncome(id: string): Promise<void> {
  try {
    await db.delete(incomes)
      .where(eq(incomes.id, Number(id)))

    revalidatePath('/')
  } catch (error) {
    console.error('Error deleting income:', error)
    throw new Error('Failed to delete income')
  }
}