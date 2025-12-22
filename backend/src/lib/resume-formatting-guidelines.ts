/**
 * Resume Formatting Guidelines for PDF Generation
 * 
 * This file defines the strict formatting rules to ensure the tailored resume
 * fits properly in a PDF format with optimal ATS compatibility.
 * 
 * These guidelines are used by:
 * - Node 2 (ParseJDNode): To structure the output format expectations
 * - Node 3 (TailorResumeNode): To apply formatting rules during tailoring
 * - Node 4 (GeneratePDFNode): To render the final PDF with proper layout
 */

export const RESUME_FORMATTING_GUIDELINES = {
  /**
   * Overall Document Structure
   */
  document: {
    maxPages: 1,
    targetPages: 1,
    font: "Arial, Helvetica, sans-serif",
    fontSize: {
      name: 24,
      sectionHeading: 16,
      body: 11,
      contact: 10
    },
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40
    },
    lineSpacing: 1.2
  },

  /**
   * Header Section (Name & Contact)
   */
  header: {
    nameMaxLength: 50,
    contactFields: ["email", "phone", "location", "linkedin"],
    maxContactItems: 4
  },

  /**
   * Professional Summary Section
   */
  summary: {
    maxWords: 80,
    maxSentences: 3,
    targetWords: 60,
    mustInclude: ["job-relevant keywords", "experience level", "key strength"]
  },

  /**
   * Skills Section - CRITICAL FORMATTING
   * 
   * Group skills by category based on JD requirements and current skills.
   * Mix JD-required skills with candidate's current skills.
   * 
   * Example:
   * Frontend: React, Angular, TypeScript, Vue.js
   * Backend: Node.js, Python, Golang, Express
   * Database: MongoDB, PostgreSQL, Redis
   * DevOps: Docker, Kubernetes, AWS, CI/CD
   * Tools: Git, JIRA, Agile, REST APIs
   */
  skills: {
    maxCategories: 6,
    minCategories: 3,
    maxSkillsPerCategory: 6,
    minSkillsPerCategory: 2,
    categoryExamples: [
      "Frontend",
      "Backend", 
      "Database",
      "DevOps",
      "Cloud",
      "Tools & Frameworks",
      "Programming Languages",
      "Methodologies"
    ],
    format: "Category: Skill1, Skill2, Skill3 | Category2: SkillA, SkillB",
    instructions: `
1. Identify skills from JD (required + preferred)
2. Match with candidate's current skills
3. Group related skills into categories
4. Prioritize JD-required skills first in each category
5. Keep categories concise (2-6 skills each)
6. Use pipe separator | between categories for visual grouping
`
  },

  /**
   * Experience Section
   */
  experience: {
    maxJobs: 3,
    bulletsPerJob: {
      mostRecent: 4,
      others: 3
    },
    bulletMaxChars: 120,
    bulletFormat: "Start with action verb, include metrics if possible",
    dateFormat: "MMM YYYY - Present/MMM YYYY",
    mustInclude: ["action verb", "impact/result", "relevant technology"]
  },

  /**
   * Projects Section - CRITICAL FORMATTING
   * 
   * Each project MUST contain:
   * - Project name & brief description (1 line)
   * - Exactly 3 bullet points describing achievements/features
   * - One line for Project Link (URL)
   * 
   * Example:
   * E-Commerce Platform - Full-stack web application with payment integration
   * • Developed REST APIs using Node.js and Express, handling 10K+ daily requests
   * • Implemented React frontend with Redux state management and responsive design
   * • Integrated Stripe payment gateway with 99.9% transaction success rate
   * Link: https://github.com/username/project-name
   */
  projects: {
    maxProjects: 3,
    bulletsPerProject: 3, // STRICTLY 3 bullets
    projectNameMaxChars: 60,
    descriptionMaxChars: 100,
    bulletMaxChars: 120,
    linkFormat: "Link: [URL]",
    mustInclude: {
      name: true,
      description: true,
      bullets: 3, // EXACTLY 3
      link: true
    },
    bulletInstructions: `
Each project bullet MUST:
1. Start with an action verb (Developed, Implemented, Built, Designed)
2. Include specific technologies used
3. Include measurable impact or outcome where possible
4. Be concise (max 120 chars)
`,
    exampleFormat: `
Project Name - Brief one-line description
• First achievement/feature with tech stack and impact
• Second achievement/feature with tech stack and impact  
• Third achievement/feature with tech stack and impact
Link: https://github.com/username/project
`
  },

  /**
   * Education Section
   */
  education: {
    maxEntries: 2,
    format: "Degree, University Name (Year)",
    includeGPA: false, // Only if > 3.5
    maxCharsPerEntry: 80
  },

  /**
   * Certifications Section
   */
  certifications: {
    maxEntries: 4,
    format: "Certification Name - Issuing Organization (Year)",
    prioritize: "JD-relevant certifications first"
  },

  /**
   * Section Order Priority
   * Based on JD relevance
   */
  sectionOrder: [
    "header",      // Name & Contact
    "summary",     // Professional Summary
    "skills",      // Technical Skills (grouped)
    "experience",  // Work Experience
    "projects",    // Projects (if relevant to JD)
    "education",   // Education
    "certifications" // Certifications (if relevant)
  ],

  /**
   * Content Balancing Rules
   */
  balancing: {
    experienceToProjectsRatio: "70:30", // If both present
    skillsSectionMaxLines: 4,
    summaryMaxLines: 3,
    totalSectionsMax: 7,
    instructions: `
1. Prioritize most JD-relevant sections
2. If resume is too long, reduce:
   - Older job experiences
   - Less relevant projects
   - Generic skills
3. Ensure no section overwhelms the page
4. Maintain visual balance and white space
`
  },

  /**
   * ATS Optimization Rules
   */
  ats: {
    useStandardSectionHeadings: true,
    avoidTables: true,
    avoidGraphics: true,
    avoidHeadersFooters: true,
    useStandardFonts: true,
    standardHeadings: [
      "PROFESSIONAL SUMMARY",
      "TECHNICAL SKILLS", 
      "EXPERIENCE",
      "PROJECTS",
      "EDUCATION",
      "CERTIFICATIONS"
    ]
  }
};

