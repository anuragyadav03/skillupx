// scripts/run-drop.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    console.log('🔄 Running drop_all.sql...');

    const sqlPath = path.join(__dirname, '../db/drop_all.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ All tables dropped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to run drop_all.sql:', err.message);
    process.exit(1);
  }
})();
