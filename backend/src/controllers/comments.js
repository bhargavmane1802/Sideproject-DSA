import prisma from '../lib/prisma.js';

export const getComments = async (req, res, next) => {
  try {
    const { questionId } = req.query;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }
    const comments = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: comments });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.json({ data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.comment.delete({
      where: { id },
    });

    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};
