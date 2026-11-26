import { createChatRuntime, type Chat } from '@hashbrownai/core';
import { countUsersTool, listUsersTool } from '../index';
import {
  createReplayTransport,
  findReplayRun,
  rebaseEvent,
  type Recording,
} from './replay';
import { RECORDINGS } from './recordings';

const SEED_USERS = [
  { id: '1', name: 'Alice Developer', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Designer', role: 'user', status: 'inactive' },
  { id: '3', name: 'Charlie Manager', role: 'admin', status: 'active' },
  { id: '7', name: 'Grace Architect', role: 'admin', status: 'active' },
];

const noWait = () => Promise.resolve();

/** Runs one recorded conversation through Hashbrown's own chat runtime, as the dashboard does. */
async function replayThroughHashbrown(prompt: string) {
  const calls: { name: string; args: unknown }[] = [];
  const chat = createChatRuntime({
    system: 'test',
    transport: createReplayTransport({ recordings: RECORDINGS, sleep: noWait }),
    tools: [
      {
        ...listUsersTool,
        handler: async (args: unknown) => {
          calls.push({ name: listUsersTool.name, args });
          return { total: SEED_USERS.length, users: SEED_USERS };
        },
      },
      {
        ...countUsersTool,
        schema: { type: 'object', properties: {} },
        handler: async () => {
          calls.push({ name: countUsersTool.name, args: {} });
          return { total: 10, byRole: { admin: 3, user: 7 } };
        },
      },
    ] as Chat.AnyTool[],
  });
  const stop = chat.start();
  chat.sendMessage({ role: 'user', content: prompt });
  await vi.waitFor(
    () => {
      if (chat.isLoading()) throw new Error('still running');
      const last = chat.messages().at(-1);
      if (last?.role !== 'assistant' || !last.content) {
        throw new Error('no answer yet');
      }
    },
    { timeout: 5_000, interval: 10 }
  );
  stop();
  return { chat, calls };
}

describe('replay of recorded conversations', () => {
  it('has a recording for every suggested question, each with a tool run and an answer', () => {
    expect(RECORDINGS.length).toBeGreaterThan(0);
    for (const recording of RECORDINGS) {
      expect(recording.runs.length).toBeGreaterThanOrEqual(2);
      const firstRunTypes = recording.runs[0].events.map(e => e.event.type);
      expect(firstRunTypes).toContain('TOOL_CALL_START');
    }
  });

  it('plays "Which admins do we have?" through Hashbrown: real tool call, then the recorded UserTable', async () => {
    const { chat, calls } = await replayThroughHashbrown(
      'Which admins do we have?'
    );

    expect(calls).toEqual([
      { name: 'listUsers', args: { role: 'admin', status: 'any' } },
    ]);
    expect(chat.error()).toBeUndefined();
    const answer = chat.messages().at(-1);
    expect(JSON.parse(String(answer?.content))).toEqual({
      ui: [{ UserTable: { props: { userIds: ['1', '3', '7'] } } }],
    });
  });

  it('replays every recording to a valid UI answer', async () => {
    for (const recording of RECORDINGS) {
      const { chat } = await replayThroughHashbrown(recording.prompt);
      const answer = JSON.parse(String(chat.messages().at(-1)?.content));
      expect(answer.ui.length).toBeGreaterThan(0);
    }
  });

  it('answers a question it has no recording for with a fixed Markdown note', async () => {
    const { chat, calls } = await replayThroughHashbrown('Write me a poem');

    expect(calls).toEqual([]);
    const answer = JSON.parse(String(chat.messages().at(-1)?.content));
    expect(answer.ui[0].Markdown.props.children).toContain(
      'recorded conversations'
    );
  });
});

describe('findReplayRun', () => {
  const recording: Recording = {
    prompt: 'Q',
    model: 'm',
    recordedAt: '2026-11-26T00:00:00Z',
    runs: [{ events: [] }, { events: [] }],
  };

  it('picks the run after the assistant turns since the last user message', () => {
    const user = { id: 'u', role: 'user' as const, content: 'Q' };
    const assistant = { id: 'a', role: 'assistant' as const, content: '' };
    expect(findReplayRun([recording], [user])?.run).toBe(recording.runs[0]);
    expect(findReplayRun([recording], [user, assistant])?.run).toBe(
      recording.runs[1]
    );
    expect(findReplayRun([recording], [user, assistant, assistant])).toBe(
      undefined
    );
  });
});

describe('rebaseEvent', () => {
  it('moves an event to the request thread and run, with ids new to the thread', () => {
    const input = { threadId: 'T', runId: 'R' } as Parameters<
      typeof rebaseEvent
    >[1];
    expect(
      rebaseEvent({ type: 'RUN_STARTED', threadId: 'old', runId: 'old' }, input)
    ).toEqual({ type: 'RUN_STARTED', threadId: 'T', runId: 'R' });
    expect(
      rebaseEvent(
        {
          type: 'TOOL_CALL_START',
          toolCallId: 'x:tool:0',
          toolCallName: 'listUsers',
          parentMessageId: 'x:assistant',
        },
        input
      )
    ).toEqual({
      type: 'TOOL_CALL_START',
      toolCallId: 'R/x:tool:0',
      toolCallName: 'listUsers',
      parentMessageId: 'R/x:assistant',
    });
  });
});

describe('replay pacing', () => {
  it('waits at least minGapMs and at most maxGapMs between events, and caps the first wait', async () => {
    const at = [5000, 5010, 5020, 9000];
    const recording: Recording = {
      prompt: 'q',
      model: 'm',
      recordedAt: '2026-01-01T00:00:00Z',
      runs: [
        {
          events: at.map(ms => ({
            at: ms,
            event: { type: 'RUN_STARTED', threadId: '', runId: '' },
          })),
        },
      ],
    };
    const waits: number[] = [];
    const transport = createReplayTransport({
      recordings: [recording],
      minGapMs: 45,
      maxGapMs: 90,
      maxFirstGapMs: 1400,
      sleep: async ms => void waits.push(ms),
    });
    const request = {
      input: {
        threadId: 'T',
        runId: 'R',
        messages: [{ role: 'user', content: 'q' }],
      },
      signal: new AbortController().signal,
    } as unknown as Parameters<typeof transport.send>[0];
    const { events } = await transport.send(request);
    const played = [];
    for await (const event of events) played.push(event);
    expect(played).toHaveLength(4);
    expect(waits).toEqual([1400, 45, 45, 90]);
  });
});
