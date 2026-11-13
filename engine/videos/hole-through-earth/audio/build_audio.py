#!/usr/bin/env python
# One command that regenerates the whole soundtrack of this short from ../shots.json + ../voice/:
#     python build_audio.py            (about 45 s on 4 cores; numpy + scipy only, headless, seeded, no downloads)
# 1. mix.py     renders the score (music.py) and the SFX stem (sfx.py) in two processes, mixes them under the
#               narration and writes mix.wav, stem_voice.wav, stem_music.wav, stem_sfx.wav, cues.md, mix_report.json
# 2. verify.py  measures the written files, appends the verification block to cues.md, writes verify.json
# Exit code 0 = built and every check passed; 1 = a check failed (the files are still written).
import os
import sys
import time

sys.dont_write_bytecode = True
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(HERE)
os.environ.pop("AUDIO_CACHE", None)          # a real build never reuses cached renders


def main():
    t0 = time.time()
    import mix
    import verify
    mix.main()
    code = 0 if "--no-verify" in sys.argv else verify.main()
    print(f"build_audio: {'OK' if code == 0 else 'CHECKS FAILED'} in {time.time() - t0:.0f} s -> {HERE}")
    return code


if __name__ == "__main__":
    sys.exit(main())
