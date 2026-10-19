/** Daily local reminder for the check-in. Nothing is sent to a server. */
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { translate, type Lang } from '@/i18n';

export const remindersSupported = Platform.OS !== 'web';

const CHANNEL = 'daily-step';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Schedules one reminder per day at `hour`, or cancels it when `hour` is null. Returns false if not allowed. */
export async function setDailyReminder(hour: number | null, lang: Lang = 'en'): Promise<boolean> {
  if (!remindersSupported) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (hour === null) return true;

  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: translate(lang, 'Daily step'),
      importance: AndroidImportance.DEFAULT,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${translate(lang, 'Your one small step')} 🌿`,
      body: translate(lang, 'How is your nervous system weather today? It takes 10 seconds.'),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: CHANNEL },
  });
  return true;
}
