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

export function startRegionPicker(onSelect: (element: HTMLElement, path: string) => void) {
	const overlay = document.createElement('div');
	overlay.className = 'ocs-ai-region-overlay';
	document.documentElement.append(overlay);

	let current: HTMLElement | undefined;
	const cleanup = () => {
		current?.classList.remove('ocs-ai-region-hover');
		document.removeEventListener('mousemove', move, true);
		document.removeEventListener('click', click, true);
		overlay.remove();
	};
	const move = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!target || target === overlay || target.closest('.ocs-ai-region-overlay')) {
			return;
		}
		current?.classList.remove('ocs-ai-region-hover');
		current = target;
		current.classList.add('ocs-ai-region-hover');
	};
	const click = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (current) {
			onSelect(current, createElementSelectorPath(current));
		}
		cleanup();
	};

	document.addEventListener('mousemove', move, true);
	document.addEventListener('click', click, true);
}
