"use client"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircle } from "lucide-react"
import { AddExpenseDialog } from "./add-expense-dialog"
import { AddFromRecurringExpenseDialog } from "./add-from-recurring-expense-dialog"
import { useState } from "react"
import { Expense } from "@/types/expense"

interface AddExpensePopoverProps {
    recurringExpenses: Expense[];
}

export function AddExpensePopover({ recurringExpenses }: AddExpensePopoverProps) {
    const [isOpen, setIsOpen] = useState(false)

    // 🚩 the size of the two buttons not matching, we use mobile popover for desktop too. 
    // We open the dialogs with the id, not with the trigger buttons until are fixed the styles
    return (
        <>
            {/* Desktop view */}
            <div className="hidden">
                <AddExpenseDialog />
                <AddFromRecurringExpenseDialog recurringExpenses={recurringExpenses} />
            </div>

            {/* Mobile view */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild className="">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Expense
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                    <div className="grid gap-2">
                        <div className="font-medium">Add Expense</div>
                        <div className="grid gap-2">
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => {
                                    setIsOpen(false)
                                    document.getElementById('add-expense-trigger')?.click()
                                }}
                            >
                                New Expense
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => {
                                    setIsOpen(false)
                                    document.getElementById('add-recurring-expense-trigger')?.click()
                                }}
                            >
                                From Recurring
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
} 