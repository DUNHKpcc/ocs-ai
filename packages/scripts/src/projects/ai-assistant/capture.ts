export interface ViewportRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

let sharedStream: MediaStream | undefined;
let pendingStream: Promise<MediaStream> | undefined;

function stopSharedStream() {
	if (sharedStream) {
		for (const track of sharedStream.getTracks()) {
			track.stop();
		}
		sharedStream = undefined;
	}
}

function isStreamActive(stream: MediaStream | undefined): stream is MediaStream {
	return !!stream && stream.getVideoTracks().some((track) => track.readyState === 'live');
}

/**
 * 获取（或复用）屏幕共享流。优先共享当前标签页，避免每次截图都重新弹授权。
 * 用户停止共享后流失效，下次会重新申请（需在用户手势中调用）。
 */
async function getDisplayStream(): Promise<MediaStream> {
	if (isStreamActive(sharedStream)) {
		return sharedStream;
	}
	// 复用进行中的授权请求，避免快速连点/按住快捷键导致多次弹授权
	if (pendingStream) {
		return pendingStream;
	}
	stopSharedStream();
	const mediaDevices = navigator.mediaDevices as any;
	if (!mediaDevices?.getDisplayMedia) {
		throw new Error('当前浏览器不支持屏幕截图（getDisplayMedia）。');
	}
	pendingStream = (async () => {
		const stream: MediaStream = await mediaDevices.getDisplayMedia({
			// preferCurrentTab 为非标准选项，用于直接共享当前标签页（Chrome 支持）
			preferCurrentTab: true,
			video: {
				displaySurface: 'browser'
			},
			audio: false
		});
		const [track] = stream.getVideoTracks();
		if (track) {
			track.addEventListener('ended', stopSharedStream);
		}
		sharedStream = stream;
		return stream;
	})();
	try {
		return await pendingStream;
	} finally {
		pendingStream = undefined;
	}
}

/** 给 promise 加超时，避免帧迟迟不来时永久卡住（UI 一直“请求中...”） */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(message)), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

async function grabFrame(stream: MediaStream): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.muted = true;
	video.playsInline = true;
	video.srcObject = stream;
	await withTimeout(
		new Promise<void>((resolve, reject) => {
			video.addEventListener('loadedmetadata', () => resolve(), { once: true });
			video.addEventListener('error', () => reject(new Error('截图视频帧加载失败。')), { once: true });
		}),
		5000,
		'截图加载超时，请重试。'
	);
	let played = true;
	try {
		await video.play();
	} catch (error) {
		// 自动播放可能被拦截；此时 requestVideoFrameCallback 不会触发，改用定时兜底
		played = false;
	}
	// 等待至少一帧可用（带超时；play 失败时不依赖 rVFC）
	await withTimeout(
		new Promise<void>((resolve) => {
			const anyVideo = video as any;
			if (played && typeof anyVideo.requestVideoFrameCallback === 'function') {
				anyVideo.requestVideoFrameCallback(() => resolve());
			} else {
				requestAnimationFrame(() => resolve());
			}
		}),
		5000,
		'截图取帧超时，请重试。'
	);
	return video;
}

/**
 * 对视口中的指定矩形区域做真实截图，返回 JPEG dataURL。
 * 通过 getDisplayMedia 抓当前标签页帧，再按帧像素与视口 CSS 尺寸的比例裁剪。
 */
export async function captureViewportRect(rect: ViewportRect): Promise<string> {
	if (rect.width < 1 || rect.height < 1) {
		throw new Error('框选区域太小，无法截图。');
	}
	const stream = await getDisplayStream();
	const video = await grabFrame(stream);
	try {
		const frameW = video.videoWidth;
		const frameH = video.videoHeight;
		if (!frameW || !frameH) {
			throw new Error('未能获取截图画面。');
		}
		// 校验是否共享的是“当前标签页”；若是整个屏幕/窗口，帧与视口比例不一致会导致裁剪错位
		const frameRatio = frameW / frameH;
		const viewRatio = window.innerWidth / window.innerHeight;
		if (Math.abs(frameRatio - viewRatio) > 0.1) {
			throw new Error('截图区域与页面不匹配，请在共享弹窗中选择“此标签页”后重试。');
		}
		// 帧像素 vs 视口 CSS 像素的缩放（包含 devicePixelRatio）
		const scaleX = frameW / window.innerWidth;
		const scaleY = frameH / window.innerHeight;
		const sx = Math.max(0, Math.round(rect.left * scaleX));
		const sy = Math.max(0, Math.round(rect.top * scaleY));
		const sw = Math.min(frameW - sx, Math.round(rect.width * scaleX));
		const sh = Math.min(frameH - sy, Math.round(rect.height * scaleY));
		if (sw < 1 || sh < 1) {
			throw new Error('框选区域超出可视范围，无法截图。');
		}
		const canvas = document.createElement('canvas');
		canvas.width = sw;
		canvas.height = sh;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('无法创建截图画布。');
		}
		context.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
		return canvas.toDataURL('image/jpeg', 0.92);
	} finally {
		// 无论成功失败都释放 video，避免泄漏并保持 sharedStream 干净
		video.pause();
		video.srcObject = null;
	}
}

export function releaseCaptureStream() {
	stopSharedStream();
}
