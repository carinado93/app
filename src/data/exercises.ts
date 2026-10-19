export type Weather = 'calm' | 'wired' | 'shutdown';

export type Situation =
  | 'meeting'
  | 'argument'
  | 'car'
  | 'sleep'
  | 'work'
  | 'scrolling'
  | 'panic';

export const SITUATIONS: { id: Situation; label: string; icon: string }[] = [
  { id: 'panic', label: 'Panic / overwhelm', icon: 'pulse' },
  { id: 'meeting', label: 'Before a meeting', icon: 'people' },
  { id: 'argument', label: 'After an argument', icon: 'flash' },
  { id: 'work', label: 'At my desk', icon: 'briefcase' },
  { id: 'car', label: 'In the car', icon: 'car' },
  { id: 'scrolling', label: 'After scrolling', icon: 'phone-portrait' },
  { id: 'sleep', label: "Can't sleep", icon: 'moon' },
];

export type BreathPattern = { inhale: number; hold: number; exhale: number; rest: number };

export type Exercise = {
  id: string;
  title: string;
  minutes: number;
  /** Which player screen runs it. */
  kind: 'breath' | 'butterfly' | 'hum' | 'guided';
  /** Nervous system states this exercise is good for. */
  weather: Weather[];
  situations: Situation[];
  free: boolean;
  /** Can be done without anyone noticing. */
  invisible: boolean;
  summary: string;
  why: string;
  steps: string[];
  breath?: BreathPattern;
  rounds?: number;
};

