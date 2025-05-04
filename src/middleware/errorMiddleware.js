// Custom error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log the error for server-side tracking
  console.error('Error:', err);

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Prepare the error response
  const errorResponse = {
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    errorResponse.message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
    errorResponse.type = 'ValidationError';
  }

  if (err.name === 'UnauthorizedError') {
    // JWT authentication error
    errorResponse.message = 'Unauthorized access';
    errorResponse.type = 'AuthenticationError';
  }

  if (err.code === 11000) {
    // Duplicate key error (e.g., unique constraint)
    errorResponse.message = 'Duplicate key error';
    errorResponse.type = 'DuplicateError';
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// Custom error class for throwing specific errors
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
};
