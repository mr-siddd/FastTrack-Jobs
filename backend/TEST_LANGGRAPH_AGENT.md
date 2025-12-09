# Testing LangGraph Job Application Agent

## ✅ Setup Complete

All TypeScript compilation errors have been resolved. The LangGraph agent is ready for testing.

## Quick Start

### 1. Environment Variables

Create `.env` file in `backend/` directory:

```bash
# AI Provider (choose one)
GEMINI_API_KEY=your-gemini-api-key-here    # FREE tier, recommended for testing
# OPENAI_API_KEY=your-openai-api-key-here  # Paid API

# MCP Server
MCP_SERVER_URL=http://localhost:3001

# Storage
APP_STORAGE_DIR=D:/Learning_Stuff/FasTrackJobs/.fasttrack
```

**Get FREE Gemini API Key**: https://makersuite.google.com/app/apikey

### 2. Start Services

```powershell
# Terminal 1: Start MCP Server (Playwright)
cd mcp-server
npm run dev

# Terminal 2: Start Backend
cd backend
npm run dev
```

### 3. Test the Agent

#### Option A: Using cURL

```powershell
curl -X POST http://localhost:3000/api/job/process `
  -H "Content-Type: application/json" `
  -d '{
    "jobUrl": "https://www.linkedin.com/jobs/view/1234567890",
    "resume": {
      "basics": {
        "name": "John Doe",
        "headline": "Full Stack Developer",
        "email": "john.doe@email.com",
        "phone": "+1-234-567-8900",
        "location": "San Francisco, CA",
        "url": {"label": "Portfolio", "href": "https://johndoe.dev"},
        "customFields": [],
        "picture": {"url": "", "size": 64, "aspectRatio": 1, "borderRadius": 0, "effects": {"hidden": false, "border": false, "grayscale": false}}
      },
      "sections": {
        "summary": {
          "name": "Summary",
          "columns": 1,
          "separateLinks": true,
          "visible": true,
          "id": "summary",
          "content": "Experienced full stack developer with 5+ years building scalable web applications."
        },
        "experience": {
          "name": "Experience",
          "columns": 1,
          "separateLinks": true,
          "visible": true,
          "id": "experience",
          "items": [
            {
              "id": "exp1",
              "visible": true,
              "company": "Tech Corp",
              "position": "Senior Developer",
              "location": "San Francisco, CA",
              "date": "2020 - Present",
              "summary": "Led development of microservices architecture, improved performance by 40%"
            }
          ]
        },
        "education": {
          "name": "Education",
          "columns": 1,
          "separateLinks": true,
          "visible": true,
          "id": "education",
          "items": [
            {
              "id": "edu1",
              "visible": true,
              "institution": "University of Technology",
              "studyType": "Bachelor of Science",
              "area": "Computer Science",
              "score": "3.8 GPA",
              "date": "2015 - 2019",
              "summary": ""
            }
          ]
        },
        "skills": {
          "name": "Skills",
          "columns": 2,
          "separateLinks": true,
          "visible": true,
          "id": "skills",
          "items": [
            {
              "id": "skill1",
              "visible": true,
              "name": "JavaScript",
              "description": "React, Node.js, TypeScript",
              "level": 5,
              "keywords": []
            },
            {
              "id": "skill2",
              "visible": true,
              "name": "Python",
              "description": "Django, FastAPI, LangChain",
              "level": 4,
              "keywords": []
            }
          ]
        },
        "awards": {"name": "Awards", "columns": 1, "separateLinks": true, "visible": false, "id": "awards", "items": []},
        "certifications": {"name": "Certifications", "columns": 1, "separateLinks": true, "visible": false, "id": "certifications", "items": []},
        "interests": {"name": "Interests", "columns": 1, "separateLinks": true, "visible": false, "id": "interests", "items": []},
        "languages": {"name": "Languages", "columns": 1, "separateLinks": true, "visible": false, "id": "languages", "items": []},
        "profiles": {"name": "Profiles", "columns": 1, "separateLinks": true, "visible": false, "id": "profiles", "items": []},
        "projects": {"name": "Projects", "columns": 1, "separateLinks": true, "visible": false, "id": "projects", "items": []},
        "publications": {"name": "Publications", "columns": 1, "separateLinks": true, "visible": false, "id": "publications", "items": []},
        "references": {"name": "References", "columns": 1, "separateLinks": true, "visible": false, "id": "references", "items": []},
        "volunteer": {"name": "Volunteer", "columns": 1, "separateLinks": true, "visible": false, "id": "volunteer", "items": []}
      },
      "metadata": {
        "template": "azurill",
        "layout": [[["summary"],["experience"],["education"],["skills"]]],
        "css": {"value": "", "visible": false},
        "page": {"margin": 18, "format": "a4"},
        "theme": {"background": "#ffffff", "text": "#000000", "primary": "#5a7c6c"},
        "typography": {"font": {"family": "IBM Plex Serif", "subset": "latin", "variants": ["regular"], "size": 14}, "lineHeight": 1.5, "hideIcons": false, "underlineLinks": true},
        "notes": ""
      }
    },
    "options": {
      "autoApply": false,
      "generatePDF": true
    }
  }'
```

