import twilio from 'twilio';
const MessagingResponse = twilio.twiml.MessagingResponse;
import fetch from 'node-fetch';
import speech from '@google-cloud/speech';
const speechClient = new speech.SpeechClient();

import { parseExpense, parseCommand } from '../parser.js';
import * as expenseService from '../services/expenseService.js';

export const webhookHandler = async (req, res) => {
  console.log('WEBHOOK HIT', req.body.From, req.body.Body);
  const from = req.body.From || 'unknown';
  let body = (req.body.Body || '').trim();
  const twiml = new MessagingResponse();

//   if (req.body.NumMedia > 0 && req.body.MediaContentType0 && req.body.MediaContentType0.startsWith('audio')) {
//   const audioUrl = req.body.MediaUrl0;
//   const twilioAuth = `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`;
//   const audioBuffer = await downloadAudio(audioUrl, twilioAuth);
//   const transcribedText = await transcribeAudio(audioBuffer);
//   console.log('Transcribed voice note:', transcribedText);

//   // Now use the transcribed text as the message body
//   body = transcribedText;
// }

  try {
    const expense = await parseExpense(body);
    if (expense) {
      try {
        const saved = await expenseService.addExpense({
          user: from,
          amount: expense.amount,
          item: expense.item,
          category: expense.category
        });
        twiml.message(`Saved: ₹${saved.amount} — ${saved.item} (${saved.category})`);
      } catch (e) {
        console.error('DB insert failed', e);
        twiml.message('Error saving expense.');
      }
      return res.status(200).set('Content-Type', 'text/xml').send(twiml.toString());
    }

    const cmd = parseCommand(body);
    if (cmd.cmd === 'help') {
      twiml.message('Commands:\n1) "100 coffee" to save\n2) "report today|week|month"\n3) "reset all" delete all (dev only)\n4) "help"');
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      return res.end(twiml.toString());
    }

    if (cmd.cmd === 'report') {
      const report = await expenseService.getReport(from, cmd.period || 'today');
      console.log(report);
      if (!report.rows.length) {
        twiml.message(`No expenses for ${cmd.period}.`);
      } else {
        let msg = `Expenses (${cmd.period}):\n`;
        for (const r of report.rows) msg += `₹${r.amount} - ${r.item} (${r.category}) - ${new Date(r.created_at).toLocaleDateString('en-IN')}\n`;
        msg += `Total: ₹${report.total.toFixed(2)}`;

        // Aggregate category totals
        const categoryTotals = {};
        for (const r of report.rows) {
          const cat = (r.category || 'other').toLowerCase();
          categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(r.amount) || 0);
        }

        // Generate pie chart URL
        // const { getCategoryPieChartUrl } = await import('../utils/chart.js');
        // const chartUrl = getCategoryPieChartUrl(categoryTotals);

        // Send text and pie chart image
        twiml.message(msg);
        // twiml.message().media(chartUrl);
      }
      return res.status(200).set('Content-Type', 'text/xml').send(twiml.toString());
    }

    if (cmd.cmd === 'reset') {
  await expenseService.wipeAll();
  twiml.message('All expenses deleted.');
  return res.status(200).set('Content-Type', 'text/xml').send(twiml.toString());
    }

  twiml.message('Sorry, did not understand. Send "help" for usage.');
  return res.status(200).set('Content-Type', 'text/xml').send(twiml.toString());
  } catch (err) {
    console.error('webhook error', err);
  const errResp = new MessagingResponse();
  errResp.message('Server error');
  return res.status(200).set('Content-Type', 'text/xml').send(errResp.toString());
  }
};


async function downloadAudio(url, twilioAuth) {
  const res = await fetch(url, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(twilioAuth).toString('base64')
    }
  });
  return await res.buffer();
}

async function transcribeAudio(audioBuffer) {
  const audioBytes = audioBuffer.toString('base64');
  const [response] = await speechClient.recognize({
    audio: { content: audioBytes },
    config: {
      encoding: 'OGG_OPUS', // WhatsApp usually sends .ogg
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
  });
  return response.results.map(r => r.alternatives[0].transcript).join(' ');
}