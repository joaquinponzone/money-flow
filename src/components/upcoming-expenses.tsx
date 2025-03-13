import { Expense } from "@/types/expense";
import { cn, formatCurrency, getDaysDifference } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpcomingExpensesProps {
  expenses: Expense[];
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  const upcomingExpenses = expenses
    .filter(expense => !expense.paidAt && expense.dueDate)
    .sort((a, b) => 
      (a.dueDate ? new Date(a.dueDate).getTime() : 0) - 
      (b.dueDate ? new Date(b.dueDate).getTime() : 0)
    )
    .slice(0, 5);

  function getDueDateLabel(dueDate: Date | string | null): string {
    if (!dueDate) return '';
    const days = getDaysDifference(dueDate);
    if (days < 0) {
      return `Overdue by ${Math.abs(days)} days`;
    }
    if (days === 0) {
      return 'Due today';
    }
    return `Due in ${days} days`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upcoming Expenses
          <span className="text-sm font-normal text-muted-foreground">
            Not paid
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px] p-2">
          <div className="space-y-1">
            {upcomingExpenses.map((expense) => {
              const dueLabel = getDueDateLabel(expense.dueDate);
              return (
                <div key={expense.id} className="flex flex-col gap-2 p-2">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="font-medium">{expense.title}</p>
                        <p className={cn("text-sm text-muted-foreground", dueLabel ? "text-red-500" : "")}>
                          {expense.date ? new Date(expense.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'} {dueLabel ? `(${dueLabel})` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold", expense.paidAt ? "text-green-500" : "text-red-500")}>
                          {formatCurrency(parseFloat(expense.amount))}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full">
                          {expense.paidAt ? <CheckIcon className="h-2 w-2 text-green-500" /> : <XIcon className="h-2 w-2 text-red-500" />}
                        </span>
                      </div>
                    </div>
                    <div className="h-[1px] bg-border" />
                  </div>
              );
            })}
            {upcomingExpenses.length === 0 && (
              <div className="flex h-[320px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No upcoming expenses</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
