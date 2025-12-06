import { z } from 'zod';

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
});

export const ResumeSchema = z.object({
  name: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(ExperienceSchema).optional(),
  education: z.array(z.object({ school: z.string(), degree: z.string(), year: z.string() })).optional(),
  metadata: z.record(z.any()).optional(),
});

export type Resume = z.infer<typeof ResumeSchema>;
