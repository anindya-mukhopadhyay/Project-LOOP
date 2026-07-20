import { z, type ZodSchema } from "zod";

import type { ApiErrorCode } from "@/types/api";

export class RequestValidationError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function parseWithSchema<TOutput>(payload: unknown, schema: ZodSchema<TOutput>) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new RequestValidationError(
      "Request validation failed.",
      "VALIDATION_ERROR",
      z.treeifyError(parsed.error),
    );
  }

  return parsed.data;
}

export async function parseJsonBody<TOutput>(request: Request, schema: ZodSchema<TOutput>) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new RequestValidationError("Malformed JSON request body.", "BAD_REQUEST");
  }

  return parseWithSchema(payload, schema);
}

export function parseSearchParams<TOutput>(
  searchParams: URLSearchParams,
  schema: ZodSchema<TOutput>,
) {
  return parseWithSchema(Object.fromEntries(searchParams.entries()), schema);
}
