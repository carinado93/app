import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Body, Card, Eyebrow, Gap, Heading, PremiumBadge, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { EXERCISES, SITUATIONS, type Situation } from '@/data/exercises';
import { useApp } from '@/store/app-state';

export default function Exercises() {
  const { isPremium } = useApp();
  const [situation, setSituation] = useState<Situation | null>(null);
  const [invisibleOnly, setInvisibleOnly] = useState(false);

  const list = EXERCISES.filter(
    (e) => (!situation || e.situations.includes(situation)) && (!invisibleOnly || e.invisible),
  );

  return (
    <Screen>
      <Eyebrow>Body exercises</Eyebrow>
      <Heading accent="you are.">Reset, wherever</Heading>
      <Gap />
      <Body>Choose your moment. Every exercise takes 1–3 minutes.</Body>
      <Gap />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" active={!situation} onPress={() => setSituation(null)} />
        {SITUATIONS.map((s) => (
          <Chip
            key={s.id}
            label={s.label}
            active={situation === s.id}
            onPress={() => setSituation(situation === s.id ? null : s.id)}
          />
        ))}
      </ScrollView>
      <Gap size={Spacing.sm} />
      <Pressable style={styles.toggle} onPress={() => setInvisibleOnly(!invisibleOnly)}>
        <Ionicons
          name={invisibleOnly ? 'eye-off' : 'eye-off-outline'}
          size={18}
          color={invisibleOnly ? Colors.sageDark : Colors.muted}
        />
        <Text style={[styles.toggleText, invisibleOnly && { color: Colors.sageDark }]}>
          Invisible mode: only exercises nobody will notice
        </Text>
      </Pressable>
      <Gap />

      {list.map((e) => (
        <Card
          key={e.id}
          style={{ marginBottom: Spacing.md }}
          onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}>
          <View style={styles.row}>
            <Text style={styles.title}>{e.title}</Text>
            {!e.free && !isPremium ? <PremiumBadge /> : <Text style={styles.free}>{e.free ? 'FREE' : ''}</Text>}
          </View>
          <Body>{e.summary}</Body>
          <Gap size={Spacing.sm} />
          <Text style={styles.meta}>
            {e.minutes} min{e.invisible ? ' · invisible' : ''}
          </Text>
        </Card>
      ))}
      {list.length === 0 && <Body>No exercise matches. Try another moment.</Body>}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: Colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Spacing.sm, paddingRight: Spacing.lg },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    backgroundColor: Colors.creamLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: Colors.sage, borderColor: Colors.sage },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.text },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  toggleText: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  title: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.ink, flex: 1 },
  free: { fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.sage },
  meta: { fontFamily: Fonts.sansMedium, color: Colors.muted, fontSize: 13 },
});
