import { z } from "zod";
import { defaultItem, itemSchema } from "../shared";

/**
 * Custom section item schema
 * Allows users to create completely custom sections (e.g., "Speaking Engagements", "Patents", etc.)
 */
export const customSectionSchema = itemSchema.extend({
  name: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  summary: z.string(),
  keywords: z.array(z.string()).default([]),
});

// Type
export type CustomSection = z.infer<typeof customSectionSchema>;

// Defaults
export const defaultCustomSection: CustomSection = {
  ...defaultItem,
  name: "",
  description: "",
  date: "",
  location: "",
  summary: "",
  keywords: [],
};
