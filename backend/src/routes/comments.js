import express from 'express';
import {
  getComments,
  updateComment,
  deleteComment
} from '../controllers/comments.js';
import { validate } from '../middleware/validate.js';
import { updateCommentSchema } from '../validators/comment.js';

const router = express.Router();

router.get('/', getComments);
router.put('/:id', validate(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);

export default router;
