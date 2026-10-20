/** Interactive exercise players: breathing, butterfly tapping and guided steps. */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, Vibration, View } from 'react-native';

import { Button, Gap } from '@/components/ui';
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
