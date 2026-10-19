import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Card, Eyebrow, Gap, Heading, PremiumBadge, Screen, usePremiumGate } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { SCENARIOS } from '@/data/boundaries';
import { useApp } from '@/store/app-state';

export default function Boundaries() {
  const { isPremium } = useApp();
  const gate = usePremiumGate();

  return (
    <Screen>
      <Eyebrow>Boundary practice</Eyebrow>
      <Heading accent="before it counts.">Practise saying no</Heading>
      <Gap />
      <Body>
        Burnout often starts with too many yeses. Practise the hard conversation with an AI that plays the
        other person, then get coaching feedback and phrases you can use.
      </Body>
      <Gap size={Spacing.lg} />

      {SCENARIOS.map((s) => (
        <Card
          key={s.id}
          style={{ marginBottom: Spacing.md }}
          onPress={() => {
            const open = () => router.push({ pathname: '/roleplay/[id]', params: { id: s.id } });
            if (s.free) open();
            else gate(open);
          }}>
          <View style={styles.row}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={styles.title}>{s.title}</Text>
            {s.free ? <Text style={styles.free}>FREE</Text> : !isPremium && <PremiumBadge />}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emoji: { fontSize: 28 },
  title: { fontFamily: Fonts.serif, fontSize: 21, lineHeight: 26, color: Colors.ink, flex: 1 },
  free: { fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.sage },
});
