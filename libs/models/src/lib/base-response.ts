// BaseResponse is a generic type that represents a standard API response structure.
export type BaseResponse<T = unknown> = {
  data: T;
  message: string | null;
  code: number | null;
};

// PaginatedResponse extends BaseResponse to include pagination metadata.
export type PaginatedResponse<T> = BaseResponse<T[]> & {
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};
