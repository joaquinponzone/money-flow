"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface BudgetOverviewProps {
  data: {
    income: number;
    expenses: number;
    month: string;
  }[];
}

export default function BudgetOverview({ data }: BudgetOverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const income = payload[0].value as number;
              const expenses = payload[1].value as number;
              const savings = income - expenses;
              
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.70rem] text-muted-foreground">Income</span>
                        <span className="font-bold text-green-500">
                          ${income.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.70rem] text-muted-foreground">Expenses</span>
                        <span className="font-bold text-red-500">
                          ${expenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-1 mt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[0.70rem] text-muted-foreground">Savings</span>
                          <span className={`font-bold ${savings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${Math.abs(savings).toLocaleString()}
                          </span>
                        </div>
                      </div>
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
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Expenses</span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey="income"
          fill="hsl(var(--success))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--destructive))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
