import { PaginatedResponse, User } from '@admin-dashboard-nx-monorepo/models';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { injectBaseUrl } from '@core/CIF/inject-base-url';
import { WHITELISTED_API } from '@core/interceptors/base-response.interceptor';
import { BYPASS_LOADING_SPINNER } from '@core/interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly createUrlRemote = injectBaseUrl();

  private readonly usersUrl = this.createUrlRemote(
    `/api/users`,
    () => `/api/users`
  );
  private readonly RESET_USERS_HTTP_CONTEXT = new HttpContext().set(
    BYPASS_LOADING_SPINNER,
    true
  );
  private readonly WHITELISTED_API_HTTP_CONTEXT = new HttpContext().set(
    WHITELISTED_API,
    true
  );

  getUsers(page: number = 1, size: number = 5) {
    return this.http.get<PaginatedResponse<User>>(
      `${this.usersUrl}?page=${page}&size=${size}`
    );
  }

  addUser(user: User) {
    return this.http.post<User>(this.usersUrl, user);
  }

  updateUser(user: User) {
    return this.http.put<User>(`${this.usersUrl}/${user.id}`, user);
  }

  deleteUser(userId: string) {
    return this.http.delete<void>(`${this.usersUrl}/${userId}`);
  }

  getUserStats() {
    return this.http.get<{ [key: string]: number }>(`${this.usersUrl}/stats`);
  }

  resetDemoData() {
    return this.http.post<void>(
      this.usersUrl + '/reset',
      {},
      { context: this.RESET_USERS_HTTP_CONTEXT }
    );
  }
}
