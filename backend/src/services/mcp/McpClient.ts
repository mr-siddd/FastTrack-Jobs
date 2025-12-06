import { chromium } from 'playwright';

let mcpClient: any | null = null;
let callTool: null | ((name: string, params?: any) => Promise<any>) = null;

async function initMcpOnce() {
  if (mcpClient && callTool) return;
  try {
    const sdkClientMod: any = await import('@modelcontextprotocol/sdk/client');
    const transportMod: any = await import('@modelcontextprotocol/sdk/transport/node');
    const { Client } = sdkClientMod;
    const { NodeStdioTransport } = transportMod;
    const transport = new NodeStdioTransport({
      command: 'npx',
      args: ['@playwright/mcp@latest'],
    });
    mcpClient = new Client({ transport });
    callTool = (name: string, params?: any) => (mcpClient as any).callTool(name, params);
  } catch (e) {
    // If MCP SDK not available or fails, we'll fallback to direct Playwright
    mcpClient = null;
    callTool = null;
  }
}

type ExtractedJD = {
  title?: string;
  company?: string;
  text: string;
};

export default class McpClient {
  constructor() {}

  async extractJobDescription(url: string): Promise<ExtractedJD> {
    await initMcpOnce();
    if (callTool) {
      try {
        await callTool('browser_navigate', { url });
        const pageText = await callTool('page_evaluate', { expression: 'document.body.innerText' });
        const title = await callTool('page_evaluate', { expression: 'document.title' });
        return { title, text: String(pageText || '') };
      } catch (e) {
        // fall through to direct Playwright
      }
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });
    const page = await context.newPage();

    // Retry with different wait strategies if networkidle fails
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e: any) {
      if (e.message && (e.message.includes('ERR_HTTP2_PROTOCOL_ERROR') || e.message.includes('timeout'))) {
        // Fallback: try with domcontentloaded
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForTimeout(2000); // Give page time to render
        } catch (e2) {
          // Final fallback: just load
          await page.goto(url, { waitUntil: 'load', timeout: 15000 });
          await page.waitForTimeout(1500);
        }
      } else {
        await browser.close();
        throw e;
      }
    }

    const selectors = ['article', '.job-description', '.job-desc', '#job-description', '.description', 'main'];
    let text = '';
    for (const s of selectors) {
      const el = await page.$(s);
      if (el) {
        text = (await el.innerText()) || '';
        if (text && text.length > 50) break;
      }
    }
    if (!text) {
      text = await page.evaluate(() => document.body.innerText);
    }
    const title = await page.title();
    await browser.close();
    return { title, text };
  }

  async detectFormFields(_url: string) {
    return [];
  }

  async applyToJob(_data: any) {
    // Placeholder: full apply flow to be implemented once toolset is finalized
    return { success: false, message: 'Apply via MCP not implemented yet' };
  }
}
