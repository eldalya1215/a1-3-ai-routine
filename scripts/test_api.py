import importlib.util
import io
import json
import os
from pathlib import Path
from unittest import mock

module_path = Path(__file__).parents[1] / "api" / "routine.py"
spec = importlib.util.spec_from_file_location("routine", module_path)
routine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(routine)


def call(payload, api_key=None):
    raw = json.dumps(payload).encode()
    instance = object.__new__(routine.handler)
    instance.headers = {"Content-Length": str(len(raw))}
    instance.rfile = io.BytesIO(raw)
    captured = {}
    instance.send_response = lambda status: captured.update(status=status)
    instance.send_header = lambda *_: None
    instance.end_headers = lambda: None
    instance.wfile = io.BytesIO()
    env = {"OPENAI_API_KEY": api_key} if api_key else {}
    with mock.patch.dict(os.environ, env, clear=True):
        instance.do_POST()
    captured["body"] = json.loads(instance.wfile.getvalue())
    return captured


invalid = call({"condition": "", "area": "무릎", "minutes": 5})
assert invalid["status"] == 400
missing_key = call({"condition": "보통", "area": "무릎", "minutes": 5})
assert missing_key["status"] == 503
print("통과: 잘못된 입력 400 + API 키 누락 503")

