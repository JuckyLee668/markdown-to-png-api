export interface ConvertOptions {
    /**
     * 输出 PNG 文件路径
     */
    outputPath?: string;
    /**
     * 页面宽度（像素）
     */
    width?: number;
    /**
     * 是否使用语法高亮
     */
    highlight?: boolean;
    /**
     * 背景颜色
     */
    backgroundColor?: string;
    /**
     * 自定义 CSS 文件路径（覆盖默认样式）
     */
    cssPath?: string;
    /**
     * 额外的 CSS 样式（追加到默认样式后）
     */
    customCSS?: string;
}
/**
 * Markdown 转 PNG 转换器
 */
export declare class MarkdownToPngConverter {
    private browser;
    /**
     * 初始化浏览器
     */
    private initBrowser;
    /**
     * 关闭浏览器
     */
    close(): Promise<void>;
    /**
     * 将 Markdown 字符串转换为 HTML
     */
    private markdownToHtml;
    /**
     * 加载 CSS 文件内容
     */
    private loadCSS;
    /**
     * 生成完整的 HTML 文档（包含样式）
     */
    private generateFullHtml;
    /**
     * 将 Markdown 转换为 PNG
     * @param markdown Markdown 字符串或文件路径
     * @param options 转换选项
     * @returns 生成的 PNG 文件路径
     */
    convert(markdown: string, options?: ConvertOptions): Promise<string>;
    /**
     * 生成默认输出路径
     */
    private generateOutputPath;
}
/**
 * 便捷函数：快速将 Markdown 转换为 PNG
 */
export declare function convertMarkdownToPng(markdown: string, outputPath?: string): Promise<string>;
