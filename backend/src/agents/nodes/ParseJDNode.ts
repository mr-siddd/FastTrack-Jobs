import type { JobApplicationState, StructuredJD } from "../../state/JobApplicationState";
import { addError } from "../../state/JobApplicationState";
import { createAIProvider } from "../../services/ai/AIProviderFactory";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getFormattingInstructions } from "../../lib/resume-formatting-guidelines";

// Storage directory for parsed JDs
const STORAGE_DIR = process.env.APP_STORAGE_DIR || join(process.env.HOME || process.env.USERPROFILE || '.', '.fasttrack', 'parsed_jds');

/**
 * Node 2: Parse Job Description with AI
 * 
 * Responsibilities:
 * - Take raw job description text from Node 1
 * - Use AI to structure and extract key information
 * - Identify: title, company, requirements, skills, responsibilities
 * - Extract keywords for resume tailoring
 * 
 * Input: state.extractedJD.rawText
 * Output: state.structuredJD
 */

// Zod schema for AI structured output
const structuredJDOutputSchema = z.object({
  title: z.string().describe("Job title/position"),
  company: z.string().describe("Company name"),
  location: z.string().optional().describe("Job location"),
  salary: z.string().optional().describe("Salary range if mentioned"),
  jobType: z.string().optional().describe("Employment type: Full-time, Part-time, Contract, etc."),
  experienceLevel: z.string().optional().describe("Experience level: Entry, Mid, Senior, Lead, etc."),
  
  requirements: z.array(z.string()).describe("List of job requirements"),
  responsibilities: z.array(z.string()).describe("List of job responsibilities"),
  qualifications: z.array(z.string()).describe("Required qualifications and education"),
  
  requiredSkills: z.array(z.string()).describe("Must-have technical and soft skills"),
  preferredSkills: z.array(z.string()).describe("Nice-to-have skills"),
  
  benefits: z.array(z.string()).optional().describe("Benefits and perks mentioned"),
  description: z.string().describe("Overall job description summary"),
  keywords: z.array(z.string()).describe("Important keywords for ATS matching"),
});

// Create output parser
const parser = StructuredOutputParser.fromZodSchema(structuredJDOutputSchema);

// Prompt template
const parseJDPrompt = PromptTemplate.fromTemplate(`
You are an expert job description analyzer. Extract and structure the following job posting.

JOB POSTING:
{jobText}

INSTRUCTIONS:
1. Extract the job title, company, and location
2. Identify all requirements and qualifications
3. List responsibilities and duties
4. Separate required vs preferred skills
5. Extract benefits if mentioned
6. Identify keywords that would appear in an ATS (Applicant Tracking System)
7. Be thorough - include everything relevant

IMPORTANT - RESUME FORMATTING CONTEXT:
The parsed information will be used to tailor a resume that follows strict formatting guidelines.
{formattingInstructions}

When extracting skills, think about how they will be grouped in the resume:
- Frontend skills (React, Angular, Vue, etc.)
- Backend skills (Node.js, Python, Java, etc.)  
- Database skills (MongoDB, PostgreSQL, etc.)
- DevOps/Cloud skills (Docker, AWS, Kubernetes, etc.)
- Tools & Methodologies (Git, Agile, etc.)

{format_instructions}

OUTPUT (JSON only):
`);

