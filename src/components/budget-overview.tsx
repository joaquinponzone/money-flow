"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChartContainer, 
  ChartLegend, 
  ChartTooltip, 
  // ChartTooltipContent
 } from "@/components/ui/chart"

const data = [
  { month: 'Jan', income: 5240, expenses: 1440 },
  { month: 'Feb', income: 5240, expenses: 1520 },
  { month: 'Mar', income: 5240, expenses: 1380 },
  { month: 'Apr', income: 5240, expenses: 1450 },
  { month: 'May', income: 5240, expenses: 1439 },
  { month: 'Jun', income: 5240, expenses: 1440 },
]

export default function BudgetOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ChartContainer
            config={{
              income: {
                label: "Income",
                color: "hsl(var(--chart-1))",
              },
              expenses: {
                label: "Expenses",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar 
                  name="Income" 
                  dataKey="income" 
                  fill="hsl(var(--emerald-500))" 
                  radius={[4, 4, 0, 0]} 
                  isAnimationActive={false}
                />
                <Bar 
                  name="Expenses" 
                  dataKey="expenses" 
                  fill="hsl(var(--rose-500))" 
                  radius={[4, 4, 0, 0]} 
                  isAnimationActive={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-sm uppercase">INCOME</span>
                              <span className="font-bold text-emerald-500">
                                ${payload[0].value}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm uppercase">EXPENSES</span>
                              <span className="font-bold text-rose-500">
                                ${payload[1].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <ChartLegend className="mt-4" />
      </CardContent>
    </Card>
  )
}

