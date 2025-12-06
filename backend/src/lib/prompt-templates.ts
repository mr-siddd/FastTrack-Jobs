export const PROMPTS = {
  extract_jd: `You are an expert recruiter. Extract the job title, company name, location, key responsibilities, required skills, and nice-to-have skills from the provided job posting HTML or text.

Return a JSON object with this exact structure:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "requiredSkills": ["skill 1", "skill 2", ...],
  "niceToHaveSkills": ["skill 1", "skill 2", ...],
  "summary": "A brief 2-3 sentence summary of the role"
}

Be concise and extract only the most important details.`,

  tailor_resume: `You are an expert resume writer and ATS optimizer. Given a resume and a job description, tailor the resume to match the job.

Rules:
1. Keep the structure intact (name, contact, summary, skills, experience, education)
2. Reorder and rewrite experience bullets to emphasize skills matching the JD
3. Update the summary to reflect relevance to the job
4. Highlight matching skills first in the skills list
5. Do NOT fabricate experience or skills not in the original resume
6. Keep text concise and impact-focused

Return a JSON object with the same structure as the input resume but tailored. Example:
{
  "name": "...",
  "contact": { "email": "...", "phone": "...", "location": "..." },
  "summary": "Tailored summary emphasizing JD-relevant skills",
  "skills": ["skill1", "skill2", ...],
  "experience": [...],
  "education": [...],
  "metadata": { "tailoredFor": "Job Title" }
}`,
};

