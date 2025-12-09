import { z } from "zod";
import { defaultItem, itemSchema } from "../shared";

/**
 * Language schema - Languages spoken
 * Contains language name, description, and proficiency level
 */
export const languageSchema = itemSchema.extend({
  name: z.string(),
  description: z.string(),
  level: z.coerce.number().min(0).max(5).default(1),
});

// Type
export type Language = z.infer<typeof languageSchema>;

// Defaults
export const defaultLanguage: Language = {
  ...defaultItem,
  name: "",
  description: "",
  level: 1,
};
