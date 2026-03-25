export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status?: 'active' | 'inactive';
}
