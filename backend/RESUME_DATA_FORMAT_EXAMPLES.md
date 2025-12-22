# Resume Data Format Examples

## Skills Section Format

### Input to TailorResumeNode
```json
{
  "sections": {
    "skills": {
      "items": [
        { "name": "JavaScript", "description": "Expert level", "keywords": [] },
        { "name": "React", "description": "Advanced", "keywords": [] },
        { "name": "Node.js", "description": "Intermediate", "keywords": [] },
        { "name": "Python", "description": "Intermediate", "keywords": [] },
        { "name": "Docker", "description": "Beginner", "keywords": [] }
      ]
    }
  }
}
```

### Output from TailorResumeNode (Grouped by Category)
```json
{
  "sections": {
    "skills": {
      "items": [
        { 
          "name": "Frontend", 
          "description": "React, Angular, TypeScript, Vue.js",
          "keywords": ["React", "Angular", "TypeScript", "Vue.js"]
        },
        { 
          "name": "Backend", 
          "description": "Node.js, Python, Golang, Express",
          "keywords": ["Node.js", "Python", "Golang", "Express"]
        },
        { 
          "name": "Database", 
          "description": "MongoDB, PostgreSQL, Redis",
          "keywords": ["MongoDB", "PostgreSQL", "Redis"]
        },
        { 
          "name": "DevOps", 
          "description": "Docker, Kubernetes, AWS, CI/CD",
          "keywords": ["Docker", "Kubernetes", "AWS", "CI/CD"]
        }
      ]
    }
  }
}
```

### How It Renders in PDF
```
TECHNICAL SKILLS
────────────────────────────────────────────────────
Frontend:  React, Angular, TypeScript, Vue.js
Backend:   Node.js, Python, Golang, Express
Database:  MongoDB, PostgreSQL, Redis
DevOps:    Docker, Kubernetes, AWS, CI/CD
```

---

## Projects Section Format

### Input Structure
```json
{
  "sections": {
    "projects": {
      "items": [
        {
          "id": "proj1",
          "name": "E-Commerce Platform",
          "summary": "Full-stack web application with payment integration",
          "description": "Built using MERN stack with Stripe integration",
          "date": "2023",
          "keywords": ["React", "Node.js", "MongoDB", "Stripe"],
          "url": {
            "label": "GitHub",
            "href": "https://github.com/username/ecommerce"
          },
          "highlights": [
            "Developed REST APIs using Node.js and Express, handling 10K+ daily requests",
            "Implemented React frontend with Redux state management and responsive design",
            "Integrated Stripe payment gateway with 99.9% transaction success rate"
          ],
          "visible": true
        },
        {
          "id": "proj2",
          "name": "Task Management System",
          "summary": "Agile project management tool with real-time collaboration",
          "description": "Microservices architecture with WebSocket support",
          "date": "2023",
          "keywords": ["Python", "FastAPI", "Docker", "WebSocket"],
          "url": {
            "label": "GitHub",
            "href": "https://github.com/username/task-manager"
          },
          "highlights": [
            "Built microservices architecture using Python FastAPI and Docker containers",
            "Created responsive UI with React and Material-UI following atomic design",
            "Implemented WebSocket-based real-time updates with Socket.io"
          ],
          "visible": true
        }
      ]
    }
  }
}
```

### How It Renders in PDF
```
PROJECTS
────────────────────────────────────────────────────
E-Commerce Platform - Full-stack web application with payment integration
• Developed REST APIs using Node.js and Express, handling 10K+ daily requests
• Implemented React frontend with Redux state management and responsive design
• Integrated Stripe payment gateway with 99.9% transaction success rate
Link: https://github.com/username/ecommerce

Task Management System - Agile project management tool with real-time collaboration
• Built microservices architecture using Python FastAPI and Docker containers
• Created responsive UI with React and Material-UI following atomic design
• Implemented WebSocket-based real-time updates with Socket.io
Link: https://github.com/username/task-manager
```

---

## Experience Section Format

