const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const required = [
  'index.html', 'css/style.css', 'js/app.js', 'api/routine.py', 'requirements.txt',
  'vercel.json', '.python-version', '.env.example', 'README.md', 'docs/service-plan.md',
  'docs/ai-coding-log.md', 'docs/submission-checklist.md', 'evidence/01-desktop-home.png',
  'evidence/02-mobile-menu.png', 'evidence/03-ai-result.png'
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`필수 파일 누락: ${missing.join(', ')}`);
const browser = spawnSync(process.execPath, [path.join(root, 'scripts/test-and-capture.cjs')], { cwd: root, encoding: 'utf8' });
process.stdout.write(browser.stdout); process.stderr.write(browser.stderr);
if (browser.status !== 0) process.exit(browser.status || 1);
const source = fs.readFileSync(path.join(root, 'api/routine.py'), 'utf8');
if (!source.includes('os.environ.get("OPENAI_API_KEY")')) throw new Error('환경 변수 사용 확인 실패');
const textFiles = required.filter((file) => /\.(html|css|js|py|md|json|txt|example)$/.test(file));
const combined = textFiles.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
if (/sk-(?:proj-)?[A-Za-z0-9_-]{16,}/.test(combined)) throw new Error('API 키로 보이는 문자열 발견');
console.log(`필수 산출물 ${required.length}개 확인 완료`);
console.log('민감정보 정적 검사 통과');
console.log('Vercel 배포 URL: https://a1-3-ai-routine.vercel.app');
console.log('결론: 정적·반응형·오류 처리 검증 완료 (실제 AI 호출은 배포 환경 변수 등록 후 확인)');
