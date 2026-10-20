"""
Check cleaned recordings before they go into the app: nothing of what Carina said may be missing.

For each cleaned file, Whisper transcribes the original and the cleaned version (as the app plays it), and
the words of the two are compared. Every word that is in the original but not in the cleaned file is listed,
except the parts the cleaner removed on purpose (retakes, talk after the last sentence: pass its report).
Exit code 1 if anything is missing, so it can stop a build.

Usage:
  python tools/audio/check_audio.py --model sherpa-onnx-whisper-small --report report.json \\
      --raw raw_folder --cleaned cleaned_folder
"""
import argparse
import difflib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from clean_recordings import RETAKE_WORDS, SOFT_MARKERS, SR, load, normalise, segments, transcribe  # noqa: E402
import sherpa_onnx  # noqa: E402


NUMBERS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split()


def spelled(text: str) -> str:
    """Whisper writes "4" or "four" at random: compare numbers as words."""
    text = re.sub(r'[\(\[][^\)\]]*[\)\]]?', ' ', text)  # "(camera clicks)": Whisper describing a noise
    return re.sub(r'\b(\d{1,2})\b', lambda m: NUMBERS[int(m.group(1))] if int(m.group(1)) <= 20 else m.group(1), text)


def words(rec, path: Path) -> list[str]:
    x = load(path)
    out, segs = [], segments(x)
    for k, (s, e) in enumerate(segs):
        # A little margin, but never into the neighbour (else a word is heard twice).
        a = max(s - 0.2, (segs[k - 1][1] + s) / 2 if k else 0)
        b = min(e + 0.3, (e + segs[k + 1][0]) / 2 if k + 1 < len(segs) else len(x) / SR)
        out += normalise(spelled(transcribe(rec, x[int(a * SR) : int(b * SR)]))).split()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--report', required=True, help='JSON report printed by clean_recordings.py')
    ap.add_argument('--raw', required=True)
    ap.add_argument('--cleaned', required=True)
    a = ap.parse_args()
    m = Path(a.model)
    name = m.name.replace('sherpa-onnx-whisper-', '')
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(m / f'{name}-encoder.int8.onnx'), decoder=str(m / f'{name}-decoder.int8.onnx'),
        tokens=str(m / f'{name}-tokens.txt'), language='en', task='transcribe', num_threads=4,
    )
    problems = 0
    for r in json.load(open(a.report)):
        raw = Path(a.raw) / r['file']
        cleaned = Path(a.cleaned) / (Path(r['file']).stem + '.m4a')
        removed = ' '.join([x['removed'] for x in r['retakes']] + [r.get('after_end_removed', '')])
        removed = set(normalise(spelled(removed)).split()) | set(normalise(removed).split())
        before, after = words(rec, raw), words(rec, cleaned)
        missing, unsure = [], []
        for op, i1, i2, _, _ in difflib.SequenceMatcher(None, before, after, autojunk=False).get_opcodes():
            # 'replace' is Whisper hearing a word differently in the two passes; 'delete' is a word that is gone.
            if op == 'delete':
                lost = [w for w in before[i1:i2] if w not in removed]
                # Whisper sometimes skips one little word ("to") in one of the two passes: listen, not fail.
                if len(lost) == 1 and len(lost[0]) <= 3:
                    unsure.append(lost[0])
                elif lost:
                    missing.append(' '.join(lost))
        # A retake is only right if what was cut is said again: each cut sentence must reappear in the file.
        heard = ' '.join(after)
        for x in r['retakes']:
            for sentence in re.split(r'(?<=[.!?])\s+', spelled(x['removed'])):
                w = [v for v in normalise(sentence).split() if v not in RETAKE_WORDS | SOFT_MARKERS]
                if len(w) >= 3:
                    probe = ' '.join(w[:6])
                    best = max((difflib.SequenceMatcher(None, probe, heard[k : k + len(probe)]).ratio()
                                for k in range(0, max(len(heard) - len(probe), 0) + 1)), default=0)
                    if best < 0.8:
                        missing.append(f'cut but not said again: "{sentence.strip()}"')
        ok = not missing
        problems += not ok
        print(f"{'OK     ' if ok else 'MISSING'} {r['file']}" + ('' if ok else f": {' | '.join(missing)}")
              + (f"  (listen: '{' | '.join(unsure)}' may be missing)" if unsure else ''))
        print(f"        {' '.join(after)}")
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
