import * as expenseService from '../services/expenseService.js';

export const listByUser = async (req, res) => {
  const user = req.query.user;
  if (!user) return res.status(400).json({ error: 'user query param required' });
  const rows = await expenseService.listAll(user);
  res.json({ rows });
};

export const wipe = async (req, res) => {
  await expenseService.wipeAll();
  res.json({ ok: true });
};
