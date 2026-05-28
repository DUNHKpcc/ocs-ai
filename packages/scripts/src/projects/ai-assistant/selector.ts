export function createElementSelectorPath(element: HTMLElement) {
	const parts: string[] = [];
	let current: HTMLElement | null = element;

	while (current && current !== document.body && current !== document.documentElement) {
		const parent: HTMLElement | null = current.parentElement;
		if (!parent) {
			break;
		}
		const index = Array.from(parent.children).indexOf(current) + 1;
		parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
		current = parent;
	}

	return parts.join(' > ');
}

export function resolveElementSelectorPath(path: string, root: Document | HTMLElement = document) {
	if (!path) {
		return undefined;
	}
	return root.querySelector<HTMLElement>(path) || undefined;
}

function applyStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
	Object.assign(element.style, styles);
}

function hasChoiceTargets(element: HTMLElement) {
	return !!element.querySelector('input[type="radio"],input[type="checkbox"],[role="radio"],[role="checkbox"],label');
}

function hasQuestionText(element: HTMLElement) {
	const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
	return /[？?]/.test(text) || !!element.querySelector('.question,[class*=question],[class*=title],h1,h2,h3,h4,p');
}

export function resolveQuestionContainer(element: HTMLElement) {
	let current: HTMLElement | null = element;
	let best: HTMLElement | undefined;
	while (current && current !== document.body && current !== document.documentElement) {
		if (hasQuestionText(current) && hasChoiceTargets(current)) {
			best = current;
			break;
		}
		current = current.parentElement;
	}
	return best || element;
}

function normalizeClientRect(startX: number, startY: number, endX: number, endY: number): DOMRect {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const right = Math.max(startX, endX);
	const bottom = Math.max(startY, endY);
	return {
		left,
		top,
		right,
		bottom,
		x: left,
		y: top,
		width: right - left,
		height: bottom - top,
		toJSON() {
			return this;
		}
	} as DOMRect;
}

function intersectionArea(a: DOMRect, b: DOMRect) {
	const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
	const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
	return width * height;
}

function isPickerElement(element: HTMLElement) {
	return element.classList.contains('ocs-ai-region-overlay') || element.classList.contains('ocs-ai-region-box');
}

function commonAncestor(elements: HTMLElement[]) {
	const [first, ...rest] = elements;
	if (!first) {
		return undefined;
	}
	let ancestor: HTMLElement | null = first;
	while (ancestor && ancestor !== document.documentElement) {
		if (rest.every((element) => ancestor?.contains(element))) {
			return ancestor === document.body ? first : ancestor;
		}
		ancestor = ancestor.parentElement;
	}
	return first;
}

export function resolveElementFromClientRect(rect: DOMRect, root: Document | HTMLElement = document) {
	if (rect.width < 4 || rect.height < 4) {
		return undefined;
	}

	const searchRoot = root instanceof Document ? root.body : root;
	const elements = [searchRoot, ...Array.from(searchRoot.querySelectorAll<HTMLElement>('*'))];
	const candidates = elements
		.map((element) => {
			const bounds = element.getBoundingClientRect();
			const area = bounds.width * bounds.height;
			const intersection = intersectionArea(rect, bounds);
			return { element, bounds, area, intersection };
		})
		.filter(({ element, area, intersection }) => area > 0 && intersection > 0 && !isPickerElement(element));

	const contained = candidates
		.filter(({ area, intersection }) => intersection / area >= 0.85)
		.sort((a, b) => b.area - a.area)
		.map(({ element }) => element);
	if (contained.length) {
		const selected = commonAncestor(contained);
		return selected ? resolveQuestionContainer(selected) : undefined;
	}

	const selected = candidates.sort((a, b) => b.intersection - a.intersection)[0]?.element;
	return selected ? resolveQuestionContainer(selected) : undefined;
}

export function startRegionPicker(onSelect: (element: HTMLElement, path: string) => void) {
	const overlay = document.createElement('div');
	overlay.className = 'ocs-ai-region-overlay';
	applyStyle(overlay, {
		position: 'fixed',
		inset: '0',
		zIndex: '2147483647',
		pointerEvents: 'none'
	});
	document.documentElement.append(overlay);

	let current: HTMLElement | undefined;
	let previousOutline = '';
	let previousOutlineOffset = '';
	const cleanup = () => {
		if (current) {
			current.style.outline = previousOutline;
			current.style.outlineOffset = previousOutlineOffset;
		}
		document.removeEventListener('mousemove', move, true);
		document.removeEventListener('click', click, true);
		overlay.remove();
	};
	const move = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!target || target === overlay || target.closest('.ocs-ai-region-overlay')) {
			return;
		}
		if (current) {
			current.style.outline = previousOutline;
			current.style.outlineOffset = previousOutlineOffset;
		}
		current = target;
		previousOutline = current.style.outline;
		previousOutlineOffset = current.style.outlineOffset;
		current.style.outline = '2px solid #2563eb';
		current.style.outlineOffset = '2px';
	};
	const click = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (current) {
			const selected = resolveQuestionContainer(current);
			onSelect(selected, createElementSelectorPath(selected));
		}
		cleanup();
	};

	document.addEventListener('mousemove', move, true);
	document.addEventListener('click', click, true);
}

export function startRectRegionPicker(onSelect: (element: HTMLElement, path: string) => void) {
	const overlay = document.createElement('div');
	const box = document.createElement('div');
	overlay.className = 'ocs-ai-region-overlay';
	box.className = 'ocs-ai-region-box';
	applyStyle(overlay, {
		position: 'fixed',
		inset: '0',
		zIndex: '2147483647',
		pointerEvents: 'auto',
		cursor: 'crosshair'
	});
	applyStyle(box, {
		position: 'fixed',
		display: 'none',
		border: '2px solid #2563eb',
		background: 'rgba(37, 99, 235, 0.12)',
		boxSizing: 'border-box',
		pointerEvents: 'none'
	});
	overlay.append(box);
	document.documentElement.append(overlay);

	let startX = 0;
	let startY = 0;
	let rect: DOMRect | undefined;
	const previousCursor = document.documentElement.style.cursor;
	document.documentElement.style.cursor = 'crosshair';

	const cleanup = () => {
		document.documentElement.style.cursor = previousCursor;
		document.removeEventListener('mousedown', down, true);
		document.removeEventListener('mousemove', move, true);
		document.removeEventListener('mouseup', up, true);
		document.removeEventListener('keydown', keydown, true);
		overlay.remove();
	};
	const renderBox = () => {
		if (!rect) {
			return;
		}
		box.style.left = `${rect.left}px`;
		box.style.top = `${rect.top}px`;
		box.style.width = `${rect.width}px`;
		box.style.height = `${rect.height}px`;
	};
	const down = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		startX = event.clientX;
		startY = event.clientY;
		rect = normalizeClientRect(startX, startY, startX, startY);
		box.style.display = 'block';
		renderBox();
	};
	const move = (event: MouseEvent) => {
		if (!rect) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
		renderBox();
	};
	const up = (event: MouseEvent) => {
		if (!rect) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
		const selected = resolveElementFromClientRect(rect);
		if (selected) {
			onSelect(selected, createElementSelectorPath(selected));
		}
		cleanup();
	};
	const keydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			cleanup();
		}
	};

	document.addEventListener('mousedown', down, true);
	document.addEventListener('mousemove', move, true);
	document.addEventListener('mouseup', up, true);
	document.addEventListener('keydown', keydown, true);
}
