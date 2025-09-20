import dayjs from 'dayjs';

export function parseExpense(text) {
  if (!text) return null;
  text = text.trim();
  const m = text.match(/^([\d,]+(?:\.\d{1,2})?)[\s\-–:]*([\s\S]+)$/);
  if (!m) return null;
  const amount = parseFloat(m[1].replace(/,/g, ''));
  const item = (m[2] || '').trim();
  if (isNaN(amount) || !item) return null;
  return { amount, item, date: dayjs().toISOString() };
}

export function parseCommand(text) {
  if (!text) return { cmd: 'unknown' };
  const t = text.trim().toLowerCase();
  if (t === 'help') return { cmd: 'help' };
  if (t.startsWith('report')) {
    const parts = t.split(/\s+/);
    const period = parts[1] || 'today';
    return { cmd: 'report', period };
  }
  if (t === 'reset all') return { cmd: 'reset' };
  return { cmd: 'unknown' };
}
