import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, PremiumBadge, Quote, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { dailyPlan, dayIndex, QUOTES, WEATHER } from '@/data/daily';
import { getExercise } from '@/data/exercises';
import { gentleStreak, todayKey, useApp } from '@/store/app-state';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Today() {
  const { todayWeather, stepsDone, markStepDone, isPremium } = useApp();
  const streak = gentleStreak(stepsDone);
  const doneToday = stepsDone.includes(todayKey());
  const sos = getExercise('sigh')!;

  return (
    <Screen>
      <View style={styles.topRow}>
        <Eyebrow>{greeting()}</Eyebrow>
        <Pressable onPress={() => router.push('/safety')} hitSlop={12}>
          <Ionicons name="heart-circle-outline" size={26} color={Colors.lavender} />
        </Pressable>
      </View>
      <Heading accent="all at once." size={38}>
        Not
      </Heading>
      <Gap size={Spacing.lg} />

      {/* SOS: always free, always one tap away */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: '/exercise/[id]', params: { id: sos.id } });
        }}
        style={({ pressed }) => [styles.sos, pressed && { opacity: 0.85 }]}>
        <Ionicons name="pulse" size={22} color={Colors.white} />
        <Text style={styles.sosText}>I NEED CALM NOW</Text>
      </Pressable>
      <Gap size={Spacing.lg} />

      {!todayWeather ? (
        <Card onPress={() => router.push('/checkin')}>
          <Eyebrow>Daily check-in</Eyebrow>
          <Text style={styles.cardTitle}>How is your nervous system weather today?</Text>
          <Gap size={Spacing.sm} />
          <Text style={styles.weatherRow}>☀️ ⛈️ 🌫️</Text>
          <Gap />
          <Button title="Check in" onPress={() => router.push('/checkin')} />
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
      <View style={styles.streakRow}>
        <Card style={styles.streakCard}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>gentle days in a row</Text>
        </Card>
        <Card style={styles.streakCard}>
          <Text style={styles.streakNumber}>{stepsDone.length}</Text>
          <Text style={styles.streakLabel}>small steps in total</Text>
        </Card>
      </View>
      <Text style={styles.streakNote}>Missing one day never breaks your streak. Not all at once.</Text>

      <Gap size={Spacing.lg} />
      <Quote>{QUOTES[dayIndex() % QUOTES.length]}</Quote>
    </Screen>
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
  const plan = dailyPlan(weather);
  const info = WEATHER[weather];

  return (
    <>
      <Pressable onPress={() => router.push('/checkin')} style={styles.weatherPill}>
        <Text style={styles.weatherPillText}>
          {info.emoji} Today: {info.label} · change
        </Text>
      </Pressable>
      <Gap size={Spacing.md} />

      <Card>
        <Eyebrow>Your one small step</Eyebrow>
        <Text style={styles.cardTitle}>{plan.step}</Text>
        <Gap />
        {doneToday ? (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.sage} />
            <Text style={styles.doneText}>Done. That is enough for today.</Text>
          </View>
        ) : (
          <Button title="I did it" onPress={onDone} />
        )}
      </Card>
      <Gap />

      <Card onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: plan.exercise.id } })}>
        <View style={styles.exerciseHeader}>
          <Eyebrow>{`Exercise for ${info.label.toLowerCase()}`}</Eyebrow>
          {!plan.exercise.free && !isPremium && <PremiumBadge />}
        </View>
        <Text style={styles.cardTitle}>{plan.exercise.title}</Text>
        <Body>{plan.exercise.summary}</Body>
        <Gap size={Spacing.sm} />
        <Text style={styles.meta}>{plan.exercise.minutes} min · tap to start</Text>
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
