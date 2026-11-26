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
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  RenderMessageComponent,
  createTool,
  exposeComponent,
  exposeMarkdown,
  provideHashbrown,
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

/** How fast a picked question is typed into the box, per character. */
const TYPING_MS = 38;
/** The pause between the typed question and sending it. */
const SEND_PAUSE_MS = 350;

/**
 * The assistant's chat, shown in the launcher's panel. Hashbrown is provided
 * here, and the launcher loads this component with `@defer`, so none of it
 * reaches the main bundle until someone opens the chat.
 */
@Component({
  selector: 'app-assistant-chat',
  imports: [RenderMessageComponent],
  templateUrl: './assistant-chat.component.html',
  host: { class: 'flex min-h-0 grow flex-col' },
  styles: `
    .assistant-avatar {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      background: var(--primary);
      color: var(--primary-foreground);
    }
    /* Each new bubble slides up a little, like a message arriving. */
    .assistant-turn {
      animation: turn-in 260ms ease-out both;
    }
    .typing-dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 9999px;
      background: var(--muted-foreground);
      animation: typing-dot 1.2s ease-in-out infinite;
    }
    .typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }
    .typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes turn-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem);
      }
    }
    @keyframes typing-dot {
      0%,
      60%,
      100% {
        opacity: 0.35;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-0.2rem);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .assistant-turn,
      .typing-dot {
        animation: none;
      }
    }
  `,
  providers: [
    provideHashbrown({
      baseUrl: `${environment.baseUrl}/ai/run`,
      // Hashbrown 0.8 reports milestones from dev builds; this demo sends none.
      telemetry: false,
    }),
    AssistantModeService,
    AssistantUsersService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantChatComponent {
  /** Whether the launcher's panel is showing this chat. */
  readonly open = input(false);
  readonly closed = output<void>();

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
  /** True while a picked question is being typed into the box. */
  protected readonly typing = signal(false);
  protected readonly busy = computed(
    () => this.typing() || this.chat.isLoading()
  );
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
      !this.busy() &&
      this.draft().trim().length > 0
  );
  protected readonly suggestions = computed(() => {
    const asked = new Set(
      this.chat
        .value()
        .filter(m => m.role === 'user')
        .map(m => m.content)
    );
    return this.recordings
      .map(r => r.prompt)
      .filter(prompt => !asked.has(prompt));
  });
  /** Three dots while the model hasn't written anything for this turn yet. */
  protected readonly showTypingDots = computed(() => {
    if (!this.chat.isLoading()) return false;
    const messages = this.chat.value();
    const last = messages[messages.length - 1];
    return !(last?.role === 'assistant' && last.content);
  });

  private readonly end = viewChild<ElementRef<HTMLElement>>('end');
  private readonly box = viewChild<ElementRef<HTMLInputElement>>('input');
  private typingTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    void this.modeService.detect();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typingTimer));
    // Keep the newest message in view while answers stream in, and the
    // suggestions when they come back at the end of a turn.
    afterRenderEffect(() => {
      this.chat.value();
      this.showTypingDots();
      this.busy();
      this.end()?.nativeElement.scrollIntoView({ block: 'end' });
    });
    // The cursor goes to the box when the panel opens on a live chat.
    afterRenderEffect(() => {
      if (this.open() && this.mode().kind === 'live') {
        this.box()?.nativeElement.focus();
      }
    });
  }

  /** A suggested question: typed into the box like a person would, then sent. */
  protected pick(prompt: string): void {
    if (this.busy()) return;
    this.typing.set(true);
    let typed = 0;
    const step = () => {
      typed++;
      this.draft.set(prompt.slice(0, typed));
      if (typed < prompt.length) {
        this.typingTimer = setTimeout(step, TYPING_MS);
        return;
      }
      this.typingTimer = setTimeout(() => {
        this.typing.set(false);
        this.ask(prompt);
      }, SEND_PAUSE_MS);
    };
    this.typingTimer = setTimeout(step, TYPING_MS);
  }

  protected send(event?: Event): void {
    event?.preventDefault();
    if (this.canSend()) this.ask(this.draft());
  }

  protected restart(): void {
    clearTimeout(this.typingTimer);
    this.typing.set(false);
    this.draft.set('');
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

  private ask(prompt: string): void {
    if (this.chat.isLoading() || !prompt.trim()) return;
    this.chat.sendMessage({ role: 'user', content: prompt.trim() });
    this.draft.set('');
  }
}
