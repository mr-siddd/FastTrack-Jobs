# Copilot Proxy Integration Guide

## Overview

This integration allows FasTrackJobs to use **Claude Sonnet 4.5** through GitHub Copilot Pro via the Copilot Proxy extension. This provides access to one of the best AI models without additional API costs (included with Copilot Pro subscription).

## Architecture

```
ParseJDNode
    ↓
createAIProvider("copilot-proxy")
    ↓
AIProviderFactory
    ↓
CopilotProxyAdapter
    ↓
HTTP POST → http://localhost:3016/v1/chat/completions
    ↓
Copilot Proxy Extension (VSCode)
    ↓
GitHub Copilot Pro → Claude Sonnet 4.5
```

## Setup

### 1. Install Copilot Proxy Extension

The extension is already installed from: https://github.com/lutzleonhardt/copilot-proxy

### 2. Configure Proxy Port

In VSCode Settings:
- Search for "Copilot Proxy"
- Set port to: **3016** ✓ (Already configured)

### 3. Verify Proxy is Running

Check VSCode status bar for Copilot Proxy indicator. The extension should show it's running on port 3016.

### 4. Environment Variables

The `.env` file is configured with:
```env
COPILOT_PROXY_URL=http://localhost:3016
COPILOT_PROXY_MODEL=claude-sonnet-4.5
```

## Usage

### Automatic Provider Selection

The system auto-selects providers in this priority:

1. **Copilot Proxy** (if running) → Claude Sonnet 4.5 🎯
2. **OpenAI** (if API key set) → GPT-4o-mini
3. **Gemini** (if API key set) → Gemini 1.5 Pro

### Explicit Provider Selection

```typescript
// Use Copilot Proxy explicitly
const llm = createAIProvider("copilot-proxy", 0.3);

// Use auto-selection (will choose Copilot Proxy if available)
const llm = createAIProvider("auto", 0.3);
```

### In ParseJDNode

The node already uses `createAIProvider()`, so it works automatically:

```typescript
const aiProvider = state.options?.aiProvider || "auto";
const llm = createAIProvider(aiProvider, 0.3);
```

To force Copilot Proxy:
```typescript
const llm = createAIProvider("copilot-proxy", 0.3);
```

## Features

### ✅ Supported Features
- ✅ Structured output parsing with Zod schemas
- ✅ All LangChain core features
- ✅ Prompt templates
- ✅ Temperature and max tokens control
- ✅ Error handling with fallbacks
- ✅ Token usage tracking
- ✅ Seamless integration with existing code

### 🎯 Benefits
- **Free** (included with Copilot Pro subscription)
- **Claude Sonnet 4.5** - one of the best available models
- **No API key management** - handled by VSCode extension
- **Local proxy** - no external API calls needed
- **Easy switching** - can fall back to OpenAI/Gemini if needed

## Testing

### Test 1: Check Provider Availability

```typescript
import { AIProviderFactory } from './services/ai/AIProviderFactory';

const available = AIProviderFactory.getAvailableProviders();
console.log('Available providers:', available);
// Expected: ["copilot-proxy", "openai", "gemini"]

const recommended = AIProviderFactory.getRecommendedProvider();
console.log('Recommended:', recommended);
// Expected: "copilot-proxy"
```

### Test 2: Simple Chat

```typescript
import { createAIProvider } from './services/ai/AIProviderFactory';

const llm = createAIProvider("copilot-proxy");
const response = await llm.invoke("Hello! What model are you?");
console.log(response.content);
// Expected: Response from Claude Sonnet 4.5
```

### Test 3: ParseJD Node

```typescript
import { parseJDNode } from './agents/nodes/ParseJDNode';

const state = {
  extractedJD: {
    rawText: "Senior Software Engineer at TechCorp...",
    title: "Senior Software Engineer",
    company: "TechCorp"
  },
  options: {
    aiProvider: "copilot-proxy" // or "auto"
  }
};

const result = await parseJDNode(state);
console.log(result.structuredJD);
```

## Troubleshooting

### Error: "Cannot connect to Copilot Proxy"

**Cause**: Extension not running or wrong port

**Solutions**:
1. Check VSCode status bar - ensure Copilot Proxy is active
2. Restart VSCode
3. Verify port 3016 in settings
4. Check `.env` file has correct `COPILOT_PROXY_URL`

### Error: "No AI provider available"

