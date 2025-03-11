import { IncomesTable } from "@/app/incomes/components/incomes-table";
import { getIncomes } from "../actions";
import { getUserSession } from "@/lib/session";

export default async function IncomesPage() {
  const user = await getUserSession();
  const userId = user?.id;
  
  const allIncomes = await getIncomes(userId);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-3xl font-bold">Incomes</h1> */}
      </div>
      <IncomesTable incomes={allIncomes} />
    </div>
  );
} 