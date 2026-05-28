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

function hasHiddenStyle(element: HTMLElement) {
	let current: HTMLElement | null = element;
	const win = element.ownerDocument.defaultView;
	while (current && current !== element.ownerDocument.documentElement) {
		if (current.hidden) {
			return true;
		}
		const style = win?.getComputedStyle(current);
		if (
			style &&
			(style.display === 'none' ||
				style.visibility === 'hidden' ||
				style.visibility === 'collapse' ||
				style.opacity === '0')
		) {
			return true;
		}
		current = current.parentElement;
	}
	return false;
}

function hasLayoutBox(element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	if (rect.width > 0 && rect.height > 0) {
		return true;
	}
	return Array.from(element.getClientRects()).some((item) => item.width > 0 && item.height > 0);
}

function hasUsableLayout(root: HTMLElement) {
	return [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].some(hasLayoutBox);
}

function isVisibleQuestionElement(element: HTMLElement, layoutUsable: boolean) {
	if (hasHiddenStyle(element)) {
		return false;
	}
	return layoutUsable ? hasLayoutBox(element) : !!visibleText(element);
}

function hasAnswerTargets(element: HTMLElement) {
	return (
		createChoiceTargets(element).length > 0 ||
		!!element.querySelector('input[type="text"],textarea,[contenteditable="true"]')
	);
}

function hasQuestionSignal(element: HTMLElement) {
	const text = visibleText(element);
	return (
		/[？?]/.test(text) ||
		/单选题|多选题|判断题|填空题|问答题|题目/.test(text) ||
		!!element.querySelector('.question,[class*=question],[class*=title],h1,h2,h3,h4,p')
	);
}

function countChoiceGroups(element: HTMLElement) {
	const groups = new Set<string>();
	const nativeInputs = Array.from(
		element.querySelectorAll<HTMLInputElement>('input[type="radio"],input[type="checkbox"]')
	);
	nativeInputs.forEach((input, index) => groups.add(input.name || `${input.type}-${index}`));
	const roleGroups = element.querySelectorAll('[role="radiogroup"],[role="group"]');
	roleGroups.forEach((group, index) => groups.add(`role-${index}-${group.textContent?.length || 0}`));
	return Math.max(groups.size, nativeInputs.length ? 1 : 0, roleGroups.length ? 1 : 0);
}

function questionCandidateScore(element: HTMLElement, layoutUsable: boolean) {
	if (!isVisibleQuestionElement(element, layoutUsable) || !hasAnswerTargets(element)) {
		return -Infinity;
	}

	const text = visibleText(element);
	if (!text || text.length < 2 || text.length > 4000) {
		return -Infinity;
	}

	const choiceCount = createChoiceTargets(element).length;
	const choiceGroupCount = countChoiceGroups(element);
	const textTargetCount = element.querySelectorAll('input[type="text"],textarea,[contenteditable="true"]').length;
	const rect = element.getBoundingClientRect();
	const area = rect.width * rect.height;
	let score = Math.min(choiceCount, 4) * 14 + textTargetCount * 12;

	if (hasQuestionSignal(element)) {
		score += 30;
	}
	if (/[？?]/.test(text)) {
		score += 20;
	}
	if (/question|题|card|item|subject/i.test(element.className || '')) {
		score += 8;
	}
	if (choiceCount >= 2 && choiceCount <= 8) {
		score += 16;
	}
	if (choiceGroupCount > 1) {
		score -= choiceGroupCount * 36;
	}
	if (layoutUsable && area > 0) {
		score -= Math.log(area);
	}
	score -= Math.min(text.length / 250, 16);
	return score;
}

function addCandidate(candidates: Set<HTMLElement>, element: HTMLElement, limitRoot: HTMLElement) {
	let current: HTMLElement | null = element;
	while (current && current !== document.body && current !== document.documentElement) {
		candidates.add(current);
		if (current === limitRoot) {
			break;
		}
		current = current.parentElement;
	}
}

function collectQuestionCandidates(scope: HTMLElement) {
	const candidates = new Set<HTMLElement>([scope]);
	for (const target of createChoiceTargets(scope)) {
		addCandidate(candidates, target.optionElement, scope);
	}
	for (const element of Array.from(
		scope.querySelectorAll<HTMLElement>(
			'input[type="text"],textarea,[contenteditable="true"],.question,[class*=question],[class*=title],h1,h2,h3,h4,p'
		)
	)) {
		addCandidate(candidates, element, scope);
	}
	return candidates;
}

function createSearchScopes(root: HTMLElement) {
	const scopes: HTMLElement[] = [];
	let current: HTMLElement | null = root;
	while (current && current !== document.body && current !== document.documentElement && scopes.length < 5) {
		scopes.push(current);
		current = current.parentElement;
	}
	if (document.body && !scopes.includes(document.body)) {
		scopes.push(document.body);
	}
	return scopes;
}

export function resolveActiveQuestionElement(root: HTMLElement) {
	for (const scope of createSearchScopes(root)) {
		const layoutUsable = hasUsableLayout(scope);
		const candidates = Array.from(collectQuestionCandidates(scope))
			.map((element) => ({
				element,
				score: questionCandidateScore(element, layoutUsable)
			}))
			.filter((item) => Number.isFinite(item.score))
			.sort((a, b) => b.score - a.score);

		if (candidates[0]) {
			return candidates[0].element;
		}
	}
	return root;
}

export function recognizeAiQuestion(root: HTMLElement): AiQuestionContext {
	const activeRoot = resolveActiveQuestionElement(root);
	const choiceTargets = createChoiceTargets(activeRoot);
	const textTargets = Array.from(
		activeRoot.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"],textarea')
	);
	const editableTargets = Array.from(activeRoot.querySelectorAll<HTMLElement>('[contenteditable="true"]'));
	const imageUrls = collectImageUrls(activeRoot);

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
			activeRoot,
			options.map((option) => option.text)
		),
		options,
		imageUrls,
		type,
		fillTargets
	};
}
