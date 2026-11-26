// Captured from gemma4:12b on a local Ollama by
// tools/assistant/record-conversations.mjs. Re-run it after changing the
// prompt, the components or the tools in ../../index.ts.
import type { Recording } from '../replay';
import whichAdmins from './01-which-admins-do-we-have.json';
import whoIsInactive from './02-who-is-inactive-right-now.json';
import usersPerRole from './03-how-many-users-are-there-per-role.json';
import showMeBob from './04-show-me-bob.json';

/** The recorded conversations the public demo plays, in the order it suggests them. */
export const RECORDINGS: readonly Recording[] = [
  whichAdmins,
  whoIsInactive,
  usersPerRole,
  showMeBob,
] as unknown as Recording[];
