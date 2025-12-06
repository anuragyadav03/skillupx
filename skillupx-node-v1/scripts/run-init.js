// scripts/run-init.js (ESM)
import fs from 'fs';
import pool from '../src/config/db.js'; // adjust path if needed
import 'dotenv/config';

const sql = fs.readFileSync(new URL('../db/init.sql', import.meta.url), 'utf8');

try {
  const run = async () => {
    await pool.query(sql);
    console.log('DB init.sql executed successfully');
    await pool.end();
  };
  run().catch((err) => {
    console.error('Failed to run init.sql', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Could not read init.sql', err);
  process.exit(1);
}
