// Records the conversations the public demo replays, from a live local model.
//
// 1. API with the model: AI_PROVIDER=ollama PORT=3100 bun run apps/api/src/server.ts
// 2. Dashboard: nx serve admin-dashboard --configuration=development --port 4300
// 3. node tools/assistant/record-conversations.mjs [--only <n>]
//
// Each question runs in a fresh page. The dashboard keeps every live run in
// window.__assistantRecordings (development builds only); this script checks
// the answer and writes one JSON file per question, plus the index that lists
// them in order.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** The questions the demo suggests, in order. */
const PROMPTS = [
  'Which admins do we have?',
  'Who is inactive right now?',
  'How many users are there per role?',
  'Show me Bob.',
];

const BASE_URL = process.env.DASHBOARD_URL ?? 'http://localhost:4300';
const OUT_DIR = 'libs/assistant-contract/src/replay/recordings';
const CHROME =
  process.env.CHROME_PATH ??
  join(homedir(), '.cache/ms-playwright/chromium-1194/chrome-linux/chrome');
const ANSWER_TIMEOUT_MS = 240_000;
/** A local model doesn't answer well every time; the log says how many tries each answer took. */
const ATTEMPTS = 3;

const only = process.argv.includes('--only')
  ? Number(process.argv[process.argv.indexOf('--only') + 1])
  : undefined;

const slug = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** The UI JSON the last run streamed, or why the recording is unusable. */
function check(recording) {
  const runs = recording?.runs ?? [];
  if (runs.length < 2) return `expected a tool run and an answer, got ${runs.length} run(s)`;
  const calledTool = runs[0].events.some(e => e.event.type === 'TOOL_CALL_START');
  if (!calledTool) return 'the first run called no tool';
  const text = runs
    .at(-1)
    .events.filter(e => e.event.type === 'TEXT_MESSAGE_CONTENT')
    .map(e => e.event.delta)
    .join('');
  try {
    const ui = JSON.parse(text).ui;
    if (!Array.isArray(ui) || ui.length === 0) return 'the answer has no UI';
    const empty = ui.find(
      node =>
        (node.UserTable && node.UserTable.props.userIds.length === 0) ||
        (node.UserCard && !node.UserCard.props.userId)
    );
    if (empty) return `the answer shows no one: ${text}`;
    return ui;
  } catch {
    return `the answer is not JSON: ${text.slice(0, 120)}`;
  }
}

const browser = await chromium.launch({ executablePath: CHROME });
mkdirSync(OUT_DIR, { recursive: true });
let failed = 0;

async function ask(prompt, index) {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE_URL}/assistant`);
    await page.getByTestId('live-banner').waitFor({ timeout: 30_000 });
    await page.getByLabel('Your question').fill(prompt);
    await page.getByRole('button', { name: 'Send' }).click();
    // Done when the chat is idle again and an answer rendered.
    await page.waitForFunction(
      () =>
        !document.body.innerText.includes('Thinking…') &&
        document.querySelector('.assistant-answer') !== null,
      undefined,
      { timeout: ANSWER_TIMEOUT_MS, polling: 500 }
    );
    if (process.env.SHOTS_DIR) {
      await page.screenshot({
        path: join(process.env.SHOTS_DIR, `assistant-${index + 1}.png`),
        fullPage: true,
      });
    }
    return await page.evaluate(() =>
      window.__assistantRecordings?.find(r => r.runs.length > 0)
    );
  } finally {
    await page.close();
  }
}

for (const [index, prompt] of PROMPTS.entries()) {
  if (only !== undefined && only !== index + 1) continue;
  let saved = false;
  for (let attempt = 1; attempt <= ATTEMPTS && !saved; attempt++) {
    const started = Date.now();
    const recording = await ask(prompt, index);
    const result = check(recording);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (typeof result === 'string') {
      console.log(`try ${attempt}/${ATTEMPTS}  ${prompt}  (${seconds} s): ${result}`);
      continue;
    }
    const file = `${String(index + 1).padStart(2, '0')}-${slug(prompt)}.json`;
    writeFileSync(join(OUT_DIR, file), JSON.stringify(recording, null, 2) + '\n');
    console.log(`ok (try ${attempt})  ${prompt}  (${seconds} s) -> ${file}: ${JSON.stringify(result)}`);
    saved = true;
  }
  if (!saved) failed++;
}

await browser.close();
process.exit(failed ? 1 : 0);
