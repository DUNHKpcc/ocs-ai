# AI Answer Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new arbitrary-site AI answer assistant that recognizes questions inside a user-selected region, displays OpenAI-compatible answers, optionally fills answers after user action, and emits a separate Tampermonkey-installable `dist/ocs.ai.user.js`.

**Architecture:** Add isolated AI assistant modules under `packages/scripts/src/projects/ai-assistant/`, then register a new all-page script from `CommonProject`. Pure recognizer, AI response parsing, fingerprinting, and fill mapping live in small modules with unit-style Node tests; browser-only region selection and observer logic stay in DOM modules. Build script changes create a separate AI userscript output without changing existing outputs.

**Tech Stack:** TypeScript 4.5, existing `easy-us` UI helpers, existing OCS request and userscript builder utilities, `GM_xmlhttpRequest`, Node `assert` for focused tests, existing `pnpm tsc` and `pnpm build` verification.

---

## File Structure

- Create `packages/scripts/src/projects/ai-assistant/types.ts`: shared AI assistant types.
- Create `packages/scripts/src/projects/ai-assistant/fingerprint.ts`: stable question fingerprint.
- Create `packages/scripts/src/projects/ai-assistant/recognizer.ts`: DOM-to-question extraction inside selected region.
- Create `packages/scripts/src/projects/ai-assistant/ai-answerer.ts`: OpenAI-compatible request payload, response parsing, and `SearchInformation` conversion.
- Create `packages/scripts/src/projects/ai-assistant/fill.ts`: safe current-question assisted fill mapping.
- Create `packages/scripts/src/projects/ai-assistant/selector.ts`: element picker overlay and selector path persistence helpers.
- Create `packages/scripts/src/projects/ai-assistant/observer.ts`: debounced `MutationObserver` runner.
- Create `packages/scripts/src/projects/ai-assistant/script.ts`: `Script` panel entry and UI orchestration.
- Create `scripts/test-ai-answer-assistant.js`: focused behavior checks against built `dist/index.js`.
- Modify `packages/scripts/src/projects/common.ts`: add AI assistant script entry to `CommonProject`.
- Modify `packages/scripts/src/index.ts`: export AI assistant helpers if needed by tests and bundled output.
- Modify `scripts/build-core.js`: add `dist/ocs.ai.user.js` with `@match *://*/*` and `@connect *`.
- Modify `packages/scripts/assets/less/style.less` and `packages/scripts/assets/css/style.css`: small overlay/result styles.

---

### Task 1: Add Pure AI Assistant Types, Fingerprint, And Response Parser

**Files:**
- Create: `packages/scripts/src/projects/ai-assistant/types.ts`
- Create: `packages/scripts/src/projects/ai-assistant/fingerprint.ts`
- Create: `packages/scripts/src/projects/ai-assistant/ai-answerer.ts`
- Modify: `packages/scripts/src/index.ts`
- Create: `scripts/test-ai-answer-assistant.js`

- [ ] **Step 1: Write the failing parser/fingerprint test**

Add `scripts/test-ai-answer-assistant.js`:

