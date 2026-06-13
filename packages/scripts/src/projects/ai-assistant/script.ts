import { $message, $ui, h, Script } from 'easy-us';
import { captureViewportRect, releaseCaptureStream, ViewportRect } from './capture';
import { createAiSearchInformation, requestAiAnswer, requestAiAnswerFromScreenshot } from './ai-answerer';
import { fillAiAnswer } from './fill';
import { createQuestionFingerprint } from './fingerprint';
import { createRegionQuestionObserver } from './observer';
import { recognizeAiQuestion, recognizeAiQuestions, resolveActiveQuestionElement } from './recognizer';
import { resolveElementSelectorPath, startRectScreenshotPicker, startRegionPicker } from './selector';
import { AiQuestionContext, ParsedAiAnswer } from './types';

const DEFAULT_SYSTEM_PROMPT =
	'You answer quiz questions. Return compact JSON only. For choice questions, answer with visible option labels when possible.';

const DEFAULT_SCREENSHOT_HOTKEY = 'Alt+S';
const DEFAULT_RECAPTURE_HOTKEY = 'Alt+R';

const PROVIDER_GROUP_COUNT = 3;

interface ProviderGroup {
	name: string;
	baseURL: string;
	apiKey: string;
	model: string;
}

function createDefaultGroups(): ProviderGroup[] {
	return Array.from({ length: PROVIDER_GROUP_COUNT }, (_, i) => ({
		name: `供应商 ${i + 1}`,
		baseURL: '',
		apiKey: '',
		model: ''
	}));
}

function normalizeGroup(raw: any, index: number): ProviderGroup {
	const g = raw && typeof raw === 'object' ? raw : {};
	return {
		name: typeof g.name === 'string' && g.name ? g.name : `供应商 ${index + 1}`,
		baseURL: typeof g.baseURL === 'string' ? g.baseURL : '',
		apiKey: typeof g.apiKey === 'string' ? g.apiKey : '',
		model: typeof g.model === 'string' ? g.model : ''
	};
}

function getProviderGroups(cfg: any): ProviderGroup[] {
	try {
		const groups = typeof cfg.providerGroups === 'string' ? JSON.parse(cfg.providerGroups) : cfg.providerGroups;
		if (Array.isArray(groups) && groups.length) {
			// 规整每一项，缺字段/脏数据时回退默认，避免渲染期 TypeError
			return Array.from({ length: PROVIDER_GROUP_COUNT }, (_, i) => normalizeGroup(groups[i], i));
		}
	} catch (_) {
		/* ignore parse error */
	}
	return createDefaultGroups();
}

function setProviderGroups(cfg: any, groups: ProviderGroup[]) {
	cfg.providerGroups = JSON.stringify(groups);
}

function getActiveGroupIndex(cfg: any): number {
	const idx = Number(cfg.activeGroup || 0);
	return idx >= 0 && idx < PROVIDER_GROUP_COUNT ? idx : 0;
}

function getActiveProvider(cfg: any): ProviderGroup {
	return getProviderGroups(cfg)[getActiveGroupIndex(cfg)];
}

/** 把单个按键标准化（字母统一大写，空格显示为 Space） */
function normalizeHotkeyKey(key: string) {
	if (key === ' ' || key === 'Spacebar') {
		return 'Space';
	}
	return key.length === 1 ? key.toUpperCase() : key;
}

/** 根据键盘事件生成快捷键字符串，如 Alt+Shift+S */
function hotkeyFromEvent(event: KeyboardEvent) {
	const parts: string[] = [];
	if (event.ctrlKey) parts.push('Ctrl');
	if (event.altKey) parts.push('Alt');
	if (event.shiftKey) parts.push('Shift');
	if (event.metaKey) parts.push('Meta');
	parts.push(normalizeHotkeyKey(event.key));
	return parts.join('+');
}

/** 判断键盘事件是否匹配给定的快捷键字符串 */
function matchHotkey(event: KeyboardEvent, hotkey: string) {
	const parts = hotkey
		.split('+')
		.map((part) => part.trim())
		.filter(Boolean);
	const key = parts.pop();
	if (!key) {
		return false;
	}
	return (
		event.ctrlKey === parts.includes('Ctrl') &&
		event.altKey === parts.includes('Alt') &&
		event.shiftKey === parts.includes('Shift') &&
		event.metaKey === parts.includes('Meta') &&
		normalizeHotkeyKey(event.key) === key
	);
}

