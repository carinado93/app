export const TRIGGER_CATEGORIES = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'family', label: 'Family', emoji: '🏡' },
  { id: 'relationship', label: 'Relationship', emoji: '💬' },
  { id: 'money', label: 'Money', emoji: '💶' },
  { id: 'health', label: 'Health / body', emoji: '🩺' },
  { id: 'phone', label: 'Phone / news', emoji: '📱' },
  { id: 'sleep', label: 'Sleep', emoji: '🌙' },
  { id: 'other', label: 'Other', emoji: '✨' },
] as const;

export type TriggerCategory = (typeof TRIGGER_CATEGORIES)[number]['id'];

export type TriggerEntry = {
  id: string;
  at: number;
  category: TriggerCategory;
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;
};

const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

function timeOfDay(hour: number) {
  if (hour < 12) return 'mornings';
  if (hour < 17) return 'afternoons';
  if (hour < 21) return 'evenings';
  return 'nights';
}

function top<T extends string>(items: T[]) {
  const counts = new Map<T, number>();
  items.forEach((i) => counts.set(i, (counts.get(i) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] as [T, number] | undefined;
}

/** Plain-language patterns found in the trigger log. Needs at least 5 entries. */
export function findPatterns(entries: TriggerEntry[]): string[] {
  if (entries.length < 5) return [];
  const insights: string[] = [];

  const cat = top(entries.map((e) => e.category));
  if (cat) {
    const label = TRIGGER_CATEGORIES.find((c) => c.id === cat[0])!.label.toLowerCase();
    const pct = Math.round((cat[1] / entries.length) * 100);
    insights.push(`${pct}% of your stress moments are about ${label}.`);
  }

  const when = top(
    entries.map((e) => {
      const d = new Date(e.at);
      return `${DAYS[d.getDay()]} ${timeOfDay(d.getHours())}` as string;
    }),
  );
  if (when && when[1] >= 2) insights.push(`Your stress tends to rise on ${when[0]}.`);

  const strongest = [...entries].sort((a, b) => b.intensity - a.intensity)[0];
  const strongLabel = TRIGGER_CATEGORIES.find((c) => c.id === strongest.category)!.label.toLowerCase();
  insights.push(`Your strongest reactions come from ${strongLabel}.`);

  const week = 7 * 86_400_000;
  const now = Date.now();
  const thisWeek = entries.filter((e) => now - e.at < week);
  const lastWeek = entries.filter((e) => now - e.at >= week && now - e.at < 2 * week);
  if (lastWeek.length > 0) {
    const avg = (xs: TriggerEntry[]) => xs.reduce((s, e) => s + e.intensity, 0) / (xs.length || 1);
    const diff = avg(thisWeek) - avg(lastWeek);
    if (thisWeek.length && diff <= -0.5) insights.push('Your stress was less intense this week than last week. 🌱');
    if (thisWeek.length && diff >= 0.5)
      insights.push('This week felt heavier than last week. Be extra gentle with yourself.');
  }

  return insights;
}