```js
const assert = require('assert');
const OCS = require('../dist/index.js');

assert.strictEqual(typeof OCS.createQuestionFingerprint, 'function');
assert.strictEqual(typeof OCS.parseAiAnswerContent, 'function');
assert.strictEqual(typeof OCS.createAiSearchInformation, 'function');

const fingerprintA = OCS.createQuestionFingerprint({
  question: ' 1 + 1 = ? ',
  options: ['A. 1', 'B. 2'],
  type: 'single'
});
const fingerprintB = OCS.createQuestionFingerprint({
  question: '1+1=?',
  options: ['A. 1', 'B. 2'],
  type: 'single'
});
assert.strictEqual(fingerprintA, fingerprintB);

const parsed = OCS.parseAiAnswerContent('{"answer":"B","answers":["B"],"explanation":"Because 1 + 1 = 2.","confidence":0.9}');
assert.deepStrictEqual(parsed.answers, ['B']);
assert.strictEqual(parsed.answer, 'B');
assert.strictEqual(parsed.explanation, 'Because 1 + 1 = 2.');
assert.strictEqual(parsed.confidence, 0.9);

const fallback = OCS.parseAiAnswerContent('答案：A\\n解析：选择第一项');
assert.deepStrictEqual(fallback.answers, ['A']);
assert.strictEqual(fallback.explanation, '选择第一项');

const info = OCS.createAiSearchInformation(
  {
    question: '1+1=?',
    options: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' }
    ],
    type: 'single',
    fillTargets: []
  },
  parsed
);
assert.strictEqual(info.name, 'AI');
assert.strictEqual(info.results[0].question, '1+1=?');
assert.strictEqual(info.results[0].answer, 'B');
assert.strictEqual(info.results[0].extra_data.ai, true);

console.log('AI assistant parser/fingerprint tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: build may pass, then Node fails with an assertion that `createQuestionFingerprint` is not a function.

- [ ] **Step 3: Add minimal implementation**

Create `packages/scripts/src/projects/ai-assistant/types.ts`:

```ts
import type { QuestionTypes, SearchInformation } from '@ocsjs/core';

export type AiFillTargetType = 'radio' | 'checkbox' | 'text' | 'textarea' | 'contenteditable' | 'clickable';

export interface AiOption {
  label: string;
  text: string;
  element?: HTMLElement;
}

export interface AiFillTarget {
  type: AiFillTargetType;
  element?: HTMLElement;
  label?: string;
  text?: string;
}

export interface AiQuestionContext {
  question: string;
  options: AiOption[];
  type: QuestionTypes | 'unknown';
  fillTargets: AiFillTarget[];
}

export interface ParsedAiAnswer {
  answer: string;
  answers: string[];
  explanation: string;
  confidence?: number;
}

export interface AiProviderConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  timeout: number;
  systemPrompt: string;
}

export type AiSearchInformation = SearchInformation;
```

Create `packages/scripts/src/projects/ai-assistant/fingerprint.ts`:

```ts
import { AiQuestionContext } from './types';

function normalize(value: string) {
  return value.replace(/\s+/g, '').replace(/[，。！？；：、,.!?;:]/g, '').toLowerCase();
}

export function createQuestionFingerprint(ctx: Pick<AiQuestionContext, 'question' | 'options' | 'type'>) {
  const question = normalize(ctx.question);
  const options = ctx.options.map((option) => `${normalize(option.label)}=${normalize(option.text)}`).join('|');
  return `${ctx.type || 'unknown'}::${question}::${options}`;
}
```

Create `packages/scripts/src/projects/ai-assistant/ai-answerer.ts`:

```ts
import { defaultAnswerWrapperHandler, SearchInformation } from '@ocsjs/core';
import { AiProviderConfig, AiQuestionContext, ParsedAiAnswer } from './types';

