import express from 'express';
import {
  getQuestions,
  getQuestionBySlug,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addComment,
  importFromLeetCode,
} from '../controllers/questions.js';
import { validate } from '../middleware/validate.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  queryQuestionSchema,
  importLeetCodeSchema,
} from '../validators/question.js';
import { createCommentSchema } from '../validators/comment.js';

const router = express.Router();

router.get('/', validate(queryQuestionSchema, 'query'), getQuestions);
router.post('/', validate(createQuestionSchema), createQuestion);

// Must be BEFORE /:slug route to avoid being caught as a slug
router.post('/import-leetcode', validate(importLeetCodeSchema), importFromLeetCode);

router.get('/:slug', getQuestionBySlug);
router.put('/:id', validate(updateQuestionSchema), updateQuestion);
router.delete('/:id', deleteQuestion);

router.post('/:id/comments', validate(createCommentSchema), addComment);

export default router;
