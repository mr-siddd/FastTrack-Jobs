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

function App() {
  const [jobUrl, setJobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [error, setError] = useState('');
  const [pdfPath, setPdfPath] = useState<string | null>(null);

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
                disabled={loading}
                className="url-input"
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Extracting...' : 'Extract Job Description'}
            </button>
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
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 FastTrack. Built with React + TypeScript.</p>
      </footer>
    </div>
  );
}

export default App;
