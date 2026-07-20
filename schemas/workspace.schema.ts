import { z } from "zod";
import { Role } from "@prisma/client";

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters long."),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters.").optional().nullable(),
  logoUrl: z.string().trim().url("Invalid logo URL.").or(z.string().length(0)).optional().nullable(),
  domain: z.string().trim().max(160).optional().nullable(),
  preferences: z.record(z.string(), z.any()).optional(),

});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address."),
  role: z.nativeEnum(Role, { message: "Invalid role selected." }),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role, { message: "Invalid role selected." }),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required."),
  name: z.string().trim().min(1, "Name is required.").optional(),
  password: z.string().min(8, "Password must be at least 8 characters long.").optional(),
});

export const membersFilterSchema = z.object({
  query: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "email", "role", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type MembersFilterInput = z.infer<typeof membersFilterSchema>;
