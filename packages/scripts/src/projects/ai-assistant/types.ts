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

export interface AiProviderConfig {
	baseURL: string;
	apiKey: string;
	model: string;
	temperature: number;
	timeout: number;
	systemPrompt: string;
	imageMode: 'links' | 'vision' | 'both';
}

export type AiSearchInformation = SearchInformation;
