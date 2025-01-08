export interface Expense {
  id: number;
  userId: string;
  title: string;
  amount: string;
  description: string | null;
  category: string | null;
  date: Date | string | null;
  isRecurring: boolean | null;
  paidAt: Date | string | null;
  dueDate: Date | string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface NewExpense {
  userId: string;
  title: string;
  amount: string;
  description: string | null;
  category: string | null;
  date: Date | string | null;
  isRecurring: boolean | null;
  paidAt: Date | string | null;
  dueDate: Date | string | null;
}