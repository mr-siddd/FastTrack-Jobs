# LangGraph Job Application Agent - Complete Implementation

## 🎯 Overview

This is a **production-ready LangGraph agent** that automates the entire job application process using stateful graph nodes and AI.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JobApplicationAgent                       │
│                  (LangGraph Orchestrator)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌───────────────────────┐
              │ JobApplicationState   │
              │  (Flows through all)  │
              └───────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Node 1       │  │  Node 2       │  │  Node 3       │
│  Extract JD   │──▶  Parse JD     │──▶ Tailor Resume │
│  (MCP+Click)  │  │  (AI)         │  │  (AI)         │
└───────────────┘  └───────────────┘  └───────────────┘
                                              │
                          ┌───────────────────┴──────────────┐
                          ▼                                  ▼
                  ┌───────────────┐                 ┌───────────────┐
                  │  Node 4       │                 │  Node 5       │
                  │  Generate PDF │                 │  Auto-Apply   │
                  │               │                 │  (MCP)        │
                  └───────────────┘                 └───────────────┘
```

---

## 📁 Folder Structure

```
backend/src/
├── agents/
│   ├── JobApplicationAgent.ts          # Main orchestrator
│   └── nodes/
│       ├── ExtractJDNode.ts            # Node 1: Extract with button clicking
│       ├── ParseJDNode.ts              # Node 2: AI parsing
│       ├── TailorResumeNode.ts         # Node 3: AI tailoring
│       ├── GeneratePDFNode.ts          # Node 4: PDF generation
│       └── AutoApplyNode.ts            # Node 5: Auto-application
│
├── state/
│   └── JobApplicationState.ts          # Shared state schema (Zod)
│
├── services/
│   ├── ai/
│   │   ├── AIProvider.ts               # Interface (existing)
│   │   ├── OpenAIAdapter.ts            # OpenAI (existing)
│   │   └── AIProviderFactory.ts        # Multi-provider support (NEW)
│   ├── mcp/
│   │   └── McpClient.ts                # Enhanced with button clicking
│   ├── pdf/
│   │   └── PdfService.ts               # PDF generation (existing)
│   └── resume/
│       └── ResumeSchema.ts             # Complete schema (existing)
│
└── routes/
    └── job-agent.ts                    # API endpoint: POST /api/job/process
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd backend
npm install langchain @langchain/core @langchain/openai @langchain/google-genai --legacy-peer-deps
```

### 2. Set Up Environment Variables

```bash
# .env file

# Option 1: Use FREE Google Gemini (Recommended for testing)
GEMINI_API_KEY=your_free_gemini_key_from_https://ai.google.dev/

# Option 2: Use OpenAI (Paid)
OPENAI_API_KEY=your_openai_key

# The agent will auto-select Gemini if both are available (to save costs)
```

### 3. Start the Server

```powershell
cd backend
npm run dev
```

### 4. Test the Agent

```bash
POST http://localhost:4000/api/job/process
Content-Type: application/json

