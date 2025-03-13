'use server'

import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { expenses, incomes } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { Expense, NewExpense } from '@/types/expense'
import { Income, NewIncome } from '@/types/income'
import { z } from 'zod'
import { ExpenseCategories } from '@/lib/constants'

// Define interfaces for Excel import data
interface ExcelExpenseRow {
  Title?: string;
  Amount?: number | string;
  Category?: string;
  Description?: string;
  'Due Date'?: string | number | Date;
  'Paid At'?: string | number | Date;
  'Is Recurring'?: string;
  [key: string]: unknown;
}

interface ExcelIncomeRow {
  Source?: string;
  Amount?: number | string;
  Date?: string | number | Date;
  [key: string]: unknown;
}

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
  // Ensure category is lowercase for consistency
  const categoryFormatted = expense.category ? expense.category.toLowerCase() : null;
  
  const [insertedExpense] = await db.insert(expenses).values({
    userId: expense.userId,
    title: expense.title,
    amount: expense.amount,
    dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
    date: expense.date ? new Date(expense.date) : null,
    description: expense.description,
    category: categoryFormatted,
    paidAt: expense.paidAt ? new Date(expense.paidAt) : null,
    isRecurring: expense.isRecurring
  }).returning();

  revalidatePath('/')
  revalidatePath('/expenses');
  revalidatePath('/dashboard');

  return insertedExpense;
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const { id, ...updateData } = expense;
  
  // Ensure category is lowercase for consistency
  if (updateData.category) {
    updateData.category = updateData.category.toLowerCase();
  }
  
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
  revalidatePath('/expenses');
  revalidatePath('/dashboard');

  return updatedExpense;
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await db.delete(expenses)
      .where(eq(expenses.id, Number(id)))

    revalidatePath('/')
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
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

export async function createIncome(income: Omit<NewIncome, 'id'>): Promise<{ data: Income | null; error: string | null }> {
  try {
    // Validate input
    const incomeSchema = z.object({
      userId: z.string().uuid(),
      source: z.string().min(1, "Source is required"),
      amount: z.string().regex(/^\d+(\.\d{0,2})?$/, "Invalid amount format"),
      date: z.string().nullable().transform(val => val ? new Date(val) : null)
    });

    const validatedData = incomeSchema.parse(income);
    
    // Insert into database
    const [insertedIncome] = await db.insert(incomes).values({
      userId: validatedData.userId,
      source: validatedData.source,
      amount: validatedData.amount,
      date: validatedData.date
    }).returning();

    if (!insertedIncome) {
      return { data: null, error: "Failed to create income" };
    }

    revalidatePath('/');
    revalidatePath('/incomes');
    revalidatePath('/dashboard');
    
    return {
      data: {
        ...insertedIncome,
        amount: insertedIncome.amount.toString()
      },
      error: null
    };

  } catch (error) {
    console.error('Error creating income:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        data: null, 
        error: error.errors[0].message 
      };
    }

    return { 
      data: null, 
      error: "An unexpected error occurred while creating the income" 
    };
  }
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
  revalidatePath('/incomes');
  revalidatePath('/dashboard');

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
    revalidatePath('/incomes');
    revalidatePath('/dashboard');
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
      .orderBy(desc(expenses.amount))
    
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

export async function exportToExcel(userId: string | undefined): Promise<Uint8Array | null> {
  'use server'
  
  if (!userId) return null;
  
  try {
    // Dynamically import xlsx to ensure it's only loaded on the server
    const XLSX = await import('xlsx');
    
    // Fetch all expenses and incomes
    const [allExpenses, allIncomes] = await Promise.all([
      getExpenses(userId),
      getIncomes(userId)
    ]);
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Format expenses data for Excel
    const expensesData = allExpenses.map(expense => ({
      Title: expense.title,
      Amount: parseFloat(expense.amount),
      Category: expense.category || 'Uncategorized',
      Description: expense.description || '',
      'Due Date': expense.dueDate ? new Date(expense.dueDate) : '',
      'Paid At': expense.paidAt ? new Date(expense.paidAt) : '',
      'Is Recurring': expense.isRecurring ? 'Yes' : 'No'
    }));
    
    // Format incomes data for Excel
    const incomesData = allIncomes.map(income => ({
      Source: income.source,
      Amount: parseFloat(income.amount),
      Date: income.date ? new Date(income.date) : ''
    }));
    
    // Create worksheets
    const expensesWorksheet = XLSX.utils.json_to_sheet(expensesData);
    const incomesWorksheet = XLSX.utils.json_to_sheet(incomesData);
    
    // Add data validation for Category column in expenses worksheet
    // First, we need to determine the range of cells for the Category column
    const range = XLSX.utils.decode_range(expensesWorksheet['!ref'] || 'A1:G1');
    const categoryColIndex = 2; // C column (0-indexed: A=0, B=1, C=2)
    
    // Create a dropdown validation for the Category column
    const validation = {
      type: 'list',
      formula1: '"' + ExpenseCategories.join(',') + '"',
      showDropDown: true
    };
    
    // Apply validation to all cells in the Category column
    if (!expensesWorksheet['!dataValidation']) {
      expensesWorksheet['!dataValidation'] = {};
    }
    
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: categoryColIndex });
      expensesWorksheet['!dataValidation'][cellRef] = validation;
    }
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Expenses');
    XLSX.utils.book_append_sheet(workbook, incomesWorksheet, 'Incomes');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return excelBuffer;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return null;
  }
}

