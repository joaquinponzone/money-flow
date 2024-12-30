import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPayments } from '@/app/actions'

export default async function PaymentHistory() {
  const payments = await getPayments()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead>Expense Name</TableHead> */}
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              {/* <TableCell>{payment.expenseId}</TableCell> */}
              <TableCell>{payment.paidAt ? payment.paidAt.toLocaleDateString() : ''}</TableCell>
              <TableCell>{payment.note}</TableCell>
              <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