export async function parseJDNode(
  state: JobApplicationState
): Promise<Partial<JobApplicationState>> {
  console.log("[Node 2] Starting job description parsing with AI");
  
  // Validate input
  if (!state.extractedJD) {
    const newState = addError(
      state,
      "parse_jd",
      "No extracted job description found. Node 1 must run first."
    );
    return {
      ...newState,
      currentStep: "failed",
    };
  }

  try {
    // Create AI provider (auto-selects Gemini if available for free tier)
    const aiProvider = state.options?.aiProvider || "auto";
    const llm = createAIProvider(aiProvider, 0.3); // Lower temperature for structured output
    
    console.log(`[Node 2] Using AI provider: ${aiProvider}`);
    
    // Format the prompt with formatting instructions
    const formatInstructions = parser.getFormatInstructions();
    const formattingInstructions = getFormattingInstructions();
    
    const prompt = await parseJDPrompt.format({
      jobText: state.extractedJD.rawText,
      format_instructions: formatInstructions,
      formattingInstructions: formattingInstructions,
    });
    
    console.log("[Node 2] Sending to AI for parsing...");
    
    // Call AI
    const response = await llm.invoke(prompt);
    const content = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);
    
    console.log("[Node 2] Received AI response, parsing...");
    
    // Parse structured output
    const structuredJD = await parser.parse(content) as StructuredJD;
    
    console.log(`[Node 2] Successfully parsed job description`);
    console.log(`[Node 2] Title: ${structuredJD.title}`);
    console.log(`[Node 2] Company: ${structuredJD.company}`);
    console.log(`[Node 2] Required skills: ${structuredJD.requiredSkills.length}`);
    console.log(`[Node 2] Requirements: ${structuredJD.requirements.length}`);
    
    // Save parsed JD to file
    try {
      mkdirSync(STORAGE_DIR, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitize = (str: string | undefined) => (str || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const filename = `Parsed_JD_${sanitize(structuredJD.company)}_${sanitize(structuredJD.title)}_${timestamp}.json`;
      const filepath = join(STORAGE_DIR, filename);
      
      writeFileSync(filepath, JSON.stringify(structuredJD, null, 2), 'utf-8');
      console.log(`[Node 2] ✅ Saved parsed JD to: ${filepath}`);
    } catch (fileError: any) {
      console.warn(`[Node 2] ⚠️ Failed to save parsed JD to file:`, fileError.message);
      // Continue processing even if file save fails
    }
    
    return {
      structuredJD,
      currentStep: "jd_parsed",
    };
    
  } catch (error: any) {
    console.error("[Node 2] Parsing failed:", error.message);
    
    // Try fallback parsing without structured output
    try {
      console.log("[Node 2] Attempting fallback parsing...");
      const fallbackResult = await fallbackParse(state, state.options?.aiProvider || "auto");
      
      return {
        structuredJD: fallbackResult,
        currentStep: "jd_parsed",
      };
    } catch (fallbackError: any) {
      console.error("[Node 2] Fallback parsing also failed:", fallbackError.message);
      
      const newState = addError(
        state,
        "parse_jd",
        `Failed to parse job description: ${error.message}`
      );
      
      return {
        ...newState,
        currentStep: "failed",
      };
    }
  }
}

/**
 * Fallback parsing without structured output
 * Uses simple prompt and manual JSON extraction
 */
async function fallbackParse(
  state: JobApplicationState,
  aiProvider: string
): Promise<StructuredJD> {
  const llm = createAIProvider(aiProvider as any, 0.3);
  
  const fallbackPrompt = `
Analyze this job posting and return ONLY a JSON object with this structure:
{
  "title": "job title",
  "company": "company name",
  "location": "location or null",
  "requiredSkills": ["skill1", "skill2"],
  "requirements": ["req1", "req2"],
  "responsibilities": ["resp1", "resp2"],
  "description": "brief summary",
  "keywords": ["keyword1", "keyword2"]
}

JOB POSTING:
${state.extractedJD!.rawText}

JSON:
`;

  const response = await llm.invoke(fallbackPrompt);
  const content = typeof response.content === "string" 
    ? response.content 
    : JSON.stringify(response.content);
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from AI response");
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Fill in missing fields with defaults
  return {
    title: parsed.title || state.extractedJD?.title || "Unknown Position",
    company: parsed.company || state.extractedJD?.company || "Unknown Company",
    location: parsed.location || undefined,
    salary: undefined,
    jobType: undefined,
    experienceLevel: undefined,
    requirements: parsed.requirements || [],
    responsibilities: parsed.responsibilities || [],
    qualifications: parsed.qualifications || [],
    requiredSkills: parsed.requiredSkills || [],
    preferredSkills: parsed.preferredSkills || [],
    benefits: parsed.benefits || undefined,
    description: parsed.description || state.extractedJD!.rawText.substring(0, 500),
    keywords: parsed.keywords || [],
  };
}
