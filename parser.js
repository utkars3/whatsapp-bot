
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractExpenseWithGemini(inputText) {
  if (!inputText) {
    console.log('No input text provided');
    return null;
  }
  if (!process.env.GEMINI_API_KEY) {
    console.log('No Gemini API key found in environment variables');
    return null;
  }

  console.log('Attempting to parse with Gemini:', inputText);
  console.log('Using API key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

  const prompt = `
You are an expense parser. Given a text describing an expense in any format or language, extract the following information:
1. Amount (as a number)
2. Item (what was purchased)
3. Category (must be one of: food, travel, shopping, utilities, entertainment, other)

Return ONLY a JSON object in this format:
{"amount": <number>, "item": "<item>", "category": "<category>"}

Rules:
- amount: Remove currency symbols and convert to number (e.g., "₹100", "100rs" → 100)
- item: Keep it short and simple (1-3 words)
- category: Must be one of [food, travel, shopping, utilities, entertainment, other]
- If you can't determine both amount and item, return null

Examples:
"chai 100" → {"amount":100,"item":"chai","category":"food"}
"uber ride 250" → {"amount":250,"item":"uber ride","category":"travel"}
"electricity bill 1200" → {"amount":1200,"item":"electricity bill","category":"utilities"}
"100 rupai ki chai" → {"amount":100,"item":"chai","category":"food"}

Parse this text: "${inputText}"`;

  try {
    console.log('Sending request to Gemini...');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log('Got response from Gemini');
    let text = response.text;
    if (typeof text === 'function') {
      text = response.text();
    }
    console.log('Raw Gemini response:', text);

    try {
      // Find the first valid JSON object in the response
      const match = text.match(/\{[^{}]*\}/);
      if (!match) {
        console.log('No valid JSON found in response:', text);
        return null;
      }

      const parsed = JSON.parse(match[0]);

      // Validate the parsed data
      if (
        typeof parsed.amount === 'number' &&
        parsed.amount > 0 &&
        typeof parsed.item === 'string' &&
        parsed.item.trim() &&
        ['food', 'travel', 'shopping', 'utilities', 'entertainment', 'other'].includes(parsed.category?.toLowerCase())
      ) {
        return parsed;
      }

      console.log('Invalid parsed data:', parsed);
      return null;
    } catch (e) {
      console.error('JSON parse error:', e);
      return null;
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

export async function parseExpense(text) {
  if (!text) return null;

  const result = await extractExpenseWithGemini(text);
  console.log('Gemini parse result:', result);

  if (!result) return null;

  return {
    ...result,
    date: new Date().toISOString()
  };
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