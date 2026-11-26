// POST /ai/run: streams one Hashbrown run from a local model through Ollama.
// Mounted only when AI_PROVIDER=ollama (see ../index.ts), so the deployed API
// has no AI route and the dashboard replays recorded conversations. Guards
// from the plan (rate limit, budget, tool check) come in milestone 2; this file
// locks the prompt and the UI schema, and runs each turn in two phases
// (./two-phase.ts) because Ollama can't call tools under a JSON schema.
import type { RunAgentInput } from '@ag-ui/core';
import { RunAgentInputSchema } from '@ag-ui/core/schemas';
import { EventEncoder } from '@ag-ui/encoder';
import { HashbrownOllama } from '@hashbrownai/ollama';
import {
  ASSISTANT_SYSTEM_PROMPT,
  assistantUiSchema,
} from '@admin-dashboard-nx-monorepo/assistant-contract';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { twoPhaseRun } from './two-phase';

const MAX_MESSAGES = 30;

/** Drops any system or developer message the browser sent and puts the server's prompt first. */
export function lockInput(input: RunAgentInput): RunAgentInput {
  const messages = input.messages.filter(
    m => m.role !== 'system' && m.role !== 'developer'
  );
  return {
    ...input,
    messages: [
      { id: 'system', role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...messages,
    ],
    forwardedProps: {
      ...(input.forwardedProps ?? {}),
      hashbrown: { ui: true, responseSchema: assistantUiSchema() },
    },
  };
}

const ai = new Hono();

const ollamaModel = () => Bun.env['OLLAMA_MODEL'] ?? 'gemma4:12b';

// The dashboard asks this first: 200 means live chat, anything else (the
// deployed API answers 404) means the panel replays recorded conversations.
ai.get('/status', c => c.json({ provider: 'ollama', model: ollamaModel() }));

ai.post('/run', bodyLimit({ maxSize: 32 * 1024 }), async c => {
  const parsed = RunAgentInputSchema.safeParse(
    await c.req.json().catch(() => null)
  );
  if (!parsed.success || parsed.data.messages.length > MAX_MESSAGES) {
    return c.json({ error: 'invalid_input' }, 400);
  }

  const encoder = new EventEncoder();
  const events = twoPhaseRun(lockInput(parsed.data as RunAgentInput), input =>
    HashbrownOllama.stream.text({
      host: Bun.env['OLLAMA_HOST'] ?? 'http://127.0.0.1:11434',
      model: ollamaModel(),
      input,
      signal: c.req.raw.signal,
    })
  );

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const bytes = new TextEncoder();
      try {
        for await (const event of events) {
          controller.enqueue(bytes.encode(encoder.encodeSSE(event)));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': encoder.getContentType(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

export default ai;
