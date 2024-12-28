"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const goals = [
  {
    name: "Emergency Fund",
    current: 15000,
    target: 20000,
    progress: 75
  },
  {
    name: "Vacation",
    current: 2500,
    target: 5000,
    progress: 50
  },
  {
    name: "New Car",
    current: 8000,
    target: 30000,
    progress: 27
  }
]

export default function SavingsGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.name}</span>
                <span className="text-muted-foreground">
                  ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </span>
              </div>
              <Progress value={goal.progress} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
