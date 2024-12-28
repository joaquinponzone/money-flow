import { db } from '@/db'
import { categories, expenses, expensePayments, payments } from '@/db/schema'
import mockData from '@/lib/mock-data.json'

async function seed() {
  try {
    console.log('🌱 Starting seeding...')

    // Clear existing data
    await db.delete(expensePayments)
    await db.delete(payments)
    await db.delete(expenses)
    await db.delete(categories)
    console.log('Cleared existing data')

    // Insert categories first
    const insertedCategories = await db.insert(categories).values(
      mockData.categories.map(category => ({
        name: category.name,
        description: category.description || null,
      }))
    ).returning()
    console.log(`Inserted ${insertedCategories.length} categories`)

    // Create a map of category names to IDs
    const categoryMap = new Map(
      insertedCategories.map(category => [category.name.toLowerCase(), category.id])
    )

    // Debug: Print category mapping
    console.log('Category Map:', Object.fromEntries(categoryMap))

    // Insert expenses with category IDs
    const expensesWithCategories = mockData.expenses.map(expense => {
      const categoryId = categoryMap.get(expense.category.toLowerCase())
      console.log(`Mapping category '${expense.category}' to ID:`, categoryId)
      
      return {
        name: expense.name,
        amount: expense.amount,
        dueDate: new Date(expense.dueDate),
        description: expense.description || null,
        categoryId: categoryId!,
        isActive: true,
        createdAt: new Date(expense.createdAt)
      }
    })

    const insertedExpenses = await db.insert(expenses)
      .values(expensesWithCategories)
      .returning()
    console.log(`Inserted ${insertedExpenses.length} expenses`)

    // Insert payments
    const insertedPayments = await db.insert(payments).values(
      mockData.payments.map(payment => ({
        amount: payment.amount,
        paidAt: new Date(payment.paidAt),
        note: payment.note || null,
        createdAt: new Date(payment.createdAt)
      }))
    ).returning()
    console.log(`Inserted ${insertedPayments.length} payments`)

    // Create expense payments relationships
    await db.insert(expensePayments).values(
      mockData.payments.map((payment, idx) => ({
        expenseId: insertedExpenses[idx].id,
        paymentId: insertedPayments[idx].id,
        amount: payment.amount,
        dueDate: new Date(payment.paidAt),
        isPaid: true
      }))
    )
    console.log(`Created ${mockData.payments.length} expense payment relationships`)

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