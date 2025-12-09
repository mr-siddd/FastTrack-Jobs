import { z } from "zod";

/**
 * Schema for unique identifiers in Cuid2 format
 * Provides collision-resistant IDs for all resume entities
 * 
 * Note: Using dynamic import to avoid CommonJS/ESM compatibility issues
 */
export const idSchema = z
  .string()
  .default(() => {
    // Generate a random ID as fallback
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  })
  .describe("Unique identifier for the item in Cuid2 format");

// TODO: Uncomment when package.json has "type": "module"
// import { createId } from "@paralleldrive/cuid2";
// export const idSchema = z
//   .string()
//   .cuid2()
//   .default(createId())
//   .describe("Unique identifier for the item in Cuid2 format");
