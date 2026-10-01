const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Occurred]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate field value entered for '${field}'. Please provide a unique value.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found or invalid ID format: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

