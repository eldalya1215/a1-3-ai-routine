const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const required = [
  'index.html', 'css/style.css', 'js/app.js', 'api/routine.py', 'requirements.txt',
  'vercel.json', '.python-version', 'README.md', 'docs/service-plan.md',
  'docs/ai-coding-log.md', 'evidence/01-desktop-home.png',
  'evidence/02-mobile-menu.png', 'evidence/03-ai-result.png'
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`필수 파일 누락: ${missing.join(', ')}`);
const browser = spawnSync(process.execPath, [path.join(root, 'scripts/test-and-capture.cjs')], { cwd: root, encoding: 'utf8' });
process.stdout.write(browser.stdout); process.stderr.write(browser.stderr);
if (browser.status !== 0) process.exit(browser.status || 1);
const source = fs.readFileSync(path.join(root, 'api/routine.py'), 'utf8');
if (!source.includes('os.environ.get("OPENAI_API_KEY")')) throw new Error('환경 변수 사용 확인 실패');
if (/sk-[A-Za-z0-9_-]{16,}/.test(source)) throw new Error('API 키로 보이는 문자열 발견');
console.log(`필수 산출물 ${required.length}개 확인 완료`);
console.log('민감정보 정적 검사 통과');
console.log('결론: Vercel 배포 및 실제 API 검증 대기');

