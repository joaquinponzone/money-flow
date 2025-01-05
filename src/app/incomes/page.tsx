import { IncomesTable } from "@/components/incomes/incomes-table";
import { getIncomes } from "../actions";

export default async function IncomesPage() {
  const incomes = await getIncomes();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Incomes</h1>
      </div>
      <IncomesTable incomes={incomes} />
    </div>
  );
} 