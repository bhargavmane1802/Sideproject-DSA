import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany({});
  await prisma.question.deleteMany({});

  const questions = [
    {
      leetcodeId: 1,
      title: 'Two Sum',
      slug: 'two-sum',
      problemLink: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'EASY',
      topics: ['Array', 'Hash Table'],
      companyTags: ['Google', 'Amazon'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      notes: 'Use a hash map to store the elements and their indices. For each element `nums[i]`, check if `target - nums[i]` exists in the hash map.'
    },
    {
      leetcodeId: 2,
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      problemLink: 'https://leetcode.com/problems/add-two-numbers/',
      difficulty: 'MEDIUM',
      topics: ['Linked List', 'Math'],
      companyTags: ['Amazon', 'Microsoft'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(max(N, M))',
      spaceComplexity: 'O(max(N, M))',
      notes: 'Keep track of the carry. Iterate through both linked lists simultaneously.'
    },
    {
      leetcodeId: 3,
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      problemLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      difficulty: 'MEDIUM',
      topics: ['Sliding Window', 'String'],
      companyTags: ['Amazon', 'Google'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(min(N, M))',
      notes: 'Use a sliding window with a set or map to keep track of seen characters.'
    },
    {
      leetcodeId: 4,
      title: 'Median of Two Sorted Arrays',
      slug: 'median-of-two-sorted-arrays',
      problemLink: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
      difficulty: 'HARD',
      topics: ['Binary Search', 'Array'],
      companyTags: ['Google', 'Apple'],
      questionType: ['Top 100 Liked'],
      timeComplexity: 'O(log(min(M, N)))',
      spaceComplexity: 'O(1)',
      notes: 'Use binary search on the smaller array to partition both arrays such that left half <= right half.'
    },
    {
      leetcodeId: 146,
      title: 'LRU Cache',
      slug: 'lru-cache',
      problemLink: 'https://leetcode.com/problems/lru-cache/',
      difficulty: 'MEDIUM',
      topics: ['Design', 'Hash Table', 'Doubly-Linked List'],
      companyTags: ['Amazon', 'Google', 'Meta'],
      questionType: ['Top Interview Questions'],
      timeComplexity: 'O(1) for both get and put',
      spaceComplexity: 'O(capacity)',
      notes: 'Combine a HashMap for O(1) access and a Doubly Linked List for O(1) updates to MRU/LRU ends.'
    },
    {
      leetcodeId: 56,
      title: 'Merge Intervals',
      slug: 'merge-intervals',
      problemLink: 'https://leetcode.com/problems/merge-intervals/',
      difficulty: 'MEDIUM',
      topics: ['Array', 'Sorting'],
      companyTags: ['Google', 'Meta'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N) or O(log N) depending on sort implementation',
      notes: 'Sort intervals by start time. Iterate and merge overlapping intervals (if current start <= prev end).'
    },
    {
      leetcodeId: 102,
      title: 'Binary Tree Level Order Traversal',
      slug: 'binary-tree-level-order-traversal',
      problemLink: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
      difficulty: 'MEDIUM',
      topics: ['Tree', 'BFS'],
      companyTags: ['Amazon', 'Microsoft'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N) for queue',
      notes: 'Use a queue to process nodes level by level. In each step, process all nodes currently in queue (size of current level).'
    },
    {
      leetcodeId: 212,
      title: 'Word Search II',
      slug: 'word-search-ii',
      problemLink: 'https://leetcode.com/problems/word-search-ii/',
      difficulty: 'HARD',
      topics: ['Trie', 'Backtracking'],
      companyTags: ['Amazon', 'Google'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(M * (4^L)) where M is cells, L is max word length',
      spaceComplexity: 'O(N) where N is total letters in dict',
      notes: 'Build a Trie from words, then do DFS on board. Optimization: remove found words from Trie to prune search.'
    },
    {
      leetcodeId: 207,
      title: 'Course Schedule',
      slug: 'course-schedule',
      problemLink: 'https://leetcode.com/problems/course-schedule/',
      difficulty: 'MEDIUM',
      topics: ['Graph', 'Topological Sort', 'DFS', 'BFS'],
      companyTags: ['Amazon', 'Meta'],
      questionType: ['Blind 75'],
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V + E)',
      notes: 'Detect cycles in a directed graph using DFS (visited/visiting states) or BFS (Kahn\'s algorithm for topological sort).'
    },
    {
      leetcodeId: 42,
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      problemLink: 'https://leetcode.com/problems/trapping-rain-water/',
      difficulty: 'HARD',
      topics: ['Array', 'Two Pointers', 'Stack'],
      companyTags: ['Google', 'Amazon'],
      questionType: ['Top Interview Questions'],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1) with two pointers',
      notes: 'Two pointers from ends. The amount of water trapped depends on the minimum of max heights on left and right.'
    }
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: q,
    });
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
