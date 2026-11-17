"""Render one AnimatedDrawings clip per story beat for a hand-rigged character.

Run with the AnimatedDrawings venv python, FROM THE AnimatedDrawings REPO ROOT:
  cd .tmp/animated-drawings/AnimatedDrawings
  .venv/Scripts/python <skill>/template/tools/render_motions.py <char_dir> <out_dir> [motion ...]
Renders each bundled motion at full length (pick the usable frame window afterwards with
motion strips + cut_beats.py). White clear colour so the MP4 can be multiplied onto a white page
in HyperFrames (no alpha needed). Output fps = the BVH's own rate (120 / 100 / 30).
"""
import sys, re
from pathlib import Path

AD = Path.cwd()
char_dir, out_dir = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
want = sys.argv[3:]
cfg_dir = out_dir / "cfg"; cfg_dir.mkdir(parents=True, exist_ok=True)

BEATS = {
    #  name      bundled motion yaml  start  end   retarget (MUST match the BVH skeleton family)
    "wave":   ("wave_hello",     0,   839, "fair1_ppf"),
    "jump":   ("jumping",        0,   654, "fair1_ppf"),
    "jacks":  ("jumping_jacks",  0,   125, "cmu1_pfp"),
    "dance":  ("jesse_dance",    0,  "null", "mixamo_fff"),
    "dab":    ("dab",            0,   339, "fair1_ppf"),
}

from animated_drawings import render

for beat in (want or list(BEATS)):
    motion, s, e, rt = BEATS[beat]
    src = (AD / "examples/config/motion" / f"{motion}.yaml").read_text()
    src = re.sub(r"filepath:\s*(\S+)", lambda m: "filepath: " + (AD / m.group(1)).as_posix(), src)
    src = re.sub(r"start_frame_idx:.*", f"start_frame_idx: {s}", src)
    src = re.sub(r"end_frame_idx:.*", f"end_frame_idx: {e}", src)
    mpath = cfg_dir / f"motion_{beat}.yaml"; mpath.write_text(src)
    mvc = f"""scene:
  ANIMATED_CHARACTERS:
    - character_cfg: {(char_dir / 'char_cfg.yaml').as_posix()}
      motion_cfg: {mpath.as_posix()}
      retarget_cfg: {(AD / 'examples/config/retarget' / f'{rt}.yaml').as_posix()}
view:
  CLEAR_COLOR: [1.0, 1.0, 1.0, 1.0]
  WINDOW_DIMENSIONS: [800, 900]
  CAMERA_POS: [0.0, 0.7, 1.45]
  CAMERA_FWD: [0.0, 0.5, 2.0]
controller:
  MODE: video_render
  OUTPUT_VIDEO_PATH: {(out_dir / f'{beat}.mp4').as_posix()}
  OUTPUT_VIDEO_CODEC: avc1
"""
    vpath = cfg_dir / f"mvc_{beat}.yaml"; vpath.write_text(mvc)
    print("render", beat, flush=True)
    render.start(str(vpath))
print("done")
