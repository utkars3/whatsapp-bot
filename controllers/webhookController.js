import twilio from 'twilio';
const MessagingResponse = twilio.twiml.MessagingResponse;

import { parseExpense, parseCommand } from '../parser.js';
import * as expenseService from '../services/expenseService.js';

export const webhookHandler = async (req, res) => {
  console.log('WEBHOOK HIT', req.body.From, req.body.Body);
  const from = req.body.From || 'unknown';
  const body = (req.body.Body || '').trim();
  const twiml = new MessagingResponse();

  try {
    const expense = parseExpense(body);
    if (expense) {
      try {
        const saved = await expenseService.addExpense({ user: from, amount: expense.amount, item: expense.item });
        twiml.message(`Saved: ₹${saved.amount} — ${saved.item}`);
      } catch (e) {
        console.error('DB insert failed', e);
        twiml.message('Error saving expense.');
      }
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    const cmd = parseCommand(body);
    if (cmd.cmd === 'help') {
      twiml.message('Commands:\n1) "100 coffee" to save\n2) "report today|week|month"\n3) "reset all" delete all (dev only)\n4) "help"');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    if (cmd.cmd === 'report') {
      const report = await expenseService.getReport(from, cmd.period || 'today');
      if (!report.rows.length) {
        twiml.message(`No expenses for ${cmd.period}.`);
      } else {
        let msg = `Expenses (${cmd.period}):\n`;
        for (const r of report.rows) msg += `₹${r.amount} - ${r.item}\n`;
        msg += `Total: ₹${report.total.toFixed(2)}`;
        twiml.message(msg);
      }
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    if (cmd.cmd === 'reset') {
      await expenseService.wipeAll();
      twiml.message('All expenses deleted.');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    twiml.message('Sorry, did not understand. Send "help" for usage.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(twiml.toString());
  } catch (err) {
    console.error('webhook error', err);
    const errResp = new MessagingResponse();
    errResp.message('Server error');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    return res.end(errResp.toString());
  }
};
