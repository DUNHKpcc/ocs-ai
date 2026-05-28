import { defaultAnswerWrapperHandler, SearchInformation } from '@ocsjs/core';
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
	try {
		const parsed = JSON.parse(trimmed);
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
		const answerMatch = trimmed.match(/(?:答案|answer)[:：]?\s*([A-Ha-h]|正确|错误|对|错|是|否|.+?)(?:\n|$)/i);
		const explanationMatch = trimmed.match(/(?:解析|explanation)[:：]?\s*([\s\S]*)/i);
		const answer = (answerMatch?.[1] || trimmed.split('\n')[0] || '').trim();
		return {
			answer,
			answers: answer ? answer.split(/[#,，、\s]+/).filter(Boolean) : [],
			explanation: (explanationMatch?.[1] || '').trim()
		};
	}
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

export async function requestAiAnswer(config: AiProviderConfig, ctx: AiQuestionContext) {
	const wrapper = {
		name: 'AI',
		url: normalizeChatCompletionsURL(config.baseURL),
		homepage: '#',
		method: 'post' as const,
		type: 'GM_xmlhttpRequest' as const,
		contentType: 'json' as const,
		headers: {
			Authorization: `Bearer ${config.apiKey}`,
			'Content-Type': 'application/json'
		},
		data: {
			model: config.model,
			temperature: config.temperature,
			messages: createAiChatMessages(config, ctx)
		},
		handler:
			'return (res)=>[res?.choices?.[0]?.message?.content || res?.choices?.[0]?.text || JSON.stringify(res), undefined]'
	};

	const infos = await defaultAnswerWrapperHandler([wrapper], {});
	const raw = infos[0]?.results?.[0]?.question || '';
	return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
}
