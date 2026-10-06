import type { SetStateAction } from "react";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { patchJournalVoucherState } from "../../store/journalVoucherSlice";
import { patchBankReceiptState } from "../../store/bankReceiptSlice";
import { patchBankPaymentState } from "../../store/bankPaymentSlice";
import type {
  VoucherWorkflowKind,
  VoucherWorkflowState,
} from "../../store/voucherWorkflowState";

export function useVoucherWorkflowState(kind: VoucherWorkflowKind) {
  const key = kind === "JOURNAL" ? "journalVoucher" : kind === "PAYMENT" ? "bankPayment" : "bankReceipt";
  const state = useAppSelector((root) => root[key]);
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const patch = kind === "JOURNAL"
    ? patchJournalVoucherState
    : kind === "PAYMENT"
      ? patchBankPaymentState
      : patchBankReceiptState;
  const setter =
    <K extends keyof VoucherWorkflowState>(field: K) =>
    (update: SetStateAction<VoucherWorkflowState[K]>) => {
      // Read the latest value so batched edits and async attachments cannot overwrite newer edits.
      const current = store.getState()[key][field];
      const value = typeof update === "function" ? update(current) : update;
      dispatch(patch({ [field]: value }));
    };

  return {
    ...state,
    setVoucher: setter("voucher"),
    setEditable: setter("editable"),
    setIsPrintingView: setter("isPrintingView"),
    setTab: setter("tab"),
    setRevision: setter("revision"),
    setSaveToast: setter("saveToast"),
    setMessage: setter("message"),
    setCost: setter("cost"),
    setKnockOffOpen: setter("knockOffOpen"),
    setInvoiceDialog: setter("invoiceDialog"),
    setInvoiceId: setter("invoiceId"),
    setInvoiceAmount: setter("invoiceAmount"),
    setSelected: setter("selected"),
  };
}
