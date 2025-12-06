export type StructuredResult = Record<string, any>;

export default interface AIProvider {
  generateText(promptKey: string, payload: any): Promise<string>;
  generateStructured(promptKey: string, payload: any): Promise<StructuredResult>;
}
