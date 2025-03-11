"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
          className="text-foreground fill-foreground"
        />
        <YAxis
          stroke="hsl(var(--chart-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
          className="text-foreground fill-foreground"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              return (
                <div className="rounded-lg border bg-background/80 p-2 shadow-xl backdrop-blur-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-success))]" />
                      <span className="text-sm font-medium text-foreground">
                        Income: ${payload[0].value}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-destructive))]" />
                      <span className="text-sm font-medium text-foreground">
                        Expenses: ${payload[1].value}
                      </span>
                    </div>
                  </div>
                </div>
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
                    <span className="text-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-destructive))]" />
                    <span className="text-foreground">Expenses</span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="incomes"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
