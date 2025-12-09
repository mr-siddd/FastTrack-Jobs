// Test environment variables
import 'dotenv/config';

console.log('=== Environment Variables Test ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `✅ Set (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `✅ Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('PORT:', process.env.PORT || '4000 (default)');

// Test AIProviderFactory
import { AIProviderFactory } from './services/ai/AIProviderFactory';

console.log('\n=== Available AI Providers ===');
const available = AIProviderFactory.getAvailableProviders();
console.log('Available:', available);

const recommended = AIProviderFactory.getRecommendedProvider();
console.log('Recommended:', recommended);

console.log('\n=== Creating Auto Provider ===');
try {
  const provider = AIProviderFactory.createProvider({ provider: 'auto' });
  console.log('✅ Provider created successfully');
} catch (error: any) {
  console.error('❌ Failed to create provider:', error.message);
}
