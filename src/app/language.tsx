import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Gap, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { deviceLanguage, LANGUAGES, translate, type Lang } from '@/i18n';
import { setDailyReminder } from '@/lib/reminders';
import { useApp } from '@/store/app-state';

export default function LanguageScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { language, setLanguage, onboarded, reminderHour } = useApp();
  const [selected, setSelected] = useState<Lang>(language ?? deviceLanguage());

  return (
    <Screen>
      <View style={styles.lotus}>
        <Text style={styles.lotusEmoji}>🪷</Text>
      </View>
      <Gap size={Spacing.lg} />
      {/* Shown in every language, because nothing is chosen yet. */}
      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.subtitles}>Sprache wählen · Alege limba · Elige tu idioma</Text>
      <Gap size={Spacing.lg} />

      {LANGUAGES.map((l) => {
        const active = selected === l.id;
        return (
          <Pressable
            key={l.id}
            onPress={() => setSelected(l.id)}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{l.label}</Text>
              <Text style={styles.hello}>{l.hello}</Text>
            </View>
            <Ionicons
              name={active ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={active ? Colors.sage : Colors.creamDark}
            />
          </Pressable>
        );
      })}

      <Gap />
      <Button
        title={translate(selected, 'Continue')}
        onPress={() => {
          setLanguage(selected);
          // Re-schedule the reminder so its text follows the new language.
          if (reminderHour !== null) setDailyReminder(reminderHour, selected).catch(() => {});
          if (from === 'profile') router.back();
          else router.replace(onboarded ? '/' : '/onboarding');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lotus: {
    height: 160,
    borderTopLeftRadius: Radius.arch,
    borderTopRightRadius: Radius.arch,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  lotusEmoji: { fontSize: 56 },
  title: { fontFamily: Fonts.serif, fontSize: 36, color: Colors.ink },
  subtitles: { fontFamily: Fonts.sansLight, fontSize: 15, color: Colors.text, marginTop: Spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.creamLight,
    marginBottom: Spacing.md,
  },
  optionActive: { borderColor: Colors.sage, backgroundColor: Colors.white },
  label: { fontFamily: Fonts.serif, fontSize: 24, color: Colors.ink },
  hello: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.muted },
});
