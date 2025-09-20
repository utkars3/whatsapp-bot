import { run, all } from '../db.js';

export const create = async ({ user, amount, item, category = null, created_at }) => {
  const res = await run(
    `INSERT INTO expenses (user, amount, item, category, created_at) VALUES (?, ?, ?, ?, ?)`,
    [user, amount, item, category, created_at]
  );
  return res.lastID;
};

export const findByUserAndSince = async (user, sinceIso) =>
  all(`SELECT * FROM expenses WHERE user = ? AND created_at >= ? ORDER BY created_at DESC`, [user, sinceIso]);

export const findAllByUser = async (user) =>
  all(`SELECT * FROM expenses WHERE user = ? ORDER BY created_at DESC`, [user]);

export const deleteAll = async () => run(`DELETE FROM expenses`);
