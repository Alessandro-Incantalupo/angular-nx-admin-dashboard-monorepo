import {
  ASSISTANT_SYSTEM_PROMPT,
  countUsersTool,
  listUsersTool,
  userCardDefinition,
  userTableDefinition,
} from '@admin-dashboard-nx-monorepo/assistant-contract';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  RenderMessageComponent,
  createTool,
  exposeComponent,
  exposeMarkdown,
  uiChatResource,
} from '@hashbrownai/angular';
import type { Chat } from '@hashbrownai/core';
import { AssistantUserCardComponent } from './components/assistant-user-card.component';
import { AssistantUserTableComponent } from './components/assistant-user-table.component';
import { AssistantModeService } from './services/assistant-mode.service';
import { AssistantUsersService } from './services/assistant-users.service';

/** What a tool call looks like in the chat, as plain words instead of tool names. */
const TOOL_LABELS: Record<string, { pending: string; done: string }> = {
  [listUsersTool.name]: {
    pending: 'Looking up users…',
    done: 'Looked up users',
  },
  [countUsersTool.name]: {
    pending: 'Counting users…',
    done: 'Counted users',
  },
};

@Component({
  selector: 'app-assistant-page',
  imports: [RenderMessageComponent],
  templateUrl: './assistant-page.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AssistantPageComponent {
  private readonly users = inject(AssistantUsersService);
  protected readonly modeService = inject(AssistantModeService);
  protected readonly mode = this.modeService.mode;
  protected readonly recordings = this.modeService.recordings;
  protected readonly recordedModel =
    this.recordings[0]?.model ?? 'a local model';
  // Intl, not DatePipe: the pipe's formatting code would land in the eager bundle.
  protected readonly recordedOn = this.recordings[0]
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
        new Date(this.recordings[0].recordedAt)
      )
    : undefined;

  protected readonly chat = uiChatResource({
    debugName: 'assistant',
    // A fallback only: the API puts its own prompt first.
    system: ASSISTANT_SYSTEM_PROMPT,
    transport: this.modeService.transport,
    components: [
      exposeMarkdown(),
      exposeComponent(AssistantUserCardComponent, {
        name: userCardDefinition.name,
        description: userCardDefinition.description,
        children: false,
        input: userCardDefinition.props,
      }),
      exposeComponent(AssistantUserTableComponent, {
        name: userTableDefinition.name,
        description: userTableDefinition.description,
        children: false,
        input: userTableDefinition.props,
      }),
    ],
    tools: [
      createTool({
        ...listUsersTool,
        handler: ({ role, status }) => this.users.list(role, status),
      }),
      createTool({
        ...countUsersTool,
        handler: () => this.users.count(),
      }),
    ],
  });

  protected readonly draft = signal('');
  protected readonly isRecorded = computed(
    () => this.mode().kind === 'recorded'
  );
  protected readonly liveModel = computed(() => {
    const mode = this.mode();
    return mode.kind === 'live' ? mode.model : '';
  });
  protected readonly canSend = computed(
    () =>
      this.mode().kind === 'live' &&
      !this.chat.isLoading() &&
      this.draft().trim().length > 0
  );
  protected readonly askedPrompts = computed(
    () =>
      new Set(
        this.chat
          .value()
          .filter(m => m.role === 'user')
          .map(m => m.content)
      )
  );

  private readonly end = viewChild<ElementRef<HTMLElement>>('end');

  constructor() {
    void this.modeService.detect();
    // Keep the newest message in view while answers stream in.
    afterRenderEffect(() => {
      this.chat.value();
      this.end()?.nativeElement.scrollIntoView({ block: 'end' });
    });
  }

  protected ask(prompt: string): void {
    if (this.chat.isLoading() || !prompt.trim()) return;
    this.chat.sendMessage({ role: 'user', content: prompt.trim() });
    this.draft.set('');
  }

  protected send(event?: Event): void {
    event?.preventDefault();
    if (this.canSend()) this.ask(this.draft());
  }

  protected restart(): void {
    this.chat.stop(true);
    this.chat.setMessages([]);
  }

  protected toolLabel(call: Chat.AnyToolCall): string {
    const labels = TOOL_LABELS[call.name];
    if (!labels) return call.name;
    if (call.status === 'pending') return labels.pending;
    const args = Object.entries((call.args ?? {}) as Record<string, string>)
      .filter(([, value]) => value !== 'any')
      .map(([key, value]) => `${key} ${value}`);
    return args.length ? `${labels.done}: ${args.join(', ')}` : labels.done;
  }
}
