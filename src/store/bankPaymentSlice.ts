import { createVoucherWorkflowSlice } from "./voucherWorkflowState";

const bankPaymentSlice = createVoucherWorkflowSlice("bankPayment", "PAYMENT");

export const {
  patchState: patchBankPaymentState,
  resetState: resetBankPaymentState,
} = bankPaymentSlice.actions;
export default bankPaymentSlice.reducer;
