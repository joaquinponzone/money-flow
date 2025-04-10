import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenses, getCurrentMonthExpenses, getCurrentMonthIncomes, getIncomes } from "./actions";
import { cn, formatCurrency } from "@/lib/utils";
import { XIcon, CheckIcon, Scale, FilePlus, FileMinus } from "lucide-react";
import BudgetOverview from "@/components/budget-overview";
import { UpcomingExpenses } from "@/components/upcoming-expenses";
import { getUserSession } from "@/lib/session";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExportButton } from "@/components/export-button";
import { ImportButton } from "@/components/import-button";

export default async function DashboardPage() {
  const user = await getUserSession()
  const userId = user?.id
  
  const [allExpenses, currentMonthExpenses, currentMonthIncomes, allIncomes] = await Promise.all([
    getExpenses(userId),
    getCurrentMonthExpenses(userId),
    getCurrentMonthIncomes(userId),
    getIncomes(userId)
  ])

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => 
    sum + parseFloat(expense.amount), 0
  );

  const paidExpenses = currentMonthExpenses.reduce((sum, expense) => 
    expense.paidAt ? sum + parseFloat(expense.amount) : sum, 0
  );

  const unpaidExpenses = totalExpenses - paidExpenses;

  const totalIncome = currentMonthIncomes.reduce((sum, income) => 
    sum + parseFloat(income.amount), 0
  );

  const balance = totalIncome - totalExpenses;
  const balancePercentage = totalIncome > 0 
    ? ((balance / totalIncome) * 100).toFixed(1) 
    : "0.0";
  const expensesPercentage = totalIncome > 0 
    ? ((totalExpenses / totalIncome) * 100).toFixed(1) 
    : "0.0";

  // Helper to get last 6 months including current month
  function getLastMonths(months_history: number) {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < months_history; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear()
      });
    }
    
    return months.reverse();
  }

  const budgetOverviewData = getLastMonths(6).map(({ month, year }) => {
    const monthExpenses = allExpenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === new Date(`${month} 1, ${year}`).getMonth() 
        && expenseDate.getFullYear() === year;
    });

    const monthIncomes = allIncomes.filter(income => {
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
      incomes: monthIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      )
    };
  });

  const budgetOverviewDataMobile = getLastMonths(2).map(({ month }) => {
    return {
      month: month,
      expenses: currentMonthExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      ),
      incomes: currentMonthIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      )
    }
  })

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' })

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {userId && (
          <div className="flex gap-2">
            <ImportButton userId={userId} />
            <ExportButton userId={userId} />
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-normal">Total Income</CardTitle>
              <FilePlus className="size-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><span className="font-mono">{formatCurrency(totalIncome)}</span></div>
              <p className="text-xs text-muted-foreground">{currentMonthName}&apos;s total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-normal">Total Expenses</CardTitle>
              <FileMinus className="size-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><span className="font-mono">{formatCurrency(totalExpenses)}</span></div>
              <div className="flex justify-between items-start">
                <p className="text-xs text-muted-foreground"><span className="font-mono">{expensesPercentage}%</span> of income</p>
                {unpaidExpenses > 0 && (
                  <span className="grid grid-cols-1 text-xs text-neutral-500 font-thin">Pending:<span className="text-red-500 font-mono">{formatCurrency(unpaidExpenses)}</span></span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-normal">Monthly Balance</CardTitle>
              {/* <TrendingUpIcon className="h-4 w-4 text-blue-500" /> */}
              <Scale className="size-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{formatCurrency(balance)}</div>
              <p className={cn("text-xs text-muted-foreground", balance > 0 ? "" : "text-red-500")}>{balance > 0 ? `You have the ${balancePercentage}% of your income is available for discretionary expenses or savings` : "No discretionary expenses or savings available"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border bg-card">
          <div className="block md:hidden p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <p className="text-sm text-muted-foreground mb-4">This is a summary of your income and expenses for the last 6 months.</p>
            <BudgetOverview data={budgetOverviewDataMobile}/>
          </div>

          <div className="hidden md:block p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <p className="text-sm text-muted-foreground mb-4">This is a summary of your income and expenses for the last 6 months.</p>
            <BudgetOverview data={budgetOverviewData}/>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 pb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Income Sources
                <span className="text-sm font-normal text-muted-foreground">
                  Current Month
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] w-full">
                <div className="space-y-6 p-3">
                  {currentMonthIncomes.map((income) => (
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
                  {currentMonthIncomes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No recent income sources
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Highest Expenses
                <span className="text-sm font-normal text-muted-foreground">
                  Current Month
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] w-full">
                <div className="space-y-6 p-3">
                  {currentMonthExpenses.map((expense) => (
                    <div key={expense.id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.date ? new Date(expense.date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", expense.paidAt ? "text-green-500" : "text-red-500")}>
                            {formatCurrency(parseFloat(expense.amount))}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full">
                            {expense.paidAt ? <CheckIcon className="h-2 w-2 text-green-500" /> : <XIcon className="h-2 w-2 text-red-500" />}
                          </span>
                        </div>
                      </div>
                      <div className="h-[1px] bg-border" />
                    </div>
                  ))}
                  {currentMonthExpenses.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No expenses this month
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div>
            <UpcomingExpenses expenses={allExpenses} />
          </div>
        </div>
      </div>
    </div>
  );
}
