import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import extractRoutes from './routes/extract';
import generateRoutes from './routes/generate';
import applyRoutes from './routes/apply';
import resumeTestRoutes from './routes/resume-test';
import jobAgentRoutes from './routes/job-agent';

// Log environment variables status
console.log('[Server] Environment variables loaded:');
console.log(`  DEFAULT_AI_PROVIDER: ${process.env.DEFAULT_AI_PROVIDER || 'auto (will use Copilot Proxy)'}`);
console.log(`  COPILOT_PROXY_URL: ${process.env.COPILOT_PROXY_URL || 'http://localhost:3016 (default)'}`);
console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  PORT: ${process.env.PORT || '4000 (default)'}`);

const server = Fastify({ logger: true });

server.register(cors, { origin: true });

// Register routes
server.register(extractRoutes, { prefix: '/api' });
server.register(generateRoutes, { prefix: '/api' });
server.register(applyRoutes, { prefix: '/api' });
server.register(resumeTestRoutes); // Resume test routes (already includes /api prefix)
server.register(jobAgentRoutes); // LangGraph agent routes

// Health / root route
server.get('/', async (_request, reply) => {
  return { 
    status: 'ok', 
    service: 'fasttrack-backend',
    features: {
      langgraph_agent: 'enabled',
      ai_providers: ['openai', 'gemini'],
      mcp_client: 'enabled'
    }
  };
});

const start = async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await server.listen({ port, host: '127.0.0.1' });
    server.log.info(`Server listening on http://127.0.0.1:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
