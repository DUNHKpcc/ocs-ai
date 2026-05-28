import { $message, $ui, h, Script } from 'easy-us';
import { createAiSearchInformation, requestAiAnswer } from './ai-answerer';
import { fillAiAnswer } from './fill';
import { createQuestionFingerprint } from './fingerprint';
import { createRegionQuestionObserver } from './observer';
import { recognizeAiQuestion } from './recognizer';
import { resolveElementSelectorPath, startRegionPicker } from './selector';
import { AiQuestionContext, ParsedAiAnswer } from './types';

const DEFAULT_SYSTEM_PROMPT =
	'You answer quiz questions. Return compact JSON only. For choice questions, answer with visible option labels when possible.';

type ObserverHandle = ReturnType<typeof createRegionQuestionObserver>;

const state: {
	observer?: ObserverHandle;
	fingerprint?: string;
	question?: AiQuestionContext;
	answer?: ParsedAiAnswer;
	error?: string;
	status?: string;
	loading: boolean;
	cache: Map<string, ParsedAiAnswer>;
} = {
	loading: false,
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
		imageMode: cfg.imageMode || 'links'
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

function renderPanel(panel: any, script: Script) {
	const cfg = script.cfg as any;
	const regionPath = getRulePath(cfg);
	const regionStatus = regionPath ? `已保存区域：${regionPath}` : '未选择题目区域';
	const answerText = state.answer?.answers.length ? state.answer.answers.join('、') : state.answer?.answer || '';
	const imageCount = state.question?.imageUrls.length || 0;

	const selectButton = $ui.button('框选题目区域');
	selectButton.onclick = () => {
		startRegionPicker((_, path) => {
			setRulePath(cfg, path);
			state.status = '已保存题目区域。';
			$message.success({ content: '已保存 AI 答题区域。' });
			renderPanel(panel, script);
		});
	};

	const startButton = $ui.button('开始监听');
	startButton.onclick = async () => {
		const root = resolveElementSelectorPath(getRulePath(cfg));
		if (!root) {
			$message.warn({ content: '未找到已保存的题目区域，请重新框选。' });
			return;
		}
		state.observer?.disconnect();
		state.observer = createRegionQuestionObserver(root, async () => {
			await updateCurrentAnswer(root, script);
			renderPanel(panel, script);
		});
		state.status = '已开始监听当前区域。';
		await updateCurrentAnswer(root, script);
		$message.success({ content: 'AI 答题助手已开始监听当前区域。' });
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
	fillButton.disabled = !state.question || !state.answer || cfg.mode !== 'fill';
	fillButton.onclick = () => {
		if (!state.question || !state.answer) {
			return;
		}
		const result = fillAiAnswer(state.question, state.answer);
		$message[result.ok ? 'success' : 'warn']({ content: result.message });
	};

	panel.body.replaceChildren(
		h('div', { className: 'ocs-ai-answer-card' }, [
			h('div', regionStatus),
			h('div', { style: { marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, [
				selectButton,
				startButton,
				clearButton,
				copyButton,
				fillButton
			]),
			h('hr'),
			h('div', [h('b', '题目：'), state.question?.question || '等待识别']),
			h('div', [h('b', '图片：'), imageCount ? `${imageCount} 张` : '暂无']),
			h('div', [h('b', '答案：'), state.loading ? '请求中...' : answerText || '暂无']),
			h('div', [h('b', '解析：'), state.answer?.explanation || '暂无']),
			state.status ? h('div', { style: { color: '#047857' } }, state.status) : '',
			state.error ? h('div', { className: 'error' }, state.error) : ''
		])
	);
}

async function updateCurrentAnswer(root: HTMLElement, script: Script) {
	const cfg = script.cfg as any;
	state.error = undefined;
	state.question = recognizeAiQuestion(root);
	const fingerprint = createQuestionFingerprint(state.question);
	if (fingerprint === state.fingerprint && state.answer) {
		return;
	}
	state.fingerprint = fingerprint;
	const cached = state.cache.get(fingerprint);
	if (cached) {
		state.answer = cached;
		return;
	}
	if (!cfg.baseURL || !cfg.apiKey || !cfg.model) {
		state.answer = undefined;
		state.error = '请先配置 OpenAI 兼容接口、API Key 和模型。';
		return;
	}
	state.loading = true;
	try {
		const info = await requestAiAnswer(createProviderConfig(cfg), state.question);
		state.answer = createAnswerFromSearch(info);
		state.cache.set(fingerprint, state.answer);
	} catch (error) {
		state.answer = undefined;
		state.error = (error as any)?.message || String(error);
	} finally {
		state.loading = false;
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
