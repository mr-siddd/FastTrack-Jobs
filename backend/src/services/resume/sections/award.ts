import { z } from "zod";
import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

/**
 * Award schema - Honors and awards received
 * Contains award title, date, awarder, and summary
 */
export const awardSchema = itemSchema.extend({
  title: z.string(),
  date: z.string(),
  awarder: z.string(),
  summary: z.string(),
  url: urlSchema,
});

// Type
export type Award = z.infer<typeof awardSchema>;

// Defaults
export const defaultAward: Award = {
  ...defaultItem,
  title: "",
  date: "",
  awarder: "",
  summary: "",
  url: defaultUrl,
};
