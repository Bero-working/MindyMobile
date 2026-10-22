// MOCK — xoá khi backend trả thông tin chuyển khoản (Phase 02 Q3).
import type { BankTransferInfo } from '../types/payment.type';
export const bankTransferMock: BankTransferInfo = {
  bankName: 'MB Bank',
  accountNumber: '0123 456 789',
  accountName: 'CONG TY MINDY CODING',
  transferNote: (orderCode) => `MINDY ${orderCode}`,
};