export function parseAiAnswerContent(content: string): ParsedAiAnswer {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(trimmed);
    const answers = Array.isArray(parsed.answers)
      ? parsed.answers.map(String).filter(Boolean)
      : parsed.answer
      ? [String(parsed.answer)]
      : [];
    return {
      answer: String(parsed.answer || answers.join('#')),
      answers,
      explanation: String(parsed.explanation || ''),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined
    };
  } catch (error) {
    const answerMatch = trimmed.match(/(?:答案|answer)[:：]?\\s*([A-Ha-h]|正确|错误|对|错|是|否|.+?)(?:\\n|$)/i);
    const explanationMatch = trimmed.match(/(?:解析|explanation)[:：]?\\s*([\\s\\S]*)/i);
    const answer = (answerMatch?.[1] || trimmed.split('\\n')[0] || '').trim();
    return {
      answer,
      answers: answer ? answer.split(/[#,，、\\s]+/).filter(Boolean) : [],
      explanation: (explanationMatch?.[1] || '').trim()
    };
  }
}

export function createAiSearchInformation(ctx: AiQuestionContext, parsed: ParsedAiAnswer): SearchInformation {
  return {
    name: 'AI',
    homepage: '#',
    results: [
      {
        question: ctx.question,
        answer: parsed.answers.length > 1 ? parsed.answers.join('#') : parsed.answer,
        extra_data: {
          ai: true,
          explanation: parsed.explanation,
          confidence: parsed.confidence
        }
      }
    ]
  };
}

export function normalizeChatCompletionsURL(baseURL: string) {
  const trimmed = baseURL.trim().replace(/\\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) {
    return trimmed;
  }
  return `${trimmed}/chat/completions`;
}

export async function requestAiAnswer(config: AiProviderConfig, ctx: AiQuestionContext) {
  const optionsText = ctx.options.map((option) => `${option.label}. ${option.text}`).join('\\n');
  const prompt = [
    `Question type: ${ctx.type}`,
    `Question: ${ctx.question}`,
    optionsText ? `Options:\\n${optionsText}` : '',
    'Return JSON only: {"answer":"A","answers":["A"],"explanation":"short explanation","confidence":0.8}'
  ]
    .filter(Boolean)
    .join('\\n\\n');

  const wrapper = {
    name: 'AI',
    url: normalizeChatCompletionsURL(config.baseURL),
    homepage: '#',
    method: 'post' as const,
    type: 'GM_xmlhttpRequest' as const,
    contentType: 'json' as const,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model: config.model,
      temperature: config.temperature,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ]
    },
    handler:
      "return (res)=>[res?.choices?.[0]?.message?.content || res?.choices?.[0]?.text || JSON.stringify(res), undefined]"
  };

  const infos = await defaultAnswerWrapperHandler([wrapper], {});
  const raw = infos[0]?.results?.[0]?.question || '';
  return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
}
```

Modify `packages/scripts/src/index.ts`:

```ts
export * from './projects/ai-assistant/fingerprint';
export * from './projects/ai-assistant/ai-answerer';
export type * from './projects/ai-assistant/types';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: output includes `AI assistant parser/fingerprint tests passed`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/scripts/src/projects/ai-assistant packages/scripts/src/index.ts scripts/test-ai-answer-assistant.js
git commit -m "feat: add ai answer parsing helpers"
```

---

### Task 2: Add DOM Recognizer And Assisted Fill Mapper

**Files:**
- Create: `packages/scripts/src/projects/ai-assistant/recognizer.ts`
- Create: `packages/scripts/src/projects/ai-assistant/fill.ts`
- Modify: `packages/scripts/src/index.ts`
- Modify: `scripts/test-ai-answer-assistant.js`

- [ ] **Step 1: Extend failing tests for recognizer and fill**

Append this code to `scripts/test-ai-answer-assistant.js` before the final `console.log`:

```js
const root = document.createElement('div');
root.innerHTML = `
  <div class="question">1 + 1 = ?</div>
  <label><input type="radio" name="q1">1</label>
  <label><input type="radio" name="q1">2</label>
`;
const recognized = OCS.recognizeAiQuestion(root);
assert.strictEqual(recognized.question, '1 + 1 = ?');
assert.strictEqual(recognized.type, 'single');
assert.deepStrictEqual(recognized.options.map((option) => option.label), ['A', 'B']);

const fillResult = OCS.fillAiAnswer(recognized, { answer: 'B', answers: ['B'], explanation: '' });
assert.strictEqual(fillResult.ok, true);
assert.strictEqual(root.querySelectorAll('input')[1].checked, true);
```

At the top of the test file, add:

```js
require('browser-env')();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: fails because `recognizeAiQuestion` is not a function.

- [ ] **Step 3: Add recognizer and fill implementation**

Create `packages/scripts/src/projects/ai-assistant/recognizer.ts`:

