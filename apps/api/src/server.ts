import app from './index';

const port = Number(process.env['PORT']) || 3100;

Bun.serve({
  fetch: app.fetch,
  port: port,
  // Bun closes a connection after 10 s without bytes. A local model can think
  // longer than that before the first token of an /ai/run stream (max 255).
  idleTimeout: 120,
});
