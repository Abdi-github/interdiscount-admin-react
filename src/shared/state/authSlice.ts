import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/shared/types/common.types';
import { storage } from '@/shared/utils/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const persistedToken = storage.get<string>('accessToken');
const persistedUser = storage.get<User>('user');

const initialState: AuthState = {
  user: persistedUser,
  accessToken: persistedToken,
  refreshToken: storage.get<string>('refreshToken'),
  isAuthenticated: !!persistedToken && !!persistedUser,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; access_token: string; refresh_token: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isAuthenticated = true;
      storage.set('accessToken', action.payload.access_token);
      storage.set('refreshToken', action.payload.refresh_token);
      storage.set('user', action.payload.user);
    },
    updateTokens(
      state,
      action: PayloadAction<{ access_token: string; refresh_token: string }>
    ) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      storage.set('accessToken', action.payload.access_token);
      storage.set('refreshToken', action.payload.refresh_token);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      storage.remove('accessToken');
      storage.remove('refreshToken');
      storage.remove('user');
    },
  },
});

export const { setCredentials, updateTokens, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