```ts
import { AiFillTarget, AiOption, AiQuestionContext } from './types';

const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function visibleText(element: HTMLElement) {
  return (element.innerText || element.textContent || '').replace(/\\s+/g, ' ').trim();
}

function inferQuestionText(root: HTMLElement, optionTexts: string[]) {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('.question,[class*=question],[class*=title],h1,h2,h3,h4,p'))
    .map(visibleText)
    .filter(Boolean);
  if (candidates.length) {
    return candidates[0];
  }
  let text = visibleText(root);
  for (const option of optionTexts) {
    text = text.replace(option, '');
  }
  return text.replace(/\\s+/g, ' ').trim();
}

export function recognizeAiQuestion(root: HTMLElement): AiQuestionContext {
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"],input[type="checkbox"]'));
  const textTargets = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"],textarea'));
  const editableTargets = Array.from(root.querySelectorAll<HTMLElement>('[contenteditable="true"]'));

  const options: AiOption[] = inputs.map((input, index) => {
    const label = labels[index] || String(index + 1);
    const text = visibleText(input.closest('label') as HTMLElement) || input.value || label;
    return { label, text, element: input.closest('label') || input };
  });

  const fillTargets: AiFillTarget[] = [
    ...inputs.map((input, index) => ({
      type: input.type === 'checkbox' ? ('checkbox' as const) : ('radio' as const),
      element: input,
      label: labels[index] || String(index + 1),
      text: options[index]?.text || input.value
    })),
    ...textTargets.map((element) => ({
      type: element.tagName.toLowerCase() === 'textarea' ? ('textarea' as const) : ('text' as const),
      element
    })),
    ...editableTargets.map((element) => ({ type: 'contenteditable' as const, element }))
  ];

  const hasCheckbox = inputs.some((input) => input.type === 'checkbox');
  const type = inputs.length
    ? hasCheckbox
      ? 'multiple'
      : 'single'
    : textTargets.length || editableTargets.length
    ? 'completion'
    : 'unknown';

  return {
    question: inferQuestionText(root, options.map((option) => option.text)),
    options,
    type,
    fillTargets
  };
}
```

Create `packages/scripts/src/projects/ai-assistant/fill.ts`:

```ts
import { AiQuestionContext, ParsedAiAnswer } from './types';

function dispatchChange(element: HTMLElement) {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function fillAiAnswer(ctx: AiQuestionContext, answer: ParsedAiAnswer): { ok: boolean; message: string } {
  const answers = answer.answers.length ? answer.answers : [answer.answer].filter(Boolean);
  if (ctx.type === 'single' || ctx.type === 'multiple' || ctx.type === 'judgement') {
    let count = 0;
    for (const target of ctx.fillTargets.filter((target) => target.type === 'radio' || target.type === 'checkbox')) {
      const matched = answers.some((ans) => ans.toLowerCase() === String(target.label).toLowerCase() || ans === target.text);
      if (matched && target.element instanceof HTMLInputElement) {
        target.element.checked = true;
        dispatchChange(target.element);
        count++;
      }
    }
    return count ? { ok: true, message: `filled ${count} choice target(s)` } : { ok: false, message: 'answer did not match choices' };
  }

  const textTarget = ctx.fillTargets.find((target) => ['text', 'textarea', 'contenteditable'].includes(target.type));
  if (!textTarget?.element) {
    return { ok: false, message: 'no text target found' };
  }
  if (textTarget.type === 'contenteditable') {
    textTarget.element.textContent = answers.join(' ');
  } else if (textTarget.element instanceof HTMLInputElement || textTarget.element instanceof HTMLTextAreaElement) {
    textTarget.element.value = answers.join(' ');
  }
  dispatchChange(textTarget.element);
  return { ok: true, message: 'filled text target' };
}
```

Modify `packages/scripts/src/index.ts`:

```ts
export * from './projects/ai-assistant/recognizer';
export * from './projects/ai-assistant/fill';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: output includes `AI assistant parser/fingerprint tests passed`.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/scripts/src/projects/ai-assistant packages/scripts/src/index.ts scripts/test-ai-answer-assistant.js
git commit -m "feat: recognize and fill ai questions"
```

