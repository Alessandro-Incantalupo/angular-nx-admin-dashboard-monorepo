import { User } from '@admin-dashboard-nx-monorepo/models';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';

const auth = new Hono();

type UserWithPassword = User & { password: string };

const fakeUsers: UserWithPassword[] = [
  {
    id: '1',
    name: 'Alessandro Incantalupo Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Alessandro Incantalupo User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    status: 'active',
  },
];

auth.post('/login', async c => {
  const { email, password } = await c.req.json();

  const user = fakeUsers.find(
    u => u.email === email && u['password'] === password
  );

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const jwtSecret = Bun.env['JWT_SECRET'];
  if (!jwtSecret) {
    console.error('❌ JWT_SECRET is not defined');
    return c.json({ error: 'Server misconfiguration' }, 500);
  }

  const { id, name, email: userEmail, role, status } = user;

  // Sign with default algorithm (HS256) and no expiry
  const payload = {
    id,
    name,
    email: userEmail,
    role,
    status,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  console.log('JWT payload:', payload);

  const token = await sign(payload, jwtSecret);

  return c.json({ token });
});

export default auth;
