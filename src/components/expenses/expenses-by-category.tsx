'use client'

import { Expense } from "@/types/expense";

interface ExpensesByCategoryProps {
  expenses: Expense[];
}

export function ExpensesByCategory({ expenses }: ExpensesByCategoryProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = parseFloat(expense.amount);
    acc[expense.category || 'N/A'] = (acc[expense.category || 'N/A'] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
      <div className="space-y-2">
        {Object.entries(categoryTotals).map(([category, total]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="capitalize">{category}</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
