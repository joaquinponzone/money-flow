import { Expense } from "@/types/expense";
import { formatLocalDate, getDaysDifference } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

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
        <CardTitle>Upcoming Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingExpenses.map((expense) => {
          const dueLabel = getDueDateLabel(expense.dueDate);
          return (
            <div key={expense.id} className="flex items-start space-x-4">
              <div className="rounded-full p-2 bg-muted">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="flex gap-1 items-center font-medium">
                    {expense.title}
                    <span className={`text-sm ${
                      dueLabel.includes('Overdue') ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      ({dueLabel})
                    </span>
                  </p>
                  <p className="font-medium">${expense.amount}</p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {expense.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatLocalDate(expense.dueDate)}
                </p>
              </div>
            </div>
          );
        })}
        {upcomingExpenses.length === 0 && (
          <p className="text-center text-muted-foreground">No upcoming expenses</p>
        )}
      </CardContent>
    </Card>
  );
}