### Input Structure
```json
{
  "sections": {
    "experience": {
      "items": [
        {
          "id": "exp1",
          "company": "Tech Corp",
          "position": "Senior Software Engineer",
          "location": "San Francisco, CA",
          "date": "Jan 2022 - Present",
          "summary": "Lead backend development for enterprise SaaS platform",
          "url": {
            "label": "",
            "href": ""
          },
          "keywords": ["Node.js", "Microservices", "AWS"],
          "highlights": [
            "Led development of microservices platform serving 100K+ users with 99.9% uptime",
            "Architected CI/CD pipeline reducing deployment time by 60% using Jenkins and Docker",
            "Mentored team of 5 junior developers on best practices and code review",
            "Implemented monitoring and alerting system using Prometheus and Grafana"
          ],
          "visible": true
        },
        {
          "id": "exp2",
          "company": "StartupXYZ",
          "position": "Software Engineer",
          "location": "Remote",
          "date": "Jun 2020 - Dec 2021",
          "summary": "Full-stack development for mobile app backend",
          "url": {
            "label": "",
            "href": ""
          },
          "keywords": ["React", "Node.js", "PostgreSQL"],
          "highlights": [
            "Developed RESTful APIs using Node.js and Express for mobile application backend",
            "Optimized database queries reducing response time by 40% using PostgreSQL indexing",
            "Collaborated with frontend team to implement responsive UI using React and Redux"
          ],
          "visible": true
        }
      ]
    }
  }
}
```

### How It Renders in PDF
```
EXPERIENCE
────────────────────────────────────────────────────
Senior Software Engineer at Tech Corp             Jan 2022 - Present
Lead backend development for enterprise SaaS platform
• Led development of microservices platform serving 100K+ users with 99.9% uptime
• Architected CI/CD pipeline reducing deployment time by 60% using Jenkins and Docker
• Mentored team of 5 junior developers on best practices and code review
• Implemented monitoring and alerting system using Prometheus and Grafana

Software Engineer at StartupXYZ                    Jun 2020 - Dec 2021
Full-stack development for mobile app backend
• Developed RESTful APIs using Node.js and Express for mobile application backend
• Optimized database queries reducing response time by 40% using PostgreSQL indexing
• Collaborated with frontend team to implement responsive UI using React and Redux
```

---

## Complete Resume Example (What AI Should Output)

