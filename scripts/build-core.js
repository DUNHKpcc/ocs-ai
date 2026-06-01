// @ts-check

const { series } = require('gulp');
const del = require('del');
const util = require('util');
const { version } = require('../package.json');
const execOut = util.promisify(require('./utils').execOut);
const { createUserScript } = require('../packages/utils');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const distPath = process.env.BUILD_PATH || '../dist';
console.log('BUILD_PATH: ', distPath);
const distResolvedPath = path.resolve(__dirname, distPath);

function cleanOutput() {
	return del([distPath, '../lib'], { force: true });
}

async function buildPackages() {
	// @ts-ignore
	await execOut('tsc', { cwd: '../packages/core' });
	// @ts-ignore
	await execOut('vite build', { cwd: '../packages/core' });
	// @ts-ignore
	await execOut('tsc', { cwd: '../packages/scripts' });
	// @ts-ignore
	await execOut('vite build', { cwd: '../packages/scripts' });
}

async function createUserJs() {
	/** 模拟浏览器环境 */
	require('browser-env')();

	// @ts-ignore
	globalThis.unsafeWindow = {};

	/** @type {import('../packages/scripts/src/index')} */
	// @ts-ignore
	const ocs = require(path.join(distPath, 'index.js'));

	// 触发对 ocs 模块的引用，确保打包产物被正确加载
	void ocs.definedProjects;

	/** @return {import('../packages/utils').CreateOptions} */
	const createOptions = () => {
		return {
			parseRequire: true,
			parseResource: true,
			resourceBuilder: (key, value) => `const ${key} = \`${value}\`;`,
			metaDataFormatter: {
				header: '==UserScript==',
				footer: '==/UserScript==',
				prefix: '// ',
				symbol: '@',
				gap: '\t'.repeat(4)
			},
			metadata: {
				name: 'DPCC-OCS-AI',
				version: version,
				description: 'OCS AI answer assistant for arbitrary websites with manual region selection.',
				author: 'enncy',
				license: 'MIT',
				namespace: 'https://enncy.cn',
				homepage: 'https://docs.ocsjs.com',
				source: 'https://github.com/ocsjs/ocsjs',
				icon: 'https://cdn.ocsjs.com/logo.png',
				connect: ['*'],
				match: ['*://*/*'],
				grant: [
					'GM_info',
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
				],
				require: [path.join(__dirname, distPath, 'index.js')],
				resource: [`STYLE ${path.join(__dirname, '../packages/scripts/assets/css/style.css')}`],
				'run-at': 'document-start',
				antifeature: 'payment'
			},
			entry: path.join(__dirname, '../packages/scripts/entry.ai.js'),
			dist: path.join(distResolvedPath, 'ocs.ai.user.js')
		};
	};

	/** 导出样式文件 */
	fs.copyFileSync(
		path.join(__dirname, '../packages/scripts/assets/css/style.css'),
		path.join(distResolvedPath, 'style.css')
	);

	/** 创建 AI 答题助手脚本 */
	const aiOpts = createOptions();
	console.log('createUserScript: ', aiOpts.metadata.name, aiOpts.dist);
	await createUserScript(aiOpts);
}

exports.default = series(cleanOutput, buildPackages, createUserJs);
