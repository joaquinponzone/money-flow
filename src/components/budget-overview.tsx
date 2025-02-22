"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

interface BudgetOverviewProps {
  data: {
    month: string
    incomes: number
    expenses: number
  }[]
}

export default function BudgetOverview({ data }: BudgetOverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="hsl(var(--chart-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="bg-blue-200"
        />
        <YAxis
          stroke="hsl(var(--chart-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              return (
                <Card className="border border-border/50 p-2 shadow-xl">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-success))]" />
                      <span className="text-sm font-medium">
                        Income: ${payload[0].value}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-destructive))]" />
                      <span className="text-sm font-medium">
                        Expenses: ${payload[1].value}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            }
            return null
          }}
        />
        <Legend
          content={({ payload }) => {
            if (payload && payload.length) {
              return (
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-success))]" />
                    <span className="text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-destructive))]" />
                    <span className="text-muted-foreground">Expenses</span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="incomes"
          fill="hsl(var(--chart-success))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--chart-destructive))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
