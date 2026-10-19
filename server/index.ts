/**
 * Small backend for the Boundary Practice role-play.
 * Keeps the Anthropic API key off the phone.
 *
 *   ANTHROPIC_API_KEY=... APP_TOKEN=some-long-random-string npm start
 *
 * POST /roleplay  { scenarioId, mode: "chat" | "feedback", messages: [{ role, content }] }
 *   -> { reply: string }
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { getScenario, type Scenario } from '../src/data/boundaries.ts';

const PORT = Number(process.env.PORT ?? 8787);
const APP_TOKEN = process.env.APP_TOKEN;
const MODEL = 'claude-opus-5-5';
const MAX_TURNS = 30;
const MAX_CHARS = 1500;

const client = new Anthropic();

const rolePrompt = (s: Scenario) => `You are helping someone practise setting a boundary, inside a stress and burnout coaching app.

You play ${s.role}. Situation: ${s.situation}
You already opened the conversation with: "${s.opening}"

Stay in character and keep every reply short (1-3 sentences), natural and spoken, like a real chat message.
Push back realistically at first (gentle pressure, guilt or "just this once"), so the user gets to practise holding their boundary.
If the user stays clear, kind and firm two or three times, start to accept it. Never become abusive, insulting or threatening.
Do not coach, explain or break character. Never mention that you are an AI.
If the user writes something that suggests they are in crisis or in danger, step out of the role and gently encourage them to contact local emergency services or a crisis line.`;

const feedbackPrompt = (s: Scenario) => `You are a warm, practical stress and burnout coach. Your style: kind, direct, encouraging, "not all at once" (one small improvement at a time).

The user just practised this situation: ${s.situation} The other person was ${s.role}.

Give feedback on how the user set their boundary, addressed directly to them ("you"). Plain text, no markdown headings, under 150 words:
1. One thing they did well (quote their words if useful).
2. One thing to try next time, with an example sentence they could say.
3. One short encouraging line.`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function cleanMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '',
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

async function roleplay(body: any): Promise<string> {
  const scenario = getScenario(String(body?.scenarioId));
  if (!scenario) throw new HttpError(400, 'Unknown scenario');
  const history = cleanMessages(body?.messages);
  const feedback = body?.mode === 'feedback';

  // The scenario opening is the assistant's first line; the API needs a user turn first.
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: 'user', content: '(The conversation starts.)' },
    { role: 'assistant', content: scenario.opening },
    ...history,
  ];
  if (feedback) {
    const transcript = [`Other person: ${scenario.opening}`]
      .concat(history.map((m) => `${m.role === 'user' ? 'User' : 'Other person'}: ${m.content}`))
      .join('\n');
    messages.splice(0, messages.length, { role: 'user', content: `Here is the practice conversation:\n\n${transcript}` });
  } else if (messages[messages.length - 1].role !== 'user') {
    throw new HttpError(400, 'Last message must be from the user');
  }

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: feedback ? feedbackPrompt(scenario) : rolePrompt(scenario),
    output_config: { effort: feedback ? 'medium' : 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages,
  });

  if (response.stop_reason === 'refusal') {
    return "Let's pause this practice here. If things feel heavy right now, please reach out to someone you trust or a local crisis line.";
  }
  return response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

async function readJson(req: IncomingMessage) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100_000) throw new HttpError(413, 'Too large');
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, null);
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/roleplay') return send(res, 404, { error: 'Not found' });
  if (APP_TOKEN && req.headers.authorization !== `Bearer ${APP_TOKEN}`) {
    return send(res, 401, { error: 'Unauthorized' });
  }
  try {
    send(res, 200, { reply: await roleplay(await readJson(req)) });
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message });
    if (e instanceof Anthropic.RateLimitError) return send(res, 429, { error: 'Busy, try again in a moment' });
    if (e instanceof Anthropic.APIError) {
      console.error('Anthropic API error', e.status, e.message);
      return send(res, 502, { error: 'AI unavailable' });
    }
    console.error(e);
    send(res, 500, { error: 'Server error' });
  }
}).listen(PORT, () => console.log(`Role-play server on :${PORT}`));
