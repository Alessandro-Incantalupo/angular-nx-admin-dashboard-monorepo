/** Reads a connection string from the environment, or stops with a clear message. */
export function requireUrl(name: string): string {
  const url = process.env[name];
  if (!url) {
    console.error(`${name} is not set. See .env.example.`);
    process.exit(1);
  }
  return url;
}

/** A host name only, for messages: never the user or password. */
export const hostOf = (url: string) => new URL(url).host;
