export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiSuccessResponse<TData> = {
  data: TData;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
};
