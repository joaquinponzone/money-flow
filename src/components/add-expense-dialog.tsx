"use client"

import { useState, useTransition } from "react"
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
import { createExpense } from "@/app/actions"
import { NewExpense } from "@/types/expense"

interface AddExpenseDialogProps {
  categories: { id: string; name: string }[]
  children: React.ReactNode
}

export default function AddExpenseDialog({ categories, children }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [newExpense, setNewExpense] = useState<NewExpense>({
    name: '',
    description: null,
    amount: '',
    dueDate: new Date(),
    categoryId: '',
    createdAt: new Date()
  })

  const [isPending, startTransition] = useTransition()

  const handleAddExpense = async (expense: NewExpense) => {
    startTransition(async () => {
      await createExpense({
        ...expense,
        note: expense.note || null,
        paidAt: expense.paidAt || null
      })
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
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to track in your monthly expenses.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} disabled={isPending}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" className="col-span-3" value={newExpense.description ?? ''} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} disabled={isPending}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input id="amount" type="number" step="0.01" className="col-span-3" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} disabled={isPending}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Input id="dueDate" type="date" className="col-span-3" value={newExpense.dueDate.toISOString().split('T')[0]} onChange={(e) => setNewExpense({ ...newExpense, dueDate: new Date(e.target.value) })} disabled={isPending}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={newExpense.categoryId}
              onValueChange={(value) => setNewExpense({ ...newExpense, categoryId: value })}
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
          <Button type="submit" onClick={() => {
            handleAddExpense(newExpense)
            setOpen(false)
          }} disabled={isPending} >{
            isPending ? 'Adding...' : 'Add Expense'
          }</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
