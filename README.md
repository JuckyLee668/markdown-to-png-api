# Markdown to PNG API

将 Markdown 文档转换为 PNG 图片的 API 服务。支持独立 CSS 主题、多样化的自定义选项。

![Preview](./examples/output-basic.png)

## 功能特性

- **API 服务** - RESTful API 接口，支持多种调用方式
- **独立 CSS** - 样式文件独立管理，支持自定义主题
- **多种输入** - 支持 Markdown 文本、文件上传
- **批量转换** - 支持批量处理多个文件
- **自动清理** - 自动清理 30 分钟前的生成文件

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动服务器

开发模式：

```bash
npm run server
```

生产模式：

```bash
npm run build
npm run server:prod
```

服务器默认运行在 `http://localhost:3000`

## API 文档

### 健康检查

```http
GET /health
```

**响应：**

```json
{
  "status": "ok",
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

### 转换 Markdown 文本

将 Markdown 文本转换为 PNG 图片。

```http
POST /api/convert
Content-Type: application/json

{
  "content": "# Hello\n\nThis is **bold** text.",
  "options": {
    "width": 800,
    "backgroundColor": "#ffffff",
    "cssPath": "./styles/dark-theme.css"
  }
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "url": "/output/markdown-123456789.png",
    "path": "/path/to/output/markdown-123456789.png",
    "filename": "markdown-123456789.png"
  }
}
```

### 上传文件转换

上传 Markdown 文件并转换为 PNG。

```http
POST /api/convert/file
Content-Type: multipart/form-data

file: [文件]
options: '{"width": 900, "cssPath": "./styles/dark-theme.css"}'
```

### 直接获取图片

通过 GET 请求直接获取 PNG 图片（适合嵌入 `<img>` 标签）。

```http
GET /api/convert/image?content=%23%20Hello&options=%7B%22width%22%3A800%7D
```

### 批量转换

批量上传多个文件并转换为 PNG。

```http
POST /api/convert/batch
Content-Type: multipart/form-data

files: [文件1, 文件2, ...]
options: '{"width": 800}'
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "filename": "doc1.md",
      "url": "/output/markdown-123-1.png",
      "success": true
    },
    {
      "filename": "doc2.md",
      "url": "/output/markdown-123-2.png",
      "success": true
    }
  ]
}
```

### 获取选项说明

```http
GET /api/options
```

## 请求选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | number | 800 | 页面宽度（像素），影响内容区域宽度和自动换行 |
| `backgroundColor` | string | #ffffff | 背景颜色 |
| `cssPath` | string | - | 自定义 CSS 文件路径 |
| `customCSS` | string | - | 追加的自定义 CSS 样式 |
| `highlight` | boolean | false | 是否启用代码高亮 |

### 自动换行

代码块和长文本会自动换行，不会超出容器宽度：

```typescript
// 设置较窄的宽度强制换行
await converter.convert('document.md', {
  width: 600,  // 内容区域约 520px，会自动换行
});

// 设置较宽的宽度减少换行
await converter.convert('document.md', {
  width: 1200, // 内容区域约 1120px
});
```

### 边距优化

- `body padding`: 32px
- `container max-width`: 800px
- `container padding`: 0 16px

可通过自定义 CSS 调整：

```css
body { padding: 40px; }           /* 增大页面边距 */
.container { max-width: 1000px; } /* 增宽内容区域 */
```

## 自定义样式

### 预设主题

内置两个主题可供选择：

| 文件 | 主题 |
|------|------|
| `src/styles/markdown.css` | 默认浅色主题 |
| `src/styles/dark-theme.css` | 深色主题 |

**使用预设主题：**

```typescript
await converter.convert('document.md', {
  cssPath: './src/styles/dark-theme.css',
});
```

### 自定义 CSS 文件

支持使用完全自定义的 CSS 文件：

```typescript
await converter.convert('document.md', {
  cssPath: './my-custom-theme.css',
});
```

### 追加自定义样式

在默认样式基础上追加额外的 CSS：

```typescript
await converter.convert('document.md', {
  customCSS: 'h1 { color: #ff6b6b; font-size: 2.5em; }',
});
```

### 修改默认样式

直接编辑 `src/styles/markdown.css` 文件来修改默认样式：

```css
/* src/styles/markdown.css */
body {
  font-size: 18px;        /* 增大字体 */
  padding: 60px;          /* 增大边距 */
}

h1 {
  color: #e74c3c;         /* 红色标题 */
}
```

## 使用示例

### cURL

```bash
# 转换文本
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"content": "# Hello\n\nWorld", "options": {"width": 600}}'

