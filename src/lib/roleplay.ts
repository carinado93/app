/** Client for the role-play server in /server (keeps the AI key off the phone). */
import { translate, type Lang } from '@/i18n';

const URL = process.env.EXPO_PUBLIC_ROLEPLAY_URL;
const TOKEN = process.env.EXPO_PUBLIC_ROLEPLAY_TOKEN;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const roleplayConfigured = Boolean(URL);

export async function askRoleplay({
  scenarioId,
  messages,
  mode = 'chat',
  language,
  opening,
}: {
  scenarioId: string;
  messages: ChatMessage[];
  mode?: 'chat' | 'feedback';
  language: Lang;
  /** The first line as shown to the user, in their language. */
  opening: string;
}): Promise<string> {
  if (!URL) {
    // Offline demo so the screen can be tried before the server is deployed.
    return mode === 'feedback'
      ? translate(
          language,
          'You stayed kind and clear, that is the heart of a good boundary. Next time, try saying no without a long explanation: "I can’t take this on right now." Every time you practise, it gets easier.',
        )
      : translate(
          language,
          'Hmm, are you sure? It would really help me out… (Demo mode: connect the AI server to get real answers.)',
        );
  }
  const res = await fetch(`${URL.replace(/\/$/, '')}/roleplay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ scenarioId, messages, mode, language, opening }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? translate(language, 'Something went wrong'));
  return data.reply as string;
}
