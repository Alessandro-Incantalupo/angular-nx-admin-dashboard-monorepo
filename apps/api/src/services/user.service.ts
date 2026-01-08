import type { User } from '@admin-dashboard-nx-monorepo/models';
import { getNextResetMs } from '@app-info';
import { users as usersData } from '../data/users';

/**
 * UserService handles all business logic for user management
 * In-memory data store for demo purposes
 */
class UserService {
  private users: User[] = [...usersData];
  private readonly initialUsers: User[] = JSON.parse(JSON.stringify(usersData));

  constructor() {
    this.scheduleAutoReset();
  }

  // ========== READ OPERATIONS ==========

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // ========== WRITE OPERATIONS ==========

  create(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: crypto.randomUUID(),
      ...userData,
    };
    this.users.unshift(newUser);
    return newUser;
  }

  update(id: string, userData: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  // ========== UTILITY OPERATIONS ==========

  reset(): User[] {
    this.users = JSON.parse(JSON.stringify(this.initialUsers));
    return this.users;
  }

  private scheduleAutoReset(): void {
    const intervalMs = 1000 * 60 * 60; // 1 hour

    setTimeout(() => {
      this.reset();
      setInterval(() => this.reset(), intervalMs);
    }, getNextResetMs());
  }
}

// Export singleton instance
export const userService = new UserService();
