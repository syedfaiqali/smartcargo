import { configureStore } from '@reduxjs/toolkit';
import seaExportJobReducer from './seaExportJobSlice';

export const store = configureStore({
  reducer: { seaExportJob: seaExportJobReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
