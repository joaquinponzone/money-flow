"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const payments = [
  {
    id: 1,
    billName: "Electricity",
    amount: 150.00,
    date: "Mar 15, 2024",
    note: "March payment"
  },
  {
    id: 2,
    billName: "Internet",
    amount: 89.99,
    date: "Mar 05, 2024",
    note: "-"
  }
]

export default function PaymentHistory() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.billName}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>{payment.date}</TableCell>
              <TableCell>{payment.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

