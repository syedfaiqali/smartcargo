import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SeaExportJob } from '../domain/seaExportJob';

interface SeaExportJobState {
  currentJob: SeaExportJob | null;
}

const initialState: SeaExportJobState = { currentJob: null };

const seaExportJobSlice = createSlice({
  name: 'seaExportJob',
  initialState,
  reducers: {
    setCurrentSeaExportJob(state, action: PayloadAction<SeaExportJob | null>) {
      state.currentJob = action.payload;
    },
  },
});

export const { setCurrentSeaExportJob } = seaExportJobSlice.actions;
export default seaExportJobSlice.reducer;
