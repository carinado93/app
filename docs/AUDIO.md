# Voice recordings: how to process Carina's audio

Scripts: R01–R30 (English + German), see the "Recording Scripts" page.
Files arrive named by code and language, e.g. `R07 EN`, `R03 DE Einatmen`.

## Carina's wishes (always apply)

1. **Remove the microphone beep** at the start and the end of every file.
   Carina waits ~2 s after the beep before speaking and ~2 s after the last word.
2. **Leave a short, clean silence** at both ends (~0.5 s) and fade the edges gently (~50 ms) so nothing sounds clipped.
3. **Make pauses long enough.** Carina speaks naturally; we add silence where the body needs time:
   - After every *hold* instruction, insert the full hold time before the release
     (e.g. "Hold for 5 seconds…" → 5 s silence → "…and release").
   - After every step of a guided exercise, make sure there is enough time to actually do it
     (see the table below). If her natural pause is shorter, extend it with silence.
4. **Separate files per word** for R03 (breathing cues) and R04 (tapping cues). If one file holds several words,
   split at the silences in the order of the script and report the number of pieces found.
5. **Same loudness everywhere**: normalise all files to about −16 LUFS so the app never jumps in volume.

## Retakes

Carina says **"again"** (also in the German files) when she makes a mistake, then repeats the whole sentence.
The faulty first try and the "again" are removed; only the second version stays. A clap works the same way.

## Tool

`tools/audio/clean_recordings.py` does steps 1, 2, 3 (fully for R30, partly for the rest) and 5 automatically and prints a report per file:
beeps removed, every retake it cut (with time and the removed text) and the full transcript of what stays.
It recognises speech locally with Whisper (sherpa-onnx, model `sherpa-onnx-whisper-small`), see the setup notes
at the top of the script. Check the report: a retake marked `"sure": false` should be listened to.

## Notes from Carina per recording

- **R23 Heel Drops:** probably an "again" retake around "Let yourself drop softly onto your heels". Check that it was cut.
  After "Repeat 15–20 times" the pause must be long enough to actually do 15–20 heel drops (about 20 s).
- **R26 Safe Place:** "again" retake right after the first sentence, then the first sentence is repeated.
  Check that the first try and the "again" were cut and only the second version of the first sentence stays.

## Minimum pause after each step (guided exercises)

| Code | Exercise | Pause after each step |
|---|---|---|
| R07 | Orienting | 8 s |
| R11 | Shake It Off | 6 s; 20 s after "Shake a little stronger for 20 seconds" |
| R12 | Calming Affirmations | 6 s after each affirmation (one slow breath out) |
| R14 | 5-4-3-2-1 Grounding | 12 s (time to name the things) |
| R15 | Invisible Feet Push | 5 s hold after "Press… for 5 seconds", 4 s after "Release" |
| R16 | Self-Hold | 8 s |
| R17 | Name It to Tame It | 6 s |
| R19 | Quick Body Scan | 10 s |
| R20 | Tense & Release | 5 s after each "Hold…", then 6 s after each "…release" |
| R21 | Jaw & Shoulder Release | 6 s |
| R22 | Panoramic Vision | 8 s |
| R23 | Heel Drops | 20 s after "Repeat 15–20 times" (enough for 15–20 heel drops) |
| R24 | Gentle Rocking | 10 s |
| R25 | Worry Container | 10 s |
| R26 | Safe Place | 12 s |
| R27 | Three Good Things | 10 s |
| R28 | Wake-Up Stretch | 8 s |
| R29 | Eye Palming | 5 slow breaths (~25 s) after "Enjoy the darkness" |
| R30 | Sleep Wind-Down | see below: one piece with countdown ticks |

## R30 Sleep Wind-Down: one piece, no tapping

Carina's wish: in bed nobody should have to pick up the phone to tap "Next". R30 is one continuous track
(also in the app: when voice audio is added, it plays from start to end without a Next button).
Each pause is as long as the step needs and ends with a soft **tick, tick, tick** countdown
(one tick per second, the last one 1 s before she speaks again). The tool does this automatically
from `PLANS` in `tools/audio/clean_recordings.py` and lists in the report whether each step was found
(`"found": false` → check that spot by ear).

