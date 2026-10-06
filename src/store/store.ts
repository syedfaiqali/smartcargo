import { configureStore } from "@reduxjs/toolkit";
import seaExportJobReducer from "./seaExportJobSlice";
import journalVoucherReducer from "./journalVoucherSlice";
import bankReceiptReducer from "./bankReceiptSlice";

export const createAppStore = () =>
  configureStore({
    reducer: {
      seaExportJob: seaExportJobReducer,
      journalVoucher: journalVoucherReducer,
      bankReceipt: bankReceiptReducer,
    },
  });

export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