**Cause**: Proxy not detected and no API keys set

**Solutions**:
1. Ensure extension is running
2. Set `COPILOT_PROXY_URL=http://localhost:3016` in `.env`
3. Or add `OPENAI_API_KEY` or `GEMINI_API_KEY` as fallback

### Error: "Copilot Proxy API error"

**Cause**: Issue with GitHub Copilot Pro subscription or proxy

**Solutions**:
1. Verify Copilot Pro subscription is active
2. Check VSCode is signed in to GitHub
3. Restart Copilot Proxy extension
4. Check VSCode Output panel → Copilot Proxy logs

### Model Not Responding

**Cause**: Model name mismatch or timeout

**Solutions**:
1. Try different model name in `.env`:
   ```env
   COPILOT_PROXY_MODEL=claude-sonnet-4.5
   # Or try:
   COPILOT_PROXY_MODEL=claude-sonnet-3.5
   COPILOT_PROXY_MODEL=gpt-4
   ```
2. Increase timeout in `CopilotProxyAdapter.ts` (currently 120s)

## API Compatibility

The Copilot Proxy provides an **OpenAI-compatible API**, which means:

- ✅ Same request/response format as OpenAI
- ✅ Works with LangChain out of the box
- ✅ Supports streaming (not implemented yet in our adapter)
- ✅ Token usage tracking
- ✅ Multiple models accessible

### Endpoint Format

```http
POST http://localhost:3016/v1/chat/completions
Content-Type: application/json

{
  "model": "claude-sonnet-4.5",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

## Code Structure

### Files Modified/Created

1. **`CopilotProxyAdapter.ts`** (NEW)
   - LangChain BaseChatModel implementation
   - Handles HTTP communication with proxy
   - Error handling and retries

2. **`AIProviderFactory.ts`** (UPDATED)
   - Added `"copilot-proxy"` to provider types
   - Added `createCopilotProxy()` method
   - Updated auto-selection priority
   - Added availability check

3. **`.env`** (UPDATED)
   - Added `COPILOT_PROXY_URL`
   - Added `COPILOT_PROXY_MODEL`

4. **`.env.example`** (NEW)
   - Template for environment variables

5. **`ParseJDNode.ts`** (NO CHANGES)
   - Already uses `createAIProvider()`
   - Works automatically with new provider

## Next Steps

### 1. Test the Integration

Run the backend and test ParseJD with Copilot Proxy:

```bash
cd backend
npm run dev
```

### 2. Monitor Logs

Look for these log messages:
```
[AI Provider] Using Copilot Proxy (claude-sonnet-4.5) at http://localhost:3016
[CopilotProxy] Calling proxy at http://localhost:3016 with model claude-sonnet-4.5
[CopilotProxy] ✅ Received response (1234 chars)
[Node 2] Successfully parsed job description
```

### 3. Compare Outputs

Test the same JD with different providers and compare quality:
- Copilot Proxy (Claude Sonnet 4.5)
- OpenAI (GPT-4o-mini)
- Gemini (Gemini 1.5 Pro)

### 4. Optimize Prompts

Claude Sonnet 4.5 has different strengths than GPT-4. You may want to:
- Adjust temperature (Claude works well with 0.3-0.5)
- Refine prompts for Claude's style
- Test structured output formats

## Performance Notes

### Speed
- **Copilot Proxy**: Similar to OpenAI (depends on GitHub's infrastructure)
- **Local Overhead**: Minimal (HTTP to localhost)

### Quality
- **Claude Sonnet 4.5**: Excellent for structured tasks
- **Strong at**: Reasoning, structured output, following instructions
- **Ideal for**: Job description parsing, resume tailoring

### Cost
- **Copilot Proxy**: $0 (included with Copilot Pro at $10/month)
- **OpenAI**: Pay per token
- **Gemini**: Free tier available

## Summary

You now have three AI providers integrated:

| Provider | Model | Cost | Best For |
|----------|-------|------|----------|
| **Copilot Proxy** | Claude Sonnet 4.5 | Included with Pro | Production, best quality |
| OpenAI | GPT-4o-mini | Pay per use | Reliable fallback |
| Gemini | Gemini 1.5 Pro | Free tier | Development, testing |

The system automatically uses **Copilot Proxy** (Claude Sonnet 4.5) when available, giving you the best model with your existing Copilot Pro subscription! 🎉
