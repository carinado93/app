/** "Learn": short reads (about 2 minutes each). */

export type Article = {
  id: string;
  title: string;
  minutes: number;
  free: boolean;
  intro: string;
  sections: { heading: string; text: string }[];
  takeaway: string;
  /** Exercise to try after reading. */
  exerciseId?: string;
};

export const ARTICLES: Article[] = [
  {
    id: 'nervous-system',
    title: 'Your nervous system in 2 minutes',
    minutes: 2,
    free: true,
    intro:
      'Your nervous system decides, many times a second, whether you are safe. How it answers shapes how you feel, think and act.',
    sections: [
      {
        heading: 'Three states',
        text: 'A simple way to picture it: when you feel safe, you are calm and connected (☀️). When your system senses danger, it speeds up for fight or flight: racing heart, tense muscles, racing thoughts (⛈️). When the danger feels too big or lasts too long, it can switch into shutdown: numb, tired, foggy, far away (🌫️).',
      },
      {
        heading: 'None of these states is wrong',
        text: 'Each state is your body trying to protect you. The problem is not stress itself. The problem is getting stuck in alarm or shutdown for weeks or months without coming back to calm.',
      },
      {
        heading: 'You can steer it',
        text: 'You cannot think your way out of a state, but you can use your body to shift it: your breath, movement, touch, your eyes and your voice. That is what every exercise in this app does.',
      },
    ],
    takeaway: 'Notice your state first. Then choose the tool that fits it.',
    exerciseId: 'orienting',
  },
  {
    id: 'exhale',
    title: 'Why a long exhale calms you',
    minutes: 2,
    free: false,
    intro: 'Of all the ways to calm down, the breath is the one you always have with you.',
    sections: [
      {
        heading: 'Your heart follows your breath',
        text: 'When you breathe in, your heart beats a little faster. When you breathe out, it slows down. This happens automatically, through the vagus nerve.',
      },
      {
        heading: 'Make the exhale longer',
        text: 'If your exhale is longer than your inhale, you spend more time in the "slowing down" phase. Within a minute or two, your body gets the message: we are safe.',
      },
      {
        heading: 'Don’t force it',
        text: 'Calm breathing is soft and quiet. If you feel dizzy, breathe normally for a moment. Small and gentle beats big and dramatic.',
      },
    ],
    takeaway: 'Breathe out twice as long as you breathe in.',
    exerciseId: 'long-exhale',
  },
  {
    id: 'stress-cycle',
    title: 'Stress is not the enemy',
    minutes: 2,
    free: false,
    intro: 'Stress is energy your body makes to help you deal with a challenge. Trouble starts when that energy has nowhere to go.',
    sections: [
      {
        heading: 'The stressor and the stress',
        text: 'The stressor is the thing: the deadline, the conflict, the bill. The stress is what happens in your body. Solving the problem does not automatically switch off the stress in your body.',
      },
      {
        heading: 'Completing the cycle',
        text: 'Your body needs a signal that the danger is over. Movement, a long exhale, a good cry, laughing, a hug of 20 seconds or more, or creative expression can all close the loop.',
      },
      {
        heading: 'Every day',
        text: 'If you do not complete the cycle, stress piles up from day to day. A few minutes of release each day is real prevention.',
      },
    ],
    takeaway: 'Deal with the stressor, and separately, release the stress from your body.',
    exerciseId: 'shake',
  },
  {
    id: 'burnout-signs',
    title: 'Early warning signs of burnout',
    minutes: 3,
    free: true,
    intro: 'Burnout rarely arrives overnight. It creeps in slowly, and the first signs are easy to ignore.',
    sections: [
      {
        heading: 'Exhaustion',
        text: 'You wake up tired, even after sleep. Weekends are no longer enough to recover. Small tasks feel heavy.',
      },
      {
        heading: 'Distance',
        text: 'You feel more cynical or irritable. Things you used to care about leave you cold. You withdraw from people.',
      },
      {
        heading: 'Feeling less effective',
        text: 'You work longer but get less done. You doubt yourself more. Concentration and memory get worse.',
      },
      {
        heading: 'The body speaks',
        text: 'Headaches, stomach problems, getting sick often, tension in the neck and back, trouble falling or staying asleep.',
      },
    ],
    takeaway: 'If you recognise several of these signs over weeks, take them seriously. Talk to your doctor and get support early.',
    exerciseId: 'body-scan',
  },
  {
    id: 'get-help',
    title: 'When self-help is not enough',
    minutes: 2,
    free: true,
    intro: 'This app can support you, but some moments need more than exercises. Knowing when to get help is a strength.',
    sections: [
      {
        heading: 'See a doctor or therapist if…',
        text: 'you feel hopeless or empty most days for two weeks or longer; you can no longer manage daily life or work; you have panic attacks often; you sleep very badly for weeks; you use alcohol or other substances to cope.',
      },
      {
        heading: 'Get help immediately if…',
        text: 'you think about harming yourself or about not wanting to live. Call emergency services or a crisis line now. You can find the numbers under "Crisis help & safety" in your profile.',
      },
      {
        heading: 'Burnout and depression',
        text: 'They can look alike and can go together. Only a professional can tell the difference. There is no need to figure it out alone.',
      },
    ],
    takeaway: 'Asking for help early is the fastest way back to yourself.',
  },
  {
    id: 'shutdown',
    title: 'Why your body sometimes switches off',
    minutes: 2,
    free: false,
    intro: 'Feeling numb, empty or "not really there" is not laziness. It is a protective state.',
    sections: [
      {
        heading: 'The emergency brake',
        text: 'When stress is too much for too long, the nervous system can pull the emergency brake. Energy drops, feelings go quiet, everything feels far away.',
      },
      {
        heading: 'Don’t push, nudge',
        text: 'Pushing hard against shutdown often makes it worse. Small, gentle activation works better: movement, cold water on the wrists, daylight, humming, a warm drink, a kind voice.',
      },
      {
        heading: 'Up, then down',
        text: 'Coming out of shutdown can feel like more anxiety at first. That is normal: you are passing through alarm on the way back to calm. Go slowly.',
      },
    ],
    takeaway: 'In shutdown, think tiny and gentle: one small movement at a time.',
    exerciseId: 'heel-drop',
  },
  {
    id: 'boundaries',
    title: 'Boundaries are self-care',
    minutes: 2,
    free: false,
    intro: 'Many people who burn out are kind, reliable and hard-working. That is exactly why everyone asks them.',
    sections: [
      {
        heading: 'Every yes is a no to something else',
        text: 'When you say yes to an extra project, you may be saying no to your sleep, your family or your health. Boundaries make that trade visible.',
      },
      {
        heading: 'Short is kind',
        text: 'A clear "No, I can’t take this on" is kinder than a long excuse or a yes you regret. You don’t need to justify your limits.',
      },
      {
        heading: 'Guilt is not a stop sign',
        text: 'Feeling guilty after setting a boundary is normal, especially at the beginning. It means you are doing something new, not something wrong.',
      },
    ],
    takeaway: 'Practise saying no in small, safe situations first.',
  },
  {
    id: 'sleep',
    title: 'Sleep and stress: a two-way street',
    minutes: 2,
    free: false,
    intro: 'Stress makes sleep worse, and bad sleep makes stress worse. The good news: you can break the circle from both sides.',
    sections: [
      {
        heading: 'Wind down on purpose',
        text: 'Your nervous system cannot go from 100 to 0 in one second. Give it 30–60 minutes: dim lights, no work, no news, and a calming routine.',
      },
      {
        heading: 'Move worries out of bed',
        text: 'Write tomorrow’s to-do list before bed, or use the worry container. Your mind lets go more easily when it knows nothing will be forgotten.',
      },
      {
        heading: 'Same time, every day',
        text: 'Getting up at roughly the same time every day, also at weekends, is one of the strongest tools for better sleep.',
      },
    ],
    takeaway: 'Treat the hour before bed as part of your sleep.',
    exerciseId: 'sleep-wind-down',
  },
  {
    id: 'rest',
    title: 'Rest is not a reward',
    minutes: 2,
    free: false,
    intro: 'Many of us believe we have to earn rest by finishing everything first. But the list never ends.',
    sections: [
      {
        heading: 'Different kinds of rest',
        text: 'Sleep is only one kind. You may also need physical rest, mental rest (a break from thinking), sensory rest (less noise and screens), social rest, and creative rest (nature, art, beauty).',
      },
      {
        heading: 'Small and often',
        text: 'Five minutes of real rest every 90 minutes does more than a long holiday once a year. Your nervous system recovers in small pieces.',
      },
      {
        heading: 'Rest before you crash',
        text: 'The best moment to rest is before you feel exhausted, not after.',
      },
    ],
    takeaway: 'Plan rest like an appointment. It is part of the work.',
    exerciseId: 'eye-palming',
  },
  {
    id: 'tiny-steps',
    title: 'Not all at once: why tiny steps work',
    minutes: 2,
    free: false,
    intro: 'When we want change, we often try to change everything on Monday. By Thursday, we give up.',
    sections: [
      {
        heading: 'Small is sustainable',
        text: 'A step so small it feels almost silly is a step you will actually take. And taking it, again and again, builds trust in yourself.',
      },
      {
        heading: 'Missing a day is fine',
        text: 'What matters is coming back, not never missing. That is why your streak in this app forgives a missed day.',
      },
      {
        heading: 'Attach it to something',
        text: 'Link a new habit to something you already do: one long exhale when you sit down at your desk, three good things when you brush your teeth.',
      },
    ],
    takeaway: 'Every path back to yourself begins with one small step.',
  },
];

export const getArticle = (id: string) => ARTICLES.find((a) => a.id === id);
