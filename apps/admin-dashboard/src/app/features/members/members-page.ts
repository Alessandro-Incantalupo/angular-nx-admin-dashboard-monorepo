import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import type {
  Member,
  MemberInput,
  MemberRole,
  MemberStatus,
} from '@dashboard/models';
import { memberRoles, memberStatuses } from '@dashboard/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { Tag } from 'primeng/tag';
import { toProblem } from '../../core/http';
import { SessionStore } from '../../core/session-store';
import { MemberForm, roleLabel, statusLabel } from './member-form';
import { MembersStore } from './members-store';

const tone: Record<MemberStatus, 'success' | 'info' | 'secondary'> = {
  active: 'success',
  invited: 'info',
  inactive: 'secondary',
};

@Component({
  selector: 'app-members-page',
  imports: [TableModule, Paginator, Button, Dialog, Tag, DatePipe, MemberForm],
  providers: [MembersStore],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Members</h1>
        <p class="text-muted mt-1">
          Everyone in the workspace. Archived members leave this list.
        </p>
      </div>
      @if (session.isAdmin()) {
        <p-button label="Add member" (onClick)="openCreate()" />
      }
    </div>

    <search class="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
      <div>
        <label for="search" class="mb-1 block font-medium">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Name or email"
          [value]="store.search()"
          (input)="onSearch($any($event.target).value)"
        />
      </div>
      <div>
        <label for="role" class="mb-1 block font-medium">Role</label>
        <select
          id="role"
          [value]="store.role()"
          (change)="store.filter({ role: $any($event.target).value })"
        >
          <option value="">All roles</option>
          @for (r of roles; track r) {
            <option [value]="r">{{ roleLabel[r] }}</option>
          }
        </select>
      </div>
      <div>
        <label for="status" class="mb-1 block font-medium">Status</label>
        <select
          id="status"
          [value]="store.status()"
          (change)="store.filter({ status: $any($event.target).value })"
        >
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ statusLabel[s] }}</option>
          }
        </select>
      </div>
    </search>

    <p class="sr-only" role="status">{{ resultText() }}</p>

    @if (store.list.error(); as err) {
      <div
        role="alert"
        class="rounded-control border-danger bg-danger-subtle text-danger mt-6 border p-4"
      >
        <p class="m-0 font-semibold">{{ problem(err).title }}</p>
        <button
          type="button"
          class="mt-2 min-h-11 underline"
          (click)="store.list.reload()"
        >
          Try again
        </button>
      </div>
    } @else {
      <!-- Phones: one card per member instead of a wide table. -->
      <div class="mt-4 sm:hidden">
        <ul class="m-0 grid list-none gap-3 p-0" aria-label="Members">
          @for (m of store.items(); track m.id) {
            <li class="card p-4">
              <p class="m-0 font-semibold">{{ m.name }}</p>
              <p class="text-muted m-0 break-all">{{ m.email }}</p>
              <p class="m-0 mt-2 flex flex-wrap items-center gap-2">
                {{ roleLabel[m.role] }}
                <p-tag
                  [value]="statusLabel[m.status]"
                  [severity]="tone[m.status]"
                />
                <span class="text-muted"
                  >joined {{ m.createdAt | date: 'd MMM y' }}</span
                >
              </p>
              @if (session.isAdmin()) {
                <p class="m-0 mt-2 flex flex-wrap gap-2">
                  <p-button
                    label="Edit"
                    [text]="true"
                    [ariaLabel]="'Edit ' + m.name"
                    (onClick)="openEdit(m)"
                  />
                  <p-button
                    label="Archive"
                    severity="danger"
                    [text]="true"
                    [ariaLabel]="'Archive ' + m.name"
                    (onClick)="confirmArchive(m)"
                  />
                </p>
              }
            </li>
          } @empty {
            @if (!store.list.isLoading()) {
              <li class="text-muted py-6 text-center">
                No members match these filters.
              </li>
            }
          }
        </ul>
        <p-paginator
          [rows]="store.size()"
          [first]="(store.page() - 1) * store.size()"
          [totalRecords]="store.total()"
          [pageLinkSize]="3"
          (onPageChange)="onPage($event)"
        />
      </div>

      <div class="card mt-4 hidden overflow-hidden sm:block">
        <p-table
          [value]="store.items()"
          [lazy]="true"
          [paginator]="true"
          [rows]="store.size()"
          [first]="(store.page() - 1) * store.size()"
          [totalRecords]="store.total()"
          [loading]="store.list.isLoading()"
          [rowsPerPageOptions]="[10, 25, 50]"
          (onLazyLoad)="onPage($event)"
          dataKey="id"
          [tableStyle]="{ 'min-width': '44rem' }"
          [scrollable]="true"
        >
          <ng-template #caption
            ><span class="sr-only"
              >Members, {{ store.total() }} in total</span
            ></ng-template
          >
          <ng-template #header>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              @if (session.isAdmin()) {
                <th scope="col"><span class="sr-only">Actions</span></th>
              }
            </tr>
          </ng-template>
          <ng-template #body let-m>
            <tr>
              <th scope="row" class="px-3.5 py-2 text-left font-medium">
                {{ m.name }}
              </th>
              <td class="break-all">{{ m.email }}</td>
              <td>{{ roleLabel[asRole(m.role)] }}</td>
              <td>
                <p-tag
                  [value]="statusLabel[asStatus(m.status)]"
                  [severity]="tone[asStatus(m.status)]"
                />
              </td>
              <td class="whitespace-nowrap">
                {{ m.createdAt | date: 'd MMM y' }}
              </td>
              @if (session.isAdmin()) {
                <td class="text-right whitespace-nowrap">
                  <p-button
                    label="Edit"
                    [text]="true"
                    [ariaLabel]="'Edit ' + m.name"
                    (onClick)="openEdit(m)"
                  />
                  <p-button
                    label="Archive"
                    severity="danger"
                    [text]="true"
                    [ariaLabel]="'Archive ' + m.name"
                    (onClick)="confirmArchive(m)"
                  />
                </td>
              }
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td
                [attr.colspan]="session.isAdmin() ? 6 : 5"
                class="text-muted py-8 text-center"
              >
                No members match these filters.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    }

    <p-dialog
      [header]="editing() ? 'Edit member' : 'Add a member'"
      [visible]="dialogOpen()"
      (visibleChange)="dialogOpen.set($event)"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Close"
      [style]="{ width: 'min(36rem, calc(100vw - 2rem))' }"
    >
      @if (dialogOpen()) {
        <app-member-form
          [member]="editing()"
          [save]="saveMember"
          (saved)="onSaved()"
          (cancelled)="dialogOpen.set(false)"
        />
      }
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MembersPage {
  protected readonly store = inject(MembersStore);
  protected readonly session = inject(SessionStore);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  protected readonly roles = memberRoles;
  protected readonly statuses = memberStatuses;
  protected readonly roleLabel = roleLabel;
  protected readonly statusLabel = statusLabel;
  protected readonly tone = tone;
  protected readonly problem = toProblem;
  protected readonly asRole = (r: string) => r as MemberRole;
  protected readonly asStatus = (s: string) => s as MemberStatus;

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Member | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected resultText() {
    if (this.store.list.isLoading()) return 'Loading members…';
    const n = this.store.total();
    return `${n} ${n === 1 ? 'member' : 'members'} found.`;
  }

  /** Waits for a pause in typing before asking the server. */
  protected onSearch(value: string) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(
      () => this.store.filter({ search: value.trim() }),
      300
    );
  }

  protected onPage(e: { first?: number | null; rows?: number | null }) {
    const size = e.rows ?? this.store.size();
    this.store.goTo(Math.floor((e.first ?? 0) / size) + 1, size);
  }

  protected openCreate() {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(m: Member) {
    this.editing.set(m);
    this.dialogOpen.set(true);
  }

  protected readonly saveMember = (value: MemberInput) => {
    const m = this.editing();
    return m ? this.store.update(m.id, value) : this.store.create(value);
  };

  protected onSaved() {
    const editing = this.editing();
    this.dialogOpen.set(false);
    this.messages.add({
      severity: 'success',
      summary: editing ? 'Changes saved' : 'Member added',
      life: 4000,
    });
  }

  protected confirmArchive(m: Member) {
    this.confirm.confirm({
      header: 'Archive this member?',
      message: `${m.name} will leave the list and the charts. Their history stays.`,
      acceptLabel: 'Archive',
      rejectLabel: 'Keep',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: async () => {
        try {
          await this.store.archive(m.id);
          this.messages.add({
            severity: 'success',
            summary: `${m.name} archived`,
            life: 4000,
          });
        } catch (err) {
          this.messages.add({
            severity: 'error',
            summary: toProblem(err).title,
            life: 6000,
          });
        }
      },
    });
  }
}
