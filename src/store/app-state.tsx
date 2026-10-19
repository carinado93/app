import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Weather } from '@/data/exercises';
import type { ProgramProgress } from '@/data/programs';
import type { TriggerEntry } from '@/data/triggers';
import type { Lang } from '@/i18n';
import { initPurchases, onPremiumChange } from '@/lib/purchases';
import { TEST_MODE } from '@/lib/test-mode';

const STORAGE_KEY = 'naao-state-v1';

export type CheckIn = { date: string; weather: Weather; at: number };

type PersistedState = {
  checkIns: CheckIn[];
  /** Dates (YYYY-MM-DD) on which the daily step was done. */
  stepsDone: string[];
  gymDone: string[];
  triggers: TriggerEntry[];
  onboarded: boolean;
  /** Hour of the daily reminder, or null when off. */
  reminderHour: number | null;
  programs: Record<string, ProgramProgress>;
  /** The program shown on the Today screen. */
  activeProgram: string | null;
  /** Chosen on the very first screen; null until then. */
  language: Lang | null;
  /** Test builds only: Premium switched on without a purchase. */
  testPremium: boolean;
};

const EMPTY: PersistedState = {
  checkIns: [],
  stepsDone: [],
  gymDone: [],
  triggers: [],
  onboarded: false,
  reminderHour: null,
  programs: {},
  activeProgram: null,
  language: null,
  testPremium: false,
};

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Forgiving streak: counts days with a completed step in the last weeks,
 * allowing one missed day without breaking the streak ("Not All At Once").
 */
export function gentleStreak(done: string[], today = new Date()) {
  const set = new Set(done);
  let streak = 0;
  let misses = 0;
  const d = new Date(today);
  // Today not done yet does not count as a miss.
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    if (set.has(todayKey(d))) {
      streak++;
      misses = 0;
    } else if (++misses > 1) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

type AppState = PersistedState & {
  loaded: boolean;
  isPremium: boolean;
  todayWeather?: Weather;
  checkIn: (weather: Weather) => void;
  markStepDone: () => void;
  markGymDone: (sessionId: string) => void;
  addTrigger: (entry: Omit<TriggerEntry, 'id' | 'at'>) => void;
  removeTrigger: (id: string) => void;
  finishOnboarding: () => void;
  setReminderHour: (hour: number | null) => void;
  setLanguage: (lang: Lang) => void;
  startProgram: (id: string) => void;
  completeProgramDay: (id: string, day: number, note: string) => void;
  /** Deletes all check-ins, steps and triggers on this phone. */
  resetData: () => void;
  setPremium: (value: boolean) => void;
  /** Test builds only: switch Premium on or off without buying. */
  setTestPremium: (value: boolean) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [purchased, setPremium] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = { ...EMPTY, ...JSON.parse(raw) };
        // Only English and German are offered; anything else asks again.
        if (saved.language !== 'en' && saved.language !== 'de') saved.language = null;
        setState(saved);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    initPurchases().then(setPremium);
    return onPremiumChange(setPremium);
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const update = useCallback((fn: (s: PersistedState) => PersistedState) => setState(fn), []);

  const value = useMemo<AppState>(() => {
    const today = todayKey();
    return {
      ...state,
      loaded,
      isPremium: purchased || (TEST_MODE && state.testPremium),
      todayWeather: state.checkIns.find((c) => c.date === today)?.weather,
      checkIn: (weather) =>
        update((s) => ({
          ...s,
          checkIns: [...s.checkIns.filter((c) => c.date !== today), { date: today, weather, at: Date.now() }],
        })),
      markStepDone: () =>
        update((s) => (s.stepsDone.includes(today) ? s : { ...s, stepsDone: [...s.stepsDone, today] })),
      markGymDone: (id) =>
        update((s) => (s.gymDone.includes(id) ? s : { ...s, gymDone: [...s.gymDone, id] })),
      addTrigger: (entry) =>
        update((s) => ({
          ...s,
          triggers: [{ ...entry, id: String(Date.now()), at: Date.now() }, ...s.triggers],
        })),
      removeTrigger: (id) => update((s) => ({ ...s, triggers: s.triggers.filter((t) => t.id !== id) })),
      finishOnboarding: () => update((s) => ({ ...s, onboarded: true })),
      setReminderHour: (hour) => update((s) => ({ ...s, reminderHour: hour })),
      setLanguage: (lang) => update((s) => ({ ...s, language: lang })),
      startProgram: (id) =>
        update((s) => ({
          ...s,
          activeProgram: id,
          programs: s.programs[id] ? s.programs : { ...s.programs, [id]: { startedAt: Date.now(), days: {} } },
        })),
      completeProgramDay: (id, day, note) =>
        update((s) => {
          const progress = s.programs[id] ?? { startedAt: Date.now(), days: {} };
          return {
            ...s,
            programs: {
              ...s.programs,
              [id]: { ...progress, days: { ...progress.days, [day]: { doneOn: today, note: note.trim() || undefined } } },
            },
            // Doing the program day also counts as today's small step.
            stepsDone: s.stepsDone.includes(today) ? s.stepsDone : [...s.stepsDone, today],
          };
        }),
      resetData: () => update((s) => ({ ...EMPTY, onboarded: s.onboarded, language: s.language })),
      setPremium,
      setTestPremium: (value) => update((s) => ({ ...s, testPremium: value })),
    };
  }, [state, loaded, purchased, update]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
