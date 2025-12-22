import { z } from "zod";
import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

/**
 * Project schema - Personal and professional projects
 * Contains project name, description, dates, keywords, URL, and highlights (bullet points)
 */
export const projectSchema = itemSchema.extend({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  summary: z.string(),
  keywords: z.array(z.string()).default([]),
  url: urlSchema,
  highlights: z.array(z.string()).optional().default([]), // Bullet points for achievements
});

// Type
export type Project = z.infer<typeof projectSchema>;

// Defaults
export const defaultProject: Project = {
  ...defaultItem,
  name: "",
  description: "",
  date: "",
  summary: "",
  keywords: [],
  url: defaultUrl,
  highlights: [],
};