| Pause before… | Length | Why |
|---|---|---|
| "Put today's worries…" | 10 s | settle in |
| "Breathe in for 4 and out for 8. Five times." | 15 s | close the container |
| "Tense your whole body…" | 65 s | 5 × (4 in + 8 out) and a little air |
| "…and let go completely." | 5 s | the 5-second hold |
| "Think of three good things…" | 10 s | let go |
| "Let your body get heavy…" | 20 s | three good things |
| "There is nothing more to do today…" | 15 s | heaviness |

Breathing exercises (R05 Sigh, R08 Box, R09 4-7-8, R13 Wake-Up Breath, R18 Coherent) use only the intro
recording plus the R03 cue clips; the app times the breathing itself.

## In the app

Audio files go in `assets/audio/<lang>/<code>.m4a`. Install cleaned files with
`python tools/audio/install_voice.py cleaned/*.m4a`: it gives them standard names (`R05.m4a`, `R03-breathe-in.m4a`;
`r1` → `R01`, the typo `E28` → `R28`) and regenerates `src/data/voice.ts`. Missing recordings are skipped by the app.

Exercise → code: see `EXERCISE_VOICE` in `src/lib/voice.ts` (R05 Physiological Sigh … R30 Sleep Wind-Down,
same order as `src/data/exercises.ts`). R01 = welcome (Listen button on the first onboarding page),
R02 = SOS ("I need calm now" opens the sigh with R02 instead of R05 and starts by itself).

- Breathing: intro, then the circle with the R03 cue at each phase change (phases under 2 s stay silent),
  "One more time" at the start of the last round and "Well done" at the end.
- Butterfly Hug: intro, then "Left" … "Right" to set the rhythm, "Keep tapping slowly" halfway,
  "Slowly come to a stop" 8 s before the end.
- Humming: intro, then the microphone starts.
- Guided with a plan in `PLANS` (R07 Orienting, R30 Sleep Wind-Down): one continuous track with the pauses
  from the table, calm music, and the step text follows her voice (step times from `<name>.steps.json`,
  written by the cleaner and copied by `install_voice.py` into `VOICE_STEPS`). Nothing to tap.
- Other guided recordings: a "Listen to Carina" button plays the recording; the steps still have Next.
- Retakes also caught: "again" at the end of the sentence without a pause, and a false start followed by a
  short "Okay" / "Sorry" when the sentence is then repeated.

## Music and phone behaviour

- Exercises in `WITH_MUSIC` (`src/lib/voice.ts`) play `assets/audio/music/calm.m4a` quietly in a loop
  (volume 0.18, fades in 3 s) from the intro to the end. Instrumental, generated with
  `tools/audio/make_ambient.py --loop`, so no licence is needed. Carina adds exercises one at a time after testing.
- The exercise screen keeps the phone awake (`expo-keep-awake`), so the screen and the voice do not stop.
- Breathing vibration: 400 ms buzz for breathing in, 250 ms for the other phases (Android).

## Recording quality notes

The raw files are quiet (speech peaks around −36 dB over −52 dB room noise) and have low rumble.
The tool high-passes at 70 Hz and adapts the speech threshold per file. Carina's recorder does not beep:
only high pure tones (> 500 Hz) count as beeps, and a short sound touching the very start or end of a file
is treated as the record/stop tap. Cue words (R03/R04) start right on the phase change (no lead-in).
Anything after "Let's begin" / "Take a moment to notice how you feel" is cut.

Cutting: every sentence keeps a generous margin of the original (0.25 s before, 0.45 s after), because the ends of
words like "seconds", "rest", "gently" are quiet hissing sounds that any volume threshold takes for silence (a tighter
cut against the room echo cut them off). Sentences that follow each other stay one continuous piece of the original;
silence is only inserted for a planned pause or where a retake was removed, with short fades on the quiet margins.
Self-check: if Whisper hears a word more at the end with an even wider margin, the piece is extended.
The low room echo behind her voice comes from the room and the recorder's noise gate; the music covers most of it.
For new recordings: switch off the recorder's noise gate and record close to the mic in a soft-furnished room.

## Before anything goes to Carina

1. `python tools/audio/check_audio.py --model … --report report.json --raw <originals> --cleaned <cleaned>`:
   Whisper compares original and cleaned file word by word; it fails on any missing word and on a retake whose
   sentence is not said again (so a good sentence can never be cut by mistake). One little word ("to") is only
   reported as "listen".
2. `tools/check_before_build.sh`: typecheck, lint and a full Android bundle that must contain every recording.
