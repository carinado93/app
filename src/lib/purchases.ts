/**
 * Subscriptions via RevenueCat (handles Google Play billing, and Apple later).
 *
 * Setup: create a RevenueCat project, add the Google Play app, create an
 * entitlement called "premium" with a monthly and yearly product, then put the
 * public Android SDK key in EXPO_PUBLIC_REVENUECAT_ANDROID_KEY (see .env.example).
 *
 * Without a key the app runs in preview mode: in development builds the paywall
 * shows a "preview unlock" button so every premium screen can be tested.
 */
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

export const ENTITLEMENT = 'premium';

const API_KEY = Platform.select({
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
});

export const purchasesEnabled = Boolean(API_KEY) && Platform.OS !== 'web';

const listeners = new Set<(premium: boolean) => void>();
const emit = (premium: boolean) => listeners.forEach((l) => l(premium));

const hasPremium = (info: CustomerInfo) => Boolean(info.entitlements.active[ENTITLEMENT]);

export async function initPurchases(): Promise<boolean> {
  if (!purchasesEnabled) return false;
  try {
    Purchases.configure({ apiKey: API_KEY! });
    Purchases.addCustomerInfoUpdateListener((info) => emit(hasPremium(info)));
    return hasPremium(await Purchases.getCustomerInfo());
  } catch (e) {
    console.warn('RevenueCat init failed', e);
    return false;
  }
}

export function onPremiumChange(listener: (premium: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type Plan = {
  id: 'monthly' | 'annual';
  title: string;
  price: string;
  note: string;
  pkg?: PurchasesPackage;
};

/** Fallback prices shown in preview mode; real prices come from Google Play. */
const PREVIEW_PLANS: Plan[] = [
  { id: 'annual', title: 'Yearly', price: '€59.99 / year', note: '7 days free · save 50%' },
  { id: 'monthly', title: 'Monthly', price: '€9.99 / month', note: '7 days free' },
];

export async function getPlans(): Promise<Plan[]> {
  if (!purchasesEnabled) return PREVIEW_PLANS;
  try {
    const offering = (await Purchases.getOfferings()).current;
    const plans: Plan[] = [];
    if (offering?.annual)
      plans.push({
        id: 'annual',
        title: 'Yearly',
        price: `${offering.annual.product.priceString} / year`,
        note: '7 days free · best value',
        pkg: offering.annual,
      });
    if (offering?.monthly)
      plans.push({
        id: 'monthly',
        title: 'Monthly',
        price: `${offering.monthly.product.priceString} / month`,
        note: '7 days free',
        pkg: offering.monthly,
      });
    return plans.length ? plans : PREVIEW_PLANS;
  } catch {
    return PREVIEW_PLANS;
  }
}

/** Returns true when the user now has premium. Throws on real errors, not on cancel. */
export async function buy(plan: Plan): Promise<boolean> {
  if (!plan.pkg) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    return hasPremium(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  if (!purchasesEnabled) return false;
  return hasPremium(await Purchases.restorePurchases());
}
