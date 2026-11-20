// apps/api/src/index.ts
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import usersRoute from './routes/users';

const allowedOrigin = Bun.env['FRONTEND_ORIGIN'] ?? 'http://localhost:4300';

const app = new Hono();
// Enable CORS for all routes, allowing requests from the specified frontend origin
app.use(
  '*', // Apply to all routes
  cors({
    origin: allowedOrigin, // Allow requests from this origin (from env or localhost)
    credentials: true, // Allow cookies and credentials to be sent
  })
);

// Only apply rate limiting to mutating users routes
const usersMutateLimiter = rateLimiter({
  // ⏳ Time window for rate limit (5 minutes)
  windowMs: 5 * 60 * 1000,
  // 🚫 Max requests per client within the time window
  limit: 20,
  // 📡 Enables standard RateLimit headers (e.g., RateLimit-Limit, RateLimit-Remaining)
  standardHeaders: 'draft-6',
  // 🔑 Unique identifier per client (used to track request count
  // Tries to get the real IP address behind proxy/load balancer first,
  // then falls back to host header, then to a default string
  // This is important for accurate rate limiting in production environments
  // where the app might be behind a reverse proxy or load balancer.
  keyGenerator: c =>
    c.req.header('x-forwarded-for') || c.req.raw.headers.get('host') || 'anon',
});

// Create a sub-app for /users
const users = new Hono();

// Apply rate limiter only to POST, PUT, DELETE, and RESET
users.post('/', usersMutateLimiter);
users.put('/:id', usersMutateLimiter);
users.delete('/:id', usersMutateLimiter);
users.post('/reset', usersMutateLimiter);

// Mount your actual usersRoute handlers after the limiter
users.route('/', usersRoute);

// app.use('/users/*', async (c, next) => {
//   const method = c.req.method;

//   // ✅ Allow unauthenticated GET requests
//   if (method === 'GET') return next();

//   // 🔐 Protect all other methods
//   const secret = Bun.env['JWT_SECRET'];
//   console.log('JWT_SECRET:', secret);
//   if (!secret) {
//     return c.json({ error: 'JWT_SECRET is not defined' }, 500);
//   }

//   const jwtMiddleware = jwt({ secret });
//   return await jwtMiddleware(c, next);
// });

app.get('/', c => c.text('🟢 API is alive'));
// Mount the users sub-app
app.route('/users', users);
app.route('/auth', auth);

export default app;
