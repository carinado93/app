/**
 * Nervous System Gym: build stress capacity step by step, like training a muscle.
 * Each session = one or more exercises + one small "challenge rep".
 */

export type GymSession = {
  id: string;
  title: string;
  exerciseIds: string[];
  challenge: string;
};

export type GymLevel = {
  id: string;
  level: number;
  title: string;
  focus: string;
  sessions: GymSession[];
};

export const GYM: GymLevel[] = [
  {
    id: 'foundations',
    level: 1,
    title: 'Foundations',
    focus: 'Learn to notice your state and come back to calm.',
    sessions: [
      {
        id: 'f1',
        title: 'Meet your nervous system',
        exerciseIds: ['orienting'],
        challenge: 'Three times today, ask yourself: am I calm, wired or shut down?',
      },
      {
        id: 'f2',
        title: 'The fastest reset',
        exerciseIds: ['sigh'],
        challenge: 'Use one physiological sigh before you open your email.',
      },
      {
        id: 'f3',
        title: 'Being held',
        exerciseIds: ['butterfly', 'self-hold'],
        challenge: 'Before sleep, put a hand on your heart for 10 breaths.',
      },
    ],
  },
  {
    id: 'regulation',
    level: 2,
    title: 'Regulation',
    focus: 'Shift your state on purpose: down when wired, up when numb.',
    sessions: [
      {
        id: 'r1',
        title: 'Steady under pressure',
        exerciseIds: ['box'],
        challenge: 'Do 3 rounds of box breathing in your next stressful situation.',
      },
      {
        id: 'r2',
        title: 'Release the energy',
        exerciseIds: ['shake', 'orienting'],
        challenge: 'After your next difficult conversation, shake for 30 seconds.',
      },
      {
        id: 'r3',
        title: 'Waking up gently',
        exerciseIds: ['energize', 'hum'],
        challenge: 'In your next foggy moment, hum for one minute instead of scrolling.',
      },
    ],
  },
  {
    id: 'capacity',
    level: 3,
    title: 'Capacity',
    focus: 'Train your body to stay calm when things get a little uncomfortable.',
    sessions: [
      {
        id: 'c1',
        title: 'A kind inner voice',
        exerciseIds: ['affirmations'],
        challenge: 'When something feels hard today, say one affirmation slowly on your out-breath.',
      },
      {
        id: 'c2',
        title: 'Discomfort reps',
        exerciseIds: ['box', 'feet'],
        challenge: 'Wait 2 minutes before reacting to the next thing that annoys you.',
      },
      {
        id: 'c3',
        title: 'Longer exhale, longer calm',
        exerciseIds: ['long-exhale'],
        challenge: 'Do 4 rounds of 4-7-8 breathing before bed for 3 nights in a row.',
      },
    ],
  },
  {
    id: 'resilience',
    level: 4,
    title: 'Resilience',
    focus: 'Stay connected to yourself in real life, not just on the mat.',
    sessions: [
      {
        id: 'x1',
        title: 'Calm in the room',
        exerciseIds: ['feet', 'grounding'],
        challenge: 'Use the invisible feet push in your next meeting.',
      },
      {
        id: 'x2',
        title: 'Calm in conflict',
        exerciseIds: ['name-it', 'affirmations'],
        challenge: 'In your next tense conversation, take one slow breath out before you answer.',
      },
      {
        id: 'x3',
        title: 'Your personal toolkit',
        exerciseIds: ['sigh', 'hum', 'orienting'],
        challenge: 'Write down your top 3 exercises and where you will use each one.',
      },
    ],
  },
];

export const ALL_SESSIONS = GYM.flatMap((l) => l.sessions);
