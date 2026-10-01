const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middlewares/error');

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// Multi-origin CORS Allow-list
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...config.clientUrls,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  })
);

// Request Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body Parsers (Note: Payment webhook uses raw body in payment router)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply Rate Limiter to API routes
app.use('/api/', apiLimiter);

// Mount API v1 Routes
app.use('/api/v1', routes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

