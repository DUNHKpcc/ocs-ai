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

const { start, $elements, CommonProject, BackgroundProject, RenderScript } = OCS;

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

	const waitForHeader = setInterval(() => {
		if (!$elements.root) return;
		const profile = $elements.root.querySelector('.profile');
		if (profile) {
			clearInterval(waitForHeader);
			const logo = document.createElement('img');
			logo.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAFqUlEQVR42s1YzYsTWRD/ve5OD05ncpgBw7YKAwOBhcjKhMUPZtm9GBXCDuvRkyePMkcPngSRmX9iRo+KLLMOfgQEmSy57E7IniKOHhTNzsGDJt3N9OdvD3b3dicdTVzZ3YJHv+73uqpeVb36EgiBpCyE8MP5jwB+AvANgK8AzACYAiCFYxIIAPgAHAB9AH8C+APAz0KIXwZpx8yEz6MkH3MCCIIgNSaExySPJnlIMnOaZD/c6JP0wmcwyIDneXRddyQV13XpeV4Wg8EAboY0T8eSCidfA/gdwDQAD4AyKHeSCIIAsiynvvf7fRiGAQDI5/OYmZlJrfu+D0mSIITIUmdEywTwrRCiI0hKAJ4A+G4UM0EQQJI+mI5hGKjX63jw4AFarRbevHmTYujQoUNYXFzEuXPnUK1Wkc/nh3CMYKoB4AeQrCXUNASe55EkTdPk6uoq5+fnCWCsMT8/z9XVVZqmmcKVARHtGkjeDHXrZdkCSTYaDZbL5ZiQLMtUFIWSJFEIkRqSJFFRFMqyHO8vl8tsNBopnIPnDnm4CZLtLAlFP66vr1NRFAKImRhXQhFz0b/r6+ujmIpot0FyL3EDUqLd2NggAAoh4hMPSmSQiazvsizH3zY2NrLUF9HeA0kjy2aazSZlWaYsy7FURjGQJJyUTnJNkqQYX7PZHGVTBkg6SR/j+z4ty2KpVBoiAoCqqrJYLLJYLHJ6enqIMUVRODc3l6nCCFepVKJlWfR9f9BXOUjaTqTbtbW1GHnytAsLC+x0Onz//j3fvXvHly9f8vjx4zHB5eVldjodvn37lpubmywWi0MqjHCtra1l2ZOPwRBgGAZ1XY9vTBLJxYsXU3tJ8tq1awTAhYUF2radkv+dO3dGqlLXdRqGMRRypKRHFUKgXq+j2+1CkiQEQZD2YJ6HIAjgeV489/0PMfHEiRNQVRWO48D3fbiui6WlJaiqGuNOOshut4t6vQ4hRIwDWZF7a2sLQohMVy+EiMNANI+g0+kAAFRVRRAEyOVyeP78OVzXhSRJIJnCI4TA1tbWEI0YYxSjdnZ24rg1Vm4R7mu1Wrh69Sps20Yul8OLFy9w+fLlkf+QxM7OToo2orhFEkII9Ho9dLvdOJhOAqqq4vr167h9+zYOHjyIdrsN0zQhhBg6XIS72+2i1+uhUCjEPKQCqWEYME0TnwOO4wAAdnd3sbu7+0H8GXaYBNM0YRgGCoXCaBuaFCI7qlQquHLlCk6ePDkkiYnwJV/y+Tw0TZsIQWT85XIZN27cQLPZxN27dzE7OxurYRRoommanJymGhBAgiUKhAF3XU4TGBdu24XkeHMfB+fPnce/ePUxNTWXe2Ohd1/WU/aQkFPmCSqUydKXHlZSiKJBlGY7j4NSpU7h06VJmlhm5jkqlkqKdaUO1Wg0kM/UfuYNoPZon10lCkiT4vo8LFy6kXMPgvlqt9nE/RBLVahW6rmemnIqiQJIkKIoSz3O5XMrZybIcS+rIkSOYmppCEAR/qyS8ebquo1qtgmRKglJYN8UuXNM0rKysxCeNTiiEQKPRwNOnT9Hv99Hr9fDq1Svcv38fAOC6Lvb392FZFizLwv7+PmzbHjpU5LVXVlagaVoqrAAIBEkHQC4pStu2cezYMTx79gyyLKd0nMvlMDs7G1cclmUBAA4cOIC5ubmhimNvby9Wa4SrVCqh3W5nGb37RRO0T6Wz4yZoXySFjdKV5IjWJ01h/3dJ/q1PlUHb29v/uAza3t4epwy6NXahaFnWZxeKlmWNXSiKsNnwBMDSuKX0o0eP8PDhQ7RaLbx+/TrOEDRNw+HDh7G4uIizZ8/izJkzk5TSvwL4Ptls+A2ANmmzodfrpRhKphKf02xItmOqCRfwb7ZjDJLVUT2i/7xhJT7S0lsOW3p6oqUnh/+Mm5tEBu4DsMOWXjds6W1mtfT+AiCaeJp0rwOLAAAAAElFTkSuQmCC';
			logo.className = 'logo';
			logo.style.verticalAlign = 'middle';
			logo.style.marginRight = '4px';
			profile.parentElement.insertBefore(logo, profile);
		}
	}, 200);
})();
