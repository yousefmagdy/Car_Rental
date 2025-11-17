const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log full error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // In production, only log error message without stack trace
    console.error('Error:', err.message);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // Don't expose stack trace in production
  const response = {
    success: false,
    error: error.message || 'Server Error',
  };

  // Only include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;

