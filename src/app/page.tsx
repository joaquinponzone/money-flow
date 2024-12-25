import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import PaymentHistory from "@/components/payment-history"
import AddBillDialog from "@/components/add-bill-dialog"
import UpcomingBills from "@/components/upcoming-bills"
import BudgetOverview from "@/components/budget-overview"
import ExpensesByCategory from "@/components/expenses-by-category"
import SavingsGoals from "@/components/savings-goals"
import BillsTable from "@/components/bills-table"


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Bills Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your monthly bills and view payment history
          </p>
        </div>
        <AddBillDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        </AddBillDialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,240.00</div>
            <p className="text-xs text-muted-foreground">+4.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,439.99</div>
            <p className="text-xs text-muted-foreground">27.5% of income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,800.00</div>
            <p className="text-xs text-muted-foreground">53.4% of income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discretionary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,000.01</div>
            <p className="text-xs text-muted-foreground">19.1% of income</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <BudgetOverview />
        <ExpensesByCategory />
        <SavingsGoals />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="space-y-4">
              <TabsList>
                <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="space-y-4">
                <BillsTable />
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <PaymentHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <UpcomingBills />
      </div>
    </div>
  )
}

