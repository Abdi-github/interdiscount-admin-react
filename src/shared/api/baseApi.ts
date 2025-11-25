import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import type { RootState } from '@/app/store';
import { setCredentials, logout } from '@/shared/state/authSlice';
import { API_TAGS, type ApiTag } from './apiTags';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
  prepareHeaders(headers, { getState }) {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// ─── Base query with automatic token refresh on 401 ──────────────────────────

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  // Prevent concurrent refresh attempts
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;
        if (refreshToken) {
          const refreshResult = await rawBaseQuery(
            {
              url: '/public/auth/refresh',
              method: 'POST',
              body: { refresh_token: refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const refreshData = refreshResult.data as {
              data: { tokens: { access_token: string; refresh_token: string } };
            };
            api.dispatch(
              setCredentials({
                user: (api.getState() as RootState).auth.user!,
                access_token: refreshData.data.tokens.access_token,
                refresh_token: refreshData.data.tokens.refresh_token,
              })
            );
            // Retry original request with new token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      // Wait for ongoing refresh to complete, then retry
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// ─── Base API ─────────────────────────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(API_TAGS) as ApiTag[],
  endpoints: () => ({}),
});
