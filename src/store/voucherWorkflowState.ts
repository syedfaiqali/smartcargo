import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Voucher, VoucherCostLine } from "../domain/voucher";

export type VoucherWorkflowKind = "JOURNAL" | "RECEIPT" | "PAYMENT";

export interface VoucherWorkflowState {
  voucher: Voucher | null;
  editable: boolean;
  isPrintingView: boolean;
  tab: number;
  revision: number;
  saveToast: { id: number; text: string } | null;
  message: { severity: "success" | "error" | "warning"; text: string } | null;
  cost: VoucherCostLine | null;
  knockOffOpen: boolean;
  invoiceDialog: boolean;
  invoiceId: string;
  invoiceAmount: number;
  selected: string[];
}

const initialState = (): VoucherWorkflowState => ({
  voucher: null,
  editable: false,
  isPrintingView: false,
  tab: 0,
  revision: 0,
  saveToast: null,
  message: null,
  cost: null,
  knockOffOpen: true,
  invoiceDialog: false,
  invoiceId: "",
  invoiceAmount: 0,
  selected: [],
});

/** Each slice owns its state and action namespace; only the reducer logic is shared. */
export function createVoucherWorkflowSlice(
  name: "journalVoucher" | "bankReceipt" | "bankPayment",
  kind: VoucherWorkflowKind,
) {
  return createSlice({
    name,
    initialState: initialState(),
    reducers: {
      patchState(state, action: PayloadAction<Partial<VoucherWorkflowState>>) {
        if (action.payload.voucher && action.payload.voucher.kind !== kind)
          return;
        Object.assign(state, action.payload);
      },
      resetState: () => initialState(),
    },
  });
}
