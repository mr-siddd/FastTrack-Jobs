/**
 * Utility type to filter keys from an object type
 * Used for extracting specific section types
 */
export type FilterKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
