import { z } from "zod";
import { idSchema } from "./id";

/**
 * Base item schema for all resume section items
 * All section items (experience, education, etc.) extend this schema
 */
export const itemSchema = z.object({
  id: idSchema,
  visible: z.boolean(),
});

// Type
export type Item = z.infer<typeof itemSchema>;

// Defaults
export const defaultItem: Item = {
  id: "",
  visible: true,
};
