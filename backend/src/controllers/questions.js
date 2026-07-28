import prisma from '../lib/prisma.js';

// GraphQL query to search for problems by title or number
const PROBLEMSET_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        difficulty
        topicTags {
          name
          slug
        }
        companyTagStats
      }
    }
  }
`;

// GraphQL query to get full question details by titleSlug
const QUESTION_DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      difficulty
      content
      topicTags {
        name
        slug
      }
      companyTagStats
    }
  }
`;


export const getQuestions = async (req, res, next) => {
  try {
    const {
      q,
      topics,
      difficulty,
      companyTags,
      questionTypes,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {};

    if (q) {
      const qInt = parseInt(q, 10);
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        ...(isNaN(qInt) ? [] : [{ leetcodeId: qInt }]),
      ];
    }

    if (topics) {
      where.topics = { hasSome: topics.split(',').map((t) => t.trim()) };
    }

    if (difficulty) {
      where.difficulty = { in: difficulty.split(',').map((d) => d.trim().toUpperCase()) };
    }

    if (companyTags) {
      where.companyTags = { hasSome: companyTags.split(',').map((t) => t.trim()) };
    }

    if (questionTypes) {
      where.questionType = { hasSome: questionTypes.split(',').map((t) => t.trim()) };
    }

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      data: questions,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ data: question });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const data = req.body;
    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // check if slug exists
    const existing = await prisma.question.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const question = await prisma.question.create({
      data: {
        ...data,
        slug,
      },
    });

    res.status(201).json({ data: question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let updateData = { ...data };

    if (data.title) {
      let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await prisma.question.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({
      where: { id },
    });

    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Verify question exists
    await prisma.question.findUniqueOrThrow({ where: { id } });

    const comment = await prisma.comment.create({
      data: {
        content,
        questionId: id,
      },
    });

    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
};

export const importFromLeetCode = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query (problem number or title) is required' });
    }

    const trimmed = query.trim();
    const isNumber = /^\d+$/.test(trimmed);

    let titleSlug = null;

    if (isNumber) {
      // Fetch by problem number — search problem list and find matching frontendQuestionId
      const listResponse = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({
          query: PROBLEMSET_QUERY,
          variables: {
            categorySlug: '',
            skip: parseInt(trimmed, 10) - 1,
            limit: 1,
            filters: {},
          },
        }),
      });

      const listResult = await listResponse.json();

      if (listResult.errors) {
        return res.status(400).json({ error: 'Failed to fetch from LeetCode', details: listResult.errors });
      }

      const questions = listResult?.data?.problemsetQuestionList?.questions;
      if (!questions || questions.length === 0) {
        return res.status(404).json({ error: `No problem found with ID ${trimmed}` });
      }

      // Verify it's actually the right problem number
      const match = questions.find(q => String(q.frontendQuestionId) === trimmed);
      if (match) {
        titleSlug = match.titleSlug;
      } else {
        // Fallback: use the first result's titleSlug
        titleSlug = questions[0].titleSlug;
      }
    } else {
      // Treat as title — convert to slug format
      titleSlug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Fetch full question details by titleSlug
    const detailResponse = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: QUESTION_DETAIL_QUERY,
        variables: { titleSlug },
      }),
    });

    const detailResult = await detailResponse.json();

    if (detailResult.errors) {
      return res.status(400).json({ error: 'Failed to fetch question details', details: detailResult.errors });
    }

    const q = detailResult?.data?.question;
    if (!q) {
      return res.status(404).json({ error: `Problem not found on LeetCode: "${trimmed}"` });
    }

    // Parse company tags if available
    let companyTags = [];
    if (q.companyTagStats) {
      try {
        const parsed = JSON.parse(q.companyTagStats);
        // companyTagStats is an object with keys "1", "2", "3" (frequency buckets)
        companyTags = Object.values(parsed)
          .flat()
          .map((c) => c.name)
          .filter(Boolean);
      } catch {
        companyTags = [];
      }
    }

    // Map topics
    const topics = (q.topicTags || []).map((t) => t.name);

    // Map difficulty
    const difficultyMap = { Easy: 'EASY', Medium: 'MEDIUM', Hard: 'HARD' };
    const difficulty = difficultyMap[q.difficulty] || 'EASY';

    const importedData = {
      leetcodeId: q.questionFrontendId ? parseInt(q.questionFrontendId, 10) : null,
      title: q.title,
      problemLink: `https://leetcode.com/problems/${q.titleSlug}/`,
      difficulty,
      topics,
      companyTags,
      questionType: [],
      timeComplexity: '',
      spaceComplexity: '',
      description: q.content || '',
      notes: '',
    };

    return res.json({ data: importedData });
  } catch (error) {
    console.error('LeetCode import error:', error);
    next(error);
  }
};
