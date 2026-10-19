import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Eyebrow, Gap, Heading, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { WEATHER } from '@/data/daily';
import type { Weather } from '@/data/exercises';
import { useApp } from '@/store/app-state';

const ORDER: Weather[] = ['calm', 'wired', 'shutdown'];

export default function CheckIn() {
  const { checkIn, todayWeather } = useApp();
  const [selected, setSelected] = useState<Weather | undefined>(todayWeather);

  return (
    <Screen>
      <Eyebrow>Nervous System Weather</Eyebrow>
      <Heading accent="right now?">How does your body feel</Heading>
      <Gap />
      <Body>No right or wrong. Just notice.</Body>
      <Gap size={Spacing.lg} />

      {ORDER.map((w) => {
        const info = WEATHER[w];
        const active = selected === w;
        return (
          <Pressable
            key={w}
            onPress={() => {
              Haptics.selectionAsync();
              setSelected(w);
            }}
            style={[styles.option, active && { borderColor: Colors.sage, backgroundColor: Colors.white }]}>
            <Text style={styles.emoji}>{info.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{info.label}</Text>
              <Text style={styles.desc}>{info.description}</Text>
            </View>
          </Pressable>
        );
      })}

      {selected && (
        <>
          <Gap />
          <Body style={styles.message}>{WEATHER[selected].message}</Body>
          <Gap size={Spacing.lg} />
          <Button
            title="Show my step for today"
            onPress={() => {
              checkIn(selected);
              router.dismissTo('/');
            }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.creamLight,
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 40 },
  label: { fontFamily: Fonts.serif, fontSize: 26, color: Colors.ink },
  desc: { fontFamily: Fonts.sansLight, fontSize: 15, color: Colors.text },
  message: { fontFamily: Fonts.serifItalic, fontSize: 20, lineHeight: 26, color: Colors.sageDark },
});
