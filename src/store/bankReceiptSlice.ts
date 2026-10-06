import { createVoucherWorkflowSlice } from "./voucherWorkflowState";

const bankReceiptSlice = createVoucherWorkflowSlice("bankReceipt", "RECEIPT");

export const {
  patchState: patchBankReceiptState,
  resetState: resetBankReceiptState,
} = bankReceiptSlice.actions;
export default bankReceiptSlice.reducer;
