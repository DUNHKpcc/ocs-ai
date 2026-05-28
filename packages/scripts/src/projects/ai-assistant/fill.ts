import { AiQuestionContext, ParsedAiAnswer } from './types';

function dispatchChange(element: HTMLElement) {
	const EventConstructor = element.ownerDocument.defaultView?.Event || Event;
	element.dispatchEvent(new EventConstructor('input', { bubbles: true }));
	element.dispatchEvent(new EventConstructor('change', { bubbles: true }));
}

export function fillAiAnswer(ctx: AiQuestionContext, answer: ParsedAiAnswer): { ok: boolean; message: string } {
	const answers = answer.answers.length ? answer.answers : [answer.answer].filter(Boolean);

	if (ctx.type === 'single' || ctx.type === 'multiple' || ctx.type === 'judgement') {
		let count = 0;
		for (const target of ctx.fillTargets.filter((target) => target.type === 'radio' || target.type === 'checkbox')) {
			const matched = answers.some(
				(ans) => ans.toLowerCase() === String(target.label).toLowerCase() || ans === target.text
			);
			if (matched && target.element instanceof HTMLInputElement) {
				target.element.checked = true;
				dispatchChange(target.element);
				count++;
			}
		}
		return count
			? { ok: true, message: `filled ${count} choice target(s)` }
			: { ok: false, message: 'answer did not match choices' };
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
