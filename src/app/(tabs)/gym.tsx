import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, PremiumBadge, Screen, usePremiumGate } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { ALL_SESSIONS } from '@/data/gym';
import { useT } from '@/i18n';
import { useContent } from '@/i18n/content';
import { useApp } from '@/store/app-state';

/** The first session is a free taster; everything else is premium. */
const FREE_SESSION = 'f1';

export default function Gym() {
  const { gymDone, markGymDone, isPremium, programs } = useApp();
  const gate = usePremiumGate();
  const t = useT();
  const content = useContent();
  const progress = gymDone.length / ALL_SESSIONS.length;
  // Next session = first one not done yet.
  const next = ALL_SESSIONS.find((s) => !gymDone.includes(s.id));

  return (
    <Screen>
      <Eyebrow>{t('Nervous System Gym')}</Eyebrow>
      <Heading accent={t('like a muscle.')}>{t('Train your calm')}</Heading>
      <Gap />
      <Body>
        {t(
          'Stress capacity grows with small, safe repetitions. Each session is a short exercise plus one tiny challenge for your real life.',
        )}
      </Body>
      <Gap size={Spacing.lg} />

      <Eyebrow>{t('Guided programs')}</Eyebrow>
      {content.programs.map((p) => {
        const done = Object.keys(programs[p.id]?.days ?? {}).length;
        return (
          <Card
            key={p.id}
            style={styles.program}
            onPress={() => router.push({ pathname: '/program/[id]', params: { id: p.id } })}>
            <View style={styles.sessionHeader}>
              <Text style={styles.programTitle}>
                {p.title} <Text style={styles.programAccent}>{p.accent}</Text>
              </Text>
              {p.free ? <Text style={styles.free}>{t('FREE')}</Text> : !isPremium && <PremiumBadge />}
            </View>
            <Body>{p.summary}</Body>
            <Text style={styles.programMeta}>
              {done === 0
                ? t('{n} days · 5–10 min a day', { n: p.days.length })
                : t('{done} of {total} days done', { done, total: p.days.length })}
            </Text>
          </Card>
        );
      })}
      <Gap size={Spacing.lg} />

      <Eyebrow>{t('Gym levels')}</Eyebrow>
      <Card>
        <Text style={styles.progressLabel}>
          {t('{done} of {total} sessions', { done: gymDone.length, total: ALL_SESSIONS.length })}
        </Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </Card>
      <Gap size={Spacing.lg} />

      {content.gym.map((level) => {
        const levelDone = level.sessions.filter((s) => gymDone.includes(s.id)).length;
        return (
          <View key={level.id} style={{ marginBottom: Spacing.xl }}>
            <Eyebrow>{`${t('Level {n}', { n: level.level })} · ${levelDone}/${level.sessions.length}`}</Eyebrow>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Body>{level.focus}</Body>
            <Gap size={Spacing.md} />

            {level.sessions.map((s) => {
              const done = gymDone.includes(s.id);
              const isNext = next?.id === s.id;
              const free = s.id === FREE_SESSION;
              return (
                <Card key={s.id} style={[styles.session, isNext && styles.sessionNext]}>
                  <View style={styles.sessionHeader}>
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={done ? Colors.sage : Colors.creamDark}
                    />
                    <Text style={styles.sessionTitle}>{s.title}</Text>
                    {!free && !isPremium && <PremiumBadge />}
                  </View>
                  {(isNext || done) && (
                    <>
                      <Gap size={Spacing.sm} />
                      {s.exerciseIds.map((id) => {
                        const e = content.exercise(id)!;
                        return (
                          <Text
                            key={id}
                            style={styles.exerciseLink}
                            onPress={() =>
                              gate(() => router.push({ pathname: '/exercise/[id]', params: { id } }))
                            }>
                            ▸ {e.title} · {e.minutes} min
                          </Text>
                        );
                      })}
                      <Gap size={Spacing.sm} />
                      <Text style={styles.challengeLabel}>{t('Challenge rep').toUpperCase()}</Text>
                      <Text style={styles.challenge}>{s.challenge}</Text>
                      {!done && (
                        <>
                          <Gap />
                          <Button
                            title={t('Session done')}
                            onPress={() => (free ? markGymDone(s.id) : gate(() => markGymDone(s.id)))}
                          />
                        </>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  program: { marginBottom: Spacing.md },
  programTitle: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.ink, flex: 1 },
  programAccent: { fontFamily: Fonts.serifItalic, color: Colors.sageDark },
  programMeta: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.muted, marginTop: Spacing.sm },
  free: { fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.sage },
  progressLabel: { fontFamily: Fonts.sansMedium, color: Colors.text, marginBottom: Spacing.sm },
  bar: { height: 10, borderRadius: Radius.pill, backgroundColor: Colors.creamDark, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.sage },
  levelTitle: { fontFamily: Fonts.serif, fontSize: 30, color: Colors.ink },
  session: { marginBottom: Spacing.md, padding: Spacing.md },
  sessionNext: { borderWidth: 2, borderColor: Colors.sage },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sessionTitle: { fontFamily: Fonts.serif, fontSize: 21, color: Colors.ink, flex: 1 },
  exerciseLink: { fontFamily: Fonts.sansMedium, fontSize: 15, color: Colors.sageDark, paddingVertical: 4 },
  challengeLabel: { fontFamily: Fonts.sansMedium, fontSize: 11, letterSpacing: 2, color: Colors.lavender },
  challenge: { fontFamily: Fonts.serifItalic, fontSize: 18, lineHeight: 24, color: Colors.text },
});
