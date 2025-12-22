import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';
import type { ResumeData } from '../resume/ResumeSchema';
import RESUME_FORMATTING_GUIDELINES from '../../lib/resume-formatting-guidelines';

// Store PDFs in Downloads folder
const DOWNLOADS_DIR = join(process.env.USERPROFILE || process.env.HOME || '.', 'Downloads', 'FastTrackResumes');
const STORAGE_DIR = process.env.APP_STORAGE_DIR || DOWNLOADS_DIR;

export default class PdfService {
  static async generatePdfForResume(resumeData: ResumeData, jobTitle?: string, company?: string): Promise<string> {
    try {
      mkdirSync(STORAGE_DIR, { recursive: true });
    } catch (e) {
      // ignore
    }

    const safe = (s: string) => String(s || '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    const name = safe(resumeData.basics.name || 'resume');
    const title = safe(jobTitle || '');
    const companyName = safe(company || '');
    const base = [name, title, companyName].filter(Boolean).join('_') || name || 'resume';
    const fileName = `${base}.pdf`;
    const filePath = join(STORAGE_DIR, fileName);

    // Generate HTML resume and convert to PDF using Playwright
    const html = this.generateResumeHtml(resumeData, jobTitle, company);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ 
      path: filePath, 
      format: 'A4', 
      printBackground: true,
      margin: {
        top: '40px',
        bottom: '40px',
        left: '40px',
        right: '40px'
      }
    });
    await browser.close();

    console.log(`[PdfService] ✅ PDF saved to: ${filePath}`);
    console.log(`[PdfService] 📂 Open folder: ${STORAGE_DIR}`);

