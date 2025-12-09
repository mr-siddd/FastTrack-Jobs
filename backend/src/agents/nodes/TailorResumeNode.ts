import type { JobApplicationState } from "../../state/JobApplicationState";
import { addError } from "../../state/JobApplicationState";
import { createAIProvider } from "../../services/ai/AIProviderFactory";
import type { ResumeData } from "../../services/resume/ResumeSchema";

/**
 * Node 3: Tailor Resume to Job Description
 * 
 * Responsibilities:
 * - Take user's resume and parsed job description
 * - Use AI to customize resume for this specific job
 * - Adjust summary, highlight relevant skills and experience
 * - Reorder sections to emphasize job-relevant content
 * - Maintain resume structure and formatting
 * 
 * Input: state.userResume, state.structuredJD
 * Output: state.tailoredResume
 */

export async function tailorResumeNode(
  state: JobApplicationState
): Promise<Partial<JobApplicationState>> {
  console.log("[Node 3] Starting resume tailoring");
  
  // Validate inputs
  if (!state.structuredJD) {
    const newState = addError(
      state,
      "tailor_resume",
      "No structured job description found. Node 2 must run first."
    );
    return {
      ...newState,
      currentStep: "failed",
    };
  }

  try {
    const aiProvider = state.options?.aiProvider || "auto";
    const llm = createAIProvider(aiProvider, 0.7); // Higher temperature for creative tailoring
    
    console.log(`[Node 3] Tailoring resume for: ${state.structuredJD.title} at ${state.structuredJD.company}`);
    
    // Build tailoring prompt
    const prompt = buildTailoringPrompt(state.userResume, state.structuredJD);
    
    console.log("[Node 3] Sending to AI for tailoring...");
    
    // Call AI
    const response = await llm.invoke(prompt);
    const content = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);
    
    console.log("[Node 3] Received AI response, parsing tailored resume...");
    
    // Parse AI response to get tailored resume
    const tailoredResume = parseTailoredResume(content, state.userResume);
    
    console.log("[Node 3] Successfully tailored resume");
    console.log(`[Node 3] Updated summary: ${tailoredResume.sections.summary.content.substring(0, 100)}...`);
    
    return {
      tailoredResume,
      currentStep: "resume_tailored",
    };
    
  } catch (error: any) {
    console.error("[Node 3] Resume tailoring failed:", error.message);
    
    const newState = addError(
      state,
      "tailor_resume",
      `Failed to tailor resume: ${error.message}`
    );
    
    return {
      ...newState,
      currentStep: "failed",
    };
  }
}

/**
 * Build prompt for resume tailoring
 */
function buildTailoringPrompt(resume: ResumeData, jobDesc: any): string {
  const { title, company, requiredSkills, requirements, responsibilities, keywords } = jobDesc;
  
  return `
You are an expert resume writer and career coach. Your task is to tailor a resume for a specific job application while maintaining authenticity and truthfulness.

JOB DETAILS:
- Position: ${title}
- Company: ${company}
- Required Skills: ${requiredSkills.join(", ")}
- Key Requirements: ${requirements.slice(0, 5).join("; ")}
- Responsibilities: ${responsibilities.slice(0, 5).join("; ")}
- Keywords for ATS: ${keywords.join(", ")}

CURRENT RESUME:
Name: ${resume.basics.name}
Headline: ${resume.basics.headline}
Summary: ${resume.sections.summary.content}

Experience:
${resume.sections.experience.items.map(exp => `
- ${exp.position} at ${exp.company} (${exp.date})
  ${exp.summary}
`).join('\n')}

Skills:
${resume.sections.skills.items.map(s => `- ${s.name} (${s.description})`).join('\n')}

TAILORING INSTRUCTIONS:
1. **Update Professional Summary**: Rewrite to emphasize skills and experience relevant to this job
2. **Highlight Matching Skills**: Emphasize the required skills the candidate has
3. **Reframe Experience**: Adjust bullet points to highlight job-relevant achievements
4. **Add Keywords**: Naturally incorporate job keywords for ATS optimization
5. **Maintain Honesty**: DO NOT add skills or experience the candidate doesn't have
6. **Keep Structure**: Return the EXACT same JSON structure as the input resume

IMPORTANT: Return a complete resume JSON object with this structure:
{
  "basics": { "name": "...", "headline": "...", "email": "...", ... },
  "sections": {
    "summary": { "content": "tailored summary here" },
    "experience": { "items": [ ... ] },
    "skills": { "items": [ ... ] },
    ...
  },
  "metadata": { ... }
}

Focus on:
- Making the summary compelling for this specific role
- Highlighting relevant experience and achievements
- Emphasizing matching skills
- Using job-specific keywords naturally

Return ONLY the JSON object, no explanation.

TAILORED RESUME JSON:
`;
}

/**
 * Parse AI response and extract tailored resume
 */
function parseTailoredResume(aiResponse: string, originalResume: ResumeData): ResumeData {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and merge with original resume to ensure structure
    const tailored: ResumeData = {
      ...originalResume,
      
      // Update basics if provided
      basics: {
        ...originalResume.basics,
        headline: parsed.basics?.headline || originalResume.basics.headline,
      },
      
      // Update summary (most important for tailoring)
      sections: {
        ...originalResume.sections,
        summary: {
          ...originalResume.sections.summary,
          content: parsed.sections?.summary?.content || originalResume.sections.summary.content,
        },
        
        // Update experience if AI provided improvements
        experience: {
          ...originalResume.sections.experience,
          items: parsed.sections?.experience?.items || originalResume.sections.experience.items,
        },
        
        // Update skills ordering if AI reordered them
        skills: {
          ...originalResume.sections.skills,
          items: parsed.sections?.skills?.items || originalResume.sections.skills.items,
        },
      },
      
      // Keep metadata unchanged (formatting stays the same)
      metadata: originalResume.metadata,
    };
    
    return tailored;
    
  } catch (error) {
    console.error("[Node 3] Failed to parse AI response, using fallback tailoring");
    
    // Fallback: Just update the summary with a simple template
    return {
      ...originalResume,
      sections: {
        ...originalResume.sections,
        summary: {
          ...originalResume.sections.summary,
          content: `${originalResume.basics.headline} with proven expertise in ${originalResume.sections.skills.items.slice(0, 3).map(s => s.name).join(", ")}. ${originalResume.sections.summary.content}`,
        },
      },
    };
  }
}
