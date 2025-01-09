"use client";

import { Button } from "@/components/ui/button";
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
import { Pencil, Trash } from "lucide-react";

interface IncomesTableProps {
  incomes: Income[];
  onEdit?: (income: Income) => void;
  onDelete?: (income: Income) => void;
}

export function IncomesTable({ incomes, onEdit, onDelete }: IncomesTableProps) {
  return (
    <>
      {/* Mobile view - Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {incomes.map((income) => (
          <div
            key={income.id}
            className="bg-card rounded-lg shadow-sm p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{income.source}</h3>
                <p className="text-2xl font-semibold text-primary">
                  {formatCurrency(Number(income.amount))}
                </p>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(income)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(income)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {income.date ? format(new Date(income.date), "MMM dd, yyyy") : "No date"}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>{income.source}</TableCell>
                <TableCell>{formatCurrency(Number(income.amount))}</TableCell>
                <TableCell>
                  {income.date ? format(new Date(income.date), "MMM dd, yyyy") : "No date"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(income)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(income)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
} 