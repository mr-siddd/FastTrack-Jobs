import { z } from "zod";

/**
 * URL schema with label and href
 * Used for links in resume sections (profiles, education, experience, etc.)
 */
export const urlSchema = z.object({
  label: z.string(),
  href: z.literal("").or(z.string().url()),
});

// Type
export type URL = z.infer<typeof urlSchema>;

// Defaults
export const defaultUrl: URL = {
  label: "",
  href: "",
};
