import { useState, useCallback } from 'react';

// ─── Server-side pagination state ─────────────────────────────────────────────

export interface PaginationState {
  page: number;       // 0-indexed for DataGrid, converted to 1-indexed for API
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationBag extends PaginationState {
  apiPage: number;    // 1-indexed
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  reset: () => void;
}

const DEFAULT_STATE: PaginationState = {
  page: 0,
  pageSize: 25,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function usePagination(defaults?: Partial<PaginationState>): PaginationBag {
  const [state, setState] = useState<PaginationState>({
    ...DEFAULT_STATE,
    ...defaults,
  });

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);
  const setPageSize = useCallback(
    (pageSize: number) => setState((s) => ({ ...s, pageSize, page: 0 })),
    []
  );
  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, search, page: 0 })),
    []
  );
  const setSortBy = useCallback(
    (sortBy: string) => setState((s) => ({ ...s, sortBy, page: 0 })),
    []
  );
  const setSortOrder = useCallback(
    (sortOrder: 'asc' | 'desc') => setState((s) => ({ ...s, sortOrder, page: 0 })),
    []
  );
  const reset = useCallback(() => setState({ ...DEFAULT_STATE, ...defaults }), [defaults]);

  return {
    ...state,
    apiPage: state.page + 1,
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    reset,
  };
}
