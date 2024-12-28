import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUpcomingExpenses } from '@/app/actions'

export default async function UpcomingExpenses() {
  const upcomingExpenses = await getUpcomingExpenses()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center space-x-4 rounded-md border p-4"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{expense.name}</p>
                <p className="text-sm text-muted-foreground">
                  Due in {expense.daysUntilDue} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${expense.amount}</p>
                <p className="text-sm text-muted-foreground">{expense.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
