"use client"

import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const upcomingBills = [
  {
    name: "Rent",
    amount: 1200,
    dueDate: "Jan 1",
    daysUntilDue: 3
  },
  {
    name: "Internet",
    amount: 89.99,
    dueDate: "Jan 5",
    daysUntilDue: 7
  },
  {
    name: "Electricity",
    amount: 150,
    dueDate: "Jan 15",
    daysUntilDue: 17
  }
]

export default function UpcomingBills() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBills.map((bill) => (
            <div
              key={bill.name}
              className="flex items-center space-x-4 rounded-md border p-4"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{bill.name}</p>
                <p className="text-sm text-muted-foreground">
                  Due in {bill.daysUntilDue} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${bill.amount}</p>
                <p className="text-sm text-muted-foreground">{bill.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

