import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, Eyebrow, Gap, Heading, PremiumBadge, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ARTICLES } from '@/data/learn';
import { useApp } from '@/store/app-state';

export default function Learn() {
  const { isPremium } = useApp();

  return (
    <Screen>
      <Eyebrow>Learn</Eyebrow>
      <Heading accent="in 2 minutes.">Understand your stress</Heading>
      <Gap />
      <Body>Short reads about your nervous system, stress and burnout. Each one ends with one thing to try.</Body>
      <Gap size={Spacing.lg} />
      {ARTICLES.map((a) => (
        <Card
          key={a.id}
          style={{ marginBottom: Spacing.md }}
          onPress={() => router.push({ pathname: '/learn/[id]', params: { id: a.id } })}>
          <View style={styles.row}>
            <Text style={styles.title}>{a.title}</Text>
            {!a.free && !isPremium ? <PremiumBadge /> : a.free ? <Text style={styles.free}>FREE</Text> : null}
          </View>
          <Text style={styles.meta}>{a.minutes} min read</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  title: { fontFamily: Fonts.serif, fontSize: 22, lineHeight: 27, color: Colors.ink, flex: 1 },
  free: { fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.sage, marginTop: 6 },
  meta: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted, marginTop: 4 },
});
