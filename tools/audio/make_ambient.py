"""
Make calm instrumental background music for meditations: slow soft chord pads with a few gentle bell notes.
Everything is synthesised here, so there are no rights questions.

Usage:
  python tools/audio/make_ambient.py --minutes 4 --out ambient.m4a [--seed 7] [--loop]
  --loop: no fade in/out; the end flows into the start, so the app can repeat it without a gap.
  Then: python tools/audio/clean_recordings.py ... --music ambient.m4a "R30 EN.m4a"
"""
import argparse
import subprocess
from pathlib import Path

import numpy as np

SR = 48000

# A slow, warm progression in D (Dmaj9 – Bm11 – Gmaj9 – Asus2), notes as MIDI numbers.
CHORDS = [
    [38, 50, 57, 62, 66, 69, 76],
    [35, 47, 54, 62, 66, 69, 76],
    [31, 43, 54, 59, 62, 66, 69],
    [33, 45, 52, 57, 64, 69, 71],
]
BELLS = [62, 64, 66, 69, 71, 74, 76, 78, 81]  # D major pentatonic, upper range
CHORD_SECONDS = 12.0


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def pad_note(freq: float, n: int, rng) -> np.ndarray:
    """Three slightly detuned sines with a soft octave on top and a slow breathing movement."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for detune in (-0.0015, 0.0, 0.0015):
        f = freq * (1 + detune)
        phase = rng.uniform(0, 2 * np.pi)
        out += np.sin(2 * np.pi * f * t + phase) + 0.15 * np.sin(4 * np.pi * f * t + phase)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * rng.uniform(0.05, 0.12) * t + rng.uniform(0, 2 * np.pi))
    return out * lfo / 3


def envelope(n: int, attack: float, release: float) -> np.ndarray:
    env = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[n - r :] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return env


def bell(freq: float) -> np.ndarray:
    n = int(5 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / 0.6)
    return tone * np.exp(-t / 1.4) * np.minimum(t / 0.01, 1)


def reverb(x: np.ndarray, seconds=3.0, mix=0.45, rng=None) -> np.ndarray:
    """A soft hall: convolution with exponentially decaying noise."""
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (seconds / 6))
    ir /= np.sqrt((ir**2).sum())
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * wet * (np.abs(x).max() / (np.abs(wet).max() + 1e-9))


def lowpass(x: np.ndarray, cutoff=2500.0) -> np.ndarray:
    size = 1 << int(np.ceil(np.log2(len(x))))
    spec = np.fft.rfft(x, size)
    f = np.fft.rfftfreq(size, 1 / SR)
    return np.fft.irfft(spec / np.sqrt(1 + (f / cutoff) ** 4), size)[: len(x)]


def make(minutes: float, seed: int, loop=False) -> np.ndarray:
    rng = np.random.default_rng(seed)
    total = int(minutes * 60 * SR)
    xfade = int(CHORD_SECONDS * SR)
    if loop:
        # Make one chord longer than needed and blend that extra tail into the start.
        total += xfade
    out = np.zeros(total + int(8 * SR))
    hop, overlap = int(CHORD_SECONDS * SR), 4.0
    k = 0
    for start in range(0, total, hop):
        n = hop + int(overlap * SR)
        chord = CHORDS[k % len(CHORDS)]
        layer = sum(pad_note(hz(m), n, rng) * (1.0 if m < 48 else 0.6) for m in chord) / len(chord)
        out[start : start + n] += layer * envelope(n, overlap, overlap)
        k += 1
    t = 2.0
    while t < minutes * 60 - 4:
        b = bell(hz(rng.choice(BELLS))) * rng.uniform(0.04, 0.08)
        i = int(t * SR)
        out[i : i + len(b)] += b[: len(out) - i]
        t += rng.uniform(5, 11)
    out = reverb(lowpass(out), rng=rng)[:total]
    if loop:
        total -= xfade
        ramp = np.sin(np.linspace(0, np.pi / 2, xfade)) ** 2
        out[:xfade] = out[:xfade] * ramp + out[total:] * (1 - ramp)
        out = out[:total]
    else:
        out *= envelope(total, 4.0, 6.0)
    return (out / np.abs(out).max() * 0.7).astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--minutes', type=float, default=4)
    ap.add_argument('--seed', type=int, default=7, help='another number gives another melody of bells')
    ap.add_argument('--out', required=True)
    ap.add_argument('--loop', action='store_true')
    a = ap.parse_args()
    audio = make(a.minutes, a.seed, a.loop)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
         '-c:a', 'aac', '-b:a', '160k', str(Path(a.out))],
        input=audio.tobytes(), check=True,
    )


if __name__ == '__main__':
    main()
