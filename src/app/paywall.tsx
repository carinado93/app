import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { buy, getPlans, purchasesEnabled, restore, type Plan } from '@/lib/purchases';
import { TEST_MODE } from '@/lib/test-mode';
import { useApp } from '@/store/app-state';

const FEATURES = [
  '21-Day Burnout Recovery program',
  'All 26 body exercises, incl. sleep wind-down',
  'The full Nervous System Gym (4 levels)',
  'All Learn articles',
  'Your personal trigger patterns',
  'AI boundary practice: 10 real-life situations',
  'New content every month',
];

export default function Paywall() {
  const { setPremium, isPremium } = useApp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan['id']>('annual');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  const plan = plans.find((p) => p.id === selected);

  const purchase = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      if (await buy(plan)) {
        setPremium(true);
        router.back();
      }
    } catch (e: any) {
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (isPremium) {
    return (
      <Screen>
        <Heading accent="Premium.">You have</Heading>
        <Gap />
        <Body>Thank you for supporting this work. Everything is unlocked.</Body>
        <Gap size={Spacing.lg} />
        <Button title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Eyebrow>Premium</Eyebrow>
      <Heading accent="whole toolkit.">Your</Heading>
      <Gap size={Spacing.lg} />

      {FEATURES.map((f) => (
        <View key={f} style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.sage} />
          <Text style={styles.featureText}>{f}</Text>
        </View>
      ))}
      <Gap size={Spacing.lg} />

      {plans.length === 0 ? (
        <ActivityIndicator color={Colors.sage} />
      ) : (
        plans.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setSelected(p.id)}
            style={[styles.plan, selected === p.id && styles.planActive]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>{p.title}</Text>
              <Text style={styles.planNote}>{p.note}</Text>
            </View>
            <Text style={styles.planPrice}>{p.price}</Text>
          </Pressable>
        ))
      )}
      <Gap />

      {purchasesEnabled ? (
        <Button title={busy ? 'One moment…' : 'Start 7 days free'} onPress={purchase} disabled={busy || !plan} />
      ) : (
        <>
          <Body style={styles.small}>
            Preview mode: Google Play billing is not connected yet.
          </Body>
          {TEST_MODE && (
            <>
              <Gap size={Spacing.sm} />
              <Button
                title="Preview: unlock premium"
                onPress={() => {
                  setPremium(true);
                  router.back();
                }}
              />
            </>
          )}
        </>
      )}
      <Gap size={Spacing.sm} />
      <Pressable
        onPress={async () => {
          const ok = await restore().catch(() => false);
          if (ok) {
            setPremium(true);
            router.back();
          } else Alert.alert('No subscription found', 'We could not find an active subscription.');
        }}>
        <Text style={styles.restore}>Restore purchases</Text>
      </Pressable>
      <Gap />
      <Body style={styles.small}>
        Free for 7 days, then billed by Google Play. Cancel anytime in Google Play at least 24 hours before the
        trial ends and you will not be charged.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  feature: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm },
  featureText: { fontFamily: Fonts.sans, fontSize: 16, color: Colors.ink, flex: 1 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.creamDark,
    backgroundColor: Colors.creamLight,
    marginBottom: Spacing.md,
  },
  planActive: { borderColor: Colors.sage, backgroundColor: Colors.white },
  planTitle: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.ink },
  planNote: { fontFamily: Fonts.sansMedium, fontSize: 12, color: Colors.lavender, letterSpacing: 0.5 },
  planPrice: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.ink },
  restore: { fontFamily: Fonts.sansMedium, color: Colors.muted, textAlign: 'center', padding: Spacing.sm },
  small: { fontSize: 12, lineHeight: 18, textAlign: 'center', color: Colors.muted },
});
