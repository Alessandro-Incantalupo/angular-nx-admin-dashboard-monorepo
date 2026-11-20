import app from './index';

const port = Number(process.env['PORT']) || 3100;

Bun.serve({
  fetch: app.fetch,
  port: port,
});
