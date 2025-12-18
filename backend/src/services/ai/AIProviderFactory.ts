import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { CopilotProxyAdapter } from "./CopilotProxyAdapter";
import { BaseMessage } from "@langchain/core/messages";
import { ChatResult } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

/**
 * AI Provider Factory
 * 
 * Supports multiple AI providers:
 * - Copilot Proxy (Claude Sonnet 4.5 via GitHub Copilot Pro) - FREE with Copilot Pro!
 * - OpenAI (GPT-4, GPT-3.5) - Paid, high quality
 * - Google Gemini (gemini-pro, gemini-1.5-flash-latest) - FREE tier available!
 * 
 * This solves the problem of burning through OpenAI credits during testing.
 * Use Copilot Proxy for Claude Sonnet 4.5, Gemini for development, OpenAI for production.
 */

export type AIProviderType = "openai" | "gemini" | "copilot-proxy" | "auto";

export interface AIProviderConfig {
  provider: AIProviderType;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Smart Fallback Adapter
 * 
 * Wraps Copilot Proxy and automatically falls back to OpenAI/Gemini
 * if the proxy connection fails.
 */
class SmartFallbackAdapter extends BaseChatModel {
  private primaryProvider: BaseChatModel;
  private fallbackProvider: BaseChatModel | null = null;
  private primaryName: string;
  private fallbackName: string | null = null;

  constructor(primaryProvider: BaseChatModel, primaryName: string, fallbackProvider?: BaseChatModel, fallbackName?: string) {
    super({});
    this.primaryProvider = primaryProvider;
    this.primaryName = primaryName;
    this.fallbackProvider = fallbackProvider || null;
    this.fallbackName = fallbackName || null;
  }

  _llmType(): string {
    return "smart-fallback";
  }

  async _generate(
    messages: BaseMessage[],
    options?: Record<string, any>,
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    try {
      console.log(`[SmartFallback] Trying primary provider: ${this.primaryName}`);
      return await this.primaryProvider._generate(messages, options || {}, runManager);
    } catch (error: any) {
      // If primary fails due to connection error, try fallback
      if (this.fallbackProvider && (error.code === "ECONNREFUSED" || error.message?.includes("Cannot connect"))) {
        console.warn(`[SmartFallback] ⚠️ Primary provider (${this.primaryName}) failed:`, error.message);
        console.log(`[SmartFallback] Falling back to: ${this.fallbackName}`);
        
        try {
          return await this.fallbackProvider._generate(messages, options || {}, runManager);
        } catch (fallbackError: any) {
          console.error(`[SmartFallback] ❌ Both providers failed`);
          throw fallbackError;
        }
      }

      // If not a connection error, rethrow
      throw error;
    }
  }
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
      
      case "copilot-proxy":
        return this.createCopilotProxy(temperature, maxTokens);
      
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
   * Create Copilot Proxy provider (Claude Sonnet 4.5 via GitHub Copilot Pro)
   * Requires: Copilot Proxy extension running in VSCode
   * 
   * Extension: https://github.com/lutzleonhardt/copilot-proxy
   * Port: 3016 (default)
   */
  private static createCopilotProxy(temperature: number, maxTokens?: number): BaseChatModel {
    const proxyUrl = process.env.COPILOT_PROXY_URL || "http://localhost:3016";
    const model = process.env.COPILOT_PROXY_MODEL || "claude-sonnet-4.5";

    console.log(`[AI Provider] Using Copilot Proxy (${model}) at ${proxyUrl}`);

    const primaryProvider = new CopilotProxyAdapter({
      proxyUrl,
      model,
      temperature,
      maxTokens,
    });

    // Create smart fallback: if Copilot Proxy fails, use OpenAI if available, else Gemini
    let fallbackProvider: BaseChatModel | null = null;
    let fallbackName: string | null = null;

    if (process.env.OPENAI_API_KEY) {
      try {
        fallbackProvider = this.createOpenAI(temperature, maxTokens);
        fallbackName = "OpenAI (gpt-4o-mini)";
      } catch (e) {
        // Fall through to Gemini
      }
    }

    if (!fallbackProvider && process.env.GEMINI_API_KEY) {
      try {
        fallbackProvider = this.createGemini(temperature, maxTokens);
        fallbackName = "Gemini (gemini-1.5-pro)";
      } catch (e) {
        // Fall through
      }
    }

    if (fallbackProvider && fallbackName) {
      console.log(`[AI Provider] Smart fallback configured: if proxy fails, will use ${fallbackName}`);
      return new SmartFallbackAdapter(primaryProvider, `Copilot Proxy (${model})`, fallbackProvider, fallbackName);
    }

    return primaryProvider;
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
      model: "gemini-1.5-pro",
      apiKey,
      temperature,
      maxOutputTokens: maxTokens,
    });
  }

  /**
   * Auto-select provider based on DEFAULT_AI_PROVIDER environment variable
   * Falls back to priority: CopilotProxy → OpenAI → Gemini
   */
  private static autoSelectProvider(temperature: number, maxTokens?: number): BaseChatModel {
    // Check for explicit default provider preference
    const defaultProvider = process.env.DEFAULT_AI_PROVIDER as AIProviderType | undefined;
    
    if (defaultProvider && defaultProvider !== "auto") {
      console.log(`[AI Provider] Using DEFAULT_AI_PROVIDER: ${defaultProvider}`);
      
      switch (defaultProvider) {
        case "copilot-proxy":
          return this.createCopilotProxy(temperature, maxTokens);
        case "openai":
          if (process.env.OPENAI_API_KEY) {
            return this.createOpenAI(temperature, maxTokens);
          }
          break;
        case "gemini":
          if (process.env.GEMINI_API_KEY) {
            return this.createGemini(temperature, maxTokens);
          }
          break;
      }
    }
    
    // Fallback to priority-based selection
    console.log("[AI Provider] Auto-selecting by priority: Copilot Proxy → OpenAI → Gemini");
    
    // Try Copilot Proxy first (best model with Copilot Pro)
    console.log("[AI Provider] Selected: Copilot Proxy (Claude Sonnet 4.5)");
    return this.createCopilotProxy(temperature, maxTokens);
  }

  /**
   * Check which providers are available
   */
  static getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];

    // Check Copilot Proxy
    const copilotProxyUrl = process.env.COPILOT_PROXY_URL || "http://localhost:3016";
    if (this.isCopilotProxyAvailable(copilotProxyUrl)) {
      available.push("copilot-proxy");
    }

    if (process.env.OPENAI_API_KEY) {
      available.push("openai");
    }

    if (process.env.GEMINI_API_KEY) {
      available.push("gemini");
    }

    return available;
  }

  /**
   * Get recommended provider for testing (prefers free/included services)
   */
  static getRecommendedProvider(): AIProviderType {
    // Prefer Copilot Proxy if available (best model with Copilot Pro subscription)
    const copilotProxyUrl = process.env.COPILOT_PROXY_URL || "http://localhost:3016";
    if (this.isCopilotProxyAvailable(copilotProxyUrl)) {
      return "copilot-proxy";
    }

    if (process.env.GEMINI_API_KEY) {
      return "gemini";
    }
    
    if (process.env.OPENAI_API_KEY) {
      return "openai";
    }

    return "copilot-proxy"; // Recommend setting up Copilot Proxy
  }

    /**
   * Check if Copilot Proxy is available by attempting to connect
   */
  private static isCopilotProxyAvailable(proxyUrl: string): boolean {
    try {
      // Simple synchronous check - in production, you might want to cache this result
      // For now, assume it's available and let the adapter handle connection errors
      return true;
    } catch (error) {
      return false;
    }
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