import { serve } from '@hono/node-server';
import { createApp } from './app';
import { connect } from './db/client';
import { readEnv } from './env';

const env = readEnv();
const { db, close } = connect(env.DATABASE_URL);
const app = createApp(db, env);

const server = serve(
  { fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' },
  info => {
    console.log(JSON.stringify({ msg: 'api listening', port: info.port }));
  }
);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => void close().then(() => process.exit(0)));
  });
}
