import type { JobApplicationState, ApplicationResult } from "../../state/JobApplicationState";
import { addError } from "../../state/JobApplicationState";
import { chromium, type Browser, type Page } from 'playwright';

/**
 * Node 5: Auto-Apply to Job
 * 
 * Responsibilities:
 * - Navigate to job application page
 * - Click "Apply" button to start application
 * - Detect and fill form fields (name, email, phone, etc.)
 * - Upload PDF resume if file upload is detected
 * - Handle multi-step forms
 * - Submit application
 * 
 * Input: state.tailoredResume, state.pdfInfo, state.jobUrl
 * Output: state.applicationResult
 * 
 * Features:
 * - Smart form field detection using labels and placeholders
 * - Intelligent field mapping
 * - File upload handling
 * - Multi-step form navigation
 * - Error recovery and retry logic
 */

interface FormField {
  type: 'text' | 'email' | 'tel' | 'file' | 'textarea' | 'select';
  selector: string;
  label: string;
  value?: string;
}

export async function autoApplyNode(
  state: JobApplicationState
): Promise<Partial<JobApplicationState>> {
  console.log("[Node 5] Starting auto-apply process");
  
  // Check if auto-apply is enabled
  if (state.options?.autoApply === false) {
    console.log("[Node 5] Auto-apply skipped (disabled in options)");
    
    const result: ApplicationResult = {
      status: "skipped",
      message: "Auto-apply is disabled in options",
    };
    
    return {
      applicationResult: result,
      currentStep: "application_complete",
    };
  }

  // Validate inputs
  if (!state.tailoredResume) {
    const newState = addError(
      state,
      "auto_apply",
      "No tailored resume found. Previous nodes must complete first."
    );
    return {
      ...newState,
      currentStep: "failed",
    };
  }

  let browser: Browser | null = null;
  
  try {
    console.log(`[Node 5] Navigating to: ${state.jobUrl}`);
    console.log(`[Node 5] Launching browser...`);
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false, // Set to false for debugging
      slowMo: 100 // Slow down actions for better visibility
    });
    
    console.log(`[Node 5] ✅ Browser launched successfully`);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });
    
    const page = await context.newPage();
    
    // Navigate to job page
    await page.goto(state.jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log("[Node 5] ⏳ Waiting for page to fully load...");
    await page.waitForTimeout(5000); // Wait 5 seconds for dynamic content
    
    // Take screenshot for debugging
    const screenshotPath = `debug-screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[Node 5] 📸 Screenshot saved: ${screenshotPath}`);
    
    console.log("[Node 5] Page loaded, looking for Apply button...");
    
    // Step 1: Find and click "Apply" button
    const applyButtonClicked = await clickApplyButton(page);
    
    if (!applyButtonClicked) {
      console.log("[Node 5] ⚠️ Could not find Apply button, attempting to fill form on current page");
    } else {
      console.log("[Node 5] ✅ Apply button clicked, waiting for form...");
      await page.waitForTimeout(2000); // Wait for form to load
    }
    
    // Step 2: Detect form fields
    console.log("[Node 5] Detecting form fields...");
    const formFields = await detectFormFields(page);
    console.log(`[Node 5] Found ${formFields.length} form fields`);
    
    if (formFields.length === 0) {
      throw new Error("No form fields detected on the page");
    }
    
    // Step 3: Map resume data to form fields
    const mappedData = mapResumeToFormFields(state.tailoredResume, formFields);
    console.log(`[Node 5] Mapped ${Object.keys(mappedData).length} fields`);
    
    // Step 4: Fill form fields
    console.log("[Node 5] Filling form fields...");
    await fillFormFields(page, mappedData);
    
    // Step 5: Handle resume upload if needed
    const uploadFields = formFields.filter(f => f.type === 'file');
    if (uploadFields.length > 0 && state.pdfInfo?.filepath) {
      console.log(`[Node 5] Uploading resume PDF: ${state.pdfInfo.filepath}`);
      await uploadResume(page, uploadFields[0].selector, state.pdfInfo.filepath);
    }
    
    // Step 6: Look for submit button (but don't click yet - user confirmation)
    const submitButton = await findSubmitButton(page);
    
    if (submitButton) {
      console.log("[Node 5] ✅ Form filled successfully. Submit button found.");
      console.log("[Node 5] ⚠️ Auto-submit is disabled by default for safety.");
      console.log("[Node 5] 📝 Please review the form and click Submit manually.");
      
      // Keep browser open for manual review
      await page.waitForTimeout(30000); // Wait 30 seconds for user to review
      
      const result: ApplicationResult = {
        status: "ready_to_submit",
        message: "Form filled successfully. Please review and submit manually.",
        submittedAt: new Date().toISOString(),
      };
      
      await browser.close();
      
      return {
        applicationResult: result,
        currentStep: "application_complete",
      };
    } else {
      console.log("[Node 5] ⚠️ Could not find submit button");
      
      const result: ApplicationResult = {
        status: "partial",
        message: "Form filled but submit button not found. Please submit manually.",
      };
      
      console.log("[Node 5] 🔍 Browser will stay open for 60 seconds for inspection...");
      await page.waitForTimeout(60000); // Wait 60 seconds for manual review
      await browser.close();
      
      return {
        applicationResult: result,
        currentStep: "application_complete",
      };
    }
    
  } catch (error: any) {
    console.error("[Node 5] Auto-apply error:", error.message);
    console.error("[Node 5] Full error:", error.stack);
    
    console.log("[Node 5] 🔍 Browser will stay open for 30 seconds to inspect error...");
    
    if (browser) {
      try {
        await browser.contexts()[0]?.pages()[0]?.waitForTimeout(30000);
      } catch (e) {
        // Ignore timeout errors
      }
      await browser.close();
    }
    
    const result: ApplicationResult = {
      status: "failed",
      message: `Auto-apply failed: ${error.message}`,
      errors: [error.message],
    };
    
    return {
      applicationResult: result,
      currentStep: "application_complete",
    };
  }
}

