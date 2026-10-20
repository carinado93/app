# Not All At Once

A nervous-system coaching app by **Carina Dorca, Stress & Burnout Coach**: stress prevention, anxiety relief and burnout prevention through short body-based exercises.

Built with Expo (React Native), so one codebase works for Android now and iOS later.

## What's inside

| Feature | Where | Free / Premium |
|---|---|---|
| **Not All At Once**: one tiny daily step, forgiving streak | `src/app/(tabs)/index.tsx`, `src/data/daily.ts` | Free |
| **Nervous System Weather**: daily check-in (calm / wired / shut down) | `src/app/checkin.tsx` | Free |
| **SOS button** ("I need calm now") | Today screen | Free |
| **Body exercises (25)**: breathing with haptics, butterfly tapping, guided steps with Carina's voice, "works in public" filter | `src/app/(tabs)/exercises.tsx`, `src/components/players.tsx`, `src/data/exercises.ts` | 4 free, rest Premium |
| **Nervous System Gym**: 4 levels, 12 sessions with challenge reps | `src/app/(tabs)/gym.tsx`, `src/data/gym.ts` | 1st session free |
| **Programs**: 7-Day Stress Reset, 21-Day Overwhelm Prevention (one day per calendar day, reflections) | `src/app/program/[id].tsx`, `src/data/programs.ts` | 7-day free, 21-day Premium |
| **Learn**: 10 short articles | `src/app/learn/`, `src/data/learn.ts` | 3 free, rest Premium |
| **Profile**: membership, progress, daily reminder, links, delete data | `src/app/(tabs)/profile.tsx` | Free |
| **Trigger map**: 10-second logging, pattern insights | `src/app/(tabs)/triggers.tsx`, `src/data/triggers.ts` | Logging free, insights Premium |
| **Boundary practice**: 10 scenarios, AI role-play + coach feedback | `src/app/(tabs)/boundaries.tsx`, `src/app/roleplay/[id].tsx`, `server/` | 1 scenario free |
| **Paywall**: 7-day trial, monthly/yearly via Google Play (RevenueCat) | `src/app/paywall.tsx`, `src/lib/purchases.ts` | |
| **Safety**: coaching-not-therapy note, crisis hotlines | `src/app/safety.tsx` | Free |

Brand colours and fonts (Cormorant Garamond + Jost, cream / sage / lavender) are in `src/constants/theme.ts`.
All texts (exercises, steps, gym, scenarios) live in `src/data/` and can be edited without touching screens.

**Languages:** English and German, chosen on the first screen and changeable in Profile. Buttons and labels are in `src/i18n/ui.ts`, German content in `src/i18n/content-de.ts` (same ids as `src/data/`). When you change an English text, update the German one too.

## Run it

```bash
npm install
npx expo start          # then press "w" for web, or scan the QR code
```

Because the app uses RevenueCat (native billing), test on a phone with a **development build**:

```bash
npx eas-cli@latest build --profile development --platform android
```

Without a RevenueCat key the app runs in preview mode; in development builds the paywall has a "Preview: unlock premium" button.

## The AI role-play server

The Anthropic API key must never be in the app, so boundary practice talks to a tiny server in `server/`:

```bash
cd server
npm install
ANTHROPIC_API_KEY=sk-ant-... APP_TOKEN=some-long-random-string npm start
```

Deploy it to any Node host (Render, Railway, Fly.io…), then set `EXPO_PUBLIC_ROLEPLAY_URL` and `EXPO_PUBLIC_ROLEPLAY_TOKEN` in `.env.local` (see `.env.example`). Until then the role-play runs in demo mode with canned answers.

## Publish to Google Play

1. Create a Google Play developer account (one-time $25) and the app "Not All At Once" (package `com.carinadorca.notallatonce`).
2. In RevenueCat: add the Android app, create the entitlement **`premium`** and an offering with a monthly and a yearly product (both with a 7-day free trial), created in Google Play Console → Monetize → Subscriptions.
3. Put the RevenueCat Android key in `.env.local`.
4. `npx eas-cli@latest build --profile production --platform android`
5. `npx eas-cli@latest submit --platform android` (goes to the internal testing track first).
6. Google Play needs a privacy policy URL, the Data safety form (no data leaves the phone except role-play messages sent to the AI server) and the health app declaration.

## Checks

```bash
npm run typecheck
npm run lint
```
