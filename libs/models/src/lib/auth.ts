import * as z from 'zod';
import { emailField } from './fields';

/** Roles of login accounts. Viewers read, admins also write. */
export const accountRoles = ['admin', 'viewer'] as const;
export type AccountRole = (typeof accountRoles)[number];

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Enter your password')
    .max(128, 'Use at most 128 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const newPasswordField = z
  .string()
  .min(12, 'Use at least 12 characters')
  .max(128, 'Use at most 128 characters');

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(128),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Repeat the new password'),
  })
  .refine(v => v.newPassword === v.confirmPassword, {
    message: 'The two new passwords are different',
    path: ['confirmPassword'],
  })
  .refine(v => v.newPassword !== v.currentPassword, {
    message: 'Choose a password you are not using now',
    path: ['newPassword'],
  });
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/** The signed-in account, as GET /api/auth/session returns it. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  /** The public demo account: read-only, its password can't be changed. */
  demo: boolean;
}
