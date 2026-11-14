// Sekcja Portfolio na stronie głównej.
// Desktop: przypięty „showroom”: okna przeglądarki z żywym podglądem stron jadą w poziomie przy przewijaniu,
// aktywne okno wysuwa się do przodu, tło przyjmuje kolor projektu, za oknami wielka nazwa.
// Telefon / ograniczony ruch: zwykła lista kart, filmy grają tylko na ekranie.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sec = document.getElementById('portfolio');
const grid = sec && sec.querySelector('.pfh-grid');
const cards = grid ? [...grid.querySelectorAll('.pfh-card')] : [];
const vids = cards.map(c => c.querySelector('video'));
const wide = matchMedia('(min-width: 861px)');
const host = location.host || 'quantumflow.agency';

// pasek przeglądarki w każdej karcie (też na telefonie)
cards.forEach(c => {
  const m = c.querySelector('.pfh-media'); if (!m || m.querySelector('.pfh-bar')) return;
  const bar = document.createElement('div'); bar.className = 'pfh-bar'; bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = `<i></i><i></i><i></i><span>${host}${c.getAttribute('href')}</span>`;
  m.prepend(bar);
});

const play = v => { if (!v) return; if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); };

if (cards.length > 1 && !reduce && wide.matches) showroom();
else if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play(e.target) : e.target.pause())), { threshold: 0.25 });
  vids.forEach(v => v && io.observe(v));
}

