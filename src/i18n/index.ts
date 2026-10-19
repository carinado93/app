/**
 * Languages. English text is the key; each language maps it to a translation.
 * Missing translations fall back to English, so nothing ever shows a raw key.
 */
import { getLocales } from 'expo-localization';

import { useApp } from '@/store/app-state';

import { UI } from './ui';

export type Lang = 'en' | 'de' | 'ro' | 'es';

export const LANGUAGES: { id: Lang; label: string; hello: string }[] = [
  { id: 'en', label: 'English', hello: 'Welcome' },
  { id: 'de', label: 'Deutsch', hello: 'Willkommen' },
  { id: 'ro', label: 'Română', hello: 'Bun venit' },
  { id: 'es', label: 'Español', hello: 'Te damos la bienvenida' },
];

/** The phone's language if we support it, otherwise English. */
export function deviceLanguage(): Lang {
  const code = getLocales()[0]?.languageCode;
  return LANGUAGES.some((l) => l.id === code) ? (code as Lang) : 'en';
}

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, text: string, vars?: Vars) {
  const out = (lang === 'en' ? undefined : UI[lang][text]) ?? text;
  return vars ? out.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : out;
}

export function useLang(): Lang {
  return useApp().language ?? 'en';
}

/** `t('Check in')` or `t('Day {n}', { n: 3 })` in the current language. */
export function useT() {
  const lang = useLang();
  return (text: string, vars?: Vars) => translate(lang, text, vars);
}

/** Locale for dates, e.g. "Mon, 3 Mar". */
export const LOCALES: Record<Lang, string> = { en: 'en-GB', de: 'de-DE', ro: 'ro-RO', es: 'es-ES' };
