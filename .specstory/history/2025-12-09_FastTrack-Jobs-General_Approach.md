# FastTrack Jobs - General Approach Implementation

**Date:** December 9, 2025  
**Branch:** General_Approach  
**Status:** Core Features Implemented

---

## Overview

Built a standalone backend + Electron-integrated service for "Fast Track Job Tracker" app that automates job application workflows using AI and browser automation.

### Tech Stack
- **Backend:** Node.js + TypeScript (Fastify API)
- **Frontend:** React + TypeScript (Vite)
- **Desktop:** Electron (headed app, base for future services)
- **Browser Automation:** Playwright MCP (Model Context Protocol) server controlled by LLM
- **AI Model:** OpenAI (via Node backend with clean abstractions)

---

## Architecture Decisions

### High-Level Architecture
```
┌─────────────┐
│  React UI   │ ← User enters job URL
└──────┬──────┘
       │ POST /api/extract-job
       ▼
┌─────────────────┐
│  Fastify Backend│
│   (Node+TS)     │
└────┬───────┬────┘
     │       │
     │       └──→ OpenAI (structure JD, tailor resume)
     ▼
┌────────────────┐         ┌──────────────┐
│  MCP Client    │────────→│ Playwright   │
│  (SDK stdio)   │         │ MCP Server   │
└────────────────┘         └──────────────┘
                                  │
                                  ▼
                           [Real Browser]
                           Extract JD, fill forms, upload PDF
```

### Key Design Choices

1. **Framework Selection: Fastify over Express**
   - **Why:** Higher performance for JSON APIs, built-in schema validation
   - **Benefits:** First-class TypeScript support, plugin ecosystem, less boilerplate
   - **Trade-off:** Slightly less familiar than Express but better for AI/MCP orchestration

2. **MCP Integration: Langchain-Style Approach**
   - Implemented similar to Python's `langchain-mcp-adapters`
   - Spawns Playwright MCP server via stdio transport
   - Fallback to direct Playwright if MCP SDK unavailable
   - Progressive retry strategies for resilience

3. **AI Provider Abstraction**
   - Interface-based design allows swapping OpenAI/Azure/local LLMs
   - Prompt templates separated from logic
   - Structured JSON responses with validation

4. **Resume Storage & Naming Convention**
   - Format: `Name_Position_Company.pdf`
   - Storage: User profile `~/.fasttrack/`
   - HTML → PDF rendering via Playwright for consistent output

---

## Implementation Journey

### Phase 1: Project Scaffolding (Dec 1-2)

**Created Monorepo Structure:**
```
backend/
  src/
    server.ts                # Fastify entry
    routes/
      extract.ts             # /api/extract-job
      generate.ts            # /api/generate-resume
      apply.ts               # /api/apply
    services/
      ai/OpenAIAdapter.ts    # OpenAI client
      mcp/McpClient.ts       # MCP SDK wrapper + Playwright fallback
      pdf/PdfService.ts      # PDF generation (HTML → PDF)
      resume/ResumeSchema.ts # Zod schema
    lib/prompt-templates.ts  # AI prompts
frontend/
  src/
    App.tsx                  # React UI
    index.css                # Neutral green theme
electron/                    # (future: Electron wrapper)
```

**Package Management:**
- Backend: `@fastify/cors`, `openai`, `playwright`, `zod`, `@modelcontextprotocol/sdk`
- Frontend: `react`, `vite`, `axios`
- TypeScript configs with strict mode enabled

### Phase 2: Backend Core Implementation (Dec 2-3)

**1. Fastify Server Setup**
- CORS enabled for local development
- Health check route at `/`
- Error handling middleware
- JSON body parsing
- Logging with Pino

**2. API Routes Implemented**

**POST /api/extract-job**
```typescript
// Request
{ "jobUrl": "https://example.com/job" }

// Response
{
  "jobId": "job-1234567890",
  "url": "https://example.com/job",
  "jd": {
    "title": "Software Engineer",
    "company": "ExampleCorp",
    "responsibilities": ["Build features", "..."],
    "requiredSkills": ["TypeScript", "React"],
    "niceToHaveSkills": ["GraphQL"],
    "summary": "..."
  },
  "rawText": "..."
}
```

**POST /api/generate-resume**
```typescript
// Request
{
  "resumeJson": { "name": "...", "contact": {...}, ... },
  "jd": { "title": "...", "company": "..." }
}

// Response
{
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf",
  "resumePdfUrl": "file://..."
}
```

