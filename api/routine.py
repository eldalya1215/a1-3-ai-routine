import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

ALLOWED_CONDITIONS = {"좋음", "보통", "피곤"}
ALLOWED_AREAS = {"없음", "무릎", "허리", "어깨", "목"}
ALLOWED_MINUTES = {3, 5, 10}


class handler(BaseHTTPRequestHandler):
    def _json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4096:
                return self._json(400, {"error": "입력 내용을 확인해 주세요."})
            data = json.loads(self.rfile.read(length))
            condition = str(data.get("condition", ""))
            area = str(data.get("area", ""))
            minutes = int(data.get("minutes", 0))
            note = str(data.get("note", "")).strip()[:300]
            if condition not in ALLOWED_CONDITIONS or area not in ALLOWED_AREAS or minutes not in ALLOWED_MINUTES:
                return self._json(400, {"error": "필수 항목을 올바르게 선택해 주세요."})

            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return self._json(503, {"error": "AI 서비스 설정을 확인 중입니다. 잠시 후 다시 시도해 주세요."})

            schema = {
                "type": "object",
                "properties": {
                    "title": {"type": "string"}, "summary": {"type": "string"},
                    "steps": {"type": "array", "minItems": 3, "maxItems": 5, "items": {"type": "object", "properties": {"name": {"type": "string"}, "duration": {"type": "string"}, "guide": {"type": "string"}}, "required": ["name", "duration", "guide"], "additionalProperties": False}},
                    "safety": {"type": "string"}
                }, "required": ["title", "summary", "steps", "safety"], "additionalProperties": False
            }
            prompt = f"컨디션: {condition}, 불편한 부위: {area}, 가능 시간: {minutes}분, 추가 메모: {note or '없음'}"
            system = "당신은 50대 여성을 위한 안전 중심 웰니스 운동 안내자입니다. 의료 진단이나 치료를 주장하지 말고, 통증 없는 범위의 의자 기반 저강도 동작을 쉬운 한국어로 제안하세요. 날카로운 통증, 어지럼증, 호흡곤란 시 즉시 중단 안내를 포함하세요."
            payload = {
                "system_instruction": {"parts": [{"text": system}]},
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "responseJsonSchema": schema,
                    "temperature": 0.5,
                    "maxOutputTokens": 1200
                }
            }
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent"
            request = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"x-goog-api-key": api_key, "Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(request, timeout=15) as response:
                ai_data = json.loads(response.read())
            routine = json.loads(ai_data["candidates"][0]["content"]["parts"][0]["text"])
            return self._json(200, routine)
        except (ValueError, json.JSONDecodeError):
            return self._json(400, {"error": "입력 형식을 확인해 주세요."})
        except urllib.error.HTTPError as error:
            error_body = error.read().decode("utf-8", errors="replace")[:2000]
            print(f"Gemini HTTP error {error.code}: {error_body}")
            message = "무료 AI 요청 한도를 확인하거나 잠시 후 다시 시도해 주세요." if error.code in (429, 500, 502, 503) else "AI 요청을 처리하지 못했습니다."
            return self._json(502, {"error": message})
        except TimeoutError:
            return self._json(504, {"error": "AI 응답이 늦어 요청을 중단했습니다."})
        except Exception:
            return self._json(500, {"error": "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."})
