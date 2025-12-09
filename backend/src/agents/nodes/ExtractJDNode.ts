import type { JobApplicationState, ExtractedJD } from "../../state/JobApplicationState";
import { addError } from "../../state/JobApplicationState";
import McpClient from "../../services/mcp/McpClient";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Storage directory for extracted JDs
const STORAGE_DIR = process.env.APP_STORAGE_DIR || join(process.env.HOME || process.env.USERPROFILE || '.', '.fasttrack', 'extracted_jds');

/**
 * Node 1: Extract Job Description
 * 
 * Responsibilities:
 * - Navigate to job URL using Playwright MCP
 * - Click "Show More", "View More", "Read More" buttons to expand content
 * - Extract complete job description text
 * - Extract job title and company name
 * - Return raw text and HTML for AI processing
 * 
 * Input: state.jobUrl
 * Output: state.extractedJD
 */

// Common button selectors for expanding job descriptions
const EXPAND_BUTTON_SELECTORS = [
  // Generic
  'button:has-text("Show more")',
  'button:has-text("View more")',
  'button:has-text("Read more")',
  'button:has-text("See more")',
  'button:has-text("Expand")',
  'a:has-text("Show more")',
  'a:has-text("View more")',
  
  // LinkedIn specific
  '.jobs-description__footer-button',
  '[aria-label="Show more"]',
  '[aria-label="View more"]',
  
  // Indeed specific
  '.jobsearch-JobComponent-description button',
  '#viewJobButtonLinkContainer',
  
  // Glassdoor specific
  '#JobDescriptionContainer button',
  
  // Generic by class
  '.show-more-button',
  '.expand-button',
  '.read-more',
  
  // Generic by ID
  '#show-more',
  '#view-more',
  '#expand-description',
];

// Job description container selectors
const JOB_DESCRIPTION_SELECTORS = [
  // Generic
  '[class*="job-description"]',
  '[class*="jobDescription"]',
  '[id*="job-description"]',
  '[id*="jobDescription"]',
  
  // LinkedIn
  '.jobs-description',
  '.jobs-description-content',
  '.jobs-description__content',
  
  // Indeed
  '#jobDescriptionText',
  '.jobsearch-JobComponent-description',
  
  // Glassdoor
  '#JobDescriptionContainer',
  
  // Generic semantic
  'article',
  'main',
  '[role="main"]',
];

export async function extractJDNode(
  state: JobApplicationState
): Promise<Partial<JobApplicationState>> {
  console.log(`[Node 1] Starting job description extraction from: ${state.jobUrl}`);
  
  try {
    const mcpClient = new McpClient();
    
    // Extract job description with button clicking
    const result = await mcpClient.extractJobDescription(state.jobUrl);
    
    // If MCP extraction succeeded, enhance it with button clicking
    const enhancedResult = await enhanceExtraction(mcpClient, result.text);
    
    const extractedJD: ExtractedJD = {
      url: state.jobUrl,
      title: result.title || enhancedResult.title,
      company: enhancedResult.company,
      rawText: enhancedResult.fullText || result.text,
      rawHTML: enhancedResult.html,
      extractedAt: new Date().toISOString(),
    };
    
    console.log(`[Node 1] Successfully extracted ${extractedJD.rawText.length} characters`);
    console.log(`[Node 1] Title: ${extractedJD.title}`);
    console.log(`[Node 1] Company: ${extractedJD.company}`);
    
    // Save extracted JD to file
    try {
      mkdirSync(STORAGE_DIR, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitize = (str: string | undefined) => (str || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const filename = `Extracted_JD_${sanitize(extractedJD.company)}_${sanitize(extractedJD.title)}_${timestamp}.json`;
      const filepath = join(STORAGE_DIR, filename);
      
      writeFileSync(filepath, JSON.stringify(extractedJD, null, 2), 'utf-8');
      console.log(`[Node 1] ✅ Saved extracted JD to: ${filepath}`);
    } catch (fileError: any) {
      console.warn(`[Node 1] ⚠️ Failed to save extracted JD to file:`, fileError.message);
      // Continue processing even if file save fails
    }
    
    return {
      extractedJD,
      currentStep: "jd_extracted",
    };
    
  } catch (error: any) {
    console.error(`[Node 1] Extraction failed:`, error.message);
    
    const newState = addError(
      state,
      "extract_jd",
      `Failed to extract job description: ${error.message}`
    );
    
    return {
      ...newState,
      currentStep: "failed",
    };
  }
}

/**
 * Enhanced extraction with button clicking
 * This function uses direct Playwright to click expand buttons
 */
async function enhanceExtraction(
  mcpClient: McpClient,
  initialText: string
): Promise<{
  fullText: string;
  title?: string;
  company?: string;
  html?: string;
}> {
  // For now, use the MCP client's basic extraction
  // TODO: Enhance with button clicking using Playwright MCP tools
  
  return {
    fullText: initialText,
  };
}

/**
 * Helper: Click all expand buttons on the page
 * Uses Playwright to find and click "Show More" type buttons
 */
export async function clickExpandButtons(page: any): Promise<number> {
  let clickedCount = 0;
  
  for (const selector of EXPAND_BUTTON_SELECTORS) {
    try {
      const button = await page.$(selector);
      if (button) {
        const isVisible = await button.isVisible();
        if (isVisible) {
          await button.click();
          clickedCount++;
          console.log(`[Node 1] Clicked expand button: ${selector}`);
          
          // Wait for content to load
          await page.waitForTimeout(500);
        }
      }
    } catch (error) {
      // Button not found or not clickable, continue
      continue;
    }
  }
  
  return clickedCount;
}

/**
 * Helper: Extract job description content
 * Tries multiple selectors to find the job description container
 */
export async function extractJobContent(page: any): Promise<{
  text: string;
  html: string;
  title?: string;
  company?: string;
}> {
  let text = "";
  let html = "";
  let title: string | undefined;
  let company: string | undefined;
  
  // Try to find job description container
  for (const selector of JOB_DESCRIPTION_SELECTORS) {
    try {
      const element = await page.$(selector);
      if (element) {
        const innerText = await element.innerText();
        const innerHTML = await element.innerHTML();
        
        if (innerText && innerText.length > text.length) {
          text = innerText;
          html = innerHTML;
          console.log(`[Node 1] Found content using selector: ${selector}`);
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  // If no specific container found, get body text
  if (!text) {
    text = await page.evaluate(() => document.body.innerText);
    html = await page.evaluate(() => document.body.innerHTML);
  }
  
  // Try to extract title
  try {
    title = await page.title();
    
    // Also try h1 tags
    const h1 = await page.$('h1');
    if (h1) {
      const h1Text = await h1.innerText();
      if (h1Text && title && h1Text.length < title.length) {
        title = h1Text;
      }
    }
  } catch (error) {
    // Title extraction failed
  }
  
  // Try to extract company name
  try {
    const companySelectors = [
      '[class*="company"]',
      '[class*="employer"]',
      '[data-company]',
      '.companyName',
    ];
    
    for (const selector of companySelectors) {
      const el = await page.$(selector);
      if (el) {
        company = await el.innerText();
        if (company) break;
      }
    }
  } catch (error) {
    // Company extraction failed
  }
  
  return { text, html, title, company };
}
