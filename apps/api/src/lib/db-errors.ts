/** True for a Postgres unique violation, whether Drizzle wrapped the driver error or not. */
export function isUniqueViolation(err: unknown): boolean {
  for (
    let e: unknown = err, i = 0;
    e && i < 3;
    e = (e as { cause?: unknown }).cause, i++
  ) {
    if ((e as { code?: string }).code === '23505') return true;
  }
  return false;
}
