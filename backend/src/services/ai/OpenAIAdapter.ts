import AIProvider, { StructuredResult } from './AIProvider';
import OpenAI from 'openai';
import { PROMPTS } from '../../lib/prompt-templates';

export default class OpenAIAdapter implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateText(promptKey: string, payload: any): Promise<string> {
    const prompt = this.buildPrompt(promptKey, payload);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message.content || '';
  }

  async generateStructured(promptKey: string, payload: any): Promise<StructuredResult> {
    const prompt = this.buildPrompt(promptKey, payload);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt + '\n\nRespond with ONLY valid JSON, no markdown or extra text.' },
      ],
      temperature: 0.5,
    });
    const content = response.choices[0]?.message.content || '{}';
    try {
      return JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response as JSON:', content);
      return { error: 'Invalid JSON response from AI' };
    }
  }

  private buildPrompt(promptKey: string, payload: any): string {
    switch (promptKey) {
      case 'extract-jd':
        return PROMPTS.extract_jd + '\n\nHTML/Text:\n' + (payload?.htmlOrText || '');
      case 'tailor-resume':
        return (
          PROMPTS.tailor_resume +
          '\n\nResume:\n' +
          JSON.stringify(payload?.resume, null, 2) +
          '\n\nJob Description:\n' +
          JSON.stringify(payload?.jd, null, 2)
        );
      default:
        return 'Generate a response for: ' + JSON.stringify(payload);
    }
  }
}
