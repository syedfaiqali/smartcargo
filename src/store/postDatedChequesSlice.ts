import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ChequeDetailFilters,
  emptyChequeFilters,
  PostDatedChequeDraft,
} from "../domain/postDatedCheque";

interface PostDatedChequesState {
  draft: PostDatedChequeDraft | null;
  view: "list" | "entry" | "printing";
  editable: boolean;
  tab: number;
  revision: number;
  selected: string[];
  filters: ChequeDetailFilters;
  appliedFilters: ChequeDetailFilters;
}
const initialState = (): PostDatedChequesState => ({
  draft: null,
  view: "list",
  editable: false,
  tab: 0,
  revision: 0,
  selected: [],
  filters: emptyChequeFilters(),
  appliedFilters: emptyChequeFilters(),
});
const slice = createSlice({
  name: "postDatedCheques",
  initialState: initialState(),
  reducers: {
    patchPostDatedChequesState(
      state,
      action: PayloadAction<Partial<PostDatedChequesState>>,
    ) {
      Object.assign(state, action.payload);
    },
    updatePostDatedChequeDraft(
      state,
      action: PayloadAction<Partial<PostDatedChequeDraft>>,
    ) {
      if (state.draft) Object.assign(state.draft, action.payload);
    },
    resetPostDatedChequesState: () => initialState(),
  },
});
export const {
  patchPostDatedChequesState,
  updatePostDatedChequeDraft,
  resetPostDatedChequesState,
} = slice.actions;
export default slice.reducer;
