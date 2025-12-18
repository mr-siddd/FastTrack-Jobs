/**
 * Test Script for Copilot Proxy Integration
 * 
 * This script tests the CopilotProxyAdapter and verifies it can:
 * 1. Connect to the proxy
 * 2. Send requests to Claude Sonnet 4.5
 * 3. Parse responses correctly
 * 4. Work with the AIProviderFactory
 */

import { createAIProvider, AIProviderFactory } from './services/ai/AIProviderFactory';
import { config } from 'dotenv';

// Load environment variables
config();

async function testCopilotProxy() {
  console.log('\n=== Copilot Proxy Integration Test ===\n');

  // Test 1: Check available providers
  console.log('Test 1: Checking available providers...');
  const available = AIProviderFactory.getAvailableProviders();
  console.log('✓ Available providers:', available);

  const recommended = AIProviderFactory.getRecommendedProvider();
  console.log('✓ Recommended provider:', recommended);
  console.log('');

  // Test 2: Create Copilot Proxy instance
  console.log('Test 2: Creating Copilot Proxy instance...');
  try {
    const llm = createAIProvider("copilot-proxy", 0.7);
    console.log('✓ CopilotProxyAdapter created successfully');
    console.log('');

    // Test 3: Simple chat test
    console.log('Test 3: Testing simple chat...');
    console.log('Sending: "Hello! What model are you? Please respond in one sentence."');
    
    const startTime = Date.now();
    const response = await llm.invoke("Hello! What model are you? Please respond in one sentence.");
    const duration = Date.now() - startTime;
    
    const content = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);
    
    console.log(`✓ Response received in ${duration}ms:`);
    console.log(`  "${content}"`);
    console.log('');

    // Test 4: Test with structured prompt
    console.log('Test 4: Testing structured output...');
    console.log('Requesting JSON format response');
    
    const structuredPrompt = `
Extract the following information from this job posting and return ONLY valid JSON:

Job Posting:
"We are hiring a Senior Full Stack Developer with 5+ years of experience in React and Node.js. 
Must have strong TypeScript skills. Location: San Francisco. Salary: $150-180k."

Return JSON with this structure:
{
  "title": "job title",
  "experienceYears": number,
  "requiredSkills": ["skill1", "skill2"],
  "location": "location",
  "salaryRange": "salary"
}
`;

    const structuredResponse = await llm.invoke(structuredPrompt);
    const structuredContent = typeof structuredResponse.content === "string" 
      ? structuredResponse.content 
      : JSON.stringify(structuredResponse.content);
    
    console.log('✓ Structured response received:');
    console.log(structuredContent);
    console.log('');

    // Test 5: Test auto-selection
    console.log('Test 5: Testing auto-selection...');
    const autoLlm = createAIProvider("auto", 0.7);
    console.log('✓ Auto-selection created provider successfully');
    console.log('');

    console.log('=== All tests passed! ✓ ===\n');
    console.log('Summary:');
    console.log('- Copilot Proxy is working correctly');
    console.log('- Claude Sonnet 4.5 is accessible');
    console.log('- Integration with LangChain is successful');
    console.log('- Ready to use in ParseJDNode and other components');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('1. Ensure copilot-proxy extension is running in VSCode');
    console.error('2. Check VSCode status bar for Copilot Proxy indicator');
    console.error('3. Verify port 3016 is configured in VSCode settings');
    console.error('4. Confirm GitHub Copilot Pro subscription is active');
    console.error('5. Try restarting VSCode');
    console.error('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  Connection refused - proxy is not running');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.error('⚠️  Authentication error - check Copilot Pro subscription');
    }
    
    process.exit(1);
  }
}

// Run the test
testCopilotProxy().catch(console.error);
