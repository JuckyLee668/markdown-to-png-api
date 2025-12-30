# Markdown to PNG API

## 项目简介

该服务接收 Markdown 文本作为输入，使用 Markdown-it 将其转换为 HTML，然后通过 Puppeteer 和 Headless Chrome 渲染并生成 PNG 图片。适用于自动化文档生成、内容预览等场景。

## 功能特性

- 📝 **Markdown 转 PNG**：支持标准 Markdown 语法渲染
- 🎨 **美观的默认样式**：精心设计的 CSS 样式，确保渲染效果优雅
- 🚀 **高性能**：使用 Headless Chrome 进行高效渲染
- 📱 **高分辨率支持**：支持 2x 设备像素比，生成高质量图片
- 🔧 **易于部署**：简单的 Express.js 应用，可轻松部署到各种云平台

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd markdown-to-png-api

# 安装依赖
npm install
```

### 运行服务

```bash
# 开发环境
npm start
```

服务默认运行在 `http://localhost:3000`

## API 使用

### 生成 PNG 截图

**端点**: `POST /`

**请求头**:
```
Content-Type: text/plain
```

**请求体**: Markdown 文本内容

**示例**:

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: text/plain" \
  -d "# Hello World
  
This is a **Markdown** document.

- Item 1
- Item 2
- Item 3

```javascript
console.log('Code block example');
```" \
  --output screenshot.png
```

**响应**: PNG 图片文件

### 环境变量

- `PORT` - 服务端口号（默认：3000）

## 注意事项

- 请求体大小限制为 5MB
- 首次启动时会下载 Chromium，可能需要一些时间
