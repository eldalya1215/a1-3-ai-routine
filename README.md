# 오늘도 웃는 몸 — AI 5분 루틴

50대 여성이 현재 컨디션, 불편한 부위와 가능한 시간을 입력하면 AI가 안전 중심의
저강도 운동 루틴을 제안하는 반응형 웹 서비스입니다.

## 배포 URL

- Vercel: 배포 후 등록
- GitHub: https://github.com/eldalya1215/a1-3-ai-routine

## 핵심 기능

- 홈, AI 코치, 이용 안내, 안전 원칙 4개 섹션과 메뉴 이동
- 모바일·태블릿·데스크톱 반응형 레이아웃
- OpenAI API 기반 맞춤 루틴 생성
- 빈 입력, API 오류, 타임아웃 사용자 안내
- 의료 진단 배제와 안전 중단 기준

## 기술 스택

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Vercel Serverless Functions, Python 3.12
- AI: OpenAI Chat Completions API
- Deploy: Vercel

## 구조

```text
.
├─ api/routine.py
├─ css/style.css
├─ js/app.js
├─ docs/
│  ├─ service-plan.md
│  └─ ai-coding-log.md
├─ evidence/
├─ index.html
├─ requirements.txt
└─ vercel.json
```

## 환경 변수

API 키는 코드에 저장하지 않습니다. 로컬 `.env.local` 또는 Vercel 프로젝트 설정에
다음 값을 등록합니다.

```text
OPENAI_API_KEY=발급받은_API_키
```

`.env*` 파일은 Git에 커밋하지 않습니다. 키 노출이 의심되면 즉시 폐기하고 새 키를
발급합니다.

## 로컬 실행

Vercel CLI가 설치되어 있다면 프로젝트 루트에서 실행합니다.

```text
vercel dev
```

정적 화면만 확인할 때는 간단한 HTTP 서버를 사용할 수 있지만 `/api/routine`은
Vercel 개발 서버에서 확인해야 합니다.

## 배포

1. GitHub 저장소에 프로젝트를 푸시합니다.
2. Vercel에서 저장소를 Import합니다.
3. Environment Variables에 `OPENAI_API_KEY`를 등록합니다.
4. Deploy 후 공개 URL에서 메뉴, 반응형, 정상·오류 입력을 확인합니다.

## 동작 흐름 설명

- HTML은 입력 폼과 결과 영역의 구조를 정의합니다.
- CSS는 색상, 배치와 화면 크기별 반응형 표현을 담당합니다.
- JavaScript는 입력을 검증하고 `fetch('/api/routine')` 요청을 보낸 뒤 응답을 화면에 반영합니다.
- `api/routine.py`는 요청을 검증하고 서버의 환경 변수로 OpenAI API를 호출하는 Vercel Serverless Function입니다.
- 로컬과 배포 환경은 URL·환경 변수·실행 런타임이 다르므로 배포 후 동일 테스트를 다시 수행합니다.

## 문서

- [서비스 기획서](docs/service-plan.md)
- [AI 코딩 도구 사용 기록](docs/ai-coding-log.md)

## 증빙 자료

- `evidence/01-desktop-home.png`: 데스크톱 전체 화면
- `evidence/02-mobile-menu.png`: 모바일 반응형과 메뉴
- `evidence/03-ai-result.png`: 사용자 입력과 AI 결과 출력

## 테스트

```text
node scripts/test-and-capture.cjs
python scripts/test_api.py
```

브라우저 테스트는 데스크톱·모바일 레이아웃, 빈 입력 안내와 AI 결과 렌더링을
검증하며 `evidence/`에 제출용 스크린샷을 생성합니다. Python 테스트는 잘못된 입력과
API 키 누락 시 상태 코드를 검증합니다.
