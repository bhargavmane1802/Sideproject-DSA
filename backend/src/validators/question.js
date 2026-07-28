import { z } from 'zod';

export const createQuestionSchema = z.object({
  leetcodeId: z.number().int().positive().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  problemLink: z.string().url('Must be a valid URL'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topics: z.array(z.string()).default([]),
  companyTags: z.array(z.string()).default([]),
  questionType: z.array(z.string()).default([]),
  timeComplexity: z.string().default(''),
  spaceComplexity: z.string().default(''),
  description: z.string().default(''),
  notes: z.string().default(''),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const queryQuestionSchema = z.object({
  q: z.string().optional(),
  topics: z.string().optional(),
  difficulty: z.string().optional(),
  companyTags: z.string().optional(),
  questionTypes: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['leetcodeId', 'updatedAt', 'difficulty']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const importLeetCodeSchema = z.object({
  query: z.string().min(1, 'Problem number or title is required'),
});
