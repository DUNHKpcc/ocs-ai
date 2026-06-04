import { request, SearchInformation } from '@ocsjs/core';
import { AiProviderConfig, AiQuestionContext, ParsedAiAnswer } from './types';

type AiChatMessage = {
	role: 'system' | 'user';
	content:
		| string
		| Array<
				| { type: 'text'; text: string }
				| {
						type: 'image_url';
						image_url: {
							url: string;
						};
				  }
		  >;
};

export function parseAiAnswerContent(content: string): ParsedAiAnswer {
	const trimmed = content.trim();
	for (const candidate of createJsonCandidates(trimmed)) {
		const parsed = parseAiAnswerJson(candidate) || parseLooseAiAnswerJson(candidate);
		if (parsed) {
			return parsed;
		}
	}

	// 注意：多选答案如 "ABC" 需整体捕获，[A-Ha-h]+ 放在前面避免只取首字母
	const answerMatch = trimmed.match(
		/(?:^|\n)\s*(?:答案|answer)\s*[:：]\s*([A-Ha-h]+(?![^\s#,，、])|正确|错误|对|错|是|否|.+?)(?:\n|$)/i
	);
	const explanationMatch = trimmed.match(/(?:^|\n)\s*(?:解析|explanation)\s*[:：]\s*([\s\S]*)/i);
	const answer = (answerMatch?.[1] || trimmed.split('\n')[0] || '').trim();
	return {
		answer,
		answers: answer ? answer.split(/[#,，、\s]+/).filter(Boolean) : [],
		explanation: (explanationMatch?.[1] || '').trim()
	};
}

function parseAiAnswerJson(content: string): ParsedAiAnswer | undefined {
	try {
		const parsed = JSON.parse(content);
		if (!parsed || typeof parsed !== 'object') {
			return undefined;
		}
		const answers = Array.isArray(parsed.answers)
			? parsed.answers.map(String).filter(Boolean)
			: parsed.answer
			? [String(parsed.answer)]
			: [];
		return {
			answer: String(parsed.answer || answers.join('#')),
			answers,
			explanation: String(parsed.explanation || ''),
			confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined
		};
	} catch (error) {
		return undefined;
	}
}

function parseLooseAiAnswerJson(content: string): ParsedAiAnswer | undefined {
	const source = extractFirstJsonObject(content);
	if (!source) {
		return undefined;
	}
	const answer = readLooseJsonStringField(source, 'answer');
	const explanation = readLooseJsonStringField(source, 'explanation') || '';
	const answerItems = readLooseJsonStringArrayField(source, 'answers');
	const confidenceMatch = source.match(/"confidence"\s*:\s*(-?\d+(?:\.\d+)?)/i);
	const answers = answerItems.length ? answerItems : answer ? [answer] : [];
	if (!answer && !answers.length && !explanation) {
		return undefined;
	}
	return {
		answer: answer || answers.join('#'),
		answers,
		explanation,
		confidence: confidenceMatch ? Number(confidenceMatch[1]) : undefined
	};
}

function readLooseJsonStringField(source: string, key: string) {
	const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'i');
	const match = source.match(pattern);
	return match ? decodeLooseJsonString(match[1]) : '';
}

function readLooseJsonStringArrayField(source: string, key: string) {
	const pattern = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i');
	const match = source.match(pattern);
	if (!match) {
		return [];
	}
	const items: string[] = [];
	const itemPattern = /"((?:\\.|[^"\\])*)"/g;
	let item: RegExpExecArray | null;
	while ((item = itemPattern.exec(match[1]))) {
		const value = decodeLooseJsonString(item[1]);
		if (value) {
			items.push(value);
		}
	}
	return items;
}

function decodeLooseJsonString(value: string) {
	return value
		.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
		.replace(/\\n/g, '\n')
		.replace(/\\r/g, '\r')
		.replace(/\\t/g, '\t')
		.replace(/\\"/g, '"')
		.replace(/\\\\/g, '\\');
}

function createJsonCandidates(content: string) {
	const candidates = [content, unwrapMarkdownJsonFence(content)];
	for (const item of [...candidates]) {
		const jsonObject = extractFirstJsonObject(item);
		if (jsonObject) {
			candidates.push(jsonObject);
		}
	}
	return Array.from(new Set(candidates.map((item) => item.trim()).filter(Boolean)));
}

function unwrapMarkdownJsonFence(content: string) {
	const match = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
	return match?.[1] || content;
}

function extractFirstJsonObject(content: string) {
	const start = content.indexOf('{');
	if (start === -1) {
		return '';
	}
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let index = start; index < content.length; index++) {
		const char = content[index];
		if (inString) {
			if (escaped) {
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === '"') {
				inString = false;
			}
			continue;
		}
		if (char === '"') {
			inString = true;
		} else if (char === '{') {
			depth++;
		} else if (char === '}') {
			depth--;
			if (depth === 0) {
				return content.slice(start, index + 1);
			}
		}
	}
	return '';
}

export function createAiSearchInformation(ctx: AiQuestionContext, parsed: ParsedAiAnswer): SearchInformation {
	return {
		name: 'AI',
		homepage: '#',
		results: [
			{
				question: ctx.question,
				answer: parsed.answers.length > 1 ? parsed.answers.join('#') : parsed.answer,
				extra_data: {
					ai: true,
					explanation: parsed.explanation,
					confidence: parsed.confidence
				}
			}
		]
	};
}

export function normalizeChatCompletionsURL(baseURL: string) {
	const trimmed = baseURL.trim().replace(/\/+$/, '');
	if (trimmed.endsWith('/chat/completions')) {
		return trimmed;
	}
	return `${trimmed}/chat/completions`;
}

export function parseOpenAIStreamContent(content: string) {
	return content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.startsWith('data:'))
		.map((line) => line.replace(/^data:\s*/, ''))
		.filter((line) => line && line !== '[DONE]')
		.map((line) => {
			try {
				const parsed = JSON.parse(line);
				return parsed?.choices?.[0]?.delta?.content || parsed?.choices?.[0]?.message?.content || '';
			} catch (error) {
				return '';
			}
		})
		.join('');
}

