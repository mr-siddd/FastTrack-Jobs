import { z } from "zod";
import { resumeDataSchema, type ResumeData } from "../services/resume/ResumeSchema";

/**
 * Job Application State Schema
 * 
 * This represents the complete state that flows through the LangGraph agent.
 * Each node reads from and writes to this state, maintaining a clear data flow.
 * 
 * State Flow:
 * Input → Node 1 → Node 2 → Node 3 → Node 4 → Node 5 → Output
 */

// Node 1 Output: Extracted Job Description
export const extractedJDSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  company: z.string().optional(),
  rawText: z.string(),
  rawHTML: z.string().optional(),
  extractedAt: z.string().datetime(),
});

// Node 2 Output: Parsed/Structured Job Description
export const structuredJDSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobType: z.string().optional(), // Full-time, Part-time, Contract, etc.
  experienceLevel: z.string().optional(), // Entry, Mid, Senior, etc.
  
  // Core requirements
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  
  // Skills breakdown
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  
  // Additional info
  benefits: z.array(z.string()).optional(),
  description: z.string(),
  
  // Matching metadata
  keywords: z.array(z.string()),
});

// Node 4 Output: Generated PDF Info
export const pdfInfoSchema = z.object({
  filename: z.string(),
  filepath: z.string(),
  size: z.number(),
  generatedAt: z.string().datetime(),
});

// Node 5 Output: Application Result
export const applicationResultSchema = z.object({
  status: z.enum(["pending", "submitted", "failed", "skipped", "ready_to_submit", "partial"]),
  message: z.string(),
  submittedAt: z.string().datetime().optional(),
  confirmationId: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

/**
 * Complete Job Application State
 * 
 * This is the single source of truth that flows through all nodes.
 * Each node updates specific parts of this state.
 */
export const jobApplicationStateSchema = z.object({
  // Input (provided by user)
  jobUrl: z.string().url(),
  userResume: resumeDataSchema,
  
  // Node 1: Extract JD
  extractedJD: extractedJDSchema.optional(),
  
  // Node 2: Parse JD
  structuredJD: structuredJDSchema.optional(),
  
  // Node 3: Tailor Resume
  tailoredResume: resumeDataSchema.optional(),
  
  // Node 4: Generate PDF
  pdfInfo: pdfInfoSchema.optional(),
  
  // Node 5: Auto-apply
  applicationResult: applicationResultSchema.optional(),
  
  // Control flow and error handling
  currentStep: z.enum([
    "initialized",
    "extracting_jd",
    "jd_extracted",
    "parsing_jd",
    "jd_parsed",
    "tailoring_resume",
    "resume_tailored",
    "generating_pdf",
    "pdf_generated",
    "applying",
    "application_complete",
    "failed",
  ]).default("initialized"),
  
  errors: z.array(z.object({
    step: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
  })).default([]),
  
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  
  // Execution metadata
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  
  // Options
  options: z.object({
    autoApply: z.boolean().default(true),
    generatePDF: z.boolean().default(true),
    //aiProvider: z.enum(["openai", "gemini", "auto"]).default("auto"), // Changed to include copilot-proxy
    aiProvider: z.enum(["openai", "gemini", "copilot-proxy", "auto"]).default("copilot-proxy"),
  }).optional(),
});

// Type exports
export type ExtractedJD = z.infer<typeof extractedJDSchema>;
export type StructuredJD = z.infer<typeof structuredJDSchema>;
export type PDFInfo = z.infer<typeof pdfInfoSchema>;
export type ApplicationResult = z.infer<typeof applicationResultSchema>;
export type JobApplicationState = z.infer<typeof jobApplicationStateSchema>;

// Helper to create initial state
export function createInitialState(
  jobUrl: string,
  userResume: ResumeData,
  options?: Partial<JobApplicationState["options"]>
): JobApplicationState {
  return {
    jobUrl,
    userResume,
    currentStep: "initialized",
    errors: [],
    retryCount: 0,
    maxRetries: 3,
    startedAt: new Date().toISOString(),
    options: {
      autoApply: options?.autoApply ?? true,  // Changed to true to match schema default
      generatePDF: options?.generatePDF ?? true,
      aiProvider: options?.aiProvider ?? "copilot-proxy",
    },
  };
}

// Helper to add error to state
export function addError(
  state: JobApplicationState,
  step: string,
  message: string
): JobApplicationState {
  return {
    ...state,
    errors: [
      ...state.errors,
      {
        step,
        message,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// Helper to check if state has errors
export function hasErrors(state: JobApplicationState): boolean {
  return state.errors.length > 0;
}

// Helper to get last error
export function getLastError(state: JobApplicationState): string | null {
  if (state.errors.length === 0) return null;
  return state.errors[state.errors.length - 1].message;
}