{
  "jobUrl": "https://www.linkedin.com/jobs/view/3847404589",
  "options": {
    "autoApply": false,
    "generatePDF": true,
    "aiProvider": "auto"
  }
}
```

---

## 📊 Node Details

### **Node 1: Extract Job Description**

**File:** `agents/nodes/ExtractJDNode.ts`

**What it does:**
- Navigates to job URL using Playwright MCP
- **Clicks "Show More", "View More", "Read More" buttons** to expand content
- Extracts complete job description text and HTML
- Extracts job title and company name

**Implementation:**
```typescript
// Enhanced McpClient with button clicking
private async clickExpandButtons(page: any): Promise<number> {
  const selectors = [
    'button:has-text("Show more")',
    'button:has-text("View more")',
    'button:has-text("Read more")',
    '.jobs-description__footer-button',
    '[aria-label="Show more"]',
    // ... 10+ selectors for different job sites
  ];
  
  for (const selector of selectors) {
    await button.click();
    await page.waitForTimeout(500);
  }
}
```

**Input:** `state.jobUrl`  
**Output:** `state.extractedJD`

---

### **Node 2: Parse Job Description with AI**

**File:** `agents/nodes/ParseJDNode.ts`

**What it does:**
- Uses LangChain + AI to structure raw job text
- Extracts: title, company, requirements, skills, responsibilities
- Uses Zod schema for structured output parsing
- Falls back to simple parsing if structured output fails

**AI Provider Support:**
```typescript
const llm = createAIProvider("auto"); // Uses Gemini (free) or OpenAI
```

**Input:** `state.extractedJD.rawText`  
**Output:** `state.structuredJD`

**Structured Output Schema:**
```typescript
{
  title: string,
  company: string,
  requiredSkills: string[],
  preferredSkills: string[],
  requirements: string[],
  responsibilities: string[],
  keywords: string[], // For ATS matching
  ...
}
```

---

### **Node 3: Tailor Resume with AI**

**File:** `agents/nodes/TailorResumeNode.ts`

**What it does:**
- Takes user resume + parsed job description
- Uses AI to customize resume for this specific job
- Updates professional summary to match job requirements
- Highlights relevant skills and experience
- Maintains resume structure and formatting

**Prompt Engineering:**
- Emphasizes matching skills from job description
- Incorporates job keywords for ATS
- Reframes experience to highlight relevant achievements
- **Maintains honesty** - doesn't add fake skills

**Input:** `state.userResume`, `state.structuredJD`  
**Output:** `state.tailoredResume`

---

### **Node 4: Generate PDF**

**File:** `agents/nodes/GeneratePDFNode.ts`

**What it does:**
- Takes tailored resume
- Generates professional PDF using metadata formatting
- Saves with standardized filename: `Name_Position_Company.pdf`

**Input:** `state.tailoredResume`  
**Output:** `state.pdfInfo`

---

### **Node 5: Auto-Apply**

**File:** `agents/nodes/AutoApplyNode.ts`

**Status:** ⚠️ Placeholder (manual apply required)

**Planned features:**
- Form field detection
- Auto-fill using resume data
- PDF upload handling
- Multi-step form navigation

**Input:** `state.tailoredResume`, `state.pdfInfo`  
**Output:** `state.applicationResult`

---

## 🔧 AI Provider Configuration

### **Why Multi-Provider?**

**Problem:** Using OpenAI API for every test request burns through free credits quickly.

**Solution:** Support multiple providers with auto-selection.

### **Supported Providers:**

| Provider | Cost | Speed | Quality | Use Case |
|----------|------|-------|---------|----------|
| **Google Gemini** | FREE | Fast | Good | Development & Testing |
| **OpenAI GPT-4** | Paid | Medium | Excellent | Production |

### **Usage:**

```typescript
// Auto-select (prefers free Gemini)
const llm = createAIProvider("auto");

// Force specific provider
const llm = createAIProvider("gemini");  // Free
const llm = createAIProvider("openai");  // Paid