**POST /api/apply**
```typescript
// Request
{
  "jobUrl": "https://example.com/job",
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\..."
}

// Response
{
  "taskId": "task-1234567890",
  "status": "started",
  "message": "Application process initiated"
}
```

### Phase 3: Playwright MCP Integration (Dec 3-4)

**Initial Approach: Custom MCP Server**
- Created standalone Node.js MCP server (`mcp-server/server.js`)
- Exposed endpoints: `/open`, `/extract-jd`, `/detect-fields`, `/apply`
- Issues: HTTP-based approach didn't match MCP SDK stdio protocol

**Refactored Approach: MCP SDK + Fallback**
```typescript
// MCP SDK initialization (like Python's MultiServerMCPClient)
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['@playwright/mcp@latest']
});
const client = new Client(
  { name: 'fasttrack', version: '1.0.0' },
  { capabilities: {} }
);
await client.connect(transport);

// Call MCP tools
await client.callTool({ name: 'browser_navigate', arguments: { url } });
const snapshot = await client.callTool({ name: 'browser_snapshot', arguments: {} });
```

**Fallback Strategy:**
- If MCP SDK unavailable → direct Playwright
- If MCP tools fail → direct Playwright
- Ensures app works even without MCP server running

**HTTP/2 Protocol Error Fix (Dec 4)**

Problem: `ERR_HTTP2_PROTOCOL_ERROR` on sites like naukrigulf.com

**Solution:**
```typescript
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US'
});

// Three-tier retry fallback
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
} catch (e) {
  if (e.message.includes('ERR_HTTP2_PROTOCOL_ERROR') || e.message.includes('timeout')) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
    } catch (e2) {
      await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(1500);
    }
  }
}
```

**Why it works:**
- Realistic user agent bypasses bot detection
- Progressive fallbacks handle HTTP/2 issues
- Viewport/locale makes browser appear legitimate

### Phase 4: AI Integration (Dec 2-4)

**OpenAI Adapter Implementation**
```typescript
class OpenAIAdapter implements AIProvider {
  async generateStructured(promptKey: string, payload: any): Promise<StructuredResult> {
    const prompt = this.buildPrompt(promptKey, payload);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt + '\n\nRespond with ONLY valid JSON' }
      ],
      temperature: 0.5
    });
    return JSON.parse(response.choices[0]?.message.content || '{}');
  }
}
```

**Prompt Templates:**

1. **Extract JD Prompt**
```
Extract job title, company, responsibilities, required skills, and nice-to-have skills.
Return JSON with exact structure: { title, company, responsibilities[], requiredSkills[], niceToHaveSkills[], summary }
```

2. **Tailor Resume Prompt**
```
Given a resume JSON and job description:
- Reorder experience bullets to match JD keywords
- Update summary for relevance
- Highlight matching skills first
- NEVER fabricate - only use existing resume data
Return tailored resume JSON with same structure
```

**AI Fallback Strategy:**
- If OpenAI quota exceeded → return raw text/original resume
- Log warning but don't break user flow
- Frontend still displays data

### Phase 5: PDF Generation (Dec 3-4)

**Implementation:**
```typescript
static async generatePdfForResume(
  resumeJson: any, 
  jobTitle?: string, 
  company?: string
): Promise<string> {
  // Format: Name_Position_Company.pdf
  const name = safe(resumeJson?.name || 'resume');
  const title = safe(jobTitle || '');
  const companyName = safe(company || '');
  const fileName = `${name}_${title}_${companyName}.pdf`;
  
  // Generate HTML resume
  const html = this.generateResumeHtml(resumeJson, jobTitle, company);
  
  // Render to PDF via Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  await browser.close();
  
  return filePath;
}
```

**HTML Template Features:**
- Clean layout with Arial font
- Sections: Summary, Skills, Experience, Education
- Job application context displayed at top
- Print-optimized CSS (no margins, proper page breaks)

### Phase 6: Frontend UI (Dec 2-4)

**Design System:**
- Neutral color palette with sage green accents (`#5a7c6c`)
- Responsive layout (mobile-friendly)
- Loading states for all async actions
- Error handling with user-friendly messages

**Component Structure:**
```tsx
function App() {
  const [jobUrl, setJobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [error, setError] = useState('');
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const handleSubmit = async (e) => { /* Extract JD */ };
  const handleGenerate = async () => { /* Generate Resume */ };
  const handleApply = async () => { /* Apply (stub) */ };
  
  return (
    <div className="app-container">
      {/* Form, JD Display, Action Buttons */}
    </div>
  );
}
```

