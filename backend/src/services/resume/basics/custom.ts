import { z } from "zod";

/**
 * Custom field schema for basics section
 * Allows users to add custom fields like "Preferred Name", "Pronouns", etc.
 */
export const customFieldSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string(),
  value: z.string(),
});

// Type
export type CustomField = z.infer<typeof customFieldSchema>;

// Defaults
export const defaultCustomField: CustomField = {
  id: "",
  icon: "lucide:star",
  name: "",
  value: "",
};
