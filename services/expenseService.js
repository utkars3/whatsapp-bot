// services/expenseService.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import * as Expense from '../models/ExpenseModel.js';

dayjs.extend(utc);
dayjs.extend(isoWeek);

/**
 * Add an expense for a user.
 * created_at stored in UTC ISO string.
 */
export const addExpense = async ({ user, amount, item, category }) => {
  const created_at = dayjs().utc().toISOString();
  try {
    const id = await Expense.create({ user, amount, item, category, created_at });
    console.log('addExpense saved:', { id, user, amount, item, category, created_at });
    return { id, user, amount, item, category, created_at };
  } catch (err) {
    console.error('addExpense error:', err);
    throw err;
  }
};

/**
 * Get report rows and total for a user from start of the requested period.
 * period: 'today' | 'week' | 'month' (default: 'today')
 */
export const getReport = async (user, period = 'today') => {
  const now = dayjs().utc();
  let start;

  if (period === 'today') start = now.startOf('day');
  else if (period === 'week') start = now.startOf('isoWeek'); // Monday start
  else if (period === 'month') start = now.startOf('month');
  else start = now.startOf('day');

  const startIso = start.toISOString();
  console.log('getReport -- user:', user, 'period:', period, 'startIso:', startIso, 'now:', now.toISOString());

  try {
    const rows = await Expense.findByUserAndSince(user, startIso);
    console.log('getReport rows count:', rows?.length ?? 0);
    const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { rows, total, period };
  } catch (err) {
    console.error('getReport error:', err);
    throw err;
  }
};

/** List all expenses for a user (no time filter) */
export const listAll = async (user) => {
  try {
    return await Expense.findAllByUser(user);
  } catch (err) {
    console.error('listAll error:', err);
    throw err;
  }
};

/** Wipe all expenses (dev only) */
export const wipeAll = async () => {
  try {
    const res = await Expense.deleteAll();
    console.log('wipeAll executed');
    return res;
  } catch (err) {
    console.error('wipeAll error:', err);
    throw err;
  }
};
