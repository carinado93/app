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
import { Animated, Easing, Platform, StyleSheet, Text, Vibration, View } from 'react-native';

import { Body, Button, Gap } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { BreathPattern, Exercise } from '@/data/exercises';
import { useT } from '@/i18n';
import {
  BREATH_CUES,
  EXERCISE_VOICE,
  SOS_VOICE,
  TAP_CUES,
  useMusic,
  useTapSounds,
  useVoice,
  WITH_MUSIC,
} from '@/lib/voice';

/** `sos`: opened from "I need calm now": Carina's SOS words instead of the intro, and it starts by itself. */
type PlayerProps = { exercise: Exercise; onFinish: () => void; sos?: boolean };

const vibrate = (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

/** A clear buzz you feel with eyes closed: Android haptic taps are too faint for that. */
const pulse = (ms: number | number[]) => {
  if (Platform.OS === 'android') Vibration.vibrate(ms);
  else vibrate(Haptics.ImpactFeedbackStyle.Heavy);
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
  useMusic(running && WITH_MUSIC.has(exercise.id));
  const [label, setLabel] = useState('Ready?');
  const [round, setRound] = useState(0);
  const [secsLeft, setSecsLeft] = useState(0);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Seconds left in the current phase, shown in the circle (4, 3, 2, 1).
    let phaseEnd = 0;
    const clock = setInterval(() => setSecsLeft(Math.max(0, Math.ceil((phaseEnd - Date.now()) / 1000))), 200);

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
      phaseEnd = Date.now() + seconds * 1000;
      setSecsLeft(seconds);
      // Spoken cue; too short phases (the extra sip of the sigh) stay silent.
      if (i === 0 && r === rounds - 1 && rounds > 1) voice.play(BREATH_CUES.lastRound);
      else if (seconds >= 2) voice.play(BREATH_CUES[phase.key]);
      // Vibration at every phase change, so it also works with eyes closed: longer for breathing in.
      pulse(phase.key === 'inhale' ? 400 : 250);
      Animated.timing(scale, {
        toValue: phase.scale,
        duration: seconds * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
      timers.push(setTimeout(() => runPhase(r, i + 1), seconds * 1000));
    };

    const finish = async () => {
      phaseEnd = 0;
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
      clearInterval(clock);
      setSecsLeft(0);
      timers.forEach(clearTimeout);
      scale.stopAnimation();
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.center}>
      <View style={styles.circleOuter}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
        <Text style={styles.phase}>{t(label)}</Text>
        {running && secsLeft > 0 && <Text style={styles.seconds}>{secsLeft}</Text>}
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
  useMusic(running && WITH_MUSIC.has(exercise.id));
  const tapSound = useTapSounds();

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const show = (s: 'left' | 'right') => {
      setSide(s);
      tapSound(s);
      // On the lap vibration strength gets lost, so the sides differ by rhythm:
      // left = one long buzz, right = two short ones.
      if (Platform.OS === 'android') pulse(s === 'left' ? 350 : [0, 120, 90, 120]);
      else vibrate(s === 'left' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
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
          clearInterval(timer);
          voice.play(BREATH_CUES.done).then(() => {
            if (cancelled) return;
            setRunning(false);
            onFinish();
          });
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
      <Text style={styles.hint}>{t('Tap the side that lights up. Low tone and one long buzz = left, higher tone and two short buzzes = right.')}</Text>
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
/** Ends by itself after this long even if not all humming was counted. */
const HUM_MAX_SECONDS = 120;
const CALIBRATE_MS = 2000;
/** Louder than the room (measured while breathing in, music included) by this much counts as humming. */
const HUM_ABOVE_ROOM_DB = 8;

export function HumPlayer({ exercise, onFinish }: PlayerProps) {
  const t = useT();
  const voice = useVoice();
  const [phase, setPhase] = useState<'idle' | 'intro' | 'calibrate' | 'hum'>('idle');
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100);
  const [error, setError] = useState<string | null>(null);
  const [humMs, setHumMs] = useState(0);
  const [humming, setHumming] = useState(false);
  const [level] = useState(() => new Animated.Value(0.4));
  const db = useRef(-160);
  useMusic(phase !== 'idle' && WITH_MUSIC.has(exercise.id));

  const stopIntro = useRef<(() => void) | null>(null);

  const stopRecording = () => {
    if (recorder.isRecording) recorder.stop().catch(() => {});
  };

  const finish = async () => {
    stopRecording();
    setHumming(false);
    vibrate(Haptics.ImpactFeedbackStyle.Heavy);
    await voice.play(BREATH_CUES.done);
    setPhase('idle');
    onFinish();
  };

  useEffect(() => {
    db.current = state.metering ?? -160;
    if (!state.isRecording) return;
    // Map roughly -60..0 dB to 0.4..1 circle scale.
    const normalized = Math.min(1, Math.max(0, (db.current + 60) / 60));
    Animated.timing(level, { toValue: 0.4 + normalized * 0.6, duration: 100, useNativeDriver: true }).start();
  }, [state.metering]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'calibrate') return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const room: number[] = [];
    const sample = setInterval(() => room.push(db.current), 100);
    const go = setTimeout(() => {
      clearInterval(sample);
      if (cancelled) return;
      room.sort((x, y) => x - y);
      const threshold = Math.max((room[Math.floor(room.length / 2)] ?? -160) + HUM_ABOVE_ROOM_DB, -70);
      setPhase('hum');
      const started = Date.now();
      let counted = 0;
      timer = setInterval(() => {
        const on = db.current > threshold;
        setHumming(on);
        if (on) counted += 100;
        setHumMs(counted);
        if (counted >= HUM_GOAL_SECONDS * 1000 || Date.now() - started >= HUM_MAX_SECONDS * 1000) {
          clearInterval(timer);
          finish();
        }
      }, 100);
    }, CALIBRATE_MS);
    return () => {
      cancelled = true;
      clearInterval(sample);
      clearTimeout(go);
      clearInterval(timer);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null);
    setHumMs(0);
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setError(t('The microphone is needed to give feedback on your hum. Nothing is saved or sent.'));
      return;
    }
    // Carina's intro first; the microphone only listens once she has finished.
    setPhase('intro');
    let skipped = false;
    stopIntro.current = () => {
      skipped = true;
      voice.stop();
    };
    await voice.play(EXERCISE_VOICE[exercise.id]);
    stopIntro.current = null;
    if (skipped) return setPhase('idle');
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setPhase('calibrate');
  };

  const label =
    phase === 'intro'
      ? t('Listen…')
      : phase === 'calibrate'
        ? t('Breathe in…')
        : phase === 'hum'
          ? humming
            ? 'Voooo…'
            : t('Hum low')
          : t('Ready');

  return (
    <View style={styles.center}>
      <View style={styles.circleOuter}>
        <Animated.View
          style={[
            styles.circle,
            { backgroundColor: humming ? Colors.sage : Colors.sageLight, transform: [{ scale: level }] },
          ]}
        />
        <Text style={styles.phase}>{label}</Text>
      </View>
      <Text style={styles.counter}>
        {t('{n} / {total} seconds of humming', { n: Math.floor(humMs / 1000), total: HUM_GOAL_SECONDS })}
      </Text>
      <Text style={styles.hint}>{t('The microphone only listens to the volume. Nothing is recorded or sent.')}</Text>
      {error && <Body style={{ color: Colors.danger, textAlign: 'center' }}>{error}</Body>}
      <Gap size={Spacing.lg} />
      {phase === 'idle' ? (
        <Button title={t('Start humming')} onPress={() => start().catch((e) => setError(String(e)))} />
      ) : phase === 'intro' ? (
        <Button title={t('Stop')} variant="outline" onPress={() => stopIntro.current?.()} />
      ) : (
        <Button title={t('Finish')} variant="outline" onPress={() => finish()} />
      )}
    </View>
  );
}

// ---------- Guided steps ----------

export function GuidedPlayer(props: PlayerProps) {
  const voice = useVoice();
  const starts = voice.steps(EXERCISE_VOICE[props.exercise.id]);
  return starts ? <GuidedTrack {...props} starts={starts} /> : <GuidedSteps {...props} />;
}

/** Carina's recording as one piece with music: the step text follows her voice, nothing to tap. */
function GuidedTrack({ exercise, onFinish, starts }: PlayerProps & { starts: number[] }) {
  const t = useT();
  const voice = useVoice();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  useMusic(running && WITH_MUSIC.has(exercise.id));

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    voice
      .play(EXERCISE_VOICE[exercise.id], (sec) => {
        let i = -1;
        while (i + 1 < starts.length && sec >= starts[i + 1]) i++;
        setStep(i);
      })
      .then(() => {
        if (cancelled) return;
        setRunning(false);
        onFinish();
      });
    return () => {
      cancelled = true;
      voice.stop();
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View>
      <Text style={styles.counter}>
        {running && step >= 0
          ? t('Step {n} of {total}', { n: step + 1, total: exercise.steps.length })
          : running
            ? t('Listen…')
            : t('{n} steps', { n: exercise.steps.length })}
      </Text>
      <Gap size={Spacing.sm} />
      <View style={styles.stepCard}>
        <Text style={styles.stepText}>{running && step >= 0 ? exercise.steps[step] : exercise.summary}</Text>
      </View>
      <Text style={styles.hint}>{t('Carina guides you through every step. You can put the phone down.')}</Text>
      <Gap size={Spacing.lg} />
      <Button
        title={running ? t('Stop') : t('Start')}
        variant={running ? 'outline' : 'primary'}
        onPress={() => {
          setStep(-1);
          setRunning(!running);
        }}
      />
    </View>
  );
}

/** Steps with Next; a Listen button when there is a recording that is not split into steps. */
function GuidedSteps({ exercise, onFinish }: PlayerProps) {
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
  seconds: { fontFamily: Fonts.sansLight, fontSize: 40, color: Colors.ink, marginTop: 4 },
  stepText: { fontFamily: Fonts.serif, fontSize: 26, lineHeight: 34, color: Colors.ink, textAlign: 'center' },
});
