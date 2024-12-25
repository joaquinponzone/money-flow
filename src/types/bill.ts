export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month
  description?: string;
  category: string;
}