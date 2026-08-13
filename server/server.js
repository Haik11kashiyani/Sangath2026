import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
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

// Initialize DB and auto-seed if empty
// On Vercel, we might want to do this lazily or in a separate script, 
// but doing it synchronously on startup is fine for serverless if it's fast enough.
// Since it's async now, we do it in a self-invoking function if running locally.
const setupDb = async () => {
  try {
    await initializeDatabase();
    await seedDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};
// We trigger it here. It returns a promise.
setupDb();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // allow images/scripts from local dev
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
  res.json({ status: 'ok', time: new Date().toISOString() });
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
