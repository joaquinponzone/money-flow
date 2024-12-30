import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getExpenses, getCategories } from '@/app/actions'
import { format } from 'date-fns'
import { Expense } from '@/types/expense'
import EditExpenseDialog from './edit-expense-dialog'
import DeleteExpenseDialog from './delete-expense-dialog'
import { Badge } from "@/components/ui/badge"

export default async function ExpensesTable() {
  const [expenses, categories] = await Promise.all([
    getExpenses(),
    getCategories()
  ])

  const categoryMap = new Map(
    categories.map(category => [category.id, category.name])
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense: Expense) => (
            <TableRow key={expense.id}>
              <TableCell>{expense.name}</TableCell>
              <TableCell>${Number(expense.amount).toFixed(2)}</TableCell>
              <TableCell>{format(new Date(expense.dueDate), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{categoryMap.get(expense.categoryId) ?? 'Unknown'}</TableCell>
              <TableCell>
                {expense.paidAt ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid {format(new Date(expense.paidAt), 'dd/MM/yyyy')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unpaid
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <EditExpenseDialog expense={expense} categories={categories}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </EditExpenseDialog>
                <DeleteExpenseDialog 
                  expenseId={expense.id}
                  expenseName={expense.name}
                >
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </DeleteExpenseDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}