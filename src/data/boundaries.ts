export type Scenario = {
  id: string;
  title: string;
  emoji: string;
  /** Who the AI plays. */
  role: string;
  /** What the other person wants from the user. */
  situation: string;
  opening: string;
  phrases: string[];
  free: boolean;
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'boss-project',
    title: 'My boss wants me to take on more',
    emoji: '💼',
    role: 'a friendly but pushy manager who is used to the employee always saying yes',
    situation: 'The manager is asking the employee to take on an extra project although their workload is already full.',
    opening:
      "Hey, do you have a second? Something urgent came in and honestly, you're the only one I trust with it. Can you take it on this week?",
    phrases: [
      'I want to do this well, and with my current workload I can’t. What should I put on hold?',
      'I can do it from next Monday, not this week.',
      'Thank you for trusting me. My answer is no for now.',
    ],
    free: true,
  },
  {
    id: 'friend-favour',
    title: 'A friend asks for a big favour',
    emoji: '🫶',
    role: 'a close friend who is a little hurt when hearing no',
    situation: 'The friend asks the user to help them move house all weekend, the only free weekend the user has this month.',
    opening:
      "Sooo... I need a huge favour. I'm moving on Saturday and Sunday and I really need you. You're free, right?",
    phrases: [
      'I love you and I can’t this weekend. I need it to recharge.',
      'I can’t help with the move, but I can bring dinner on Sunday evening.',
      'It’s not about you. I’m learning to protect my energy.',
    ],
    free: false,
  },
  {
    id: 'family-guilt',
    title: 'Family makes me feel guilty',
    emoji: '🏡',
    role: 'a parent who uses guilt when the user sets limits',
    situation: 'The parent expects the user to come every Sunday and reacts with guilt when the user wants to skip one.',
    opening: "You're not coming on Sunday? After everything we've done for you... we barely see you anymore.",
    phrases: [
      'I love you. I won’t come this Sunday, and that is not about love.',
      'I hear that you’re disappointed. My decision stays the same.',
      'Let’s find a day that works for both of us.',
    ],
    free: false,
  },
  {
    id: 'client-scope',
    title: 'A client keeps asking for extras',
    emoji: '📈',
    role: 'a client who keeps adding "small" requests outside of what was agreed',
    situation: 'The client wants extra work that was not part of the agreed scope and expects it for free.',
    opening:
      "Love what you did! Just one tiny thing: can you also redo the presentation and add a few slides? Should be quick, right?",
    phrases: [
      'Happy to do that. It’s outside our agreement, so I’ll send you a quote.',
      'That’s not included. Here are two options for how we can add it.',
      'I want to keep the quality high, so I need more time for this.',
    ],
    free: false,
  },
  {
    id: 'partner-load',
    title: 'My partner leaves everything to me',
    emoji: '💬',
    role: 'a loving partner who does not notice how much mental load the user carries',
    situation: 'The user wants to share household and planning tasks more fairly.',
    opening: "What's wrong? You seem stressed again. Is it work?",
    phrases: [
      'It’s not only work. I’m carrying too much at home, and I need us to share it.',
      'Can you take over the groceries and planning for the kids from now on?',
      'I don’t need help. I need you to own some of these tasks completely.',
    ],
    free: false,
  },
  {
    id: 'after-hours',
    title: 'Messages after work hours',
    emoji: '📱',
    role: 'a colleague who regularly messages late in the evening and expects quick answers',
    situation: 'The user wants to stop answering work messages after 6pm.',
    opening: "Hey, sorry it's late! Quick question about tomorrow, can you send me the file tonight?",
    phrases: [
      'I’m offline after 6pm. I’ll send it first thing in the morning.',
      'If it’s really urgent, please call. Otherwise I’ll answer tomorrow.',
      'I want to be fully there for work, so I need my evenings off.',
    ],
    free: false,
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id);
