import { FastifyPluginAsync } from 'fastify';
import OpenAIAdapter from '../services/ai/OpenAIAdapter';
import { ResumeSchema } from '../services/resume/ResumeSchema';
import PdfService from '../services/pdf/PdfService';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/generate-resume', async (request, reply) => {
    const body = request.body as any;
    const resume = body?.resumeJson;
    const jd = body?.jd || {};
    if (!resume) return reply.status(400).send({ error: 'resumeJson required' });

    // validate schema (basic)
    const parse = ResumeSchema.safeParse(resume);
    if (!parse.success) return reply.status(400).send({ error: parse.error.errors });

    let tailored = resume;
    try {
      const ai = new OpenAIAdapter();
      tailored = await ai.generateStructured('tailor-resume', { resume, jd });
    } catch (e) {
      // fall back to original resume on AI failure
      fastify.log.warn('AI tailoring failed, returning base resume');
    }

    // Generate PDF with naming rule Name_Position_Company
    const pdfPath = await PdfService.generatePdfForResume(tailored, jd?.title, jd?.company);

    return { resumeJson: tailored, resumePdfPath: pdfPath, resumePdfUrl: `file://${pdfPath}` };
  });
};

export default routes;
