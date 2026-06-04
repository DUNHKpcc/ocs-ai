<div align="center">

# 🤖 DPCC-OCS-AI

> 任意网页 **AI 答题助手**：拖拽框选 → 真实截图 → 多模态 AI 看图作答

![version](https://img.shields.io/badge/version-1.0.0-blue)
![userscript](https://img.shields.io/badge/userscript-Tampermonkey-success)

</div>

<div align="center">

### 🔑 没有 API Key？推荐使用 [**api.dpccgaming.xyz**](https://api.dpccgaming.xyz) 获取 Token，开箱即用

**可用多模态模型：**

<table>
<tr>
<td align="center" width="200">
<img src="assets/logo-openai.svg" height="30" alt="OpenAI"/><br/>
<b>GPT-5.5</b>
</td>
<td align="center" width="200">
<img src="assets/logo-claude.svg" height="30" alt="Claude"/><br/>
<b>Claude Opus 4.8</b>
</td>
</tr>
</table>

</div>

---

## ✨ 功能

- **截图搜题**：拖一个框选住题目，浏览器真实截图（`getDisplayMedia`），把图片发给多模态 AI 解答 —— 跨域题图、公式、canvas 都能抓到。
- **DOM 识别**：也支持框选题目区域、读取页面文本/选项进行答题。
- **答案面板**：显示答案、解析，以及本次截图的**缩略图**。
- **可自定义快捷键**：截图、重新截图各一个，支持按键录制。
- **纯净**：基于 [ocsjs](https://github.com/ocsjs/ocsjs) 精简，仅保留 AI 答题功能。

## 🚀 安装（普通用户）

1. 安装 **Tampermonkey（油猴）** 扩展：<https://www.tampermonkey.net/>
   （Scriptcat 脚本猫也可，需支持 `GM_xmlhttpRequest`）
2. 点下面链接，油猴会自动弹出安装界面，点「安装」：

   👉 **[点击安装 ocs.ai.user.js](https://raw.githubusercontent.com/DUNHKpcc/ocs-ai-/ai-answer-assistant/ocs.ai.user.js)**

3. 已内置 `@updateURL`，仓库更新后油猴会自动提示升级。

> 点链接没反应？复制链接，在油猴「实用工具 → 从 URL 导入」里粘贴导入。

## ⚙️ 配置（首次必做）

打开任意正常网站（如 `https://www.baidu.com`），页面会出现 OCS 悬浮窗，点开「🤖 AI答题助手」填写：

| 项 | 说明 |
|---|---|
| **Base URL** | OpenAI 兼容接口地址，如 `https://api.openai.com/v1` 或中转地址 |
| **API Key** | 你的密钥 |
| **模型** | 需**支持图片（多模态）**，如 `gpt-4o-mini`、`gpt-4o` |

## 🖱️ 用法

### 截图搜题（推荐）
1. 点「**拖拽框选截图**」，拖框选住题目；
2. 浏览器弹出共享窗口时选「**此标签页**」并允许（一次会话只需授权一次）；
3. AI 看图作答，答案与截图缩略图显示在面板；
4. 同区域换题，点「**重新截图提问**」即可，无需重新框。

### 快捷键（可自定义）
- **截图快捷键**（默认 `Alt+S`）：进入拖拽框选并自动截图提问
- **重新截图快捷键**（默认 `Alt+R`）：按上次区域直接重截提问

> 设置里点对应输入框，直接按下想要的组合键即可录制；按 `Esc`/`Backspace` 清空即关闭。

## 🛠️ 开发者：自行构建

```bash
git clone https://github.com/DUNHKpcc/ocs-ai-.git
cd ocs-ai-
pnpm install
VITE_BUILD_PATH=../../dist npm run build
# 产物：dist/ocs.ai.user.js，并自动同步一份到仓库根目录 ./ocs.ai.user.js
```

### 发布新版本
1. 修改代码；
2. 把根 `package.json` 的 `version` 往上加（油猴靠版本号判断更新）；
3. `VITE_BUILD_PATH=../../dist npm run build`（会自动刷新根目录的 `ocs.ai.user.js`）；
4. 提交并推送。

## 🔒 隐私说明

- 截图仅存在于浏览器内存，**不落地、刷新即清**；
- 截图会作为图片**上传到你自己配置的 AI 接口**，是否留存取决于该服务商。

## 📄 License

MIT · 基于 [ocsjs](https://github.com/ocsjs/ocsjs) 改造。