#### Option B: Using Postman

1. Create POST request to `http://localhost:3000/api/job/process`
2. Set Headers: `Content-Type: application/json`
3. Use the JSON body from above (Option A)
4. Click **Send**

#### Option C: Test Configuration Status

```powershell
curl http://localhost:3000/api/job/status
```

Expected response:
```json
{
  "message": "LangGraph Job Application Agent is configured",
  "providers": {
    "gemini": true,
    "openai": false
  },
  "mcpConnected": true
}
```

## Expected Pipeline Flow

```
┌─────────────────────────────────────────────────────┐
│  POST /api/job/process                              │
│  Input: jobUrl + resume + options                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Node 1: Extract Job Description                    │
│  • Navigate to job URL                              │
│  • Click "Show More" / "View More" buttons          │
│  • Extract full job description HTML                │
│  Output: rawJD (HTML string)                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Node 2: Parse Job Description (AI)                 │
│  • Use LangChain structured output                  │
│  • Extract: title, company, location, etc.          │
│  • Parse requirements, responsibilities, skills     │
│  Output: structuredJD (JobDescription object)       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Node 3: Tailor Resume (AI)                         │
│  • Match resume to job requirements                 │
│  • Optimize keywords and phrasing                   │
│  • Highlight relevant experience                    │
│  Output: tailoredResume (ResumeData object)         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Node 4: Generate PDF                               │
│  • Use Playwright to render HTML → PDF              │
│  • Filename: Name_Position_Company.pdf              │
│  Output: pdfInfo (filepath, size, timestamp)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Node 5: Auto-Apply (Placeholder)                   │
│  • Currently returns "pending" status               │
│  • TODO: Form detection & submission                │
│  Output: applicationResult (status: pending)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Final Response                                      │
│  • Success: true                                     │
│  • All node outputs + timings                       │
│  • PDF file path                                    │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

### Error: "AI provider not configured"

**Solution**: Set `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env` file

Get free Gemini API key: https://makersuite.google.com/app/apikey

### Error: "MCP client not initialized"

**Solution**: Start the MCP server first

```powershell
cd mcp-server
npm run dev
```

### Error: "Failed to extract job description"

**Possible causes**:
1. Invalid job URL
2. LinkedIn login required (use direct job post URLs)
3. Button selectors not matching (check console logs)

**Solution**: Check MCP server logs for Playwright errors

### Error: "PDF generation failed"

**Possible causes**:
1. Playwright chromium not installed
2. File system permissions

**Solution**:
```powershell
cd backend
npx playwright install chromium
```

## Success Indicators

✅ All 5 nodes execute without errors
✅ PDF file generated in storage directory
✅ Response contains structured job data
✅ Resume is tailored to job requirements
✅ Execution time < 30 seconds

## Next Steps

1. **Test with real LinkedIn jobs**: Use actual job posting URLs
2. **Implement Node 5 (Auto-Apply)**: Add form detection and submission logic
3. **Frontend Integration**: Connect React UI to `/api/job/process` endpoint
4. **Error Handling**: Test retry logic with network failures
5. **Performance**: Monitor AI token usage and costs

## Files to Check

- **Backend logs**: Console output shows each node execution
- **Generated PDFs**: Check `APP_STORAGE_DIR` directory
- **State flow**: Each node logs input/output state
- **MCP logs**: Playwright browser automation details

## Cost Monitoring

**Gemini (FREE tier)**:
- 15 requests/minute
- 1 million tokens/minute
- No cost for testing

**OpenAI GPT-4o-mini**:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Estimated cost per job: < $0.01

The multi-provider architecture ensures you can test extensively with Gemini before switching to OpenAI for production.
