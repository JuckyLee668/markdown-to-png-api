# Markdown 转 PNG 转换器

这是一个将 Markdown 文档转换为 PNG 图片的工具。

## 功能特点

- 简单易用
- 支持完整的 Markdown 语法
- 输出高质量 PNG 图片
- 可自定义样式

## 代码示例

```typescript
import { MarkdownToPngConverter } from 'markdown-to-png';

const converter = new MarkdownToPngConverter();
await converter.convert('markdown.md', { outputPath: 'output.png' });
```

## 列表展示

### 无序列表
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 引用块

> 这是一段引用文本。
> 可以跨越多行。

## 表格

| 功能 | 状态 | 优先级 |
|------|------|--------|
| Markdown 解析 | 已完成 | 高 |
| PNG 输出 | 已完成 | 高 |
| 自定义样式 | 计划中 | 中 |

## 链接和图片

[GitHub](https://github.com)

---

*感谢使用！*
