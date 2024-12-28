'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getExpensesByCategory } from "@/app/actions"

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function ExpensesByCategory() {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([])
  const [config, setConfig] = useState<Record<string, { label: string; color: string }>>({})

  useEffect(() => {
    async function fetchData() {
      const expenseData = await getExpensesByCategory()
      setData(expenseData)

      const newConfig = expenseData.reduce((acc, { name }, index) => {
        acc[name.toLowerCase()] = {
          label: name,
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        }
        return acc
      }, {} as Record<string, { label: string; color: string }>)

      setConfig(newConfig)
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={config}>
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
