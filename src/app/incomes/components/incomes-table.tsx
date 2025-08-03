"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Income } from "@/types/income";
import { format } from "date-fns";
import { EditIncomeDialog } from "./edit-income-dialog";
import { DeleteIncomeDialog } from "./delete-income-dialog";
import { AddIncomeDialog } from "./add-income-dialog";
import { Card, CardContent } from "../../../components/ui/card";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface IncomesTableProps {
  incomes: Income[];
  userId: string;
}

export function IncomesTable({ incomes, userId }: IncomesTableProps) {
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const sortedIncomes = [...incomes].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const pagination = usePagination({
    data: sortedIncomes,
    itemsPerPage,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Income Overview</h2>
        <AddIncomeDialog userId={userId} />
      </div>

      {/* Mobile view - Cards */}
      <div className="grid gap-4 md:hidden">
        {pagination.currentData.map((income) => (
          <Card key={income.id} className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{income.source}</h3>
                  <p className="text-2xl font-semibold text-primary">
                    {formatCurrency(Number(income.amount))}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {income.date
                        ? format(new Date(income.date), "MMM dd, yyyy")
                        : "No date"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <EditIncomeDialog income={income} />
                  <DeleteIncomeDialog
                    incomeId={income.id}
                    incomeSource={income.source}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pagination.currentData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No income records found
          </p>
        )}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block">
        <Table className="bg-background rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="p-4">Source</TableHead>
              <TableHead className="p-4">Amount</TableHead>
              <TableHead className="p-4">Date</TableHead>
              <TableHead className="text-right p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.currentData.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="p-4">
                  <div className="font-medium">{income.source}</div>
                </TableCell>
                <TableCell className="font-mono p-4">
                  {formatCurrency(Number(income.amount))}
                </TableCell>
                <TableCell className="p-4">
                  {income.date
                    ? format(new Date(income.date), "MMM dd, yyyy")
                    : "No date"}
                </TableCell>
                <TableCell className="text-right p-4">
                  <div className="flex justify-end gap-2">
                    <EditIncomeDialog income={income} />
                    <DeleteIncomeDialog
                      incomeId={income.id}
                      incomeSource={income.source}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagination.currentData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No income records found
          </p>
        )}
      </div>

      {/* Pagination */}
      <DataTablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
} 