**User Flow:**
1. Enter job URL → Submit
2. View structured JD (title, company, skills, responsibilities)
3. Click "Generate Tailored Resume" → See PDF path
4. Click "Apply Now" → Get task ID (stub)

**TypeScript Fixes:**
- Added `moduleResolution: "bundler"` to tsconfig
- Added `types: ["vite/client", "react"]`
- Fixed JSX intrinsic elements errors

### Phase 7: Configuration & Environment

**Backend `.env`:**
```env
OPENAI_API_KEY=sk-proj-...
START_MCP=false
APP_STORAGE_DIR=~/.fasttrack
PORT=4000
```

**Frontend Vite Config:**
```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      }
    }
  }
});
```

---

## Component Deep Dive

### 1. McpClient (MCP Integration)

**Purpose:** Bridge between backend and Playwright browser automation

**Responsibilities:**
- Initialize MCP SDK connection to Playwright MCP server
- Call MCP tools: `browser_navigate`, `browser_snapshot`, `page_evaluate`
- Fallback to direct Playwright if MCP unavailable
- Extract job descriptions with retry logic

**Key Methods:**
```typescript
async extractJobDescription(url: string): Promise<ExtractedJD> {
  // Try MCP tools first
  if (callTool) {
    await callTool('browser_navigate', { url });
    const pageText = await callTool('page_evaluate', { 
      expression: 'document.body.innerText' 
    });
    return { title, text: pageText };
  }
  // Fallback to direct Playwright
  return this.extractWithPlaywright(url);
}
```

### 2. OpenAIAdapter (AI Integration)

**Purpose:** Abstract AI provider interactions

**Responsibilities:**
- Call OpenAI chat completions API
- Build prompts from templates
- Parse and validate JSON responses
- Handle API errors gracefully

**Extensibility:**
- Interface allows swapping OpenAI → Azure/Claude/local LLM
- Prompt templates externalized for easy tuning
- Temperature/model configurable

### 3. PdfService (Resume Generation)

**Purpose:** Create professional PDF resumes

**Responsibilities:**
- Generate HTML from resume JSON
- Apply consistent styling
- Render to PDF via Playwright
- Enforce naming convention: `Name_Position_Company.pdf`

**HTML Template Structure:**
```html
<h1>Name</h1>
<div class="contact">email | phone</div>
<div><strong>Applying for:</strong> Position at Company</div>
<div class="section"><h2>Summary</h2><p>...</p></div>
<div class="section"><h2>Skills</h2><p>skill1, skill2</p></div>
<div class="section"><h2>Experience</h2>...</div>
<div class="section"><h2>Education</h2>...</div>
```

### 4. Routes (API Endpoints)

**extract.ts:**
- Validates job URL
- Calls MCP to navigate and extract
- Calls OpenAI to structure JD
- Handles AI failures with raw text fallback

**generate.ts:**
- Validates resume JSON with Zod schema
- Calls OpenAI to tailor resume
- Generates PDF with job context
- Returns both JSON and PDF path

**apply.ts:**
- Accepts job URL, resume JSON, PDF path
- Returns task ID immediately
- Runs apply flow asynchronously (stub)
- Ready for form-filling implementation

### 5. Frontend App (User Interface)

**Purpose:** Provide intuitive UI for job application workflow

**Key Features:**
- URL input with validation
- Structured JD display (cards for skills, responsibilities)
- Loading states for async operations
- Error messages with retry hints
- PDF path display when generated

**State Management:**
```typescript
const [jobData, setJobData] = useState<JobData | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [pdfPath, setPdfPath] = useState<string | null>(null);
```

---

## Current Feature Status

### ✅ Fully Implemented

1. **Job Description Extraction**
   - Navigate to any job URL via Playwright
   - Extract raw HTML/text with fallback strategies
   - Structure JD using OpenAI (title, company, skills, responsibilities)
   - Display in clean UI with skills tags

2. **Resume Tailoring**
   - Accept resume JSON input
   - Tailor to job description using AI
   - Maintain resume structure and facts
   - Fallback to original if AI fails

3. **PDF Generation**
   - HTML template with professional styling
   - Playwright rendering for consistent output
   - Naming convention: `Name_Position_Company.pdf`
   - Storage in user profile directory

4. **Resilient Browser Automation**
   - MCP SDK integration with stdio transport
   - Direct Playwright fallback
   - User agent spoofing
   - Progressive retry strategies (networkidle → domcontentloaded → load)
   - HTTP/2 error handling

