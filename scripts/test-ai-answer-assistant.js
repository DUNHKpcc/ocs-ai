const assert = require('assert');
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

console.log('AI assistant parser/fingerprint tests passed');
