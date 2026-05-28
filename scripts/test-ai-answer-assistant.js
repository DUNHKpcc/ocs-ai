const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('browser-env')();
const OCS = require('../dist/index.js');

assert.strictEqual(typeof OCS.createQuestionFingerprint, 'function');
assert.strictEqual(typeof OCS.parseAiAnswerContent, 'function');
assert.strictEqual(typeof OCS.createAiSearchInformation, 'function');

const fingerprintA = OCS.createQuestionFingerprint({
	question: ' 1 + 1 = ? ',
	options: ['A. 1', 'B. 2'],
	type: 'single'
});
const fingerprintB = OCS.createQuestionFingerprint({
	question: '1+1=?',
	options: ['A. 1', 'B. 2'],
	type: 'single'
});
assert.strictEqual(fingerprintA, fingerprintB);

const parsed = OCS.parseAiAnswerContent(
	'{"answer":"B","answers":["B"],"explanation":"Because 1 + 1 = 2.","confidence":0.9}'
);
assert.deepStrictEqual(parsed.answers, ['B']);
assert.strictEqual(parsed.answer, 'B');
assert.strictEqual(parsed.explanation, 'Because 1 + 1 = 2.');
assert.strictEqual(parsed.confidence, 0.9);

const fallback = OCS.parseAiAnswerContent('答案：A\n解析：选择第一项');
assert.deepStrictEqual(fallback.answers, ['A']);
assert.strictEqual(fallback.explanation, '选择第一项');

const streamContent = OCS.parseOpenAIStreamContent(
	[
		'data: {"choices":[{"delta":{"content":"{\\"answer\\""}}]}',
		'data: {"choices":[{"delta":{"content":" : \\"B\\"}"}}]}',
		'data: [DONE]'
	].join('\n\n')
);
assert.strictEqual(streamContent, '{"answer" : "B"}');

const info = OCS.createAiSearchInformation(
	{
		question: '1+1=?',
		options: [
			{ label: 'A', text: '1' },
			{ label: 'B', text: '2' }
		],
		type: 'single',
		fillTargets: []
	},
	parsed
);
assert.strictEqual(info.name, 'AI');
assert.strictEqual(info.results[0].question, '1+1=?');
assert.strictEqual(info.results[0].answer, 'B');
assert.strictEqual(info.results[0].extra_data.ai, true);

const root = document.createElement('div');
root.innerHTML = `
	<div class="question">1 + 1 = ?</div>
	<label><input type="radio" name="q1">1</label>
	<label><input type="radio" name="q1">2</label>
`;
const recognized = OCS.recognizeAiQuestion(root);
assert.strictEqual(recognized.question, '1 + 1 = ?');
assert.strictEqual(recognized.type, 'single');
assert.deepStrictEqual(
	recognized.options.map((option) => option.label),
	['A', 'B']
);

const customChoiceRoot = document.createElement('div');
customChoiceRoot.innerHTML = `
	<h2>企业应该如何降低政策风险？</h2>
	<div role="radiogroup">
		<div role="radio" aria-checked="false">A. 忽视政策变化</div>
		<div role="radio" aria-checked="false">B. 及时调整经营战略</div>
		<div role="radio" aria-checked="false">C. 减少研发投入</div>
		<div role="radio" aria-checked="false">D. 增加营销投入</div>
	</div>
`;
const customRecognized = OCS.recognizeAiQuestion(customChoiceRoot);
assert.strictEqual(customRecognized.type, 'single');
assert.deepStrictEqual(
	customRecognized.options.map((option) => option.text),
	['A. 忽视政策变化', 'B. 及时调整经营战略', 'C. 减少研发投入', 'D. 增加营销投入']
);

const switchingRoot = document.createElement('div');
switchingRoot.innerHTML = `
	<section class="question-card previous" style="display: none;">
		<h2>第一题旧题？</h2>
		<label><input type="radio" name="switch-q">A. 旧选项</label>
		<label><input type="radio" name="switch-q">B. 旧答案</label>
	</section>
	<section class="question-card current">
		<h2>第二题新题？</h2>
		<label><input type="radio" name="switch-q2">A. 新选项</label>
		<label><input type="radio" name="switch-q2">B. 新答案</label>
	</section>
`;
document.body.append(switchingRoot);
const oldQuestionCard = switchingRoot.querySelector('.previous');
const currentQuestionCard = switchingRoot.querySelector('.current');
switchingRoot.getBoundingClientRect = () => ({
	left: 0,
	top: 0,
	right: 400,
	bottom: 300,
	width: 400,
	height: 300
});
currentQuestionCard.getBoundingClientRect = () => ({
	left: 20,
	top: 20,
	right: 320,
	bottom: 180,
	width: 300,
	height: 160
});
const activeQuestionCard = OCS.resolveActiveQuestionElement(oldQuestionCard);
assert.strictEqual(activeQuestionCard, currentQuestionCard);
const activeRecognized = OCS.recognizeAiQuestion(oldQuestionCard);
assert.strictEqual(activeRecognized.question, '第二题新题？');
assert.deepStrictEqual(
	activeRecognized.options.map((option) => option.text),
	['A. 新选项', 'B. 新答案']
);

const siblingStemRoot = document.createElement('section');
siblingStemRoot.innerHTML = `
	<div class="question-meta">1. 单选题（8分）</div>
	<div class="stem">商业计划通常不包括以下哪个内容？</div>
	<div role="radiogroup" class="choice-group">
		<div role="radio">A. 市场分析</div>
		<div role="radio">B. 财务预测</div>
		<div role="radio">C. 个人日记</div>
		<div role="radio">D. 运营计划</div>
	</div>
`;
document.body.append(siblingStemRoot);
const siblingChoiceGroup = siblingStemRoot.querySelector('.choice-group');
const siblingRecognized = OCS.recognizeAiQuestion(siblingChoiceGroup);
assert.strictEqual(siblingRecognized.question, '商业计划通常不包括以下哪个内容？');
assert.deepStrictEqual(
	siblingRecognized.options.map((option) => option.text),
	['A. 市场分析', 'B. 财务预测', 'C. 个人日记', 'D. 运营计划']
);