---

### Task 3: Add Region Selector, Observer, And Panel Script

**Files:**
- Create: `packages/scripts/src/projects/ai-assistant/selector.ts`
- Create: `packages/scripts/src/projects/ai-assistant/observer.ts`
- Create: `packages/scripts/src/projects/ai-assistant/script.ts`
- Modify: `packages/scripts/src/projects/common.ts`
- Modify: `packages/scripts/src/index.ts`

- [ ] **Step 1: Write a failing export smoke test**

Append to `scripts/test-ai-answer-assistant.js`:

```js
assert.strictEqual(typeof OCS.createElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.createRegionQuestionObserver, 'function');
assert.strictEqual(!!OCS.CommonProject.scripts.aiAnswerAssistant, true);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: fails because `createElementSelectorPath` is not a function.

- [ ] **Step 3: Add selector and observer helpers**

Create `packages/scripts/src/projects/ai-assistant/selector.ts`:

```ts
export function createElementSelectorPath(element: HTMLElement) {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== document.body && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current) + 1;
    parts.unshift(`${tag}:nth-child(${index})`);
    current = parent;
  }
  return parts.join(' > ');
}

export function resolveElementSelectorPath(path: string, root: Document | HTMLElement = document) {
  if (!path) return undefined;
  return root.querySelector<HTMLElement>(path) || undefined;
}

export function startRegionPicker(onSelect: (element: HTMLElement, path: string) => void) {
  const overlay = document.createElement('div');
  overlay.className = 'ocs-ai-region-overlay';
  document.documentElement.append(overlay);

  let current: HTMLElement | undefined;
  const move = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target || target === overlay || target.closest('.ocs-ai-region-overlay')) return;
    current?.classList.remove('ocs-ai-region-hover');
    current = target;
    current.classList.add('ocs-ai-region-hover');
  };
  const click = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (current) {
      current.classList.remove('ocs-ai-region-hover');
      onSelect(current, createElementSelectorPath(current));
    }
    document.removeEventListener('mousemove', move, true);
    document.removeEventListener('click', click, true);
    overlay.remove();
  };
  document.addEventListener('mousemove', move, true);
  document.addEventListener('click', click, true);
}
```

Create `packages/scripts/src/projects/ai-assistant/observer.ts`:

```ts
export function createRegionQuestionObserver(
  element: HTMLElement,
  onChange: () => void | Promise<void>,
  debounceMs = 500
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onChange();
    }, debounceMs);
  };
  const observer = new MutationObserver(trigger);
  observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true });
  trigger();
  return {
    disconnect() {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    }
  };
}
```

- [ ] **Step 4: Add the panel script**

Create `packages/scripts/src/projects/ai-assistant/script.ts` with a `createAiAnswerAssistantScript()` function that:

- Uses `new Script({ name: '🤖 AI答题助手', namespace: 'common.aiAnswerAssistant', matches: [['所有页面', /.*/]], configs: ... })`.
- Defines configs for enabled flag, mode, baseURL, apiKey, model, temperature, timeout, systemPrompt, hostname region path, and URL region path.
- Renders buttons for selecting a region, starting observation, clearing cache, copying answer, and filling answer.
- On region changes, calls `recognizeAiQuestion`, `createQuestionFingerprint`, local cache lookup, `requestAiAnswer`, and `fillAiAnswer` only after the user clicks fill.

The first implementation can keep UI compact and use existing `h`, `$ui`, `$message`, and `$modal` helpers.

- [ ] **Step 5: Register the script without affecting existing scripts**

Modify `packages/scripts/src/projects/common.ts`:

```ts
import { createAiAnswerAssistantScript } from './ai-assistant/script';
```

Add the script entry inside `CommonProject.scripts`:

```ts
aiAnswerAssistant: createAiAnswerAssistantScript(),
```

Modify `packages/scripts/src/index.ts`:

```ts
export * from './projects/ai-assistant/selector';
export * from './projects/ai-assistant/observer';
export * from './projects/ai-assistant/script';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: smoke test passes and normal build outputs are still created.

