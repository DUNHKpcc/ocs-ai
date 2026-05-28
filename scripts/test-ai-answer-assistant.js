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

const fillResult = OCS.fillAiAnswer(recognized, { answer: 'B', answers: ['B'], explanation: '' });
assert.strictEqual(fillResult.ok, true);
assert.strictEqual(root.querySelectorAll('input')[1].checked, true);

assert.strictEqual(typeof OCS.createElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.resolveElementSelectorPath, 'function');
assert.strictEqual(typeof OCS.createRegionQuestionObserver, 'function');
assert.strictEqual(!!OCS.CommonProject.scripts.aiAnswerAssistant, true);

const aiUserScript = fs.readFileSync(path.join(__dirname, '../dist/ocs.ai.user.js'), 'utf8');
assert.match(aiUserScript, /@name\s+OCS AI答题助手/);
assert.match(aiUserScript, /@match\s+\*:\/\/\*\/\*/);
assert.match(aiUserScript, /@connect\s+\*/);

console.log('AI assistant parser/fingerprint tests passed');
