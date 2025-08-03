"use client";

import { Expense } from "@/types/expense";
import { cn, formatLocalDate, isCurrentMonth, sortByDateDesc } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { Card, CardContent } from "../../../components/ui/card";
import { CalendarIcon, TagIcon } from "lucide-react";
import { AddExpensePopover } from "./add-expense-popover";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import CategoryLabel from "../../../components/category-label";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { useState } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";


interface ExpensesTableProps {
  expenses: Expense[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Filter expenses based on the switch state
  const filteredCurrentMonthExpenses = showUnpaidOnly 
    ? currentMonthExpenses.filter(expense => !expense.paidAt)
    : currentMonthExpenses;

  const filteredExpensesHistory = showUnpaidOnly 
    ? expensesHistory.filter(expense => !expense.paidAt)
    : expensesHistory;

  // Pagination for current month expenses
  const currentMonthPagination = usePagination({
    data: filteredCurrentMonthExpenses,
    itemsPerPage,
  });

  // Pagination for expenses history
  const historyPagination = usePagination({
    data: filteredExpensesHistory,
    itemsPerPage,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Monthly Overview</h2>
        <AddExpensePopover recurringExpenses={recurringExpenses} />
      </div>

      <Tabs defaultValue="monthly" className="w-full bg-background p-4 rounded-lg">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="monthly">Monthly Expenses</TabsTrigger>
          <TabsTrigger value="history">Expenses History</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="unpaid-only"
              checked={showUnpaidOnly}
              onCheckedChange={setShowUnpaidOnly}
            />
            <Label htmlFor="unpaid-only">Show unpaid expenses only</Label>
          </div>

          {/* Mobile view - Cards */}
          <div className="grid gap-4 md:hidden">
            {currentMonthPagination.currentData.map((expense) => (
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
            {currentMonthPagination.currentData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {showUnpaidOnly ? 'No unpaid expenses for this month' : 'No expenses for this month'}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Due/Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMonthPagination.currentData.map((expense) => {
                  return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <div className="font-bold text-base">{expense.title}</div>
                        <div className="text-sm text-muted-foreground">{expense.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">${expense.amount}</TableCell>
                    <TableCell className="capitalize">
                      <CategoryLabel category={expense.category || 'Uncategorized'} />
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${expense.paidAt ? 'bg-green-600 dark:bg-green-300' : 'bg-red-500 dark:bg-red-300 font-bold'}`}>
                        {expense.paidAt ? `Paid` : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono"><span className={cn(
                      expense.paidAt ? 'text-green-700 dark:text-green-200' : 'text-red-800 dark:text-red-300'
                    )}>{formatLocalDate(expense.paidAt ? expense.paidAt : expense.dueDate)}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditExpenseDialog expense={expense} />
                        <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
            {currentMonthPagination.currentData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {showUnpaidOnly ? 'No unpaid expenses for this month' : 'No expenses for this month'}
              </p>
            )}
          </div>

          {/* Pagination */}
          <DataTablePagination
            currentPage={currentMonthPagination.currentPage}
            totalPages={currentMonthPagination.totalPages}
            totalItems={currentMonthPagination.totalItems}
            startIndex={currentMonthPagination.startIndex}
            endIndex={currentMonthPagination.endIndex}
            onPageChange={currentMonthPagination.goToPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="unpaid-only-history"
              checked={showUnpaidOnly}
              onCheckedChange={setShowUnpaidOnly}
            />
            <Label htmlFor="unpaid-only-history">Show unpaid expenses only</Label>
          </div>

          {/* Similar structure for history tab */}
          {/* Mobile view - Cards */}
          <div className="grid gap-4 md:hidden">
            {historyPagination.currentData.map((expense) => (
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
            {historyPagination.currentData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {showUnpaidOnly ? 'No unpaid expenses in history' : 'No expense history'}
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
                {historyPagination.currentData.map((expense) => (
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
                      <span className={`text-xs ${expense.paidAt ? 'text-green-600 dark:text-green-300' : 'text-red-500 font-bold'}`}>
                        {expense.paidAt ? `Paid at ${formatLocalDate(expense.paidAt)}` : 'Unpaid'}
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
            {historyPagination.currentData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {showUnpaidOnly ? 'No unpaid expenses in history' : 'No expense history'}
              </p>
            )}
          </div>

          {/* Pagination */}
          <DataTablePagination
            currentPage={historyPagination.currentPage}
            totalPages={historyPagination.totalPages}
            totalItems={historyPagination.totalItems}
            startIndex={historyPagination.startIndex}
            endIndex={historyPagination.endIndex}
            onPageChange={historyPagination.goToPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}