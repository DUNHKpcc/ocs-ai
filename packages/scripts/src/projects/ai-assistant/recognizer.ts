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
	const normalize = (text: string) => text.replace(/\s+/g, '').trim();
	const cleanQuestionMeta = (text: string) =>
		text
			.replace(/^\s*\d+\s*[.、]\s*/, '')
			.replace(
				/^\s*[（(]\s*(?:单选题|多选题|判断题|填空题|问答题|名词解释|完形填空|阅读理解)\s*[,，]?\s*\d+(?:\.\d+)?\s*分\s*[）)]\s*/,
				''
			)
			.replace(/^\s*[[(【（]\s*(?:单选题|多选题|判断题|填空题|问答题|名词解释|完形填空|阅读理解)\s*[\])】）]\s*/, '')
			.trim();
	const stripOptionLabel = (text: string) =>
		text
			.replace(/\s*选择\s*$/g, '')
			.replace(/^([A-Z])(?:[.、．]|\s)+/i, '')
			.replace(/^([A-Z])(?:[.、．]|\s)+/i, '')
			.trim();
	const optionSet = new Set<string>();
	for (const option of optionTexts) {
		[option, stripOptionLabel(option)].filter(Boolean).forEach((item) => optionSet.add(normalize(item)));
	}
	const isMetaText = (text: string) =>
		/^\d+[.、]?$/.test(text) ||
		/^(?:\d+[.、]\s*)?[（(]?\s*(?:单选题|多选题|判断题|填空题|问答题)(?:\s*[,，]?\s*\d+\s*分)?\s*[）)]?$/.test(text);
	const isOptionText = (text: string) => {
		const normalized = normalize(text);
		const stripped = normalize(stripOptionLabel(text));
		return optionSet.has(normalized) || optionSet.has(stripped);
	};
	const chaoxingTitle = root.querySelector<HTMLElement>('h3, .Zy_TItle .clearfix');
	if (chaoxingTitle && root.closest('.questionLi, .TiMu')) {
		const cleaned = cleanQuestionMeta(visibleText(chaoxingTitle));
		if (cleaned && !isMetaText(cleaned) && !isOptionText(cleaned)) {
			return cleaned;
		}
	}
	const seen = new Set<string>();
	const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
	const candidates = elements
		.map((element, index) => ({ element, index, text: cleanQuestionMeta(visibleText(element)) }))
		.filter(Boolean)
		.filter(({ text }) => {
			if (seen.has(text) || isOptionText(text) || isMetaText(text)) {
				return false;
			}
			seen.add(text);
			return true;
		})
		.map(({ element, index, text }) => ({
			text,
			index,
			score:
				(/[？?]/.test(text) ? 100 : 0) +
				(/[。.!！]$/.test(text) && text.length >= 6 ? 70 : 0) -
				(hasAnswerTargets(element) ? 60 : 0) +
				(/[=＝]$/.test(text) ? 55 : 0) +
				(/设|则|求|计算|下列|以下|哪|什么|是否|判断/.test(text) ? 30 : 0) -
				(text.length < 3 ? 60 : 0)
		}))
		.sort((a, b) => b.score - a.score || a.index - b.index)
		.map((item) => item.text);

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
			optionElement: resolveNativeOptionElement(input),
			value: input.value
		})
	);
}

function isChaoxingQuestionElement(element: HTMLElement) {
	return !!element.closest('.questionLi,.TiMu');
}

function resolveNativeOptionElement(input: HTMLInputElement) {
	const label = input.closest<HTMLElement>('label');
	if (label) {
		return label;
	}
	if (!isChaoxingQuestionElement(input)) {
		return resolveGenericOptionElement(input);
	}
	return (
		input.closest<HTMLElement>('.answerBg,li')?.querySelector<HTMLElement>('.answer_p,.after,label:not(.before)') ||
		input.closest<HTMLElement>('.answerBg,li') ||
		input
	);
}

function resolveGenericOptionElement(input: HTMLInputElement) {
	let current = input.parentElement;
	let depth = 0;
	while (current && current !== document.body && current !== document.documentElement && depth < 4) {
		const choiceCount = current.querySelectorAll('input[type="radio"],input[type="checkbox"]').length;
		if (choiceCount <= 1 && visibleText(current)) {
			return current;
		}
		current = current.parentElement;
		depth++;
	}
	return input;
}

