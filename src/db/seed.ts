import { db } from '@/db'
import { expenses, incomes } from '@/db/schema'
import mockData from '@/lib/mock-data.json'

async function seed() {
  try {
    console.log('🌱 Starting seeding...')

    // Clear existing data
    await db.delete(expenses)
    await db.delete(incomes)
    console.log('Cleared existing data')

    // Insert expenses
    const insertedExpenses = await db.insert(expenses).values(
      mockData.expenses.map(expense => ({
        userId: expense.userId,
        title: expense.title,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date ? new Date(expense.date) : null,
        isRecurring: expense.isRecurring,
        paidAt: expense.paidAt ? new Date(expense.paidAt) : null,
        dueDate: expense.dueDate ? new Date(expense.dueDate) : null
      }))
    ).returning()
    console.log(`Inserted ${insertedExpenses.length} expenses`)

    // Insert incomes
    const insertedIncomes = await db.insert(incomes).values(
      mockData.incomes.map(income => ({
        userId: income.userId,
        amount: income.amount,
        source: income.source,
        date: new Date(income.date)
      }))
    ).returning()
    console.log(`Inserted ${insertedIncomes.length} incomes`)

    console.log('✅ Seeding completed successfully')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Execute seeding if this file is run directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seed }