import json, time, sys
sys.path.insert(0, '/Users/nack/MyProjects/OpenMontage')
from tools.video.video_compose import VideoCompose
P = "/Users/nack/MyProjects/OpenMontage/projects/thailand-sounds-fake"
ed = json.load(open(P + "/artifacts/edit_decisions.json"))
ed["bespoke"].update({"crf": 18, "concurrency": 6})
t = time.time()
r = VideoCompose().execute({"operation": "render", "output_path": P + "/renders/final_v3_raw.mp4", "edit_decisions": ed})
print("RESULT", r.success, round(time.time() - t), "s", (r.error or "")[-1500:], flush=True)
