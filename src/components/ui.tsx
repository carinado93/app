import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/store/app-state';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** Small spaced capitals in lavender, like "BACK TO YOURSELF" on the website. */
export function Eyebrow({ children }: { children: string }) {
  return <Text style={styles.eyebrow}>{children.toUpperCase()}</Text>;
}

/** Serif heading; pass `accent` to add an italic sage word at the end. */
export function Heading({
  children,
  accent,
  size = 34,
}: {
  children: string;
  accent?: string;
  size?: number;
}) {
  return (
    <Text style={[styles.heading, { fontSize: size, lineHeight: size * 1.15 }]}>
      {children}
      {accent ? <Text style={styles.headingAccent}> {accent}</Text> : null}
    </Text>
  );
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonOutline,
        pressed && primary && { backgroundColor: Colors.sageDark },
        disabled && { opacity: 0.5 },
      ]}>
      <Text style={[styles.buttonText, { color: primary ? Colors.white : Colors.ink }]}>
        {title.toUpperCase()}
      </Text>
    </Pressable>
  );
}

export function Quote({ children }: { children: string }) {
  return (
    <View style={styles.quote}>
      <Text style={styles.quoteMark}>”</Text>
      <Text style={styles.quoteText}>{children}</Text>
    </View>
  );
}

export function PremiumBadge() {
  return (
    <View style={styles.badge}>
      <Ionicons name="lock-closed" size={11} color={Colors.lavender} />
      <Text style={styles.badgeText}>PREMIUM</Text>
    </View>
  );
}

/** Runs `action` for premium users, otherwise opens the paywall. */
export function usePremiumGate() {
  const { isPremium } = useApp();
  return (action: () => void) => (isPremium ? action() : router.push('/paywall'));
}

export function Gap({ size = Spacing.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  screenContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  eyebrow: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.lavender,
    marginBottom: Spacing.sm,
  },
  heading: { fontFamily: Fonts.serif, color: Colors.ink },
  headingAccent: { fontFamily: Fonts.serifItalic, color: Colors.sageDark },
  body: { fontFamily: Fonts.sansLight, fontSize: 16, lineHeight: 25, color: Colors.text },
  card: {
    backgroundColor: Colors.creamLight,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    shadowColor: Colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  button: {
    borderRadius: Radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: Colors.sage },
  buttonOutline: { borderWidth: 1.5, borderColor: Colors.ink },
  buttonText: { fontFamily: Fonts.sansBold, fontSize: 14, letterSpacing: 2 },
  quote: {
    backgroundColor: Colors.creamLight,
    borderRadius: Radius.card,
    padding: Spacing.lg,
  },
  quoteMark: { fontFamily: Fonts.serif, fontSize: 28, color: Colors.lavender, lineHeight: 28 },
  quoteText: { fontFamily: Fonts.serifItalic, fontSize: 18, color: Colors.text, lineHeight: 24 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.lavenderLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.lavender },
});
