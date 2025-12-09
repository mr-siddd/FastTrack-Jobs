import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  resumeDataSchema, 
  ResumeData,
  defaultResumeData,
  sampleResumeData 
} from '../services/resume/ResumeSchema';

/**
 * Resume Test Routes
 * 
 * Endpoints for testing the resume schema:
 * - GET  /api/resume/sample - Get sample resume data
 * - GET  /api/resume/default - Get default empty resume
 * - POST /api/resume/validate - Validate resume data
 * - GET  /api/resume/structure - Get schema structure
 */
export default async function resumeTestRoutes(fastify: FastifyInstance) {
  
  // Get sample resume data
  fastify.get('/api/resume/sample', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: sampleResumeData,
      message: 'Sample resume data (John Doe - Full Stack Engineer)'
    };
  });

  // Get default resume template
  fastify.get('/api/resume/default', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: defaultResumeData,
      message: 'Default empty resume template'
    };
  });

  // Validate resume data
  fastify.post('/api/resume/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = resumeDataSchema.safeParse(request.body);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Resume data is valid!',
        stats: {
          name: result.data.basics.name,
          email: result.data.basics.email,
          experienceCount: result.data.sections.experience.items.length,
          educationCount: result.data.sections.education.items.length,
          skillsCount: result.data.sections.skills.items.length,
          projectsCount: result.data.sections.projects.items.length,
        }
      };
    } else {
      reply.code(400);
      return {
        success: false,
        errors: result.error.errors,
        message: 'Resume data validation failed'
      };
    }
  });

  // Get schema structure
  fastify.get('/api/resume/structure', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      structure: {
        basics: {
          fields: ['name', 'headline', 'email', 'phone', 'location', 'url', 'customFields', 'picture'],
          description: 'Personal information and contact details'
        },
        sections: {
          available: [
            'summary',
            'experience',
            'education',
            'skills',
            'projects',
            'certifications',
            'awards',
            'publications',
            'volunteer',
            'languages',
            'interests',
            'profiles',
            'references',
            'custom'
          ],
          description: 'All resume sections with items'
        },
        metadata: {
          fields: ['template', 'layout', 'css', 'page', 'theme', 'typography', 'notes'],
          description: 'Presentation and formatting settings'
        }
      },
      message: 'Resume schema structure'
    };
  });

  // Test endpoint - returns stats about sample resume
  fastify.get('/api/resume/test', async (request: FastifyRequest, reply: FastifyReply) => {
    const validated = resumeDataSchema.parse(sampleResumeData);
    
    return {
      success: true,
      message: 'Resume schema test passed!',
      stats: {
        basics: {
          name: validated.basics.name,
          email: validated.basics.email,
          phone: validated.basics.phone,
          location: validated.basics.location,
          headline: validated.basics.headline,
        },
        sections: {
          experience: validated.sections.experience.items.length,
          education: validated.sections.education.items.length,
          skills: validated.sections.skills.items.length,
          projects: validated.sections.projects.items.length,
          certifications: validated.sections.certifications.items.length,
          languages: validated.sections.languages.items.length,
          profiles: validated.sections.profiles.items.length,
        },
        metadata: {
          template: validated.metadata.template,
          pageFormat: validated.metadata.page.format,
          primaryColor: validated.metadata.theme.primary,
          font: validated.metadata.typography.font.family,
        },
        validations: {
          schemaValid: true,
          totalSections: Object.keys(validated.sections).length,
          totalExperienceYears: '5+',
        }
      }
    };
  });
}
