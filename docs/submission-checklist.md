# A1-3 최종 제출 체크리스트

## 필수 제출물

- [x] Vercel 웹 서비스: https://a1-3-ai-routine.vercel.app
- [x] GitHub 저장소: https://github.com/eldalya1215/a1-3-ai-routine
- [x] README: 소개, 기술 스택, 실행·배포, URL, 환경 변수 포함
- [x] 서비스 기획서: 목적, 타겟, 섹션, AI 입출력·실패 처리 포함
- [x] 증빙 자료: 데스크톱, 모바일, AI 결과, AI 코딩 기록 포함

## 기능·구조

- [x] 홈, AI 코치, 이용 안내, 안전 원칙 4개 메뉴 이동
- [x] 순수 HTML/CSS/JavaScript 프론트엔드
- [x] `api/routine.py` Vercel Python Serverless Function
- [x] `fetch('/api/routine')` 입력 → 요청 → 결과 렌더링
- [x] 모바일 390px·데스크톱 1440px 반응형 검증
- [x] 빈 입력, API 오류, 20초 타임아웃 안내
- [x] API 키를 `OPENAI_API_KEY` 환경 변수로만 사용
- [x] 의료 진단 배제와 운동 중단 안전 기준 표시

## 자동 검증 결과

- [x] 필수 산출물 정적 검사
- [x] API 키 형태 문자열 유출 검사
- [x] 잘못된 입력 400 응답
- [x] API 키 누락 503 응답
- [x] 데스크톱·모바일·빈 입력·AI 결과 렌더링 브라우저 테스트
- [x] Vercel Production 배포 상태 Ready 및 메인 화면 확인
- [ ] Vercel `OPENAI_API_KEY` 저장 후 실제 OpenAI 응답 확인
- [x] 최신 로컬 커밋을 GitHub `main`에 push

마지막 미완료 항목은 실제 API 키 입력이 필요한 단계입니다. 완료 후 체크하고
Production을 재배포한 다음 공개 URL에서 정상 입력 1건을 실행합니다.
