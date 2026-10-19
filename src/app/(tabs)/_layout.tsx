import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { Platform, type ColorValue } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useApp } from '@/store/app-state';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  };
}

export default function TabLayout() {
  const { onboarded } = useApp();
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.sageDark,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.creamLight,
          borderTopColor: Colors.creamDark,
          // The web preview has no safe-area inset, so give the labels room.
          ...(Platform.OS === 'web' && { height: 64, paddingBottom: 8 }),
        },
        tabBarLabelStyle: { fontFamily: Fonts.sansMedium, fontSize: 11 },
        sceneStyle: { backgroundColor: Colors.cream },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('sunny-outline') }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercises', tabBarIcon: icon('leaf-outline') }} />
      <Tabs.Screen name="gym" options={{ title: 'Gym', tabBarIcon: icon('barbell-outline') }} />
      <Tabs.Screen name="triggers" options={{ title: 'Triggers', tabBarIcon: icon('analytics-outline') }} />
      <Tabs.Screen name="boundaries" options={{ title: 'Practice', tabBarIcon: icon('chatbubbles-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
