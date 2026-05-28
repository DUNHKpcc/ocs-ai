export function createRegionQuestionObserver(
	elementOrResolver: HTMLElement | (() => HTMLElement | undefined),
	onChange: (element: HTMLElement) => void | Promise<void>,
	debounceMs = 500,
	opts?: {
		observeRoot?: HTMLElement | Document;
		intervalMs?: number;
	}
) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let interval: ReturnType<typeof setInterval> | undefined;
	let lastElement: HTMLElement | undefined;
	let lastSnapshot = '';
	const resolveElement = () => (typeof elementOrResolver === 'function' ? elementOrResolver() : elementOrResolver);
	const snapshot = (element: HTMLElement) =>
		(element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
	const trigger = () => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			const element = resolveElement();
			if (!element) {
				return;
			}
			const currSnapshot = snapshot(element);
			if (element === lastElement && currSnapshot === lastSnapshot) {
				return;
			}
			lastElement = element;
			lastSnapshot = currSnapshot;
			onChange(element);
		}, debounceMs);
	};
	const observer = new MutationObserver(trigger);
	const observeRoot =
		opts?.observeRoot ||
		(typeof elementOrResolver === 'function' ? document.body || document.documentElement : elementOrResolver);
	observer.observe(observeRoot, { childList: true, subtree: true, characterData: true, attributes: true });
	if (opts?.intervalMs) {
		interval = setInterval(trigger, opts.intervalMs);
	}
	trigger();

	return {
		disconnect() {
			if (timer) {
				clearTimeout(timer);
			}
			if (interval) {
				clearInterval(interval);
			}
			observer.disconnect();
		}
	};
}
