export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  // Prisma Error Handling
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Unique constraint failed. The resource already exists.',
          target: err.meta?.target
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found.'
        });
      default:
        return res.status(500).json({
          error: 'Database error occurred.',
          code: err.code
        });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
