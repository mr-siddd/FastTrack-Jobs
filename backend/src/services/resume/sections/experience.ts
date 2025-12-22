import { z } from "zod";
import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

/**
 * Experience schema - Work experience entries
 * Contains company, position, dates, location, summary, and highlights (bullet points)
 */
export const experienceSchema = itemSchema.extend({
  company: z.string().min(1),
  position: z.string(),
  location: z.string(),
  date: z.string(),
  summary: z.string(),
  url: urlSchema,
  highlights: z.array(z.string()).optional().default([]), // Bullet points for achievements
});

// Type
export type Experience = z.infer<typeof experienceSchema>;

// Defaults
export const defaultExperience: Experience = {
  ...defaultItem,
  company: "",
  position: "",
  location: "",
  date: "",
  summary: "",
  url: defaultUrl,
  highlights: [],
};
