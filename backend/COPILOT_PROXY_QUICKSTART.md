# Copilot Proxy - Quick Start Guide

## ✅ What Was Implemented

### Files Created
1. **`CopilotProxyAdapter.ts`** - LangChain adapter for Copilot Proxy
2. **`.env.example`** - Environment template
3. **`test-copilot-proxy.ts`** - Test script
4. **`COPILOT_PROXY_INTEGRATION.md`** - Full documentation

### Files Updated
1. **`AIProviderFactory.ts`** - Added "copilot-proxy" provider
2. **`.env`** - Added proxy configuration
3. **`package.json`** - Added test:copilot script

### No Changes Needed
- **`ParseJDNode.ts`** ✓ Already compatible (uses createAIProvider)
- Other nodes will work automatically

---

## 🚀 How to Use

### 1. Ensure Copilot Proxy is Running

Check VSCode:
- Look for Copilot Proxy indicator in status bar
- Should show port 3016
- If not running, restart VSCode or the extension

### 2. Test the Integration

```bash
cd backend
npm run test:copilot
```

**Expected Output:**
```
=== Copilot Proxy Integration Test ===

Test 1: Checking available providers...
✓ Available providers: ["copilot-proxy", "openai", "gemini"]
✓ Recommended provider: copilot-proxy

Test 2: Creating Copilot Proxy instance...
[AI Provider] Using Copilot Proxy (claude-sonnet-4.5) at http://localhost:3016
✓ CopilotProxyAdapter created successfully

Test 3: Testing simple chat...
[CopilotProxy] Calling proxy...
[CopilotProxy] ✅ Received response
✓ Response received in 2345ms: "I am Claude Sonnet 4.5..."

=== All tests passed! ✓ ===
```

### 3. Use in Your Application

**Automatic (Recommended):**
```typescript
// Will automatically use Copilot Proxy if available
const llm = createAIProvider("auto", 0.3);
```

**Explicit:**
```typescript
// Force Copilot Proxy
const llm = createAIProvider("copilot-proxy", 0.3);
```

**In ParseJDNode:**
```typescript
// Already works! Just ensure proxy is running
// It auto-selects: copilot-proxy → openai → gemini
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Copilot Proxy
COPILOT_PROXY_URL=http://localhost:3016
COPILOT_PROXY_MODEL=claude-sonnet-4.5

# Fallbacks (optional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

### Provider Priority

When using `"auto"`:
1. **Copilot Proxy** (port 3016 available) ← Best quality, free with Pro
2. **OpenAI** (API key set) ← Reliable, paid
3. **Gemini** (API key set) ← Free tier

---

## 📊 Provider Comparison

| Feature | Copilot Proxy | OpenAI | Gemini |
|---------|--------------|--------|--------|
| **Model** | Claude Sonnet 4.5 | GPT-4o-mini | Gemini 1.5 Pro |
| **Cost** | $0* | $$ | $0** |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Speed** | Fast | Fast | Fast |
| **Setup** | Extension only | API key | API key |

\* Included with GitHub Copilot Pro ($10/month)  
** Free tier with limits

---

## ❓ Troubleshooting

### ⚠️ "Cannot connect to Copilot Proxy"

**Check:**
1. VSCode status bar - is proxy active?
2. Port 3016 in extension settings
3. `.env` has `COPILOT_PROXY_URL=http://localhost:3016`

**Fix:**
```bash
# Restart VSCode
# Or reload window: Ctrl+Shift+P → "Reload Window"
```

### ⚠️ "No AI provider available"

**Quick Fix:** Add a fallback API key:
```env
# In .env, add one of:
OPENAI_API_KEY=sk-...
# or
GEMINI_API_KEY=AIza...
```

### ⚠️ Proxy running but requests fail

**Check GitHub Copilot:**
1. Copilot Pro subscription active?
2. Signed in to GitHub in VSCode?
3. Try: Copilot icon → Sign Out → Sign In

---

## 📝 Test Commands

```bash
# Test Copilot Proxy integration
npm run test:copilot

# Test resume processing
npm run test:resume

# Start development server
npm run dev
```

---

## 🎯 Key Points

✅ **ParseJDNode works automatically** - no code changes needed  
✅ **Auto-selects best provider** - Copilot Proxy → OpenAI → Gemini  
✅ **Seamless fallback** - if proxy unavailable, uses OpenAI/Gemini  
✅ **Same API** - LangChain interface consistent across providers  
✅ **Better quality** - Claude Sonnet 4.5 is excellent for structured tasks  

---

## 📚 Full Documentation

See [COPILOT_PROXY_INTEGRATION.md](./COPILOT_PROXY_INTEGRATION.md) for:
- Architecture details
- Advanced configuration
- API compatibility
- Performance notes
- Troubleshooting guide

---

## 🎉 Summary

You're now using **Claude Sonnet 4.5** via GitHub Copilot Pro in your job application agent!

**Next steps:**
1. ✅ Ensure proxy is running (check VSCode status bar)
2. ✅ Run test: `npm run test:copilot`
3. ✅ Test ParseJD with real job posting
4. ✅ Compare outputs vs OpenAI/Gemini
5. ✅ Enjoy better AI quality at no extra cost! 🚀
