export interface ViewportRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

let sharedStream: MediaStream | undefined;

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
	stopSharedStream();
	const mediaDevices = navigator.mediaDevices as any;
	if (!mediaDevices?.getDisplayMedia) {
		throw new Error('当前浏览器不支持屏幕截图（getDisplayMedia）。');
	}
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
}

async function grabFrame(stream: MediaStream): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.muted = true;
	video.playsInline = true;
	video.srcObject = stream;
	await new Promise<void>((resolve, reject) => {
		const onLoaded = () => resolve();
		video.addEventListener('loadedmetadata', onLoaded, { once: true });
		video.addEventListener('error', () => reject(new Error('截图视频帧加载失败。')), { once: true });
	});
	try {
		await video.play();
	} catch (error) {
		/* 自动播放可能被拦截，srcObject 仍可绘制，忽略 */
	}
	// 等待至少一帧可用
	await new Promise<void>((resolve) => {
		const anyVideo = video as any;
		if (typeof anyVideo.requestVideoFrameCallback === 'function') {
			anyVideo.requestVideoFrameCallback(() => resolve());
		} else {
			requestAnimationFrame(() => resolve());
		}
	});
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
	const frameW = video.videoWidth;
	const frameH = video.videoHeight;
	if (!frameW || !frameH) {
		throw new Error('未能获取截图画面。');
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
	video.pause();
	video.srcObject = null;
	return canvas.toDataURL('image/jpeg', 0.92);
}

export function releaseCaptureStream() {
	stopSharedStream();
}