    return filePath;
  }

  private static generateResumeHtml(resume: ResumeData, jobTitle?: string, company?: string): string {
    const { basics, sections } = resume;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: ${RESUME_FORMATTING_GUIDELINES.document.font};
      font-size: ${RESUME_FORMATTING_GUIDELINES.document.fontSize.body}pt;
      line-height: ${RESUME_FORMATTING_GUIDELINES.document.lineSpacing};
      color: #333;
      padding: 20px;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 15px;
    }
    
    .header h1 {
      font-size: ${RESUME_FORMATTING_GUIDELINES.document.fontSize.name}pt;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    
    .header .headline {
      font-size: 13pt;
      color: #555;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .header .contact {
      font-size: ${RESUME_FORMATTING_GUIDELINES.document.fontSize.contact}pt;
      color: #666;
    }
    
    .header .contact a {
      color: #2980b9;
      text-decoration: none;
    }
    
    /* Section headings */
    .section {
      margin-top: 18px;
      margin-bottom: 12px;
    }
    
    .section-title {
      font-size: ${RESUME_FORMATTING_GUIDELINES.document.fontSize.sectionHeading}pt;
      color: #2c3e50;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 4px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    
    /* Summary */
    .summary-content {
      text-align: justify;
      line-height: 1.4;
    }
    
    /* Skills - Grouped format */
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }
    
    .skill-category {
      display: flex;
      gap: 8px;
    }
    
    .skill-category-name {
      font-weight: bold;
      color: #2c3e50;
      min-width: 120px;
      flex-shrink: 0;
    }
    
    .skill-category-items {
      color: #555;
    }
    
    /* Experience */
    .experience-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    
    .experience-title {
      font-weight: bold;
      color: #2c3e50;
      font-size: 12pt;
    }
    
    .experience-company {
      color: #555;
      font-style: italic;
    }
    
    .experience-date {
      color: #666;
      font-size: 10pt;
    }
    
    .experience-bullets {
      margin-left: 20px;
      margin-top: 6px;
    }
    
    .experience-bullets li {
      margin-bottom: 3px;
      line-height: 1.3;
    }
    
    /* Projects */
    .project-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    
    .project-header {
      font-weight: bold;
      color: #2c3e50;
      font-size: 12pt;
      margin-bottom: 3px;
    }
    
    .project-summary {
      color: #555;
      font-style: italic;
      margin-bottom: 4px;
    }
    
    .project-bullets {
      margin-left: 20px;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    
    .project-bullets li {
      margin-bottom: 3px;
      line-height: 1.3;
    }
    
    .project-link {
      color: #2980b9;
      font-size: 10pt;
      word-break: break-all;
    }
    
    .project-link a {
      color: #2980b9;
      text-decoration: none;
    }
    
    /* Education */
    .education-item {
      margin-bottom: 8px;
    }
    
    .education-degree {
      font-weight: bold;
      color: #2c3e50;
    }
    
    .education-school {
      color: #555;
    }
    
    /* Certifications */
    .certification-item {
      margin-bottom: 6px;
      display: flex;
      gap: 8px;
    }
    
    .certification-name {
      font-weight: bold;
      color: #2c3e50;
    }
    
    .certification-issuer {
      color: #555;
    }
    
    /* Utilities */
    ul {
      list-style-type: disc;
    }
    
    .applying-for {
      text-align: center;
      color: #2980b9;
      font-weight: 500;
      margin-bottom: 15px;
      padding: 8px;
      background: #ecf0f1;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  ${this.renderHeader(basics)}
  
  ${jobTitle ? `<div class="applying-for">Applying for: <strong>${jobTitle}${company ? ' at ' + company : ''}</strong></div>` : ''}
  
  ${this.renderSummary(sections.summary)}
  
  ${this.renderSkills(sections.skills)}
  
  ${this.renderExperience(sections.experience)}
  
  ${this.renderProjects(sections.projects)}
  
  ${this.renderEducation(sections.education)}
  
  ${this.renderCertifications(sections.certifications)}
</body>
</html>
    `;
  }

  private static renderHeader(basics: any): string {
    const contact = basics.contact || {};
    
    // Handle url object with label and href properties
    const urlHref = basics.url?.href || basics.url;
    const linkedinUrl = urlHref && typeof urlHref === 'string' && urlHref.includes('linkedin') ? urlHref : null;
    
    const contactParts = [
      contact.email,
      contact.phone,
      contact.location,
      linkedinUrl
    ].filter(Boolean);

    return `
    <div class="header">
      <h1>${basics.name || 'Your Name'}</h1>
      ${basics.headline ? `<div class="headline">${basics.headline}</div>` : ''}
      <div class="contact">
        ${contactParts.join(' | ')}
      </div>
    </div>
    `;
  }

  private static renderSummary(summary: any): string {
    if (!summary?.content) return '';
    
    return `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary-content">${summary.content}</div>
    </div>
    `;
  }

  private static renderSkills(skills: any): string {
    if (!skills?.items || skills.items.length === 0) return '';
    
    // Skills are grouped by category
    const skillsHtml = skills.items.map((skill: any) => `
      <div class="skill-category">
        <span class="skill-category-name">${skill.name}:</span>
        <span class="skill-category-items">${skill.description || skill.keywords?.join(', ') || ''}</span>
      </div>
    `).join('');

    return `
    <div class="section">
      <div class="section-title">Technical Skills</div>
      <div class="skills-grid">
        ${skillsHtml}
      </div>
    </div>
    `;
  }

  private static renderExperience(experience: any): string {
    if (!experience?.items || experience.items.length === 0) return '';
    
    const experienceHtml = experience.items.slice(0, RESUME_FORMATTING_GUIDELINES.experience.maxJobs).map((exp: any) => `
      <div class="experience-item">
        <div class="experience-header">
          <div>
            <span class="experience-title">${exp.position || exp.title || ''}</span>
            <span class="experience-company"> at ${exp.company || ''}</span>
          </div>
          <div class="experience-date">${exp.date || exp.startDate || ''}</div>
        </div>
        ${exp.summary ? `<div style="margin-bottom: 4px; color: #555;">${exp.summary}</div>` : ''}
        ${exp.highlights && exp.highlights.length > 0 ? `
          <ul class="experience-bullets">
            ${exp.highlights.map((h: string) => `<li>${h}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');

    return `
    <div class="section">
      <div class="section-title">Experience</div>
      ${experienceHtml}
    </div>
    `;
  }

  private static renderProjects(projects: any): string {
    if (!projects?.items || projects.items.length === 0) return '';
    
    const projectsHtml = projects.items.slice(0, RESUME_FORMATTING_GUIDELINES.projects.maxProjects).map((project: any) => {
      const projectUrl = project.url?.href || project.url || '';
      return `
      <div class="project-item">
        <div class="project-header">${project.name || ''}</div>
        ${project.summary ? `<div class="project-summary">${project.summary}</div>` : ''}
        ${project.highlights && project.highlights.length > 0 ? `
          <ul class="project-bullets">
            ${project.highlights.slice(0, RESUME_FORMATTING_GUIDELINES.projects.bulletsPerProject).map((h: string) => `<li>${h}</li>`).join('')}
          </ul>
        ` : ''}
        ${projectUrl ? `<div class="project-link">Link: <a href="${projectUrl}">${projectUrl}</a></div>` : ''}
      </div>
      `;
    }).join('');

    return `
    <div class="section">
      <div class="section-title">Projects</div>
      ${projectsHtml}
    </div>
    `;
  }

  private static renderEducation(education: any): string {
    if (!education?.items || education.items.length === 0) return '';
    
    const educationHtml = education.items.slice(0, RESUME_FORMATTING_GUIDELINES.education.maxEntries).map((edu: any) => `
      <div class="education-item">
        <span class="education-degree">${edu.studyType || 'Degree'} in ${edu.area || 'Field'}</span>
        <span class="education-school"> - ${edu.institution || ''}</span>
        ${edu.date ? ` <span style="color: #666;">(${edu.date})</span>` : ''}
      </div>
    `).join('');

    return `
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHtml}
    </div>
    `;
  }

  private static renderCertifications(certifications: any): string {
    if (!certifications?.items || certifications.items.length === 0) return '';
    
    const certificationsHtml = certifications.items.slice(0, RESUME_FORMATTING_GUIDELINES.certifications.maxEntries).map((cert: any) => `
      <div class="certification-item">
        <span class="certification-name">${cert.name || ''}</span>
        <span class="certification-issuer"> - ${cert.issuer || ''}${cert.date ? ` (${cert.date})` : ''}</span>
      </div>
    `).join('');

    return `
    <div class="section">
      <div class="section-title">Certifications</div>
      ${certificationsHtml}
    </div>
    `;
  }
}

