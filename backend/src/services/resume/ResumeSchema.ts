import { z } from "zod";
import { basicsSchema, defaultBasics } from "./basics";
import { defaultMetadata, metadataSchema } from "./metadata";
import { defaultSections, sectionsSchema } from "./sections";

/**
 * Complete Resume Data Schema
 * Based on reactive-resume schema structure
 * 
 * This schema represents the complete structure of a resume including:
 * - basics: Personal information (name, contact, picture)
 * - sections: All resume sections (experience, education, skills, etc.)
 * - metadata: Presentation settings (theme, typography, layout)
 * 
 * Usage in LangGraph Agent:
 * - Node 1 Input: User provides this resume data
 * - Node 2: AI parses job description
 * - Node 3: AI tailors this resume to match job description
 * - Node 4: PDF generator uses metadata to format output
 * - Node 5: Auto-apply uses basics for form filling
 * 
 * TODO: In production, this will come from a separate user service/database
 * For now, use defaultResumeData for testing
 */
export const resumeDataSchema = z.object({
  basics: basicsSchema,
  sections: sectionsSchema,
  metadata: metadataSchema,
});

// Type
export type ResumeData = z.infer<typeof resumeDataSchema>;

// Defaults
export const defaultResumeData: ResumeData = {
  basics: defaultBasics,
  sections: defaultSections,
  metadata: defaultMetadata,
};

// Re-export all sub-schemas for modular access
export * from "./basics";
export * from "./metadata";
export * from "./sections";
export * from "./shared";
export * from "./sample";

// Legacy export for backward compatibility
// TODO: Remove this once all code is updated to use resumeDataSchema
export const ResumeSchema = resumeDataSchema;
export type Resume = ResumeData;
