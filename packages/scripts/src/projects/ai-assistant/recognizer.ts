import { AiFillTarget, AiOption, AiQuestionContext } from './types';

const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function visibleText(element: HTMLElement | null | undefined) {
	if (!element) {
		return '';
	}
	return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
}

function inferQuestionText(root: HTMLElement, optionTexts: string[]) {
	const candidates = Array.from(
		root.querySelectorAll<HTMLElement>('.question,[class*=question],[class*=title],h1,h2,h3,h4,p')
	)
		.map(visibleText)
		.filter(Boolean);

	if (candidates.length) {
		return candidates[0];
	}

	let text = visibleText(root);
	for (const option of optionTexts) {
		text = text.replace(option, '');
	}
	return text.replace(/\s+/g, ' ').trim();
}

export function recognizeAiQuestion(root: HTMLElement): AiQuestionContext {
	const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"],input[type="checkbox"]'));
	const textTargets = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"],textarea'));
	const editableTargets = Array.from(root.querySelectorAll<HTMLElement>('[contenteditable="true"]'));

	const options: AiOption[] = inputs.map((input, index) => {
		const label = labels[index] || String(index + 1);
		const optionElement = input.closest('label') || input;
		const text = visibleText(optionElement) || input.value || label;
		return { label, text, element: optionElement };
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
