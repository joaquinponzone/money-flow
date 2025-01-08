"use client";

import { Expense } from "@/types/expense";
import { formatLocalDate, isCurrentMonth, sortByDateDesc } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AddExpenseDialog } from "./add-expense-dialog";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { AddFromRecurringExpenseDialog } from "./add-from-recurring-expense-dialog";

interface ExpensesTableProps {
  expenses: Expense[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const currentMonthExpenses = expenses.filter(expense => 
    isCurrentMonth(expense.dueDate)
  );

  const currentMonthTitles = new Set(currentMonthExpenses.map(e => e.title));

  const expensesHistory = expenses
    .filter(expense => !isCurrentMonth(expense.dueDate))
    .sort((a, b) => sortByDateDesc(a.dueDate, b.dueDate));

  const recurringExpenses = expenses.reduce((unique, expense) => {
    const isDuplicate = unique.some(e => e.title === expense.title);
    const existsInCurrentMonth = currentMonthTitles.has(expense.title);
    
    if (!expense.isRecurring || isDuplicate || existsInCurrentMonth) return unique;
    return [...unique, expense];
  }, [] as Expense[]);

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Monthly Overview</h2>
          <div className="flex gap-2">
            <AddExpenseDialog />
            <AddFromRecurringExpenseDialog recurringExpenses={recurringExpenses} />
          </div>
        </div>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList>
            <TabsTrigger value="monthly">Monthly Expenses</TabsTrigger>
            <TabsTrigger value="history">Expenses History</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <div className="rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b">
                      <td className="py-3 px-4">{expense.title}</td>
                      <td className="py-3 px-4 font-mono">${expense.amount}</td>
                      <td className="py-3 px-4">
                        {expense.dueDate ? formatLocalDate(expense.dueDate) : null}
                      </td>
                      <td className="py-3 px-4 capitalize">{expense.category}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          expense.paidAt 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.paidAt ? `Paid on ${formatLocalDate(new Date(expense.paidAt))}` : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {expense.date ? formatLocalDate(new Date(expense.date)) : null}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog 
                          expenseId={expense.id} 
                          expenseTitle={expense.title} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Created At</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesHistory.map((expense) => (
                    <tr key={expense.id} className="border-b">
                      <td className="py-3 px-4">{expense.title}</td>
                      <td className="py-3 px-4 font-mono">${expense.amount}</td>
                      <td className="py-3 px-4">
                        {expense.dueDate ? formatLocalDate(expense.dueDate) : null}
                      </td>
                      <td className="py-3 px-4 capitalize">{expense.category}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          expense.paidAt 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.paidAt ? `Paid on ${formatLocalDate(new Date(expense.paidAt))}` : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {expense.createdAt ? formatLocalDate(new Date(expense.createdAt)) : null}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog 
                          expenseId={expense.id} 
                          expenseTitle={expense.title} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}