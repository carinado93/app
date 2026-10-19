import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, PremiumBadge, Quote, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { dailyPlan, dayIndex, WEATHER } from '@/data/daily';
import { nextProgramDay } from '@/data/programs';
import { useT } from '@/i18n';
import { useContent } from '@/i18n/content';
import { gentleStreak, todayKey, useApp } from '@/store/app-state';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Today() {
  const { todayWeather, stepsDone, markStepDone, isPremium, activeProgram, programs } = useApp();
  const t = useT();
  const content = useContent();
  const streak = gentleStreak(stepsDone);
  const doneToday = stepsDone.includes(todayKey());
  const sos = content.exercise('sigh')!;

  return (
    <Screen>
      <View style={styles.topRow}>
        <Eyebrow>{t(greeting())}</Eyebrow>
        <Pressable onPress={() => router.push('/safety')} hitSlop={12}>
          <Ionicons name="heart-circle-outline" size={26} color={Colors.lavender} />
        </Pressable>
      </View>
      <Heading accent={t('all at once.')} size={38}>
        {t('Not')}
      </Heading>
      <Gap size={Spacing.lg} />

      {/* SOS: always free, always one tap away */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: '/exercise/[id]', params: { id: sos.id, sos: '1' } });
        }}
        style={({ pressed }) => [styles.sos, pressed && { opacity: 0.85 }]}>
        <Ionicons name="pulse" size={22} color={Colors.white} />
        <Text style={styles.sosText}>{t('I need calm now').toUpperCase()}</Text>
      </Pressable>
      <Gap size={Spacing.lg} />

      {!todayWeather ? (
        <Card onPress={() => router.push('/checkin')}>
          <Eyebrow>{t('Daily check-in')}</Eyebrow>
          <Text style={styles.cardTitle}>{t('How is your nervous system weather today?')}</Text>
          <Gap size={Spacing.sm} />
          <Text style={styles.weatherRow}>☀️ ⛈️ 🌫️</Text>
          <Gap />
          <Button title={t('Check in')} onPress={() => router.push('/checkin')} />
        </Card>
      ) : (
        <TodayPlan
          weather={todayWeather}
          doneToday={doneToday}
          onDone={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            markStepDone();
          }}
          isPremium={isPremium}
        />
      )}

      <Gap size={Spacing.lg} />
      <ProgramCard activeProgram={activeProgram} programs={programs} />

      <Gap size={Spacing.lg} />
      <View style={styles.streakRow}>
        <Card style={styles.streakCard}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>{t('gentle days in a row')}</Text>
        </Card>
        <Card style={styles.streakCard}>
          <Text style={styles.streakNumber}>{stepsDone.length}</Text>
          <Text style={styles.streakLabel}>{t('small steps in total')}</Text>
        </Card>
      </View>
      <Text style={styles.streakNote}>{t('Missing one day never breaks your streak. Not all at once.')}</Text>

      <Gap size={Spacing.lg} />
      <LearnCard isPremium={isPremium} />

      <Gap size={Spacing.lg} />
      <Quote>{content.quotes[dayIndex() % content.quotes.length]}</Quote>
    </Screen>
  );
}

function ProgramCard({
  activeProgram,
  programs,
}: {
  activeProgram: string | null;
  programs: ReturnType<typeof useApp>['programs'];
}) {
  const t = useT();
  const program = useContent().program(activeProgram ?? 'stress-reset')!;
  const progress = programs[program.id];
  const open = () => router.push({ pathname: '/program/[id]', params: { id: program.id } });

  if (!progress) {
    return (
      <Card onPress={open}>
        <Eyebrow>{t('Start here')}</Eyebrow>
        <Text style={styles.cardTitle}>
          {program.title} <Text style={styles.accent}>{program.accent}</Text>
        </Text>
        <Body>{program.summary}</Body>
        <Gap size={Spacing.sm} />
        <Text style={styles.meta}>{t('Free · 5–10 min a day')}</Text>
      </Card>
    );
  }

  const { day, finished, availableToday } = nextProgramDay(program, progress, todayKey());
  return (
    <Card onPress={open}>
      <Eyebrow>{`${program.title} ${program.accent}`}</Eyebrow>
      <Text style={styles.cardTitle}>
        {finished
          ? `${t('Program complete')} 🌿`
          : availableToday
            ? `${t('Day {n}', { n: day })}: ${program.days[day - 1].title}`
            : t('Day {n} opens tomorrow', { n: day })}
      </Text>
      <Text style={styles.meta}>
        {finished
          ? t('Choose your next program in the Gym tab')
          : availableToday
            ? t('Tap to start today’s day')
            : t('Today’s day is done. Well done.')}
      </Text>
    </Card>
  );
}

