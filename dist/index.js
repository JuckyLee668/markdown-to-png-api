"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownToPngConverter = void 0;
exports.convertMarkdownToPng = convertMarkdownToPng;
const marked_1 = require("marked");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// CSS 文件路径常量
const DEFAULT_CSS_PATH = path.join(__dirname, 'styles', 'markdown.css');
/**
 * Markdown 转 PNG 转换器
 */
class MarkdownToPngConverter {
    constructor() {
        this.browser = null;
    }
    /**
     * 初始化浏览器
     */
    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }
        return this.browser;
    }
    /**
     * 关闭浏览器
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    /**
     * 将 Markdown 字符串转换为 HTML
     */
    markdownToHtml(markdown) {
        const html = marked_1.marked.parse(markdown);
        return html;
    }
    /**
     * 加载 CSS 文件内容
     */
    loadCSS(cssPath) {
        const filePath = cssPath || DEFAULT_CSS_PATH;
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
        console.warn(`CSS 文件未找到: ${filePath}，使用内置样式`);
        return '';
    }
    /**
     * 生成完整的 HTML 文档（包含样式）
     */
    generateFullHtml(markdownHtml, options) {
        const backgroundColor = options.backgroundColor || '#ffffff';
        const customCSS = options.customCSS || '';
        const containerWidth = options.width ? options.width - 80 : 720;
        // 加载 CSS（优先使用自定义路径，否则使用默认路径）
        const cssContent = this.loadCSS(options.cssPath);
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${options.width || 800}, initial-scale=1.0">
  <title>Markdown Preview</title>
  <style>
    /* 基础样式 */
    ${cssContent}

    /* 页面特定样式 */
    body {
      background-color: ${backgroundColor};
    }

    .container {
      max-width: ${containerWidth}px;
    }

    /* 自定义样式 */
    ${customCSS}
  </style>
</head>
<body>
  <div class="container">
    ${markdownHtml}
  </div>
</body>
</html>`;
    }
    /**
     * 将 Markdown 转换为 PNG
     * @param markdown Markdown 字符串或文件路径
     * @param options 转换选项
     * @returns 生成的 PNG 文件路径
     */
    async convert(markdown, options = {}) {
        let markdownContent;
        // 判断输入是文件路径还是直接内容
        if (fs.existsSync(markdown)) {
            markdownContent = fs.readFileSync(markdown, 'utf-8');
        }
        else {
            markdownContent = markdown;
        }
        // Markdown 转 HTML
        const markdownHtml = this.markdownToHtml(markdownContent);
        // 生成完整 HTML 文档
        const fullHtml = this.generateFullHtml(markdownHtml, options);
        // 初始化浏览器
        const browser = await this.initBrowser();
        const page = await browser.newPage();
        // 设置页面内容
        await page.setContent(fullHtml, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });
        // 获取内容高度
        const viewportWidth = options.width || 800;
        const dimensions = await page.evaluate((width) => {
            const body = document.body;
            const html = document.documentElement;
            return {
                height: Math.max(body.scrollHeight, html.scrollHeight),
                width: width,
            };
        }, viewportWidth);
        // 设置视口大小
        await page.setViewport({
            width: dimensions.width,
            height: dimensions.height,
        });
        // 生成输出路径
        const outputPath = options.outputPath || this.generateOutputPath();
        // 截图保存
        await page.screenshot({
            path: outputPath,
            fullPage: true,
            type: 'png',
        });
        await page.close();
        return outputPath;
    }
    /**
     * 生成默认输出路径
     */
    generateOutputPath() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return path.join(process.cwd(), `markdown-${timestamp}.png`);
    }
}
exports.MarkdownToPngConverter = MarkdownToPngConverter;
/**
 * 便捷函数：快速将 Markdown 转换为 PNG
 */
async function convertMarkdownToPng(markdown, outputPath) {
    const converter = new MarkdownToPngConverter();
    try {
        return await converter.convert(markdown, { outputPath });
    }
    finally {
        await converter.close();
    }
}
// CLI 入口点
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('用法:');
        console.log('  node index.js <markdown-file> [output-png-file]');
        console.log('  或者');
        console.log('  echo "# Hello" | node index.js --stdin [output-png-file]');
        process.exit(1);
    }
    const converter = new MarkdownToPngConverter();
    (async () => {
        try {
            let markdown;
            let outputPath;
            if (args[0] === '--stdin') {
                // 从标准输入读取
                markdown = '';
                process.stdin.setEncoding('utf-8');
                for await (const chunk of process.stdin) {
                    markdown += chunk;
                }
                outputPath = args[1];
            }
            else {
                // 从文件读取
                markdown = args[0];
                outputPath = args[1];
            }
            const result = await converter.convert(markdown, { outputPath });
            console.log(`PNG 图片已生成: ${result}`);
        }
        catch (error) {
            console.error('转换失败:', error);
            process.exit(1);
        }
        finally {
            await converter.close();
        }
    })();
}
