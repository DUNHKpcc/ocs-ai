const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('browser-env')();
const OCS = require('../dist/index.js');

assert.strictEqual(typeof OCS.createQuestionFingerprint, 'function');
assert.strictEqual(typeof OCS.parseAiAnswerContent, 'function');
assert.strictEqual(typeof OCS.createAiSearchInformation, 'function');
assert.strictEqual(typeof OCS.recognizeAiQuestions, 'function');

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

const fencedJsonParsed = OCS.parseAiAnswerContent(
	[
		'```json',
		'{"answer":"B","answers":["B"],"explanation":"按定义，R1∘R2={(1,3),(2,2),(3,1)}，即选项 B。","confidence":0.98}',
		'```'
	].join('\n')
);
assert.deepStrictEqual(fencedJsonParsed.answers, ['B']);
assert.strictEqual(fencedJsonParsed.answer, 'B');
assert.strictEqual(fencedJsonParsed.explanation, '按定义，R1∘R2={(1,3),(2,2),(3,1)}，即选项 B。');
assert.strictEqual(fencedJsonParsed.confidence, 0.98);

const looseFencedJsonParsed = OCS.parseAiAnswerContent(
	[
		'```json',
		'{"answer":"B","answers":["B"],"explanation":"按定义，\\(R_1\\circ R_2\\)。\\n故选 B。","confidence":0.98}',
		'```'
	].join('\n')
);
assert.deepStrictEqual(looseFencedJsonParsed.answers, ['B']);
assert.strictEqual(looseFencedJsonParsed.answer, 'B');
assert.strictEqual(looseFencedJsonParsed.explanation, '按定义，\\(R_1\\circ R_2\\)。\n故选 B。');
assert.strictEqual(looseFencedJsonParsed.confidence, 0.98);

const fallback = OCS.parseAiAnswerContent('答案：A\n解析：选择第一项');
assert.deepStrictEqual(fallback.answers, ['A']);
assert.strictEqual(fallback.explanation, '选择第一项');

const batchAnswers = OCS.parseAiBatchAnswerContent(
	'```json\n{"items":[{"index":1,"question":"First question","answer":"A","answers":["A"],"explanation":"first"},{"index":2,"answers":["B","C"],"explanation":"second"}]}\n```'
);
assert.strictEqual(batchAnswers.length, 2);
assert.strictEqual(batchAnswers[0].question, 'First question');
assert.strictEqual(batchAnswers[0].answer, 'A');
assert.deepStrictEqual(batchAnswers[1].answers, ['B', 'C']);
assert.strictEqual(batchAnswers[1].answer, 'B#C');

const streamContent = OCS.parseOpenAIStreamContent(
	[
		'data: {"choices":[{"delta":{"content":"{\\"answer\\""}}]}',
		'data: {"choices":[{"delta":{"content":" : \\"B\\"}"}}]}',
		'data: [DONE]'
	].join('\n\n')
);
assert.strictEqual(streamContent, '{"answer" : "B"}');

assert.strictEqual(OCS.normalizeChatCompletionsURL('https://api.example.com/v1/responses'), 'https://api.example.com/v1/chat/completions');
assert.strictEqual(OCS.normalizeResponsesURL('https://api.example.com/v1/chat/completions'), 'https://api.example.com/v1/responses');
assert.strictEqual(
	OCS.parseResponsesStreamContent(
		[
			'data: {"type":"response.output_text.delta","delta":"{\\"answer\\""}',
			'data: {"type":"response.output_text.delta","delta":" : \\"B\\"}"}',
			'data: [DONE]'
		].join('\n\n')
	),
	'{"answer" : "B"}'
);

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

const mathStemRoot = document.createElement('section');
mathStemRoot.innerHTML = `
	<div class="question-meta">1. (单选题, 1分)</div>
	<div class="stem">设集合A={1，2，3，4}上的关系R1={(1,4),(2,3),(3,2)}，R2={(2,1),(3,2),(4,3)}，则R1∘R2=</div>
	<label><input type="radio" name="math-q" value="A {(2,4),(3,3),(4,2)}">A {(2,4),(3,3),(4,2)}</label>
	<label><input type="radio" name="math-q" value="B {(1,3),(2,2),(3,1)}">B {(1,3),(2,2),(3,1)}</label>
	<label><input type="radio" name="math-q" value="C {(1,1),(3,3),(4,2)}">C {(1,1),(3,3),(4,2)}</label>
	<label><input type="radio" name="math-q" value="D 以上均不正确">D 以上均不正确</label>
`;
const mathRecognized = OCS.recognizeAiQuestion(mathStemRoot);
assert.strictEqual(
	mathRecognized.question,
	'设集合A={1，2，3，4}上的关系R1={(1,4),(2,3),(3,2)}，R2={(2,1),(3,2),(4,3)}，则R1∘R2='
);

