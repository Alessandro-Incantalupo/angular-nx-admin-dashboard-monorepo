// Recorded conversations for the public demo. The deployed API has no model,
// so the dashboard plays back what a local model streamed: the same AG-UI
// events, through Hashbrown's own client. Tool calls in a recording still run
// in the browser, and the components still load their data, so only the
// model's side is recorded.
import type { AGUIEvent } from '@ag-ui/core';
import type {
  Transport,
  TransportRequest,
  TransportResponse,
} from '@hashbrownai/core';

/** One AG-UI event and when it arrived, in ms after the request was sent. */
export interface RecordedEvent {
  at: number;
  event: AGUIEvent;
}

/** One request to the model and what it streamed back. */
export interface RecordedRun {
  events: RecordedEvent[];
}

/** One user question and every model run it took to answer it. */
export interface Recording {
  /** The user's message, matched exactly when replaying. */
  prompt: string;
  /** The model that answered, as the API reported it. */
  model: string;
  /** When it was recorded (ISO 8601). */
  recordedAt: string;
  runs: RecordedRun[];
}

/** Events a recording doesn't keep: provider internals and the model's reasoning. */
const DROPPED_EVENTS = new Set([
  'RAW',
  'REASONING_START',
  'REASONING_END',
  'REASONING_MESSAGE_START',
  'REASONING_MESSAGE_CONTENT',
  'REASONING_MESSAGE_END',
  'REASONING_MESSAGE_CHUNK',
  'REASONING_ENCRYPTED_VALUE',
]);

const ID_FIELDS = ['messageId', 'toolCallId', 'parentMessageId'] as const;

type RequestMessage = TransportRequest['input']['messages'][number];

function lastUserIndex(messages: readonly RequestMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return i;
  }
  return -1;
}

/**
 * Which recording and which of its runs answer this request: the recording
 * whose prompt is the last user message, and the run after as many runs as
 * the conversation already holds since that message (one per assistant turn).
 */
export function findReplayRun(
  recordings: readonly Recording[],
  messages: readonly RequestMessage[]
): { recording: Recording; run: RecordedRun } | undefined {
  const lastUser = lastUserIndex(messages);
  if (lastUser === -1) return undefined;
  const prompt = messages[lastUser].content;
  const recording = recordings.find(r => r.prompt === prompt);
  if (!recording) return undefined;
  const done = messages
    .slice(lastUser + 1)
    .filter(m => m.role === 'assistant').length;
  const run = recording.runs[done];
  return run ? { recording, run } : undefined;
}

export interface ReplayTransportOptions {
  recordings: readonly Recording[];
  /** Longest pause between two events, so a slow local model replays quickly. Default 40 ms. */
  maxGapMs?: number;
  /** Longest pause before the first event (the model "thinking"). Default 600 ms. */
  maxFirstGapMs?: number;
  /** Waits; replaced in tests. */
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  /** The answer for a question with no recording. */
  fallbackText?: string;
}

const DEFAULT_FALLBACK =
  'This demo plays back recorded conversations, so it can only answer the suggested questions. Run the dashboard with a local model to ask your own.';

const defaultSleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true }
    );
  });

/** A run that answers with one Markdown block, for questions with no recording. */
export function textOnlyRun(text: string): RecordedRun {
  const messageId = 'fallback:assistant';
  const content = JSON.stringify({
    ui: [{ Markdown: { props: { children: text } } }],
  });
  return {
    events: [
      { at: 0, event: { type: 'RUN_STARTED', threadId: '', runId: '' } },
      {
        at: 0,
        event: { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant' },
      },
      {
        at: 0,
        event: { type: 'TEXT_MESSAGE_CONTENT', messageId, delta: content },
      },
      { at: 0, event: { type: 'TEXT_MESSAGE_END', messageId } },
      { at: 0, event: { type: 'RUN_FINISHED', threadId: '', runId: '' } },
    ] as RecordedEvent[],
  };
}

/**
 * Gives a recorded event the identity of the request it answers: the
 * request's thread and run ids, and message and tool call ids that are new in
 * this thread (Hashbrown refuses ids it has already seen).
 */
export function rebaseEvent(
  event: AGUIEvent,
  input: TransportRequest['input']
): AGUIEvent {
  const copy: Record<string, unknown> = { ...event };
  if (event.type === 'RUN_STARTED' || event.type === 'RUN_FINISHED') {
    copy['threadId'] = input.threadId;
    copy['runId'] = input.runId;
  }
  if (event.type === 'RUN_ERROR') copy['runId'] = input.runId;
  for (const field of ID_FIELDS) {
    if (typeof copy[field] === 'string') {
      copy[field] = `${input.runId}/${copy[field]}`;
    }
  }
  return copy as AGUIEvent;
}

async function* replay(
  run: RecordedRun,
  request: TransportRequest,
  options: Required<
    Pick<ReplayTransportOptions, 'maxGapMs' | 'maxFirstGapMs' | 'sleep'>
  >
): AsyncGenerator<AGUIEvent> {
  let previous = 0;
  for (const [index, { at, event }] of run.events.entries()) {
    const cap = index === 0 ? options.maxFirstGapMs : options.maxGapMs;
    const wait = Math.min(Math.max(at - previous, 0), cap);
    previous = at;
    if (wait > 0) await options.sleep(wait, request.signal);
    yield rebaseEvent(event, request.input);
  }
}

/** A Hashbrown transport that answers from recordings instead of a model. */
export function createReplayTransport(
  options: ReplayTransportOptions
): Transport {
  const timing = {
    maxGapMs: options.maxGapMs ?? 40,
    maxFirstGapMs: options.maxFirstGapMs ?? 600,
    sleep: options.sleep ?? defaultSleep,
  };
  const fallback = textOnlyRun(options.fallbackText ?? DEFAULT_FALLBACK);
  return {
    name: 'ReplayTransport',
    async send(request: TransportRequest): Promise<TransportResponse> {
      const match = findReplayRun(options.recordings, request.input.messages);
      return { events: replay(match?.run ?? fallback, request, timing) };
    },
  };
}

/** Keeps a live run's events for a recording, without the provider's internals. */
export function keepForRecording(event: AGUIEvent): boolean {
  return !DROPPED_EVENTS.has(event.type);
}

/**
 * Wraps the live transport and hands every finished run to `onRun`, with the
 * prompt it answered. The dashboard uses it in development to capture new
 * recordings from a local model.
 */
export function createRecordingTransport(
  inner: Transport,
  onRun: (prompt: string, run: RecordedRun) => void
): Transport {
  return {
    name: 'RecordingTransport',
    async send(request: TransportRequest): Promise<TransportResponse> {
      const startedAt = Date.now();
      const response = await inner.send(request);
      const messages = request.input.messages;
      const content = messages[lastUserIndex(messages)]?.content;
      const prompt = typeof content === 'string' ? content : '';
      const events: RecordedEvent[] = [];
      async function* tee(): AsyncGenerator<AGUIEvent> {
        // Hashbrown may stop reading once the run has finished, so the run
        // is handed over in `finally`, not after the loop.
        try {
          for await (const event of response.events) {
            if (keepForRecording(event)) {
              events.push({ at: Date.now() - startedAt, event });
            }
            yield event;
          }
        } finally {
          onRun(prompt, { events });
        }
      }
      return { ...response, events: tee() };
    },
  };
}
