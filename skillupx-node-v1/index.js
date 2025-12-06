// index.js
import 'dotenv/config';
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const db = require('./db');
const logger = require('./config/logger');

const requestLogger = require('./middleware/requestLogger');
const authRoutes = require('./routes/auth.routes');
const authenticate = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 4000;

// ---------------------------------
// Middleware
// ---------------------------------
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(requestLogger);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ---------------------------------
// Health check
// ---------------------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ---------------------------------
// API Routes
// ---------------------------------
app.use('/api/auth', authRoutes);

// protected route sample
app.get('/api/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ---------------------------------
// Global Error Handler
// ---------------------------------
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: 'Unexpected error' });
});

// ---------------------------------
// Server + DB Startup
// ---------------------------------
const start = async () => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    logger.info('Database connected: ' + rows[0].now);
  } catch (err) {
    logger.error('Failed to connect to DB', { message: err.message });
    process.exit(1);
  }

  const server = app.listen(port, () =>
    logger.info(`Server running on port ${port}`)
  );

  // graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down...');

    server.close(() => {
      logger.info('HTTP server closed');

      db.pool.end(() => {
        logger.info('DB pool closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start();
