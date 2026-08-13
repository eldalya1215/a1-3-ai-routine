const form = document.querySelector('#routine-form');
const result = document.querySelector('#result');
const toast = document.querySelector('#toast');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const note = form.elements.note;
const charCount = document.querySelector('#char-count');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); });
note.addEventListener('input', () => { charCount.textContent = note.value.length; });

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function renderLoading() {
  result.setAttribute('aria-busy', 'true');
  result.innerHTML = '<div class="loading"><div class="spinner" aria-hidden="true"></div><h3>몸 상태에 맞는 루틴을 만들고 있어요</h3><p>최대 20초 정도 걸릴 수 있습니다.</p></div>';
}

function renderError(message) {
  result.setAttribute('aria-busy', 'false');
  result.innerHTML = `<div class="error-state"><span aria-hidden="true">🌧️</span><h3>추천을 가져오지 못했어요</h3><p>${escapeHtml(message)}</p><button class="button retry" type="button">다시 시도</button></div>`;
  result.querySelector('.retry').addEventListener('click', () => form.requestSubmit());
}

function renderRoutine(data) {
  const steps = data.steps.map((step) => `<li><strong>${escapeHtml(step.name)} · ${escapeHtml(step.duration)}</strong><br>${escapeHtml(step.guide)}</li>`).join('');
  result.setAttribute('aria-busy', 'false');
  result.innerHTML = `<div class="routine"><p class="eyebrow">오늘의 맞춤 루틴</p><h3>${escapeHtml(data.title)}</h3><p class="routine-summary">${escapeHtml(data.summary)}</p><ol>${steps}</ol><p class="safety"><strong>안전 안내</strong><br>${escapeHtml(data.safety)}</p></div>`;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const condition = new FormData(form).get('condition');
  const area = form.elements.area.value;
  const minutes = form.elements.minutes.value;
  if (!condition || !area || !minutes) {
    notify('컨디션, 불편한 부위, 가능한 시간을 모두 선택해 주세요.');
    (!condition ? form.querySelector('input[name="condition"]') : !area ? form.elements.area : form.elements.minutes).focus();
    return;
  }

  renderLoading();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/api/routine', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ condition, area, minutes: Number(minutes), note: note.value.trim() })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '잠시 후 다시 시도해 주세요.');
    renderRoutine(data);
  } catch (error) {
    renderError(error.name === 'AbortError' ? '응답이 늦어 요청을 중단했습니다. 잠시 후 다시 시도해 주세요.' : error.message);
  } finally { clearTimeout(timeout); }
});

