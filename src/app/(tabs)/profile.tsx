import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { LINKS } from '@/constants/links';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { restore } from '@/lib/purchases';
import { remindersSupported, setDailyReminder } from '@/lib/reminders';
import { gentleStreak, useApp } from '@/store/app-state';

const REMINDER_HOURS = [
  { hour: 8, label: '8:00' },
  { hour: 12, label: '12:00' },
  { hour: 18, label: '18:00' },
  { hour: 21, label: '21:00' },
];

export default function Profile() {
  const app = useApp();
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const chooseReminder = async (hour: number | null) => {
    setReminderError(null);
    const ok = await setDailyReminder(hour).catch(() => false);
    if (ok) app.setReminderHour(hour);
    else setReminderError('Notifications are turned off for this app. You can allow them in your phone settings.');
  };

  const onRestore = async () => {
    setRestoreMessage(null);
    const ok = await restore().catch(() => false);
    if (ok) app.setPremium(true);
    setRestoreMessage(ok ? 'Premium restored.' : 'No active subscription found for this Google account.');
  };

  return (
    <Screen>
      <Eyebrow>Your space</Eyebrow>
      <Heading accent="& settings.">Profile</Heading>
      <Gap size={Spacing.lg} />

      {/* Membership */}
      <Card>
        <View style={styles.memberRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>MEMBERSHIP</Text>
            <Text style={styles.memberTitle}>{app.isPremium ? 'Premium' : 'Free'}</Text>
          </View>
          <Ionicons
            name={app.isPremium ? 'star' : 'star-outline'}
            size={28}
            color={app.isPremium ? Colors.sage : Colors.muted}
          />
        </View>
        <Gap size={Spacing.sm} />
        {app.isPremium ? (
          <>
            <Body>Everything is unlocked. Thank you for supporting this work.</Body>
            <Gap />
            <Button
              title="Manage subscription"
              variant="outline"
              onPress={() => Linking.openURL(LINKS.manageSubscription)}
            />
            <Text style={styles.note}>Change or cancel your plan in Google Play.</Text>
          </>
        ) : (
          <>
            <Body>Unlock all exercises, the full Gym, trigger insights and boundary practice.</Body>
            <Gap />
            <Button title="Try Premium 7 days free" onPress={() => router.push('/paywall')} />
          </>
        )}
        <Pressable onPress={onRestore} style={styles.restore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>
        {restoreMessage && <Text style={styles.note}>{restoreMessage}</Text>}
      </Card>
      <Gap size={Spacing.lg} />

      {/* Progress */}
      <Eyebrow>Your journey</Eyebrow>
      <View style={styles.stats}>
        <Stat value={gentleStreak(app.stepsDone)} label="gentle streak" />
        <Stat value={app.checkIns.length} label="check-ins" />
        <Stat value={app.gymDone.length} label="gym sessions" />
        <Stat value={app.triggers.length} label="triggers logged" />
      </View>
      <Gap size={Spacing.lg} />

      {/* Reminder */}
      <Eyebrow>Daily reminder</Eyebrow>
      {remindersSupported ? (
        <Card>
          <Body>A gentle nudge once a day for your check-in and small step.</Body>
          <Gap size={Spacing.md} />
          <View style={styles.chips}>
            <Chip label="Off" active={app.reminderHour === null} onPress={() => chooseReminder(null)} />
            {REMINDER_HOURS.map((r) => (
              <Chip
                key={r.hour}
                label={r.label}
                active={app.reminderHour === r.hour}
                onPress={() => chooseReminder(r.hour)}
              />
            ))}
          </View>
          {reminderError && <Text style={[styles.note, { color: Colors.danger }]}>{reminderError}</Text>}
        </Card>
      ) : (
        <Body>Reminders are available in the phone app.</Body>
      )}
      <Gap size={Spacing.lg} />

      {/* Links */}
      <Eyebrow>Support</Eyebrow>
      <Card style={styles.list}>
        <Row icon="heart-outline" label="Crisis help & safety" onPress={() => router.push('/safety')} />
        <Row icon="calendar-outline" label="Book a free call with Carina" onPress={() => Linking.openURL(LINKS.discoveryCall)} />
        <Row icon="globe-outline" label="carinadorca.com" onPress={() => Linking.openURL(LINKS.website)} last />
      </Card>
      <Gap size={Spacing.lg} />

      <Eyebrow>Legal</Eyebrow>
      <Card style={styles.list}>
        <Row icon="shield-checkmark-outline" label="Privacy policy" onPress={() => Linking.openURL(LINKS.privacy)} />
        <Row icon="document-text-outline" label="Terms of use" onPress={() => Linking.openURL(LINKS.terms)} />
        <Row icon="information-circle-outline" label="Imprint" onPress={() => Linking.openURL(LINKS.imprint)} last />
      </Card>
      <Gap size={Spacing.lg} />

      {/* Data */}
      <Eyebrow>Your data</Eyebrow>
      <Body>
        Your check-ins, steps and triggers are stored only on this phone. There is no account and nothing is
        shared.
      </Body>
      <Gap />
      {confirmDelete ? (
        <Card>
          <Text style={styles.deleteTitle}>Delete everything on this phone?</Text>
          <Body>This removes your check-ins, steps, gym progress and triggers. It cannot be undone.</Body>
          <Gap />
          <Button
            title="Yes, delete my data"
            onPress={() => {
              app.resetData();
              setDailyReminder(null).catch(() => {});
              setConfirmDelete(false);
            }}
          />
          <Gap size={Spacing.sm} />
          <Button title="Cancel" variant="outline" onPress={() => setConfirmDelete(false)} />
        </Card>
      ) : (
        <Pressable onPress={() => setConfirmDelete(true)}>
          <Text style={styles.deleteLink}>Delete my data</Text>
        </Pressable>
      )}

      <Gap size={Spacing.xl} />
      <Text style={styles.version}>
        Not All At Once {Application.nativeApplicationVersion ?? ''} · Carina Dorca, Stress & Burnout Coach
      </Text>
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: Colors.white }]}>{label}</Text>
    </Pressable>
  );
}

function Row({
  icon,
  label,
  onPress,
  last,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Ionicons name={icon} size={20} color={Colors.sageDark} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: Fonts.sansMedium, fontSize: 11, letterSpacing: 2, color: Colors.lavender },
  memberTitle: { fontFamily: Fonts.serif, fontSize: 30, color: Colors.ink },
  note: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.muted, textAlign: 'center', marginTop: Spacing.sm },
  restore: { paddingTop: Spacing.md, alignItems: 'center' },
  restoreText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.muted },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  stat: { flexBasis: '47%', flexGrow: 1, alignItems: 'center', padding: Spacing.md },
  statValue: { fontFamily: Fonts.sansLight, fontSize: 32, color: Colors.sageDark },
  statLabel: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: Colors.sage },
  chipText: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.text },
  list: { padding: 0, paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.creamDark },
  rowLabel: { fontFamily: Fonts.sans, fontSize: 16, color: Colors.ink, flex: 1 },
  deleteTitle: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.ink, marginBottom: Spacing.sm },
  deleteLink: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.danger },
  version: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.muted, textAlign: 'center' },
});
