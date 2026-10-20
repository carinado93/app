/**
 * Carina's voice recordings. Each exercise has a code (R05 = Physiological Sigh …), see docs/AUDIO.md.
 * Recordings that are not in the app yet are simply skipped, so every screen also works without them.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { VOICE, VOICE_STEPS } from '@/data/voice';
import { useLang } from '@/i18n';

/** Recording code of each exercise, in the order of the recording scripts. */
export const EXERCISE_VOICE: Record<string, string> = {
  sigh: 'R05',
  butterfly: 'R06',
  orienting: 'R07',
  box: 'R08',
  'long-exhale': 'R09',
  hum: 'R10',
  shake: 'R11',
  affirmations: 'R12',
  energize: 'R13',
  grounding: 'R14',
  feet: 'R15',
  'self-hold': 'R16',
  'name-it': 'R17',
  coherent: 'R18',
  'body-scan': 'R19',
  pmr: 'R20',
  'jaw-release': 'R21',
  panoramic: 'R22',
  'heel-drop': 'R23',
  rocking: 'R24',
  'worry-container': 'R25',
  'safe-place': 'R26',
  'three-good': 'R27',
  'wake-stretch': 'R28',
  'eye-palming': 'R29',
  'sleep-wind-down': 'R30',
};

export const WELCOME_VOICE = 'R01';
export const SOS_VOICE = 'R02';

/** Breathing cue for each phase of the breathing circle. */
export const BREATH_CUES = {
  inhale: 'R03-breathe-in',
  hold: 'R03-hold',
  exhale: 'R03-breathe-out',
  rest: 'R03-rest',
  lastRound: 'R03-one-more-time',
  done: 'R03-well-done',
} as const;

export const TAP_CUES = {
  left: 'R04-left',
  right: 'R04-right',
  keepGoing: 'R04-keep-tapping-slowly',
  stop: 'R04-slowly-come-to-a-stop',
} as const;

/**
 * One voice per screen: `play(code)` stops whatever is playing and resolves when the new clip ends
 * (or right away if the recording is missing or playback is stopped). Stops on leaving the screen.
 */
export function useVoice() {
  const lang = useLang();
  const player = useRef<AudioPlayer | null>(null);
  const loaded = useRef<number | null>(null);
  const finish = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      finish.current?.();
      player.current?.remove();
      player.current = null;
      loaded.current = null;
    };
  }, []);

  const has = (code: string) => code in VOICE[lang];
  /** Step start times if this recording plays as one piece (see VOICE_STEPS), else undefined. */
  const steps = (code: string): number[] | undefined => VOICE_STEPS[lang][code];

  const stop = () => {
    player.current?.pause();
    finish.current?.();
    finish.current = null;
  };

  const play = (code: string, onTime?: (seconds: number) => void) =>
    new Promise<void>((resolve) => {
      stop();
      const source = VOICE[lang][code];
      if (!source || !mounted.current) return resolve();
      setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
      if (!player.current) player.current = createAudioPlayer(source);
      else if (loaded.current !== source) player.current.replace(source);
      else player.current.seekTo(0).catch(() => {});
      loaded.current = source;
      const p = player.current;
      const sub = p.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish) done();
        else onTime?.(s.currentTime);
      });
      const done = () => {
        sub.remove();
        if (finish.current === done) finish.current = null;
        resolve();
      };
      finish.current = done;
      p.play();
    });

  return { play, stop, has, steps };
}

/**
 * Exercises with calm music under the voice and the pauses (added as Carina tests them).
 * Humming measures the room with the music playing, so the music is not counted as humming.
 */
export const WITH_MUSIC = new Set(['sigh', 'butterfly', 'orienting', 'box', 'long-exhale', 'hum', 'shake', 'affirmations']);

// Generated with tools/audio/make_ambient.py --loop: instrumental, no licence needed.
const CALM_MUSIC = require('../../assets/audio/music/calm.m4a');
const MUSIC_VOLUME = 0.18;

/** Quiet looping music while `on`; fades in over 3 s and out over 1.5 s. */
export function useMusic(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const player = createAudioPlayer(CALM_MUSIC);
    player.loop = true;
    player.volume = 0;
    player.play();
    let step = 0;
    const fadeIn = setInterval(() => {
      step += 1;
      player.volume = (MUSIC_VOLUME * step) / 30;
      if (step >= 30) clearInterval(fadeIn);
    }, 100);
    return () => {
      clearInterval(fadeIn);
      let v = player.volume;
      const fadeOut = setInterval(() => {
        v -= MUSIC_VOLUME / 15;
        if (v > 0) player.volume = v;
        else {
          clearInterval(fadeOut);
          player.remove();
        }
      }, 100);
    };
  }, [on]);
}

const TAP_SOUNDS = {
  left: require('../../assets/audio/music/tap-left.m4a'),
  right: require('../../assets/audio/music/tap-right.m4a'),
};

/** Soft wooden tap per side (tools/audio/make_taps.py), so the rhythm is heard even when the phone lies on the lap. */
export function useTapSounds() {
  const players = useRef<Record<'left' | 'right', AudioPlayer> | null>(null);

  useEffect(() => {
    players.current = { left: createAudioPlayer(TAP_SOUNDS.left), right: createAudioPlayer(TAP_SOUNDS.right) };
    players.current.left.volume = 0.6;
    players.current.right.volume = 0.6;
    return () => {
      players.current?.left.remove();
      players.current?.right.remove();
      players.current = null;
    };
  }, []);

  return (side: 'left' | 'right') => {
    const p = players.current?.[side];
    if (!p) return;
    p.seekTo(0).catch(() => {});
    p.play();
  };
}
