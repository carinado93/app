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

`tools/audio/clean_recordings.py` does steps 1, 2, 3 (partly) and 5 automatically and prints a report per file:
beeps removed, every retake it cut (with time and the removed text) and the full transcript of what stays.
It recognises speech locally with Whisper (sherpa-onnx, model `sherpa-onnx-whisper-small`), see the setup notes
at the top of the script. Check the report: a retake marked `"sure": false` should be listened to.

## Notes from Carina per recording

- **R23 Heel Drops:** probably an "again" retake around "Let yourself drop softly onto your heels". Check that it was cut.
  After "Repeat 15–20 times" the pause must be long enough to actually do 15–20 heel drops (about 20 s).

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
| R30 | Sleep Wind-Down | 10 s; ~60 s after "Breathe in for 4 and out for 8. Five times." |

Breathing exercises (R05 Sigh, R08 Box, R09 4-7-8, R13 Wake-Up Breath, R18 Coherent) use only the intro
recording plus the R03 cue clips; the app times the breathing itself.

## In the app

Audio files go in `assets/audio/<lang>/<code>.m4a`. The exercise player plays the intro, then the steps
with the pauses above, and the breathing player plays the R03 cue at each phase change.
