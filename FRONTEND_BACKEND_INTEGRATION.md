# Frontend ↔️ Backend Integration Guide

## 🎯 Complete Flow: User → Frontend → Backend → AI Agent

### Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│   User      │ ───> │   Frontend   │ ───> │    Backend      │ ───> │  LangGraph   │
│  (Browser)  │      │  React App   │      │  Fastify API    │      │    Agent     │
│             │ <─── │  Port 3000   │ <─── │   Port 4000     │ <─── │  (5 Nodes)   │
└─────────────┘      └──────────────┘      └─────────────────┘      └──────────────┘
                            │                      │                        │
                            │                      │                        ├─> Node 1: Extract JD
                            │                      │                        ├─> Node 2: Parse with AI
                            │                      │                        ├─> Node 3: Tailor Resume
                            │                      │                        ├─> Node 4: Generate PDF
                            │                      │                        └─> Node 5: Auto-apply
                            │                      │
                            └──────────────────────┴────────> Playwright (Browser Automation)
```

---

## 📝 Step-by-Step User Journey

### 1️⃣ User Enters Job URL

**Frontend (`App.tsx`):**
```tsx
<input
  type="url"
  placeholder="https://linkedin.com/jobs/view/12345"
  value={jobUrl}
  onChange={(e) => setJobUrl(e.target.value)}
/>
```

**What happens:**
- User pastes a job URL from LinkedIn, Indeed, Glassdoor, etc.
- URL is stored in React state: `const [jobUrl, setJobUrl] = useState('')`
- **NO hardcoding** - 100% user input

---

### 2️⃣ User Clicks "🚀 Process with AI Agent"

**Frontend (`App.tsx`):**
```tsx
<button onClick={handleProcessWithAgent}>
  {agentProcessing ? `Processing... (${processingStep})` : '🚀 Process with AI Agent'}
</button>
```

**What happens:**
```typescript
const handleProcessWithAgent = async () => {
  // 1. Validate job URL
  if (!jobUrl.trim()) {
    setError('Please enter a valid job URL');
    return;
  }

  // 2. Prepare user resume (currently sample data)
  const sampleResume = {
    basics: { name: "John Doe", email: "john@example.com", ... },
    sections: { experience: [...], education: [...], skills: [...] },
    metadata: { template: "azurill", ... }
  };

  // 3. Call backend API
  const response = await axios.post('/api/job/process', {
    jobUrl,                    // ← FROM USER INPUT
    userResume: sampleResume,  // ← FROM USER PROFILE (sample for now)
    options: {
      aiProvider: 'gemini',    // Free tier
      generatePDF: true,
      autoApply: false
    }
  });
}
```

---

### 3️⃣ Frontend Sends Request to Backend

**HTTP Request:**
```http
POST http://localhost:3000/api/job/process
Content-Type: application/json

{
  "jobUrl": "https://linkedin.com/jobs/view/12345",  ← USER INPUT
  "userResume": { ... },
  "options": {
    "aiProvider": "gemini",
    "generatePDF": true,
    "autoApply": false
  }
}
```

**Vite Proxy (`vite.config.ts`):**
```typescript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:4000',  // Backend server
    changeOrigin: true,
  }
}
```

**Proxied to:**
```
http://127.0.0.1:4000/api/job/process
```

---

### 4️⃣ Backend Receives Request

**Backend (`routes/job-agent.ts`):**
```typescript
server.post('/api/job/process', async (request, reply) => {
  // 1. Parse and validate request
  const { jobUrl, userResume, options } = request.body;
  
  // 2. Create initial state for LangGraph
  const initialState = createInitialState({
    jobUrl,        // ← FROM FRONTEND (from user input)
    userResume,    // ← FROM FRONTEND (user profile)
    options
  });

  // 3. Run LangGraph agent (all 5 nodes)
  const agent = new JobApplicationAgent();
  const finalState = await agent.processJob(initialState);

  // 4. Return results to frontend
  return {
    success: finalState.currentStep !== 'failed',
    state: finalState,
    summary: buildSummary(finalState)
  };
});
```

---

### 5️⃣ LangGraph Agent Processes Job (5 Nodes)

**Backend (`agents/JobApplicationAgent.ts`):**
```typescript
async processJob(initialState) {
  let state = initialState;
  
  // Node 1: Extract JD from URL
  state = await this.runNode('extract_jd', extractJDNode, state);
  // Output: { extractedJD: { title, company, rawText } }
  
  // Node 2: Parse with AI
  state = await this.runNode('parse_jd', parseJDNode, state);
  // Output: { structuredJD: { requirements[], skills[], experience } }
  
  // Node 3: Tailor Resume
  state = await this.runNode('tailor_resume', tailorResumeNode, state);
  // Output: { tailoredResume: { ... optimized resume ... } }
  
  // Node 4: Generate PDF
  state = await this.runNode('generate_pdf', generatePDFNode, state);
  // Output: { pdfInfo: { filename, filepath, size } }
  
  // Node 5: Auto-apply (optional)
  if (state.options.autoApply) {
    state = await this.runNode('auto_apply', autoApplyNode, state);
    // Output: { applicationResult: { status, confirmationId } }
  }
  
  return state;
}
```

**Each node uses the job URL from initial state:**
```typescript
// Node 1: Extract JD
const extractedJD = await mcpClient.extractJobDescription(state.jobUrl);
                                                          ↑
                                                  FROM USER INPUT!
