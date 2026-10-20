/** Guided programs: one day at a time, the next day opens tomorrow. */
import { TEST_MODE } from '@/lib/test-mode';

export type ProgramDay = {
  title: string;
  /** Short coaching text for the day. */
  intro: string;
  exerciseId?: string;
  articleId?: string;
  scenarioId?: string;
  task: string;
  reflection: string;
};

export type Program = {
  id: string;
  title: string;
  accent: string;
  summary: string;
  free: boolean;
  weeks?: { title: string; fromDay: number }[];
  days: ProgramDay[];
};

export const PROGRAMS: Program[] = [
  {
    id: 'stress-reset',
    title: '7-Day',
    accent: 'Stress Reset',
    summary: 'A gentle first week: learn to notice your stress and calm your body with simple tools.',
    free: true,
    days: [
      {
        title: 'Notice',
        intro: 'Change begins with noticing. Today you simply learn to see how your nervous system is doing.',
        exerciseId: 'orienting',
        articleId: 'nervous-system',
        task: 'Three times today, ask yourself: am I calm, wired or shut down?',
        reflection: 'When did you feel most calm today? What was happening?',
      },
      {
        title: 'Your built-in brake',
        intro: 'Your breath is the fastest way to calm your body, and you always have it with you.',
        exerciseId: 'sigh',
        task: 'Do one physiological sigh before you start each new task today.',
        reflection: 'What changed in your body after the sigh?',
      },
      {
        title: 'Name it',
        intro: 'Feelings get smaller when we name them. Today you practise putting one word on what you feel.',
        exerciseId: 'name-it',
        task: 'When you feel stressed today, name the feeling in one word.',
        reflection: 'Which feeling came up most often today?',
      },
      {
        title: 'Being held',
        intro: 'Your body calms down when it feels held. You can give yourself that feeling.',
        exerciseId: 'butterfly',
        task: 'Before you sleep, put one hand on your heart for ten breaths.',
        reflection: 'How does it feel to comfort yourself?',
      },
      {
        title: 'One small no',
        intro: 'Overwhelm often grows from too many yeses. Today you practise one small, safe no.',
        scenarioId: 'boss-project',
        task: 'Say no to one small thing today that you would usually say yes to.',
        reflection: 'How did it feel to say no? What happened afterwards?',
      },
      {
        title: 'Real rest',
        intro: 'Rest is not a reward you earn. It is something your nervous system needs every day.',
        exerciseId: 'body-scan',
        task: 'Take a 10-minute break today with nothing to do: no phone, no tasks.',
        reflection: 'What was hard about doing nothing? What was good?',
      },
      {
        title: 'Your toolkit',
        intro: 'You have tried six tools this week. Today you choose the ones that work best for you.',
        exerciseId: 'three-good',
        task: 'Write down your three favourite tools and when you will use each one.',
        reflection: 'What is the one thing you want to keep from this week?',
      },
    ],
  },
  {
    id: 'overwhelm-prevention',
    title: '21-Day',
    accent: 'Overwhelm Prevention',
    summary:
      'Three weeks to notice the early signs of overload, refill your energy and protect it, so stress doesn’t turn into burnout. One small step a day.',
    free: false,
    weeks: [
      { title: 'Week 1 · Notice', fromDay: 1 },
      { title: 'Week 2 · Refill', fromDay: 8 },
      { title: 'Week 3 · Protect', fromDay: 15 },
    ],
    days: [
      {
        title: 'Where you are',
        intro: 'Prevention starts with noticing. Today you look honestly at how you are doing. No judgement, just noticing.',
        articleId: 'burnout-signs',
        exerciseId: 'body-scan',
        task: 'Write down the three signs of stress you notice most in yourself right now.',
        reflection: 'What has your body been trying to tell you lately?',
      },
      {
        title: 'Energy audit',
        intro: 'Some things drain your energy, others give it back. Today you find out which is which.',
        exerciseId: 'orienting',
        task: 'Make two lists: what drains me, what fills me up. At least five things each.',
        reflection: 'Which drain surprised you?',
      },
      {
        title: 'The first brake',
        intro: 'When the days get too full, your body slips into alarm mode. Your breath is the first brake.',
        exerciseId: 'long-exhale',
        task: 'Do the 4-7-8 breath once in the morning and once before bed.',
        reflection: 'How did your body respond to the long exhale?',
      },
      {
        title: 'Remove one drain',
        intro: 'You don’t need to fix everything. Just one drain, removed or made smaller.',
        exerciseId: 'sigh',
        task: 'Pick one small drain from your list and remove, postpone or shrink it this week.',
        reflection: 'What did you choose, and how does it feel to let it go?',
      },
      {
        title: 'Sleep first',
        intro: 'Your body refills its energy during sleep. Protecting your sleep is one of the strongest ways to prevent overload.',
        articleId: 'sleep',
        exerciseId: 'sleep-wind-down',
        task: 'No screens for the last 30 minutes before bed tonight.',
        reflection: 'How did you sleep? What helped, what got in the way?',
      },
      {
        title: 'Release the day',
        intro: 'Stress builds up in the body. Today you learn to let it out before it piles up.',
        articleId: 'stress-cycle',
        exerciseId: 'shake',
        task: 'After work today, shake for one minute or take a brisk 10-minute walk.',
        reflection: 'What did you notice in your body after releasing?',
      },
      {
        title: 'Look back',
        intro: 'One week. Whatever you managed, it counts. Not all at once.',
        exerciseId: 'three-good',
        task: 'Read your reflections from this week. Circle what helped most.',
        reflection: 'What is one thing that is a little lighter than a week ago?',
      },
      {
        title: 'Your rhythm',
        intro: 'Your nervous system refills in small pieces throughout the day, not only at the weekend.',
        articleId: 'rest',
        exerciseId: 'eye-palming',
        task: 'Set three reminders today for a 3-minute break.',
        reflection: 'Did the breaks feel like a loss of time or a gain of energy?',
      },
      {
        title: 'Coming back to life',
        intro: 'When stress builds up, the body can start to feel flat or numb. Today we gently wake it up.',
        articleId: 'shutdown',
        exerciseId: 'heel-drop',
        task: 'Spend 15 minutes in daylight today, ideally moving.',
        reflection: 'What did you feel in your body today, even a little?',
      },
      {
        title: 'The vagus nerve',
        intro: 'A long, slow breath out is directly connected to your calming system. Today you use it on purpose.',
        exerciseId: 'long-exhale',
        task: 'Three times today, breathe out twice as long as you breathe in.',
        reflection: 'How did your body feel after the long breaths out?',
      },
      {
        title: 'Soft focus',
        intro: 'Stress narrows our view. Today you practise widening it, with your eyes and your mind.',
        exerciseId: 'panoramic',
        task: 'Look at the sky or the horizon for two minutes today.',
        reflection: 'What helps you see the bigger picture?',
      },
      {
        title: 'Joy is medicine',
        intro: 'Prevention is not only about less stress. It is also about more of what nourishes you.',
        exerciseId: 'three-good',
        task: 'Do one small thing today just because you enjoy it.',
        reflection: 'What did you choose? When did you last do it?',
      },
      {
        title: 'Connection',
        intro: 'We regulate best together. A kind person nearby calms our nervous system.',
        exerciseId: 'self-hold',
        task: 'Have one real conversation today with someone who is good for you.',
        reflection: 'How did you feel after the conversation?',
      },
      {
        title: 'Look back',
        intro: 'Two weeks. You are building new habits, step by step.',
        exerciseId: 'coherent',
        task: 'Choose your three favourite tools so far and write down when you use them.',
        reflection: 'What has changed in how you deal with stress?',
      },
      {
        title: 'Your values',
        intro: 'Boundaries are easier when you know what you are protecting. Today you find out what matters most.',
        exerciseId: 'safe-place',
        task: 'Write down your three most important values in life right now.',
        reflection: 'Where does your current life match your values, and where not?',
      },
      {
        title: 'Every yes is a no',
        intro: 'Every yes to someone else is a no to something of yours. Today you make those trades visible.',
        articleId: 'boundaries',
        exerciseId: 'name-it',
        task: 'Before every yes today, pause and ask: what am I saying no to?',
        reflection: 'Which yes would you take back if you could?',
      },
      {
        title: 'Practise no',
        intro: 'Saying no is a skill, and skills need practice. Today you practise in a safe place first.',
        scenarioId: 'boss-project',
        task: 'Use one of the practised phrases in real life this week.',
        reflection: 'What was easier than you expected?',
      },
      {
        title: 'Work ends',
        intro: 'If work never ends, your nervous system never rests. Today you build a clear ending to your workday.',
        scenarioId: 'after-hours',
        exerciseId: 'wake-stretch',
        task: 'Create a shutdown ritual: close your laptop, write tomorrow’s top three, step outside.',
        reflection: 'How did your evening feel with a clear end to work?',
      },
      {
        title: 'Your inner critic',
        intro: 'Many of us push ourselves with a harsh inner voice. Today you try a kinder one.',
        exerciseId: 'self-hold',
        task: 'When your inner critic speaks today, ask: what would I say to a good friend?',
        reflection: 'What does your inner critic say most often? What would a kind voice say instead?',
      },
      {
        title: 'Your early warning plan',
        intro: 'You now know your signs of stress. Let’s turn that knowledge into a plan for the future.',
        articleId: 'get-help',
        exerciseId: 'body-scan',
        task: 'Write your plan: "When I notice ___, I will ___. If it lasts longer than ___, I will ask ___ for help."',
        reflection: 'Who can support you when things get heavy again?',
      },
      {
        title: 'Back to yourself',
        intro: 'Three weeks. You did this one small step at a time. Not all at once.',
        articleId: 'tiny-steps',
        exerciseId: 'three-good',
        task: 'Write a short letter to yourself in three months: what do you want to remember?',
        reflection: 'What are you most proud of from these 21 days?',
      },
    ],
  },
];

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);

export type ProgramProgress = {
  startedAt: number;
  /** Day number (1-based) → date it was done (YYYY-MM-DD) and optional reflection. */
  days: Record<number, { doneOn: string; note?: string }>;
};

/** The next day to do, and whether it can be done today (one day per calendar day). */
export function nextProgramDay(program: Program, progress: ProgramProgress | undefined, today: string) {
  const done = progress?.days ?? {};
  const next = program.days.findIndex((_, i) => !done[i + 1]) + 1;
  if (next === 0) return { day: program.days.length, finished: true, availableToday: false };
  const previous = done[next - 1];
  const availableToday = TEST_MODE || next === 1 || (previous !== undefined && previous.doneOn !== today);
  return { day: next, finished: false, availableToday };
}
