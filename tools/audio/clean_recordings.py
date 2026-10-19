"""
Clean Carina's voice recordings for the app.

For every input file:
  1. removes the microphone beep at the start and the end,
  2. finds retakes: when she says "again" (or "nochmal" / "noch einmal"), the sentence before it is
     cut out together with the "again", so only the second, clean version stays,
  3. evens out the loudness (about -16 LUFS), trims to 0.5 s of silence at both ends and fades the edges.

Speech is recognised locally with Whisper (sherpa-onnx), nothing is uploaded anywhere.

Setup (once):
  pip install sherpa-onnx numpy soundfile
  curl -L -o whisper.tar.bz2 \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
  tar xjf whisper.tar.bz2

Usage:
  python tools/audio/clean_recordings.py --model sherpa-onnx-whisper-small --out cleaned/ "R19 DE.m4a" ...
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


def load(path: Path, sr=SR) -> np.ndarray:
    """Decode any audio file to mono float32 with ffmpeg."""
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
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
    thr = max(noise + 12, -50)
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
    return segs


def is_beep(x: np.ndarray, sr=SR) -> bool:
    """A beep is short and almost a pure tone: one frequency carries most of the energy."""
    if len(x) < sr * 0.03 or len(x) > sr * 0.9:
        return False
    spec = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    peak = int(np.argmax(spec))
    band = spec[max(peak - 3, 0) : peak + 4].sum()
    return band / (spec.sum() + 1e-12) > 0.5


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
        short = c['end'] - c['start'] < 1.2 and len(text.split()) <= 2
        said_again = text in RETAKE_WORDS
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
            if sc >= 0.8:
                start, score = j, sc
        if start is None and not said_again:
            continue  # a short word that belongs to the script, e.g. "Hold,"
        c['retake_from'] = start if start is not None else i - 1
        c['retake_confident'] = start is not None
        drop.update(range(c['retake_from'], i + 1))
    return drop


def loudnorm(inp: Path, out: Path):
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-i', str(inp), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
         '-ar', '48000', '-ac', '1', '-c:a', 'aac', '-b:a', '128k', str(out)],
        check=True,
    )


def process(path: Path, out_dir: Path, recognizer_for) -> dict:
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
                'removed': ' '.join(chunks[k]['text'] for k in range(max(c['retake_from'], 0), i)),
                'sure': c['retake_confident'],
            })
    keep = [c for i, c in enumerate(chunks) if i not in drop]
    report['transcript'] = [c['text'] for c in keep]

    # Rebuild: kept chunks with their natural pauses (pauses around removed parts are closed up).
    hi = load(path, 48000)
    pieces, prev_end = [], None
    for c in keep:
        s, e = c['start'], c['end']
        if prev_end is not None:
            gap = s - prev_end if s > prev_end else 0.6
            pieces.append(np.zeros(int(min(max(gap, 0.4), 4.0) * 48000), dtype=np.float32))
        pieces.append(hi[int(max(s - 0.05, 0) * 48000) : int((e + 0.12) * 48000)])
        prev_end = e
    pad = np.zeros(int(0.5 * 48000), dtype=np.float32)
    audio = np.concatenate([pad, *pieces, pad]) if pieces else pad
    fade = int(0.05 * 48000)
    audio[:fade] *= np.linspace(0, 1, fade)
    audio[-fade:] *= np.linspace(1, 0, fade)

    out_dir.mkdir(parents=True, exist_ok=True)
    tmp = out_dir / (path.stem + '.tmp.wav')
    import soundfile as sf
    sf.write(tmp, audio, 48000)
    loudnorm(tmp, out_dir / (path.stem + '.m4a'))
    tmp.unlink()
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True, help='folder of sherpa-onnx-whisper-*')
    ap.add_argument('--out', required=True)
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

    reports = [process(Path(f), Path(a.out), recognizer_for) for f in a.files]
    json.dump(reports, sys.stdout, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
