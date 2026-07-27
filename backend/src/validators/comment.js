import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const updateCommentSchema = createCommentSchema;
