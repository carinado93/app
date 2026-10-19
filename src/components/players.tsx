/** Interactive exercise players: breathing, butterfly tapping, humming and guided steps. */
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Gap } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { BreathPattern, Exercise } from '@/data/exercises';
import { useT } from '@/i18n';
import { BREATH_CUES, EXERCISE_VOICE, SOS_VOICE, TAP_CUES, useVoice } from '@/lib/voice';

/** `sos`: opened from "I need calm now": Carina's SOS words instead of the intro, and it starts by itself. */
type PlayerProps = { exercise: Exercise; onFinish: () => void; sos?: boolean };

const vibrate = (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

// ---------- Breathing ----------

const PHASES: { key: keyof BreathPattern; label: string; scale: number }[] = [
  { key: 'inhale', label: 'Breathe in', scale: 1 },
  { key: 'hold', label: 'Hold', scale: 1 },
  { key: 'exhale', label: 'Breathe out', scale: 0.6 },
  { key: 'rest', label: 'Rest', scale: 0.6 },
];

export function BreathPlayer({ exercise, onFinish, sos }: PlayerProps) {
  const t = useT();
  const voice = useVoice();
  const intro = sos ? SOS_VOICE : EXERCISE_VOICE[exercise.id];
  const pattern = exercise.breath!;
  const rounds = exercise.rounds ?? 5;
  const [scale] = useState(() => new Animated.Value(0.6));
  const [running, setRunning] = useState(!!sos);
  const [label, setLabel] = useState('Ready?');
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runPhase = (r: number, i: number): void => {
      if (cancelled) return;
      if (i >= PHASES.length) {
        if (r + 1 >= rounds) finish();
        else runPhase(r + 1, 0);
        return;
      }
      const phase = PHASES[i];
      const seconds = pattern[phase.key];
      if (seconds <= 0) return runPhase(r, i + 1);
      setRound(r + 1);
      setLabel(phase.label);
      // Spoken cue; too short phases (the extra sip of the sigh) stay silent.
      if (i === 0 && r === rounds - 1 && rounds > 1) voice.play(BREATH_CUES.lastRound);
      else if (seconds >= 2) voice.play(BREATH_CUES[phase.key]);
      // Haptic cue at every phase change, so it also works with eyes closed.
      vibrate(phase.key === 'inhale' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(scale, {
        toValue: phase.scale,
        duration: seconds * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
      timers.push(setTimeout(() => runPhase(r, i + 1), seconds * 1000));
    };

    const finish = async () => {
      setLabel('Well done');
      await voice.play(BREATH_CUES.done);
      if (cancelled) return;
      setRunning(false);
      onFinish();
    };

    (async () => {
      if (voice.has(intro)) {
        setLabel('Listen…');
        await voice.play(intro);
      }
      if (!cancelled) runPhase(0, 0);
    })();
    return () => {
      cancelled = true;
      voice.stop();
      timers.forEach(clearTimeout);
      scale.stopAnimation();
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.center}>
      <View style={styles.circleOuter}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
        <Text style={styles.phase}>{t(label)}</Text>
      </View>
      <Text style={styles.counter}>{running ? t('Round {n} of {total}', { n: round, total: rounds }) : t('{n} rounds', { n: rounds })}</Text>
      <Text style={styles.hint}>{t('The phone vibrates at every change. You can close your eyes.')}</Text>
      <Gap size={Spacing.lg} />
      <Button
        title={running ? t('Stop') : t('Start')}
        variant={running ? 'outline' : 'primary'}
        onPress={() => setRunning(!running)}
      />
    </View>
  );
}

// ---------- Butterfly tapping ----------

const BUTTERFLY_SECONDS = 90;
const TAP_MS = 900;

export function ButterflyPlayer({ exercise, onFinish }: PlayerProps) {
  const t = useT();
  const voice = useVoice();
  const [running, setRunning] = useState(false);
  const [listening, setListening] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const show = (s: 'left' | 'right') => {
      setSide(s);
      vibrate(s === 'left' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    };

    const tapping = () => {
      const start = Date.now();
      let left = true;
      let cue = 0;
      timer = setInterval(() => {
        left = !left;
        show(left ? 'left' : 'right');
        const secs = Math.floor((Date.now() - start) / 1000);
        setElapsed(secs);
        if (cue === 0 && secs >= BUTTERFLY_SECONDS / 2) {
          cue = 1;
          voice.play(TAP_CUES.keepGoing);
        } else if (cue === 1 && secs >= BUTTERFLY_SECONDS - 8) {
          cue = 2;
          voice.play(TAP_CUES.stop);
        }
        if (secs >= BUTTERFLY_SECONDS) {
          setRunning(false);
          onFinish();
        }
      }, TAP_MS);
    };

    (async () => {
      // Carina's intro, then she sets the rhythm: "Left" … "Right" … and the tapping takes over.
      setListening(true);
      await voice.play(EXERCISE_VOICE[exercise.id]);
      setListening(false);
      for (const s of ['left', 'right'] as const) {
        if (cancelled || !voice.has(TAP_CUES[s])) break;
        show(s);
        await voice.play(TAP_CUES[s]);
      }
      if (!cancelled) tapping();
    })();

    return () => {
      cancelled = true;
      voice.stop();
      setListening(false);
      clearInterval(timer);
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.center}>
      <View style={styles.wings}>
        <View style={[styles.wing, running && side === 'left' && styles.wingActive]}>
          <Text style={styles.wingText}>{t('L')}</Text>
        </View>
        <View style={[styles.wing, running && side === 'right' && styles.wingActive]}>
          <Text style={styles.wingText}>{t('R')}</Text>
        </View>
      </View>
      <Text style={styles.counter}>
        {listening ? t('Listen…') : running ? `${BUTTERFLY_SECONDS - elapsed}s` : t('{n} seconds', { n: BUTTERFLY_SECONDS })}
      </Text>
      <Text style={styles.hint}>{t('Tap the side that lights up. Strong vibration = left, soft = right.')}</Text>
      <Gap size={Spacing.lg} />
      <Button
        title={running ? t('Stop') : t('Start')}
        variant={running ? 'outline' : 'primary'}
        onPress={() => {
          setElapsed(0);
          setRunning(!running);
        }}
      />
    </View>
  );
}

// ---------- Humming with microphone feedback ----------

const HUM_GOAL_SECONDS = 60;
/** dBFS above which we count it as humming. */
const HUM_THRESHOLD = -35;

export function HumPlayer({ exercise, onFinish }: PlayerProps) {
  const t = useT();
  const voice = useVoice();
  const [listening, setListening] = useState(false);
  const skipped = useRef(false);
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100);
  const [error, setError] = useState<string | null>(null);
  const [humMs, setHumMs] = useState(0);
  const [level] = useState(() => new Animated.Value(0.4));
  const lastTick = useRef(0);

  const db = state.metering ?? -160;
  const humming = state.isRecording && db > HUM_THRESHOLD;

  useEffect(() => {
    if (!state.isRecording) return;
    // Map roughly -60..0 dB to 0.4..1 circle scale.
    const normalized = Math.min(1, Math.max(0, (db + 60) / 60));
    Animated.timing(level, { toValue: 0.4 + normalized * 0.6, duration: 100, useNativeDriver: true }).start();
    const now = Date.now();
    if (humming) setHumMs((ms) => ms + (now - lastTick.current));
    lastTick.current = now;
  }, [state.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (humMs >= HUM_GOAL_SECONDS * 1000 && state.isRecording) {
      recorder.stop();
      vibrate(Haptics.ImpactFeedbackStyle.Heavy);
      onFinish();
    }
  }, [humMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null);
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError(t('The microphone is needed to give feedback on your hum. Nothing is saved or sent.'));
      return;
    }
    // Carina's intro first; the microphone only listens once she has finished.
    setListening(true);
    skipped.current = false;
    await voice.play(EXERCISE_VOICE[exercise.id]);
    setListening(false);
    if (skipped.current) return;
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    lastTick.current = Date.now();
    recorder.record();
  };

  return (
    <View style={styles.center}>
      <View style={styles.circleOuter}>
        <Animated.View
          style={[
            styles.circle,
            { backgroundColor: humming ? Colors.sage : Colors.sageLight, transform: [{ scale: level }] },
          ]}
        />
        <Text style={styles.phase}>{listening ? t('Listen…') : state.isRecording ? (humming ? 'Voooo…' : t('Hum low')) : t('Ready')}</Text>
      </View>
      <Text style={styles.counter}>
        {t('{n} / {total} seconds of humming', { n: Math.floor(humMs / 1000), total: HUM_GOAL_SECONDS })}
      </Text>
      <Text style={styles.hint}>{t('The microphone only listens to the volume. Nothing is recorded or sent.')}</Text>
      {error && <Body style={{ color: Colors.danger, textAlign: 'center' }}>{error}</Body>}
      <Gap size={Spacing.lg} />
      <Button
        title={state.isRecording || listening ? t('Stop') : t('Start humming')}
        variant={state.isRecording || listening ? 'outline' : 'primary'}
        onPress={() => {
          if (listening) {
            skipped.current = true;
            voice.stop();
          } else if (state.isRecording) recorder.stop();
          else start().catch((e) => setError(String(e)));
        }}
      />
    </View>
  );
}

// ---------- Guided steps ----------

export function GuidedPlayer({ exercise, onFinish }: PlayerProps) {
  const t = useT();
  const voice = useVoice();
  const code = EXERCISE_VOICE[exercise.id];
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const last = step === exercise.steps.length - 1;

  const listen = async () => {
    if (listening) return voice.stop();
    setListening(true);
    await voice.play(code);
    setListening(false);
  };

  return (
    <View>
      {voice.has(code) && (
        <>
          <Button
            title={listening ? t('Stop the voice') : t('Listen to Carina')}
            variant="outline"
            onPress={listen}
          />
          <Gap size={Spacing.md} />
        </>
      )}
      <Text style={styles.counter}>
        {t('Step {n} of {total}', { n: step + 1, total: exercise.steps.length })}
      </Text>
      <Gap size={Spacing.sm} />
      <View style={styles.stepCard}>
        <Text style={styles.stepText}>{exercise.steps[step]}</Text>
      </View>
      <Gap size={Spacing.lg} />
      <Button
        title={last ? t('Finish') : t('Next')}
        onPress={() => {
          vibrate();
          if (last) onFinish();
          else setStep(step + 1);
        }}
      />
      {step > 0 && (
        <>
          <Gap size={Spacing.sm} />
          <Button title={t('Back')} variant="outline" onPress={() => setStep(step - 1)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'stretch' },
  circleOuter: { height: 260, alignItems: 'center', justifyContent: 'center' },
  circle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.sageLight,
    borderWidth: 2,
    borderColor: Colors.sage,
  },
  phase: { fontFamily: Fonts.serifItalic, fontSize: 28, color: Colors.ink, textAlign: 'center' },
  counter: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.lavender, textAlign: 'center', letterSpacing: 1 },
  hint: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.muted, textAlign: 'center', marginTop: Spacing.sm },
  wings: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, height: 200, alignItems: 'center' },
  wing: {
    width: 120,
    height: 160,
    borderRadius: 60,
    backgroundColor: Colors.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wingActive: { backgroundColor: Colors.lavender },
  wingText: { fontFamily: Fonts.serif, fontSize: 32, color: Colors.white },
  stepCard: {
    backgroundColor: Colors.creamLight,
    borderRadius: 20,
    padding: Spacing.xl,
    minHeight: 180,
    justifyContent: 'center',
  },
  stepText: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 34, color: Colors.ink, textAlign: 'center' },
});
