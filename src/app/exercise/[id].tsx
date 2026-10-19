import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BreathPlayer, ButterflyPlayer, GuidedPlayer, HumPlayer } from '@/components/players';
import { Body, Button, Card, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getExercise } from '@/data/exercises';
import { useApp } from '@/store/app-state';

const PLAYERS = {
  breath: BreathPlayer,
  butterfly: ButterflyPlayer,
  hum: HumPlayer,
  guided: GuidedPlayer,
};

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);
  const { isPremium } = useApp();
  const [finished, setFinished] = useState(false);

  if (!exercise) {
    return (
      <Screen>
        <Body>Exercise not found.</Body>
      </Screen>
    );
  }

  const locked = !exercise.free && !isPremium;
  const Player = PLAYERS[exercise.kind];

  return (
    <Screen>
      <Eyebrow>{`${exercise.minutes} min${exercise.invisible ? ' · invisible' : ''}`}</Eyebrow>
      <Heading>{exercise.title}</Heading>
      <Gap size={Spacing.sm} />
      <Body>{exercise.summary}</Body>
      <Gap size={Spacing.lg} />

      {locked ? (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="lock-closed-outline" size={32} color={Colors.lavender} />
          <Gap size={Spacing.sm} />
          <Text style={styles.lockTitle}>Part of Premium</Text>
          <Body style={{ textAlign: 'center' }}>
            Unlock all exercises, the Nervous System Gym, trigger insights and boundary practice.
          </Body>
          <Gap />
          <Button title="Try 7 days free" onPress={() => router.push('/paywall')} />
        </Card>
      ) : finished ? (
        <Card style={{ alignItems: 'center' }}>
          <Text style={styles.doneEmoji}>🌿</Text>
          <Text style={styles.lockTitle}>Well done.</Text>
          <Body style={{ textAlign: 'center' }}>
            Take a moment to notice your body. What feels a little different now?
          </Body>
          <Gap />
          <Button title="Back" onPress={() => router.back()} />
          <Gap size={Spacing.sm} />
          <Button title="Do it again" variant="outline" onPress={() => setFinished(false)} />
        </Card>
      ) : (
        <Player exercise={exercise} onFinish={() => setFinished(true)} />
      )}

      <Gap size={Spacing.xl} />
      {exercise.kind !== 'guided' && (
        <View>
          <Eyebrow>How it works</Eyebrow>
          {exercise.steps.map((s, i) => (
            <Text key={i} style={styles.step}>
              {i + 1}. {s}
            </Text>
          ))}
          <Gap />
        </View>
      )}
      <Eyebrow>Why it helps</Eyebrow>
      <Body>{exercise.why}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lockTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.ink, marginBottom: Spacing.sm },
  doneEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  step: { fontFamily: Fonts.sansLight, fontSize: 15, lineHeight: 23, color: Colors.text, marginBottom: 4 },
});
