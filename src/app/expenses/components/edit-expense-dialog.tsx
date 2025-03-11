"use client"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Checkbox } from "../../../components/ui/checkbox"
import { updateExpense } from "@/app/actions"
import { Expense } from "@/types/expense"
import { Loader2, Pencil } from "lucide-react"
import { format } from "date-fns"

const formSchema = z.object({
  id: z.number(),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().nullable(),
  category: z.string().nullable(),
  date: z.string().nullable(),
  isRecurring: z.boolean().nullable(),
  isPaid: z.boolean(),
  dueDate: z.string().nullable(),
})

const categories = [
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "food", label: "Food" },
  { value: "transportation", label: "Transportation" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
]

interface EditExpenseDialogProps {
  expense: Expense;
}

export function EditExpenseDialog({ expense }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: expense.id,
      userId: expense.userId,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? format(new Date(expense.date), "yyyy-MM-dd") : null,
      dueDate: expense.dueDate ? format(new Date(expense.dueDate), "yyyy-MM-dd") : null,
      isRecurring: expense.isRecurring,
      isPaid: expense.paidAt !== null,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const currentDate = new Date()
      await updateExpense({
        ...expense,
        ...values,
        paidAt: values.isPaid 
          ? (expense.paidAt ? expense.paidAt : format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"))
          : null,
      })
      setError(null)
      setOpen(false)
    } catch (error) {
      console.error(error)
      setError("Failed to update expense")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4 text-teal-600 dark:text-teal-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to your expense here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Rent, Phone Bill, etc." {...field} value={field.value || ""} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Rent, Utilities, etc." {...field} value={field.value || ""} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.value} 
                          value={category.value}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ""}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Expense</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Paid
                      {expense.paidAt && (
                        <div className="text-sm text-muted-foreground">
                          Paid on {format(new Date(expense.paidAt), "MMM d, yyyy")}
                        </div>
                      )}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading} className="flex w-full justify-center gap-2">
                {isLoading ? "Saving..." : "Save Changes"}  
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 