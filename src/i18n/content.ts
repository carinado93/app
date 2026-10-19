/**
 * Translated app content (exercises, programs, articles, scenarios…).
 * English lives in src/data; each language only lists what it translates,
 * keyed by id. Anything missing falls back to English.
 */
import type { Scenario } from '@/data/boundaries';
import { SCENARIOS } from '@/data/boundaries';
import { QUOTES, TINY_STEPS } from '@/data/daily';
import { EXERCISES, type Exercise, type Weather } from '@/data/exercises';
import { GYM, type GymLevel } from '@/data/gym';
import { ARTICLES, type Article } from '@/data/learn';
import { PROGRAMS, type Program, type ProgramDay } from '@/data/programs';

import { useLang, type Lang } from './index';

export type ContentTranslation = {
  exercises?: Record<string, Partial<Pick<Exercise, 'title' | 'summary' | 'why' | 'steps'>>>;
  programs?: Record<
    string,
    Partial<Pick<Program, 'title' | 'accent' | 'summary'>> & { weeks?: string[]; days?: Partial<ProgramDay>[] }
  >;
  articles?: Record<string, Partial<Pick<Article, 'title' | 'intro' | 'sections' | 'takeaway'>>>;
  scenarios?: Record<string, Partial<Pick<Scenario, 'title' | 'opening' | 'phrases'>>>;
  gym?: Record<string, { title?: string; focus?: string; sessions?: Record<string, { title?: string; challenge?: string }> }>;
  tinySteps?: Partial<Record<Weather, string[]>>;
  quotes?: string[];
};

/** Filled in per language once the English texts are final. */
const CONTENT: Record<Exclude<Lang, 'en'>, ContentTranslation> = { de: {}, ro: {}, es: {} };

function forLang(lang: Lang): ContentTranslation {
  return lang === 'en' ? {} : CONTENT[lang];
}

export function localize(lang: Lang) {
  const c = forLang(lang);
  const exercises = EXERCISES.map((e) => ({ ...e, ...c.exercises?.[e.id] }));
  const programs = PROGRAMS.map((p) => {
    const o = c.programs?.[p.id];
    return {
      ...p,
      ...o,
      weeks: p.weeks?.map((w, i) => ({ ...w, title: o?.weeks?.[i] ?? w.title })),
      days: p.days.map((d, i) => ({ ...d, ...o?.days?.[i] })),
    };
  });
  const articles = ARTICLES.map((a) => ({ ...a, ...c.articles?.[a.id] }));
  const scenarios = SCENARIOS.map((s) => ({ ...s, ...c.scenarios?.[s.id] }));
  const gym: GymLevel[] = GYM.map((l) => {
    const o = c.gym?.[l.id];
    return {
      ...l,
      title: o?.title ?? l.title,
      focus: o?.focus ?? l.focus,
      sessions: l.sessions.map((s) => ({ ...s, ...o?.sessions?.[s.id] })),
    };
  });
  return {
    exercises,
    exercise: (id: string) => exercises.find((e) => e.id === id),
    programs,
    program: (id: string) => programs.find((p) => p.id === id),
    articles,
    article: (id: string) => articles.find((a) => a.id === id),
    scenarios,
    scenario: (id: string) => scenarios.find((s) => s.id === id),
    gym,
    tinySteps: { ...TINY_STEPS, ...c.tinySteps } as Record<Weather, string[]>,
    quotes: c.quotes ?? QUOTES,
  };
}

/** All content in the user's language. */
export function useContent() {
  return localize(useLang());
}
