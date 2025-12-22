/**
 * Test Node 5 (AutoApply) in isolation
 * 
 * This script tests the auto-apply functionality without running the full pipeline.
 * Usage: npx tsx test-node5.ts
 */

import { autoApplyNode } from './src/agents/nodes/AutoApplyNode';
import type { JobApplicationState } from './src/state/JobApplicationState';

async function testNode5() {
  console.log("=".repeat(80));
  console.log("🧪 TESTING NODE 5: AUTO-APPLY");
  console.log("=".repeat(80));

  // Create a minimal test state with all required data
  const testState: JobApplicationState = {
    jobUrl: "https://jobs.ashbyhq.com/zapier/c3224c7e-2db8-49fe-940d-08a588964275", // Replace with any job URL
    
    userResume: {
      basics: {
        name: "John Doe",
        headline: "Software Engineer",
        email: "john.doe@email.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        url: {
          label: "LinkedIn",
          href: "https://jobs.ashbyhq.com/zapier/c3224c7e-2db8-49fe-940d-08a588964275"
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
            grayscale: false
          }
        }
      },
      sections: {
          summary: {
              name: "Summary",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "summary",
              content: "Experienced Software Engineer with 5+ years in full-stack development."
          },
          experience: {
              name: "Experience",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "experience",
              items: []
          },
          education: {
              name: "Education",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "education",
              items: []
          },
          skills: {
              name: "Skills",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "skills",
              items: []
          },
          projects: {
              name: "Projects",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "projects",
              items: []
          },
          volunteer: {
              name: "Volunteer",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "volunteer",
              items: []
          },
          languages: {
              name: "Languages",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "languages",
              items: []
          },
          interests: {
              name: "Interests",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "interests",
              items: []
          },
          certifications: {
              name: "Certifications",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "certifications",
              items: []
          },
          publications: {
              name: "Publications",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "publications",
              items: []
          },
          awards: {
              name: "Awards",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "awards",
              items: []
          },
          references: {
              name: "References",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "references",
              items: []
          },
          custom: {},
          profiles: {
              name: "Profiles",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "profiles",
              items: []
          }
      },
      metadata: {
        template: "azurill",
        layout: [
          [["summary"], ["experience"]],
          [["education"], ["skills"]]
        ],
        css: {
          value: "",
          visible: false
        },
        page: {
            margin: 18,
            format: "a4",
            options: {
              breakLine: true,
              pageNumbers: true
            }
        },
        theme: {
          background: "#ffffff",
          text: "#000000",
          primary: "#0073b1"
        },
        typography: {
          font: {
            family: "IBM Plex Sans",
            subset: "latin",
            variants: ["regular"],
            size: 14
          },
          lineHeight: 1.5,
          hideIcons: false,
          underlineLinks: true
        },
        notes: ""
      }
    },

    tailoredResume: {
      basics: {
        name: "John Doe",
        headline: "Full-Stack Software Engineer",
        email: "john.doe@email.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        url: {
          label: "LinkedIn",
          href: "https://jobs.ashbyhq.com/zapier/c3224c7e-2db8-49fe-940d-08a588964275"
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
            grayscale: false
          }
        }
      },
      sections: {
          summary: {
              name: "Summary",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "summary",
              content: "Experienced Full-Stack Software Engineer specializing in React and Node.js."
          },
          experience: {
              name: "Experience",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "experience",
              items: []
          },
          education: {
              name: "Education",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "education",
              items: []
          },
          skills: {
              name: "Skills",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "skills",
              items: []
          },
          projects: {
              name: "Projects",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "projects",
              items: []
          },
          volunteer: {
              name: "Volunteer",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "volunteer",
              items: []
          },
          languages: {
              name: "Languages",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "languages",
              items: []
          },
          interests: {
              name: "Interests",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "interests",
              items: []
          },
          certifications: {
              name: "Certifications",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "certifications",
              items: []
          },
          publications: {
              name: "Publications",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "publications",
              items: []
          },
          awards: {
              name: "Awards",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "awards",
              items: []
          },
          references: {
              name: "References",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "references",
              items: []
          },
          custom: {},
          profiles: {
              name: "Profiles",
              columns: 1,
              separateLinks: true,
              visible: true,
              id: "profiles",
              items: []
          }
      },
      metadata: {
        template: "azurill",
        layout: [
          [["summary"], ["experience"]],
          [["education"], ["skills"]]
        ],
        css: {
          value: "",
          visible: false
        },
        page: {
            margin: 18,
            format: "a4",
            options: {
              breakLine: true,
              pageNumbers: true
            }
        },
        theme: {
          background: "#ffffff",
          text: "#000000",
          primary: "#0073b1"
        },
        typography: {
          font: {
            family: "IBM Plex Sans",
            subset: "latin",
            variants: ["regular"],
            size: 14
          },
          lineHeight: 1.5,
          hideIcons: false,
          underlineLinks: true
        },
        notes: ""
      }
    },

    pdfInfo: {
      filename: "John_Doe_Software_Engineer.pdf",
      filepath: "C:\\Users\\Admin\\Downloads\\FastTrackResumes\\John_Doe_Software_Engineer.pdf",
      size: 50000,
      generatedAt: new Date().toISOString()
    },

    currentStep: "pdf_generated",
    errors: [],
    retryCount: 0,
    maxRetries: 3,
    startedAt: new Date().toISOString(),
    
    options: {
      autoApply: true,  // ENABLED
      generatePDF: true,
      aiProvider: "copilot-proxy"
    }
  };

  console.log(`Job URL: ${testState.jobUrl}`);
  console.log(`Applicant: ${testState.tailoredResume?.basics.name}`);
  console.log(`Email: ${testState.tailoredResume?.basics.email}`);
  console.log(`Phone: ${testState.tailoredResume?.basics.phone}`);
  console.log(`Auto-Apply: ${testState.options?.autoApply ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log("=".repeat(80));

  try {
    console.log("\n🚀 Starting Node 5 test...\n");
    
    const result = await autoApplyNode(testState);
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ TEST COMPLETED");
    console.log("=".repeat(80));
    console.log("Result:", JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(80));
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the test
testNode5().catch(console.error);