5. **API Layer**
   - RESTful endpoints with JSON responses
   - Request validation with Zod
   - Error handling with user-friendly messages
   - CORS enabled for local development

6. **Frontend UI**
   - React + TypeScript with Vite
   - Responsive design with neutral colors
   - Loading states and error handling
   - API proxy configuration

### 🚧 Partially Implemented / Stubbed

1. **Apply Flow**
   - Endpoint exists and returns task ID
   - Async task execution stubbed
   - Missing: form field detection, max-length enforcement, file upload, submission

2. **Real-time Progress**
   - GET `/apply/status/:taskId` returns placeholder
   - Missing: WebSocket/SSE for live updates

3. **Electron Integration**
   - Folder structure created
   - Missing: main process, IPC channels, MCP server lifecycle management

### ❌ Not Yet Implemented

1. **Form Filling Automation**
   - Detect form fields and constraints
   - Map resume JSON to form fields
   - Enforce max-length with semantic truncation
   - Upload PDF to file inputs
   - Submit application

2. **Task Management**
   - Persistent task storage
   - Real-time status updates
   - Task history and logs

3. **Testing**
   - E2E tests with sample job pages
   - Unit tests for services
   - Integration tests for API routes

4. **CI/CD & Packaging**
   - GitHub Actions workflows
   - Electron Builder configuration
   - Automated releases

---

## End-to-End Flow (Current State)

### Flow 1: Extract Job Description ✅

```
User enters URL in frontend
    ↓
Frontend POST /api/extract-job
    ↓
Backend McpClient.extractJobDescription()
    ↓
Try MCP tools (browser_navigate, browser_snapshot)
    ↓ (if MCP fails)
Direct Playwright with fallback strategies
    ↓
Extract page text (try selectors: article, .job-description, etc.)
    ↓
OpenAI structures JD → JSON { title, company, responsibilities[], skills[] }
    ↓ (if OpenAI fails)
Return raw text with minimal structure
    ↓
Frontend displays structured JD with skill tags
```

### Flow 2: Generate Tailored Resume ✅

```
User clicks "Generate Tailored Resume"
    ↓
Frontend POST /api/generate-resume { resumeJson, jd }
    ↓
Backend validates resume with Zod schema
    ↓
OpenAI tailors resume (reorder bullets, update summary)
    ↓ (if OpenAI fails)
Use original resume
    ↓
PdfService.generatePdfForResume()
    ↓
Build HTML template with job context
    ↓
Playwright renders HTML → PDF
    ↓
Save to ~/.fasttrack/Name_Position_Company.pdf
    ↓
Frontend displays PDF path
```

### Flow 3: Apply to Job (Stub) 🚧

```
User clicks "Apply Now"
    ↓
Frontend POST /api/apply { jobUrl, resumeJson, resumePdfPath }
    ↓
Backend returns taskId immediately
    ↓
Async task starts (currently just logs)
    ↓
Frontend shows "Application process initiated"

TODO:
    ↓
McpClient navigates to job URL
    ↓
Detect form fields (input, textarea, select)
    ↓
Map resume JSON to fields
    ↓
Fill fields with max-length enforcement
    ↓
Upload PDF to file input
    ↓
Submit form
    ↓
Detect confirmation
    ↓
Update task status
```

---

## Key Technical Decisions & Rationale

### 1. Why Fastify over Express?
- **Performance:** ~65% faster for JSON APIs
- **Schema Validation:** Built-in support for JSON schemas
- **TypeScript:** Better type inference and plugin system
- **Developer Experience:** Less boilerplate for common tasks

### 2. Why MCP SDK with Fallback?
- **Future-proofing:** MCP is emerging standard for AI-browser interaction
- **Flexibility:** Can swap MCP providers (Playwright → Selenium → others)
- **Resilience:** Fallback ensures app works even if MCP unavailable
- **Langchain-style:** Similar pattern to Python's proven approach

### 3. Why Playwright for PDF Generation?
- **Consistency:** Same rendering engine across platforms
- **No External Dependencies:** No need for wkhtmltopdf or similar
- **Advanced Layouts:** Supports modern CSS (flexbox, grid)
- **Already Installed:** Reuse Playwright from MCP automation

### 4. Why Zod for Schema Validation?
- **TypeScript Integration:** Infers types from schemas
- **Runtime Validation:** Ensures data integrity at API boundaries
- **Clear Error Messages:** Easy to debug validation failures
- **Composable:** Can build complex schemas from simple ones

