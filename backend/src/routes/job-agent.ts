import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { JobApplicationAgent } from "../agents/JobApplicationAgent";
import { createInitialState, jobApplicationStateSchema } from "../state/JobApplicationState";
import { sampleResumeData } from "../services/resume/ResumeSchema";
import { z } from "zod";

/**
 * Job Agent Routes
 * 
 * Main endpoint for running the LangGraph job application agent.
 * 
 * POST /api/job/process - Process a job application end-to-end
 */

// Request schema
const processJobRequestSchema = z.object({
  jobUrl: z.string().url(),
  userResume: z.any().optional(), // Use sampleResumeData if not provided
  options: z.object({
    autoApply: z.boolean().optional().default(false),
    generatePDF: z.boolean().optional().default(true),
    aiProvider: z.enum(["openai", "gemini", "copilot-proxy", "auto"]).optional().default("copilot-proxy"),
  }).optional(),
});

export default async function jobAgentRoutes(fastify: FastifyInstance) {
  
  /**
   * POST /api/job/process
   * 
   * Process a complete job application using the LangGraph agent.
   * 
   * Request Body:
   * {
   *   "jobUrl": "https://jobs.example.com/123",
   *   "userResume": { ... } // Optional, uses sample if not provided
   *   "options": {
   *     "autoApply": false,     // Set to true to auto-submit
   *     "generatePDF": true,    // Set to false to skip PDF
   *     "aiProvider": "auto"    // "openai", "gemini", or "auto"
   *   }
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "state": { ... },         // Complete final state
   *   "summary": { ... }        // Execution summary
   * }
   */
  fastify.post(
    "/api/job/process",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request
        const body = processJobRequestSchema.parse(request.body);
        
        // Use sample resume if not provided
        const userResume = body.userResume || sampleResumeData;
        
        // Create initial state
        const initialState = createInitialState(
          body.jobUrl,
          userResume,
          body.options
        );
        
        console.log(`\n[API] Processing job application: ${body.jobUrl}`);
        console.log(`[API] Applicant: ${userResume.basics.name}`);
        console.log(`[API] Options:`, JSON.stringify(initialState.options, null, 2));
        console.log(`[API] Auto-Apply Enabled: ${initialState.options?.autoApply === true ? 'YES ✅' : 'NO ❌'}`);
        
        // Run the agent
        const agent = new JobApplicationAgent();
        const finalState = await agent.processJob(initialState);
        
        // Build response summary
        const summary = {
          status: finalState.currentStep,
          duration: getDuration(finalState.startedAt, finalState.completedAt),
          steps_completed: getCompletedSteps(finalState),
          errors: finalState.errors,
          
          job: finalState.structuredJD ? {
            title: finalState.structuredJD.title,
            company: finalState.structuredJD.company,
            requiredSkills: finalState.structuredJD.requiredSkills,
          } : null,
          
          pdf: finalState.pdfInfo ? {
            filename: finalState.pdfInfo.filename,
            filepath: finalState.pdfInfo.filepath,
            size: `${(finalState.pdfInfo.size / 1024).toFixed(2)} KB`,
          } : null,
          
          application: finalState.applicationResult ? {
            status: finalState.applicationResult.status,
            message: finalState.applicationResult.message,
          } : null,
        };
        
        // Return success even if some steps failed (e.g., auto-apply)
        const success = finalState.currentStep === "application_complete" ||
                       finalState.currentStep === "pdf_generated";
        
        if (success) {
          return reply.code(200).send({
            success: true,
            message: "Job application processed",
            state: finalState,
            summary,
          });
        } else {
          return reply.code(500).send({
            success: false,
            message: "Job application processing failed",
            state: finalState,
            summary,
          });
        }
        
      } catch (error: any) {
        console.error("[API] Job processing error:", error);
        
        return reply.code(400).send({
          success: false,
          error: error.message,
          details: error.errors || [],
        });
      }
    }
  );

  /**
   * GET /api/job/test
   * 
   * Test the agent with a sample job URL
   */
  fastify.get(
    "/api/job/test",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const testJobUrl = "https://www.linkedin.com/jobs/view/3847404589"; // Example
      
      return {
        message: "Job agent test endpoint",
        usage: `POST /api/job/process with body: { "jobUrl": "${testJobUrl}" }`,
        sampleRequest: {
          jobUrl: testJobUrl,
          options: {
            autoApply: false,
            generatePDF: true,
            aiProvider: "auto",
          },
        },
      };
    }
  );

  /**
   * GET /api/job/status
   * 
   * Get agent status and configuration
   */
  fastify.get(
    "/api/job/status",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { AIProviderFactory } = await import("../services/ai/AIProviderFactory.js");
      
      const availableProviders = AIProviderFactory.getAvailableProviders();
      const recommendedProvider = AIProviderFactory.getRecommendedProvider();
      
      return {
        status: "operational",
        agent: "JobApplicationAgent",
        pipeline: [
          "Node 1: Extract JD (Playwright MCP)",
          "Node 2: Parse JD (AI)",
          "Node 3: Tailor Resume (AI)",
          "Node 4: Generate PDF",
          "Node 5: Auto-Apply (Playwright MCP)",
        ],
        ai: {
          availableProviders,
          recommendedProvider,
          currentDefault: "auto",
        },
        features: {
          jobExtraction: "✅ Implemented",
          buttonClicking: "✅ Implemented (Show More, View More)",
          aiParsing: "✅ Implemented (Structured output)",
          resumeTailoring: "✅ Implemented (AI-powered)",
          pdfGeneration: "✅ Implemented",
          autoApply: "⚠️  Placeholder (manual apply required)",
        },
      };
    }
  );
}

// Helper functions
function getDuration(start?: string, end?: string): string {
  if (!start || !end) return "Unknown";
  
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const durationMs = endTime - startTime;
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function getCompletedSteps(state: any): string[] {
  const steps = [];
  
  if (state.extractedJD) steps.push("Extract JD");
  if (state.structuredJD) steps.push("Parse JD");
  if (state.tailoredResume) steps.push("Tailor Resume");
  if (state.pdfInfo) steps.push("Generate PDF");
  if (state.applicationResult) steps.push("Auto-Apply");
  
  return steps;
}
