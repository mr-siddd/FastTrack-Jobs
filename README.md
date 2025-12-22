# 🚀 FastTrackJobs

> AI-powered job application automation using LangGraph, Playwright MCP, OpenAI, and React/Electron.

**Automate your job search workflow** - Extract job descriptions, tailor resumes with AI, generate professional PDFs, and auto-apply to positions with intelligent form filling.

## 📋 Table of Contents

- [Project Structure](#-project-structure)
- [LangGraph Approach](#-langgraph-approach)
- [Modules](#-modules)
- [Technology Stack](#️-technology-stack)
- [Service Details](#-service-details-ai-integration)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Module Ports](#-module-ports)
- [Linting & Type Checking](#-linting--type-checking)
- [API Reference](#-api-reference)
- [Development Notes](#-development-notes)
- [Contributing](#-contributing)
- [Next Steps](#️-next-steps)
- [License](#-license)

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
│  │ Adapter  │      │  Proxy   │      │  Client  │         │
│  └──────────┘      └──────────┘      └──────────┘         │
│                                             │               │
└─────────────────────────────────────────────┼───────────────┘
                                              ▼
                                    ┌──────────────────┐
                                    │ Playwright MCP   │
                                    │     Server       │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                      [Real Browser]
                             Extract JD, fill forms, upload PDF
```

---

## ⚡ LangGraph Approach

This project uses **LangGraph** for workflow orchestration with a **Node and State Graph** architecture:

- **State Graph**: Maintains shared state (`JobApplicationState`) across all nodes
- **Nodes**: Independent processing units (ExtractJD, ParseJD, TailorResume, GeneratePDF, AutoApply)
- **Conditional Edges**: Route workflow based on state (e.g., skip AutoApply if PDF generation fails)
- **Workflow Orchestration**: Ensures proper sequencing and error handling across the job application pipeline

---

## 📦 Modules

### 🎨 Frontend Module

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with CSS modules
- **State Management**: React hooks
- **HTTP Client**: Fetch API
- **Features**: Job URL input, JD display, resume generation, application tracking dashboard

### ⚙️ Backend Module

- **Runtime**: Node.js 20+
- **Framework**: Fastify (high-performance web framework)
- **Language**: TypeScript
- **Workflow Engine**: LangGraph for state-based orchestration
- **Architecture**: Modular services with dependency injection

---

## 🛠️ Technology Stack

### Frontend Technologies

- React 18
- TypeScript
- Vite
- CSS3

### Backend Technologies

- Node.js 20+
- TypeScript
- Fastify
- LangGraph (workflow orchestration)
- Zod (schema validation)
- Playwright (browser automation)

### AI Integration

- OpenAI API (GPT-4)
- Copilot Proxy Adapter
- MCP (Model Context Protocol)

### Development Tools

- tsx (TypeScript execution)
- ESBuild
- Playwright browsers

---

## 🤖 Service Details: AI Integration

### LangGraph Workflow Engine

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
- Fills fields with resume data (respecting maxLength)
- Uploads generated PDF
- Submits application
- Outputs: `applicationStatus`

**State Management:**

```typescript
interface JobApplicationState {
  jobId: string;
  jobUrl: string;
  rawJobText?: string;
  jd?: JobDescription;
  resumeJson?: ResumeData;
  tailoredResumeJson?: ResumeData;
  resumePdfPath?: string;
  applicationStatus?: 'pending' | 'applied' | 'failed';
  error?: string;
}
```

**Conditional Routing:**
- If extraction fails → skip to error state
- If PDF generation fails → skip AutoApply
- If AutoApply disabled → return after PDF generation

---

## 🚀 Getting Started

### Quick Start (Recommended)

Want to start quickly without heavy dependencies? See [docs/MINIMAL_START.md](backend/README.md) for a lightweight setup that skips Playwright and AI SDKs. You can add them back later when needed.

### Prerequisites

**System Requirements:**
- Node.js >= 18.0.0 (tested with 22.14.0)
- Yarn >= 1.22.0
- Windows/Linux/macOS
- Minimum 4GB RAM

**API Keys:**
- OpenAI API key (required)
- Copilot API access (optional, for Copilot Proxy)

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd FastTrackJobs
```

2. **Install dependencies:**

```bash
# Clean install (if upgrading from previous version)
rm -rf node_modules yarn.lock

# Install
yarn install
```

This will install all dependencies for the root project and all workspaces (modules).

> **Note:** Heavy dependencies (Puppeteer, Playwright, AI SDKs) have been removed from the minimal version. See [docs/MINIMAL_START.md](backend/README.md) for details.

### ⚙️ Configuration

Create `backend/.env` file:

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

---

## 💻 Development

Start all development servers and the Electron app:

```bash
# Run all modules concurrently
yarn dev
```

Or start individual modules:

### Backend Development Server

```powershell
cd backend
npm run dev
```

Backend runs on http://127.0.0.1:4000

### Frontend Development Server

```powershell
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173 (Vite default)

### Electron App (Desktop)

```powershell
cd electron
npm start
```

---

## 🔌 Module Ports

| Module | Port | URL |
|--------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Fastify) | 4000 | http://127.0.0.1:4000 |
| Copilot Proxy (optional) | 5000 | http://localhost:5000 |
| Playwright MCP (stdio) | - | stdio transport |
| Electron (future) | - | Desktop app |

---

## 🔍 Linting & Type Checking

### Backend

```powershell
cd backend
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier
```

### Frontend

```powershell
cd frontend
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier
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

## 📝 Development Notes

### LangGraph Implementation

The project uses a **state graph** pattern for workflow management:

```typescript
// State flows through nodes
ExtractJDNode → ParseJDNode → TailorResumeNode → GeneratePDFNode → AutoApplyNode
                     ↓ (on error)
                  Error Handler
```

**Key Design Patterns:**
- **Immutable State**: Each node returns a new state object
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Conditional edges handle failures gracefully
- **Retry Logic**: Configurable retry attempts per node
- **Logging**: Comprehensive logs for debugging workflow

### AI Provider Abstraction

The backend supports multiple AI providers through adapters:

```typescript
interface AIProvider {
  chat(messages: Message[]): Promise<string>;
  structuredOutput<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
}
```

**Supported Providers:**
- OpenAI Adapter
- Copilot Proxy Adapter
- (Future: Anthropic, Gemini)

### Resume Schema

Built with Zod for runtime validation:
- Basics: name, contact, summary
- Sections: experience, education, skills, projects, certifications
- Metadata: custom sections, timestamps
- Validation: email format, URL format, date ranges

### PDF Generation

Uses Playwright's PDF rendering:
- HTML templates with professional styling
- Print media queries for PDF optimization
- Consistent fonts and spacing
- File naming: `Name_Position_Company.pdf`

### MCP Integration

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

### 📁 File Structure

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

---

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
- Follow ESLint and Prettier configurations
- Write JSDoc comments for public APIs
- Use async/await over promises
- Handle errors gracefully with try/catch
- Log meaningful messages for debugging

---

## 🗺️ Next Steps

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
- [ ] Dark mode theme
- [ ] API rate limiting and caching
- [ ] WebSocket for real-time updates
- [ ] End-to-end testing with Playwright Test
- [ ] Performance monitoring and analytics

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
