# Resume Service - Complete Schema Documentation

## Overview

This module contains the complete resume data schema based on **reactive-resume** structure. It provides a comprehensive, production-ready format for storing and manipulating resume data.

## Architecture

```
backend/src/services/resume/
├── ResumeSchema.ts          # Main schema export (resumeDataSchema)
├── sample.ts                # Sample resume data for testing
├── basics/                  # Personal information
│   ├── index.ts             # Name, email, phone, location, picture
│   └── custom.ts            # Custom fields (pronouns, etc.)
├── sections/                # All resume sections
│   ├── index.ts             # Sections aggregator
│   ├── experience.ts        # Work experience
│   ├── education.ts         # Educational background
│   ├── skills.ts            # Technical & soft skills
│   ├── projects.ts          # Personal/professional projects
│   ├── certifications.ts    # Professional certifications
│   ├── awards.ts            # Honors and awards
│   ├── publications.ts      # Published works
│   ├── volunteer.ts         # Volunteer experience
│   ├── languages.ts         # Language proficiency
│   ├── interests.ts         # Hobbies and interests
│   ├── profiles.ts          # Social media links
│   ├── references.ts        # Professional references
│   └── custom-section.ts    # User-defined sections
├── metadata/                # Presentation layer
│   └── index.ts             # Theme, layout, typography, CSS
└── shared/                  # Common utilities
    ├── id.ts                # CUID2 ID generation
    ├── item.ts              # Base item schema
    ├── url.ts               # URL schema
    └── types.ts             # Utility types
```

## Usage

### Import the Schema

```typescript
import { 
  resumeDataSchema, 
  ResumeData, 
  defaultResumeData,
  sampleResumeData 
} from './services/resume/ResumeSchema';
```

### Validate Resume Data

```typescript
// Parse and validate
const userResume = resumeDataSchema.parse(inputData);

// Safe parse (returns { success, data, error })
const result = resumeDataSchema.safeParse(inputData);
if (result.success) {
  console.log(result.data);
}
```

### Use in LangGraph Agent

```typescript
// Node 1 Input - User provides resume
const state: JobApplicationState = {
  jobUrl: "https://jobs.company.com/123",
  userResume: sampleResumeData,  // Or from database
  errors: [],
  currentStep: "initialized",
  retryCount: 0,
};

// Node 3 - AI tailors resume
const tailoredResume = await tailorResumeNode(state);

// Node 4 - Generate PDF with metadata
const pdfPath = await generatePDFNode({
  ...state,
  tailoredResume: tailoredResume,
});
```

### Access Specific Sections

```typescript
import type { Experience, Education, Skill } from './services/resume/ResumeSchema';

// Type-safe access
const experience: Experience[] = resume.sections.experience.items;
const education: Education[] = resume.sections.education.items;
const skills: Skill[] = resume.sections.skills.items;
```

## Schema Structure

### ResumeData

```typescript
{
  basics: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    url: { label: string; href: string };
    customFields: CustomField[];
    picture: { ... };
  },
  sections: {
    summary: { content: string; ... };
    experience: { items: Experience[]; ... };
    education: { items: Education[]; ... };
    skills: { items: Skill[]; ... };
    projects: { items: Project[]; ... };
    certifications: { items: Certification[]; ... };
    // ... 13 sections total
    custom: Record<string, CustomSection>;
  },
  metadata: {
    template: string;
    layout: string[][][];
    page: { format: "a4" | "letter"; margin: number; ... };
    theme: { background: string; text: string; primary: string };
    typography: { font: {...}; lineHeight: number; ... };
    css: { value: string; visible: boolean };
    notes: string;
  }
}
```

## Key Features

### ✅ Modular Architecture
- Each section is independently defined
- Shared utilities for consistency
- Easy to extend with new sections

### ✅ Type Safety
- Full TypeScript types
- Zod runtime validation
- Autocomplete in IDEs

### ✅ Production Ready
- Based on proven reactive-resume schema
- Supports all common resume sections
- Flexible metadata for PDF generation

### ✅ LangGraph Integration
- Perfect input for Node 1 (user resume)
- AI can easily parse and modify
- Metadata guides PDF formatting in Node 4

## Integration Points

### 1. User Input (Future)
In production, resume data will come from:
- User profile service/database
- Resume builder UI
- Imported from PDF/LinkedIn

### 2. AI Processing (Node 2 & 3)
AI uses this structure to:
- Parse job descriptions
- Extract relevant skills
- Tailor resume content
- Match keywords

### 3. PDF Generation (Node 4)
Metadata controls:
- Template selection
- Color scheme
- Typography
- Page layout
- Section ordering

### 4. Auto-Apply (Node 5)
Basics section provides:
- Name for form fields
- Email for contact
- Phone number
- Location

## Testing

```typescript
import { sampleResumeData } from './services/resume/sample';

// Use sample data for testing
const result = await processJobApplication({
  jobUrl: 'https://...',
  userResume: sampleResumeData,
});
```

## TODO

- [ ] Add resume import from PDF functionality
- [ ] Add resume import from LinkedIn
- [ ] Create resume builder UI integration
- [ ] Add validation rules for required fields per job type
- [ ] Implement resume versioning (track changes)
- [ ] Add AI-powered resume suggestions
- [ ] Create resume templates library

## Dependencies

- **zod**: Schema validation
- **@paralleldrive/cuid2**: Unique ID generation

## Notes

This schema is designed to be **loosely coupled** from the main application:
- Can be used independently
- No dependencies on other services
- Communicates via standard TypeScript types
- Future: May become a separate npm package
