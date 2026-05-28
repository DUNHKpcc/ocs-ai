import { AiFillTarget, AiOption, AiQuestionContext } from './types';

const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const imageAttributes = ['src', 'data-src', 'data-original', 'data-lazy-src', 'data-actualsrc', 'data-url'];
const imageExtensions = /\.(?:png|jpe?g|gif|webp|bmp|svg)(?:[?#].*)?$/i;

function visibleText(element: HTMLElement | null | undefined) {
	if (!element) {
		return '';
	}
	return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
}

function resolveImageUrl(value: string, doc: Document) {
	const trimmed = value.trim();
	if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('blob:')) {
		return '';
	}
	try {
		const windowLocation = doc.defaultView?.location.href || location.href;
		const baseURL =
			doc.baseURI && doc.baseURI !== 'about:blank'
				? doc.baseURI
				: windowLocation && windowLocation !== 'about:blank'
				? windowLocation
				: 'http://localhost/';
		const url = new URL(trimmed, baseURL);
		return ['http:', 'https:', 'data:'].includes(url.protocol) ? url.href : '';
	} catch (error) {
		return '';
	}
}

function parseSrcset(value: string) {
	return value
		.split(',')
		.map((part) => part.trim().split(/\s+/)[0])
		.filter(Boolean);
}

function parseCssUrls(value: string) {
	const urls: string[] = [];
	const pattern = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(value))) {
		if (match[2]) {
			urls.push(match[2]);
		}
	}
	return urls;
}

export function collectImageUrls(root: HTMLElement) {
	const doc = root.ownerDocument || document;
	const urls: string[] = [];
	const seen = new Set<string>();
	const add = (value?: string | null) => {
		if (!value) {
			return;
		}
		const url = resolveImageUrl(value, doc);
		if (url && !seen.has(url)) {
			seen.add(url);
			urls.push(url);
		}
	};

	for (const element of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
		if (element.tagName.toLowerCase() === 'img') {
			for (const attr of imageAttributes) {
				add(element.getAttribute(attr));
			}
			add((element as HTMLImageElement).currentSrc);
			for (const item of parseSrcset(element.getAttribute('srcset') || '')) {
				add(item);
			}
			for (const item of parseSrcset(element.getAttribute('data-srcset') || '')) {
				add(item);
			}
		}

		if (element.tagName.toLowerCase() === 'source') {
			for (const item of parseSrcset(element.getAttribute('srcset') || '')) {
				add(item);
			}
		}

		if (element.tagName.toLowerCase() === 'a' && imageExtensions.test(element.getAttribute('href') || '')) {
			add(element.getAttribute('href'));
		}

		for (const url of parseCssUrls(element.getAttribute('style') || '')) {
			add(url);
		}
	}

	return urls;
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

function createNativeChoiceTargets(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"],input[type="checkbox"]')).map(
		(input) => ({
			type: input.type === 'checkbox' ? ('checkbox' as const) : ('radio' as const),
			element: input,
			optionElement: input.closest<HTMLElement>('label') || input,
			value: input.value
		})
	);
}

function createRoleChoiceTargets(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[role="radio"],[role="checkbox"]'))
		.filter((element) => !element.querySelector('input[type="radio"],input[type="checkbox"]'))
		.map((element) => ({
			type: element.getAttribute('role') === 'checkbox' ? ('checkbox' as const) : ('radio' as const),
			element,
			optionElement: element,
			value: element.getAttribute('aria-label') || element.getAttribute('data-value') || ''
		}));
}

function createChoiceTargets(root: HTMLElement) {
	const nativeTargets = createNativeChoiceTargets(root);
	return nativeTargets.length ? nativeTargets : createRoleChoiceTargets(root);
}

export function recognizeAiQuestion(root: HTMLElement): AiQuestionContext {
	const choiceTargets = createChoiceTargets(root);
	const textTargets = Array.from(
		root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"],textarea')
	);
	const editableTargets = Array.from(root.querySelectorAll<HTMLElement>('[contenteditable="true"]'));
	const imageUrls = collectImageUrls(root);

	const options: AiOption[] = choiceTargets.map((target, index) => {
		const label = labels[index] || String(index + 1);
		const text = visibleText(target.optionElement) || target.value || label;
		return { label, text, element: target.optionElement };
	});

	const fillTargets: AiFillTarget[] = [
		...choiceTargets.map((target, index) => ({
			type: target.type,
			element: target.element,
			label: labels[index] || String(index + 1),
			text: options[index]?.text || target.value
		})),
		...textTargets.map((element) => ({
			type: element.tagName.toLowerCase() === 'textarea' ? ('textarea' as const) : ('text' as const),
			element
		})),
		...editableTargets.map((element) => ({ type: 'contenteditable' as const, element }))
	];

	const hasCheckbox = choiceTargets.some((target) => target.type === 'checkbox');
	const type = choiceTargets.length
		? hasCheckbox
			? 'multiple'
			: 'single'
		: textTargets.length || editableTargets.length
		? 'completion'
		: 'unknown';

	return {
		question: inferQuestionText(
			root,
			options.map((option) => option.text)
		),
		options,
		imageUrls,
		type,
		fillTargets
	};
}
