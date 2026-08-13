const { chromium } = require('../../node_modules/playwright');
const { pathToFileURL } = require('url');
const fs = require('fs');
const http = require('http');
const path = require('path');

(async () => {
  const root = path.join(__dirname, '..');
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '').replace(/\/$/, '/index.html');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file)) { response.writeHead(404); return response.end(); }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ headless: true });
  const evidence = path.join(__dirname, '..', 'evidence');
  fs.mkdirSync(evidence, { recursive: true });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.route('**/api/routine', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({
      title: '무릎을 아끼는 편안한 5분', summary: '의자를 잡고 천천히 움직이며 오늘의 몸을 깨워요.',
      steps: [
        { name: '어깨 호흡', duration: '1분', guide: '등을 펴고 코로 숨을 들이마신 뒤 천천히 내쉬세요.' },
        { name: '앉아서 발목 돌리기', duration: '1분', guide: '양쪽 발목을 통증 없는 범위에서 천천히 돌리세요.' },
        { name: '의자 무릎 펴기', duration: '2분', guide: '한쪽 다리를 천천히 펴고 2초 유지한 뒤 내려놓으세요.' },
        { name: '종아리 이완', duration: '1분', guide: '발뒤꿈치를 바닥에 두고 발끝을 가볍게 당기세요.' }
      ], safety: '날카로운 통증이나 어지럼증이 느껴지면 즉시 멈추고 휴식하세요.'
    })
  }));
  await desktop.goto(url);
  const broken = await desktop.locator('img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
  if (broken) throw new Error('이미지 로딩 실패');
  await desktop.screenshot({ path: path.join(evidence, '01-desktop-home.png'), fullPage: true });

  await desktop.getByRole('link', { name: '내 루틴 만들기' }).click();
  await desktop.getByRole('button', { name: 'AI 루틴 추천받기' }).click();
  if (!await desktop.locator('#toast').evaluate((el) => el.classList.contains('show'))) throw new Error('빈 입력 안내 실패');
  await desktop.waitForTimeout(3600);
  await desktop.getByLabel('🙂 보통이에요').check();
  await desktop.getByLabel('불편한 부위').selectOption({ label: '무릎' });
  await desktop.getByLabel('가능한 시간').selectOption('5');
  await desktop.getByLabel(/추가로 알려주실 내용/).fill('오래 앉아 있어서 다리가 뻐근해요');
  await desktop.getByRole('button', { name: 'AI 루틴 추천받기' }).click();
  await desktop.getByRole('heading', { name: '무릎을 아끼는 편안한 5분' }).waitFor();
  await desktop.screenshot({ path: path.join(evidence, '03-ai-result.png'), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(url);
  await mobile.getByRole('button', { name: '메뉴' }).click();
  if (await mobile.getByRole('button', { name: '메뉴' }).getAttribute('aria-expanded') !== 'true') throw new Error('모바일 메뉴 실패');
  await mobile.screenshot({ path: path.join(evidence, '02-mobile-menu.png'), fullPage: true });

  console.log('통과: 데스크톱 + 모바일 + 빈 입력 + AI 결과');
  await browser.close();
  server.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
