import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Eyebrow, Gap, Heading, Quote, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useT } from '@/i18n';
import { useApp } from '@/store/app-state';

const PAGES = [
  {
    eyebrow: 'Back to yourself',
    title: 'Calm your nervous system,',
    accent: 'gently.',
    body: 'Short body-based exercises for stress, anxiety and burnout prevention. Made for real life, not for a perfect morning routine.',
  },
  {
    eyebrow: 'Not all at once',
    title: 'One small step',
    accent: 'a day.',
    body: 'Every day you get one tiny step, matched to how your body feels today. Missed a day? Simply come back when you are ready. There is nothing to catch up on and no reason to feel bad.',
  },
  {
    eyebrow: 'Important',
    title: 'Coaching,',
    accent: 'not therapy.',
    body: 'This app supports your wellbeing. It does not replace medical or psychological care. If you are in crisis, please contact a doctor or emergency services. You can always find help numbers in the app.',
  },
];

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const { finishOnboarding } = useApp();
  const t = useT();
  const p = PAGES[page];
  const last = page === PAGES.length - 1;

  return (
    <Screen>
      <View style={styles.arch}>
        <Text style={styles.archEmoji}>{['🌿', '🪷', '🤍'][page]}</Text>
      </View>
      <Gap size={Spacing.xl} />
      <Eyebrow>{t(p.eyebrow)}</Eyebrow>
      <Heading accent={t(p.accent)} size={40}>
        {t(p.title)}
      </Heading>
      <Gap />
      <Body>{t(p.body)}</Body>
      <Gap size={Spacing.xl} />
      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
      <Gap size={Spacing.lg} />
      <Button
        title={last ? t('Start') : t('Next')}
        onPress={() => {
          if (!last) return setPage(page + 1);
          finishOnboarding();
          router.replace('/checkin');
        }}
      />
      {page === 0 && (
        <>
          <Gap size={Spacing.xl} />
          <Quote>{t('Every path back to yourself begins with one small step.')}</Quote>
          <Text style={styles.signature}>Carina Dorca · {t('Stress & Burnout Coach')}</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  arch: {
    height: 260,
    borderTopLeftRadius: Radius.arch,
    borderTopRightRadius: Radius.arch,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  archEmoji: { fontSize: 72 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.creamDark },
  dotActive: { backgroundColor: Colors.sage, width: 24 },
  signature: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.lavender,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