function showroom() {
  const n = cards.length;
  sec.classList.add('pfh-x');
  const pin = document.createElement('div'); pin.className = 'pfh-pin'; pin.style.height = `${(n - 1) * 85 + 100}vh`;
  const stage = document.createElement('div'); stage.className = 'pfh-stage';
  const info = cards.map(c => ({
    name: c.querySelector('h3').textContent.trim(),
    num: c.querySelector('.pfh-num').textContent.trim(),
    desc: (c.querySelector('.pfh-body p') || {}).textContent || '',
    pa: c.style.getPropertyValue('--pa').trim() || '#3ee0d0',
    poster: (c.querySelector('video') || {}).poster || '',
    href: c.getAttribute('href'),
  }));
  stage.innerHTML = `
    <div class="pfh-bg" aria-hidden="true"><img alt=""><img alt=""></div>
    <div class="pfh-giant" aria-hidden="true"><span></span></div>
    <div class="pfh-hud">
      <div class="pfh-count"><b>01</b><span>/ ${String(n).padStart(2, '0')}</span></div>
      <div class="pfh-meta"><span class="pfh-cat"></span><p class="pfh-desc"></p><a class="pfh-open" href="#">Otwórz stronę <span aria-hidden="true">→</span></a></div>
      <div class="pfh-dots">${info.map((x, i) => `<button type="button" aria-label="Pokaż ${x.name}" data-i="${i}"></button>`).join('')}</div>
    </div>
    <div class="pfh-prog" aria-hidden="true"><i></i></div>
    <div class="pfh-cur" aria-hidden="true">Otwórz</div>`;
  grid.parentNode.insertBefore(pin, grid);
  pin.appendChild(stage);
  stage.insertBefore(grid, stage.querySelector('.pfh-hud'));
  const note = sec.querySelector('.pfh-note'); if (note) pin.after(note);

  const bgs = [...stage.querySelectorAll('.pfh-bg img')], giant = stage.querySelector('.pfh-giant span');
  const cnt = stage.querySelector('.pfh-count b'), cat = stage.querySelector('.pfh-cat'), desc = stage.querySelector('.pfh-desc');
  const open = stage.querySelector('.pfh-open'), dots = [...stage.querySelectorAll('.pfh-dots button')];
  const bar = stage.querySelector('.pfh-prog i'), cur = stage.querySelector('.pfh-cur');

  let target = 0, pos = 0, active = -1, bgi = 0, inView = false;
  const range = () => Math.max(1, pin.offsetHeight - innerHeight);
  const measure = () => { const r = pin.getBoundingClientRect(); inView = r.bottom > 0 && r.top < innerHeight; target = Math.min(1, Math.max(0, -r.top / range())) * (n - 1); };
  const goTo = i => { const top = pin.getBoundingClientRect().top + scrollY; scrollTo({ top: top + (i / (n - 1)) * range() + 2, behavior: 'smooth' }); };

  const setActive = i => {
    if (i === active) return; active = i; const x = info[i];
    stage.style.setProperty('--pa', x.pa);
    cnt.textContent = String(i + 1).padStart(2, '0');
    cat.textContent = x.num.replace(/^\d+\s*\/\s*/, '');
    desc.textContent = x.desc; open.href = x.href; open.setAttribute('aria-label', `Otwórz stronę ${x.name}`);
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    giant.classList.remove('in'); void giant.offsetWidth; giant.textContent = x.name; giant.classList.add('in');
    // tło: przenikanie dwóch warstw z rozmytym kadrem projektu
    bgi = 1 - bgi; bgs[bgi].src = x.poster; bgs[bgi].classList.add('on'); bgs[1 - bgi].classList.remove('on');
    cards.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.tabIndex = k === i ? 0 : -1; });
  };

  const frame = () => {
    requestAnimationFrame(frame);
    if (!inView && Math.abs(target - pos) < 1e-3) return;
    pos += (target - pos) * 0.09; if (Math.abs(target - pos) < 1e-4) pos = target;
    const w = cards[0].offsetWidth, gap = innerWidth * 0.05;
    grid.style.transform = `translate3d(${(-pos * (w + gap)).toFixed(1)}px,0,0)`;
    cards.forEach((c, k) => {
      const d = k - pos, a = Math.min(1, Math.abs(d));
      c.style.transform = `perspective(1600px) rotateY(${(Math.max(-1, Math.min(1, d)) * -16).toFixed(2)}deg) scale(${(1 - a * 0.18).toFixed(3)})`;
      c.style.filter = `brightness(${(1 - Math.min(1.4, Math.abs(d)) * 0.42).toFixed(3)}) saturate(${(1 - a * 0.5).toFixed(3)})`;
      const v = vids[k]; if (v) { if (Math.abs(d) < 1.15 && inView) { if (v.paused) play(v); } else if (!v.paused) v.pause(); }
    });
    giant.parentNode.style.transform = `translate3d(${(-(pos % 1) * 6).toFixed(2)}vw,0,0)`;
    bar.style.transform = `scaleX(${(pos / (n - 1)).toFixed(4)})`;
    setActive(Math.round(pos));
  };

  // magnes: po zatrzymaniu scrolla okno dociąga do najbliższego projektu
  let idle = 0;
  const snap = () => { const r = pin.getBoundingClientRect(); if (r.top > 0 || r.bottom < innerHeight) return; const k = Math.round(target); if (Math.abs(target - k) > 0.03) goTo(k); };
  addEventListener('scroll', () => { measure(); clearTimeout(idle); idle = setTimeout(snap, 220); }, { passive: true });
  addEventListener('resize', measure);
  measure(); pos = target; setActive(Math.round(pos)); requestAnimationFrame(frame);

  // klik w boczne okno przewija do niego; aktywne otwiera stronę
  cards.forEach((c, k) => c.addEventListener('click', e => { if (k !== active) { e.preventDefault(); goTo(k); } }));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && active < n - 1) { e.preventDefault(); goTo(active + 1); }
    if (e.key === 'ArrowLeft' && active > 0) { e.preventDefault(); goTo(active - 1); }
  });

  // kursor „Otwórz” nad aktywnym oknem
  if (matchMedia('(pointer: fine)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0, on = false;
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
      const over = e.target.closest && e.target.closest('.pfh-card');
      const now = !!over && cards.indexOf(over) === active;
      if (now !== on) { on = now; cur.classList.toggle('on', on); stage.classList.toggle('pfh-hidecur', on); }
      cur.textContent = over && !now ? 'Przewiń' : 'Otwórz';
      if (over && !now) cur.classList.add('on');
    });
    stage.addEventListener('pointerleave', () => { on = false; cur.classList.remove('on'); stage.classList.remove('pfh-hidecur'); });
    (function loop() { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  }
}
