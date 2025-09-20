import dayjs from 'dayjs';
import * as Expense from '../models/ExpenseModel.js';

export const addExpense = async ({ user, amount, item }) => {
  const created_at = dayjs().toISOString();
  const id = await Expense.create({ user, amount, item, created_at });
  return { id, user, amount, item, created_at };
};

export const getReport = async (user, period = 'today') => {
  const now = dayjs();
  let start;
  if (period === 'today') start = now.startOf('day').toISOString();
  else if (period === 'week') start = now.startOf('week').toISOString();
  else if (period === 'month') start = now.startOf('month').toISOString();
  else start = now.startOf('day').toISOString();

  const rows = await Expense.findByUserAndSince(user, start);
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
  return { rows, total, period };
};

export const listAll = (user) => Expense.findAllByUser(user);

export const wipeAll = () => Expense.deleteAll();
