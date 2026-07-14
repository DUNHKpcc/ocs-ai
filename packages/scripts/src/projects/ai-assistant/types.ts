import type { QuestionTypes, SearchInformation } from '@ocsjs/core';

export type AiFillTargetType = 'radio' | 'checkbox' | 'text' | 'textarea' | 'contenteditable' | 'clickable';

export interface AiOption {
	label: string;
	text: string;
	element?: HTMLElement;
}

export interface AiFillTarget {
	type: AiFillTargetType;
	element?: HTMLElement;
	label?: string;
	text?: string;
}

export interface AiQuestionContext {
	question: string;
	options: AiOption[];
	imageUrls: string[];
	type: QuestionTypes | 'unknown';
	fillTargets: AiFillTarget[];
}

export interface ParsedAiAnswer {
	answer: string;
	answers: string[];
	explanation: string;
	confidence?: number;
}

export interface ParsedAiBatchAnswerItem extends ParsedAiAnswer {
	index: number;
	question?: string;
}

export interface AiProviderConfig {
	baseURL: string;
	apiKey: string;
	model: string;
	/** Defaults to Chat Completions for existing callers and saved settings. */
	apiMode?: 'chat_completions' | 'responses';
	temperature: number;
	timeout: number;
	systemPrompt: string;
	imageMode: 'links' | 'vision' | 'both';
	streamResponse: boolean;
}

export type AiSearchInformation = SearchInformation;
