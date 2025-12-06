import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add ssl: { rejectUnauthorized: false } in production if needed
});

pool.on('error', (err) => {
    console.error('Unexpected PG client error', err);
    process.exit(-1);
});

export default pool;