function createAiPrompt(ctx: AiQuestionContext, includeImageLinks: boolean) {
	const optionsText = ctx.options.map((option) => `${option.label}. ${option.text}`).join('\n');
	const imagesText = ctx.imageUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');
	return [
		`Question type: ${ctx.type}`,
		`Question: ${ctx.question}`,
		optionsText ? `Options:\n${optionsText}` : '',
		includeImageLinks && imagesText ? `Image URLs:\n${imagesText}` : '',
		'Return JSON only: {"answer":"A","answers":["A"],"explanation":"short explanation","confidence":0.8}'
	]
		.filter(Boolean)
		.join('\n\n');
}

export function createAiChatMessages(
	config: Pick<AiProviderConfig, 'systemPrompt'> & Partial<Pick<AiProviderConfig, 'imageMode'>>,
	ctx: AiQuestionContext
): AiChatMessage[] {
	const imageMode = config.imageMode || 'links';
	const includeImageLinks = imageMode === 'links' || imageMode === 'both';
	const prompt = createAiPrompt(ctx, includeImageLinks);
	const userContent =
		(imageMode === 'vision' || imageMode === 'both') && ctx.imageUrls.length
			? [
					{ type: 'text' as const, text: prompt },
					...ctx.imageUrls.map((url) => ({ type: 'image_url' as const, image_url: { url } }))
			  ]
			: prompt;

	return [
		{ role: 'system', content: config.systemPrompt },
		{ role: 'user', content: userContent }
	];
}

function extractChatContent(raw: any, stream: boolean): string {
	if (stream) {
		// 流式：GM_xmlhttpRequest onload 给的是完整 SSE 文本，整体解析
		return parseOpenAIStreamContent(typeof raw === 'string' ? raw : String(raw ?? ''));
	}
	// 非流式 JSON；解析不到内容时返回空串（而非把整个响应当答案）
	return raw?.choices?.[0]?.message?.content || raw?.choices?.[0]?.text || '';
}

async function runChatCompletion(config: AiProviderConfig, messages: AiChatMessage[]) {
	// 直接用 core 的 request（GM_xmlhttpRequest），不走 defaultAnswerWrapperHandler，
	// 避免请求体里的 ${...} 被当作占位符替换成 "undefined"（题目含 ${ 时会被破坏）。
	const url = normalizeChatCompletionsURL(config.baseURL);
	const timeoutMs = Math.max(5, Number(config.timeout) || 60) * 1000;

	const responsePromise = request(url, {
		type: 'GM_xmlhttpRequest',
		method: 'post',
		responseType: config.streamResponse ? 'text' : 'json',
		headers: {
			Authorization: `Bearer ${config.apiKey}`,
			'Content-Type': 'application/json'
		},
		data: {
			model: config.model,
			temperature: config.temperature,
			stream: config.streamResponse,
			messages
		}
	});

	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error('AI 请求超时，请增大“超时秒数”或检查网络/接口。')), timeoutMs);
	});

	try {
		const raw = await Promise.race([responsePromise, timeoutPromise]);
		return extractChatContent(raw, config.streamResponse);
	} catch (error) {
		// request 在非 200 时会以 responseText（字符串）reject，统一包成 Error
		throw error instanceof Error ? error : new Error(String(error));
	} finally {
		if (timer) {
			clearTimeout(timer);
		}
	}
}

export async function requestAiAnswer(config: AiProviderConfig, ctx: AiQuestionContext) {
	const raw = await runChatCompletion(config, createAiChatMessages(config, ctx));
	return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
}

function createScreenshotPrompt(questionType?: string) {
	return [
		'The image is a screenshot of a quiz question (it may contain the question text, options, and figures).',
		questionType ? `Expected question type: ${questionType}.` : '',
		'Read the screenshot carefully and answer the question.',
		'Return JSON only: {"answer":"A","answers":["A"],"explanation":"short explanation","confidence":0.8}'
	]
		.filter(Boolean)
		.join('\n\n');
}

/**
 * 截图模式：把框选区域的截图（dataURL）作为图片发给多模态模型解答，不依赖 DOM 文本。
 */
export async function requestAiAnswerFromScreenshot(
	config: AiProviderConfig,
	dataUrl: string,
	opts: { questionType?: string } = {}
) {
	const messages: AiChatMessage[] = [
		{ role: 'system', content: config.systemPrompt },
		{
			role: 'user',
			content: [
				{ type: 'text', text: createScreenshotPrompt(opts.questionType) },
				{ type: 'image_url', image_url: { url: dataUrl } }
			]
		}
	];
	const raw = await runChatCompletion(config, messages);
	const ctx: AiQuestionContext = {
		question: '（截图识别）',
		options: [],
		imageUrls: [dataUrl],
		type: 'unknown',
		fillTargets: []
	};
	return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
}
