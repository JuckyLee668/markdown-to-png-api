import express from "express";
import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer";

const app = express();
app.use(express.text({ limit: "5mb" }));
const width = 1200;
const deviceScaleFactor = 2;
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

let browser;

async function start() {
    browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    app.post("/", async (req, res) => {
        try {
            const text = req.body || "";
            const content = md.render(text);

            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            background: #fff;
            color: #111;
        }
        pre {
            background: #f6f8fa;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
        }
        code { font-family: monospace; }
    </style>
</head>
<body>
${content}
</body>
</html>`;

            const page = await browser.newPage();
            await page.setViewport({ width, height: 800, deviceScaleFactor });
            await page.setContent(html, { waitUntil: "networkidle0" });

            const buffer = await page.screenshot({ fullPage: true });
            await page.close();

            res.type("png").send(buffer);
        } catch (err) {
            console.error(err);
            res.status(500).send("Screenshot failed");
        }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
}

start().catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
});
