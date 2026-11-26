import {
  RECORDINGS,
  createRecordingTransport,
  createReplayTransport,
  type RecordedRun,
  type Recording,
} from '@admin-dashboard-nx-monorepo/assistant-contract/replay';
import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, isDevMode, signal, Service } from '@angular/core';
import { BASE_URL } from '@core/providers/base-url';
import { BYPASS_LOADING_SPINNER } from '@core/interceptors/loading.interceptor';
import { WHITELISTED_API } from '@core/interceptors/base-response.interceptor';
import {
  createHttpTransport,
  type Transport,
  type TransportRequest,
} from '@hashbrownai/core';
import { firstValueFrom } from 'rxjs';

export type AssistantMode =
  | { kind: 'checking' }
  | { kind: 'live'; model: string }
  | { kind: 'recorded' };

/** Add `?assistant=recorded` to the URL to replay recordings even when a model is running. */
const FORCE_RECORDED_PARAM = 'assistant';

/**
 * Live chat or recorded demo. The API answers `GET /ai/status` only when it
 * runs with AI_PROVIDER=ollama; the deployed API answers 404, so visitors get
 * the recorded conversations.
 */
@Service({ autoProvided: false })
export class AssistantModeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(BASE_URL);

  readonly mode = signal<AssistantMode>({ kind: 'checking' });
  readonly recordings: readonly Recording[] = RECORDINGS;

  private readonly replay = createReplayTransport({ recordings: RECORDINGS });
  private readonly live = this.withDevRecorder(
    createHttpTransport({ baseUrl: `${this.baseUrl}/ai/run` })
  );

  /** One transport for the chat; it picks live or replay on every request. */
  readonly transport: Transport = {
    name: 'AssistantTransport',
    send: (request: TransportRequest) =>
      this.mode().kind === 'live'
        ? this.live.send(request)
        : this.replay.send(request),
  };

  async detect(): Promise<void> {
    const forced =
      new URLSearchParams(globalThis.location?.search ?? '').get(
        FORCE_RECORDED_PARAM
      ) === 'recorded';
    if (forced) return this.mode.set({ kind: 'recorded' });
    try {
      const status = await firstValueFrom(
        this.http.get<{ model: string }>(`${this.baseUrl}/ai/status`, {
          context: new HttpContext()
            .set(BYPASS_LOADING_SPINNER, true)
            .set(WHITELISTED_API, true),
        })
      );
      this.mode.set({ kind: 'live', model: status.model });
    } catch {
      this.mode.set({ kind: 'recorded' });
    }
  }

  /**
   * In development, keeps every live conversation in
   * `window.__assistantRecordings`, in the shape of the recordings the demo
   * plays (tools/assistant/record-conversations.mjs saves them).
   */
  private withDevRecorder(transport: Transport): Transport {
    if (!isDevMode()) return transport;
    const store: Recording[] = [];
    (globalThis as { __assistantRecordings?: Recording[] })[
      '__assistantRecordings'
    ] = store;
    return createRecordingTransport(transport, (prompt, run: RecordedRun) => {
      let recording = store.find(r => r.prompt === prompt);
      if (!recording) {
        const mode = this.mode();
        recording = {
          prompt,
          model: mode.kind === 'live' ? mode.model : 'unknown',
          recordedAt: new Date().toISOString(),
          runs: [],
        };
        store.push(recording);
      }
      recording.runs.push(run);
    });
  }
}