export async function importFromExcel(fileBuffer: ArrayBuffer, userId: string): Promise<{ success: boolean; message: string; stats?: { expenses: number; incomes: number } }> {
  'use server'
  
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }
  
  try {
    // Dynamically import xlsx to ensure it's only loaded on the server
    const XLSX = await import('xlsx');
    
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    // Check if the required sheets exist
    const sheetNames = workbook.SheetNames;
    if (!sheetNames.includes('Expenses') || !sheetNames.includes('Incomes')) {
      return { 
        success: false, 
        message: 'Invalid file format. The file must contain "Expenses" and "Incomes" sheets.' 
      };
    }
    
    // Parse expenses sheet
    const expensesSheet = workbook.Sheets['Expenses'];
    const expensesData = XLSX.utils.sheet_to_json(expensesSheet);
    
    // Parse incomes sheet
    const incomesSheet = workbook.Sheets['Incomes'];
    const incomesData = XLSX.utils.sheet_to_json(incomesSheet);
    
    // Process expenses
    let importedExpensesCount = 0;
    for (const expenseRow of expensesData) {
      const expense = expenseRow as ExcelExpenseRow;
      
      // Skip if required fields are missing
      if (!expense.Title || expense.Amount === undefined) continue;
      
      // Validate category against the predefined list
      let category = expense.Category || null;
      if (category) {
        // Check if the category exists in our list (case-insensitive)
        const matchedCategory = ExpenseCategories.find(
          (c: string) => c.toLowerCase() === String(category).toLowerCase()
        );
        
        if (matchedCategory) {
          // Use the lowercase version of the matched category
          category = matchedCategory.toLowerCase();
        } else {
          // If category doesn't match any in our list, default to 'other'
          category = 'other';
        }
      }
      
      // Convert Excel date numbers to JavaScript dates if needed
      let dueDate = null;
      if (expense['Due Date']) {
        try {
          if (typeof expense['Due Date'] === 'number') {
            // Handle Excel date number
            const excelDateValue = XLSX.SSF.parse_date_code(expense['Due Date']);
            if (excelDateValue) {
              const { y: year, m: month, d: day } = excelDateValue;
              // Excel months are 1-indexed, JavaScript months are 0-indexed
              dueDate = new Date(year, month - 1, day);
            }
          } else {
            // Handle string date
            dueDate = new Date(expense['Due Date']);
          }
          
          // Validate the date is valid
          if (dueDate && isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        } catch (error) {
          console.error('Error parsing due date:', error);
          dueDate = null;
        }
      }
      
      let paidAt = null;
      if (expense['Paid At']) {
        try {
          if (typeof expense['Paid At'] === 'number') {
            // Handle Excel date number
            const excelDateValue = XLSX.SSF.parse_date_code(expense['Paid At']);
            if (excelDateValue) {
              const { y: year, m: month, d: day } = excelDateValue;
              // Excel months are 1-indexed, JavaScript months are 0-indexed
              paidAt = new Date(year, month - 1, day);
            }
          } else {
            // Handle string date
            paidAt = new Date(expense['Paid At']);
          }
          
          // Validate the date is valid
          if (paidAt && isNaN(paidAt.getTime())) {
            paidAt = null;
          }
        } catch (error) {
          console.error('Error parsing paid at date:', error);
          paidAt = null;
        }
      }
      
      // Create the expense
      await db.insert(expenses).values({
        userId,
        title: expense.Title,
        amount: expense.Amount.toString(),
        description: expense.Description || null,
        category: category || null,
        dueDate: dueDate,
        paidAt: paidAt,
        isRecurring: expense['Is Recurring'] === 'Yes',
        date: dueDate // Use dueDate as the date if available
      });
      
      importedExpensesCount++;
    }
    
    // Process incomes
    let importedIncomesCount = 0;
    for (const incomeRow of incomesData) {
      const income = incomeRow as ExcelIncomeRow;
      
      // Skip if required fields are missing
      if (!income.Source || income.Amount === undefined) continue;
      
      // Convert Excel date numbers to JavaScript dates if needed
      let date = null;
      if (income.Date) {
        try {
          if (typeof income.Date === 'number') {
            // Handle Excel date number
            const excelDateValue = XLSX.SSF.parse_date_code(income.Date);
            if (excelDateValue) {
              const { y: year, m: month, d: day } = excelDateValue;
              // Excel months are 1-indexed, JavaScript months are 0-indexed
              date = new Date(year, month - 1, day);
            }
          } else {
            // Handle string date
            date = new Date(income.Date);
          }
          
          // Validate the date is valid
          if (date && isNaN(date.getTime())) {
            date = null;
          }
        } catch (error) {
          console.error('Error parsing income date:', error);
          date = null;
        }
      }
      
      // Create the income
      await db.insert(incomes).values({
        userId,
        source: income.Source,
        amount: income.Amount.toString(),
        date: date
      });
      
      importedIncomesCount++;
    }
    
    // Revalidate paths to update the UI
    revalidatePath('/');
    revalidatePath('/expenses');
    revalidatePath('/incomes');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      message: `Successfully imported ${importedExpensesCount} expenses and ${importedIncomesCount} incomes.`,
      stats: {
        expenses: importedExpensesCount,
        incomes: importedIncomesCount
      }
    };
    
  } catch (error) {
    console.error('Error importing from Excel:', error);
    return { 
      success: false, 
      message: 'An error occurred while importing the file. Please check the file format and try again.' 
    };
  }
}

