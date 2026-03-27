export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};