type ObserverHandle = ReturnType<typeof createRegionQuestionObserver>;
type AiAnswerItem = {
	question: AiQuestionContext;
	fingerprint: string;
	answer?: ParsedAiAnswer;
	error?: string;
	loading: boolean;
};

const state: {
	observer?: ObserverHandle;
	fingerprint?: string;
	question?: AiQuestionContext;
	answer?: ParsedAiAnswer;
	items: AiAnswerItem[];
	error?: string;
	status?: string;
	loading: boolean;
	requestVersion: number;
	cache: Map<string, ParsedAiAnswer>;
	screenshotRect?: ViewportRect;
} = {
	loading: false,
	requestVersion: 0,
	items: [],
	cache: new Map()
};

function getRulePath(cfg: any) {
	return cfg.useUrlRule ? cfg.urlRegionPath : cfg.hostnameRegionPath;
}

function setRulePath(cfg: any, path: string) {
	if (cfg.useUrlRule) {
		cfg.urlRegionPath = path;
	} else {
		cfg.hostnameRegionPath = path;
	}
}

function createProviderConfig(cfg: any) {
	const provider = getActiveProvider(cfg);
	return {
		baseURL: provider.baseURL,
		apiKey: provider.apiKey,
		model: provider.model,
		temperature: Number(cfg.temperature || 0.2),
		timeout: Number(cfg.timeout || 60),
		systemPrompt: cfg.systemPrompt || DEFAULT_SYSTEM_PROMPT,
		imageMode: cfg.imageMode || 'links',
		streamResponse: cfg.streamResponse !== false
	};
}

function isMultipleQuestionMode(cfg: any) {
	return cfg.questionMode === 'multiple';
}

function recognizeCurrentQuestions(root: HTMLElement, cfg: any) {
	return isMultipleQuestionMode(cfg) ? recognizeAiQuestions(root) : [recognizeAiQuestion(root)];
}

function createAnswerFromSearch(info: ReturnType<typeof createAiSearchInformation>): ParsedAiAnswer {
	const result = info.results[0];
	const extra = (result.extra_data || {}) as any;
	return {
		answer: result.answer,
		answers: result.answer ? result.answer.split('#').filter(Boolean) : [],
		explanation: extra.explanation || '',
		confidence: extra.confidence
	};
}

function answerLabel(answer?: ParsedAiAnswer) {
	return answer?.answers.length ? answer.answers.join('、') : answer?.answer || '';
}

function applyPanelLayout(panel: any) {
	Object.assign(panel.style, {
		boxSizing: 'border-box',
		maxWidth: 'min(620px, calc(100vw - 64px))',
		overflowX: 'hidden'
	});
	Object.assign(panel.configsContainer.style, {
		maxWidth: '100%',
		overflowX: 'hidden'
	});
	// 排除复选框/单选框：它们被样式成左右滑动的开关（需要 min-width:36px），
	// 不能被这里的 minWidth:0 覆盖，否则开关会被压扁、显示异常。
	const controls = Array.from(
		panel.configsContainer.querySelectorAll(
			'input:not([type="checkbox"]):not([type="radio"]),select,textarea'
		)
	) as HTMLElement[];
	for (const element of controls) {
		Object.assign(element.style, {
			boxSizing: 'border-box',
			maxWidth: '100%',
			minWidth: '0'
		});
	}
	const textareas = Array.from(panel.configsContainer.querySelectorAll('textarea')) as HTMLTextAreaElement[];
	for (const textarea of textareas) {
		Object.assign(textarea.style, {
			resize: 'vertical',
			minHeight: '54px'
		});
	}
}

