import 'dotenv/config';
import app from './app.js';
import pool from './config/db.js';

const PORT = process.env.PORT || 4000;

const tryConnect = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Postgres: connected');
      return;
    } catch (err) {
      console.warn(`Postgres: connect attempt ${i + 1} failed — ${err.message}`);
      // last attempt: don't delay
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Postgres: failed to connect after retries');
};

// top-level await (allowed in ESM)
try {
  await tryConnect();               // <--- IMPORTANT: call it and await it
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err);
  // ensure Node exits with non-zero code so process managers can detect failure
  process.exit(1);
}
