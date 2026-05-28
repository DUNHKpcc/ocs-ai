import { AiQuestionContext } from './types';

function normalize(value: string) {
	return value
		.replace(/\s+/g, '')
		.replace(/[，。！？；：、,.!?;:]/g, '')
		.toLowerCase();
}

export function createQuestionFingerprint(
	ctx: Pick<AiQuestionContext, 'question' | 'options' | 'type'> | {
		question: string;
		options: string[];
		type: AiQuestionContext['type'];
	}
) {
	const question = normalize(ctx.question);
	const options = ctx.options
		.map((option, index) => {
			if (typeof option === 'string') {
				return `${index}=${normalize(option)}`;
			}
			return `${normalize(option.label)}=${normalize(option.text)}`;
		})
		.join('|');
	return `${ctx.type || 'unknown'}::${question}::${options}`;
}
