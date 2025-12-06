import { FastifyPluginAsync } from 'fastify';
import McpClient from '../services/mcp/McpClient';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/apply', async (request, reply) => {
    const body = request.body as any;
    const { url, jobId, resumeJson, resumePdfUrl } = body;
    if ((!jobId && !url) || !resumeJson)
      return reply.status(400).send({ error: 'url or jobId, and resumeJson are required' });

    const mcp = new McpClient();
    const taskId = `task-${Date.now()}`;

    // Stubbed apply - will be replaced with real flow
    const result = await mcp.applyToJob({ url: url || jobId, resumeJson, resumePdfUrl });
    return { taskId, result };
  });
};

export default routes;