function createInputField(
	label: string,
	value: string,
	onChange: (val: string) => void,
	opts?: { type?: string; placeholder?: string }
) {
	const input = h('input', {
		value: value,
		type: opts?.type || 'text',
		placeholder: opts?.placeholder || '',
		style: {
			boxSizing: 'border-box',
			width: '100%',
			padding: '4px 6px',
			border: '1px solid #d1d5db',
			borderRadius: '4px',
			fontSize: '12px'
		}
	}) as HTMLInputElement;
	// 用 input 实时保存：避免切换标签页/截图时丢失尚未 blur 的编辑
	input.addEventListener('input', () => onChange(input.value));
	return h('div', { style: { marginBottom: '6px' } }, [
		h('div', { style: { fontSize: '12px', color: '#374151', marginBottom: '2px' } }, label),
		input
	]);
}

function renderProviderGroupEditor(cfg: any, script: Script, panel: any) {
	const groups = getProviderGroups(cfg);
	const activeIdx = getActiveGroupIndex(cfg);

	const saveGroups = () => {
		setProviderGroups(cfg, groups);
	};

	// 分组标签页
	const tabs = groups.map((group, idx) => {
		const isActive = idx === activeIdx;
		const tab = h(
			'div',
			{
				style: {
					padding: '4px 10px',
					cursor: 'pointer',
					fontSize: '12px',
					borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
					color: isActive ? '#2563eb' : '#6b7280',
					fontWeight: isActive ? 'bold' : 'normal'
				}
			},
			group.name || `供应商 ${idx + 1}`
		);
		tab.onclick = () => {
			cfg.activeGroup = String(idx);
			renderPanel(panel, script);
		};
		return tab;
	});

	const group = groups[activeIdx];

	const nameField = createInputField('名称', group.name, (val) => {
		group.name = val;
		saveGroups();
		// 就地更新当前标签页文字，不整体重渲染，避免输入时焦点丢失
		tabs[activeIdx].textContent = val || `供应商 ${activeIdx + 1}`;
	}, { placeholder: `供应商 ${activeIdx + 1}` });

	const urlField = createInputField('Base URL', group.baseURL, (val) => {
		group.baseURL = val;
		saveGroups();
	}, { placeholder: 'https://api.openai.com/v1' });

	const keyField = createInputField('API Key', group.apiKey, (val) => {
		group.apiKey = val;
		saveGroups();
	}, { type: 'password', placeholder: 'sk-...' });

	const modelField = createInputField('模型', group.model, (val) => {
		group.model = val;
		saveGroups();
	}, { placeholder: 'gpt-4o-mini' });

	const collapseSetting = cfg.providerCollapsed;
	// 默认（未手动设置）：已保存题目区域时折叠，否则展开；手动后用 '1'/'0' 记忆
	const collapsed =
		collapseSetting === '' || collapseSetting === undefined
			? !!getRulePath(cfg)
			: collapseSetting === '1' || collapseSetting === true;
	const configured = !!(group.baseURL && group.apiKey && group.model);

	// 可点击的标题栏：折叠/展开供应商配置
	const header = h(
		'div',
		{
			style: {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				cursor: 'pointer',
				userSelect: 'none',
				marginBottom: '4px'
			}
		},
		[
			h('span', { style: { fontSize: '12px', color: '#6b7280' } }, 'API 供应商配置：'),
			h('span', { style: { fontSize: '12px', color: '#2563eb' } }, collapsed ? '展开 ▸' : '收起 ▾')
		]
	);
	header.onclick = () => {
		cfg.providerCollapsed = collapsed ? '0' : '1';
		renderPanel(panel, script);
	};

	const tabsBar = h(
		'div',
		{ style: { display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' } },
		tabs
	);

	if (collapsed) {
		// 折叠态：只显示当前供应商的一行摘要
		const summary = h(
			'div',
			{ style: { fontSize: '12px', color: '#374151', padding: '2px 0' } },
			`${configured ? '✅' : '⚠️'} 当前：${group.name || `供应商 ${activeIdx + 1}`}${
				group.model ? ' · ' + group.model : '（未配置）'
			}`
		);
		return h('div', { style: { margin: '4px 0' } }, [header, tabsBar, summary]);
	}

	return h('div', { style: { margin: '4px 0' } }, [header, tabsBar, nameField, urlField, keyField, modelField]);
}

/** 给框架的设置区（configsContainer）加一个可折叠标题栏 */
function applySettingsCollapse(panel: any, script: Script) {
	const cfg = script.cfg as any;
	const container = panel.configsContainer as HTMLElement | undefined;
	if (!container) {
		return;
	}
	const body = container.querySelector('.configs-body') as HTMLElement | null;
	if (!body) {
		return;
	}
	const setting = cfg.settingsCollapsed;
	// 默认（未手动设置）：已保存题目区域时折叠；手动后记忆 '1'/'0'
	const collapsed =
		setting === '' || setting === undefined ? !!getRulePath(cfg) : setting === '1' || setting === true;

	body.style.display = collapsed ? 'none' : '';

	let bar = container.querySelector('.ocs-ai-settings-toggle') as HTMLElement | null;
	if (!bar) {
		bar = h('div', { className: 'ocs-ai-settings-toggle' }) as HTMLElement;
		Object.assign(bar.style, {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			cursor: 'pointer',
			userSelect: 'none',
			fontSize: '12px',
			color: '#6b7280',
			padding: '4px 2px'
		});
		container.prepend(bar);
	}
	bar.replaceChildren(
		h('span', '⚙️ 脚本设置'),
		h('span', { style: { color: '#2563eb' } }, collapsed ? '展开 ▸' : '收起 ▾')
	);
	bar.onclick = () => {
		cfg.settingsCollapsed = collapsed ? '0' : '1';
		renderPanel(panel, script);
	};
}

function renderPanel(panel: any, script: Script) {
	applyPanelLayout(panel);
	applySettingsCollapse(panel, script);
	const cfg = script.cfg as any;
	const regionPath = getRulePath(cfg);
	const regionStatus = regionPath ? `已保存区域：${regionPath}` : '未选择题目区域';
	const answerText =
		state.items.length > 1
			? state.items
					.map((item, index) => `${index + 1}. ${item.loading ? '请求中...' : answerLabel(item.answer) || '暂无'}`)
					.join('\n')
			: answerLabel(state.answer);
	const imageCount = state.question?.imageUrls.length || 0;
	const optionText = state.question?.options.length
		? state.question.options.map((option) => `${option.label}. ${option.text}`).join('；')
		: '暂无';
	/** 渲染截图缩略图（仅针对截图搜题产生的 data: 图片） */
	const renderScreenshotThumbs = (question?: AiQuestionContext) => {
		const shots = (question?.imageUrls || []).filter((url) => url.startsWith('data:'));
		if (!shots.length) {
			return '';
		}
		return h('div', { style: { margin: '4px 0' } }, [
			h('b', '截图：'),
			h(
				'div',
				{ style: { marginTop: '4px' } },
				shots.map((url) =>
					h('img', {
						src: url,
						style: {
							maxWidth: '100%',
							maxHeight: '180px',
							border: '1px solid #e5e7eb',
							borderRadius: '4px',
							display: 'block',
							marginTop: '4px'
						}
					})
				)
			)
		]);
	};
	const renderAnswerItem = (item: AiAnswerItem, index: number) =>
		h('div', { style: { padding: '6px 0', borderTop: index ? '1px solid #e5e7eb' : '' } }, [
			h('div', [h('b', `题目 ${index + 1}：`), item.question.question || '等待识别']),
			renderScreenshotThumbs(item.question),
			h('div', [
				h('b', '选项：'),
				item.question.options.length
					? item.question.options.map((option) => `${option.label}. ${option.text}`).join('；')
					: '暂无'
			]),
			h('div', [h('b', '图片：'), item.question.imageUrls.length ? `${item.question.imageUrls.length} 张` : '暂无']),
			h('div', [h('b', '答案：'), item.loading ? '请求中...' : answerLabel(item.answer) || '暂无']),
			h('div', [h('b', '解析：'), item.answer?.explanation || item.error || '暂无'])
		]);

	const selectButton = $ui.button('框选题目区域');
	selectButton.onclick = () => {
		startRegionPicker((_, path) => {
			setRulePath(cfg, path);
			state.status = '已保存题目区域。';
			$message.success({ content: '已保存 AI 答题区域。' });
			renderPanel(panel, script);
		});
	};

	const rectSelectButton = $ui.button('拖拽框选截图');
	rectSelectButton.onclick = () => {
		startRectScreenshotPicker(async (rect) => {
			state.screenshotRect = rect;
			state.status = '已框选区域，开始截图…（请在弹窗中选择共享“此标签页”）';
			renderPanel(panel, script);
			await captureAndAsk(script, () => renderPanel(panel, script));
			renderPanel(panel, script);
		});
	};

	const recaptureButton = $ui.button('重新截图提问');
	recaptureButton.disabled = !state.screenshotRect;
	recaptureButton.onclick = async () => {
		if (!state.screenshotRect) {
			$message.warn({ content: '请先用“拖拽框选截图”框选区域。' });
			return;
		}
		await captureAndAsk(script, () => renderPanel(panel, script));
		renderPanel(panel, script);
	};

	const startButton = $ui.button('开始监听');
	startButton.onclick = async () => {
		const resolveSavedRoot = () => resolveElementSelectorPath(getRulePath(cfg));
		const resolveRoot = () => {
			const savedRoot = resolveSavedRoot();
			if (!savedRoot) {
				return undefined;
			}
			return isMultipleQuestionMode(cfg) ? savedRoot : resolveActiveQuestionElement(savedRoot);
		};
		const root = resolveRoot();
		if (!root) {
			$message.warn({ content: '未找到已保存的题目区域，请重新框选。' });
			return;
		}
		state.observer?.disconnect();
		state.observer = createRegionQuestionObserver(
			resolveRoot,
			async (root) => {
				await updateCurrentAnswer(root, script, () => renderPanel(panel, script));
				renderPanel(panel, script);
			},
			500,
			{
				observeRoot: document.body || document.documentElement,
				intervalMs: 1000
			}
		);
		state.status = '已开始监听当前区域。';
		await updateCurrentAnswer(root, script, () => renderPanel(panel, script));
		$message.success({ content: 'AI 答题助手已开始监听当前区域。' });
		renderPanel(panel, script);
	};

	const clearRegionButton = $ui.button('清空所选区域');
	clearRegionButton.onclick = () => {
		state.observer?.disconnect();
		state.observer = undefined;
		state.requestVersion += 1;
		state.fingerprint = undefined;
		state.question = undefined;
		state.answer = undefined;
		state.items = [];
		state.error = undefined;
		state.loading = false;
		state.screenshotRect = undefined;
		releaseCaptureStream();
		setRulePath(cfg, '');
		state.status = '已清空所选题目区域。';
		$message.success({ content: '已清空 AI 答题区域。' });
		renderPanel(panel, script);
	};

	const clearButton = $ui.button('清空缓存');
	clearButton.onclick = () => {
		state.cache.clear();
		state.status = 'AI 答案缓存已清空。';
		$message.success({ content: 'AI 答案缓存已清空。' });
		renderPanel(panel, script);
	};

	const copyButton = $ui.button('复制答案');
	copyButton.onclick = () => {
		navigator.clipboard.writeText(answerText || '暂无答案');
		$message.success({ content: '答案已复制。' });
	};
	const fillButton = $ui.button('填入答案');
	fillButton.disabled = !state.items.some((item) => item.answer) || cfg.mode !== 'fill';
	fillButton.onclick = () => {
		if (!state.items.length) {
			return;
		}
		const results = state.items.filter((item) => item.answer).map((item) => fillAiAnswer(item.question, item.answer!));
		const okCount = results.filter((result) => result.ok).length;
		$message[okCount ? 'success' : 'warn']({
			content: state.items.length > 1 ? `已填入 ${okCount}/${results.length} 道题。` : results[0]?.message || '暂无答案'
		});
	};

	// 统一按钮尺寸，配合网格布局保持紧凑、对齐
	const actionButtons = [
		selectButton,
		rectSelectButton,
		recaptureButton,
		startButton,
		clearRegionButton,
		clearButton,
		copyButton,
		fillButton
	];
	for (const btn of actionButtons) {
		Object.assign((btn as HTMLElement).style, {
			width: '100%',
			margin: '0',
			padding: '5px 4px',
			fontSize: '12px',
			whiteSpace: 'nowrap',
			boxSizing: 'border-box'
		});
	}

	const detailNodes =
		state.items.length > 1
			? [
					h('div', [
						h('div', [h('b', '识别：'), `共 ${state.items.length} 道题`]),
						...state.items.map(renderAnswerItem)
					])
			  ]
			: [
					h('div', [h('b', '题目：'), state.question?.question || '等待识别']),
					renderScreenshotThumbs(state.question),
					h('div', [h('b', '选项：'), optionText]),
					h('div', [h('b', '图片：'), imageCount ? `${imageCount} 张` : '暂无']),
					h('div', [h('b', '答案：'), state.loading ? '请求中...' : answerText || '暂无']),
					h('div', [h('b', '解析：'), state.answer?.explanation || '暂无'])
			  ];

	panel.body.replaceChildren(
		h('div', { className: 'ocs-ai-answer-card', style: { overflowWrap: 'anywhere', wordBreak: 'break-word' } }, [
			h('div', regionStatus),
			h(
				'div',
				{
					style: {
						marginTop: '8px',
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
						gap: '6px'
					}
				},
				actionButtons
			),
			h('hr'),
			renderProviderGroupEditor(cfg, script, panel),
			h('hr'),
			...detailNodes,
			state.status ? h('div', { style: { color: '#047857' } }, state.status) : '',
			state.error ? h('div', { className: 'error' }, state.error) : ''
		])
	);
}

async function updateCurrentAnswer(root: HTMLElement, script: Script, onStateChange?: () => void) {
	const cfg = script.cfg as any;
	state.error = undefined;
	const questions = recognizeCurrentQuestions(root, cfg);
	const fingerprints = questions.map(createQuestionFingerprint);
	const fingerprint = fingerprints.join('|');
	if (fingerprint === state.fingerprint && state.items.length && state.items.every((item) => item.answer)) {
		return;
	}
	state.fingerprint = fingerprint;
	state.items = questions.map((question, index) => {
		const itemFingerprint = fingerprints[index];
		return {
			question,
			fingerprint: itemFingerprint,
			answer: state.cache.get(itemFingerprint),
			loading: false
		};
	});
	state.question = state.items[0]?.question;
	state.answer = state.items[0]?.answer;
	const _activeProvider = getActiveProvider(cfg);
	if (!_activeProvider.baseURL || !_activeProvider.apiKey || !_activeProvider.model) {
		state.answer = undefined;
		state.loading = false;
		state.error = '请先配置当前供应商的 Base URL、API Key 和模型。';
		onStateChange?.();
		return;
	}
	const pendingItems = state.items.filter((item) => !item.answer);
	if (!pendingItems.length) {
		state.loading = false;
		onStateChange?.();
		return;
	}
	state.loading = true;
	pendingItems.forEach((item) => {
		item.loading = true;
	});
	const requestVersion = ++state.requestVersion;
	onStateChange?.();
	try {
		await Promise.all(
			pendingItems.map(async (item) => {
				try {
					const info = await requestAiAnswer(createProviderConfig(cfg), item.question);
					if (state.requestVersion !== requestVersion) {
						return;
					}
					item.answer = createAnswerFromSearch(info);
					state.cache.set(item.fingerprint, item.answer);
				} catch (error) {
					if (state.requestVersion !== requestVersion) {
						return;
					}
					item.error = (error as any)?.message || String(error);
				} finally {
					if (state.requestVersion === requestVersion) {
						item.loading = false;
					}
				}
			})
		);
	} finally {
		if (state.requestVersion === requestVersion) {
			state.loading = false;
			state.answer = state.items[0]?.answer;
			state.error = state.items.find((item) => item.error)?.error;
		}
	}
}

async function captureAndAsk(script: Script, onStateChange?: () => void) {
	const cfg = script.cfg as any;
	if (!state.screenshotRect) {
		return;
	}
	const provider = getActiveProvider(cfg);
	if (!provider.baseURL || !provider.apiKey || !provider.model) {
		state.error = '请先配置当前供应商的 Base URL、API Key 和模型。';
		onStateChange?.();
		return;
	}
	// 截图模式与 DOM 监听互斥，停止可能存在的 observer
	state.observer?.disconnect();
	state.observer = undefined;
	state.error = undefined;
	state.loading = true;
	const requestVersion = ++state.requestVersion;
	onStateChange?.();

	let dataUrl: string;
	try {
		dataUrl = await captureViewportRect(state.screenshotRect);
	} catch (error) {
		if (state.requestVersion === requestVersion) {
			state.loading = false;
			state.error = (error as any)?.message || String(error);
			onStateChange?.();
		}
		return;
	}
	if (state.requestVersion !== requestVersion) {
		return;
	}

	const question: AiQuestionContext = {
		question: '（截图识别）',
		options: [],
		imageUrls: [dataUrl],
		type: 'unknown',
		fillTargets: []
	};
	const item: AiAnswerItem = { question, fingerprint: 'screenshot', loading: true };
	state.items = [item];
	state.fingerprint = undefined;
	state.question = question;
	state.answer = undefined;
	onStateChange?.();

	try {
		const info = await requestAiAnswerFromScreenshot(createProviderConfig(cfg), dataUrl, {
			questionType: cfg.questionMode === 'multiple' ? 'multiple' : 'single'
		});
		if (state.requestVersion !== requestVersion) {
			return;
		}
		item.answer = createAnswerFromSearch(info);
		state.answer = item.answer;
	} catch (error) {
		if (state.requestVersion !== requestVersion) {
			return;
		}
		item.error = (error as any)?.message || String(error);
		state.error = item.error;
	} finally {
		if (state.requestVersion === requestVersion) {
			item.loading = false;
			state.loading = false;
		}
	}
	onStateChange?.();
}

export function createAiAnswerAssistantScript() {
	return new Script({
		name: '🤖 AI答题助手',
		matches: [['所有页面', /.*/]],
		namespace: 'common.aiAnswerAssistant',
		configs: {
			mode: {
				label: '模式',
				tag: 'select',
				defaultValue: 'display',
				options: [
					['display', '仅展示答案'],
					['fill', '允许手动填入']
				]
			},
			questionMode: {
				label: '识别模式',
				tag: 'select',
				defaultValue: 'single',
				options: [
					['single', '单题识别'],
					['multiple', '多题识别']
				]
			},
			screenshotHotkey: {
				label: '截图快捷键',
				defaultValue: DEFAULT_SCREENSHOT_HOTKEY,
				attrs: {
					placeholder: '点击后按下快捷键',
					readOnly: true,
					title:
						'点击此输入框，然后按下你想用的组合键（如 Alt+S、Ctrl+Shift+Q）。\n按 Esc / Backspace 清空（清空后关闭快捷键）。\n触发后进入拖拽框选，松手即自动截图提问。'
				},
				onload(config: any) {
					const input = this as unknown as HTMLInputElement;
					input.addEventListener('keydown', (event) => {
						event.preventDefault();
						event.stopPropagation();
						// 清空 = 关闭快捷键
						if (event.key === 'Escape' || event.key === 'Backspace' || event.key === 'Delete') {
							config.value = '';
							input.blur();
							return;
						}
						// 忽略只按下修饰键的情况
						if (['Control', 'Alt', 'Shift', 'Meta', 'OS', 'CapsLock'].includes(event.key)) {
							return;
						}
						config.value = hotkeyFromEvent(event);
						input.blur();
					});
				}
			},
			recaptureHotkey: {
				label: '重新截图快捷键',
				defaultValue: DEFAULT_RECAPTURE_HOTKEY,
				attrs: {
					placeholder: '点击后按下快捷键',
					readOnly: true,
					title:
						'点击此输入框，然后按下你想用的组合键（如 Alt+R）。\n按 Esc / Backspace 清空（清空后关闭快捷键）。\n触发时：按上次框选过的区域重新截图提问（需先框选过一次）。'
				},
				onload(config: any) {
					const input = this as unknown as HTMLInputElement;
					input.addEventListener('keydown', (event) => {
						event.preventDefault();
						event.stopPropagation();
						// 清空 = 关闭快捷键
						if (event.key === 'Escape' || event.key === 'Backspace' || event.key === 'Delete') {
							config.value = '';
							input.blur();
							return;
						}
						// 忽略只按下修饰键的情况
						if (['Control', 'Alt', 'Shift', 'Meta', 'OS', 'CapsLock'].includes(event.key)) {
							return;
						}
						config.value = hotkeyFromEvent(event);
						input.blur();
					});
				}
			},
			useUrlRule: {
				label: '按当前URL保存区域',
				attrs: { type: 'checkbox' },
				defaultValue: false
			},
			hostnameRegionPath: {
				defaultValue: ''
			},
			urlRegionPath: {
				defaultValue: ''
			},
			activeGroup: {
				// 隐藏存储项：当前选中的供应商组，由面板内的标签页控制
				defaultValue: '0'
			},
			providerGroups: {
				defaultValue: JSON.stringify(createDefaultGroups())
			},
			providerCollapsed: {
				// 隐藏存储项：供应商配置区是否折叠
				// ''=自动（已保存题目区域时默认折叠）；'1'=手动折叠；'0'=手动展开
				defaultValue: ''
			},
			settingsCollapsed: {
				// 隐藏存储项：脚本设置区（模式/快捷键/温度等）是否折叠，规则同上
				defaultValue: ''
			},
			imageMode: {
				label: '图片发送方式',
				tag: 'select',
				defaultValue: 'links',
				options: [
					['links', '仅发送图片链接'],
					['vision', '多模态 image_url'],
					['both', '链接 + image_url']
				]
			},
			streamResponse: {
				label: '流式响应',
				attrs: { type: 'checkbox' },
				defaultValue: true
			},
			temperature: {
				label: 'Temperature',
				attrs: { type: 'number', min: 0, max: 2, step: 0.1 },
				defaultValue: 0.2
			},
			timeout: {
				label: '超时秒数',
				attrs: { type: 'number', min: 5, step: 1 },
				defaultValue: 60
			},
			systemPrompt: {
				label: '系统提示词',
				tag: 'textarea',
				defaultValue: DEFAULT_SYSTEM_PROMPT
			}
		},
		oncomplete() {
			// 仅在顶层窗口注册截图快捷键，避免 iframe 内重复触发
			if (window.top !== window.self) {
				return;
			}
			// oncomplete 可能在多次 readystate=complete 时被重复调用，防止重复注册键盘监听
			if ((window as any).__ocsAiHotkeyBound) {
				return;
			}
			(window as any).__ocsAiHotkeyBound = true;
			const script = this as unknown as Script;
			const rerender = () => {
				const panel = (script as any).panel;
				if (panel) {
					renderPanel(panel, script);
				}
			};
			// 截图快捷键：进入拖拽框选，松手后自动截图提问
			const startPicker = () => {
				startRectScreenshotPicker(async (rect) => {
					state.screenshotRect = rect;
					rerender();
					await captureAndAsk(script, rerender);
					rerender();
				});
			};
			// 重新截图快捷键：按上次保存的区域重新截图提问
			const recapture = async () => {
				if (!state.screenshotRect) {
					$message.warn({ content: '还没有框选过区域，请先用“拖拽框选截图”或截图快捷键框选一次。' });
					return;
				}
				await captureAndAsk(script, rerender);
				rerender();
			};
			// 冒泡阶段监听，配合录制输入框的 stopPropagation，避免录制快捷键时误触发
			document.addEventListener('keydown', (event) => {
				const cfg = script.cfg as any;
				// 在输入框/可编辑区域中输入时不触发
				const target = event.target as HTMLElement | null;
				if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
					return;
				}
				if (cfg.screenshotHotkey && matchHotkey(event, cfg.screenshotHotkey)) {
					event.preventDefault();
					event.stopPropagation();
					startPicker();
				} else if (cfg.recaptureHotkey && matchHotkey(event, cfg.recaptureHotkey)) {
					event.preventDefault();
					event.stopPropagation();
					recapture();
				}
			});
		},
		onrender({ panel, header }) {
			renderPanel(panel, this);

			if (header && !header.querySelector('.logo')) {
				const logo = document.createElement('img');
				logo.src = 'data:image/png;base64,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';
				logo.className = 'logo';
				logo.style.verticalAlign = 'middle';
				logo.style.marginRight = '4px';
				const profile = header.querySelector('.profile');
				if (profile && profile.parentElement) {
					profile.parentElement.insertBefore(logo, profile);
				}
			}
		}
	});
}