export const EXERCISES: Exercise[] = [
  {
    id: 'sigh',
    title: 'Physiological Sigh',
    minutes: 1,
    kind: 'breath',
    weather: ['wired'],
    situations: ['panic', 'meeting', 'argument', 'work', 'car'],
    free: true,
    invisible: true,
    summary: 'Two inhales through the nose, one long exhale. The fastest way to come down.',
    why: 'The double inhale reopens tiny air sacs in the lungs, and the long exhale slows the heart. It is one of the quickest ways to lower stress in real time.',
    steps: [
      'Breathe in through your nose.',
      'At the top, take one more short sip of air.',
      'Let it all go through your mouth, slowly and long.',
    ],
    breath: { inhale: 3, hold: 1, exhale: 6, rest: 1 },
    rounds: 5,
  },
  {
    id: 'butterfly',
    title: 'Butterfly Hug',
    minutes: 2,
    kind: 'butterfly',
    weather: ['wired'],
    situations: ['panic', 'argument', 'sleep'],
    free: true,
    invisible: false,
    summary: 'Cross your arms and tap left, right, left, right. Your phone guides the rhythm.',
    why: 'Slow left-right tapping (bilateral stimulation) helps the brain process stress and gives the body a feeling of being held.',
    steps: [
      'Cross your arms over your chest, hands resting below the collarbones.',
      'Hold the phone in one hand or place it on your lap.',
      'Tap gently with each hand when the phone vibrates on that side.',
      'Breathe slowly. Notice what changes.',
    ],
  },
  {
    id: 'orienting',
    title: 'Orienting',
    minutes: 2,
    kind: 'guided',
    weather: ['wired', 'shutdown'],
    situations: ['panic', 'work', 'scrolling', 'meeting'],
    free: true,
    invisible: true,
    summary: 'Let your eyes slowly explore the room. Tell your body: I am safe here.',
    why: 'Your nervous system constantly scans for danger. Slowly looking around tells it there is none, which switches off the alarm.',
    steps: [
      'Let your head and eyes move slowly, as if you were seeing this room for the first time.',
      'Find something with a colour you like. Rest your eyes there.',
      'Find something with an interesting texture.',
      'Notice a sound far away. Then a sound close by.',
      'Notice your feet on the ground. You are here. You are safe.',
    ],
  },
  {
    id: 'box',
    title: 'Box Breathing',
    minutes: 3,
    kind: 'breath',
    weather: ['calm', 'wired'],
    situations: ['meeting', 'work', 'car'],
    free: false,
    invisible: true,
    summary: 'In 4, hold 4, out 4, hold 4. Steady focus for hard moments.',
    why: 'An even rhythm gives the mind something simple to follow and keeps you clear and focused under pressure.',
    steps: ['Breathe in for 4.', 'Hold for 4.', 'Breathe out for 4.', 'Hold empty for 4.'],
    breath: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
    rounds: 6,
  },
  {
    id: 'long-exhale',
    title: '4-7-8 Wind Down',
    minutes: 3,
    kind: 'breath',
    weather: ['wired'],
    situations: ['sleep', 'argument'],
    free: false,
    invisible: true,
    summary: 'A long, slow exhale that tells your body it is time to rest.',
    why: 'When the exhale is longer than the inhale, the calming branch of the nervous system takes over.',
    steps: ['Breathe in through the nose for 4.', 'Hold for 7.', 'Breathe out through the mouth for 8.'],
    breath: { inhale: 4, hold: 7, exhale: 8, rest: 0 },
    rounds: 4,
  },
  {
    id: 'hum',
    title: 'Vagus Humming',
    minutes: 2,
    kind: 'hum',
    weather: ['wired', 'shutdown'],
    situations: ['car', 'sleep', 'scrolling'],
    free: false,
    invisible: false,
    summary: 'Hum a low "voooo". The app listens and shows you how steady your hum is.',
    why: 'The vagus nerve runs past your vocal cords. Long, low humming vibrates it gently and activates your calming system.',
    steps: [
      'Take a comfortable breath in.',
      'Hum a low, long "voooo" until the breath is gone.',
      'Feel the vibration in your chest and throat.',
      'Repeat. Try to keep the circle steady.',
    ],
  },
  {
    id: 'shake',
    title: 'Shake It Off',
    minutes: 2,
    kind: 'guided',
    weather: ['wired', 'shutdown'],
    situations: ['argument', 'work', 'scrolling'],
    free: false,
    invisible: false,
    summary: 'Shake your hands, arms and legs like animals do after danger.',
    why: 'Animals shake after a threat to release stress energy. Our bodies can do the same, and it brings a numb body back to life.',
    steps: [
      'Stand up. Start shaking your hands loosely.',
      'Let the shaking move into your arms and shoulders.',
      'Add your legs. Bounce gently on your knees.',
      'Shake a little stronger for 20 seconds.',
      'Stop. Stand still. Feel the tingling.',
    ],
  },
  {
    id: 'cold',
    title: 'Cold Face Reset',
    minutes: 1,
    kind: 'guided',
    weather: ['wired'],
    situations: ['panic', 'argument'],
    free: false,
    invisible: false,
    summary: 'Cold water on your face slows your heart within seconds.',
    why: 'Cold on the face triggers the "diving reflex", which slows the heart rate automatically. Great in a panic.',
    steps: [
      'Fill your hands or a bowl with cold water.',
      'Hold your breath and press your face into the cold for 15–30 seconds.',
      'Breathe out slowly. Repeat once if you like.',
      'Not recommended if you have heart problems.',
    ],
  },
  {
    id: 'energize',
    title: 'Wake-Up Breath',
    minutes: 2,
    kind: 'breath',
    weather: ['shutdown'],
    situations: ['work', 'scrolling'],
    free: false,
    invisible: true,
    summary: 'A slightly longer inhale to gently bring energy back.',
    why: 'When the inhale is longer than the exhale, your body becomes a little more alert. Gentle activation for a foggy, numb state.',
    steps: ['Breathe in deeply for 5.', 'Short pause.', 'Breathe out for 3.'],
    breath: { inhale: 5, hold: 1, exhale: 3, rest: 0 },
    rounds: 8,
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    minutes: 3,
    kind: 'guided',
    weather: ['wired', 'shutdown'],
    situations: ['panic', 'meeting', 'work'],
    free: false,
    invisible: true,
    summary: 'Use your five senses to come back into the here and now.',
    why: 'Anxiety lives in the future. Your senses only exist in the present, so they pull you back into it.',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can feel (clothes, chair, air).',
      'Name 3 things you can hear.',
      'Name 2 things you can smell.',
      'Name 1 thing you can taste.',
    ],
  },
  {
    id: 'feet',
    title: 'Invisible Feet Push',
    minutes: 1,
    kind: 'guided',
    weather: ['wired', 'shutdown'],
    situations: ['meeting', 'work', 'car'],
    free: false,
    invisible: true,
    summary: 'Press your feet into the floor under the table. Nobody will notice.',
    why: 'Pushing against something solid gives the body a sense of strength and stability.',
    steps: [
      'Press both feet firmly into the floor for 5 seconds.',
      'Release and notice the difference.',
      'Repeat 3 times while breathing out slowly.',
    ],
  },
  {
    id: 'self-hold',
    title: 'Self-Hold',
    minutes: 3,
    kind: 'guided',
    weather: ['shutdown', 'wired'],
    situations: ['sleep', 'argument'],
    free: false,
    invisible: false,
    summary: 'One hand on your heart, one on your belly. Feel yourself held.',
    why: 'Warm, gentle touch releases oxytocin, the hormone of safety and connection.',
    steps: [
      'Place one hand on your heart and one on your belly.',
      'Feel the warmth of your hands.',
      'Let your breath move under your hands.',
      'Say quietly: "I am here for myself."',
    ],
  },
];

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);

export const exercisesFor = (weather: Weather) => EXERCISES.filter((e) => e.weather.includes(weather));
