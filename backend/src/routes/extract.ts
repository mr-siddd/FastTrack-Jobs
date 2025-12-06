import { FastifyPluginAsync } from 'fastify';
import McpClient from '../services/mcp/McpClient';
import OpenAIAdapter from '../services/ai/OpenAIAdapter';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/extract-job', async (request, reply) => {
    const body = request.body as any;
    const jobUrl = body?.jobUrl;
    if (!jobUrl) return reply.status(400).send({ error: 'jobUrl required' });

    try {
      const mcp = new McpClient();
      const rawJd = await mcp.extractJobDescription(jobUrl);

      let structuredJd: any = null;
      try {
        const ai = new OpenAIAdapter();
        structuredJd = await ai.generateStructured('extract-jd', { htmlOrText: rawJd.text });
      } catch (aiErr: any) {
        fastify.log.warn({ aiErr }, 'AI extraction failed, returning raw text');
        structuredJd = { title: rawJd.title, company: undefined, location: undefined, responsibilities: [], requiredSkills: [], niceToHaveSkills: [], summary: undefined, text: rawJd.text };
      }

      return {
        jobId: `job-${Date.now()}`,
        url: jobUrl,
        jd: structuredJd,
        rawText: rawJd.text,
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to extract job' });
    }
  });
};

export default routes;
