"use client";

import { Expense } from "@/types/expense";
import { formatLocalDate, isCurrentMonth, sortByDateDesc } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { Card, CardContent } from "../ui/card";
import { CalendarIcon, TagIcon } from "lucide-react";
import { AddExpensePopover } from "./add-expense-popover";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Monthly Overview</h2>
        <AddExpensePopover recurringExpenses={recurringExpenses} />
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="monthly">Monthly Expenses</TabsTrigger>
          <TabsTrigger value="history">Expenses History</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="bg-background rounded-lg">
          {/* Mobile view - Cards */}
          <div className="grid gap-4 md:hidden">
            {currentMonthExpenses.map((expense) => (
              <Card key={expense.id} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {formatLocalDate(expense.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <TagIcon className="h-4 w-4" />
                        <span className="capitalize">{expense.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${expense.amount}</div>
                      <Badge variant="outline" className={`text-xs ${expense.paidAt ? 'text-green-500' : 'text-red-500'}`}>
                        {expense.paidAt ? `Paid` : 'Unpaid'}
                      </Badge>
                      <div className="flex gap-2 mt-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.title} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {currentMonthExpenses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No expenses for this month
              </p>
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMonthExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-sm text-muted-foreground">{expense.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">${expense.amount}</TableCell>
                    <TableCell className="capitalize">{expense.category || 'Uncategorized'}</TableCell>
                    <TableCell>{formatLocalDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${expense.paidAt ? 'text-green-500' : 'text-red-500'}`}>
                        {expense.paidAt ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {currentMonthExpenses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No expenses for this month
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          {/* Similar structure for history tab */}
          {/* Mobile view - Cards */}
          <div className="grid gap-4 md:hidden">
            {expensesHistory.map((expense) => (
              <Card key={expense.id} className="bg-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {formatLocalDate(expense.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <TagIcon className="h-4 w-4" />
                        <span className="capitalize">{expense.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${expense.amount}</div>
                      <div className={`text-sm ${expense.paidAt ? 'text-green-500' : 'text-red-500'}`}>
                        {expense.paidAt ? `Paid` : 'Unpaid'}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.title} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {expensesHistory.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No expense history
              </p>
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesHistory.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-sm text-muted-foreground">{expense.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">${expense.amount}</TableCell>
                    <TableCell className="capitalize">{expense.category || 'Uncategorized'}</TableCell>
                    <TableCell>{formatLocalDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${expense.paidAt ? 'text-green-500' : 'text-red-500'}`}>
                        {expense.paidAt ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {expensesHistory.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No expense history
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}