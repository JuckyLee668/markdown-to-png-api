import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MarkdownToPngConverter, ConvertOptions } from './index';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件目录（存放生成的图片）
const outputDir = path.join(process.cwd(), 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
app.use('/output', express.static(outputDir));

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/markdown', 'text/x-markdown', 'application/octet-stream'];
    const allowedExts = ['.md', '.markdown', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 Markdown 文件'));
    }
  },
});

// 转换器实例（单例模式）
let converter: MarkdownToPngConverter | null = null;

function getConverter(): MarkdownToPngConverter {
  if (!converter) {
    converter = new MarkdownToPngConverter();
  }
  return converter;
}

// 清理旧的输出文件
function cleanupOldFiles(): void {
  const files = fs.readdirSync(outputDir);
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 分钟

  files.forEach((file) => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}

// 定时清理
setInterval(cleanupOldFiles, 10 * 60 * 1000); // 每 10 分钟清理一次

/**
 * API 路由
 */

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 从请求体获取 Markdown 内容并转换为 PNG
app.post('/api/convert', upload.none(), async (req: Request, res: Response) => {
  try {
    const { content, options } = req.body as {
      content: string;
      options?: string;
    };

    if (!content) {
      return res.status(400).json({ error: '缺少 markdown 内容' });
    }

    let convertOptions: ConvertOptions = {};

    if (options) {
      try {
        convertOptions = JSON.parse(options);
      } catch {
        return res.status(400).json({ error: 'options 格式错误，必须是 JSON' });
      }
    }

    // 生成输出文件名
    const timestamp = Date.now();
    const filename = `markdown-${timestamp}.png`;
    const outputPath = path.join(outputDir, filename);

    // 执行转换
    const resultPath = await getConverter().convert(content, {
      ...convertOptions,
      outputPath,
    });

    const filenameOnly = path.basename(resultPath);

    res.json({
      success: true,
      data: {
        url: `/output/${filenameOnly}`,
        path: resultPath,
        filename: filenameOnly,
      },
    });
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败', message: String(error) });
  }
});

// 上传 Markdown 文件并转换为 PNG
app.post('/api/convert/file', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '缺少文件' });
    }

    const content = req.file.buffer.toString('utf-8');

    // 获取请求中的选项
    let convertOptions: ConvertOptions = {};
    const optionsStr = req.body.options as string | undefined;
    if (optionsStr) {
      try {
        convertOptions = JSON.parse(optionsStr);
      } catch {
        return res.status(400).json({ error: 'options 格式错误，必须是 JSON' });
      }
    }

    // 生成输出文件名
    const timestamp = Date.now();
    const filename = `markdown-${timestamp}.png`;
    const outputPath = path.join(outputDir, filename);

    // 执行转换
    const resultPath = await getConverter().convert(content, {
      ...convertOptions,
      outputPath,
    });

    const filenameOnly = path.basename(resultPath);

    res.json({
      success: true,
      data: {
        url: `/output/${filenameOnly}`,
        path: resultPath,
        filename: filenameOnly,
      },
    });
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败', message: String(error) });
  }
});

// 直接返回 PNG 图片
app.get('/api/convert/image', async (req: Request, res: Response) => {
  try {
    const { content, options } = req.query as {
      content?: string;
      options?: string;
    };

    if (!content) {
      return res.status(400).json({ error: '缺少 markdown 内容' });
    }

    let convertOptions: ConvertOptions = {};

    if (options) {
      try {
        convertOptions = JSON.parse(decodeURIComponent(options));
      } catch {
        return res.status(400).json({ error: 'options 格式错误' });
      }
    }

    // 生成输出文件名
    const timestamp = Date.now();
    const filename = `markdown-${timestamp}.png`;
    const outputPath = path.join(outputDir, filename);

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
  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({ error: '转换失败', message: String(error) });
  }
});

// 批量转换
app.post('/api/convert/batch', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: '缺少文件' });
    }

    // 获取请求中的选项
    let convertOptions: ConvertOptions = {};
    const optionsStr = req.body.options as string | undefined;
    if (optionsStr) {
      try {
        convertOptions = JSON.parse(optionsStr);
      } catch {
        return res.status(400).json({ error: 'options 格式错误' });
      }
    }

    const results: Array<{ filename: string; url: string; success: boolean; error?: string }> = [];

    for (const file of files) {
      try {
        const content = file.buffer.toString('utf-8');
        const timestamp = Date.now();
        const filename = `markdown-${timestamp}-${file.originalname}.png`;
        const outputPath = path.join(outputDir, filename);

        await getConverter().convert(content, {
          ...convertOptions,
          outputPath,
        });

        results.push({
          filename: file.originalname,
          url: `/output/${filename}`,
          success: true,
        });
      } catch (err) {
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
  } catch (error) {
    console.error('批量转换失败:', error);
    res.status(500).json({ error: '批量转换失败', message: String(error) });
  }
});

// 获取转换选项默认值
app.get('/api/options', (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err: Error, req: Request, res: Response) => {
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

export default app;
