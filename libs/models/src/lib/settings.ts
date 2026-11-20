import { z } from 'zod';
import { emailField } from './fields';

export const languages = ['en', 'it'] as const;
export type Language = (typeof languages)[number];

export const weekStarts = ['monday', 'sunday'] as const;

/** Workspace settings: everyone signed in reads them, admins change them. */
export const workspaceSettingsSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters')
    .max(60, 'Use at most 60 characters'),
  supportEmail: emailField,
  defaultLanguage: z.enum(languages, 'Choose a language'),
  weekStartsOn: z.enum(weekStarts, 'Choose a day'),
});
export type WorkspaceSettings = z.infer<typeof workspaceSettingsSchema>;
