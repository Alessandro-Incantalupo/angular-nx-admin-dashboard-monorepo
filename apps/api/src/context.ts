import type { SessionUser } from '@dashboard/models';
import type { Auth } from './auth';
import type { Db } from './db/client';
import type { Env } from './env';
import type { Throttle } from './lib/throttle';

export interface Deps {
  db: Db;
  env: Env;
  auth: Auth;
  throttle: Throttle;
}

/** What middleware puts on the request context. */
export interface AppEnv {
  Variables: {
    /** The signed-in account, or null. Set by the access middleware. */
    user: SessionUser | null;
  };
}