- [ ] **Step 7: Commit**

Run:

```bash
git add packages/scripts/src/projects/ai-assistant packages/scripts/src/projects/common.ts packages/scripts/src/index.ts scripts/test-ai-answer-assistant.js
git commit -m "feat: add ai answer assistant panel"
```

---

### Task 4: Add AI Userscript Build Output And Styles

**Files:**
- Modify: `scripts/build-core.js`
- Modify: `packages/scripts/assets/less/style.less`
- Modify: `packages/scripts/assets/css/style.css`
- Modify: `scripts/test-ai-answer-assistant.js`

- [ ] **Step 1: Add failing build-output assertions**

Append to `scripts/test-ai-answer-assistant.js`:

```js
const fs = require('fs');
const path = require('path');
const aiUserScript = fs.readFileSync(path.join(__dirname, '../dist/ocs.ai.user.js'), 'utf8');
assert.match(aiUserScript, /@name\\s+OCS AI答题助手/);
assert.match(aiUserScript, /@match\\s+\\*:\\/\\/\\*\\/\\*/);
assert.match(aiUserScript, /@connect\\s+\\*/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: fails because `dist/ocs.ai.user.js` does not exist.

- [ ] **Step 3: Add build output**

Modify `scripts/build-core.js` after the existing common userscript block:

```js
const aiOpts = createOptions();
aiOpts.metadata.name = 'OCS AI答题助手';
aiOpts.metadata.description = 'OCS AI answer assistant for arbitrary websites with manual region selection.';
aiOpts.metadata.match = ['*://*/*'];
aiOpts.metadata.connect = ['*'];
aiOpts.entry = path.join(__dirname, '../packages/scripts/entry.common.js');
aiOpts.dist = path.join(distResolvedPath, 'ocs.ai.user.js');

console.log('createUserScript: ', aiOpts.metadata.name, aiOpts.dist);
await createUserScript(aiOpts);
```

- [ ] **Step 4: Add minimal styles**

Append to both `packages/scripts/assets/less/style.less` and `packages/scripts/assets/css/style.css`:

```css
.ocs-ai-region-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
}

.ocs-ai-region-hover {
  outline: 2px solid #2563eb !important;
  outline-offset: 2px !important;
}

.ocs-ai-answer-card {
  border: 1px solid #d8dee8;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
  background: #fff;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: output includes `AI assistant parser/fingerprint tests passed` and `dist/ocs.ai.user.js` exists with `@match *://*/*`.

- [ ] **Step 6: Commit**

Run:

```bash
git add scripts/build-core.js packages/scripts/assets/less/style.less packages/scripts/assets/css/style.css scripts/test-ai-answer-assistant.js
git commit -m "build: add ai assistant userscript"
```

---

### Task 5: Final Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run focused test**

Run: `pnpm build && node scripts/test-ai-answer-assistant.js`

Expected: command exits 0 and prints `AI assistant parser/fingerprint tests passed`.

- [ ] **Step 2: Run TypeScript and lint command**

Run: `pnpm tsc`

Expected: command exits 0.

- [ ] **Step 3: Inspect generated userscript metadata**

Run: `sed -n '1,80p' dist/ocs.ai.user.js`

Expected: header contains `OCS AI答题助手`, `@match *://*/*`, `@connect *`, and existing grant entries including `GM_xmlhttpRequest`.

- [ ] **Step 4: Confirm existing outputs remain**

Run: `ls dist/ocs.user.js dist/ocs.dev.user.js dist/ocs.common.user.js dist/ocs.ai.user.js`

Expected: all four files are listed.

- [ ] **Step 5: Commit any final fixes**

Run:

```bash
git status --short
```

Expected: clean working tree after any final committed changes.
