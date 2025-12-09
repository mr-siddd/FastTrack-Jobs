import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * AI Provider Factory
 * 
 * Supports multiple AI providers:
 * - OpenAI (GPT-4, GPT-3.5) - Paid, high quality
 * - Google Gemini (gemini-pro, gemini-1.5-flash-latest) - FREE tier available!
 * 
 * This solves the problem of burning through OpenAI credits during testing.
 * Use Gemini for development, switch to OpenAI for production.
 */

export type AIProviderType = "openai" | "gemini" | "auto";

export interface AIProviderConfig {
  provider: AIProviderType;
  temperature?: number;
  maxTokens?: number;
}

export class AIProviderFactory {
  /**
   * Create an AI provider instance
   * 
   * @param config Provider configuration
   * @returns LangChain chat model instance
   */
  static createProvider(config: AIProviderConfig): BaseChatModel {
    const { provider, temperature = 0.7, maxTokens } = config;

    // Auto-select based on available API keys
    if (provider === "auto") {
      return this.autoSelectProvider(temperature, maxTokens);
    }

    switch (provider) {
      case "openai":
        return this.createOpenAI(temperature, maxTokens);
      
      case "gemini":
        return this.createGemini(temperature, maxTokens);
      
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  /**
   * Create OpenAI provider
   * Requires: OPENAI_API_KEY environment variable
   */
  private static createOpenAI(temperature: number, maxTokens?: number): BaseChatModel {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not found in environment variables. " +
        "Please set it or use 'gemini' provider for free tier."
      );
    }

    console.log("[AI Provider] Using OpenAI (gpt-4o-mini)");

    return new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: apiKey,
      temperature,
      maxTokens,
    });
  }

  /**
   * Create Google Gemini provider (FREE TIER!)
   * Requires: GEMINI_API_KEY environment variable
   * 
   * Get your free key: https://ai.google.dev/
   */
  private static createGemini(temperature: number, maxTokens?: number): BaseChatModel {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY not found in environment variables. " +
        "Get your free API key at: https://ai.google.dev/"
      );
    }

    console.log("[AI Provider] Using Google Gemini (gemini-1.5-pro) - FREE TIER");

    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro", // Correct model name for Gemini 1.5 Pro
      apiKey,
      temperature,
      maxOutputTokens: maxTokens,
    });
  }

  /**
   * Auto-select provider based on available API keys
   * Priority: OpenAI (more reliable with LangChain) > Gemini (free but model compatibility issues)
   */
  private static autoSelectProvider(temperature: number, maxTokens?: number): BaseChatModel {
    // Use OpenAI first if available (better LangChain compatibility)
    if (process.env.OPENAI_API_KEY) {
      console.log("[AI Provider] Auto-selected OpenAI (better LangChain support)");
      return this.createOpenAI(temperature, maxTokens);
    }

    // Fall back to Gemini
    if (process.env.GEMINI_API_KEY) {
      console.log("[AI Provider] Auto-selected Gemini (FREE)");
      return this.createGemini(temperature, maxTokens);
    }

    throw new Error(
      "No AI provider API keys found! Please set either:\n" +
      "- OPENAI_API_KEY\n" +
      "- GEMINI_API_KEY (get free at: https://ai.google.dev/)"
    );
  }

  /**
   * Check which providers are available
   */
  static getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];

    if (process.env.OPENAI_API_KEY) {
      available.push("openai");
    }

    if (process.env.GEMINI_API_KEY) {
      available.push("gemini");
    }

    return available;
  }

  /**
   * Get recommended provider for testing (prefers free tier)
   */
  static getRecommendedProvider(): AIProviderType {
    if (process.env.GEMINI_API_KEY) {
      return "gemini";
    }
    
    if (process.env.OPENAI_API_KEY) {
      return "openai";
    }

    return "gemini"; // Recommend getting Gemini key
  }
}

/**
 * Convenience function to create AI provider
 * 
 * Usage:
 * const llm = createAIProvider("gemini");
 * const response = await llm.invoke("Hello!");
 */
export function createAIProvider(
  provider: AIProviderType = "auto",
  temperature: number = 0.7,
  maxTokens?: number
): BaseChatModel {
  return AIProviderFactory.createProvider({
    provider,
    temperature,
    maxTokens,
  });
}
