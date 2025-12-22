# 🚀 FastTrackJobs

> AI-powered job application automation using LangGraph, Playwright MCP, OpenAI, and React/Electron.

**Automate your job search workflow** - Extract job descriptions, tailor resumes with AI, generate professional PDFs, and auto-apply to positions with intelligent form filling.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [LangGraph Approach](#langgraph-approach)
- [Modules](#modules)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [Development](#development)
- [API Reference](#api-reference)
- [Contributing](#-contributing)
- [Next Steps](#next-steps)
- [License](#license)

---

## 🏗️ Project Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│              User Interface + Job Tracking UI               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Fastify Backend (Node.js + TypeScript)      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         LangGraph Workflow Orchestration             │  │
│  │    (State Graph with Conditional Edge Routing)       │  │
│  │                                                       │  │
│  │   ExtractJD → ParseJD → TailorResume → GeneratePDF   │  │
│  │                          ↓                            │  │
│  │                      AutoApply                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼               │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│  │ OpenAI   │      │ Copilot  │      │   MCP    │         │
│  ⚡│ Adapter  │      │  Proxy   │      │  Client  │         │
│  └──────────┘      └──────────┘      └──────────┘         │
│                                             │               │
└─────────────────────────────────────────────┼───────────────┘
                                              ▼
                                    ┌──────────────────┐
                                    │ Playwright MCP   │
                                    │     Server       │
                                    └────────┬─────────┘
---

## 📦 Modules

### 🎨                                   [Real Browser]
                             Extract JD, fill forms, upload PDF
```

### LangGraph Approach

This project uses **LangGraph** for workflow orchestration with a **Node and State Graph** architecture:

- **State Graph**: Maintains shared state (`JobApplicationState`) across all nodes
- **Nodes**: Independent processing units (ExtractJD, ParseJD, TailorResume, GeneratePDF, AutoApply)
- **Conditional Edges**: Route workflow based on state (e.g., skip AutoApply if PDF generation fails)
- **Workflow Orchestration**: Ensures proper sequencing and error handling across the job application pipeline

## Modules

### Frontend Module
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with CSS modules
- **State Management**: React hooks
- **HTTP Client**: Fetch API
- **⚙️ Features**: Job URL input, JD display, resume generation, application tracking dashboard

### Backend Module
- **Runtime**: Node.js 20+
- **Framework**: Fastify (high-performance web framework)
- **Language**: TypeScript
- **Workflow Engine**: LangGraph for state-based orchestration
---

## 🛠️*Architecture**: Modular services with dependency injection

### Technology Stack

**Frontend Technologies:**
- React 18
- TypeScript
- Vite
- CSS3

**Backend Technologies:**
- Node.js 20+
- TypeScript
- Fastify
- LangGraph (workflow orchestration)
- Zod (schema validation)
- Playwright (browser automation)

**AI Integration:**
- OpenAI API (GPT-4)
- Copilot Proxy Adapter
- MCP (Model Context Protocol)

**Development Tools:**
---

## 🤖 Service Details: AI Integration (Workflow Orchestration)

### LangGraph Workflow Engine

## Service Details: AI Integration (Workflow Orchestration)

### LangGraph Workflow

The backend uses **LangGraph** to orchestrate the job application process through a state graph:

**1. ExtractJDNode**
- Uses Playwright MCP to navigate to job URL
- Captures page snapshot and extracts raw text
- Outputs: `rawJobText`

**2. ParseJDNode**
- Sends raw text to OpenAI/Copilot
- Structures JD into: title, company, location, responsibilities, skills
- Outputs: Structured `jd` object

**3. TailorResumeNode**
- Uses AI to tailor resume bullets/summary to match JD keywords
- Reorders experience and skills for relevance
- Outputs: `tailoredResumeJson`

**4. GeneratePDFNode**
- Generates HTML template from tailored resume
- Renders PDF using Playwright with naming: `Name_Position_Company.pdf`
- Stores in app data directory
- Outputs: `resumePdfPath`

**5. AutoApplyNode**
- Navigates to job application page via MCP
- Detects form fields and constraints
---

## 💻 Development

Start all development servers and the Electron app:

```bash
# Run all modules concurrently
yarn dev
```

Or start individual modules:

### Frontend Development Server
- Outputs: `applicationStatus`
# Development

**Backend Development Server:**

```powershell
cd backend
npm run dev
```

---

## 📚 API Reference

### POST /api/extract-job

Extract and parse job description from URL.

**Request:**
```json
{ 
  "jobUrl": "https://example.com/job" 
}
```

**Response:**
```json
{
  "jobId": "job-1234567890",
  "url": "https://example.com/job",
  "jd": {
    "title": "Software Engineer",
    "company": "ExampleCorp",
    "location": "Remote",
    "responsibilities": ["Build features", "..."],
    "requiredSkills": ["TypeScript", "React"],
    "niceToHaveSkills": ["GraphQL"],
    "summary": "..."
  },
  "rawText": "..."
}
```

### POST /api/generate-resume

Generate tailored resume PDF from job description.

**Request:**
```json
---

{
  "resumeJson": { "name": "...", "contact": {...}, ... },
  "jd": { "title": "...", "company": "..." }
}
```

**Response:**
```json
{
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf",
  "resumePdfUrl": "file://C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf"
}
```

### POST /api/apply

Auto-apply to job with tailored resume.

**Request:**
```json
{
  "jobUrl": "https://example.com/job",
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\..."
}
```

**Response:**
```json
{
  "taskId": "task-1234567890",
  "status": "started",
  "message": "Application process initiated"
}
```

---
---

### 📁
## 🎯 Technology Stack127.0.0.1:4000

**Frontend Development Server:**

```powershell
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173 (Vite default)

**R🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS Modules** - Scoped styling
- **Fetch API** - HTTP client

### Backend
- **Node.js 20+** - Runtime environment
- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe development
- **LangGraph** - Workflow orchestration engine
- **Zod** - Runtime schema validation

### AI & Automation
- **OpenAI GPT-4** - Resume tailoring and JD parsing
- **Copilot Proxy** - Alternative AI provider
- **Playwright** - Browser automation
- **MCP SDK** - Model Context Protocol integration

### Development Tools
- **tsx** - TypeScript execution
- **ESBuild** - Fast bundling
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📝 Development Notes

### LangGraph Implementation

The project uses a **state graph** pattern for workflow management:

```typescript
// State flows through nodes
ExtractJDNode → ParseJDNode → TailorResumeNode → GeneratePDFNode → AutoApplyNode
  # MCP Integration

Model Context Protocol integration for browser automation:

```typescript
// Initialize MCP client with stdio transport
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['@playwright/mcp@latest'],
});
const client = new Client({ 
  name: 'fasttrack', 
  version: '1.0.0' 
}, { 
  capabilities: {} 
});
await client.connect(transport);

// Call browser automation tools
await client.callTool({ 
  name: 'browser_navigate', 
  arguments: { url } 
});
const snapshot = await client.callTool({ 
  name: 'browser_snapshot', 
  arguments: {} 
});
```

**Fallback Strategy**: If MCP SDK fails, uses direct Playwright for compatibility.

### File Structure

```
backend/
  src/
    server.ts                           # Fastify entry point
    agents/
      JobApplicationAgent.ts             # LangGraph orchestrator
      nodes/
        ExtractJDNode.ts                 # Job description extraction
        ParseJDNode.ts                   # JD parsing with AI
        TailorResumeNode.ts              # Resume customization
        GeneratePDFNode.ts               # PDF generation
        AutoApplyNode.ts                 # Automated application
    routes/
      extract.ts                         # /api/extract-job
      generate.ts                        # /api/generate-resume
      apply.ts                           # /api/apply
      job-agent.ts                       # /api/job-agent (LangGraph)
    services/
      ai/
        AIProvider.ts                    # AI provider interface
        AIProviderFactory.ts             # Provider factory
        OpenAIAdapter.ts                 # OpenAI implementation
        CopilotProxyAdapter.ts           # Copilot implementation
      mcp/McpClient.ts                   # MCP SDK wrapper
      pdf/PdfService.ts                  # PDF generation service
      resume/ResumeSchema.ts             # Zod schema + validation
    state/JobApplicationState.ts         # LangGraph state definition
    lib/
      prompt-templates.ts                # AI prompts
      resume-formatting-guidelines.ts    # Resume formatting rules
frontend/
  src/
    App.tsx                              # React UI
    main.tsx                             # Entry point
    index.css                            # Global styles
electron/
  main.js                                # Electron main process (future)
```
cd frontend
npm install

# Install Playwright browsers (required for MCP)
cd .⚙️ Configuration

Create `backend/.env` file

### Configuration

Create `backend/.env`:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=4000
START_MCP=false
APP_STORAGE_DIR=C:\Users\YourName\.fasttrack
MCP_BASE=http://127.0.0.1:9222
COPILOT_PROXY_URL=http://localhost:5000

# LangGraph Configuration
ENABLE_AUTO_APPLY=false
MAX_RETRY_ATTEMPTS=3
```

**Configuration Options:**

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `PORT` | Backend port | 4000 |
| `START_MCP` | Auto-start bundled MCP server | false |
| `APP_STORAGE_DIR` | PDF storage directory | `~/.fasttrack` |
| `MCP_BASE` | MCP server base URL | http://127.0.0.1:9222 |
| `COPILOT_PROXY_URL` | Copilot proxy endpoint | - |
| `ENABLE_AUTO_APPLY` | Enable automated application submission | false |
| `MAX_RETRY_ATTEMPTS` | Max retries for failed nodes | 3 |

## API Reference

### POST /api/extract-job

**Request:**
```json
{ "jobUrl": "https://example.com/job" }
```

**Response:**
```json
{
  "jobId": "job-1234567890",
  "url": "https://example.com/job",
  "jd": {
    "title": "Software Engineer",
    "company": "ExampleCorp",
    "location": "Remote",
    "responsibilities": ["Build features", "..."],
    "requiredSkills": ["TypeScript", "React"],
    "niceToHaveSkills": ["GraphQL"],
    "summary": "..."
  },
  "rawText": "..."
}
```

### POST /api/generate-resume

**Request:**
```json
{
  "resumeJson": { "name": "...", "contact": {...}, ... },
  "jd": { "title": "...", "company": "..." }
}
```

**Response:**
```json
{
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf",
  "resumePdfUrl": "file://C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf"
}
```

### POST /api/apply

**Request:**
```json
---

{
  "jobUrl": "https://example.com/job",
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\..."
}
```

**Response:**
```json
{
  "taskId": "task-1234567890",
  "status": "started",
  "message": "Application process initiated"
}
```

## API Reference

### POST /api/extract-job

**Request:**
```json
{ "jobUrl": "https://example.com/job" }
```

**Response:**
```json
{
  "jobId": "job-1234567890",
  "url": "https://example.com/job",
  "jd": {
    "title": "Software Engineer",
    "company": "ExampleCorp",
    "location": "Remote",
    "responsibilities": ["Build features", "..."],
    "requiredSkills": ["TypeScript", "React"],
    "niceToHaveSkills": ["GraphQL"],
    "summary": "..."
  },
  "rawText": "..."
}
```

### POST /api/generate-resume

**Request:**
```json
{
  "resumeJson": { "name": "...", "contact": {...}, ... },
  "jd": { "title": "...", "company": "..." }
}
```

**Response:**
```json
{
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf",
  "resumePdfUrl": "file://C:\\Users\\You\\.fasttrack\\YourName_SoftwareEngineer_Company.pdf"
}
```

### POST /api/apply

**Request:**
```json
{
  "jobUrl": "https://example.com/job",
  "resumeJson": { ... },
  "resumePdfPath": "C:\\Users\\You\\.fasttrack\\..."
}
```

**Response:**
```json
{
  "taskId": "task-1234567890",
  "status": "started",
  "message": "Application process initiated"
}
```

## 🤝 Contributing

This is a **modular architecture** designed for scalability. When adding features:

### Guidelines

- **Keep modules independent and loosely coupled** - Each service should have a clear responsibility
- **Use shared types for consistency** - Define interfaces in `types/` and use across modules
- **Communicate via IPC or HTTP APIs** - No direct module imports between frontend/backend
- **Store configuration in app data directory** - Not in `.env` files for production
- **Add comprehensive TypeScript types** - All functions, parameters, and return values
- **Document all TODO comments** - For future implementation tracking
- **Write tests** - Unit tests for services, integration tests for workflows
- **Follow the LangGraph pattern** - New workflow nodes should extend base node interface
- **Maintain backward compatibility** - When modifying APIs or state schemas

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Run type checking and linting (`npm run type-check && npm run lint`)
5. Test your changes locally
6. Commit with descriptive messages (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Use TypeScript strict mode
---

## 🗺️Follow ESLint and Prettier configurations
- Write JSDoc comments for public APIs
- Use async/await over promises
- Handle errors gracefully with try/catch
- Log meaningful messages for debugging

## Next Steps

### 1. Refine Resume Formatting Guidelines
- [ ] Enhance `resume-formatting-guidelines.ts` with industry-specific templates
- [ ] Add ATS (Applicant Tracking System) optimization rules
- [ ] Implement dynamic formatting based on JD requirements
- [ ] Support multiple resume formats (chronological, functional, hybrid)

### 2. Resume PDF Format and Template
- [ ] Design professional PDF templates with customizable themes
- [ ] Add support for multiple column layouts
- [ ] Implement print-optimized CSS with proper page breaks
- [ ] Add company logo integration
- [ ] Support custom fonts and color schemes

### 3. Playwright MCP Integration for Auto-Apply and Retry Features
- [ ] Complete `AutoApplyNode.ts` implementation
- [ ] Add intelligent form field detection (text, dropdown, checkbox, file upload)
- [ ] Implement retry logic with exponential backoff
- [ ] Handle CAPTCHA detection and user notification
- [ ] Add screenshot capture on failure for debugging
- [ ] Support multi-page application flows

### 4. Adding Intelligence to Answer Questions and Form Fields
- [ ] Integrate AI to generate answers for common application questions
- [ ] Build a knowledge base from resume data for contextual responses
- [ ] Implement field constraint validation (maxLength, regex patterns)
- [ ] Add semantic truncation for long-form answers
- [ ] Support conditional question logic (show/hide based on previous answers)

### 5. Job Application Submission Notifications
- [ ] Implement success/failure notifications with format: `Company_Designation`
  - Example: `Google_Software_Developer_L3 - Application Submitted ✓`
- [ ] Add desktop notifications via Electron
- [ ] Email notification integration (optional)
- [ ] Discord/Slack webhook support for team tracking
- [ ] Store submission timestamp and confirmation number

### 6. Database Integration for Application Tracking
- [ ] Set up SQLite/PostgreSQL database schema
- [ ] Create tables: `jobs`, `applications`, `resume_versions`, `notifications`
- [ ] Implement CRUD operations for job applications
- [ ] Add search and filter capabilities
- [ ] Store application history with state transitions
- [ ] Implement data export (CSV, JSON)

### 7. Dashboard UI for Job Application Tracking
- [ ] Build React dashboard with categories:
  - **Applied** - Successfully submitted applications
  - **In-Transit/Pending** - Applications in progress
  - **Interview Scheduled** - Responses received
  - **Rejected** - Declined applications
  - **Ghosted** - No response after X days
  - **Selected** - Successful offers
- [ ] Add statistics and analytics:
  - Application success rate
  - Average response time
  - Top companies applied to
  - Skills match analysis
- [ ] Implement filters by date, company, position, status
- [ ] Add timeline view for application journey
- [ ] Export reports in PDF format

### 8. Additional Enhancements
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Electron packaging for Windows/macOS/Linux
- [ ] Multi-language support (i18n)
---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">
  <strong>FastTrackJobs</strong> - Automate your job search with AI-powered workflows 🚀
  <br><br>
  Made with ❤️ by the FastTrackJobs Team
</div>

MIT

---

**FastTrackJobs** - Automate your job search with AI-powered workflows 🚀
 
 