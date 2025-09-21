import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';

import * as Expense from '../models/ExpenseModel.js';

dayjs.extend(utc);
dayjs.extend(isoWeek);

export const addExpense = async ({ user, amount, item }) => {
  const created_at = dayjs().toISOString();
  const id = await Expense.create({ user, amount, item, created_at });
  return { id, user, amount, item, created_at };
};


export const getReport = async (user, period = 'today') => {
  // compute in UTC so created_at (stored with Z) compares correctly
  const now = dayjs().utc();
  let start;
  if (period === 'today') start = now.startOf('day');
  else if (period === 'week') start = now.startOf('isoWeek');   // Monday start
  else if (period === 'month') start = now.startOf('month');
  else start = now.startOf('day');

  const startIso = start.toISOString();
  console.log('getReport -- period:', period, 'startIso:', startIso, 'now:', now.toISOString());

  const rows = await Expense.findByUserAndSince(user, startIso);
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
  return { rows, total, period };
};

export const listAll = (user) => Expense.findAllByUser(user);

export const wipeAll = () => Expense.deleteAll();
