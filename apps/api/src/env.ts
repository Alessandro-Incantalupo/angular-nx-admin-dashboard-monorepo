import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().default(3100),
  /** The app's own role: reads and writes rows, can't change tables. */
  DATABASE_URL: z.url(),
  /** Signs session cookies and keys the login throttle's hashes. 32+ characters. */
  BETTER_AUTH_SECRET: z.string().min(32),
  /**
   * Where the Angular app is served. The browser calls the API through that
   * origin (`/api`), so it is also the cookie's origin. Comma-separated for
   * more than one (local dev plus a preview, for example).
   */
  FRONTEND_ORIGIN: z
    .string()
    .transform(v =>
      v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.url()).min(1)),
  /**
   * How many proxies in front of the API append to X-Forwarded-For (the CDN
   * that forwards /api, the platform's load balancer...). 0 reads the socket.
   */
  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(
  source: Record<string, string | undefined> = process.env
): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    // Names only: values may be secrets.
    const names = parsed.error.issues.map(i => i.path.join('.')).join(', ');
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  return parsed.data;
}
