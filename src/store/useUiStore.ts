import { create } from 'zustand';

type UiState = {
  homeLayout: 'a' | 'b' | 'c';
  setHomeLayout: (v: 'a' | 'b' | 'c') => void;
};

export const useUiStore = create<UiState>((set) => ({
  homeLayout: 'a',
  setHomeLayout: (v) => set({ homeLayout: v }),
}));
