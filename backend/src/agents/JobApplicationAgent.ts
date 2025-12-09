import type { JobApplicationState } from "../state/JobApplicationState";
import { addError, hasErrors, getLastError } from "../state/JobApplicationState";
import { extractJDNode } from "./nodes/ExtractJDNode";
import { parseJDNode } from "./nodes/ParseJDNode";
import { tailorResumeNode } from "./nodes/TailorResumeNode";
import { generatePDFNode } from "./nodes/GeneratePDFNode";
import { autoApplyNode } from "./nodes/AutoApplyNode";

/**
 * JobApplicationAgent - Main LangGraph Orchestrator
 * 
 * This is the central agent that runs the complete job application pipeline.
 * It executes nodes in sequence, maintaining state and handling errors.
 * 
 * Pipeline:
 * 1. Extract JD (Playwright MCP) - Get job description
 * 2. Parse JD (AI) - Structure the job posting
 * 3. Tailor Resume (AI) - Customize resume for job
 * 4. Generate PDF - Create formatted resume file
 * 5. Auto-Apply (Playwright MCP) - Submit application
 * 
 * Features:
 * - Stateful execution (state flows through all nodes)
 * - Error handling with retry logic
 * - Progress tracking
 * - Conditional execution (skip nodes if needed)
 * - Detailed logging
 */

export class JobApplicationAgent {
  /**
   * Process a complete job application
   * 
   * @param initialState Initial state with jobUrl and userResume
   * @returns Final state with all results
   */
  async processJob(initialState: JobApplicationState): Promise<JobApplicationState> {
    console.log("=".repeat(80));
    console.log("🚀 JOB APPLICATION AGENT STARTING");
    console.log("=".repeat(80));
    console.log(`Job URL: ${initialState.jobUrl}`);
    console.log(`Applicant: ${initialState.userResume.basics.name}`);
    console.log(`Options:`, initialState.options);
    console.log("=".repeat(80));
    
    let state = { ...initialState };
    
    try {
      // Node 1: Extract Job Description
      state = await this.runNode(state, "Node 1: Extract JD", extractJDNode);
      if (hasErrors(state) && state.retryCount < state.maxRetries) {
        state = await this.retryNode(state, "Node 1: Extract JD", extractJDNode);
      }
      if (hasErrors(state)) {
        return this.handleFailure(state, "extract_jd");
      }
      
      // Node 2: Parse Job Description with AI
      state = await this.runNode(state, "Node 2: Parse JD", parseJDNode);
      if (hasErrors(state) && state.retryCount < state.maxRetries) {
        state = await this.retryNode(state, "Node 2: Parse JD", parseJDNode);
      }
      if (hasErrors(state)) {
        return this.handleFailure(state, "parse_jd");
      }
      
      // Node 3: Tailor Resume with AI
      state = await this.runNode(state, "Node 3: Tailor Resume", tailorResumeNode);
      if (hasErrors(state) && state.retryCount < state.maxRetries) {
        state = await this.retryNode(state, "Node 3: Tailor Resume", tailorResumeNode);
      }
      if (hasErrors(state)) {
        return this.handleFailure(state, "tailor_resume");
      }
      
      // Node 4: Generate PDF (optional)
      if (state.options?.generatePDF !== false) {
        state = await this.runNode(state, "Node 4: Generate PDF", generatePDFNode);
        // PDF generation failure is not critical, continue
      }
      
      // Node 5: Auto-Apply (optional)
      if (state.options?.autoApply === true) {
        state = await this.runNode(state, "Node 5: Auto-Apply", autoApplyNode);
        // Auto-apply failure is not critical (can apply manually)
      }
      
      // Mark as complete
      state.currentStep = "application_complete";
      state.completedAt = new Date().toISOString();
      
      console.log("=".repeat(80));
      console.log("✅ JOB APPLICATION AGENT COMPLETED SUCCESSFULLY");
      console.log("=".repeat(80));
      this.logSummary(state);
      console.log("=".repeat(80));
      
      return state;
      
    } catch (error: any) {
      console.error("❌ FATAL ERROR:", error.message);
      
      const finalState = addError(
        state,
        "agent",
        `Fatal error: ${error.message}`
      );
      
      finalState.currentStep = "failed";
      finalState.completedAt = new Date().toISOString();
      
      return finalState;
    }
  }

