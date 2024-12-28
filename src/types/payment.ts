export interface Payment {
    id: string;
    billId: string;
    amount: string;
    paidAt: Date;
    note?: string | null;
    createdAt?: Date | null;
  } 