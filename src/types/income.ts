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

export interface ImportIncomeRow {
  Title?: string;
  Amount?: number;
  Category?: string;
  Description?: string;
  'Due Date'?: string | number | Date;
  'Paid At'?: string | number | Date;
  'Is Recurring'?: string;
}