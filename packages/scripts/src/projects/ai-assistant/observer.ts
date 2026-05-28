export function createRegionQuestionObserver(
	element: HTMLElement,
	onChange: () => void | Promise<void>,
	debounceMs = 500
) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const trigger = () => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			onChange();
		}, debounceMs);
	};
	const observer = new MutationObserver(trigger);
	observer.observe(element, { childList: true, subtree: true, characterData: true, attributes: true });
	trigger();

	return {
		disconnect() {
			if (timer) {
				clearTimeout(timer);
			}
			observer.disconnect();
		}
	};
}