```

---

### 6️⃣ Backend Returns Results to Frontend

**Backend Response:**
```json
{
  "success": true,
  "message": "Job application processed successfully",
  "state": {
    "jobUrl": "https://linkedin.com/jobs/view/12345",
    "extractedJD": { "title": "Senior Engineer", "company": "TechCorp" },
    "structuredJD": { "requirements": [...], "skills": [...] },
    "tailoredResume": { "basics": {...}, "sections": {...} },
    "pdfInfo": {
      "filename": "JohnDoe_SeniorEngineer_TechCorp.pdf",
      "filepath": "/path/to/pdf",
      "size": 45678
    }
  },
  "summary": {
    "status": "completed",
    "duration": "12s",
    "steps_completed": ["Extract JD", "Parse JD", "Tailor Resume", "Generate PDF"],
    "job": { "title": "Senior Engineer", "company": "TechCorp" },
    "pdf": { "filename": "...", "filepath": "...", "size": 45678 }
  }
}
```

---

### 7️⃣ Frontend Displays Results

**Frontend (`App.tsx`):**
```tsx
{agentResult && (
  <section className="job-data-section">
    <h2>🤖 AI Agent Results</h2>
    
    {/* Show job details */}
    <div>
      <h3>📄 Job Details</h3>
      <p>Title: {agentResult.summary.job.title}</p>
      <p>Company: {agentResult.summary.job.company}</p>
    </div>
    
    {/* Show PDF download */}
    <div>
      <h3>📥 Tailored Resume PDF</h3>
      <p>File: {agentResult.summary.pdf.filename}</p>
      <p>Path: {agentResult.summary.pdf.filepath}</p>
    </div>
  </section>
)}
```

---

## 🔄 Data Flow Summary

| Step | Component | Data | Source |
|------|-----------|------|--------|
| 1 | Frontend Input | `jobUrl` | **User types URL in browser** |
| 2 | Frontend State | `setJobUrl(value)` | User input stored in React state |
| 3 | Frontend Handler | `handleProcessWithAgent()` | Triggered by button click |
| 4 | HTTP Request | `POST /api/job/process` | Axios sends `jobUrl` to backend |
| 5 | Backend Route | `request.body.jobUrl` | Fastify receives user's URL |
| 6 | Agent Initial State | `state.jobUrl` | Passed to LangGraph agent |
| 7 | Node 1 (Extract) | Uses `state.jobUrl` | Playwright navigates to **user's URL** |
| 8 | Node 2-5 | Process extracted data | All nodes use original `jobUrl` |
| 9 | Backend Response | Returns processed data | Sent back to frontend |
| 10 | Frontend Display | Shows results | User sees tailored resume & PDF |

---

## 🎨 Frontend Features

### Two Processing Modes

1. **"Extract Job Only"** (Old flow)
   - Only extracts job description
   - Uses `/api/extract-job` endpoint
   - Manual steps afterward

2. **"🚀 Process with AI Agent"** (NEW - LangGraph)
   - Automated 5-node pipeline
   - Uses `/api/job/process` endpoint
   - Extract → Parse → Tailor → Generate PDF → Apply

### Live Progress Updates

```tsx
const [processingStep, setProcessingStep] = useState('');

// During processing:
setProcessingStep('Extracting job description...');  // Node 1
setProcessingStep('Parsing with AI...');              // Node 2
setProcessingStep('Tailoring resume...');             // Node 3
setProcessingStep('Generating PDF...');               // Node 4
setProcessingStep('✅ Complete!');                    // Done
```

---

## 🚀 How to Run

### 1. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://127.0.0.1:4000
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:3000
```

### 3. Use the App
1. Open browser: `http://localhost:3000`
2. Paste job URL: `https://linkedin.com/jobs/view/12345`
3. Click **"🚀 Process with AI Agent"**
4. Wait for results (10-30 seconds)
5. Download tailored resume PDF

---

## 🔧 Environment Variables

**Backend (`.env`):**
```env
PORT=4000
GEMINI_API_KEY=your_gemini_key_here    # FREE tier
OPENAI_API_KEY=your_openai_key_here    # Paid (fallback)
APP_STORAGE_DIR=/path/to/store/pdfs
```

**Frontend:**
- No API keys needed
- Proxy configured in `vite.config.ts`

---

## 📦 Next Steps (Production-Ready)

### Replace Sample Resume with Real User Data

**Option 1: File Upload**
```tsx
<input 
  type="file" 
  accept=".json" 
  onChange={(e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const resume = JSON.parse(event.target.result);
      setUserResume(resume);
    };
    reader.readAsText(file);
  }}
/>
```

**Option 2: User Profile from Database**
```tsx
useEffect(() => {
  // Fetch user's saved resume
  const fetchResume = async () => {
    const response = await axios.get('/api/user/resume');
    setUserResume(response.data);
  };
  fetchResume();
}, []);
```

**Option 3: Resume Builder UI**
- Create form to input experience, education, skills
- Save to user profile
- Use saved profile for agent processing

---

## ✅ Summary

**Key Points:**
- ✅ Job URL comes from **user input** (frontend form)
- ✅ Frontend sends URL to backend via `/api/job/process`
- ✅ Backend passes URL to LangGraph agent
- ✅ Agent uses URL in Node 1 (extract)
- ✅ Results flow back to frontend for display
- ✅ **NO hardcoded URLs** anywhere in the flow
- ✅ Fully dynamic, user-driven workflow

**User Journey:**
```
User pastes URL → Frontend captures → Backend receives → Agent processes → Results displayed
```

**Current Status:**
- ✅ Backend API ready and tested
- ✅ Frontend integration complete
- ✅ Sample resume included (replace with user profile later)
- ✅ Real-time progress updates
- ✅ Error handling and display
