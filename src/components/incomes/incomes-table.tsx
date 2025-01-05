"use client";

import { Income } from "@/types/income";
import { formatLocalDate, sortByDateDesc, isCurrentMonth } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AddIncomeDialog } from "./add-income-dialog";
import { EditIncomeDialog } from "./edit-income-dialog";
import { DeleteIncomeDialog } from "./delete-income-dialog";

interface IncomesTableProps {
  incomes: Income[];
}

export function IncomesTable({ incomes }: IncomesTableProps) {
  const currentMonthIncomes = incomes.filter(income => 
    income.date && isCurrentMonth(income.date)
  );

  const incomesHistory = incomes
    .filter(income => income.date && !isCurrentMonth(income.date))
    .sort((a, b) => sortByDateDesc(a.date, b.date));

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">
            Monthly Overview
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Manage your income sources and track your earnings.
            </p>
          </h2>
          <AddIncomeDialog />
        </div>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList>
            <TabsTrigger value="monthly">Monthly Incomes</TabsTrigger>
            <TabsTrigger value="history">Income History</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Source</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No incomes for the current month
                      </td>
                    </tr>
                  ) : (
                    currentMonthIncomes.map((income) => (
                      <tr key={income.id} className="border-b">
                        <td className="py-3 px-4">{income.source}</td>
                        <td className="py-3 px-4 font-medium">${income.amount}</td>
                        <td className="py-3 px-4">
                          {formatLocalDate(income.date)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <EditIncomeDialog income={income} />
                          <DeleteIncomeDialog 
                            incomeId={income.id} 
                            incomeSource={income.source} 
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Source</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomesHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No income history available
                      </td>
                    </tr>
                  ) : (
                    incomesHistory.map((income) => (
                      <tr key={income.id} className="border-b">
                        <td className="py-3 px-4">{income.source}</td>
                        <td className="py-3 px-4 font-medium">${income.amount}</td>
                        <td className="py-3 px-4">
                          {formatLocalDate(income.date)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <EditIncomeDialog income={income} />
                          <DeleteIncomeDialog 
                            incomeId={income.id} 
                            incomeSource={income.source} 
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 