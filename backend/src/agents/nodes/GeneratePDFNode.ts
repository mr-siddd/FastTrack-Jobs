import type { JobApplicationState, PDFInfo } from "../../state/JobApplicationState";
import { addError } from "../../state/JobApplicationState";
import PdfService from "../../services/pdf/PdfService";

/**
 * Node 4: Generate PDF from Tailored Resume
 * 
 * Responsibilities:
 * - Take tailored resume data
 * - Generate professional PDF using metadata formatting
 * - Save with standardized filename: Name_Position_Company.pdf
 * - Return file path and metadata
 * 
 * Input: state.tailoredResume
 * Output: state.pdfInfo
 */

export async function generatePDFNode(
  state: JobApplicationState
): Promise<Partial<JobApplicationState>> {
  console.log("[Node 4] Starting PDF generation");
  
  // Validate input
  if (!state.tailoredResume) {
    const newState = addError(
      state,
      "generate_pdf",
      "No tailored resume found. Node 3 must run first."
    );
    return {
      ...newState,
      currentStep: "failed",
    };
  }

  // Check if PDF generation is enabled
  if (state.options?.generatePDF === false) {
    console.log("[Node 4] PDF generation skipped (disabled in options)");
    return {
      currentStep: "pdf_generated",
    };
  }

  try {
    const resume = state.tailoredResume;
    const jobTitle = state.structuredJD?.title || "Position";
    const company = state.structuredJD?.company || "Company";
    
    // Create filename: Name_Position_Company.pdf
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${sanitize(resume.basics.name)}_${sanitize(jobTitle)}_${sanitize(company)}.pdf`;
    
    console.log(`[Node 4] Generating PDF: ${filename}`);
    
    // Use PDF service to generate
    const filepath = await PdfService.generatePdfForResume(resume, jobTitle, company);
    
    // Get file stats
    const fs = await import("fs");
    const stats = fs.statSync(filepath);
    
    const pdfInfo: PDFInfo = {
      filename,
      filepath,
      size: stats.size,
      generatedAt: new Date().toISOString(),
    };
    
    console.log(`[Node 4] PDF generated successfully`);
    console.log(`[Node 4] File: ${filepath}`);
    console.log(`[Node 4] Size: ${(pdfInfo.size / 1024).toFixed(2)} KB`);
    
    return {
      pdfInfo,
      currentStep: "pdf_generated",
    };
    
  } catch (error: any) {
    console.error("[Node 4] PDF generation failed:", error.message);
    
    const newState = addError(
      state,
      "generate_pdf",
      `Failed to generate PDF: ${error.message}`
    );
    
    return {
      ...newState,
      currentStep: "failed",
    };
  }
}
