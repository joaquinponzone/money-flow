"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: 'Housing', value: 1200 },
  { name: 'Utilities', value: 240 },
  { name: 'Transportation', value: 350 },
  { name: 'Insurance', value: 180 },
  { name: 'Other', value: 270 },
]

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function ExpensesByCategory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              housing: {
                label: "Housing",
                color: "hsl(var(--chart-1))",
              },
              utilities: {
                label: "Utilities",
                color: "hsl(var(--chart-2))",
              },
              transportation: {
                label: "Transportation",
                color: "hsl(var(--chart-3))",
              },
              insurance: {
                label: "Insurance",
                color: "hsl(var(--chart-4))",
              },
              other: {
                label: "Other",
                color: "hsl(var(--chart-5))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <ChartLegend className="mt-4" />
      </CardContent>
    </Card>
  )
}

