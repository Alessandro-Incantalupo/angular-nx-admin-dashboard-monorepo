import { PaginatedResponse, User } from '@admin-dashboard-nx-monorepo/models';
import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { injectBaseUrl } from '@core/CIF/inject-base-url';
import { BYPASS_LOADING_SPINNER } from '@core/interceptors/loading.interceptor';
import { firstValueFrom } from 'rxjs';

export type RoleFilter = User['role'] | 'any';
export type StatusFilter = User['status'] | 'any';

/** Every user, for the assistant's tools and components. The demo has a few dozen at most. */
const ALL_USERS = 100;

/**
 * Reads users for the assistant. The tools fetch fresh data on every call;
 * the components reuse the last fetch, so a card or table never shows a
 * user the tool didn't see.
 */
@Service({ autoProvided: false })
export class AssistantUsersService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = injectBaseUrl()('/users', '/users');
  private readonly context = new HttpContext().set(
    BYPASS_LOADING_SPINNER,
    true
  );
  private latest: Promise<User[]> | undefined;

  /** Fetches every user again. */
  refresh(): Promise<User[]> {
    this.latest = firstValueFrom(
      this.http.get<PaginatedResponse<User>>(
        `${this.usersUrl}?page=1&size=${ALL_USERS}`,
        { context: this.context }
      )
    ).then(response => response.data);
    return this.latest;
  }

  /** The users from the last fetch, fetching once if there was none. */
  all(): Promise<User[]> {
    return this.latest ?? this.refresh();
  }

  async byIds(ids: readonly string[]): Promise<User[]> {
    const users = await this.all();
    return ids
      .map(id => users.find(user => user.id === id))
      .filter((user): user is User => user !== undefined);
  }

  /** The `listUsers` tool. */
  async list(role: RoleFilter, status: StatusFilter) {
    const users = (await this.refresh()).filter(
      user =>
        (role === 'any' || user.role === role) &&
        (status === 'any' || user.status === status)
    );
    return { total: users.length, users };
  }

  /** The `countUsers` tool. */
  async count() {
    const users = await this.refresh();
    const tally = (key: 'role' | 'status') =>
      users.reduce<Record<string, number>>((acc, user) => {
        acc[user[key]] = (acc[user[key]] ?? 0) + 1;
        return acc;
      }, {});
    return {
      total: users.length,
      byRole: tally('role'),
      byStatus: tally('status'),
    };
  }
}
