import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import type {
  Member,
  MemberInput,
  MemberRole,
  MemberStatus,
  Page,
} from '@dashboard/models';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

interface MembersQuery {
  page: number;
  size: number;
  search: string;
  role: MemberRole | '';
  status: MemberStatus | '';
}

/**
 * The members list: the query lives in state, the page of results is an
 * httpResource that refetches whenever the query changes. Writes go through
 * HttpClient, then reload the list.
 */
export const MembersStore = signalStore(
  withState<MembersQuery>({
    page: 1,
    size: 10,
    search: '',
    role: '',
    status: '',
  }),
  withProps(store => ({
    list: httpResource<Page<Member>>(() => {
      const params: Record<string, string | number> = {
        page: store.page(),
        size: store.size(),
      };
      if (store.search()) params['search'] = store.search();
      if (store.role()) params['role'] = store.role();
      if (store.status()) params['status'] = store.status();
      return { url: '/api/members', params };
    }),
  })),
  withComputed(({ list }) => ({
    items: computed(() => (list.hasValue() ? list.value().items : [])),
    total: computed(() => (list.hasValue() ? list.value().total : 0)),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    /** A new filter starts again from the first page. */
    filter(change: Partial<Pick<MembersQuery, 'search' | 'role' | 'status'>>) {
      patchState(store, { ...change, page: 1 });
    },
    goTo(page: number, size: number) {
      patchState(store, { page, size });
    },
    async create(input: MemberInput): Promise<Member> {
      const created = await firstValueFrom(
        http.post<Member>('/api/members', input)
      );
      store.list.reload();
      return created;
    },
    async update(id: string, input: MemberInput): Promise<Member> {
      const updated = await firstValueFrom(
        http.put<Member>(`/api/members/${id}`, input)
      );
      store.list.reload();
      return updated;
    },
    async archive(id: string): Promise<void> {
      await firstValueFrom(http.delete(`/api/members/${id}`));
      // Archiving the last row of a page moves back one page.
      if (store.items().length === 1 && store.page() > 1)
        patchState(store, { page: store.page() - 1 });
      else store.list.reload();
    },
  }))
);
