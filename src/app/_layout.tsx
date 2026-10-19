import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import { Jost_300Light, Jost_400Regular, Jost_500Medium, Jost_600SemiBold, useFonts } from '@expo-google-fonts/jost';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors, Fonts } from '@/constants/theme';
import { AppProvider, useApp } from '@/store/app-state';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loaded } = useApp();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });
  const ready = loaded && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.cream },
          headerShadowVisible: false,
          headerTintColor: Colors.ink,
          headerTitleStyle: { fontFamily: Fonts.serif, fontSize: 22 },
          contentStyle: { backgroundColor: Colors.cream },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="checkin" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="exercise/[id]" options={{ title: '' }} />
        <Stack.Screen name="roleplay/[id]" options={{ title: 'Practice' }} />
        <Stack.Screen name="program/[id]" options={{ title: '' }} />
        <Stack.Screen name="learn/index" options={{ title: '' }} />
        <Stack.Screen name="learn/[id]" options={{ title: '' }} />
        <Stack.Screen name="paywall" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="safety" options={{ title: 'Help & safety' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootStack />
    </AppProvider>
  );
}
