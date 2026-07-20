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
  success: true;
  message?: string;
  data: TData;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
};
