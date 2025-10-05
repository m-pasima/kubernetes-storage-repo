import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { initDB } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database with retry to avoid crashloops while DB starts
const retries = parseInt(process.env.DB_INIT_RETRIES || '20', 10);
const backoffMs = parseInt(process.env.DB_INIT_BACKOFF_MS || '5000', 10);

async function initWithRetry() {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await initDB();
      return true;
    } catch (err) {
      const isLast = attempt === retries;
      console.error(`DB init failed (attempt ${attempt}/${retries}):`, err?.message || err);
      if (isLast) {
        console.error('Giving up DB init retries; continuing to serve health endpoint.');
        return false;
      }
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

await initWithRetry();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
