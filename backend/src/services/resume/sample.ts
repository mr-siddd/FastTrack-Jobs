import type { ResumeData } from "./ResumeSchema";

/**
 * Sample Resume Data for Testing
 * 
 * This is a complete example resume that can be used for:
 * - Testing the LangGraph agent pipeline
 * - Demonstrating the resume structure
 * - Development and debugging
 * 
 * Usage:
 * import { sampleResumeData } from './sample';
 * const tailoredResume = await agent.processJob({ 
 *   jobUrl: 'https://...', 
 *   userResume: sampleResumeData 
 * });
 */
export const sampleResumeData: ResumeData = {
  basics: {
    name: "John Doe",
    headline: "Full Stack Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    url: {
      label: "Portfolio",
      href: "https://johndoe.dev",
    },
    customFields: [],
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      effects: {
        hidden: false,
        border: false,
        grayscale: false,
      },
    },
  },
  sections: {
    summary: {
      id: "summary",
      name: "Summary",
      columns: 1,
      separateLinks: true,
      visible: true,
      content:
        "Experienced Full Stack Software Engineer with 5+ years building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud infrastructure. Passionate about creating user-centric solutions and mentoring junior developers.",
    },
    experience: {
      id: "experience",
      name: "Experience",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "exp1",
          visible: true,
          company: "Tech Corp",
          position: "Senior Software Engineer",
          location: "San Francisco, CA",
          date: "Jan 2021 - Present",
          summary:
            "• Led development of microservices architecture serving 1M+ users\n• Reduced API response time by 40% through database optimization\n• Mentored team of 3 junior engineers\n• Implemented CI/CD pipeline reducing deployment time by 60%",
          url: {
            label: "Tech Corp",
            href: "https://techcorp.com",
          },
        },
        {
          id: "exp2",
          visible: true,
          company: "StartupXYZ",
          position: "Full Stack Developer",
          location: "Remote",
          date: "Jun 2019 - Dec 2020",
          summary:
            "• Built real-time chat application using WebSockets and Redis\n• Developed responsive UI components with React and TypeScript\n• Integrated third-party APIs for payment processing and analytics\n• Collaborated with design team to implement pixel-perfect UIs",
          url: {
            label: "StartupXYZ",
            href: "https://startupxyz.io",
          },
        },
      ],
    },
    education: {
      id: "education",
      name: "Education",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "edu1",
          visible: true,
          institution: "University of California, Berkeley",
          studyType: "Bachelor of Science",
          area: "Computer Science",
          score: "3.8 GPA",
          date: "2015 - 2019",
          summary: "Dean's List, Computer Science Club President",
          url: {
            label: "UC Berkeley",
            href: "https://berkeley.edu",
          },
        },
      ],
    },
    skills: {
      id: "skills",
      name: "Skills",
      columns: 2,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "skill1",
          visible: true,
          name: "Frontend Development",
          description: "React, TypeScript, Next.js, Tailwind CSS",
          level: 5,
          keywords: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        },
        {
          id: "skill2",
          visible: true,
          name: "Backend Development",
          description: "Node.js, Express, Fastify, PostgreSQL",
          level: 4,
          keywords: ["Node.js", "Express", "Fastify", "PostgreSQL"],
        },
        {
          id: "skill3",
          visible: true,
          name: "DevOps",
          description: "Docker, Kubernetes, AWS, CI/CD",
          level: 4,
          keywords: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
        },
        {
          id: "skill4",
          visible: true,
          name: "AI/ML",
          description: "LangChain, OpenAI API, Prompt Engineering",
          level: 3,
          keywords: ["LangChain", "OpenAI", "Prompt Engineering"],
        },
      ],
    },
    projects: {
      id: "projects",
      name: "Projects",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "proj1",
          visible: true,
          name: "AI Job Application Automator",
          description: "Automated job application system using LangGraph and Playwright",
          date: "2024",
          summary:
            "Built an intelligent agent that extracts job descriptions, tailors resumes, and auto-fills applications using AI and browser automation.",
          keywords: ["LangGraph", "Playwright", "TypeScript", "OpenAI"],
          url: {
            label: "GitHub",
            href: "https://github.com/johndoe/job-automator",
          },
        },
      ],
    },
    certifications: {
      id: "certifications",
      name: "Certifications",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "cert1",
          visible: true,
          name: "AWS Certified Solutions Architect",
          date: "2023",
          issuer: "Amazon Web Services",
          summary: "Associate level certification",
          url: {
            label: "Verify",
            href: "https://aws.amazon.com/verification",
          },
        },
      ],
    },
    profiles: {
      id: "profiles",
      name: "Profiles",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "profile1",
          visible: true,
          network: "LinkedIn",
          username: "johndoe",
          icon: "lucide:linkedin",
          url: {
            label: "LinkedIn",
            href: "https://linkedin.com/in/johndoe",
          },
        },
        {
          id: "profile2",
          visible: true,
          network: "GitHub",
          username: "johndoe",
          icon: "lucide:github",
          url: {
            label: "GitHub",
            href: "https://github.com/johndoe",
          },
        },
      ],
    },
    languages: {
      id: "languages",
      name: "Languages",
      columns: 2,
      separateLinks: true,
      visible: true,
      items: [
        {
          id: "lang1",
          visible: true,
          name: "English",
          description: "Native",
          level: 5,
        },
        {
          id: "lang2",
          visible: true,
          name: "Spanish",
          description: "Professional working proficiency",
          level: 3,
        },
      ],
    },
    awards: {
      id: "awards",
      name: "Awards",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [],
    },
    volunteer: {
      id: "volunteer",
      name: "Volunteering",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [],
    },
    interests: {
      id: "interests",
      name: "Interests",
      columns: 2,
      separateLinks: true,
      visible: true,
      items: [],
    },
    publications: {
      id: "publications",
      name: "Publications",
      columns: 1,
      separateLinks: true,
      visible: true,
      items: [],
    },
    references: {
      id: "references",
      name: "References",
      columns: 1,
      separateLinks: true,
      visible: false,
      items: [],
    },
    custom: {},
  },
  metadata: {
    template: "rhyhorn",
    layout: [
      [
        ["profiles", "summary", "experience", "education", "projects"],
        ["skills", "certifications", "languages"],
      ],
    ],
    css: {
      value: "",
      visible: false,
    },
    page: {
      margin: 18,
      format: "a4",
      options: {
        breakLine: true,
        pageNumbers: true,
      },
    },
    theme: {
      background: "#ffffff",
      text: "#000000",
      primary: "#2563eb",
    },
    typography: {
      font: {
        family: "IBM Plex Sans",
        subset: "latin",
        variants: ["regular", "italic", "600"],
        size: 14,
      },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: true,
    },
    notes: "Sample resume for testing the FastTrackJobs application",
  },
};
