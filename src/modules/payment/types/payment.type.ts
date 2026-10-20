export type BankTransferInfo = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferNote: (orderCode: string) => string;
};
export type Payment = {
  status: 'CREATING' | 'PENDING';
  qrCode: string | null;
  amount: number;
  expiresAt: string | null;
};
export type PaymentOrder = {
  id: string;
  orderCode: string;
  totalAmount: number;
  expiresAt: string;
  details: { courseTitle: string }[];
};
