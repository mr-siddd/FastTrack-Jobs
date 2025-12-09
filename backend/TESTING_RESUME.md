# Testing the Resume Input Schema

## Quick Reference - What I Copied from reactive-resume

✅ **Complete Schema Structure** from `libs/schema/src/`:
- ✅ `basics/` - Personal info (name, email, phone, location, picture)
- ✅ `sections/` - All 13 sections (experience, education, skills, projects, etc.)
- ✅ `metadata/` - Presentation (theme, typography, layout, page format)
- ✅ `shared/` - Utilities (ID generation, URL schema, item schema)

The structure is **100% identical** to reactive-resume's schema!

---

## Testing Methods

### Method 1: Command Line Test (Fastest)

```powershell
cd backend
npm run test:resume
```

**Output:**
```
Test 1: Validate Default Resume Data
✅ Default resume data is valid!

Test 2: Validate Sample Resume Data
✅ Sample resume data is valid!
Name: John Doe
Email: john.doe@example.com
Phone: +1 (555) 123-4567
...
```

---

### Method 2: API Endpoints (Best for Integration)

**Start the server:**
```powershell
cd backend
npm run dev
```

**Test Endpoints:**

#### 1. Get Sample Resume
```bash
GET http://localhost:4000/api/resume/sample
```
Returns the complete John Doe sample resume.

#### 2. Get Default Template
```bash
GET http://localhost:4000/api/resume/default
```
Returns an empty resume template.

#### 3. Get Schema Structure
```bash
GET http://localhost:4000/api/resume/structure
```
Shows all available fields and sections.

#### 4. Run Tests
```bash
GET http://localhost:4000/api/resume/test
```
Returns validation stats and resume summary.

#### 5. Validate Your Own Resume
```bash
POST http://localhost:4000/api/resume/validate
Content-Type: application/json

{
  "basics": {
    "name": "Your Name",
    "email": "your@email.com",
    ...
  },
  "sections": { ... },
  "metadata": { ... }
}
```

---

### Method 3: Direct Import in Code

Create a file `test-my-resume.ts`:

```typescript
import { 
  resumeDataSchema, 
  sampleResumeData,
  ResumeData 
} from './services/resume/ResumeSchema';

// Test 1: Use sample data
console.log('Sample Resume:', sampleResumeData.basics.name);

// Test 2: Create your own
const myResume: ResumeData = {
  basics: {
    name: "Your Name",
    headline: "Your Title",
    email: "your@email.com",
    phone: "+1234567890",
    location: "Your City",
    url: { label: "", href: "" },
    customFields: [],
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      effects: { hidden: false, border: false, grayscale: false }
    }
  },
  sections: {
    // Use default sections or customize
    ...sampleResumeData.sections,
    summary: {
      id: "summary",
      name: "Summary",
      columns: 1,
      separateLinks: true,
      visible: true,
      content: "Your professional summary here..."
    }
  },
  metadata: sampleResumeData.metadata
};

// Validate
const result = resumeDataSchema.safeParse(myResume);
console.log('Valid?', result.success);
```

---

## Using with cURL

```bash
# Get sample resume
curl http://localhost:4000/api/resume/sample

# Get test results
curl http://localhost:4000/api/resume/test

# Validate resume (from file)
curl -X POST http://localhost:4000/api/resume/validate \
  -H "Content-Type: application/json" \
  -d @my-resume.json
```

---

## Using with Postman/Insomnia

1. **Import Collection** (create these requests):

   - `GET /api/resume/sample`
   - `GET /api/resume/default`
   - `GET /api/resume/structure`
   - `GET /api/resume/test`
   - `POST /api/resume/validate`

2. **Test Sample Data:**
   - Copy response from `/api/resume/sample`
   - Paste into `/api/resume/validate` body
   - Should return success!

---

## Expected Output Examples

### Sample Resume Stats
```json
{
  "success": true,
  "stats": {
    "basics": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA",
      "headline": "Full Stack Software Engineer"
    },
    "sections": {
      "experience": 2,
      "education": 1,
      "skills": 4,
      "projects": 1,
      "certifications": 1,
      "languages": 2,
      "profiles": 2
    },
    "metadata": {
      "template": "rhyhorn",
      "pageFormat": "a4",
      "primaryColor": "#2563eb",
      "font": "IBM Plex Sans"
    }
  }
}
```

### Validation Success
```json
{
  "success": true,
  "message": "Resume data is valid!",
  "stats": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "experienceCount": 2,
    "educationCount": 1,
    "skillsCount": 4,
    "projectsCount": 1
  }
}
```

### Validation Failure
```json
{
  "success": false,
  "errors": [
    {
      "code": "invalid_string",
      "message": "Invalid email",
      "path": ["basics", "email"]
    }
  ],
  "message": "Resume data validation failed"
}
```

---

## Schema Structure Overview

```typescript
ResumeData {
  basics: {
    name, headline, email, phone, location,
    url: { label, href },
    picture: { url, size, aspectRatio, borderRadius, effects },
    customFields: []
  },
  
  sections: {
    summary: { content },
    experience: { items: [] },    // Company, position, dates
    education: { items: [] },     // Institution, degree, dates
    skills: { items: [] },        // Name, level, keywords
    projects: { items: [] },      // Name, description, keywords
    certifications: { items: [] },
    awards: { items: [] },
    publications: { items: [] },
    volunteer: { items: [] },
    languages: { items: [] },
    interests: { items: [] },
    profiles: { items: [] },      // LinkedIn, GitHub, etc.
    references: { items: [] },
    custom: {}                    // User-defined sections
  },
  
  metadata: {
    template: "rhyhorn",
    layout: [[[sections]]],       // Page/column layout
    page: { format, margin, options },
    theme: { background, text, primary },
    typography: { font, lineHeight, ... },
    css: { value, visible },
    notes: ""
  }
}
```

---

## Next Steps - Using in LangGraph Agent

Once validated, use this as **Node 1 input**:

```typescript
// In your LangGraph agent
import { sampleResumeData } from './services/resume/ResumeSchema';

const initialState: JobApplicationState = {
  jobUrl: "https://jobs.company.com/123",
  userResume: sampleResumeData,  // ✅ Valid resume input
  errors: [],
  currentStep: "initialized",
  retryCount: 0
};

// Run the agent
const result = await agent.processJob(initialState);
```

---

## Files Created

```
backend/src/services/resume/
├── ResumeSchema.ts              # Main export
├── sample.ts                    # John Doe sample data
├── test.ts                      # Command-line tests
├── README.md                    # Documentation
├── basics/
│   ├── index.ts
│   └── custom.ts
├── sections/
│   ├── index.ts
│   ├── experience.ts
│   ├── education.ts
│   ├── skill.ts
│   └── ... (13 total)
├── metadata/
│   └── index.ts
└── shared/
    ├── id.ts
    ├── item.ts
    ├── url.ts
    └── types.ts

backend/src/routes/
└── resume-test.ts               # API endpoints
```

---

## Quick Start Commands

```powershell
# Install dependencies (already done)
cd backend
npm install

# Run command-line tests
npm run test:resume

# Start server and test via API
npm run dev
# Then visit: http://localhost:4000/api/resume/test
```

That's it! You now have a **production-ready resume schema** ready for LangGraph integration! 🚀
