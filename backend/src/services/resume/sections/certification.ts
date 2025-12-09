import { z } from "zod";
import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

/**
 * Certification schema - Professional certifications
 * Contains certification name, date, issuer, and summary
 */
export const certificationSchema = itemSchema.extend({
  name: z.string(),
  date: z.string(),
  issuer: z.string(),
  summary: z.string(),
  url: urlSchema,
});

// Type
export type Certification = z.infer<typeof certificationSchema>;

// Defaults
export const defaultCertification: Certification = {
  ...defaultItem,
  name: "",
  date: "",
  issuer: "",
  summary: "",
  url: defaultUrl,
};