  /**
   * Run a single node
   */
  private async runNode(
    state: JobApplicationState,
    nodeName: string,
    nodeFunction: (state: JobApplicationState) => Promise<Partial<JobApplicationState>>
  ): Promise<JobApplicationState> {
    console.log(`\n${"─".repeat(80)}`);
    console.log(`▶️  ${nodeName}`);
    console.log(`${"─".repeat(80)}`);
    
    const startTime = Date.now();
    
    try {
      const updates = await nodeFunction(state);
      const newState = { ...state, ...updates };
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ ${nodeName} completed in ${duration}s`);
      
      return newState;
      
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ ${nodeName} failed after ${duration}s:`, error.message);
      
      return addError(state, nodeName, error.message);
    }
  }

  /**
   * Retry a node after failure
   */
  private async retryNode(
    state: JobApplicationState,
    nodeName: string,
    nodeFunction: (state: JobApplicationState) => Promise<Partial<JobApplicationState>>
  ): Promise<JobApplicationState> {
    const retryState = { ...state, retryCount: state.retryCount + 1 };
    
    console.log(`\n🔄 Retrying ${nodeName} (Attempt ${retryState.retryCount}/${state.maxRetries})`);
    
    // Wait before retry (exponential backoff)
    const waitTime = Math.min(1000 * Math.pow(2, retryState.retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return this.runNode(retryState, `${nodeName} (Retry ${retryState.retryCount})`, nodeFunction);
  }

  /**
   * Handle failure
   */
  private handleFailure(state: JobApplicationState, failedStep: string): JobApplicationState {
    console.log("=".repeat(80));
    console.log("❌ JOB APPLICATION AGENT FAILED");
    console.log("=".repeat(80));
    console.log(`Failed at: ${failedStep}`);
    console.log(`Last error: ${getLastError(state)}`);
    console.log(`Total errors: ${state.errors.length}`);
    console.log("=".repeat(80));
    
    return {
      ...state,
      currentStep: "failed",
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Log execution summary
   */
  private logSummary(state: JobApplicationState): void {
    console.log("\n📊 EXECUTION SUMMARY:");
    console.log(`  Duration: ${this.getDuration(state)}`);
    console.log(`  Final Status: ${state.currentStep}`);
    
    if (state.extractedJD) {
      console.log(`\n  📄 Job Extracted:`);
      console.log(`     Title: ${state.extractedJD.title || "N/A"}`);
      console.log(`     Company: ${state.extractedJD.company || "N/A"}`);
      console.log(`     Content Length: ${state.extractedJD.rawText.length} chars`);
    }
    
    if (state.structuredJD) {
      console.log(`\n  🔍 Job Parsed:`);
      console.log(`     Title: ${state.structuredJD.title}`);
      console.log(`     Company: ${state.structuredJD.company}`);
      console.log(`     Required Skills: ${state.structuredJD.requiredSkills.length}`);
      console.log(`     Requirements: ${state.structuredJD.requirements.length}`);
    }
    
    if (state.tailoredResume) {
      console.log(`\n  ✏️  Resume Tailored:`);
      console.log(`     Applicant: ${state.tailoredResume.basics.name}`);
      console.log(`     New Summary: ${state.tailoredResume.sections.summary.content.substring(0, 100)}...`);
    }
    
    if (state.pdfInfo) {
      console.log(`\n  📑 PDF Generated:`);
      console.log(`     File: ${state.pdfInfo.filename}`);
      console.log(`     Size: ${(state.pdfInfo.size / 1024).toFixed(2)} KB`);
      console.log(`     Path: ${state.pdfInfo.filepath}`);
    }
    
    if (state.applicationResult) {
      console.log(`\n  📮 Application:`);
      console.log(`     Status: ${state.applicationResult.status}`);
      console.log(`     Message: ${state.applicationResult.message}`);
    }
    
    if (state.errors.length > 0) {
      console.log(`\n  ⚠️  Errors (${state.errors.length}):`);
      state.errors.forEach((err, i) => {
        console.log(`     ${i + 1}. [${err.step}] ${err.message}`);
      });
    }
  }

  /**
   * Get execution duration
   */
  private getDuration(state: JobApplicationState): string {
    if (!state.startedAt || !state.completedAt) return "Unknown";
    
    const start = new Date(state.startedAt).getTime();
    const end = new Date(state.completedAt).getTime();
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
}
