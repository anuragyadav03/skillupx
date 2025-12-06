// src/models/purchaseModel.js
import pool from '../config/db.js';

export const createPurchase = async ({ user_id, course_id, purchase_price, currency, payment_provider, payment_reference, payment_metadata, status }) => {
  const { rows } = await pool.query(
    `INSERT INTO purchases (user_id, course_id, purchase_price, currency, payment_provider, payment_reference, payment_metadata, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [user_id, course_id, purchase_price, currency, payment_provider, payment_reference, payment_metadata || {}, status || 'completed']
  );
  return rows[0];
};

export const findPurchasesByUser = async (user_id) => {
  const { rows } = await pool.query('SELECT * FROM purchases WHERE user_id = $1 ORDER BY purchased_at DESC', [user_id]);
  return rows;
};
