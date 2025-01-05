export interface Income {
  id: number;
  userId: string;
  source: string;
  amount: string;
  date: Date | string | null;
}

export interface NewIncome {
  userId: string;
  source: string;
  amount: string;
  date: Date |string | null;
}