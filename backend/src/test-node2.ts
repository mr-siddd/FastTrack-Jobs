// Test Node 2 - Parse JD with Gemini
import 'dotenv/config';
import { parseJDNode } from './agents/nodes/ParseJDNode';
import { createInitialState } from './state/JobApplicationState';

async function testNode2() {
  console.log('=== Testing Node 2: Parse JD ===\n');
  
  // Create a sample state with extracted JD
  const sampleResume = {
    basics: { name: 'Test User', headline: '', email: '', phone: '', location: '', url: { label: '', href: '' }, customFields: [], picture: { url: '', size: 64, aspectRatio: 1, borderRadius: 0, effects: { hidden: false, border: false, grayscale: false } } },
    sections: {} as any,
    metadata: {} as any
  };
  
  const initialState = createInitialState(
    'https://example.com/job',
    sampleResume,
    { aiProvider: 'openai' } // Use OpenAI for testing
  );
  
  // Add sample extracted JD
  const stateWithExtractedJD = {
    ...initialState,
    extractedJD: {
      url: 'https://example.com/job',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      rawText: `
Job Title: Senior Software Engineer
Company: TechCorp Inc.
Location: San Francisco, CA

About the Role:
We are seeking a Senior Software Engineer to join our platform team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Knowledge of cloud platforms (AWS/GCP)
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Write clean, maintainable code
- Participate in code reviews

Nice to Have:
- Experience with Docker and Kubernetes
- Knowledge of microservices architecture
- Prior experience in fintech

Benefits:
- Competitive salary ($150k-$200k)
- Health insurance
- 401k matching
- Remote work options
      `,
      extractedAt: new Date().toISOString()
    }
  };
  
  try {
    console.log('Running Node 2 with Gemini...\n');
    const result = await parseJDNode(stateWithExtractedJD);
    
    if (result.structuredJD) {
      console.log('✅ SUCCESS! Parsed JD:');
      console.log('Title:', result.structuredJD.title);
      console.log('Company:', result.structuredJD.company);
      console.log('Required Skills:', result.structuredJD.requiredSkills);
      console.log('Requirements:', result.structuredJD.requirements);
      console.log('Responsibilities:', result.structuredJD.responsibilities);
      console.log('\nFull structured output:');
      console.log(JSON.stringify(result.structuredJD, null, 2));
    } else {
      console.log('❌ FAILED: No structured JD returned');
      console.log('Result:', result);
    }
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testNode2();
