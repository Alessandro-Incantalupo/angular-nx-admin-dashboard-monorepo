/**
 * BaseResponse is a generic type that represents a standard API response structure (Envelope Pattern).
 */
export type BaseResponse<T = unknown> = {
  data: T;
  message: string | null;
  code: number | null;
};

/**
 * PaginatedResponse extends BaseResponse to include pagination metadata.
 * Aligned with the Quarkus backend PaginatedResponse.
 */
export type PaginatedResponse<T> = BaseResponse<T[]> & {
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

/**
 * ProblemDetails follows the RFC 7807 standard for professional error handling.
 * This is the standard "Error Envelope" used by our Quarkus backend.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  fieldErrors?: FieldError[];
  [key: string]: any; // Allow for custom JHipster extensions like entityName, errorKey
}

/**
 * FieldError represents a specific validation failure in a form/entity.
 */
export interface FieldError {
  objectName: string;
  field: string;
  message: string;
}
