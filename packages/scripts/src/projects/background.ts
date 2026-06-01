import { Project, Script, StoreListenerType, h } from 'easy-us';
import { definedProjects } from '..';

const state = {
	console: {
		listenerIds: {
			logs: 0 as StoreListenerType
		}
	}
};

export type LogType = 'log' | 'info' | 'debug' | 'warn' | 'error';

/** 后台进程，处理日志输出与全局错误捕获等基础操作 */
export const BackgroundProject = Project.create({
	name: '后台',
	domains: [],
	scripts: {
		console: new Script({
			name: '📄 日志输出',
			matches: [['所有', /.*/]],
			namespace: 'render.console',
			configs: {
				logs: {
					defaultValue: [] as { type: LogType; content: string; time: number; stack: string }[]
				}
			},
			onrender({ panel }) {
				const getTypeDesc = (type: LogType) =>
					type === 'info'
						? '信息'
						: type === 'error'
						? '错误'
						: type === 'warn'
						? '警告'
						: type === 'debug'
						? '调试'
						: '日志';

				const createLog = (log: { type: LogType; content: string; time: number; stack: string }) => {
					const date = new Date(log.time);
					const item = h(
						'div',
						{
							title: '双击复制日志信息',
							className: 'item'
						},
						[
							h(
								'span',
								{ className: 'time' },
								`${date.getHours().toFixed(0).padStart(2, '0')}:${date.getMinutes().toFixed(0).padStart(2, '0')} `
							),
							h('span', { className: log.type }, `[${getTypeDesc(log.type)}]`),
							h('span', ':' + log.content)
						]
					);

					item.addEventListener('dblclick', () => {
						navigator.clipboard.writeText(
							Object.keys(log)
								.map((k) => `${k}: ${(log as any)[k]}`)
								.join('\n')
						);
					});

					return item;
				};

				const showLogs = () => {
					const div = h('div', { className: 'card console' });

					const logs = this.cfg.logs.map((log) => createLog(log));
					if (logs.length) {
						div.replaceChildren(...logs);
					} else {
						div.replaceChildren(
							h('div', '暂无任何日志', (div) => {
								div.style.textAlign = 'center';
							})
						);
					}

					return { div, logs };
				};

				/**
				 * 判断滚动条是否滚到底部
				 */
				const isScrollBottom = (div: HTMLElement) => {
					const { scrollHeight, scrollTop, clientHeight } = div;
					return scrollTop + clientHeight + 50 > scrollHeight;
				};

				const { div, logs } = showLogs();

				this.offConfigChange(state.console.listenerIds.logs);
				state.console.listenerIds.logs = this.onConfigChange('logs', (logs) => {
					const log = createLog(logs[logs.length - 1]);
					div.append(log);
					setTimeout(() => {
						if (isScrollBottom(div)) {
							log.scrollIntoView();
						}
					}, 10);
				});

				const show = () => {
					panel.body.replaceChildren(div);
					setTimeout(() => {
						logs[logs.length - 1]?.scrollIntoView();
					}, 10);
				};

				show();
			}
		}),
		errorHandle: new Script({
			name: '全局错误捕获',
			matches: [['', /.*/]],
			hideInPanel: true,
			onstart() {
				const projects = definedProjects();
				for (const project of projects) {
					for (const key in project.scripts) {
						if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
							const script = project.scripts[key];
							script.on('scripterror', (err) => {
								const msg = `[${project.name} - ${script.name}] : ${err}`;
								console.error(msg);
								$console.error(msg);
							});
						}
					}
				}
			}
		})
	}
});

type Console = Record<LogType, (...msg: any[]) => void>;

/** 日志对象，存储日志并显示在日志面板 */
export const $console: Console = new Proxy({} as Console, {
	get(target, key) {
		return (...msg: any[]) => {
			let logs = BackgroundProject.scripts.console.cfg.logs;
			if (logs.length > 50) {
				logs = logs.slice(-50);
			}

			const stack_str = Error().stack || '';

			// 简化堆栈信息
			const stacks = stack_str
				.replace('Error', '')
				.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/g)
				?.map((s) => {
					const match = s.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/) || [];
					return [match[1], match[2], match[3]];
				});

			logs = logs.concat({
				type: key.toString() as LogType,
				content: msg.join(' '),
				time: Date.now(),
				stack: JSON.stringify([stack_str.split('\n')[0], ...(stacks || [])])
			});

			BackgroundProject.scripts.console.cfg.logs = logs;
		};
	}
});
