import { z } from "zod";
import { defaultItem, itemSchema } from "../shared";

/**
 * Interest schema - Hobbies and interests
 * Contains interest name and keywords
 */
export const interestSchema = itemSchema.extend({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

// Type
export type Interest = z.infer<typeof interestSchema>;

// Defaults
export const defaultInterest: Interest = {
  ...defaultItem,
  name: "",
  keywords: [],
};
