"""
Clean Carina's voice recordings for the app.

For every input file:
  1. removes the microphone beep at the start and the end,
  2. finds retakes: when she says "again" (or "nochmal" / "noch einmal"), the sentence before it is
     cut out together with the "again", so only the second, clean version stays,
  3. evens out the loudness (about -16 LUFS), trims to 0.5 s of silence at both ends and fades the edges,
  5. with --music: lays calm music quietly under the whole track, a little lower while she speaks
     (make some with tools/audio/make_ambient.py or use your own file),
  4. for recordings in PLANS (e.g. R30, played as one piece without tapping "Next"): stretches the pause
     after each step to the time the body needs and ends it with a soft tick-tick-tick countdown.

Speech is recognised locally with Whisper (sherpa-onnx), nothing is uploaded anywhere.

Setup (once):
  pip install sherpa-onnx numpy soundfile
  curl -L -o whisper.tar.bz2 \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
  tar xjf whisper.tar.bz2

Usage:
  python tools/audio/clean_recordings.py --model sherpa-onnx-whisper-small --out cleaned/ "R19 DE.m4a" ...
  Add --music ambient.m4a for background music (e.g. R30 Sleep Wind-Down).
  The language is taken from the file name (EN / DE), default English.
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx

SR = 16000
FRAME = 0.02  # analysis frame, seconds
RETAKE_WORDS = {'again', 'nochmal', 'noch mal', 'noch einmal', 'einmal', 'nochmals'}
# Said after a false start ("Box breathing. Okay. Box breathing."): only a retake when the sentence is repeated.
END_PHRASES = ["Let's begin", 'Take a moment to notice how you feel', "Lass uns beginnen", 'Nimm dir einen Moment']
SOFT_MARKERS = {'okay', 'ok', 'sorry', 'entschuldigung'}

# Recordings played as one piece, without tapping "Next".
# Each entry: (start of the sentence in EN, in DE or None, seconds of pause before it, index of the step in
# src/data/exercises.ts that begins there or None). The report and a <name>.steps.json file give the time each
# step starts in the cleaned file, so the app can show the step text along with the voice.
# With 'ticks', every planned pause ends with TICKS soft ticks, one per second, then the next sentence starts.
PLANS = {
    'R07': {  # Orienting: 8 s after each step
        'ticks': False,
        'steps': [
            ('Let your head and eyes move', None, 3, 0),
            ('Find something with', None, 8, 1),
            ('Now find something with an interesting texture', None, 8, 2),
            ('Notice the sound far away', None, 8, 3),
            ('then a sound close by', None, 6, None),
            ('Notice your feet on the ground', None, 8, 4),
            ('Well done', None, 8, None),
        ],
    },
    'R11': {  # Shake It Off: 6 s after each step, 20 s of stronger shaking
        'ticks': False,
        'steps': [
            ('Stand up', None, 3, 0),
            ('Let the shaking move', None, 6, 1),
            ('and now add your legs', None, 6, 2),
            ('Shake a little stronger', None, 6, 3),
            ('Now stop', None, 20, 4),
            ('Well done', None, 6, None),
        ],
    },
    'R12': {  # Calming Affirmations: time to breathe in, then 6 s after each affirmation (one slow breath out)
        'ticks': False,
        'steps': [
            ('Put one hand on your heart', None, 3, 0),
            ('as you breathe out', None, 4, 1),
            ('Breathe in', None, 6, 2),
            ('as you breathe out', None, 4, None),
            ('Breathe in', None, 6, 3),
            ('and as you breathe out', None, 4, None),
            ('Breathe in again', None, 6, 4),
            ('and as you breathe out', None, 4, None),
            ('Choose the sentence', None, 6, 5),
            ('Well done', None, 15, None),  # time to say it three more times, slowly
        ],
    },
    'R14': {  # 5-4-3-2-1 Grounding: 12 s to find the things
        'ticks': False,
        'steps': [
            ('Name five things you can see', None, 3, 0),
            ('Name four things you can feel', None, 12, 1),
            ('Name three things', None, 12, 2),
            ('Name two things', None, 12, 3),
            ('And name one thing', None, 12, 4),
            ('Well done', None, 12, None),
        ],
    },
    'R15': {  # Invisible Feet Push: 5 s pressing, 4 s after releasing, time for three more rounds
        'ticks': False,
        'steps': [
            ('Press both feet firmly', None, 3, 0),
            ('Release and notice', None, 5, 1),
            ('Repeat it three times', None, 4, 2),
            ('Well done|Well then', None, 25, None),
        ],
    },
    'R30': {  # Sleep Wind-Down
        'ticks': True,
        'steps': [
            ("Put today's worries", 'Leg die Sorgen', 10, 1),
            ('Breathe in for 4 and out', 'Atme 4 Sekunden ein', 15, 2),
            ('Tense your whole body', 'Spanne deinen ganzen', 65, 3),  # 5 x (4 in + 8 out) and a little air
            ('and let go completely', 'und lass ganz los', 5, None),  # the 5-second hold
            ('Think of three good things', 'Denk an drei gute', 10, 4),
            ('Let your body get heavy', 'Lass deinen Körper', 20, 5),
            ('There is nothing more', 'Heute gibt es nichts', 15, 6),
        ],
    },
}
TICKS = 3


def load(path: Path, sr=SR) -> np.ndarray:
    """Decode any audio file to mono float32 with ffmpeg."""
    raw = subprocess.run(
        # High-pass: removes rumble and DC offset, which otherwise hide quiet words and fake "beeps".
        ['ffmpeg', '-v', 'error', '-i', str(path), '-af', 'highpass=f=70', '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def frame_db(x: np.ndarray, sr=SR) -> np.ndarray:
    n = int(FRAME * sr)
    frames = x[: len(x) // n * n].reshape(-1, n)
    return 20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-9)


def segments(x: np.ndarray, sr=SR, min_silence=0.35, min_sound=0.03):
    """Non-silent stretches as (start, end) seconds. Threshold adapts to the room noise."""
    db = frame_db(x, sr)
    noise = np.percentile(db, 10)
    # Quiet recordings: speech may be only ~15 dB above the room, so stay below the loudest part.
    thr = max(noise + min(12, 0.4 * (db.max() - noise)), -50)
    loud = db > thr
    segs, start, quiet = [], None, 0
    gap = int(min_silence / FRAME)
    for i, on in enumerate(loud):
        if on:
            if start is None:
                start = i
            quiet = 0
        elif start is not None:
            quiet += 1
            if quiet >= gap:
                end = i - quiet + 1
                if (end - start) * FRAME >= min_sound:
                    segs.append([start * FRAME, end * FRAME])
                start, quiet = None, 0
    if start is not None:
        segs.append([start * FRAME, len(loud) * FRAME])
    # Word endings fade out below the threshold (and a last soft word like "…with you" may stay below it):
    # follow the sound down to just above the room noise, up to 1 s after and 0.3 s before.
    floor = noise + 6
    for seg in segs:
        i, j = int(seg[0] / FRAME), int(seg[1] / FRAME)
        k = i
        while k > 0 and i - k < 0.3 / FRAME and db[k - 1] > floor:
            k -= 1
        m = j
        while m < len(db) and m - j < 1.0 / FRAME and db[m] > floor:
            m += 1
        seg[0], seg[1] = k * FRAME, m * FRAME
    merged = []
    for seg in segs:
        if merged and seg[0] - merged[-1][1] < 0.1:
            merged[-1][1] = max(merged[-1][1], seg[1])
        else:
            merged.append(seg)
    return merged


def is_beep(x: np.ndarray, sr=SR) -> bool:
    """A beep is short and almost a pure tone: one frequency carries most of the energy."""
    if len(x) < sr * 0.03 or len(x) > sr * 0.9:
        return False
    spec = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    peak = int(np.argmax(spec))
    band = spec[max(peak - 3, 0) : peak + 4].sum()
    # Her voice sits around 150-450 Hz and sustained vowels look tonal too; a beep is a high pure tone.
    return peak * sr / len(x) > 500 and band / (spec.sum() + 1e-12) > 0.5


def normalise(text: str) -> str:
    return re.sub(r'[^a-zäöüß ]', '', text.lower()).strip()


def matches_start(first_try: str, repeat: str) -> float:
    """How well a (possibly cut-off) first try matches the beginning of the repeated sentence, 0..1."""
    a, b = normalise(first_try), normalise(repeat)
    if len(a) < 12 or not b:
        return 0.0  # too short to judge safely
    return difflib.SequenceMatcher(None, a, b[: len(a) + 4]).ratio()


def sounds_like(a: str, b: str) -> bool:
    """Same consonant skeleton ("Bucks" ~ "Box" -> "bks"): Whisper often mishears the first try."""
    def skel(w):
        w = w.replace('ck', 'k').replace('x', 'ks').replace('c', 'k').replace('ph', 'f')
        return re.sub(r'[aeiouyäöü]', '', w)
    return bool(a) and bool(b) and skel(a) == skel(b)


def transcribe(rec, audio: np.ndarray) -> str:
    stream = rec.create_stream()
    stream.accept_waveform(SR, audio)
    rec.decode_stream(stream)
    return stream.result.text.strip()


def find_retakes(chunks):
    """
    Indices of chunks to delete. A retake is a short marker ("again", "nochmal", a clap, or a short
    word the recogniser misheard) followed by a sentence that repeats what was said just before it.
    The repeat is the reliable signal; the marker word alone is often misheard.
    """
    drop = set()
    for i, c in enumerate(chunks):
        text = normalise(c['text'])
        # "Tap gently with each hand again." said without a pause: first try and marker in one piece.
        words = text.split()
        tail = next((w for w in sorted(RETAKE_WORDS, key=len, reverse=True) if text.endswith(' ' + w)), None)
        if tail and len(words) > len(tail.split()) and i + 1 < len(chunks):
            first_try = text[: -len(tail)].strip()
            repeat = ' '.join(ch['text'] for ch in chunks[i + 1 : i + 3])
            if matches_start(first_try, repeat) >= 0.8:
                c['retake_from'], c['retake_confident'] = i, True
                drop.add(i)
                continue
        short = c['end'] - c['start'] < 1.2 and len(text.split()) <= 2
        said_again = text in RETAKE_WORDS
        soft = text in SOFT_MARKERS
        clap = not text and c['end'] - c['start'] < 0.3
        if not (said_again or clap or short) or i == 0 or i + 1 >= len(chunks):
            continue
        repeat = ' '.join(ch['text'] for ch in chunks[i + 1 : i + 4])
        # The first try may span several chunks (pauses inside a sentence): take the span that matches best
        # (a longer one only if it matches at least as well, so a good sentence before it is never taken along).
        start, score = None, 0.0
        for j in range(i - 1, max(i - 5, -1), -1):
            if j in drop:
                break
            span = ' '.join(ch['text'] for ch in chunks[j:i])
            sc = matches_start(span, repeat)
            # Whisper often mishears the first try ("Bucks breathing"), so explicit markers accept less.
            if sc >= (0.6 if said_again or soft else 0.8) and sc >= score:
                start, score = j, sc
        if start is None and soft:
            before, after = normalise(chunks[i - 1]['text']).split(), normalise(chunks[i + 1]['text']).split()
            if before and after and sounds_like(before[0], after[0]):
                start = i - 1
        if start is None and not said_again:
            continue  # a short word that belongs to the script, e.g. "Hold,"
        c['retake_from'] = start if start is not None else i - 1
        c['retake_confident'] = start is not None
        drop.update(range(c['retake_from'], i + 1))
    return drop


NUMBERS = ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen '
           'seventeen eighteen nineteen twenty').split()


def spell_numbers(text: str) -> str:
    """Whisper writes "5" or "five" at random: compare numbers as words."""
    return re.sub(r'\b(\d{1,2})\b', lambda m: NUMBERS[int(m.group(1))] if int(m.group(1)) <= 20 else m.group(1), text)


def starts_with(text: str, phrase: str) -> bool:
    """
    Whisper writes numbers as words or digits, and "4" may come out as "4-4": compare only the words.
    A phrase may list alternatives for words Whisper mishears: "Well done|Well then".
    """
    if '|' in phrase:
        return any(starts_with(text, p) for p in phrase.split('|'))
    a, b = normalise(spell_numbers(phrase)).split(), normalise(spell_numbers(text)).split()
    return bool(a) and difflib.SequenceMatcher(None, ' '.join(a), ' '.join(b[: len(a)])).ratio() >= 0.7


def apply_plan(code: str, lang: str, keep: list, report: dict):
    """Mark the chunks that start a planned step with the pause before them."""
    plan = PLANS.get(code)
    if not plan:
        return
    report['planned_pauses'] = []
    cursor = 1  # in script order: "Breathe in" occurs several times
    for en, de, pause, step in plan['steps']:
        phrase = de if lang == 'de' else en
        at = next((k for k in range(cursor, len(keep)) if phrase and starts_with(keep[k]['text'], phrase)), None)
        hit = keep[at] if at is not None else None
        if hit:
            cursor = at + 1
            hit['pause'] = pause
            hit['ticks'] = plan['ticks']
            if step is not None:
                hit['step'] = step
        report['planned_pauses'].append({'before': phrase or en, 'seconds': pause, 'found': bool(hit)})


def tick(sr=48000) -> np.ndarray:
    """A soft wooden tick, about 40 ms."""
    t = np.arange(int(0.04 * sr)) / sr
    return ((np.sin(2 * np.pi * 1800 * t) + 0.6 * np.sin(2 * np.pi * 900 * t)) * np.exp(-t / 0.006)).astype(np.float32)


def countdown_pause(seconds: float, level: float, sr=48000) -> np.ndarray:
    """Silence of the given length whose last seconds hold the tick countdown (last tick 1 s before speech)."""
    out = np.zeros(int(seconds * sr), dtype=np.float32)
    tk = tick(sr) * level / 1.6
    for k in range(1, TICKS + 1):
        at = len(out) - k * sr
        if at >= 0:
            out[at : at + len(tk)] += tk
    return out


def add_music(voice: np.ndarray, speech: list, music_path: Path, sr=48000) -> np.ndarray:
    """
    Music under the whole track: about 20 dB below the voice in the pauses, 6 dB lower still while she speaks,
    fading in at the start and out over an 8-second tail after the last word. Loops if the music is shorter.
    """
    voice = np.concatenate([voice, np.zeros(8 * sr, dtype=np.float32)])
    music = load(music_path, sr)
    music = np.tile(music, int(np.ceil(len(voice) / len(music))))[: len(voice)]
    talking = np.zeros(len(voice), dtype=np.float32)
    for a, b in speech:
        talking[a:b] = 1
    ramp = int(0.4 * sr)  # smooth the dips so the music never jumps
    talking = np.convolve(talking, np.ones(ramp) / ramp, mode='same')
    rms = lambda y: np.sqrt((y**2).mean()) + 1e-9  # noqa: E731
    voice_rms = rms(np.concatenate([voice[a:b] for a, b in speech])) if speech else 0.1
    gain = voice_rms * 10 ** (-20 / 20) / rms(music)
    duck = gain * (1 - talking * (1 - 10 ** (-6 / 20)))
    fade_in, fade_out = 3 * sr, 8 * sr
    duck[:fade_in] *= np.linspace(0, 1, fade_in)
    duck[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2
    return voice + music * duck


def loudnorm(inp: Path, out: Path):
    """
    About -16 LUFS with one fixed gain for the whole file, so quiet parts (pauses, ticks) are not pumped up
    (ffmpeg's loudnorm does that whenever peaks are high), and a limiter that only catches the loudest peaks.
    """
    log = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', str(inp), '-af', 'loudnorm=I=-16:TP=-1.5:print_format=json', '-f', 'null', '-'],
        check=True, capture_output=True, text=True,
    ).stderr
    gain = -16 - float(json.loads(log[log.rindex('{') : log.rindex('}') + 1])['input_i'])
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-i', str(inp), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.84:level=false',
         '-ar', '48000', '-ac', '1', '-c:a', 'aac', '-b:a', '128k', str(out)],
        check=True,
    )


def process(path: Path, out_dir: Path, recognizer_for, music: Path | None = None) -> dict:
    lang = 'de' if re.search(r'\bDE\b', path.stem, re.I) else 'en'
    x = load(path)
    segs = segments(x)
    report = {'file': path.name, 'language': lang, 'beeps_removed': 0, 'retakes': [], 'transcript': []}

    # Beeps: a short pure tone as the first or last sound.
    for pos in (0, -1):
        if segs:
            s, e = segs[pos]
            if is_beep(x[int(s * SR) : int(e * SR)]):
                segs.pop(pos)
                report['beeps_removed'] += 1
    # Tapping record/stop: a short sound right at the very start or end of the file.
    length = len(x) / SR
    for pos in (0, -1):
        if len(segs) > 1:
            s, e = segs[pos]
            if e - s < 0.6 and (s < 0.15 if pos == 0 else e > length - 0.15):
                segs.pop(pos)
                report['clicks_removed'] = report.get('clicks_removed', 0) + 1

    rec = recognizer_for(lang)
    chunks = []
    for s, e in segs:
        a = x[int(max(s - 0.1, 0) * SR) : int((e + 0.1) * SR)]
        stream = rec.create_stream()
        stream.accept_waveform(SR, a)
        rec.decode_stream(stream)
        text = stream.result.text.strip()
        # Carina says the English "again" in the German files too, so check short chunks in English as well.
        if lang != 'en' and e - s < 1.3 and normalise(text) not in RETAKE_WORDS:
            en = recognizer_for('en').create_stream()
            en.accept_waveform(SR, a)
            recognizer_for('en').decode_stream(en)
            if normalise(en.result.text) in RETAKE_WORDS:
                text = en.result.text.strip()
        chunks.append({'idx': len(chunks), 'start': round(s, 2), 'end': round(e, 2), 'text': text})

    drop = find_retakes(chunks)
    for i, c in enumerate(chunks):
        if 'retake_from' in c:
            report['retakes'].append({
                'at': f"{int(c['start'] // 60)}:{c['start'] % 60:04.1f}",
                'removed': ' '.join(chunks[k]['text'] for k in range(max(c['retake_from'], 0), i + 1)),
                'sure': c['retake_confident'],
            })
    # "Rest your eyes there. Now find … texture. Again." said in one go: keep the sentences before the failed one.
    for i in sorted(drop):
        chunks[i]['dropped'] = True
    for c in [c for c in chunks if c.get('dropped') and c.get('retake_from') == c['idx']]:
        sentences = [t for t in re.split(r'(?<=[.!?])\s+', c['text'].strip()) if t]
        if len(sentences) < 3:  # only the failed sentence and "Again."
            continue
        wanted = len(normalise(' '.join(sentences[:-2])).split())
        part = x[int(c['start'] * SR) : int(c['end'] * SR)]
        heard, end = 0, None
        for a, b in segments(part, min_silence=0.12):
            heard += len(normalise(transcribe(rec, part[int(a * SR) : int(b * SR)])).split())
            if heard >= wanted:
                end = c['start'] + b
                break
        if end is not None and end < c['end'] - 0.3:
            kept_text = ' '.join(sentences[:-2])
            chunks.insert(chunks.index(c), {'start': c['start'], 'end': end, 'text': kept_text})
            c['start'], c['text'] = end, ' '.join(sentences[-2:])
            report.setdefault('kept_before_retake', []).append(kept_text)
            for r in report['retakes']:
                r['removed'] = r['removed'].replace(kept_text, '').strip()
    for k, c in enumerate(chunks):
        c['idx'] = k
    drop = {k for k, c in enumerate(chunks) if c.get('dropped')}
    keep = [c for i, c in enumerate(chunks) if i not in drop]
    # Whatever comes after the closing sentence is talk after the take ("Oh my god"), not part of the script.
    end = next((k for k, c in enumerate(keep) if any(starts_with(c['text'], e) for e in END_PHRASES)), None)
    if end is not None and end + 1 < len(keep):
        report['after_end_removed'] = ' '.join(c['text'] for c in keep[end + 1 :])
        keep = keep[: end + 1]
    report['transcript'] = [c['text'] for c in keep]
    code = re.match(r'R\d+', path.stem.upper())
    apply_plan(code.group(0) if code else '', lang, keep, report)

    # Rebuild. Every sentence keeps a generous margin of the original (quiet word endings like "seconds",
    # "rest", "gently" are hissing sounds that a volume threshold mistakes for silence). Sentences that follow
    # each other in the recording stay one continuous piece of the original; silence is only inserted for a
    # longer planned pause or where a retake was removed.
    hi = load(path, 48000)
    n = len(hi) / 48000
    for c in keep:
        k = c['idx']
        lo = chunks[k - 1]['end'] + 0.05 if k > 0 else 0.0
        up = chunks[k + 1]['start'] - 0.05 if k + 1 < len(chunks) else n
        c['a'], c['b'] = max(c['start'] - 0.25, lo, 0.0), min(c['end'] + 0.45, up, n)
        # Self-check: does the original with an even wider margin have a word more at the end? Then keep it.
        wide_b = min(c['end'] + 1.0, up, n)
        if wide_b > c['b'] + 0.1:
            said = normalise(transcribe(rec, x[int(c['a'] * SR) : int(c['b'] * SR)])).split()
            wide = normalise(transcribe(rec, x[int(c['a'] * SR) : int(wide_b * SR)])).split()
            if len(wide) > len(said) and wide[: len(said)] == said:
                report.setdefault('endings_kept', []).append(' '.join(wide[len(said) :]))
                c['b'] = wide_b
    runs = []
    for c in keep:
        prev = runs[-1][-1] if runs else None
        joined = prev and c['idx'] == prev['idx'] + 1 and 'pause' not in c and c['a'] - prev['b'] <= 4.0
        if joined:
            runs[-1].append(c)
        else:
            runs.append([c])
    # Ticks sit well below the voice so they guide without waking anyone up.
    tick_level = 0.25 * max((np.abs(hi[int(c['start'] * 48000) : int(c['end'] * 48000)]).max(initial=0) for c in keep), default=0)
    # Cue words (R03 breathing, R04 tapping) must start right on the phase change: almost no lead-in.
    lead = 0.0 if code and code.group(0) in ('R03', 'R04') else 0.4
    pieces, speech, pos = [np.zeros(int(lead * 48000), dtype=np.float32)], [], int(lead * 48000)
    step_starts = {0: 0.0} if code and code.group(0) in PLANS else {}
    for r, run in enumerate(runs):
        first = run[0]
        if r:
            margins = (runs[r - 1][-1]['b'] - runs[r - 1][-1]['end']) + (first['start'] - first['a'])
            natural = min(max(first['a'] - runs[r - 1][-1]['b'], 0.3), 4.0)
            gap = max(first.get('pause', 0) - margins, natural)
            if 'pause' in first and first['ticks']:
                pieces.append(countdown_pause(gap, tick_level))
            else:
                pieces.append(np.zeros(int(gap * 48000), dtype=np.float32))
            pos += len(pieces[-1])
        piece = hi[int(first['a'] * 48000) : int(run[-1]['b'] * 48000)].copy()
        # The margins are quiet, so these fades never touch a word.
        fi, fo = min(int(0.02 * 48000), len(piece) // 4), min(int(0.06 * 48000), len(piece) // 4)
        piece[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
        piece[len(piece) - fo :] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
        for c in run:
            at = pos + int((c['start'] - first['a']) * 48000)
            speech.append((at, pos + int((c['end'] - first['a']) * 48000)))
            if 'step' in c:
                step_starts[c['step']] = round(at / 48000, 2)
        pieces.append(piece)
        pos += len(piece)
    pieces.append(np.zeros(int(0.5 * 48000), dtype=np.float32))
    audio = np.concatenate(pieces)
    if music:
        audio = add_music(audio, speech, music)
        report['music'] = music.name

    out_dir.mkdir(parents=True, exist_ok=True)
    tmp = out_dir / (path.stem + '.tmp.wav')
    import soundfile as sf
    sf.write(tmp, audio, 48000)
    loudnorm(tmp, out_dir / (path.stem + '.m4a'))
    tmp.unlink()
    if step_starts:
        report['step_starts'] = step_starts
        (out_dir / (path.stem + '.steps.json')).write_text(json.dumps(step_starts))
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder of sherpa-onnx-whisper-*')
    ap.add_argument('--out', required=True)
    ap.add_argument('--music', type=Path, help='background music laid under every file of this run')
    ap.add_argument('files', nargs='+')
    a = ap.parse_args()
    m = Path(a.model)
    name = m.name.replace('sherpa-onnx-whisper-', '')
    cache = {}

    def recognizer_for(lang):
        if lang not in cache:
            cache[lang] = sherpa_onnx.OfflineRecognizer.from_whisper(
                encoder=str(m / f'{name}-encoder.int8.onnx'),
                decoder=str(m / f'{name}-decoder.int8.onnx'),
                tokens=str(m / f'{name}-tokens.txt'),
                language=lang,
                task='transcribe',
                num_threads=4,
            )
        return cache[lang]

    reports = [process(Path(f), Path(a.out), recognizer_for, a.music) for f in a.files]
    json.dump(reports, sys.stdout, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
