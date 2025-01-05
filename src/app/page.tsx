import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenses, getIncomes } from "./actions";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import BudgetOverview from "@/components/budget-overview";
import { UpcomingExpenses } from "@/components/upcoming-expenses";

export default async function DashboardPage() {
  const [expenses, incomes] = await Promise.all([
    getExpenses(),
    getIncomes()
  ]);

  const totalExpenses = expenses.reduce((sum, expense) => 
    sum + parseFloat(expense.amount), 0
  );

  const totalIncome = incomes.reduce((sum, income) => 
    sum + parseFloat(income.amount), 0
  );

  const savings = totalIncome - totalExpenses;
  const savingsPercentage = ((savings / totalIncome) * 100).toFixed(1);
  const expensesPercentage = ((totalExpenses / totalIncome) * 100).toFixed(1);

  // Helper to get last 6 months including current month
  function getLast6Months() {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear()
      });
    }
    
    return months.reverse();
  }

  const budgetOverviewData = getLast6Months().map(({ month, year }) => {
    const monthExpenses = expenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === new Date(`${month} 1, ${year}`).getMonth() 
        && expenseDate.getFullYear() === year;
    });

    const monthIncomes = incomes.filter(income => {
      if (!income.date) return false;
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === new Date(`${month} 1, ${year}`).getMonth() 
        && incomeDate.getFullYear() === year;
    });

    return {
      month: `${month}${year !== new Date().getFullYear() ? ` ${year}` : ''}`,
      expenses: monthExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      ),
      income: monthIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      )
    };
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Financial Dashboard</h1>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Monthly total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{expensesPercentage}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savings)}</div>
            <p className="text-xs text-muted-foreground">{savingsPercentage}% of income</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
          <BudgetOverview data={budgetOverviewData}/>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Income Sources
              <span className="text-sm font-normal text-muted-foreground">
                Last 30 days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {incomes.slice(0, 5).map((income) => (
                <div key={income.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="font-medium">{income.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {income.date ? new Date(income.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatCurrency(parseFloat(income.amount))}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="h-[1px] bg-border" />
                </div>
              ))}
              {incomes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No recent income sources
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div>
          <UpcomingExpenses expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
