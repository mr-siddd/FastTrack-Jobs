import { z } from "zod";
import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

/**
 * Profile schema - Social media and professional profiles
 * Contains network name (LinkedIn, GitHub, etc.), username, and URL
 */
export const profileSchema = itemSchema.extend({
  network: z.string(),
  username: z.string(),
  icon: z.string(),
  url: urlSchema,
});

// Type
export type Profile = z.infer<typeof profileSchema>;

// Defaults
export const defaultProfile: Profile = {
  ...defaultItem,
  network: "",
  username: "",
  icon: "",
  url: defaultUrl,
};
