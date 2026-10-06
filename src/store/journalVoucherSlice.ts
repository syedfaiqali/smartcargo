import { createVoucherWorkflowSlice } from "./voucherWorkflowState";

const journalVoucherSlice = createVoucherWorkflowSlice(
  "journalVoucher",
  "JOURNAL",
);

export const {
  patchState: patchJournalVoucherState,
  resetState: resetJournalVoucherState,
} = journalVoucherSlice.actions;
export default journalVoucherSlice.reducer;