// In API request
{
  "options": {
    "aiProvider": "gemini"  // or "openai" or "auto"
  }
}
```

### **Implementation:**

```typescript
// services/ai/AIProviderFactory.ts
export class AIProviderFactory {
  static createProvider(config: AIProviderConfig): BaseChatModel {
    switch (config.provider) {
      case "gemini":
        return new ChatGoogleGenerativeAI({
          modelName: "gemini-1.5-flash", // FREE tier
          apiKey: process.env.GEMINI_API_KEY,
        });
      
      case "openai":
        return new ChatOpenAI({
          modelName: "gpt-4o-mini",
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }
  }
}
```

---

## 🔄 State Management

The agent uses a **single state object** that flows through all nodes:

```typescript
interface JobApplicationState {
  // Input
  jobUrl: string;
  userResume: ResumeData;
  
  // Node outputs
  extractedJD?: ExtractedJD;
  structuredJD?: StructuredJD;
  tailoredResume?: ResumeData;
  pdfInfo?: PDFInfo;
  applicationResult?: ApplicationResult;
  
  // Control flow
  currentStep: string;
  errors: Error[];
  retryCount: number;
  
  // Options
  options?: {
    autoApply: boolean;
    generatePDF: boolean;
    aiProvider: "openai" | "gemini" | "auto";
  };
}
```

### **State Flow:**

```
Initial State (jobUrl + userResume)
  ↓
Node 1 adds: extractedJD
  ↓
Node 2 adds: structuredJD
  ↓
Node 3 adds: tailoredResume
  ↓
Node 4 adds: pdfInfo
  ↓
Node 5 adds: applicationResult
  ↓
Final State (complete with all results)
```

---

## 🌐 API Endpoints

### **1. Process Job Application**

```
POST /api/job/process
```

**Request:**
```json
{
  "jobUrl": "https://jobs.example.com/position",
  "userResume": { ... },  // Optional, uses sample if not provided
  "options": {
    "autoApply": false,    // Set true to auto-submit
    "generatePDF": true,   // Set false to skip PDF
    "aiProvider": "auto"   // "openai", "gemini", or "auto"
  }
}
```

**Response:**
```json
{
  "success": true,
  "state": { ... },
  "summary": {
    "status": "application_complete",
    "duration": "45s",
    "steps_completed": ["Extract JD", "Parse JD", "Tailor Resume", "Generate PDF"],
    "job": {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "requiredSkills": ["React", "Node.js", "TypeScript"]
    },
    "pdf": {
      "filename": "John_Doe_Senior_Software_Engineer_TechCorp.pdf",
      "size": "125.43 KB"
    }
  }
}
```

### **2. Get Agent Status**

```
GET /api/job/status
```

**Response:**
```json
{
  "status": "operational",
  "agent": "JobApplicationAgent",
  "pipeline": [
    "Node 1: Extract JD (Playwright MCP)",
    "Node 2: Parse JD (AI)",
    "Node 3: Tailor Resume (AI)",
    "Node 4: Generate PDF",
    "Node 5: Auto-Apply"
  ],
  "ai": {
    "availableProviders": ["gemini", "openai"],
    "recommendedProvider": "gemini",
    "currentDefault": "auto"
  }
}
```

---

## 🧪 Testing

### **Test with cURL:**

```bash
curl -X POST http://localhost:4000/api/job/process \
  -H "Content-Type: application/json" \
  -d '{
    "jobUrl": "https://www.linkedin.com/jobs/view/3847404589",
    "options": {
      "aiProvider": "gemini"
    }
  }'
```

### **Test with Sample Resume:**

The agent automatically uses `sampleResumeData` if no resume is provided.

### **Monitor Execution:**

Watch the console for detailed logs:
```
================================================================================
🚀 JOB APPLICATION AGENT STARTING
================================================================================
Job URL: https://jobs.example.com/123
Applicant: John Doe
================================================================================
────────────────────────────────────────────────────────────────────────────────
▶️  Node 1: Extract JD
────────────────────────────────────────────────────────────────────────────────
[Node 1] Starting job description extraction...
[McpClient] Clicked 3 expand buttons
✅ Node 1: Extract JD completed in 5.23s
...
```

---

## 🎯 Key Features Implemented

### ✅ **Button Clicking (Node 1)**
- Automatically clicks "Show More", "View More", "Read More" buttons
- Supports 10+ different selectors for various job sites
- Waits for content to load after each click

### ✅ **Multi-Provider AI Support**
- Google Gemini (FREE tier) for development
- OpenAI for production
- Auto-selection based on available API keys

### ✅ **Structured Output Parsing**
- Uses Zod schemas for type-safe AI responses
- Falls back to simple parsing if structured output fails
- Validates all AI-generated data

### ✅ **Error Handling & Retry Logic**
- Each node can retry up to 3 times
- Exponential backoff between retries
- Detailed error logging

### ✅ **State Management**
- Single state object flows through all nodes
- Immutable updates (no side effects)
- Full execution history preserved

---

## 📝 Example Usage

```typescript
import { JobApplicationAgent } from './agents/JobApplicationAgent';
import { createInitialState } from './state/JobApplicationState';
import { sampleResumeData } from './services/resume/ResumeSchema';

// Create agent
const agent = new JobApplicationAgent();

// Create initial state
const state = createInitialState(
  "https://jobs.example.com/123",
  sampleResumeData,
  {
    autoApply: false,
    generatePDF: true,
    aiProvider: "gemini"  // Use free tier
  }
);

// Run pipeline
const result = await agent.processJob(state);

// Access results
console.log("Job:", result.structuredJD?.title);
console.log("PDF:", result.pdfInfo?.filepath);
console.log("Status:", result.currentStep);
```

---

## 🚧 TODO / Future Enhancements

- [ ] Implement full auto-apply in Node 5
- [ ] Add support for more AI providers (Anthropic Claude, Cohere)
- [ ] Implement resume versioning (track changes)
- [ ] Add human-in-the-loop for review before applying
- [ ] Support multiple resume formats (import from PDF, LinkedIn)
- [ ] Add analytics/tracking for application success rates
- [ ] Implement job search automation (scrape multiple sites)

---

## 🔍 Troubleshooting

### **"No AI provider API keys found"**
- Set `GEMINI_API_KEY` (free at https://ai.google.dev/) or `OPENAI_API_KEY`

### **"Button clicking failed"**
- Some sites use dynamic selectors - add custom selectors to `McpClient.ts`

### **"AI parsing failed"**
- Check AI provider quota/limits
- Try switching to different provider
- Review raw extracted text for issues

---

## 📦 Dependencies

```json
{
  "langchain": "Latest",
  "@langchain/core": "Latest",
  "@langchain/openai": "Latest",
  "@langchain/google-genai": "Latest",
  "zod": "^3.25.76",
  "@paralleldrive/cuid2": "^3.0.4",
  "playwright": "^1.40.0"
}
```

---

**🎉 Your LangGraph job application agent is ready!**

Start it with: `npm run dev` and POST to `/api/job/process`
