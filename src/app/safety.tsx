import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { Body, Card, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useT } from '@/i18n';

const HOTLINES = [
  { country: 'Emergency (EU)', name: 'Emergency services', number: '112' },
  { country: 'Germany', name: 'TelefonSeelsorge (24/7, free)', number: '0800 111 0 111' },
  { country: 'Austria', name: 'Telefonseelsorge (24/7)', number: '142' },
  { country: 'Switzerland', name: 'Die Dargebotene Hand (24/7)', number: '143' },
  { country: 'Romania', name: 'Telefonul Sufletului', number: '0800 801 200' },
  { country: 'Spain', name: 'Línea 024 (24/7, free)', number: '024' },
];

export default function Safety() {
  const t = useT();
  return (
    <Screen>
      <Eyebrow>{t('You are not alone')}</Eyebrow>
      <Heading accent={t('right now?')}>{t('Need more support')}</Heading>
      <Gap />
      <Body>
        {t(
          'This app is coaching and self-help. It does not replace a doctor, therapist or emergency care. If you are in crisis or think about harming yourself, please call someone now.',
        )}
      </Body>
      <Gap size={Spacing.lg} />

      {HOTLINES.map((h) => (
        <Pressable key={h.number} onPress={() => Linking.openURL(`tel:${h.number.replace(/\s/g, '')}`)}>
          <Card style={styles.card}>
            <Text style={styles.country}>{t(h.country).toUpperCase()}</Text>
            <Text style={styles.name}>{t(h.name)}</Text>
            <Text style={styles.number}>{h.number}</Text>
          </Card>
        </Pressable>
      ))}

      <Gap />
      <Body style={styles.small}>
        {t(
          'Exercises like cold exposure and breath holds are not suitable for everyone. If you are pregnant or have heart, lung or other medical conditions, talk to your doctor first.',
        )}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, padding: Spacing.md },
  country: { fontFamily: Fonts.sansMedium, fontSize: 11, letterSpacing: 2, color: Colors.lavender },
  name: { fontFamily: Fonts.sans, fontSize: 16, color: Colors.ink },
  number: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.sageDark },
  small: { fontSize: 13, color: Colors.muted },
});
