# NOTES: plane-door-midflight (daily run, 2026-11-14)

Shared code was not edited. What cost time in this run, for whoever maintains the manual:

1. **`scripts/toon-sheet.py` and `scripts/toon-qa.py` need Pillow, which the system `python3` on the runner does not
   have.** The kit README and PRODUCER.md write `python3 scripts/toon-sheet.py`; that exits with
   `ModuleNotFoundError: No module named 'PIL'`. They work with the engine's interpreter:
   `../.venv/bin/python -B scripts/toon-sheet.py <id>`. (`toon-render.py` runs with either.) Cost: about 25 minutes,
   because the first attempt was started detached and its error went unseen.
2. **A process detached with `nohup ... &` inside a sandboxed shell command is killed when the command returns**, and
   `pgrep` cannot see processes of other commands. Long renders have to be started as the harness's own background
   task, and waiting has to test for an output file.
3. **Sources.** The Boeing airport-planning PDF (door size), the 737 FCOM (pressure schedule), the EPA report (car
   weight) and askthepilot.com were only seen as search results, not opened; SCRIPT.md says so. The headline number
   does not depend on any of them alone: it is 14 CFR 25.841 + the standard atmosphere + the door size, and it lands
   within 4 % of the pilot's published "over 1,100 pounds per square foot".
4. **Two places of this film are its own** (`cabin`, `sky` in `remotion/src/videos/plane-door-midflight/places.ts`),
   built the way the kit's ocean is. The cabin is boxes with `build.lam` materials; the airliner, the gauge, the
   weights, the cars and the plug diagram are flat cards (`props.ts`). A later episode can import them.
