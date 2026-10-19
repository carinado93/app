import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, Screen, usePremiumGate } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { getScenario } from '@/data/boundaries';
import { getExercise } from '@/data/exercises';
import { getArticle } from '@/data/learn';
import { getProgram, nextProgramDay, type ProgramDay } from '@/data/programs';
import { todayKey, useApp } from '@/store/app-state';

export default function ProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = getProgram(id);
  const { programs, startProgram, completeProgramDay, isPremium } = useApp();
  const gate = usePremiumGate();
  const [note, setNote] = useState('');
  const [openDay, setOpenDay] = useState<number | null>(null);

  if (!program) {
    return (
      <Screen>
        <Body>Program not found.</Body>
      </Screen>
    );
  }

  const progress = programs[program.id];
  const started = Boolean(progress);
  const { day, finished, availableToday } = nextProgramDay(program, progress, todayKey());
  const doneCount = Object.keys(progress?.days ?? {}).length;
  const locked = !program.free && !isPremium;

  const complete = () => {
    completeProgramDay(program.id, day, note);
    setNote('');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <Screen>
      <Eyebrow>{`Program · ${program.days.length} days`}</Eyebrow>
      <Heading accent={program.accent}>{program.title}</Heading>
      <Gap size={Spacing.sm} />
      <Body>{program.summary}</Body>
      <Gap />
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round((doneCount / program.days.length) * 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {doneCount} of {program.days.length} days
      </Text>
      <Gap size={Spacing.lg} />

      {!started ? (
        <Button
          title={locked ? 'Unlock with Premium' : 'Start program'}
          onPress={() => (program.free ? startProgram(program.id) : gate(() => startProgram(program.id)))}
        />
      ) : finished ? (
        <Card style={{ alignItems: 'center' }}>
          <Text style={styles.bigEmoji}>🌿</Text>
          <Text style={styles.cardTitle}>You finished the program.</Text>
          <Body style={{ textAlign: 'center' }}>One small step at a time. Not all at once. Be proud of yourself.</Body>
        </Card>
      ) : availableToday ? (
        <DayCard day={day} content={program.days[day - 1]}>
          <Text style={styles.label}>REFLECTION</Text>
          <Text style={styles.reflection}>{program.days[day - 1].reflection}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Write a few words (optional, stays on your phone)"
            placeholderTextColor={Colors.muted}
            style={styles.input}
            multiline
          />
          <Gap />
          <Button title={`Complete day ${day}`} onPress={complete} />
        </DayCard>
      ) : (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="moon-outline" size={30} color={Colors.lavender} />
          <Gap size={Spacing.sm} />
          <Text style={styles.cardTitle}>Day {day} opens tomorrow.</Text>
          <Body style={{ textAlign: 'center' }}>
            Not all at once. Let today’s step settle. See you tomorrow.
          </Body>
        </Card>
      )}

      <Gap size={Spacing.xl} />
      <Eyebrow>All days</Eyebrow>
      {program.days.map((d, i) => {
        const n = i + 1;
        const done = progress?.days[n];
        const week = program.weeks?.find((w) => w.fromDay === n);
        return (
          <View key={n}>
            {week && <Text style={styles.week}>{week.title}</Text>}
            <Pressable
              onPress={() => done && setOpenDay(openDay === n ? null : n)}
              style={[styles.dayRow, n === day && started && !finished && styles.dayRowNext]}>
              <Ionicons
                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={done ? Colors.sage : Colors.creamDark}
              />
              <Text style={[styles.dayTitle, !done && n !== day && { color: Colors.muted }]}>
                Day {n} · {d.title}
              </Text>
              {done?.note ? <Ionicons name="create-outline" size={16} color={Colors.lavender} /> : null}
            </Pressable>
            {openDay === n && done && (
              <View style={styles.pastNote}>
                <Text style={styles.reflection}>{d.reflection}</Text>
                <Body>{done.note ?? 'No reflection written.'}</Body>
              </View>
            )}
          </View>
        );
      })}
    </Screen>
  );
}

function DayCard({ day, content, children }: { day: number; content: ProgramDay; children: React.ReactNode }) {
  const exercise = content.exerciseId ? getExercise(content.exerciseId) : undefined;
  const article = content.articleId ? getArticle(content.articleId) : undefined;
  const scenario = content.scenarioId ? getScenario(content.scenarioId) : undefined;

  return (
    <Card style={styles.dayCard}>
      <Eyebrow>{`Today · Day ${day}`}</Eyebrow>
      <Text style={styles.cardTitle}>{content.title}</Text>
      <Body>{content.intro}</Body>
      <Gap />
      {article && (
        <Link
          icon="book-outline"
          label={`Read: ${article.title}`}
          meta={`${article.minutes} min`}
          onPress={() => router.push({ pathname: '/learn/[id]', params: { id: article.id, unlocked: '1' } })}
        />
      )}
      {exercise && (
        <Link
          icon="leaf-outline"
          label={`Exercise: ${exercise.title}`}
          meta={`${exercise.minutes} min`}
          onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, unlocked: '1' } })}
        />
      )}
      {scenario && (
        <Link
          icon="chatbubbles-outline"
          label={`Practise: ${scenario.title}`}
          onPress={() => router.push({ pathname: '/roleplay/[id]', params: { id: scenario.id } })}
        />
      )}
      <Gap size={Spacing.sm} />
      <Text style={styles.label}>YOUR SMALL STEP</Text>
      <Text style={styles.task}>{content.task}</Text>
      <Gap />
      {children}
    </Card>
  );
}

function Link({
  icon,
  label,
  meta,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  meta?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <Ionicons name={icon} size={20} color={Colors.sageDark} />
      <Text style={styles.linkText}>{label}</Text>
      {meta && <Text style={styles.linkMeta}>{meta}</Text>}
      <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { height: 8, borderRadius: Radius.pill, backgroundColor: Colors.creamDark, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.sage },
  progressText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted, marginTop: Spacing.sm },
  bigEmoji: { fontSize: 44, marginBottom: Spacing.sm },
  cardTitle: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 32, color: Colors.ink, marginBottom: Spacing.sm },
  dayCard: { borderWidth: 2, borderColor: Colors.sage },
  label: { fontFamily: Fonts.sansMedium, fontSize: 11, letterSpacing: 2, color: Colors.lavender, marginBottom: 4 },
  task: { fontFamily: Fonts.serifItalic, fontSize: 20, lineHeight: 26, color: Colors.ink },
  reflection: { fontFamily: Fonts.serifItalic, fontSize: 18, lineHeight: 24, color: Colors.text, marginBottom: Spacing.sm },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.cream,
    borderRadius: 14,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cream,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  linkText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.ink, flex: 1 },
  linkMeta: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted },
  week: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.lavender,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  dayRowNext: { backgroundColor: Colors.sageLight },
  dayTitle: { fontFamily: Fonts.sans, fontSize: 16, color: Colors.ink, flex: 1 },
  pastNote: { backgroundColor: Colors.creamLight, borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm },
});
