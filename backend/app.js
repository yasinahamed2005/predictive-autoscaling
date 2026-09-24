import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';

const app = express();

// Prometheus scrape endpoint + per-request instrumentation. Added for the
// Predictive Autoscaling capstone extension — does not touch existing routes.
app.get('/metrics', metricsHandler);
app.use(metricsMiddleware);

app.set('trust proxy', 1); // needed for correct req.ip / rate limiting behind a reverse proxy

// Security headers
app.use(helmet());

// CORS — allow all local dev origins (5173, 5174, 8090) with credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Raw body needed for payment webhook signature verification;
// everything else gets normal JSON parsing.
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Strips any $/. keys from user input to block NoSQL operator injection.
app.use(mongoSanitize());
// Prevents HTTP parameter pollution (?price=10&price=20).
app.use(hpp());

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/api/v1', (req, res, next) => {
  if (req.path === '/system-status' || req.path.startsWith('/system-status')) {
    return next();
  }
  generalLimiter(req, res, next);
}, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
