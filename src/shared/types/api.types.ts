// ─── Generic API response shapes ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Matches the actual API shape: { success, message, data: T[], pagination: {...} } */
export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: Pagination;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  data: {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
  };
}

// ─── Pagination query params ──────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── RTK Query helpers ────────────────────────────────────────────────────────

export type QueryResult<T> = {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error?: ApiError;
};