# 上传文件
curl -X POST http://localhost:3000/api/convert/file \
  -F "file=@document.md" \
  -F "options={\"width\":800,\"cssPath\":\"./styles/dark-theme.css\"}"

# 直接获取图片
curl -o result.png "http://localhost:3000/api/convert/image?content=%23%20Hello&options=%7B%22width%22%3A600%7D"
```

### JavaScript/Node.js

```javascript
// 转换 Markdown 文本
const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '# Hello\n\nThis is a test.',
    options: {
      width: 800,
      backgroundColor: '#ffffff',
      cssPath: './src/styles/dark-theme.css'
    }
  }),
});

const { data } = await response.json();
console.log('Image URL:', data.url);

// 下载图片
const imageResponse = await fetch(`http://localhost:3000${data.url}`);
const buffer = await imageResponse.arrayBuffer();
fs.writeFileSync('output.png', Buffer.from(buffer));
```

### Python

```python
import requests

# 转换文本
response = requests.post(
    'http://localhost:3000/api/convert',
    json={
        'content': '# Hello\n\nThis is a test.',
        'options': {
            'width': 800,
            'cssPath': './styles/dark-theme.css'
        }
    }
)

result = response.json()
print('Image URL:', result['data']['url'])

# 下载图片
image_url = f"http://localhost:3000{result['data']['url']}"
image_response = requests.get(image_url)
with open('output.png', 'wb') as f:
    f.write(image_response.content)
```

### 在 HTML 中嵌入

```html
<!-- 基础用法 -->
<img src="http://localhost:3000/api/convert/image?content=%23%20Hello" alt="Markdown Preview" />

<!-- 带选项 -->
<img
  src="http://localhost:3000/api/convert/image?content=%23%20Hello&options=%7B%22width%22%3A600%2C%22cssPath%22%3A%22.%2Fstyles%2Fdark-theme.css%22%7D"
  alt="Markdown Preview"
/>
```

## 项目结构

```
markdown-to-png-api/
├── src/
│   ├── index.ts          # 核心转换器
│   ├── server.ts         # Express 服务器
│   └── styles/
│       ├── markdown.css  # 默认浅色主题（支持自动换行）
│       └── dark-theme.css # 深色主题
├── examples/
│   ├── sample.md         # 示例 Markdown
│   └── test.ts           # 测试脚本
├── package.json
├── tsconfig.json
└── README.md
```

## 作为库使用

```typescript
import { MarkdownToPngConverter } from './src';
import * as path from 'path';

const converter = new MarkdownToPngConverter();

try {
  // 方式 1：从文件转换（使用默认主题）
  await converter.convert('document.md', {
    outputPath: 'output.png',
    width: 900,
  });

  // 方式 2：使用预设深色主题
  await converter.convert('# Hello', {
    outputPath: 'hello.png',
    cssPath: path.join(__dirname, 'src/styles/dark-theme.css'),
  });

  // 方式 3：追加自定义样式
  await converter.convert('# Hello', {
    outputPath: 'hello.png',
    backgroundColor: '#1e1e1e',
    customCSS: `
      h1 { color: #ff6b6b; font-size: 2em; }
      pre { border-left: 4px solid #61afef; }
    `,
  });

} finally {
  await converter.close();
}
```

## 命令行使用

```bash
# 从文件转换
node dist/index.js input.md output.png

# 从标准输入转换
echo "# Hello" | node dist/index.js --stdin output.png
```

## Docker 部署

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 复制编译后的代码和 CSS 文件
COPY dist ./dist
COPY src/styles ./src/styles

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 构建和运行

```bash
docker build -t markdown-to-png .
docker run -p 3000:3000 -v $(pwd)/output:/app/output markdown-to-png
```

## 生产环境建议

### 1. 使用 PM2 管理进程

```bash
npm install -g pm2
pm2 start dist/server.js --name markdown-api
pm2 startup
pm2 save
```

### 2. 设置环境变量

```bash
export PORT=3000
export NODE_ENV=production
```

### 3. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /output/ {
        expires 30m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 系统服务 (systemd)

创建 `/etc/systemd/system/markdown-api.service`：

```ini
[Unit]
Description=Markdown to PNG API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/markdown-to-png
ExecStart=/usr/bin/node /opt/markdown-to-png/dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable markdown-api
sudo systemctl start markdown-api
```

## 依赖说明

| 依赖 | 版本 | 说明 |
|------|------|------|
| puppeteer | ^24.35 | 浏览器引擎，用于渲染页面 |
| marked | ^17.0 | Markdown 解析器 |
| express | ^5.2 | Web 服务器框架 |
| cors | ^2.8 | 跨域支持 |
| multer | ^2.0 | 文件上传处理 |

## 许可证

MIT
