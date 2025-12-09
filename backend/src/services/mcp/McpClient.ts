import { chromium } from 'playwright';

let mcpClient: any | null = null;
let callTool: null | ((name: string, params?: any) => Promise<any>) = null;

async function initMcpOnce() {
  if (mcpClient && callTool) return;
  // For now, skip MCP SDK initialization and use direct Playwright
  // This avoids import path issues with @modelcontextprotocol/sdk
  mcpClient = null;
  callTool = null;
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

    // Click expand buttons (Show More, View More, etc.)
    await this.clickExpandButtons(page);

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

  /**
   * Click all "Show More", "View More" buttons to expand content
   * Returns the number of buttons clicked
   */
  private async clickExpandButtons(page: any): Promise<number> {
    const expandButtonSelectors = [
      'button:has-text("Show more")',
      'button:has-text("View more")',
      'button:has-text("Read more")',
      'button:has-text("See more")',
      'button:has-text("Expand")',
      'a:has-text("Show more")',
      'a:has-text("View more")',
      '.jobs-description__footer-button',
      '[aria-label="Show more"]',
      '[aria-label="View more"]',
      '.show-more-button',
      '.expand-button',
      '.read-more',
    ];

    let clickedCount = 0;

    for (const selector of expandButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          const isVisible = await button.isVisible();
          if (isVisible) {
            await button.click();
            clickedCount++;
            console.log(`[McpClient] Clicked expand button: ${selector}`);
            await page.waitForTimeout(500); // Wait for content to load
          }
        }
      } catch (error) {
        // Button not found or not clickable, continue
        continue;
      }
    }

    console.log(`[McpClient] Clicked ${clickedCount} expand buttons`);
    return clickedCount;
  }
}
