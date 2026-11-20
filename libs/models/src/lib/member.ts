import * as z from 'zod';
import { emailField, nameField } from './fields';

/** Roles inside the demo workspace (data shown on the dashboard, not login accounts). */
export const memberRoles = ['admin', 'editor', 'viewer'] as const;
export type MemberRole = (typeof memberRoles)[number];

export const memberStatuses = ['active', 'invited', 'inactive'] as const;
export type MemberStatus = (typeof memberStatuses)[number];

/** What an admin sends to create or update a member. Shared by the form and the API. */
export const memberInputSchema = z.object({
  name: nameField,
  email: emailField,
  role: z.enum(memberRoles, 'Choose a role'),
  status: z.enum(memberStatuses, 'Choose a status'),
});
export type MemberInput = z.infer<typeof memberInputSchema>;

/** A member as the API returns it. */
export interface Member extends MemberInput {
  id: string;
  createdAt: string;
}

/** Query string of GET /api/members. */
export const memberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  size: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(80).optional(),
  role: z.enum(memberRoles).optional(),
  status: z.enum(memberStatuses).optional(),
});
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;

export const memberIdSchema = z.object({ id: z.uuid() });

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
