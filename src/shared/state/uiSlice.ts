import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ColorMode, AppLocale } from '@/shared/types/common.types';
import { storage } from '@/shared/utils/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UiState {
  colorMode: ColorMode;
  locale: AppLocale;
  sidebarOpen: boolean;
  sidebarMobileOpen: boolean;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: UiState = {
  colorMode: storage.get<ColorMode>('colorMode') ?? 'light',
  // Use raw getItem (no JSON.parse) so i18next LanguageDetector can read the same key
  locale: (localStorage.getItem('locale') ?? 'de') as AppLocale,
  sidebarOpen: true,
  sidebarMobileOpen: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleColorMode(state) {
      state.colorMode = state.colorMode === 'light' ? 'dark' : 'light';
      storage.set('colorMode', state.colorMode);
    },
    setLocale(state, action: PayloadAction<AppLocale>) {
      state.locale = action.payload;
      // Store as raw string (no JSON.stringify) so i18next LanguageDetector
      // can read localStorage['locale'] directly without needing to JSON.parse
      localStorage.setItem('locale', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar(state) {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarMobileOpen = action.payload;
    },
  },
});

export const {
  toggleColorMode,
  setLocale,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectColorMode = (state: { ui: UiState }) => state.ui.colorMode;
export const selectLocale = (state: { ui: UiState }) => state.ui.locale;
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectMobileSidebarOpen = (state: { ui: UiState }) =>
  state.ui.sidebarMobileOpen;