const imageRoot = document.createElement('div');
imageRoot.innerHTML = `
	<div class="question">
		看图选择正确答案
		<img src="/question.png">
		<img data-src="https://cdn.example.com/lazy.webp">
		<img srcset="/small.jpg 1x, /large.jpg 2x">
		<span style="background-image: url('/bg.png')"></span>
		<a href="https://cdn.example.com/ref.jpeg">参考图</a>
	</div>
	<label><input type="radio" name="img-q">A</label>
`;
const recognizedWithImages = OCS.recognizeAiQuestion(imageRoot);
assert.deepStrictEqual(recognizedWithImages.imageUrls, [
	'http://localhost/question.png',
	'https://cdn.example.com/lazy.webp',
	'http://localhost/small.jpg',
	'http://localhost/large.jpg',
	'http://localhost/bg.png',
	'https://cdn.example.com/ref.jpeg'
]);

const imageFingerprintA = OCS.createQuestionFingerprint({
	question: '看图选择正确答案',
	options: [],
	type: 'single',
	imageUrls: ['https://cdn.example.com/a.png']
});
const imageFingerprintB = OCS.createQuestionFingerprint({
	question: '看图选择正确答案',
	options: [],
	type: 'single',
	imageUrls: ['https://cdn.example.com/b.png']
});
assert.notStrictEqual(imageFingerprintA, imageFingerprintB);

const visionMessages = OCS.createAiChatMessages(
	{
		systemPrompt: 'answer',
		imageMode: 'vision'
	},
	recognizedWithImages
);
assert.deepStrictEqual(visionMessages[0], { role: 'system', content: 'answer' });
assert.strictEqual(Array.isArray(visionMessages[1].content), true);
assert.strictEqual(visionMessages[1].content[0].type, 'text');
assert.strictEqual(visionMessages[1].content[1].type, 'image_url');
assert.strictEqual(visionMessages[1].content[1].image_url.url, 'http://localhost/question.png');

const fillResult = OCS.fillAiAnswer(recognized, { answer: 'B', answers: ['B'], explanation: '' });
assert.strictEqual(fillResult.ok, true);
assert.strictEqual(root.querySelectorAll('input')[1].checked, true);

let clickedRoleOption = false;
customRecognized.fillTargets[1].element.onclick = () => {
	clickedRoleOption = true;
};
const customFillResult = OCS.fillAiAnswer(customRecognized, { answer: 'B', answers: ['B'], explanation: '' });
assert.strictEqual(customFillResult.ok, true);
assert.strictEqual(clickedRoleOption, true);

assert.strictEqual(typeof OCS.createElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementFromClientRect, 'function');
assert.strictEqual(typeof OCS.startRectRegionPicker, 'function');
assert.strictEqual(typeof OCS.createRegionQuestionObserver, 'function');
assert.strictEqual(!!OCS.CommonProject.scripts.aiAnswerAssistant, true);

const dynamicRoot = document.createElement('div');
dynamicRoot.innerHTML = '<section class="dynamic-card">第一题？</section>';
document.body.append(dynamicRoot);
const observedQuestions = [];
const dynamicObserver = OCS.createRegionQuestionObserver(
	() => dynamicRoot.querySelector('.dynamic-card'),
	(element) => observedQuestions.push(element.textContent),
	10,
	{ observeRoot: dynamicRoot, intervalMs: 20 }
);
setTimeout(() => {
	dynamicRoot.innerHTML = '<section class="dynamic-card">第二题？</section>';
}, 20);
setTimeout(() => {
	dynamicObserver.disconnect();
	assert.ok(observedQuestions.includes('第一题？'));
	assert.ok(observedQuestions.includes('第二题？'));
}, 80);

const card = document.createElement('section');
const title = document.createElement('h2');
const option = document.createElement('label');
title.textContent = '这是一道测试题？';
option.innerHTML = '<input type="radio">A. 选项';
card.append(title, option);
document.body.append(card);
card.getBoundingClientRect = () => ({
	left: 10,
	top: 10,
	right: 210,
	bottom: 150,
	width: 200,
	height: 140
});
title.getBoundingClientRect = () => ({
	left: 20,
	top: 20,
	right: 190,
	bottom: 60,
	width: 170,
	height: 40
});
option.getBoundingClientRect = () => ({
	left: 20,
	top: 70,
	right: 190,
	bottom: 120,
	width: 170,
	height: 50
});
const rectSelected = OCS.resolveElementFromClientRect(
	{
		left: 5,
		top: 5,
		right: 220,
		bottom: 155,
		width: 215,
		height: 150
	},
	document
);
assert.strictEqual(rectSelected, card);
assert.strictEqual(OCS.resolveQuestionContainer(option), card);

const aiUserScript = fs.readFileSync(path.join(__dirname, '../dist/ocs.ai.user.js'), 'utf8');
assert.match(aiUserScript, /@name\s+OCS AI答题助手/);
assert.match(aiUserScript, /@match\s+\*:\/\/\*\/\*/);
assert.match(aiUserScript, /@connect\s+\*/);
assert.match(aiUserScript, /OCS-AI答题助手/);
assert.match(aiUserScript, /CommonProject\.scripts\.aiAnswerAssistant\.namespace/);

console.log('AI assistant parser/fingerprint tests passed');
