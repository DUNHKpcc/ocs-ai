import { $message, $ui, h, Script } from 'easy-us';
import { createAiSearchInformation, requestAiAnswer } from './ai-answerer';
import { fillAiAnswer } from './fill';
import { createQuestionFingerprint } from './fingerprint';
import { createRegionQuestionObserver } from './observer';
import { recognizeAiQuestions, resolveActiveQuestionElement } from './recognizer';
import { resolveElementSelectorPath, startRectRegionPicker, startRegionPicker } from './selector';
import { AiQuestionContext, ParsedAiAnswer } from './types';

const DEFAULT_SYSTEM_PROMPT =
	'You answer quiz questions. Return compact JSON only. For choice questions, answer with visible option labels when possible.';

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
	return {
		baseURL: cfg.baseURL,
		apiKey: cfg.apiKey,
		model: cfg.model,
		temperature: Number(cfg.temperature || 0.2),
		timeout: Number(cfg.timeout || 60),
		systemPrompt: cfg.systemPrompt || DEFAULT_SYSTEM_PROMPT,
		imageMode: cfg.imageMode || 'links',
		streamResponse: cfg.streamResponse !== false
	};
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
	const controls = Array.from(panel.configsContainer.querySelectorAll('input,select,textarea')) as HTMLElement[];
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

function renderPanel(panel: any, script: Script) {
	applyPanelLayout(panel);
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
	const renderAnswerItem = (item: AiAnswerItem, index: number) =>
		h('div', { style: { padding: '6px 0', borderTop: index ? '1px solid #e5e7eb' : '' } }, [
			h('div', [h('b', `题目 ${index + 1}：`), item.question.question || '等待识别']),
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

	const rectSelectButton = $ui.button('拖拽框选区域');
	rectSelectButton.onclick = () => {
		startRectRegionPicker((_, path) => {
			setRulePath(cfg, path);
			state.status = '已保存拖拽框选区域。';
			$message.success({ content: '已保存 AI 拖拽框选区域。' });
			renderPanel(panel, script);
		});
	};

	const startButton = $ui.button('开始监听');
	startButton.onclick = async () => {
		const resolveSavedRoot = () => resolveElementSelectorPath(getRulePath(cfg));
		const resolveRoot = () => {
			const savedRoot = resolveSavedRoot();
			if (!savedRoot) {
				return undefined;
			}
			return recognizeAiQuestions(savedRoot).length > 1 ? savedRoot : resolveActiveQuestionElement(savedRoot);
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

	const copyButton = $ui.copy('复制答案', answerText || '暂无答案');
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
					h('div', [h('b', '选项：'), optionText]),
					h('div', [h('b', '图片：'), imageCount ? `${imageCount} 张` : '暂无']),
					h('div', [h('b', '答案：'), state.loading ? '请求中...' : answerText || '暂无']),
					h('div', [h('b', '解析：'), state.answer?.explanation || '暂无'])
			  ];

	panel.body.replaceChildren(
		h('div', { className: 'ocs-ai-answer-card', style: { overflowWrap: 'anywhere', wordBreak: 'break-word' } }, [
			h('div', regionStatus),
			h('div', { style: { marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, [
				selectButton,
				rectSelectButton,
				startButton,
				clearRegionButton,
				clearButton,
				copyButton,
				fillButton
			]),
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
	const questions = recognizeAiQuestions(root);
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
	if (!cfg.baseURL || !cfg.apiKey || !cfg.model) {
		state.answer = undefined;
		state.loading = false;
		state.error = '请先配置 OpenAI 兼容接口、API Key 和模型。';
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
			baseURL: {
				label: 'Base URL',
				defaultValue: ''
			},
			apiKey: {
				label: 'API Key',
				attrs: { type: 'password' },
				defaultValue: ''
			},
			model: {
				label: '模型',
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
		onrender({ panel }) {
			renderPanel(panel, this);
		}
	});
}
