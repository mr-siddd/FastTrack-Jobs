import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

interface JobData {
  jobId: string;
  url: string;
  jd: {
    title?: string;
    company?: string;
    location?: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    niceToHaveSkills?: string[];
    summary?: string;
  };
  rawText?: string;
}

interface AgentResult {
  success: boolean;
  message: string;
  state: any;
  summary: {
    status: string;
    duration: string;
    steps_completed: string[];
    job: any;
    pdf: any;
  };
}

function App() {
  const [jobUrl, setJobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [error, setError] = useState('');
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  
  // LangGraph Agent state
  const [agentProcessing, setAgentProcessing] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim()) {
      setError('Please enter a valid job URL');
      return;
    }

    setLoading(true);
    setError('');
    setJobData(null);

    try {
      const response = await axios.post('/api/extract-job', { jobUrl });
      setJobData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to extract job');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobData) return;
    setError('');
    setPdfPath(null);
    setLoading(true);
    try {
      const demoResume = {
        name: 'Your Name',
        contact: { email: 'you@example.com' },
        summary: 'Experienced engineer open to roles.',
        skills: ['TypeScript', 'React', 'Node.js'],
        experience: [],
      };
      const res = await axios.post('/api/generate-resume', {
        jd: jobData.jd,
        resumeJson: demoResume,
      });
      setPdfPath(res.data?.resumePdfUrl || null);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!jobData) return;
    setError('');
    setLoading(true);
    try {
      const demoResume = {
        name: 'Your Name',
        contact: { email: 'you@example.com' },
        summary: 'Experienced engineer open to roles.',
        skills: ['TypeScript', 'React', 'Node.js'],
        experience: [],
      };
      const res = await axios.post('/api/apply', {
        url: jobData.url || jobUrl,
        resumeJson: demoResume,
        resumePdfUrl: pdfPath,
      });
      alert('Apply task queued: ' + res.data?.taskId);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to start apply flow');
    } finally {
      setLoading(false);
    }
  };

  // NEW: LangGraph Agent - Process Everything in One Go
  const handleProcessWithAgent = async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a valid job URL');
      return;
    }

    setAgentProcessing(true);
    setError('');
    setAgentResult(null);
    setProcessingStep('Initializing...');

    try {
      // Sample resume - in production, this would come from user profile/upload
      const sampleResume = {
        basics: {
          name: "John Doe",
          headline: "Senior Software Engineer",
          email: "john.doe@example.com",
          phone: "+1-234-567-8900",
          location: "San Francisco, CA",
          url: { label: "Portfolio", href: "https://johndoe.dev" },
          customFields: [],
          picture: {
            url: "", size: 64, aspectRatio: 1, borderRadius: 0,
            effects: { hidden: false, border: false, grayscale: false }
          }
        },
        sections: {
          summary: {
            name: "Summary", columns: 1, separateLinks: true, visible: true, id: "summary",
            content: "<p>Experienced software engineer with 8+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.</p>"
          },
          experience: {
            name: "Experience", columns: 1, separateLinks: true, visible: true, id: "experience",
            items: [
              {
                id: "exp1", visible: true, company: "Tech Corp",
                position: "Senior Software Engineer", location: "San Francisco, CA",
                date: "2020 - Present",
                summary: "<p>Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines.</p>",
                url: { label: "", href: "" }
              }
            ]
          },
          education: {
            name: "Education", columns: 1, separateLinks: true, visible: true, id: "education",
            items: [
              {
                id: "edu1", visible: true, institution: "University of California",
                studyType: "Bachelor of Science", area: "Computer Science",
                score: "3.8 GPA", date: "2014 - 2018", summary: "",
                url: { label: "", href: "" }
              }
            ]
          },
          skills: {
            name: "Skills", columns: 2, separateLinks: true, visible: true, id: "skills",
            items: [
              { id: "s1", visible: true, name: "JavaScript/TypeScript", description: "Expert", level: 5, keywords: [] },
              { id: "s2", visible: true, name: "React & Node.js", description: "Advanced", level: 5, keywords: [] },
              { id: "s3", visible: true, name: "AWS & Docker", description: "Intermediate", level: 4, keywords: [] }
            ]
          },
          awards: { name: "Awards", columns: 1, separateLinks: true, visible: false, id: "awards", items: [] },
          certifications: { name: "Certifications", columns: 1, separateLinks: true, visible: false, id: "certifications", items: [] },
          interests: { name: "Interests", columns: 1, separateLinks: true, visible: false, id: "interests", items: [] },
          languages: { name: "Languages", columns: 1, separateLinks: true, visible: false, id: "languages", items: [] },
          profiles: { name: "Profiles", columns: 1, separateLinks: true, visible: false, id: "profiles", items: [] },
          projects: { name: "Projects", columns: 1, separateLinks: true, visible: false, id: "projects", items: [] },
          publications: { name: "Publications", columns: 1, separateLinks: true, visible: false, id: "publications", items: [] },
          references: { name: "References", columns: 1, separateLinks: true, visible: false, id: "references", items: [] },
          volunteer: { name: "Volunteering", columns: 1, separateLinks: true, visible: false, id: "volunteer", items: [] }
        },
        metadata: {
          template: "azurill",
          layout: [["summary", "experience", "education", "skills"]],
          css: { value: "", visible: false },
          page: { margin: 18, format: "a4", options: { breakLine: true, pageNumbers: true } },
          theme: { background: "#ffffff", text: "#000000", primary: "#dc2626" },
          typography: {
            font: { family: "IBM Plex Serif", subset: "latin", variants: ["regular", "italic", "600"], size: 14 },
            lineHeight: 1.5, hideIcons: false, underlineLinks: true
          },
          notes: ""
        }
      };

      setProcessingStep('Extracting job description...');
      
      const response = await axios.post('/api/job/process', {
        jobUrl,
        userResume: sampleResume,
        options: {
         // aiProvider: 'gemini', // Use free Gemini by default
         aiProvider: 'copilot-proxy', // Use Claude Sonnet 4.5 via GitHub Copilot Pro
          generatePDF: true,
          autoApply: false // Don't auto-apply yet
        }
      });

      setAgentResult(response.data);
      
      if (response.data.success) {
        setProcessingStep('✅ Complete!');
        setPdfPath(response.data.summary?.pdf?.filepath || null);
      } else {
        setProcessingStep('❌ Failed');
        setError(response.data.message || 'Processing failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Agent processing failed');
      setProcessingStep('❌ Error');
    } finally {
      setAgentProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FastTrack Job Tracker</h1>
        <p>Extract job descriptions and tailor your resume in seconds</p>
      </header>

      <main className="app-main">
        {/* Form Section */}
        <section className="form-section">
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label htmlFor="jobUrl">Job URL</label>
              <input
                id="jobUrl"
                type="url"
                placeholder="https://example.com/jobs/software-engineer"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={loading || agentProcessing}
                className="url-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading || agentProcessing} className="submit-btn">
                {loading ? 'Extracting...' : 'Extract Job Only'}
              </button>
              <button 
                type="button" 
                onClick={handleProcessWithAgent} 
                disabled={loading || agentProcessing} 
                className="submit-btn"
                style={{ background: '#10b981' }}
              >
                {agentProcessing ? `Processing... (${processingStep})` : '🚀 Process with AI Agent'}
              </button>
            </div>
          </form>
        </section>

        {/* Error Display */}
        {error && (
          <section className="error-section">
            <p className="error-message">{error}</p>
          </section>
        )}

        {/* Job Data Display */}
        {jobData && (
          <section className="job-data-section">
            <div className="job-header">
              <h2>{jobData.jd.title || 'Job Title'}</h2>
              <p className="job-company">
                {jobData.jd.company && <span>{jobData.jd.company}</span>}
                {jobData.jd.location && <span> • {jobData.jd.location}</span>}
              </p>
            </div>

            {jobData.jd.summary && (
              <div className="job-section">
                <h3>Summary</h3>
                <p>{jobData.jd.summary}</p>
              </div>
            )}

            {jobData.jd.responsibilities && jobData.jd.responsibilities.length > 0 && (
              <div className="job-section">
                <h3>Responsibilities</h3>
                <ul>
                  {jobData.jd.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {jobData.jd.requiredSkills && jobData.jd.requiredSkills.length > 0 && (
              <div className="job-section">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {jobData.jd.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jobData.jd.niceToHaveSkills && jobData.jd.niceToHaveSkills.length > 0 && (
              <div className="job-section">
                <h3>Nice-to-Have Skills</h3>
                <div className="skills-list">
                  {jobData.jd.niceToHaveSkills.map((skill, idx) => (
                    <span key={idx} className="skill-tag skill-tag--secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="job-actions">
              <button onClick={handleGenerate} disabled={loading} className="action-btn action-btn--primary">Generate Tailored Resume</button>
              <button onClick={handleApply} disabled={loading} className="action-btn action-btn--secondary">Apply Now</button>
            </div>

            {pdfPath && (
              <div className="job-section">
                <h3>Generated PDF</h3>
                <p>Saved at: <code>{pdfPath}</code></p>
              </div>
            )}
          </section>
        )}

        {/* LangGraph Agent Results */}
        {agentResult && (
          <section className="job-data-section" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="job-header">
              <h2>🤖 AI Agent Results</h2>
              <p className="job-company">
                Status: <strong>{agentResult.summary?.status}</strong> | 
                Duration: {agentResult.summary?.duration}
              </p>
            </div>

            {agentResult.summary?.steps_completed && (
              <div className="job-section">
                <h3>✅ Completed Steps</h3>
                <ul>
                  {agentResult.summary.steps_completed.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {agentResult.summary?.job && (
              <div className="job-section">
                <h3>📄 Job Details</h3>
                <p><strong>Title:</strong> {agentResult.summary.job.title}</p>
                <p><strong>Company:</strong> {agentResult.summary.job.company}</p>
                {agentResult.summary.job.skills && (
                  <div className="skills-list">
                    {agentResult.summary.job.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {agentResult.summary?.pdf && (
              <div className="job-section">
                <h3>📥 Tailored Resume PDF</h3>
                <p><strong>File:</strong> {agentResult.summary.pdf.filename}</p>
                <p><strong>Size:</strong> {(agentResult.summary.pdf.size / 1024).toFixed(2)} KB</p>
                <p><strong>Path:</strong> <code>{agentResult.summary.pdf.filepath}</code></p>
              </div>
            )}

            {agentResult.state?.errors && agentResult.state.errors.length > 0 && (
              <div className="job-section" style={{ background: '#fee' }}>
                <h3>⚠️ Errors</h3>
                {agentResult.state.errors.map((err: any, idx: number) => (
                  <div key={idx}>
                    <strong>{err.step}:</strong> {err.message}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 FastTrack. Built with React + TypeScript.</p>
      </footer>
    </div>
  );
}

export default App;
