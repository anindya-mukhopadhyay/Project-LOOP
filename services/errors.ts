import type { ApiErrorCode } from "@/types/api";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode = "INTERNAL_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export type ServiceResult<TData> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      error: ServiceError;
    };
