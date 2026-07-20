import { NextResponse } from "next/server";

import type { ApiErrorCode, ApiErrorResponse, ApiSuccessResponse } from "@/types/api";

type ApiErrorOptions = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  details?: unknown;
};

export function apiSuccess<TData>(data: TData, init?: ResponseInit) {
  const body: ApiSuccessResponse<TData> = {
    data,
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(body, init);
}

export function apiError({ code, message, status = 400, details }: ApiErrorOptions) {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(body, { status });
}

export function notImplemented(moduleName: string) {
  return apiError({
    code: "NOT_IMPLEMENTED",
    message: `${moduleName} is registered in the Phase 1 foundation and has no business flow yet.`,
    status: 501,
  });
}
