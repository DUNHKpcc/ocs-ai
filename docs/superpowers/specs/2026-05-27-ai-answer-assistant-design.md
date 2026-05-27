# AI Answer Assistant Design

Date: 2026-05-27

## Goal

Add a new AI-assisted answering capability to OCS without changing existing platform-specific behavior.

The feature supports two user-facing modes:

- AI answer display: recognize the current question in a selected page region and show an AI-generated answer with a short explanation.
- AI assisted fill: let the user explicitly fill the recognized answer into the current question UI. The script must not auto-submit.

The feature must work on arbitrary websites by letting the user select a question region on the page, then recognizing DOM changes inside that region.

## Non-Goals

- Do not change the existing Chaoxing, Zhihuishu, Icve, ZJY, ICourse, or Yuketang workflows.
- Do not replace the existing question bank configuration.
- Do not automatically submit answers.
- Do not globally scan arbitrary pages without user-selected scope.

## Build Output

Keep current build outputs intact:

- `dist/ocs.user.js`
- `dist/ocs.dev.user.js`
- `dist/ocs.common.user.js`

Add a separate installable userscript output for the new feature:

- `dist/ocs.ai.user.js`

The AI userscript should:

- Use `@match *://*/*` so it can run on arbitrary websites.
- Use `@connect *` or an equivalent broad connect rule so user-configured OpenAI-compatible endpoints can be called through `GM_xmlhttpRequest`.
- Keep the standard `==UserScript==` header so Tampermonkey can install it directly.
- Reuse the existing bundled `index.js` and `STYLE` resource flow where practical.

## User Configuration

Add a new common script panel entry, separate from existing global settings:

- Name: AI answer assistant.
- Match: all pages.
- Default state: disabled until the user configures an endpoint and selects a region.

OpenAI-compatible configuration:

- `baseURL`: endpoint root or chat completions endpoint.
- `apiKey`: stored with existing script storage mechanisms.
- `model`: free text model id.
- `temperature`: default low value for stable answers.
- `timeout`: request timeout in seconds.
- `systemPrompt`: editable advanced setting with a safe default.

Region configuration:

- Save by hostname by default.
- Allow an optional URL-level rule that overrides hostname rules.
- Store enough information to re-find the selected DOM container after reload.

## Region Selection

The user clicks a "select question region" action from the AI assistant panel.

The selector overlay should:

- Highlight elements under the cursor.
- Let the user click a container that represents the current question area.
- Persist a selector path for that container.
- Show a confirmation message when the region is saved.

The selected region is not assumed to contain the whole page. All recognition is limited to that region.

## Dynamic Recognition

After a region is selected, attach a `MutationObserver` to the resolved container.

Behavior:

- Debounce DOM changes before recognizing.
- Extract the current question candidate from the region after each change.
- Build a stable question fingerprint from question text, options, and type.
- If the fingerprint matches the previous result, do nothing.
- If it is new, read from cache first, then call the AI endpoint if needed.

This supports dynamic question cards, single-question pagination, and sites that replace the DOM while the selected region stays mounted.

If the selected container disappears:

- Attempt to resolve it again from the saved selector.
- Show a clear warning if it cannot be found.
- Do not scan the whole page as a fallback.

## DOM Recognition

The first version should use rule-based recognition inside the selected region.

Recognizer output:

- Question text.
- Options, if present.
- Question type: single choice, multiple choice, judgment, completion, or unknown.
- Candidate fill targets: radio, checkbox, text input, textarea, contenteditable, or clickable option elements.

Recognition principles:

- Prefer semantic form controls first.
- Preserve option order for A/B/C/D mapping.
- Remove obvious UI-only text such as buttons, navigation, timers, and status labels when possible.
- Include image URLs as text hints, following the existing OCS image text pattern.
- If confidence is low, show the extracted content and allow the user to continue using display-only mode.

Manual correction is allowed as a follow-up feature, but the initial design should keep the UI small and focused.

## AI Answerer

Implement an AI answerer that converts recognized question context into the existing OCS `SearchInformation` shape.

Request format:

- Use OpenAI-compatible Chat Completions.
- Send a concise system message that asks for structured JSON.
- Send question text, options, type, and instructions to return only answers that map to visible options when options exist.

Expected response JSON:

```json
{
  "answer": "A",
  "answers": ["A"],
  "explanation": "short explanation",
  "confidence": 0.8
}
```

The adapter should tolerate providers that return plain text by falling back to a best-effort parse.

Result mapping:

- For choice questions, preserve both the option labels and full option text where possible.
- For completion questions, use the answer text directly.
- Add metadata such as `ai: true`, `confidence`, and `explanation` in `extra_data`.

## UI Behavior

The AI assistant panel shows:

- Current region status.
- Current recognized question.
- AI answer and explanation.
- Loading, error, and cached states.
- A "fill answer" button when a fill target is available.
- A "copy answer" action.

A mode toggle controls behavior:

- Display only: show AI answer and explanation.
- Assisted fill: show the fill button and require user click before writing into the page.

No automatic submit button is required.

## Assisted Fill

Filling must apply only to the current recognized question.

Supported targets:

- Radio or checkbox choice controls.
- Clickable option rows when no form controls are found.
- Text inputs.
- Textareas.
- Contenteditable elements.

Choice filling:

- Match answer labels first, such as A/B/C/D.
- Fall back to option text similarity.
- Never click submit, save, next, or navigation buttons.

Completion filling:

- Fill the best available text target inside the selected region.
- Dispatch standard `input` and `change` events after setting values.

If the answer cannot be mapped safely, show a warning and leave the page unchanged.

## Caching

Cache AI results by:

- Provider config fingerprint excluding the API key.
- Model.
- Question fingerprint.

Cache content:

- Answer.
- Explanation.
- Confidence.
- Timestamp.

Cache is local to the userscript storage and can be cleared from the AI assistant panel.

## Error Handling

Handle these states visibly:

- Endpoint missing or invalid.
- API request failed.
- API timeout.
- Invalid JSON response.
- Region not found.
- Question not recognized.
- Fill target not found.
- Unsafe answer mapping.

Errors should affect only the AI assistant. Existing scripts and platform-specific workers must continue normally.

## Integration Boundaries

New code should live in new modules where possible:

- AI answerer adapter.
- Region selector.
- Region observer.
- DOM question recognizer.
- Assisted fill mapper.
- AI assistant common script entry.

Existing modules may be imported and reused, especially:

- `SearchInformation`
- `SimplifyWorkResult`
- request utilities
- existing UI helpers
- image text helpers

Do not change default behavior for current project scripts.

## Testing

Minimum verification:

- TypeScript build passes.
- Existing userscript outputs are still generated.
- New `ocs.ai.user.js` is generated with `@match *://*/*`.
- New AI panel appears on a basic HTML fixture page.
- Selecting a region starts observing only that region.
- Replacing the question card DOM triggers one debounced AI request.
- Cached results prevent duplicate requests for the same question.
- Display-only mode never writes to the page.
- Assisted fill mode writes only after user action.
- Existing platform entries remain present in normal build output.

## Open Questions Resolved

- AI provider: OpenAI-compatible interface.
- User modes: display answer and assisted fill.
- Arbitrary website support: manual region selection.
- Dynamic question changes: observe selected region and update by question fingerprint.
- Build strategy: separate installable AI userscript output to avoid affecting current scripts.
