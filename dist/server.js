"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("./index");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 静态文件目录（存放生成的图片）
const outputDir = path_1.default.join(process.cwd(), 'output');
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
}
app.use('/output', express_1.default.static(outputDir));
// 配置 multer 用于文件上传
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 限制
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['text/markdown', 'text/x-markdown', 'application/octet-stream'];
        const allowedExts = ['.md', '.markdown', '.txt'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('只支持 Markdown 文件'));
        }
    },
});
// 转换器实例（单例模式）
let converter = null;
function getConverter() {
    if (!converter) {
        converter = new index_1.MarkdownToPngConverter();
    }
    return converter;
}
// 清理旧的输出文件
function cleanupOldFiles() {
    const files = fs_1.default.readdirSync(outputDir);
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 分钟
    files.forEach((file) => {
        const filePath = path_1.default.join(outputDir, file);
        const stats = fs_1.default.statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
            fs_1.default.unlinkSync(filePath);
        }
    });
}
// 定时清理
setInterval(cleanupOldFiles, 10 * 60 * 1000); // 每 10 分钟清理一次
/**
 * API 路由
 */
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 从请求体获取 Markdown 内容并转换为 PNG
app.post('/api/convert', upload.none(), async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: '缺少 markdown 内容' });
        }
        let convertOptions = {};
        if (options) {
            try {
                convertOptions = JSON.parse(options);
            }
            catch {
                return res.status(400).json({ error: 'options 格式错误，必须是 JSON' });
            }
        }
        // 生成输出文件名
        const timestamp = Date.now();
        const filename = `markdown-${timestamp}.png`;
        const outputPath = path_1.default.join(outputDir, filename);
        // 执行转换
        const resultPath = await getConverter().convert(content, {
            ...convertOptions,
            outputPath,
        });
        const filenameOnly = path_1.default.basename(resultPath);
        res.json({
            success: true,
            data: {
                url: `/output/${filenameOnly}`,
                path: resultPath,
                filename: filenameOnly,
            },
        });
    }
    catch (error) {
        console.error('转换失败:', error);
        res.status(500).json({ error: '转换失败', message: String(error) });
    }
});
// 上传 Markdown 文件并转换为 PNG
app.post('/api/convert/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '缺少文件' });
        }
        const content = req.file.buffer.toString('utf-8');
        // 获取请求中的选项
        let convertOptions = {};
        const optionsStr = req.body.options;
        if (optionsStr) {
            try {
                convertOptions = JSON.parse(optionsStr);
            }
            catch {
                return res.status(400).json({ error: 'options 格式错误，必须是 JSON' });
            }
        }
        // 生成输出文件名
        const timestamp = Date.now();
        const filename = `markdown-${timestamp}.png`;
        const outputPath = path_1.default.join(outputDir, filename);
        // 执行转换
        const resultPath = await getConverter().convert(content, {
            ...convertOptions,
            outputPath,
        });
        const filenameOnly = path_1.default.basename(resultPath);
        res.json({
            success: true,
            data: {
                url: `/output/${filenameOnly}`,
                path: resultPath,
                filename: filenameOnly,
            },
        });
    }
    catch (error) {
        console.error('转换失败:', error);
        res.status(500).json({ error: '转换失败', message: String(error) });
    }
});
// 直接返回 PNG 图片
app.get('/api/convert/image', async (req, res) => {
    try {
        const { content, options } = req.query;
        if (!content) {
            return res.status(400).json({ error: '缺少 markdown 内容' });
        }
        let convertOptions = {};
        if (options) {
            try {
                convertOptions = JSON.parse(decodeURIComponent(options));
            }
            catch {
                return res.status(400).json({ error: 'options 格式错误' });
            }
        }
        // 生成输出文件名
        const timestamp = Date.now();
        const filename = `markdown-${timestamp}.png`;
        const outputPath = path_1.default.join(outputDir, filename);
        // 执行转换
        await getConverter().convert(content, {
            ...convertOptions,
            outputPath,
        });
        // 直接返回图片
        res.sendFile(outputPath, (err) => {
            if (err) {
                console.error('发送文件失败:', err);
            }
        });
    }
    catch (error) {
        console.error('转换失败:', error);
        res.status(500).json({ error: '转换失败', message: String(error) });
    }
});
// 批量转换
app.post('/api/convert/batch', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: '缺少文件' });
        }
        // 获取请求中的选项
        let convertOptions = {};
        const optionsStr = req.body.options;
        if (optionsStr) {
            try {
                convertOptions = JSON.parse(optionsStr);
            }
            catch {
                return res.status(400).json({ error: 'options 格式错误' });
            }
        }
        const results = [];
        for (const file of files) {
            try {
                const content = file.buffer.toString('utf-8');
                const timestamp = Date.now();
                const filename = `markdown-${timestamp}-${file.originalname}.png`;
                const outputPath = path_1.default.join(outputDir, filename);
                await getConverter().convert(content, {
                    ...convertOptions,
                    outputPath,
                });
                results.push({
                    filename: file.originalname,
                    url: `/output/${filename}`,
                    success: true,
                });
            }
            catch (err) {
                results.push({
                    filename: file.originalname,
                    url: '',
                    success: false,
                    error: String(err),
                });
            }
        }
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error('批量转换失败:', error);
        res.status(500).json({ error: '批量转换失败', message: String(error) });
    }
});
// 获取转换选项默认值
app.get('/api/options', (req, res) => {
    res.json({
        width: {
            type: 'number',
            default: 800,
            description: '页面宽度（像素）',
            min: 100,
            max: 4096,
        },
        backgroundColor: {
            type: 'string',
            default: '#ffffff',
            description: '背景颜色',
            example: '#ffffff 或 rgba(255,255,255,1)',
        },
        customCSS: {
            type: 'string',
            default: '',
            description: '自定义 CSS 样式',
            example: 'body { font-size: 18px; }',
        },
        highlight: {
            type: 'boolean',
            default: false,
            description: '是否启用代码高亮',
        },
    });
});
// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// 错误处理
app.use((err, req, res) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM 信号，正在关闭...');
    if (converter) {
        await converter.close();
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('收到 SIGINT 信号，正在关闭...');
    if (converter) {
        await converter.close();
    }
    process.exit(0);
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`Markdown to PNG API 服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log(`转换接口: POST http://localhost:${PORT}/api/convert`);
    console.log(`文件上传: POST http://localhost:${PORT}/api/convert/file`);
    console.log(`直接图片: GET  http://localhost:${PORT}/api/convert/image`);
    console.log(`批量转换: POST http://localhost:${PORT}/api/convert/batch`);
});
exports.default = app;
