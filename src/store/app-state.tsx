import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Weather } from '@/data/exercises';
import type { TriggerEntry } from '@/data/triggers';
import { initPurchases, onPremiumChange } from '@/lib/purchases';

const STORAGE_KEY = 'naao-state-v1';

export type CheckIn = { date: string; weather: Weather; at: number };

type PersistedState = {
  checkIns: CheckIn[];
  /** Dates (YYYY-MM-DD) on which the daily step was done. */
  stepsDone: string[];
  gymDone: string[];
  triggers: TriggerEntry[];
  onboarded: boolean;
};

const EMPTY: PersistedState = {
  checkIns: [],
  stepsDone: [],
  gymDone: [],
  triggers: [],
  onboarded: false,
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
  setPremium: (value: boolean) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [isPremium, setPremium] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setState({ ...EMPTY, ...JSON.parse(raw) }))
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
      isPremium,
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
      setPremium,
    };
  }, [state, loaded, isPremium, update]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
