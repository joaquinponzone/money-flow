"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateExpense } from "@/app/actions"
import { Expense } from "@/types/expense"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface EditExpenseDialogProps {
  expense: Expense
  categories: { id: string; name: string }[]
  children: React.ReactNode
}

function toLocalDate(date: Date | string) {
  const d = new Date(date)
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
}

export default function EditExpenseDialog({ expense, categories, children }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [editedExpense, setEditedExpense] = useState<Expense>(expense)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setEditedExpense(expense)
    }
  }, [open, expense])

  const formatDateForDisplay = (date: Date | string) => {
    return format(toLocalDate(date), 'dd-MM-yyyy')
  }

  const formatDateForInput = (date: Date | string) => {
    return format(toLocalDate(date), 'yyyy-MM-dd')
  }

  const handleDateChange = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    const selectedDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
    setEditedExpense({ 
      ...editedExpense, 
      dueDate: selectedDate
    })
  }

  const handleUpdateExpense = async (expense: Expense) => {
    startTransition(async () => {
      await updateExpense(expense)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to your expense here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={editedExpense.name}
              onChange={(e) => setEditedExpense({ ...editedExpense, name: e.target.value })}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              className="col-span-3"
              value={editedExpense.description ?? ''}
              onChange={(e) => setEditedExpense({ ...editedExpense, description: e.target.value })}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              className="col-span-3"
              value={editedExpense.amount}
              onChange={(e) => setEditedExpense({ ...editedExpense, amount: e.target.value })}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <div className="col-span-3 relative">
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  className="pl-10 pr-10"
                  value={formatDateForInput(editedExpense.dueDate)}
                  onChange={(e) => handleDateChange(e.target.value)}
                  disabled={isPending}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                  {formatDateForDisplay(editedExpense.dueDate)}
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Select a date in dd-mm-yyyy format
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={editedExpense.categoryId}
              onValueChange={(value) => setEditedExpense({ ...editedExpense, categoryId: value })}
              disabled={isPending}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => handleUpdateExpense(editedExpense)}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 