```json
{
  "basics": {
    "name": "John Doe",
    "headline": "Full-Stack Software Engineer",
    "email": "john.doe@email.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "url": {
      "label": "LinkedIn",
      "href": "https://linkedin.com/in/johndoe"
    },
    "customFields": [],
    "picture": {
      "url": "",
      "size": 64,
      "aspectRatio": 1,
      "borderRadius": 0,
      "effects": {
        "hidden": false,
        "border": false,
        "grayscale": false
      }
    }
  },
  "sections": {
    "summary": {
      "name": "Summary",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "summary",
      "content": "Full-Stack Software Engineer with 5+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading teams and delivering high-impact features that serve millions of users. Passionate about clean code, performance optimization, and continuous learning."
    },
    "skills": {
      "name": "Skills",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "skills",
      "items": [
        {
          "id": "skill1",
          "visible": true,
          "name": "Frontend",
          "description": "React, Angular, TypeScript, Vue.js, HTML5, CSS3",
          "keywords": ["React", "Angular", "TypeScript", "Vue.js", "HTML5", "CSS3"],
          "level": 0
        },
        {
          "id": "skill2",
          "visible": true,
          "name": "Backend",
          "description": "Node.js, Python, Golang, Express, FastAPI",
          "keywords": ["Node.js", "Python", "Golang", "Express", "FastAPI"],
          "level": 0
        },
        {
          "id": "skill3",
          "visible": true,
          "name": "Database",
          "description": "MongoDB, PostgreSQL, Redis, MySQL",
          "keywords": ["MongoDB", "PostgreSQL", "Redis", "MySQL"],
          "level": 0
        },
        {
          "id": "skill4",
          "visible": true,
          "name": "DevOps",
          "description": "Docker, Kubernetes, AWS, CI/CD, Jenkins",
          "keywords": ["Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins"],
          "level": 0
        }
      ]
    },
    "experience": {
      "name": "Experience",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "experience",
      "items": [
        {
          "id": "exp1",
          "visible": true,
          "company": "Tech Corp",
          "position": "Senior Software Engineer",
          "location": "San Francisco, CA",
          "date": "Jan 2022 - Present",
          "summary": "Lead backend development for enterprise SaaS platform",
          "url": { "label": "", "href": "" },
          "highlights": [
            "Led development of microservices platform serving 100K+ users with 99.9% uptime",
            "Architected CI/CD pipeline reducing deployment time by 60% using Jenkins and Docker",
            "Mentored team of 5 junior developers on best practices and code review",
            "Implemented monitoring and alerting system using Prometheus and Grafana"
          ]
        },
        {
          "id": "exp2",
          "visible": true,
          "company": "StartupXYZ",
          "position": "Software Engineer",
          "location": "Remote",
          "date": "Jun 2020 - Dec 2021",
          "summary": "Full-stack development for mobile app backend",
          "url": { "label": "", "href": "" },
          "highlights": [
            "Developed RESTful APIs using Node.js and Express for mobile application backend",
            "Optimized database queries reducing response time by 40% using PostgreSQL indexing",
            "Collaborated with frontend team to implement responsive UI using React and Redux"
          ]
        }
      ]
    },
    "projects": {
      "name": "Projects",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "projects",
      "items": [
        {
          "id": "proj1",
          "visible": true,
          "name": "E-Commerce Platform",
          "summary": "Full-stack web application with payment integration",
          "description": "Built using MERN stack with Stripe integration",
          "date": "2023",
          "keywords": ["React", "Node.js", "MongoDB", "Stripe"],
          "url": { "label": "GitHub", "href": "https://github.com/johndoe/ecommerce" },
          "highlights": [
            "Developed REST APIs using Node.js and Express, handling 10K+ daily requests",
            "Implemented React frontend with Redux state management and responsive design",
            "Integrated Stripe payment gateway with 99.9% transaction success rate"
          ]
        },
        {
          "id": "proj2",
          "visible": true,
          "name": "Task Management System",
          "summary": "Agile project management tool with real-time collaboration",
          "description": "Microservices architecture with WebSocket support",
          "date": "2023",
          "keywords": ["Python", "FastAPI", "Docker", "WebSocket"],
          "url": { "label": "GitHub", "href": "https://github.com/johndoe/task-manager" },
          "highlights": [
            "Built microservices architecture using Python FastAPI and Docker containers",
            "Created responsive UI with React and Material-UI following atomic design",
            "Implemented WebSocket-based real-time updates with Socket.io"
          ]
        }
      ]
    },
    "education": {
      "name": "Education",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "education",
      "items": [
        {
          "id": "edu1",
          "visible": true,
          "institution": "University of California",
          "studyType": "Bachelor of Science",
          "area": "Computer Science",
          "score": "",
          "date": "2020",
          "summary": "",
          "url": { "label": "", "href": "" }
        }
      ]
    },
    "certifications": {
      "name": "Certifications",
      "columns": 1,
      "separateLinks": true,
      "visible": true,
      "id": "certifications",
      "items": [
        {
          "id": "cert1",
          "visible": true,
          "name": "AWS Certified Solutions Architect",
          "issuer": "Amazon Web Services",
          "date": "2023",
          "summary": "",
          "url": { "label": "", "href": "" }
        }
      ]
    }
  }
}
```

---

## Key Points for AI

1. **Skills**: Transform from individual skills to grouped categories
2. **Projects**: MUST have exactly 3 items in `highlights` array
3. **Experience**: Most recent job gets 4 highlights, others get 3
4. **URL fields**: Always use object format `{ "label": "", "href": "..." }`
5. **All arrays**: Even if empty, use `[]` not null
6. **Visible fields**: Always set to `true` for items that should appear
7. **IDs**: Generate unique IDs for each item
