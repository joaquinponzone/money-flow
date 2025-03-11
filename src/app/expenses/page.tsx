import { ExpensesTable } from "@/app/expenses/components/expenses-table";
import { getExpenses } from "../actions";
import { getUserSession } from "@/lib/session";

export default async function ExpensesPage() {
  const user = await getUserSession();
  const userId = user?.id;
  
  const allExpenses = await getExpenses(userId);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-3xl font-bold">Expenses</h1> */}
      </div>
      <ExpensesTable expenses={allExpenses} />
    </div>
  );
} 