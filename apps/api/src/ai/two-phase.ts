// Ollama can't call tools and follow a JSON schema in the same request: with
// `format` set, the model writes the tool call as JSON text instead of making
// it (checked on gemma4:12b; Hashbrown's Ollama page reports "Schema-plus-tools
// cases omitted required lookups"). So a turn runs in two phases:
//
// 1. Right after a user message: the same input without the UI schema, so the
//    model can call a tool. If it does, that run goes to the browser (minus any
//    text it wrote), the browser runs the tool and sends the result back.
//    If it calls none, the run is dropped and phase 2 answers at once.
// 2. Otherwise (after tool results, or when no tool was called): the input with
//    the UI schema, so the answer is valid UI JSON.
import type { BaseEvent, RunAgentInput } from '@ag-ui/core';

export type RunStream = (input: RunAgentInput) => AsyncIterable<BaseEvent>;

// Text the model writes next to a tool call isn't UI JSON, so it's dropped;
// the message's start and end stay, as for a run that only calls a tool.
const TEXT_CONTENT_EVENTS = new Set([
  'TEXT_MESSAGE_CONTENT',
  'TEXT_MESSAGE_CHUNK',
]);

/** True when the model should get a chance to call a tool before answering. */
export function isToolPhase(input: RunAgentInput): boolean {
  const last = input.messages.at(-1);
  return input.tools.length > 0 && last?.role === 'user';
}

/** The input without the UI schema, so Ollama lets the model call tools. */
export function withoutResponseSchema(input: RunAgentInput): RunAgentInput {
  const props = (input.forwardedProps ?? {}) as Record<string, unknown>;
  const hashbrown = (props['hashbrown'] ?? {}) as Record<string, unknown>;
  const rest = Object.fromEntries(
    Object.entries(hashbrown).filter(([key]) => key !== 'responseSchema')
  );
  return { ...input, forwardedProps: { ...props, hashbrown: rest } };
}

/** Streams one turn in the two phases described above. */
export async function* twoPhaseRun(
  input: RunAgentInput,
  stream: RunStream
): AsyncGenerator<BaseEvent> {
  if (isToolPhase(input)) {
    const held: BaseEvent[] = [];
    let calledTool = false;
    for await (const event of stream(withoutResponseSchema(input))) {
      if (TEXT_CONTENT_EVENTS.has(event.type)) continue;
      if (event.type === 'TOOL_CALL_START' && !calledTool) {
        calledTool = true;
        yield* held;
        held.length = 0;
      }
      if (calledTool) yield event;
      else held.push(event);
    }
    if (calledTool) return;
  }
  yield* stream(input);
}
