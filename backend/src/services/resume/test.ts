/**
 * Resume Schema Test Suite
 * 
 * Run this file to test:
 * 1. Schema validation
 * 2. Sample data loading
 * 3. Type safety
 * 4. Default values
 */

import { 
  resumeDataSchema, 
  ResumeData, 
  defaultResumeData,
  sampleResumeData 
} from './ResumeSchema';

// Test 1: Validate default resume data
console.log('='.repeat(60));
console.log('Test 1: Validate Default Resume Data');
console.log('='.repeat(60));

try {
  const validated = resumeDataSchema.parse(defaultResumeData);
  console.log('✅ Default resume data is valid!');
  console.log('Name:', validated.basics.name);
  console.log('Email:', validated.basics.email);
  console.log('Sections:', Object.keys(validated.sections));
} catch (error) {
  console.error('❌ Default resume validation failed:', error);
}

// Test 2: Validate sample resume data
console.log('\n' + '='.repeat(60));
console.log('Test 2: Validate Sample Resume Data');
console.log('='.repeat(60));

try {
  const validated = resumeDataSchema.parse(sampleResumeData);
  console.log('✅ Sample resume data is valid!');
  console.log('\nBasics:');
  console.log('  Name:', validated.basics.name);
  console.log('  Email:', validated.basics.email);
  console.log('  Phone:', validated.basics.phone);
  console.log('  Location:', validated.basics.location);
  console.log('  Headline:', validated.basics.headline);
  
  console.log('\nExperience:');
  validated.sections.experience.items.forEach((exp, i) => {
    console.log(`  ${i + 1}. ${exp.position} at ${exp.company} (${exp.date})`);
  });
  
  console.log('\nEducation:');
  validated.sections.education.items.forEach((edu, i) => {
    console.log(`  ${i + 1}. ${edu.studyType} in ${edu.area} from ${edu.institution}`);
  });
  
  console.log('\nSkills:');
  validated.sections.skills.items.forEach((skill, i) => {
    console.log(`  ${i + 1}. ${skill.name} (Level ${skill.level}/5)`);
  });
  
  console.log('\nProjects:');
  validated.sections.projects.items.forEach((proj, i) => {
    console.log(`  ${i + 1}. ${proj.name}`);
  });
  
  console.log('\nMetadata:');
  console.log('  Template:', validated.metadata.template);
  console.log('  Page Format:', validated.metadata.page.format);
  console.log('  Primary Color:', validated.metadata.theme.primary);
  console.log('  Font:', validated.metadata.typography.font.family);
  
} catch (error) {
  console.error('❌ Sample resume validation failed:', error);
}

// Test 3: Test invalid data
console.log('\n' + '='.repeat(60));
console.log('Test 3: Test Invalid Data (Should Fail)');
console.log('='.repeat(60));

const invalidResume = {
  basics: {
    name: "John Doe",
    email: "invalid-email", // Invalid email
    headline: "",
    phone: "",
    location: "",
  },
  // Missing sections and metadata
};

const result = resumeDataSchema.safeParse(invalidResume);
if (!result.success) {
  console.log('✅ Correctly rejected invalid data!');
  console.log('Errors found:', result.error.errors.length);
  console.log('First error:', result.error.errors[0].message);
} else {
  console.log('❌ Should have rejected invalid data!');
}

// Test 4: Create a minimal valid resume
console.log('\n' + '='.repeat(60));
console.log('Test 4: Create Minimal Valid Resume');
console.log('='.repeat(60));

const minimalResume: ResumeData = {
  basics: {
    name: "Test User",
    headline: "Software Engineer",
    email: "test@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    url: { label: "", href: "" },
    customFields: [],
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      effects: {
        hidden: false,
        border: false,
        grayscale: false,
      },
    },
  },
  sections: {
    ...defaultResumeData.sections,
    summary: {
      ...defaultResumeData.sections.summary,
      content: "A passionate software engineer with experience in TypeScript and Node.js",
    },
  },
  metadata: defaultResumeData.metadata,
};

try {
  const validated = resumeDataSchema.parse(minimalResume);
  console.log('✅ Minimal resume is valid!');
  console.log('Name:', validated.basics.name);
  console.log('Summary:', validated.sections.summary.content);
} catch (error) {
  console.error('❌ Minimal resume validation failed:', error);
}

// Test 5: Export as JSON
console.log('\n' + '='.repeat(60));
console.log('Test 5: Export Sample Resume as JSON');
console.log('='.repeat(60));

try {
  const jsonString = JSON.stringify(sampleResumeData, null, 2);
  console.log('✅ Successfully serialized to JSON');
  console.log('JSON size:', (jsonString.length / 1024).toFixed(2), 'KB');
  
  // Parse it back
  const parsed = JSON.parse(jsonString);
  const revalidated = resumeDataSchema.parse(parsed);
  console.log('✅ Successfully deserialized and revalidated');
  
} catch (error) {
  console.error('❌ JSON serialization failed:', error);
}

console.log('\n' + '='.repeat(60));
console.log('All Tests Complete!');
console.log('='.repeat(60));

// Export test function for use in other files
export function testResumeSchema() {
  console.log('Testing resume schema...');
  const result = resumeDataSchema.safeParse(sampleResumeData);
  return result.success;
}