const chaoxingRoot = document.createElement('div');
chaoxingRoot.className = 'questionLi';
chaoxingRoot.innerHTML = `
	<h3>
		<span>1.</span>
		<span>(单选题, 1分)</span>
		设集合A={1，2，3，4}上的关系R1={(1,4),(2,3),(3,2)}，R2={(2,1),(3,2),(4,3)}，则R1∘R2=
	</h3>
	<div class="answerBg"><input type="radio" name="cx-q"><div class="answer_p">A {(2,4),(3,3),(4,2)}</div></div>
	<div class="answerBg"><input type="radio" name="cx-q"><div class="answer_p">B {(1,3),(2,2),(3,1)}</div></div>
	<div class="answerBg"><input type="radio" name="cx-q"><div class="answer_p">C {(1,1),(3,3),(4,2)}</div></div>
	<div class="answerBg"><input type="radio" name="cx-q"><div class="answer_p">D 以上均不正确</div></div>
`;
const chaoxingOptionArea = chaoxingRoot.querySelector('.answerBg');
const chaoxingRecognized = OCS.recognizeAiQuestion(chaoxingOptionArea);
assert.strictEqual(
	chaoxingRecognized.question,
	'设集合A={1，2，3，4}上的关系R1={(1,4),(2,3),(3,2)}，R2={(2,1),(3,2),(4,3)}，则R1∘R2='
);
assert.deepStrictEqual(
	chaoxingRecognized.options.map((option) => option.text),
	['A {(2,4),(3,3),(4,2)}', 'B {(1,3),(2,2),(3,1)}', 'C {(1,1),(3,3),(4,2)}', 'D 以上均不正确']
);

const chaoxingRoleRoot = document.createElement('div');
chaoxingRoleRoot.className = 'questionLi';
chaoxingRoleRoot.innerHTML = `
	<h3 class="mark_name colorDeep fontLabel workTextWrap">
		<span>8.</span>
		<span>(单选题, 1分)</span>
		设集合A={1，2，3，4}上的关系为：
		<img src="https://p.ananas.chaoxing.com/star3/origin/f19776b53e55f69500f9e032d064621f.png">
	</h3>
	<div class="stem_answer">
		<div class="clearfix answerBg workTextWrap" role="radio" aria-label="A 自反性 选择" qtype="0" onclick="addChoice(this)">
			<span class="num_option" data="A">A</span>
			<div class="answer_p"><p>自反性</p></div>
		</div>
		<div class="clearfix answerBg workTextWrap" role="radio" aria-label="B 自反性、对称性 选择" qtype="0" onclick="addChoice(this)">
			<span class="num_option" data="B">B</span>
			<div class="answer_p"><p>自反性、对称性</p></div>
		</div>
		<div class="clearfix answerBg workTextWrap" role="radio" aria-label="C 自反性、反对称性 选择" qtype="0" onclick="addChoice(this)">
			<span class="num_option" data="C">C</span>
			<div class="answer_p"><p>自反性、反对称性</p></div>
		</div>
		<div class="clearfix answerBg workTextWrap" role="radio" aria-label="D 自反性、反对称性、传递性 选择" qtype="0" onclick="addChoice(this)">
			<span class="num_option" data="D">D</span>
			<div class="answer_p"><p>自反性、反对称性、传递性</p></div>
		</div>
	</div>
`;
const chaoxingRoleRecognized = OCS.recognizeAiQuestion(chaoxingRoleRoot);
assert.strictEqual(chaoxingRoleRecognized.question, '设集合A={1，2，3，4}上的关系为：');
assert.deepStrictEqual(
	chaoxingRoleRecognized.options.map((option) => option.text),
	['自反性', '自反性、对称性', '自反性、反对称性', '自反性、反对称性、传递性']
);
assert.deepStrictEqual(chaoxingRoleRecognized.imageUrls, [
	'https://p.ananas.chaoxing.com/star3/origin/f19776b53e55f69500f9e032d064621f.png'
]);
assert.strictEqual(chaoxingRoleRecognized.fillTargets[0].element.getAttribute('role'), 'radio');

const judgmentRoot = document.createElement('section');
judgmentRoot.innerHTML = `
	<div class="question-meta">2.</div>
	<div class="question-type">判断题</div>
	<div class="stem">商业计划对于已有企业来说只是形式上的文件，没有实际作用。</div>
	<div role="radiogroup">
		<div role="radio">A. 正确</div>
		<div role="radio">B. 错误</div>
	</div>
`;
const judgmentRecognized = OCS.recognizeAiQuestion(judgmentRoot);
assert.strictEqual(judgmentRecognized.question, '商业计划对于已有企业来说只是形式上的文件，没有实际作用。');
assert.deepStrictEqual(
	judgmentRecognized.options.map((option) => option.text),
	['A. 正确', 'B. 错误']
);

