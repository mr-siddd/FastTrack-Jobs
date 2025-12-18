import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { ChatResult, ChatGeneration } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import axios from "axios";

/**
 * Copilot Proxy Adapter
 * 
 * Connects to the Copilot Proxy VSCode extension to access GitHub Copilot Pro models
 * (including Claude Sonnet 4.5) through a local proxy server.
 * 
 * Proxy Extension: https://github.com/lutzleonhardt/copilot-proxy
 * 
 * Configuration:
 * - COPILOT_PROXY_URL: Proxy server URL (default: http://localhost:3016)
 * - COPILOT_PROXY_MODEL: Model to use (default: claude-sonnet-4.5)
 * 
 * The proxy provides an OpenAI-compatible API, making integration seamless.
 */

export interface CopilotProxyConfig {
  proxyUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class CopilotProxyAdapter extends BaseChatModel {
  private proxyUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens?: number;

  constructor(config: CopilotProxyConfig = {}) {
    super({});
    
    this.proxyUrl = config.proxyUrl || 
                    process.env.COPILOT_PROXY_URL || 
                    "http://localhost:3016";
    
    this.model = config.model || 
                 process.env.COPILOT_PROXY_MODEL || 
                 "claude-sonnet-4.5";
    
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens;
  }

  /**
   * Return the type identifier for this model
   */
  _llmType(): string {
    return "copilot-proxy";
  }

  /**
   * Main method to generate chat completions
   */
  async _generate(
    messages: BaseMessage[],
    options?: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    // Convert LangChain messages to OpenAI format
    const formattedMessages = messages.map((msg) => ({
      role: this.mapMessageRole(msg),
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    }));

    try {
      console.log(`[CopilotProxy] Calling proxy at ${this.proxyUrl} with model ${this.model}`);
      
      // Call the proxy endpoint (OpenAI-compatible API)
      const response = await axios.post(
        `${this.proxyUrl}/v1/chat/completions`,
        {
          model: this.model,
          messages: formattedMessages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minute timeout for long responses
        }
      );

      const completion = response.data;
      
      if (!completion.choices || completion.choices.length === 0) {
        throw new Error("No choices returned from Copilot Proxy");
      }

      const choice = completion.choices[0];
      const messageContent = choice.message?.content || "";

      console.log(`[CopilotProxy] ✅ Received response (${messageContent.length} chars)`);

      // Convert back to LangChain format
      const generations: ChatGeneration[] = [
        {
          text: messageContent,
          message: new AIMessage(messageContent),
        },
      ];

      return {
        generations,
        llmOutput: {
          tokenUsage: completion.usage,
          model: this.model,
        },
      };

    } catch (error: any) {
      console.error("[CopilotProxy] ❌ Error calling proxy:", error.message);
      
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          `Cannot connect to Copilot Proxy at ${this.proxyUrl}. ` +
          `Please ensure the copilot-proxy extension is running in VSCode and port 3016 is configured.`
        );
      }

      if (error.response) {
        throw new Error(
          `Copilot Proxy API error (${error.response.status}): ${
            error.response.data?.error?.message || error.message
          }`
        );
      }

      throw error;
    }
  }

  /**
   * Map LangChain message types to OpenAI role format
   */
  private mapMessageRole(message: BaseMessage): string {
    const type = message._getType();
    
    switch (type) {
      case "human":
        return "user";
      case "ai":
        return "assistant";
      case "system":
        return "system";
      default:
        return "user";
    }
  }

  /**
   * Get the identifying parameters for this model
   */
  get identifyingParams() {
    return {
      proxyUrl: this.proxyUrl,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }
}
