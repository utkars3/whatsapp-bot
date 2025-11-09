import { run, all } from '../db.js';

export const create = async ({ user, amount, item, category = 'other', created_at }) => {
  const res = await run(
    `INSERT INTO expenses (user_id, amount, item, category, created_at) VALUES (?, ?, ?, ?, ?)`,
    [user, amount, item, category.toLowerCase(), created_at]
  );
  return res.lastID;
};

export const findByUserAndSince = async (user, sinceIso) =>
  all(`SELECT * FROM expenses WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC`, [user, sinceIso]);

export const findAllByUser = async (user) =>
  all(`SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC`, [user]);

// Modified to handle soft delete in Supabase
export const deleteAll = async () => run(`DELETE FROM expenses`);
