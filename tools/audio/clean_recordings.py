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
        # The first try may span several chunks (pauses inside a sentence): take the longest span that still matches.
        start, score = None, 0.0
        for j in range(i - 1, max(i - 5, -1), -1):
            if j in drop:
                break
            span = ' '.join(ch['text'] for ch in chunks[j:i])
            sc = matches_start(span, repeat)
            # Whisper often mishears the first try ("Bucks breathing"), so explicit markers accept less.
            if sc >= (0.6 if said_again or soft else 0.8):
                start, score = j, sc
        if start is None and not said_again:
            continue  # a short word that belongs to the script, e.g. "Hold,"
        c['retake_from'] = start if start is not None else i - 1
        c['retake_confident'] = start is not None
        drop.update(range(c['retake_from'], i + 1))
    return drop


def starts_with(text: str, phrase: str) -> bool:
    """Whisper writes numbers as words or digits, and "4" may come out as "4-4": compare only the words."""
    a, b = normalise(phrase).split(), normalise(text).split()
    return bool(a) and difflib.SequenceMatcher(None, ' '.join(a), ' '.join(b[: len(a)])).ratio() >= 0.7


def apply_plan(code: str, lang: str, keep: list, report: dict):
    """Mark the chunks that start a planned step with the pause before them."""
    plan = PLANS.get(code)
    if not plan:
        return
    report['planned_pauses'] = []
    for en, de, pause, step in plan['steps']:
        phrase = de if lang == 'de' else en
        hit = phrase and next((c for c in keep[1:] if 'pause' not in c and starts_with(c['text'], phrase)), None)
        if hit:
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
        chunks.append({'start': round(s, 2), 'end': round(e, 2), 'text': text})

    drop = find_retakes(chunks)
    for i, c in enumerate(chunks):
        if 'retake_from' in c:
            report['retakes'].append({
                'at': f"{int(c['start'] // 60)}:{c['start'] % 60:04.1f}",
                'removed': ' '.join(chunks[k]['text'] for k in range(max(c['retake_from'], 0), i + 1)),
                'sure': c['retake_confident'],
            })
    keep = [c for i, c in enumerate(chunks) if i not in drop]
    report['transcript'] = [c['text'] for c in keep]
    code = re.match(r'R\d+', path.stem.upper())
    apply_plan(code.group(0) if code else '', lang, keep, report)

    # Rebuild: kept chunks with their natural pauses (pauses around removed parts are closed up).
    hi = load(path, 48000)
    # Ticks sit well below the voice so they guide without waking anyone up.
    tick_level = 0.25 * max((np.abs(hi[int(c['start'] * 48000) : int(c['end'] * 48000)]).max(initial=0) for c in keep), default=0)
    pieces, prev_end, speech, pos = [], None, [], int(0.5 * 48000)
    step_starts = {0: 0.0} if code and code.group(0) in PLANS else {}
    for c in keep:
        s, e = c['start'], c['end']
        if prev_end is not None:
            gap = s - prev_end if s > prev_end else 0.6
            gap = min(max(gap, 0.4), 4.0)
            if 'pause' in c and c['ticks']:
                pieces.append(countdown_pause(max(gap, c['pause']), tick_level))
            elif 'pause' in c:
                pieces.append(np.zeros(int(max(gap, c['pause']) * 48000), dtype=np.float32))
            else:
                pieces.append(np.zeros(int(gap * 48000), dtype=np.float32))
        pos += len(pieces[-1]) if prev_end is not None else 0
        if 'step' in c:
            step_starts[c['step']] = round(pos / 48000, 2)
        pieces.append(hi[int(max(s - 0.05, 0) * 48000) : int((e + 0.12) * 48000)])
        speech.append((pos, pos + len(pieces[-1])))
        pos += len(pieces[-1])
        prev_end = e
    pad = np.zeros(int(0.5 * 48000), dtype=np.float32)
    audio = np.concatenate([pad, *pieces, pad]) if pieces else pad
    fade = int(0.05 * 48000)
    audio[:fade] *= np.linspace(0, 1, fade)
    audio[-fade:] *= np.linspace(1, 0, fade)
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
