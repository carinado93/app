import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BreathPlayer, ButterflyPlayer, GuidedPlayer, HumPlayer } from '@/components/players';
import { Body, Button, Card, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useT } from '@/i18n';
import { useContent } from '@/i18n/content';
import { EXERCISE_VOICE, useVoice } from '@/lib/voice';
import { useApp } from '@/store/app-state';

const PLAYERS = {
  breath: BreathPlayer,
  butterfly: ButterflyPlayer,
  hum: HumPlayer,
  guided: GuidedPlayer,
};

export default function ExerciseScreen() {
  const { id, unlocked, sos } = useLocalSearchParams<{ id: string; unlocked?: string; sos?: string }>();
  const t = useT();
  const exercise = useContent().exercise(id);
  const { isPremium } = useApp();
  const [finished, setFinished] = useState(false);
  const voice = useVoice();
  // The screen must not turn off mid-exercise: that would also stop Carina's voice.
  useKeepAwake();

  if (!exercise) {
    return (
      <Screen>
        <Body>{t('Exercise not found.')}</Body>
      </Screen>
    );
  }

  // Exercises inside a program day are always open.
  const locked = !exercise.free && !isPremium && unlocked !== '1';
  const Player = PLAYERS[exercise.kind];

  return (
    <Screen>
      <Eyebrow>{`${exercise.minutes} min${exercise.invisible ? ` · ${t('invisible')}` : ''}`}</Eyebrow>
      <Heading>{exercise.title}</Heading>
      <Gap size={Spacing.sm} />
      <Body>{exercise.summary}</Body>
      <Gap size={Spacing.lg} />

      {locked ? (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="lock-closed-outline" size={32} color={Colors.lavender} />
          <Gap size={Spacing.sm} />
          <Text style={styles.lockTitle}>{t('Part of Premium')}</Text>
          <Body style={{ textAlign: 'center' }}>
            {t('Unlock all exercises, the Nervous System Gym, trigger insights and boundary practice.')}
          </Body>
          <Gap />
          <Button title={t('Try 7 days free')} onPress={() => router.push('/paywall')} />
        </Card>
      ) : finished ? (
        <Card style={{ alignItems: 'center' }}>
          <Text style={styles.doneEmoji}>🌿</Text>
          <Text style={styles.lockTitle}>{t('Well done.')}</Text>
          <Body style={{ textAlign: 'center' }}>
            {t('Take a moment to notice your body. What feels a little different now?')}
          </Body>
          <Gap />
          <Button title={t('Back')} onPress={() => router.back()} />
          <Gap size={Spacing.sm} />
          <Button title={t('Do it again')} variant="outline" onPress={() => setFinished(false)} />
        </Card>
      ) : (
        <>
          {/* Read first, then start (SOS starts by itself, no time for reading). */}
          {sos !== '1' && (exercise.kind !== 'guided' || voice.steps(EXERCISE_VOICE[exercise.id])) && (
            <View>
              <Eyebrow>{t('How it works')}</Eyebrow>
              {exercise.steps.map((s, i) => (
                <Text key={i} style={styles.step}>
                  {i + 1}. {s}
                </Text>
              ))}
              <Text style={styles.readFirst}>{t('Read this first, then press Start.')}</Text>
              <Gap />
            </View>
          )}
          <Player exercise={exercise} sos={sos === '1'} onFinish={() => setFinished(true)} />
        </>
      )}

      <Gap size={Spacing.xl} />
      <Eyebrow>{t('Why it helps')}</Eyebrow>
      <Body>{exercise.why}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lockTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.ink, marginBottom: Spacing.sm },
  doneEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  step: { fontFamily: Fonts.sansLight, fontSize: 15, lineHeight: 23, color: Colors.text, marginBottom: 4 },
  readFirst: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.sageDark, marginTop: Spacing.sm },
});
