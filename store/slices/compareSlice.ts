import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  items: any[];
}

const initialState: CompareState = { items: [] };

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    toggleCompare(state, action: PayloadAction<any>) {
      const idx = state.items.findIndex((a: any) => a.id === action.payload.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else if (state.items.length < MAX_COMPARE_ITEMS) {
        state.items.push(action.payload);
      }
    },
    clearCompare(state) {
      state.items = [];
    },
  },
});

export const { toggleCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
