"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { deleteIncome } from "@/app/actions"
import { useState } from "react"

interface DeleteIncomeDialogProps {
  incomeId: number;
  incomeSource: string;
}

export function DeleteIncomeDialog({ incomeId, incomeSource }: DeleteIncomeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteIncome(incomeId.toString())
    } catch (error) {
      console.error("Failed to delete income:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive dark:text-red-300" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the income from &quot;{incomeSource}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 