### 5. Why Progressive Retry Strategies?
- **HTTP/2 Issues:** Some sites fail with strict `networkidle`
- **Bot Detection:** Realistic user agent + viewport bypass checks
- **Network Variability:** Fallbacks handle slow/unreliable connections
- **User Experience:** Extraction succeeds more often

---

## Challenges Encountered & Solutions

### Challenge 1: HTTP/2 Protocol Errors

**Problem:**
```
ERR_HTTP2_PROTOCOL_ERROR at https://www.naukrigulf.com/...
```

**Root Cause:**
- Site uses HTTP/2 protocol
- Playwright's `networkidle` wait too strict
- Headless browser detected as bot

**Solution:**
```typescript
// Realistic browser context
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US'
});

// Progressive fallbacks
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
} catch {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
}
```

### Challenge 2: OpenAI Quota Exceeded

**Problem:**
- 429 errors when quota exceeded
- Breaks entire extraction flow

**Solution:**
```typescript
let structuredJd: any = null;
try {
  const ai = new OpenAIAdapter();
  structuredJd = await ai.generateStructured('extract-jd', { htmlOrText });
} catch (aiErr) {
  fastify.log.warn({ aiErr }, 'AI extraction failed, returning raw text');
  structuredJd = { 
    title: rawJd.title, 
    text: rawJd.text,
    // ... minimal structure
  };
}
```

### Challenge 3: React TypeScript JSX Errors

**Problem:**
```
Property 'div' does not exist on type 'JSX.IntrinsicElements'
```

**Root Cause:**
- Missing `moduleResolution` in tsconfig
- JSX types not properly loaded

**Solution:**
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "react"]
  }
}
```

### Challenge 4: MCP SDK Module Resolution

**Problem:**
```
Cannot find module '@modelcontextprotocol/sdk/client'
```

**Root Cause:**
- TypeScript moduleResolution mismatch
- MCP SDK uses ESM exports

**Solution:**
```typescript
// Dynamic import as fallback
const sdkClientMod: any = await import('@modelcontextprotocol/sdk/client');
const transportMod: any = await import('@modelcontextprotocol/sdk/transport/node');
```

### Challenge 5: PDF Naming with Special Characters

**Problem:**
- Job titles/company names contain spaces, slashes, special chars
- File system doesn't allow certain characters

**Solution:**
```typescript
const safe = (s: string) => String(s || '')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_+|_+$/g, '');

const fileName = `${safe(name)}_${safe(title)}_${safe(company)}.pdf`;
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | - | Yes |
| `PORT` | Backend server port | 4000 | No |
| `START_MCP` | Auto-start bundled MCP server | false | No |
| `APP_STORAGE_DIR` | PDF storage directory | `~/.fasttrack` | No |
| `MCP_BASE` | MCP server base URL (if using HTTP) | http://127.0.0.1:9222 | No |

### Frontend Configuration

**Vite Dev Server:**
- Port: 3000 (falls back to 3001 if busy)
- API Proxy: `/api` → `http://127.0.0.1:4000`

---

## Testing & Verification

### Manual Testing Checklist

**Extract Job Description:**
- [x] Works with naukri.com, naukrigulf.com
- [x] Handles HTTP/2 sites
- [x] Returns structured JD with OpenAI
- [x] Falls back to raw text if AI fails
- [x] Displays in UI correctly

**Generate Resume:**
- [x] Validates resume JSON
- [x] Tailors resume (or returns original)
- [x] Generates PDF with correct naming
- [x] Stores in ~/.fasttrack/
- [x] Returns PDF path to UI

**Apply (Stub):**
- [x] Returns task ID
- [x] Logs placeholder message
- [ ] Real form filling (not implemented)

**Error Handling:**
- [x] Invalid job URL → 400 error
- [x] Missing resumeJson → 400 error
- [x] OpenAI quota → fallback to raw/original
- [x] Network errors → retries with fallbacks

---

## Codebase Statistics

**Total Files:** ~25  
**Languages:** TypeScript (95%), CSS (3%), JSON (2%)

**Backend:**
- Routes: 3 (extract, generate, apply)
- Services: 5 (ai, mcp, pdf, resume schema, prompt templates)
- LOC: ~800

**Frontend:**
- Components: 1 main App
- LOC: ~350

**Configuration:**
- tsconfig: 2 (backend, frontend)
- package.json: 2
- vite.config: 1

---

## Next Steps & Roadmap

### Immediate (Week 1-2)

