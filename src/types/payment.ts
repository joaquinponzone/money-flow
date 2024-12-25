export interface Payment {
    id: string;
    billId: string;
    amount: number;
    paidAt: string;
    note?: string;
  } 