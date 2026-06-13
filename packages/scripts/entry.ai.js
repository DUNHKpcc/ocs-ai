/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

// 环境检测
if (
	[
		'GM_getTab',
		'GM_saveTab',
		'GM_setValue',
		'GM_getValue',
		'unsafeWindow',
		'GM_listValues',
		'GM_deleteValue',
		'GM_notification',
		'GM_xmlhttpRequest',
		'GM_getResourceText',
		'GM_addValueChangeListener',
		'GM_removeValueChangeListener'
	].some((api) => typeof Reflect.get(globalThis, api) === 'undefined')
) {
	const open = confirm(
		`DPCC-OCS-AI 不支持当前的脚本管理器（${GM_info.scriptHandler}）。` +
			'请使用支持 GM_xmlhttpRequest 的脚本管理器，例如 “Scriptcat 脚本猫” 或者 “Tampermonkey 油猴”'
	);

	if (open) {
		window.location.href = 'https://docs.ocsjs.com/docs/script';
	}
	return;
}

const { start, CommonProject, BackgroundProject, RenderScript } = OCS;

const infos = GM_info;

(function () {
	'use strict';

	start({
		projects: [CommonProject, BackgroundProject],
		renderConfig: {
			renderScript: RenderScript,
			styles: [STYLE],
			defaultPanelName: CommonProject.scripts.aiAnswerAssistant.namespace,
			title: `DPCC-OCS-AI-${infos.script.version}`
		},
		updatePage: 'https://github.com/DUNHKpcc/ocs-ai-'
	});

})();
