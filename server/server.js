import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from local .env (ignored on Vercel since env vars are injected)
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

import { initializeDatabase } from './config/database.js';
import { seedDatabase } from './seeds/seed.js';

// Import Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import contentRoutes from './routes/content.js';
import imagesRoutes from './routes/images.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import inquiriesRoutes from './routes/inquiries.js';
import menuRoutes from './routes/menu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Track DB readiness
let dbReady = false;
let dbError = null;

const setupDb = async () => {
  try {
    await initializeDatabase();
    await seedDatabase();
    dbReady = true;
    console.log('[SERVER] Database setup complete');
  } catch (error) {
    dbError = error;
    console.error('Database initialization error:', error);
  }
};
const dbPromise = setupDb();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Wait for DB to be ready before handling any API request (except health/debug)
app.use('/api/', async (req, res, next) => {
  if (req.path === '/health' || req.path === '/debug') return next();
  if (!dbReady && !dbError) {
    // Wait up to 10s for DB to initialize
    await Promise.race([dbPromise, new Promise(r => setTimeout(r, 10000))]);
  }
  if (dbError) {
    return res.status(500).json({ 
      error: 'Database connection failed', 
      details: dbError.message 
    });
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/menu', menuRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbReady, time: new Date().toISOString() });
});

// Debug endpoint - shows env var status (masks values for security)
app.get('/api/debug', (req, res) => {
  res.json({
    dbReady,
    dbError: dbError ? dbError.message : null,
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (' + process.env.TURSO_AUTH_TOKEN.length + ' chars)' : 'NOT SET',
      CLOUDINARY_URL: process.env.CLOUDINARY_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET',
    }
  });
});

// Serve frontend dist build if present (Production)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Export app for Vercel
export default app;

// Listen on port if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SERVER] Sangath Global Exim CRM Backend running on http://localhost:${PORT}`);
  });
}
