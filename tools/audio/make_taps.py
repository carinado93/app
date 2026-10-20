"""
Soft wooden tap sounds for the Butterfly Hug: a low "tok" on the left, a slightly higher one on the right
(panned, so with headphones each side is heard on its own ear). Synthesised here, no licence needed.

Usage: python tools/audio/make_taps.py  ->  assets/audio/music/tap-left.m4a, tap-right.m4a
"""
import subprocess
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[2] / 'assets' / 'audio' / 'music'


def tok(freq: float) -> np.ndarray:
    t = np.arange(int(0.25 * SR)) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.06)
    knock = np.sin(2 * np.pi * freq * 2.7 * t) * np.exp(-t / 0.012) * 0.5
    attack = np.minimum(t / 0.003, 1)
    return (body + knock) * attack


def write(name: str, mono: np.ndarray, left: float, right: float):
    stereo = np.stack([mono * left, mono * right], axis=1)
    stereo = (stereo / np.abs(stereo).max() * 0.5).astype(np.float32)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
         '-c:a', 'aac', '-b:a', '96k', str(OUT / name)],
        input=stereo.tobytes(), check=True,
    )


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    write('tap-left.m4a', tok(196), 1.0, 0.25)
    write('tap-right.m4a', tok(262), 0.25, 1.0)
