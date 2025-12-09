import { z } from "zod";
import { defaultItem, itemSchema } from "../shared";

/**
 * Reference schema - Professional references
 * Contains reference name, description/relationship, and summary
 */
export const referenceSchema = itemSchema.extend({
  name: z.string(),
  description: z.string(),
  summary: z.string(),
});

// Type
export type Reference = z.infer<typeof referenceSchema>;

// Defaults
export const defaultReference: Reference = {
  ...defaultItem,
  name: "",
  description: "",
  summary: "",
};