const multiQuestionRoot = document.createElement('div');
multiQuestionRoot.innerHTML = `
	<section class="question-card">
		<h2>1 + 1 = ?</h2>
		<label><input type="radio" name="multi-q1">A. 1</label>
		<label><input type="radio" name="multi-q1">B. 2</label>
	</section>
	<section class="question-card">
		<h2>太阳从东方升起。</h2>
		<label><input type="radio" name="multi-q2">A. 正确</label>
		<label><input type="radio" name="multi-q2">B. 错误</label>
	</section>
`;
const multiRecognized = OCS.recognizeAiQuestions(multiQuestionRoot);
assert.strictEqual(multiRecognized.length, 2);
assert.deepStrictEqual(
	multiRecognized.map((item) => item.question),
	['1 + 1 = ?', '太阳从东方升起。']
);
assert.deepStrictEqual(
	multiRecognized.map((item) => item.options.map((option) => option.text)),
	[
		['A. 1', 'B. 2'],
		['A. 正确', 'B. 错误']
	]
);
const singleRecognizedFromMultiRoot = OCS.recognizeAiQuestion(multiQuestionRoot);
assert.strictEqual(singleRecognizedFromMultiRoot.question, '1 + 1 = ?');
assert.deepStrictEqual(
	singleRecognizedFromMultiRoot.options.map((option) => option.text),
	['A. 1', 'B. 2']
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

const responsesInput = OCS.createAiResponsesInput(visionMessages);
assert.strictEqual(responsesInput.length, 1);
assert.strictEqual(responsesInput[0].role, 'user');
assert.strictEqual(responsesInput[0].content[0].type, 'input_text');
assert.strictEqual(responsesInput[0].content[1].type, 'input_image');
assert.strictEqual(responsesInput[0].content[1].image_url, 'http://localhost/question.png');

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

const unlabeledChoiceRoot = document.createElement('section');
unlabeledChoiceRoot.innerHTML = `
	<div class="stem">在Spring MVC中，若要将控制器方法的返回值直接作为响应体返回给客户端（而非跳转视图），应使用哪个注解？</div>
	<div class="choice-list">
		<div class="choice-row"><input type="radio" name="spring-q" value="A"><span>A. @ResponseBody</span></div>
		<div class="choice-row"><input type="radio" name="spring-q" value="B"><span>B. @Responsebody</span></div>
		<div class="choice-row"><input type="radio" name="spring-q" value="C"><span>C. @RequestBody</span></div>
		<div class="choice-row"><input type="radio" name="spring-q" value="D"><span>D. @ModelAttribute</span></div>
	</div>
`;
document.body.append(unlabeledChoiceRoot);
const unlabeledChoiceRecognized = OCS.recognizeAiQuestion(unlabeledChoiceRoot.querySelector('.choice-list'));
assert.strictEqual(
	unlabeledChoiceRecognized.question,
	'在Spring MVC中，若要将控制器方法的返回值直接作为响应体返回给客户端（而非跳转视图），应使用哪个注解？'
);
assert.deepStrictEqual(
	unlabeledChoiceRecognized.options.map((option) => option.text),
	['A. @ResponseBody', 'B. @Responsebody', 'C. @RequestBody', 'D. @ModelAttribute']
);

assert.strictEqual(typeof OCS.createElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementFromClientRect, 'function');
assert.strictEqual(typeof OCS.startRectRegionPicker, 'function');
assert.strictEqual(typeof OCS.startLongScreenshotPicker, 'function');
const scrollNearBottom = OCS.calculateEdgeAutoScrollDelta(770, 900);
const scrollCloserToBottom = OCS.calculateEdgeAutoScrollDelta(835, 900);
const scrollAtBottom = OCS.calculateEdgeAutoScrollDelta(900, 900);
assert.ok(scrollNearBottom > 0);
assert.ok(scrollNearBottom < scrollCloserToBottom);
assert.ok(scrollCloserToBottom < scrollAtBottom);
assert.strictEqual(scrollNearBottom, 11);
assert.strictEqual(scrollCloserToBottom, 38);
assert.strictEqual(scrollAtBottom, 64);
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
assert.match(aiUserScript, /@name\s+DPCC-OCS-AI/);
assert.match(aiUserScript, /@match\s+\*:\/\/\*\/\*/);
assert.match(aiUserScript, /@connect\s+\*/);
assert.match(aiUserScript, /DPCC-OCS-AI/);
assert.match(aiUserScript, /清空所选区域/);
assert.match(aiUserScript, /识别模式/);
assert.match(aiUserScript, /多题识别/);
assert.match(aiUserScript, /overflowWrap/);
assert.match(aiUserScript, /CommonProject\.scripts\.aiAnswerAssistant\.namespace/);

console.log('AI assistant parser/fingerprint tests passed');
