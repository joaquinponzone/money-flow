import { ExpensesTable } from "@/components/expenses/expenses-table";
import { getExpenses } from "../actions";

export default async function ExpensesPage() {
  const userId = "550e8400-e29b-41d4-a716-446655440000";
  if (!userId) return null;

  const [allExpenses] = await Promise.all([
    getExpenses(),
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
      </div>
      <ExpensesTable expenses={allExpenses} />
    </div>
  );
} 