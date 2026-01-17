import { MarkdownToPngConverter } from '../src/index';
import * as path from 'path';

async function main() {
  const converter = new MarkdownToPngConverter();

  try {
    // 示例 1：从文件转换
    console.log('示例 1：从 Markdown 文件转换...');
    const samplePath = path.join(__dirname, 'sample.md');
    const outputPath1 = path.join(__dirname, 'output-basic.png');

    await converter.convert(samplePath, {
      outputPath: outputPath1,
      width: 900,
      backgroundColor: '#ffffff',
    });
    console.log(`已生成: ${outputPath1}`);

    // 示例 2：直接传入 Markdown 字符串
    console.log('\n示例 2：直接传入 Markdown 字符串...');
    const markdown = `
# 快速测试

这是一个**快速测试**示例。

- 支持列表
- 支持代码
- 支持表格

\`\`\`javascript
console.log('Hello, World!');
\`\`\`
    `;

    const outputPath2 = path.join(__dirname, 'output-inline.png');
    await converter.convert(markdown, {
      outputPath: outputPath2,
      width: 600,
      backgroundColor: '#fafafa',
    });
    console.log(`已生成: ${outputPath2}`);

    // 示例 3：使用自定义 CSS 文件路径
    console.log('\n示例 3：使用自定义 CSS 文件（深色主题）...');
    const darkThemePath = path.join(__dirname, '..', 'src', 'styles', 'dark-theme.css');
    const outputPath3 = path.join(__dirname, 'output-dark-theme.png');
    await converter.convert(samplePath, {
      outputPath: outputPath3,
      width: 1000,
      cssPath: darkThemePath,  // 使用深色主题 CSS 文件
    });
    console.log(`已生成: ${outputPath3}`);

    // 示例 4：自定义样式（追加到默认样式后）
    console.log('\n示例 4：追加自定义样式...');
    const outputPath4 = path.join(__dirname, 'output-custom-css.png');
    await converter.convert(samplePath, {
      outputPath: outputPath4,
      width: 900,
      backgroundColor: '#ffffff',
      customCSS: `
        /* 让标题更大 */
        h1 { font-size: 2.5em; color: #e74c3c; }
        h2 { font-size: 2em; color: #c0392b; }
        /* 让代码块更醒目 */
        pre { background-color: #282c34; border-left: 4px solid #61afef; }
        code { color: #98c379; }
      `,
    });
    console.log(`已生成: ${outputPath4}`);

    // 示例 5：测试长代码自动换行
    console.log('\n示例 5：测试长代码自动换行...');
    const longCodeMarkdown = `
# 长代码测试

以下是包含长行的代码，会自动换行：

\`\`\`javascript
// 这是一段很长的代码，包含很长的函数名和注释--------------------------------------------------------------
const veryLongFunctionName = (parameter1, parameter2, parameter3, parameter4, parameter5) => {
  const url = "https://api.example.com/v1/very/long/path/that/should/wrap/nicely/when/it/exceeds/container/width";
  console.log("这是一段很长的字符串，会自动换行以适应容器宽度");
};

const config = {
  apiKey: "sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  databaseUrl: "postgresql://user:password@very-long-hostname.example.com:5432/database_name",
};
\`\`\`

普通段落也会自动换行，不会超出容器宽度。这是一段很长的文字，用于测试文本自动换行功能，确保长文本能够在容器内正确显示并换行。
    `;

    const outputPath5 = path.join(__dirname, 'output-long-code.png');
    await converter.convert(longCodeMarkdown, {
      outputPath: outputPath5,
      width: 800,  // 较窄的宽度测试换行
      backgroundColor: '#ffffff',
    });
    console.log(`已生成: ${outputPath5}`);

    console.log('\n所有示例转换完成！');
  } finally {
    await converter.close();
  }
}

main().catch(console.error);