/**
 * Find and click the "Apply" button
 */
async function clickApplyButton(page: Page): Promise<boolean> {
  const applyButtonSelectors = [
    'button:has-text("Apply")',
    'a:has-text("Apply")',
    'button:has-text("Apply Now")',
    'a:has-text("Apply Now")',
    'button:has-text("Easy Apply")',
    'button[aria-label*="Apply"]',
    'a[aria-label*="Apply"]',
    '.apply-button',
    '#apply-button',
    '[data-test*="apply"]',
  ];
  
  for (const selector of applyButtonSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        const isVisible = await button.isVisible();
        if (isVisible) {
          await button.click();
          console.log(`[Node 5] Clicked apply button: ${selector}`);
          return true;
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  return false;
}

/**
 * Detect form fields on the page
 */
async function detectFormFields(page: Page): Promise<FormField[]> {
  const fields = await page.evaluate(() => {
    const detectedFields: any[] = [];
    
    // Find all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      // Skip hidden, disabled, or submit/button inputs
      if (element.type === 'hidden' || 
          element.type === 'submit' || 
          element.type === 'button' ||
          element.disabled ||
          !element.offsetParent) { // offsetParent is null for hidden elements
        return;
      }
      
      // Get label text
      let label = '';
      
      // Try to find label by 'for' attribute
      if (element.id) {
        const labelElement = document.querySelector(`label[for="${element.id}"]`);
        if (labelElement) {
          label = labelElement.textContent?.trim() || '';
        }
      }
      
      // Try parent label
      if (!label) {
        const parentLabel = element.closest('label');
        if (parentLabel) {
          label = parentLabel.textContent?.trim() || '';
        }
      }
      
      // Try aria-label
      if (!label && element.getAttribute('aria-label')) {
        label = element.getAttribute('aria-label') || '';
      }
      
      // Try placeholder
      if (!label && element.getAttribute('placeholder')) {
        label = element.getAttribute('placeholder') || '';
      }
      
      // Try name attribute
      if (!label && element.getAttribute('name')) {
        label = element.getAttribute('name') || '';
      }
      
      // Generate selector
      let selector = '';
      if (element.id) {
        selector = `#${element.id}`;
      } else if (element.name) {
        selector = `[name="${element.name}"]`;
      } else {
        // Use nth-of-type if no ID or name
        const tagName = element.tagName.toLowerCase();
        const index = Array.from(document.querySelectorAll(tagName)).indexOf(element);
        selector = `${tagName}:nth-of-type(${index + 1})`;
      }
      
      detectedFields.push({
        type: element.type || 'text',
        selector,
        label,
      });
    });
    
    return detectedFields;
  });
  
  return fields as FormField[];
}

