'use server'

import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { expenses, incomes } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { Expense, NewExpense } from '@/types/expense'
import { Income, NewIncome } from '@/types/income'

export const getExpenses = unstable_cache(
  async (userId: string | undefined): Promise<Expense[]> => {
    if (!userId) return []

    const expensesResponse = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.paidAt ?? expenses.dueDate))
    
    return expensesResponse
  },
  ['expenses'],
  { revalidate: 60, tags: ['expenses'] }
)

export const getExpensesByCategory = unstable_cache(
  async (userId: string | undefined) => {
    if (!userId) return []

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
      .where(eq(expenses.userId, userId))
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
  }, 
  ['expenses-by-category'],
  { revalidate: 60, tags: ['expenses'] }
);

export const getExpenseById = unstable_cache(async (id: string): Promise<Expense | null> => {
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
}, ['expense-by-id'], { revalidate: 60, tags: ['expenses'] });

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

export const getIncomes = unstable_cache(
  async (userId: string | undefined): Promise<Income[]> => {
    if (!userId) return []

    const incomesResponse = await db
      .select()
      .from(incomes)
      .where(eq(incomes.userId, userId))
      .orderBy(desc(incomes.date))
    
    return incomesResponse.map(income => ({
      ...income,
      amount: income.amount.toString()
    }))
  },
  ['incomes'],
  { revalidate: 60, tags: ['incomes'] }
)

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

export const getCurrentMonthExpenses = unstable_cache(
  async (userId: string | undefined): Promise<Expense[]> => {
    if (!userId) return []

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()

    const expensesResponse = await db
      .select()
      .from(expenses)
      .where(sql`${expenses.userId} = ${userId} 
        AND ${expenses.date} >= ${startOfMonth}::timestamp 
        AND ${expenses.date} <= ${endOfMonth}::timestamp`)
      .orderBy(desc(expenses.date))
    
    return expensesResponse
  },
  ['current-month-expenses'],
  { revalidate: 60, tags: ['expenses'] }
)

export const getCurrentMonthIncomes = unstable_cache(
  async (userId: string | undefined): Promise<Income[]> => {
    if (!userId) return []

    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const incomesResponse = await db
      .select()
      .from(incomes)
      .where(sql`${incomes.userId} = ${userId} 
        AND ${incomes.date} >= ${thirtyDaysAgo.toISOString()}::timestamp 
        AND ${incomes.date} <= ${today.toISOString()}::timestamp`)
      .orderBy(desc(incomes.date))
    
    return incomesResponse.map(income => ({
      ...income,
      amount: income.amount.toString()
    }))
  },
  ['current-month-incomes'],
  { revalidate: 60, tags: ['incomes'] }
)