function createRoleChoiceTargets(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[role="radio"],[role="checkbox"]'))
		.filter((element) => !element.querySelector('input[type="radio"],input[type="checkbox"]'))
		.map((element) => ({
			type: element.getAttribute('role') === 'checkbox' ? ('checkbox' as const) : ('radio' as const),
			element,
			optionElement: isChaoxingQuestionElement(element)
				? element.querySelector<HTMLElement>('.answer_p,.textDIV,.eidtDiv,.after,label:not(.before)') || element
				: element,
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

function resolveQuestionTextContainer(element: HTMLElement, scope: HTMLElement) {
	let current: HTMLElement | null = element;
	while (current && current !== document.body && current !== document.documentElement) {
		if (hasQuestionSignal(current) && hasAnswerTargets(current)) {
			return current;
		}
		if (current === scope) {
			break;
		}
		current = current.parentElement;
	}
	return element;
}

function compareDocumentOrder(a: HTMLElement, b: HTMLElement) {
	if (a === b) {
		return 0;
	}
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
}

function collectActiveQuestionElements(root: HTMLElement) {
	const layoutUsable = hasUsableLayout(root);
	const candidates = new Set<HTMLElement>();
	for (const target of createChoiceTargets(root)) {
		const resolved = resolveQuestionTextContainer(target.optionElement, root);
		if (Number.isFinite(questionCandidateScore(resolved, layoutUsable))) {
			candidates.add(resolved);
		}
	}
	for (const element of Array.from(
		root.querySelectorAll<HTMLElement>('input[type="text"],textarea,[contenteditable="true"]')
	)) {
		const resolved = resolveQuestionTextContainer(element, root);
		if (Number.isFinite(questionCandidateScore(resolved, layoutUsable))) {
			candidates.add(resolved);
		}
	}

	const items = Array.from(candidates)
		.filter((element) => isVisibleQuestionElement(element, layoutUsable))
		.sort(compareDocumentOrder);
	return items.filter(
		(element) =>
			!items.some(
				(other) => other !== element && element.contains(other) && countChoiceGroups(element) > countChoiceGroups(other)
			)
	);
}

function collectChaoxingQuestionElements(root: HTMLElement) {
	const closest = root.closest<HTMLElement>('.questionLi,.TiMu');
	if (closest) {
		return [closest];
	}
	return Array.from(root.querySelectorAll<HTMLElement>('.questionLi,.TiMu')).filter(hasAnswerTargets);
}

function isLikelyQuestionStemText(text: string) {
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (normalized.length < 6 || /^[A-Z](?:[.、．]|\s)/i.test(normalized)) {
		return false;
	}
	return (
		/[？?]/.test(normalized) ||
		/下列|以下|哪|什么|是否|应|应该|使用|注解|正确|错误|设|则|求|计算|[。.!！]$/.test(normalized)
	);
}

function hasPreviousQuestionStem(element: HTMLElement) {
	let sibling = element.previousSibling;
	let checked = 0;
	while (sibling && checked < 8) {
		const text =
			sibling.nodeType === Node.ELEMENT_NODE
				? visibleText(sibling as HTMLElement)
				: sibling.textContent?.replace(/\s+/g, ' ').trim() || '';
		if (isLikelyQuestionStemText(text)) {
			return true;
		}
		sibling = sibling.previousSibling;
		checked++;
	}
	return false;
}

function resolveNearbyQuestionContainer(root: HTMLElement) {
	let current: HTMLElement | null = root;
	while (current && current !== document.body && current !== document.documentElement) {
		const parent: HTMLElement | null = current.parentElement;
		if (parent && hasAnswerTargets(current) && hasPreviousQuestionStem(current)) {
			return parent;
		}
		current = parent;
	}
	return undefined;
}

export function resolveActiveQuestionElement(root: HTMLElement) {
	const chaoxingQuestionElement = root.closest<HTMLElement>('.questionLi,.TiMu');
	if (chaoxingQuestionElement && !hasHiddenStyle(chaoxingQuestionElement)) {
		return chaoxingQuestionElement;
	}

	const nearbyQuestionContainer = resolveNearbyQuestionContainer(root);
	if (nearbyQuestionContainer && !hasHiddenStyle(nearbyQuestionContainer)) {
		return nearbyQuestionContainer;
	}

	let fallback: HTMLElement | undefined;
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
			const resolved = resolveQuestionTextContainer(candidates[0].element, scope);
			if (!fallback) {
				fallback = resolved;
			}
			if (hasQuestionSignal(resolved)) {
				return resolved;
			}
		}
	}
	return fallback || root;
}

function recognizeAiQuestionFromRoot(root: HTMLElement): AiQuestionContext {
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

export function recognizeAiQuestions(root: HTMLElement): AiQuestionContext[] {
	const chaoxingQuestionElements = collectChaoxingQuestionElements(root);
	if (chaoxingQuestionElements.length) {
		return chaoxingQuestionElements.map(recognizeAiQuestionFromRoot);
	}

	const questionElements = collectActiveQuestionElements(root);
	if (questionElements.length > 1) {
		return questionElements.map(recognizeAiQuestionFromRoot);
	}
	return [recognizeAiQuestionFromRoot(questionElements[0] || resolveActiveQuestionElement(root))];
}

export function recognizeAiQuestion(root: HTMLElement): AiQuestionContext {
	return recognizeAiQuestionFromRoot(resolveActiveQuestionElement(root));
}
