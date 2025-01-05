"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createExpense } from "@/app/actions";
import { Expense } from "@/types/expense";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface AddFromRecurringExpenseDialogProps {
  recurringExpenses: Expense[];
}

export function AddFromRecurringExpenseDialog({ 
  recurringExpenses 
}: AddFromRecurringExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>("");
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedExpenseIds.size === recurringExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(recurringExpenses.map(e => e.id.toString())));
    }
  };

  const handleToggleExpense = (id: string) => {
    const newSelected = new Set(selectedExpenseIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenseIds(newSelected);
  };

  async function handleSubmit(ids: string[]) {
    setIsSubmitting(true);
    try {
      const selectedExpenses = recurringExpenses.filter(
        expense => ids.includes(expense.id.toString())
      );

      await Promise.all(selectedExpenses.map(async (expense) => {
        const currentDate = new Date();
        const newExpense = {
          userId: expense.userId,
          title: expense.title,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: format(currentDate, "yyyy-MM-dd"),
          isRecurring: expense.isRecurring,
          paidAt: null,
          dueDate: expense.dueDate 
            ? format(new Date(expense.dueDate).setMonth(new Date(expense.dueDate).getMonth() + 1), "yyyy-MM-dd")
            : null,
        };
        await createExpense(newExpense);
      }));

      setError(null);
      setOpen(false);
      setSelectedExpenseId("");
      setSelectedExpenseIds(new Set());
    } catch (error) {
      console.error(error);
      setError("Failed to add expenses");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add from Recurring</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add from Recurring Expense</DialogTitle>
          <DialogDescription>
            Select recurring expenses to add for this month.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Select</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Select</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <Select
              value={selectedExpenseId}
              onValueChange={setSelectedExpenseId}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recurring expense" />
              </SelectTrigger>
              <SelectContent>
                {recurringExpenses.map((expense) => (
                  <SelectItem key={expense.id} value={expense.id.toString()}>
                    {expense.title} - <span className="font-mono text-xs text-muted-foreground">${expense.amount}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500">{error}</p>}
            <Button 
              onClick={() => handleSubmit([selectedExpenseId])}
              disabled={isSubmitting || !selectedExpenseId}
              className="w-full"
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </TabsContent>

          <TabsContent value="multiple" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedExpenseIds.size === recurringExpenses.length}
                  onCheckedChange={handleSelectAll}
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
              <div className="space-y-2">
                {recurringExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={selectedExpenseIds.has(expense.id.toString())}
                      onCheckedChange={() => handleToggleExpense(expense.id.toString())}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm">
                      {expense.title} - <span className="font-mono text-xs text-muted-foreground">${expense.amount}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button 
              onClick={() => handleSubmit(Array.from(selectedExpenseIds))}
              disabled={isSubmitting || selectedExpenseIds.size === 0}
              className="w-full"
            >
              {isSubmitting ? "Adding..." : `Add ${selectedExpenseIds.size} Expense${selectedExpenseIds.size !== 1 ? 's' : ''}`}
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 