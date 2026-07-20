import { z } from "zod";

export const cuidSchema = z.string().min(1);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(25),
});

export const searchParamsSchema = paginationSchema.extend({
  query: z.string().trim().max(160).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;
