export interface Expense {
  id: string;
  name: string;
  amount: string;
  dueDate: Date;
  description: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: Date | null;
}

export interface NewExpense {
  name: string;
  description: string | null;
  amount: string;
  dueDate: Date;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
}