function LearnCard({ isPremium }: { isPremium: boolean }) {
  // Show a different article every day; free users get the free ones.
  const t = useT();
  const { articles } = useContent();
  const pool = isPremium ? articles : articles.filter((a) => a.free);
  const article = pool[dayIndex() % pool.length];
  return (
    <Card onPress={() => router.push({ pathname: '/learn/[id]', params: { id: article.id } })}>
      <View style={styles.exerciseHeader}>
        <Eyebrow>{`${t('Learn')} · ${article.minutes} min`}</Eyebrow>
        <Text style={styles.allLink} onPress={() => router.push('/learn')}>
          {t('All articles')}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{article.title}</Text>
      <Body>{article.intro}</Body>
    </Card>
  );
}

function TodayPlan({
  weather,
  doneToday,
  onDone,
  isPremium,
}: {
  weather: NonNullable<ReturnType<typeof useApp>['todayWeather']>;
  doneToday: boolean;
  onDone: () => void;
  isPremium: boolean;
}) {
  const t = useT();
  const plan = dailyPlan(weather, useContent());
  const info = WEATHER[weather];

  return (
    <>
      <Pressable onPress={() => router.push('/checkin')} style={styles.weatherPill}>
        <Text style={styles.weatherPillText}>
          {info.emoji} {t('Today')}: {t(info.label)} · {t('change')}
        </Text>
      </Pressable>
      <Gap size={Spacing.md} />

      <Card>
        <Eyebrow>{t('Your one small step')}</Eyebrow>
        <Text style={styles.cardTitle}>{plan.step}</Text>
        <Gap />
        {doneToday ? (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.sage} />
            <Text style={styles.doneText}>{t('Done. That is enough for today.')}</Text>
          </View>
        ) : (
          <Button title={t('I did it')} onPress={onDone} />
        )}
      </Card>
      <Gap />

      <Card onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: plan.exercise.id } })}>
        <View style={styles.exerciseHeader}>
          <Eyebrow>{t('Exercise for {state}', { state: t(info.label).toLowerCase() })}</Eyebrow>
          {!plan.exercise.free && !isPremium && <PremiumBadge />}
        </View>
        <Text style={styles.cardTitle}>{plan.exercise.title}</Text>
        <Body>{plan.exercise.summary}</Body>
        <Gap size={Spacing.sm} />
        <Text style={styles.meta}>{plan.exercise.minutes} min · {t('tap to start')}</Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lavender,
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
  sosText: { fontFamily: Fonts.sansBold, color: Colors.white, letterSpacing: 2, fontSize: 14 },
  cardTitle: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 30, color: Colors.ink },
  accent: { fontFamily: Fonts.serifItalic, color: Colors.sageDark },
  allLink: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.sageDark },
  weatherRow: { fontSize: 32, letterSpacing: 8 },
  weatherPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sageLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  weatherPillText: { fontFamily: Fonts.sansMedium, color: Colors.sageDark, fontSize: 13 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  doneText: { fontFamily: Fonts.sansMedium, color: Colors.sageDark, fontSize: 15 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  meta: { fontFamily: Fonts.sansMedium, color: Colors.muted, fontSize: 13 },
  streakRow: { flexDirection: 'row', gap: Spacing.md },
  streakCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  streakNumber: { fontFamily: Fonts.sansLight, fontSize: 36, color: Colors.sageDark },
  streakLabel: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.text, textAlign: 'center' },
  streakNote: {
    fontFamily: Fonts.sansLight,
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
