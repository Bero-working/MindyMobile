// Only terminal order results have a ticket. Other statuses stay on the QR screen.
export type PaymentResultState = 'PAID' | 'CANCELLED' | 'EXPIRED';
export type PaymentResult = {
  state: PaymentResultState;
  orderCode?: string;
  amount?: number;
};
