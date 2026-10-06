import type { AuditFields } from "./common";
import type { VoucherClearingLine } from "./voucher";

export const chequeStatuses = {
  UNCLEARED: "Un Cleared",
  DEPOSITED: "Deposited",
  CLEARED: "Cleared",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
} as const;
export const chequeTypes = {
  OPEN: "Open",
  CROSSED: "Crossed",
  PAYEE_ACCOUNT_ONLY: "Payee A/C Only",
} as const;
export interface PostDatedCheque extends AuditFields {
  branch: string;
  receiptNo: string;
  receiptDate: string;
  chequeNo: string;
  chequeDate: string;
  amount: number;
  partyCode: string;
  partyName: string;
  remarks: string;
  bankCode: string;
  depositedDate: string;
  slipNo: string;
  chequeType: keyof typeof chequeTypes;
  chequeStatus: keyof typeof chequeStatuses;
  clearedDate: string;
  bankReceiptNo: string;
  bankReceiptYear: string;
  currencyCode: string;
  exchangeRate: number;
  invoices: VoucherClearingLine[];
}
export type PostDatedChequeDraft = Omit<
  PostDatedCheque,
  "amount" | "exchangeRate"
> & {
  amount: string;
  exchangeRate: string;
};
export interface ChequeDetailFilters {
  branch: string;
  partyCode: string;
  dateField: "chequeDate" | "receiptDate";
  chequeNo: string;
  startDate: string;
  endDate: string;
  status: "ALL" | PostDatedCheque["chequeStatus"];
}
export const emptyChequeFilters = (): ChequeDetailFilters => ({
  branch: "KHI",
  partyCode: "",
  dateField: "chequeDate",
  chequeNo: "",
  startDate: "",
  endDate: "",
  status: "ALL",
});
export const chequeToDraft = (
  cheque: PostDatedCheque,
): PostDatedChequeDraft => ({
  ...cheque,
  amount: String(cheque.amount),
  exchangeRate: String(cheque.exchangeRate),
});
