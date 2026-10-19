import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, PremiumBadge, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { findPatterns, TRIGGER_CATEGORIES, type TriggerCategory, type TriggerEntry } from '@/data/triggers';
import { useApp } from '@/store/app-state';

export default function Triggers() {
  const { triggers, addTrigger, removeTrigger, isPremium } = useApp();
  const [category, setCategory] = useState<TriggerCategory | null>(null);
  const [intensity, setIntensity] = useState<TriggerEntry['intensity']>(3);
  const [note, setNote] = useState('');
  const insights = findPatterns(triggers);

  const save = () => {
    if (!category) return;
    addTrigger({ category, intensity, note: note.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCategory(null);
    setIntensity(3);
    setNote('');
  };

  return (
    <Screen>
      <Eyebrow>Trigger map</Eyebrow>
      <Heading accent="patterns.">Notice your</Heading>
      <Gap />
      <Body>Log stress moments in 10 seconds. After a few entries, the app shows you what keeps coming back.</Body>
      <Gap size={Spacing.lg} />

      <Card>
        <Text style={styles.cardTitle}>What stressed you?</Text>
        <Gap size={Spacing.sm} />
        <View style={styles.grid}>
          {TRIGGER_CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              style={[styles.cat, category === c.id && styles.catActive]}>
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={[styles.catText, category === c.id && { color: Colors.white }]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {category && (
          <>
            <Gap />
            <Text style={styles.label}>How strong? {intensity}/5</Text>
            <View style={styles.intensityRow}>
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setIntensity(n)}
                  style={[styles.intensity, n <= intensity && styles.intensityActive]}>
                  <Text style={[styles.intensityText, n <= intensity && { color: Colors.white }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
            <Gap />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What happened? (optional)"
              placeholderTextColor={Colors.muted}
              style={styles.input}
              multiline
            />
            <Gap />
            <Button title="Save" onPress={save} />
          </>
        )}
      </Card>

      <Gap size={Spacing.lg} />
      <View style={styles.insightHeader}>
        <Eyebrow>Your patterns</Eyebrow>
        {!isPremium && <PremiumBadge />}
      </View>
      {insights.length === 0 ? (
        <Body>Log at least 5 moments to see your patterns. You have {triggers.length} so far.</Body>
      ) : isPremium ? (
        insights.map((text, i) => (
          <Card key={i} style={styles.insight}>
            <Ionicons name="sparkles-outline" size={18} color={Colors.lavender} />
            <Text style={styles.insightText}>{text}</Text>
          </Card>
        ))
      ) : (
        <Card onPress={() => router.push('/paywall')} style={{ alignItems: 'center' }}>
          <Text style={[styles.insightText, styles.blurred]}>{insights[0]}</Text>
          <Gap size={Spacing.sm} />
          <Text style={styles.unlock}>
            {insights.length} patterns found · unlock with Premium
          </Text>
        </Card>
      )}

      <Gap size={Spacing.lg} />
      <Eyebrow>{`Log (${triggers.length})`}</Eyebrow>
      {triggers.slice(0, 30).map((t) => {
        const c = TRIGGER_CATEGORIES.find((x) => x.id === t.category)!;
        return (
          <View key={t.id} style={styles.logRow}>
            <Text style={styles.catEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.logTitle}>
                {c.label} · {'●'.repeat(t.intensity)}
                <Text style={{ color: Colors.creamDark }}>{'●'.repeat(5 - t.intensity)}</Text>
              </Text>
              {t.note ? <Text style={styles.logNote}>{t.note}</Text> : null}
              <Text style={styles.logDate}>
                {new Date(t.at).toLocaleString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Pressable onPress={() => removeTrigger(t.id)} hitSlop={10}>
              <Ionicons name="close" size={18} color={Colors.muted} />
            </Pressable>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catActive: { backgroundColor: Colors.sage },
  catEmoji: { fontSize: 18 },
  catText: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.text },
  label: { fontFamily: Fonts.sansMedium, color: Colors.text, marginBottom: Spacing.sm },
  intensityRow: { flexDirection: 'row', gap: Spacing.sm },
  intensity: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityActive: { backgroundColor: Colors.lavender },
  intensityText: { fontFamily: Fonts.sansMedium, color: Colors.text },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.cream,
    borderRadius: 14,
    padding: Spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  insight: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, padding: Spacing.md },
  insightText: { fontFamily: Fonts.serif, fontSize: 19, lineHeight: 25, color: Colors.ink, flex: 1 },
  blurred: { opacity: 0.25, textAlign: 'center' },
  unlock: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.lavender, letterSpacing: 1 },
  logRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  logTitle: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.ink },
  logNote: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.text },
  logDate: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, marginTop: 2 },
});
