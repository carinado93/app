import { exercisesFor, type Weather } from './exercises';

export const WEATHER: Record<
  Weather,
  { label: string; emoji: string; description: string; message: string }
> = {
  calm: {
    label: 'Calm',
    emoji: '☀️',
    description: 'Present, open, I can handle what comes.',
    message: "Beautiful. Today is about protecting this state, not pushing it.",
  },
  wired: {
    label: 'Wired',
    emoji: '⛈️',
    description: 'Anxious, tense, racing thoughts, on edge.',
    message: 'Your body is in alarm mode. First we bring it down, gently.',
  },
  shutdown: {
    label: 'Shut down',
    emoji: '🌫️',
    description: 'Numb, tired, foggy, disconnected.',
    message: "Your system is protecting you by switching off. We'll wake it up slowly.",
  },
};

/** "Not All At Once": one tiny step per day, matched to the weather. */
const TINY_STEPS: Record<Weather, string[]> = {
  calm: [
    'Write down one thing you want to protect in your week.',
    'Say no to one small thing today that you would usually say yes to.',
    'Take a 10-minute walk without your phone.',
    'Drink one glass of water slowly, really tasting it.',
    'Put one 15-minute break into your calendar for tomorrow.',
    'Send one message to someone who makes you feel good.',
    'Go to bed 15 minutes earlier tonight.',
  ],
  wired: [
    'Put your phone in another room for 20 minutes.',
    'Write down the one thing that worries you most. Only that one.',
    'Make your next exhale twice as long as your inhale.',
    'Lower your shoulders. Unclench your jaw. Right now.',
    'Cancel or postpone one thing that is not urgent.',
    'Step outside and look at the sky for one minute.',
    'Eat your next meal sitting down, without a screen.',
  ],
  shutdown: [
    'Stand up and stretch your arms towards the ceiling.',
    'Open a window and take three breaths of fresh air.',
    'Splash cool water on your wrists.',
    'Put on one song you love and move a little.',
    'Have something warm to drink.',
    'Step into daylight for 5 minutes.',
    'Text one person: "Thinking of you."',
  ],
};

export function dayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function dailyPlan(weather: Weather, date = new Date()) {
  const steps = TINY_STEPS[weather];
  const exercises = exercisesFor(weather);
  const i = dayIndex(date);
  // Free exercises first so everyone gets a working daily step.
  const ordered = [...exercises.filter((e) => e.free), ...exercises.filter((e) => !e.free)];
  return {
    step: steps[i % steps.length],
    exercise: ordered[i % ordered.length],
    alternatives: ordered.filter((_, j) => j !== i % ordered.length).slice(0, 3),
  };
}

export const QUOTES = [
  'Every path back to yourself begins with one small step.',
  'Not all at once. Just the next breath.',
  'Rest is not a reward. It is a requirement.',
  'You do not have to earn the right to slow down.',
  'Small steps, done kindly, change everything.',
];
