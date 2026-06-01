import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import { author, description, homepage, license, name } from '../../package.json';
import dotenv from 'dotenv';
import path from 'path';

const bannerContent = `
/*!
 * ${name} ( ${homepage} )
 * ${description}
 * copyright ${author}
 * license ${license}
 */
`;

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@ocsjs/core': '../core/src/index.ts',
			// 强制 easy-us 只打包一份，避免 core(0.0.60) 与 scripts(0.0.64) 两个版本同时被打入，
			// 否则自定义元素（container-element 等）会被重复注册，导致窗口 header 为 undefined 无法渲染。
			'easy-us': path.resolve(__dirname, 'node_modules/easy-us')
		},
		dedupe: ['easy-us']
	},
	esbuild: {
		charset: 'utf8'
	},
	build: {
		/** 取消css代码分离 */
		cssCodeSplit: false,
		/** @ts-ignore 输出路径 */
		outDir: process.env.VITE_BUILD_PATH,
		/** 清空输出路径 */
		emptyOutDir: false,
		/** 是否压缩代码 */
		minify: false,

		/** 打包库， 全局名字为 OCS */
		lib: {
			entry: './src/index.ts',
			name: 'OCS',
			fileName: () => 'index.js',
			formats: ['umd']
		}
	},

	plugins: [
		// commonjs(),
		visualizer(),
		banner(bannerContent)
	]
});