/**
 * Helper function to get formatting instruction for AI prompts
 */
export function getFormattingInstructions(): string {
  return `
RESUME FORMATTING REQUIREMENTS (STRICT):

1. SKILLS SECTION:
   - Group skills by category (Frontend, Backend, Database, DevOps, Tools, etc.)
   - Format: "Frontend: React, Angular, TypeScript | Backend: Node.js, Python, Golang"
   - Mix JD-required skills with candidate's current skills
   - Use 3-6 categories, with 2-6 skills each
   - Prioritize JD skills first in each group

2. PROJECTS SECTION (CRITICAL):
   Each project MUST have:
   - Project name and one-line description (max 100 chars)
   - EXACTLY 3 bullet points (no more, no less)
   - One line for project link: "Link: [URL]"
   
   Example:
   E-Commerce Platform - Full-stack web app with payment integration
   • Developed REST APIs using Node.js, handling 10K+ daily requests
   • Implemented React frontend with Redux and responsive design
   • Integrated Stripe payment with 99.9% transaction success
   Link: https://github.com/user/project

3. EXPERIENCE SECTION:
   - Maximum 3 jobs
   - Most recent: 4 bullets, others: 3 bullets
   - Each bullet max 120 characters
   - Start with action verbs, include metrics

4. SUMMARY SECTION:
   - Maximum 3 sentences (60-80 words)
   - Include job-relevant keywords
   - Highlight matching experience level

5. DOCUMENT LIMITS:
   - Target: 1 page
   - All sections must fit within standard PDF margins
   - Balance content across sections (no section overwhelms the page)

6. SECTION ORDER:
   Header → Summary → Skills → Experience → Projects → Education → Certifications
`;
}

/**
 * Validation function to check if resume follows guidelines
 */
export function validateResumeFormat(resume: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate Projects section
  if (resume.sections?.projects?.items) {
    const projects = resume.sections.projects.items;
    
    if (projects.length > RESUME_FORMATTING_GUIDELINES.projects.maxProjects) {
      errors.push(`Too many projects: ${projects.length}. Maximum allowed: ${RESUME_FORMATTING_GUIDELINES.projects.maxProjects}`);
    }

    projects.forEach((project: any, index: number) => {
      if (!project.highlights || project.highlights.length !== RESUME_FORMATTING_GUIDELINES.projects.bulletsPerProject) {
        errors.push(`Project ${index + 1} must have exactly ${RESUME_FORMATTING_GUIDELINES.projects.bulletsPerProject} bullet points, found ${project.highlights?.length || 0}`);
      }

      if (!project.url) {
        errors.push(`Project ${index + 1} missing link/URL`);
      }
    });
  }

  // Validate Skills section
  if (resume.sections?.skills?.items) {
    const categories = resume.sections.skills.items.length;
    if (categories > RESUME_FORMATTING_GUIDELINES.skills.maxCategories) {
      errors.push(`Too many skill categories: ${categories}. Maximum: ${RESUME_FORMATTING_GUIDELINES.skills.maxCategories}`);
    }
  }

  // Validate Experience section
  if (resume.sections?.experience?.items) {
    const jobs = resume.sections.experience.items.length;
    if (jobs > RESUME_FORMATTING_GUIDELINES.experience.maxJobs) {
      errors.push(`Too many jobs: ${jobs}. Maximum: ${RESUME_FORMATTING_GUIDELINES.experience.maxJobs}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default RESUME_FORMATTING_GUIDELINES;
