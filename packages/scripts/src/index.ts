import { Project } from 'easy-us';
import { CommonProject } from './projects/common';
import { BackgroundProject } from './projects/background';

/** 导出所有的 OCS 核心模块 */
export * from '@ocsjs/core';
/** 导出启动函数，以及全局对象 */
export { start, $elements, $store } from 'easy-us';
/** 导出本包的核心脚本工程 */
export { BackgroundProject } from './projects/background';
export { CommonProject } from './projects/common';
export { RenderScript } from './render';
export * from './projects/ai-assistant/fingerprint';
export * from './projects/ai-assistant/ai-answerer';
export * from './projects/ai-assistant/recognizer';
export * from './projects/ai-assistant/fill';
export * from './projects/ai-assistant/selector';
export * from './projects/ai-assistant/observer';
export * from './projects/ai-assistant/capture';
export * from './projects/ai-assistant/script';
export type {
	AiFillTarget,
	AiFillTargetType,
	AiOption,
	AiProviderConfig,
	AiQuestionContext,
	AiSearchInformation,
	ParsedAiAnswer
} from './projects/ai-assistant/types';

export function definedProjects(): Project[] {
	return [CommonProject, BackgroundProject];
}