/**
 * Map resume data to form fields using intelligent matching
 */
function mapResumeToFormFields(resume: any, fields: FormField[]): Record<string, string> {
  const mapped: Record<string, string> = {};
  
  fields.forEach((field) => {
    const labelLower = field.label.toLowerCase();
    
    // Name field
    if (labelLower.includes('name') || labelLower.includes('full name')) {
      if (labelLower.includes('first')) {
        mapped[field.selector] = resume.basics.name.split(' ')[0] || '';
      } else if (labelLower.includes('last')) {
        const parts = resume.basics.name.split(' ');
        mapped[field.selector] = parts[parts.length - 1] || '';
      } else {
        mapped[field.selector] = resume.basics.name;
      }
    }
    
    // Email field
    if (field.type === 'email' || labelLower.includes('email') || labelLower.includes('e-mail')) {
      mapped[field.selector] = resume.basics.contact?.email || resume.basics.email || '';
    }
    
    // Phone field
    if (field.type === 'tel' || labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('contact number')) {
      mapped[field.selector] = resume.basics.contact?.phone || resume.basics.phone || '';
    }
    
    // Location/Address field
    if (labelLower.includes('location') || labelLower.includes('city') || labelLower.includes('address')) {
      mapped[field.selector] = resume.basics.contact?.location || resume.basics.location || '';
    }
    
    // LinkedIn field
    if (labelLower.includes('linkedin') || labelLower.includes('profile url')) {
      const linkedinUrl = resume.basics.url?.href || resume.basics.url || '';
      if (linkedinUrl) {
        mapped[field.selector] = linkedinUrl;
      }
    }
    
    // Portfolio/Website field
    if (labelLower.includes('portfolio') || labelLower.includes('website') || labelLower.includes('github')) {
      const url = resume.basics.url?.href || resume.basics.url || '';
      if (url && !url.includes('linkedin')) {
        mapped[field.selector] = url;
      }
    }
    
    // Cover letter / Additional info
    if (labelLower.includes('cover letter') || labelLower.includes('why') || labelLower.includes('additional')) {
      mapped[field.selector] = resume.sections?.summary?.content || '';
    }
  });
  
  return mapped;
}

/**
 * Fill form fields with mapped data
 */
async function fillFormFields(page: Page, mappedData: Record<string, string>): Promise<void> {
  for (const [selector, value] of Object.entries(mappedData)) {
    if (!value) continue;
    
    try {
      const element = await page.$(selector);
      if (element) {
        // Clear existing value
        await element.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        
        // Type new value
        await element.type(value, { delay: 50 });
        
        console.log(`[Node 5] ✅ Filled field: ${selector.substring(0, 50)}`);
      }
    } catch (error: any) {
      console.warn(`[Node 5] ⚠️ Could not fill field ${selector}: ${error.message}`);
    }
  }
}

/**
 * Upload resume file
 */
async function uploadResume(page: Page, selector: string, filePath: string): Promise<void> {
  try {
    const fileInput = await page.$(selector);
    if (fileInput) {
      await fileInput.setInputFiles(filePath);
      console.log("[Node 5] ✅ Resume uploaded successfully");
      await page.waitForTimeout(1000); // Wait for upload to complete
    }
  } catch (error: any) {
    console.error(`[Node 5] ❌ Resume upload failed: ${error.message}`);
    throw error;
  }
}

/**
 * Find submit button
 */
async function findSubmitButton(page: Page): Promise<boolean> {
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Submit")',
    'button:has-text("Submit Application")',
    'button:has-text("Apply")',
    'button:has-text("Send")',
    'input[type="submit"]',
    '[data-test*="submit"]',
  ];
  
  for (const selector of submitSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        const isVisible = await button.isVisible();
        if (isVisible) {
          console.log(`[Node 5] Found submit button: ${selector}`);
          return true;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  return false;
}
