import { IncomesTable } from "@/app/incomes/components/incomes-table";
import { getIncomes } from "../actions";
import { getUserSession } from "@/lib/session";

export default async function IncomesPage() {
  const user = await getUserSession();
  const userId = user?.id;
  const allIncomes = await getIncomes(userId);

  if (!userId) {
    return <div>No user found</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <IncomesTable incomes={allIncomes} userId={userId} />
    </div>
  );
} 