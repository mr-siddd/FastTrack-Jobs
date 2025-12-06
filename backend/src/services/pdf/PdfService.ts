import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

const STORAGE_DIR = process.env.APP_STORAGE_DIR || join(process.env.HOME || process.env.USERPROFILE || '.', '.fasttrack');

export default class PdfService {
  static async generatePdfForResume(resumeJson: any, jobTitle?: string, company?: string): Promise<string> {
    try {
      mkdirSync(STORAGE_DIR, { recursive: true });
    } catch (e) {
      // ignore
    }

    const safe = (s: string) => String(s || '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    const name = safe(resumeJson?.name || 'resume');
    const title = safe(jobTitle || '');
    const companyName = safe(company || '');
    const base = [name, title, companyName].filter(Boolean).join('_') || name || 'resume';
    const fileName = `${base}.pdf`;
    const filePath = join(STORAGE_DIR, fileName);

    // Generate HTML resume and convert to PDF using Playwright
    const html = this.generateResumeHtml(resumeJson, jobTitle, company);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
    await browser.close();

    return filePath;
  }

  private static generateResumeHtml(resumeJson: any, jobTitle?: string, company?: string): string {
    const name = resumeJson?.name || 'Your Name';
    const email = resumeJson?.contact?.email || '';
    const phone = resumeJson?.contact?.phone || '';
    const summary = resumeJson?.summary || '';
    const skills = resumeJson?.skills || [];
    const experience = resumeJson?.experience || [];
    const education = resumeJson?.education || [];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"UTF-8\">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { margin-bottom: 5px; }
    .contact { color: #666; margin-bottom: 20px; }
    .section { margin-top: 20px; }
    .section h2 { border-bottom: 2px solid #5a7c6c; padding-bottom: 5px; }
    ul { margin: 5px 0; }
    .job { margin-bottom: 15px; }
    .job-title { font-weight: bold; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <div class=\"contact\">${email}${phone ? ' | ' + phone : ''}</div>
  ${jobTitle ? `<div><strong>Applying for:</strong> ${jobTitle}${company ? ' at ' + company : ''}</div>` : ''}
  
  ${summary ? `<div class=\"section\"><h2>Summary</h2><p>${summary}</p></div>` : ''}
  
  ${skills.length > 0 ? `<div class=\"section\"><h2>Skills</h2><p>${skills.join(', ')}</p></div>` : ''}
  
  ${experience.length > 0 ? `
    <div class=\"section\">
      <h2>Experience</h2>
      ${experience.map((exp: any) => `
        <div class=\"job\">
          <div class=\"job-title\">${exp.title || ''} at ${exp.company || ''}</div>
          <div>${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          <ul>${(exp.bullets || []).map((b: string) => `<li>${b}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>
  ` : ''}
  
  ${education.length > 0 ? `
    <div class=\"section\">
      <h2>Education</h2>
      ${education.map((edu: any) => `<div>${edu.degree || ''}, ${edu.school || ''} (${edu.year || ''})</div>`).join('')}
    </div>
  ` : ''}
</body>
</html>
    `;
  }
}