1. **Implement Form Filling**
   ```typescript
   async applyToJob(data: ApplyData) {
     const page = await this.navigateToJob(data.jobUrl);
     const fields = await this.detectFormFields(page);
     await this.fillFields(page, fields, data.resumeJson);
     await this.uploadPdf(page, data.resumePdfPath);
     await this.submitForm(page);
     return { success: true };
   }
   ```

2. **Add Field Constraint Enforcement**
   - Detect `maxLength` attributes
   - Truncate text semantically (preserve key phrases)
   - Map resume JSON fields to form inputs intelligently

3. **Real-time Task Status**
   - WebSocket or SSE for live updates
   - Store task state in memory/Redis
   - Frontend progress indicator

### Short-term (Month 1)

4. **Electron Integration**
   - Main process to launch backend + MCP server
   - IPC channels for apply status
   - Desktop notifications on completion

5. **Enhanced Resume Tailoring**
   - ATS keyword optimization
   - Bullet point prioritization
   - Summary rewriting with job-specific language

6. **Error Recovery**
   - Retry failed applications
   - Manual intervention UI for captchas
   - Application history and logs

### Mid-term (Month 2-3)

7. **Testing Suite**
   - Unit tests with Vitest
   - E2E tests with Playwright Test
   - Mock MCP server for testing

8. **Multi-Resume Support**
   - Upload/store multiple resume templates
   - Select best match for job
   - Version control for resumes

9. **Analytics Dashboard**
   - Application success rate
   - Time saved metrics
   - Job match scoring

### Long-term (Month 4+)

10. **Multi-Platform Job Boards**
    - LinkedIn, Indeed, Glassdoor integrations
    - Site-specific apply strategies
    - Auto-login with credential storage

11. **AI Cover Letter Generation**
    - Personalized cover letters
    - Company research integration
    - Tone adjustment (formal/casual)

12. **Batch Processing**
    - Apply to multiple jobs in queue
    - Scheduling (apply during business hours)
    - Daily application limits

---

## Lessons Learned

### 1. Resilience Over Perfection
- MCP fallback to direct Playwright ensures app always works
- AI fallbacks keep UI functional even with quota issues
- Progressive retries handle network variability

### 2. User Experience First
- Return partial results rather than errors
- Show loading states for all async operations
- Provide clear error messages with next steps

### 3. Abstraction Enables Flexibility
- AIProvider interface allows swapping models
- MCP + Playwright combo future-proofs automation
- Zod schemas centralize validation logic

### 4. TypeScript Configuration Matters
- moduleResolution affects library compatibility
- Strict mode catches bugs early
- Type inference reduces boilerplate

### 5. Browser Automation is Fragile
- Sites change layouts frequently
- Bot detection requires constant adaptation
- Fallback selectors (article → .job-description → main) improve success

---

## Conclusion

FastTrackJobs now has a solid foundation for AI-powered job application automation. The core features—job description extraction, resume tailoring, and PDF generation—are production-ready with robust error handling and fallback strategies.

The architecture supports future expansion:
- Modular design allows easy addition of new AI providers
- MCP integration provides a standard interface for browser automation
- Electron scaffold ready for desktop app packaging

**Key Achievements:**
- ✅ Reliable JD extraction from diverse job sites
- ✅ AI-powered resume tailoring with fallbacks
- ✅ Professional PDF generation with naming convention
- ✅ Clean, responsive UI with loading states
- ✅ Comprehensive documentation

**Ready for:**
- Form filling implementation (next major milestone)
- Electron desktop app packaging
- Real-time task monitoring
- Production deployment

**Current State:**
- Backend & Frontend fully functional
- MCP integration with Playwright fallback
- OpenAI integration with quota handling
- PDF generation working correctly
- Ready for apply flow implementation

---

## Quick Reference

### Start Development

```powershell
# Backend
cd backend
npm install --legacy-peer-deps
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Test Extraction

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:4000/api/extract-job `
  -Method Post `
  -Body '{"jobUrl":"https://example.com/job"}' `
  -ContentType 'application/json'
```

### Access UI

Open http://localhost:3000 (or 3001)

### Check Logs

Backend logs are in terminal (Pino JSON format)

### Find Generated PDFs

Windows: `C:\Users\YourName\.fasttrack\`  
Mac/Linux: `~/.fasttrack/`

---

**Document Version:** 1.0  
**Last Updated:** December 9, 2025  
**Status:** Core Implementation Complete  
**Next Milestone:** Form Filling & Apply Flow
