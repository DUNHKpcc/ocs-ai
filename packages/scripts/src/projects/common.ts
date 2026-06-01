import { Project } from 'easy-us';
import { RenderScript } from '../render';
import { createAiAnswerAssistantScript } from './ai-assistant/script';

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		/** 渲染脚本，窗口渲染主要脚本 */
		render: RenderScript,
		/** AI 答题助手 */
		aiAnswerAssistant: createAiAnswerAssistantScript()
	}
});
