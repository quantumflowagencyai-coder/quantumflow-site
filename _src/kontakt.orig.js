// Sekcja Kontakt: scena 1:1 z grafiki (kosmos, Saturn, piasta n8n, szklany formularz, wieża), ożywiona na canvasie i w CSS.
// Grafika: img/kontakt-bg.avif (1473×720, tekst z makiety usunięty). Pola formularza to prawdziwe <input>/<select>/<textarea>
// z istniejącego #form, nałożone w miejscu pól z grafiki (wysyłka Web3Forms bez zmian).
(() => {
  const sec = document.getElementById('kontakt');
  const form = document.getElementById('form');
  if (!sec || !form || sec.dataset.kt) return;
  sec.dataset.kt = '1';
  const IW = 1473, IH = 720, MCROP = 770; // na telefonie pokazujemy lewą część sceny (piasta + galaktyka)
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cq = v => (v / IW * 100).toFixed(3) + 'cqw';
  const pc = (v, t) => (v / t * 100).toFixed(3) + '%';
  const HUB = [462, 506];
  // pola: x0,y0,x1,y1 obszaru wewnętrznego z grafiki; l = pozycja etykiety [x,y]
  const F = {
    imie: { r: [789, 145, 999, 177], l: [783, 112] },
    email: { r: [1026, 145, 1244, 177], l: [1019, 112] },
    firma: { r: [789, 232, 999, 264], l: [783, 198] },
    pakiet: { r: [1026, 232, 1244, 264], l: [1019, 198] },
    strona: { r: [789, 320, 1070, 356], l: [783, 286] },
    wiadomosc: { r: [788, 408, 1246, 490], l: [783, 373] }
  };
  const BTN = [777, 517, 1254, 572];

  const css = `
#kontakt.kt{padding:0;position:relative;background:#02030a;overflow:hidden;scroll-margin-top:76px}
#kontakt .kt-stage{position:relative;width:100%;aspect-ratio:${IW}/${IH};container-type:inline-size}
#kontakt .kt-bg{position:absolute;inset:0;width:100%;height:100%;display:block}
#kontakt .kt-top{position:absolute;left:0;top:${cq(45)};width:100%;height:${cq(14)};font:400 ${cq(11.9)}/1 Inter,system-ui,sans-serif;color:rgba(196,206,222,.78);letter-spacing:.01em;z-index:3;white-space:nowrap;pointer-events:none}
#kontakt .kt-top>*{position:absolute;top:0;font-weight:400;font-variant-numeric:tabular-nums}
#kontakt .kt-head{position:absolute;left:${cq(152)};top:0;width:42cqw;z-index:3;pointer-events:none}
#kontakt .kt-head .kicker{position:absolute;top:${cq(116)};left:0;margin:0;font:600 ${cq(15.2)}/1 Inter,system-ui,sans-serif;letter-spacing:.17em;color:#6cc6cc;text-transform:uppercase}
#kontakt .kt-head h2{position:absolute;top:${cq(156)};left:${cq(-1)};margin:0;font:700 ${cq(48)}/${cq(50)} Inter,system-ui,sans-serif;letter-spacing:-.02em;text-transform:uppercase;color:#f3f4f7;white-space:nowrap;text-shadow:0 2px 18px rgba(0,0,0,.55)}
#kontakt .kt-head h2 .grad{background:none;-webkit-text-fill-color:currentColor;color:inherit}
#kontakt .kt-head p{position:absolute;top:${cq(272)};left:0;width:${cq(600)};margin:0;font:400 ${cq(18.9)}/${cq(25)} Inter,system-ui,sans-serif;color:#e6e9f1;letter-spacing:-.005em;text-shadow:0 1px 10px rgba(0,0,0,.8)}
#kontakt .kt-head .w{display:inline-block;opacity:0;transform:translateY(.5em);filter:blur(6px);transition:opacity .9s,transform .9s cubic-bezier(.2,.8,.2,1),filter .9s}
#kontakt.kt-in .kt-head .w{opacity:1;transform:none;filter:none}
#kontakt .kt-form{position:absolute;inset:0;z-index:4;margin:0;pointer-events:none}
#kontakt .kt-form label{display:contents}
#kontakt .kt-l{position:absolute;font:400 ${cq(16.4)}/${cq(22)} Inter,system-ui,sans-serif;color:#f1f3f8;letter-spacing:-.01em;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,.5);transition:color .3s,text-shadow .3s;pointer-events:none}
#kontakt .kt-l.on{color:#fff;text-shadow:0 0 10px rgba(94,234,212,.75)}
#kontakt .kt-f{position:absolute;box-sizing:border-box;margin:0;pointer-events:auto;border:0;border-radius:${cq(9)};background:transparent;color:#fff;font:400 ${cq(16.6)}/1.3 Inter,system-ui,sans-serif;padding:0 ${cq(12)};outline:none;box-shadow:0 0 0 1px rgba(120,220,255,0);transition:box-shadow .35s,background-color .35s;caret-color:#5eead4;-webkit-appearance:none;appearance:none}
#kontakt .kt-f::placeholder{color:rgba(205,214,230,.72);opacity:1}
#kontakt .kt-f:hover{box-shadow:0 0 0 1px rgba(120,220,255,.35),0 0 14px rgba(34,211,238,.18)}
#kontakt .kt-f:focus{box-shadow:0 0 0 1px rgba(94,234,212,.85),0 0 22px rgba(34,211,238,.35),inset 0 0 18px rgba(34,211,238,.12);background-color:rgba(4,8,18,.55)}
#kontakt .kt-f.has{background-color:rgba(4,8,18,.5)}
#kontakt .kt-f:-webkit-autofill{-webkit-text-fill-color:#fff;transition:background-color 99999s}
#kontakt textarea.kt-f{resize:none;padding:${cq(10)} ${cq(14)};line-height:1.45}
#kontakt select.kt-f{cursor:pointer;padding-right:${cq(34)}}
#kontakt select.kt-f option{background:#0b1222;color:#fff}
#kontakt .kt-f.flash{animation:ktFlash 1.2s ease-out}
#kontakt .kt-btn{position:absolute;left:${pc(BTN[0], IW)};top:${pc(BTN[1], IH)};width:${pc(BTN[2] - BTN[0], IW)};height:${pc(BTN[3] - BTN[1], IH)};margin:0;padding:0;border:0;border-radius:999px;background:transparent;color:#0c1733;font:600 ${cq(17.4)}/1 Inter,system-ui,sans-serif;letter-spacing:-.01em;cursor:pointer;pointer-events:auto;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:.4em;transition:transform .25s,box-shadow .35s;box-shadow:0 0 0 0 rgba(34,211,238,0)}
#kontakt .kt-btn::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.55) 47%,transparent 62%) no-repeat;background-size:250% 100%;background-position:170% 0;animation:ktSheen 4.2s ease-in-out infinite;mix-blend-mode:screen}
#kontakt .kt-btn::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 ${cq(22)} rgba(255,255,255,.0);transition:box-shadow .35s}
#kontakt .kt-btn span{position:relative;z-index:1;transition:letter-spacing .3s}
#kontakt .kt-btn i{position:relative;z-index:1;font-style:normal;display:inline-block;transition:transform .3s}
#kontakt .kt-btn:hover,#kontakt .kt-btn:focus-visible{transform:translateY(-1px);box-shadow:0 0 ${cq(34)} rgba(80,200,255,.55),0 0 ${cq(70)} rgba(150,110,255,.35);outline:none}
#kontakt .kt-btn:hover::after{box-shadow:inset 0 0 ${cq(22)} rgba(255,255,255,.45)}
#kontakt .kt-btn:hover i{transform:translateX(.3em)}
#kontakt .kt-btn:hover::before{animation-duration:1.4s}
#kontakt .kt-btn:disabled{cursor:progress}
#kontakt .kt-btn:disabled::before{animation-duration:.9s}
#kontakt .kt-note{position:absolute;left:${pc(780, IW)};top:${pc(580, IH)};width:${pc(470, IW)};margin:0;text-align:center;font:500 ${cq(13.5)}/1.35 Inter,system-ui,sans-serif;color:#5eead4;text-shadow:0 0 8px rgba(0,0,0,.9);pointer-events:auto;min-height:0}
#kontakt .kt-note a{color:#a5f3fc}
#kontakt .kt-small{position:absolute;z-index:3;pointer-events:none;font-family:Inter,system-ui,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums}
#kontakt .kt-tr{left:${cq(1281)};top:${cq(95)};color:rgba(225,231,240,.86)}
#kontakt .kt-tr b{display:block;font-weight:400;font-size:${cq(13.2)};line-height:${cq(14)};margin-bottom:${cq(3.6)}}
#kontakt .kt-tr span{display:block;font-size:${cq(8.4)};line-height:${cq(11)};letter-spacing:.02em;color:rgba(205,212,225,.8)}
#kontakt .kt-tag{color:rgba(232,236,244,.9);transform-origin:0 0;transform:skewY(-12.4deg)}
#kontakt .kt-tag b{display:block;font-weight:500;font-size:${cq(14.5)};line-height:${cq(15)}}
#kontakt .kt-tag span{display:block;font-size:${cq(7.6)};line-height:${cq(10)};color:rgba(205,212,225,.78)}
#kontakt .kt-cr{left:${cq(1279)};top:${cq(533)};font-size:${cq(11.6)};line-height:${cq(14.2)};letter-spacing:.015em;color:rgba(190,196,210,.72);text-transform:uppercase}
#kontakt .kt-sign{position:absolute;z-index:4;display:flex;align-items:center;justify-content:center;text-align:center;color:#eef1f6;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-weight:700;text-transform:uppercase;transform-origin:50% 50%;text-shadow:0 1px 2px rgba(20,30,50,.5);transition:text-shadow .3s,color .3s}
#kontakt .kt-sign.ghost{color:transparent;text-shadow:none}
#kontakt .kt-sign::before{content:"";position:absolute;inset:-12% -6%;border-radius:999px;background:radial-gradient(closest-side,rgba(94,234,212,.32),transparent);opacity:0;transition:opacity .35s;animation:ktSign 3.6s ease-in-out infinite}
#kontakt .kt-sign.s2::before{animation-delay:1.8s}
#kontakt .kt-sign:hover{color:#e9fffb;text-shadow:0 0 12px rgba(94,234,212,.9),0 0 3px rgba(255,255,255,.8)}
#kontakt .kt-sign:hover::before{opacity:1;animation:none}
@keyframes ktSheen{0%,55%{background-position:170% 0}100%{background-position:-70% 0}}
@keyframes ktSign{0%,70%,100%{opacity:0}82%{opacity:.8}}
@keyframes ktFlash{0%{box-shadow:0 0 0 1px rgba(94,234,212,1),0 0 30px rgba(34,211,238,.7)}100%{box-shadow:0 0 0 1px rgba(94,234,212,0),0 0 0 rgba(34,211,238,0)}}
@media (max-width:899px){
 #kontakt .kt-stage{aspect-ratio:auto;padding:84px 16px 56px;container-type:normal}
 #kontakt .kt-top,#kontakt .kt-small,#kontakt .kt-sign{display:none}
 #kontakt .kt-head{position:relative;left:auto;width:auto;max-width:560px;margin:0 auto;pointer-events:auto}
 #kontakt .kt-head .kicker,#kontakt .kt-head h2,#kontakt .kt-head p{position:static;width:auto}
 #kontakt .kt-head .kicker{display:block;font-size:.78rem;margin-bottom:12px}
 #kontakt .kt-head h2{font-size:clamp(1.8rem,8.6vw,2.6rem);line-height:1.08;margin-bottom:14px;white-space:normal}
 #kontakt .kt-head p{font-size:1rem;line-height:1.5}
 #kontakt .kt-head br{display:none}
 #kontakt .kt-form{position:relative;inset:auto;max-width:560px;margin:calc(var(--kt-strip,48vw) + 8px) auto 0;padding:18px 16px 16px;border-radius:20px;background:linear-gradient(165deg,rgba(40,48,66,.72),rgba(12,16,28,.86));border:1px solid rgba(190,210,235,.22);box-shadow:0 20px 50px -20px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.08);display:flex;flex-direction:column;pointer-events:auto}
 #kontakt .kt-l{position:static;font-size:.9rem;line-height:1.3;margin:12px 0 7px}
 #kontakt .kt-l:first-of-type{margin-top:0}
 #kontakt .kt-f{position:relative;left:auto!important;top:auto!important;width:100%!important;height:48px!important;font-size:1rem;padding:0 14px;border-radius:12px;background-color:rgba(6,8,14,.82);box-shadow:inset 0 2px 8px rgba(0,0,0,.7),0 0 0 1px rgba(180,200,225,.22)}
 #kontakt .kt-f.has{background-color:rgba(6,8,14,.82)}
 #kontakt .kt-f:focus{box-shadow:0 0 0 1px rgba(94,234,212,.85),0 0 18px rgba(34,211,238,.3);background-color:rgba(6,8,14,.9)}
 #kontakt textarea.kt-f{height:120px!important;padding:12px 14px}
 #kontakt select.kt-f{background-image:linear-gradient(45deg,transparent 50%,#cfe0f5 50%),linear-gradient(135deg,#cfe0f5 50%,transparent 50%);background-position:calc(100% - 20px) 21px,calc(100% - 15px) 21px;background-size:5px 5px;background-repeat:no-repeat}
 #kontakt .kt-btn{position:relative;left:auto;top:auto;width:100%;height:54px;margin-top:18px;font-size:1.02rem;background:linear-gradient(90deg,#5ff0ff,#4fc3ff 40%,#8a7dff 80%,#b07cff);box-shadow:0 0 0 1px rgba(255,255,255,.35) inset,0 10px 30px -8px rgba(80,180,255,.7)}
 #kontakt .kt-note{position:static;width:auto;margin-top:12px;font-size:.9rem}
}
@media (prefers-reduced-motion:reduce){#kontakt *{animation:none!important;transition:none!important}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- DOM ----------
  const box = sec.querySelector('.contact');
  const intro = box ? box.firstElementChild : null;
  const stage = document.createElement('div'); stage.className = 'kt-stage';
  const cv = document.createElement('canvas'); cv.className = 'kt-bg'; cv.setAttribute('aria-hidden', 'true');
  stage.appendChild(cv);
  const words = (el, d0, step) => { let k = 0; el.innerHTML = el.innerHTML.split(/(<br>)/).map(s => s === '<br>' ? ' <br>' : s.trim().split(/\s+/).map(w => `<span class="w" style="transition-delay:${(d0 + k++ * step).toFixed(2)}s">${w}</span>`).join(' ')).join(''); };
  const top = document.createElement('div'); top.className = 'kt-top'; top.setAttribute('aria-hidden', 'true');
  top.innerHTML = `<span style="left:${cq(80)}">WARSZAWA</span><b class="kt-date" style="left:${cq(176)}"></b><span style="left:${cq(263)}">52.23 N  21.01 E</span><b class="kt-loc" style="left:${cq(371)}"></b>`;
  stage.appendChild(top);
  const hd = document.createElement('div'); hd.className = 'kt-head';
  if (intro) {
    [...intro.children].forEach(n => hd.appendChild(n));
    const h2 = hd.querySelector('h2'), p = hd.querySelector('p');
    if (h2) { h2.innerHTML = 'Porozmawiajmy<br>o Twojej stronie.'; words(h2, 0, .08); }
    if (p) { p.innerHTML = 'Opisz krótko firmę i czego potrzebujesz. Odpowiemy w ciągu 24<br>godzin z pomysłem na stronę i wstępną wyceną.'; words(p, .45, .025); }
  }
  stage.appendChild(hd);

  // małe napisy z grafiki: żywe dane zamiast przypadkowych znaków
  const small = (cls, html, x, y) => { const d = document.createElement('div'); d.className = 'kt-small ' + cls; d.setAttribute('aria-hidden', 'true'); d.innerHTML = html; if (x != null) { d.style.left = cq(x); d.style.top = cq(y); } stage.appendChild(d); return d; };
  const lid = 'QF-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + String(Math.random() * 90 + 10 | 0);
  small('kt-tr', `<b>lead.id</b><span>${lid}&nbsp;&nbsp;52°13′N 21°00′E</span><span class="kt-tm"></span>`);
  small('kt-tag', `<b>lead.id</b><span>${lid} · nowy</span>`, 634, 371);
  small('kt-tag', '<span>n8n · webhook</span><b style="margin-top:.35em">time</b><span class="kt-tm"></span>', 634, 417);
  small('kt-cr', 'Creating<br>memorable<br>experiences');

  // formularz w miejscu pól z grafiki
  form.classList.add('kt-form');
  form.querySelectorAll('.row2').forEach(r => r.replaceWith(...r.childNodes));
  const fields = {};
  form.querySelectorAll('label').forEach(lb => {
    const el = lb.querySelector('input,select,textarea'); if (!el) return;
    const f = F[el.name]; if (!f) return;
    const txt = [...lb.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    [...lb.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove());
    const s = document.createElement('span'); s.className = 'kt-l'; s.textContent = txt;
    s.style.left = pc(f.l[0], IW); s.style.top = pc(f.l[1], IH);
    lb.insertBefore(s, el);
    el.classList.add('kt-f'); el.id = el.id || 'kt-' + el.name;
    const [x0, y0, x1, y1] = f.r;
    el.style.left = pc(x0, IW); el.style.top = pc(y0, IH); el.style.width = pc(x1 - x0, IW); el.style.height = pc(y1 - y0, IH);
    if (el.name === 'strona') el.placeholder = 'https://analiza strony…';
    fields[el.name] = { el, lab: s, f, cx: x0, cy: (y0 + y1) / 2 };
  });
  const btn = form.querySelector('button[type=submit]');
  if (btn) { btn.className = 'kt-btn'; btn.innerHTML = '<span>Wyślij zapytanie</span><i>→</i>'; }
  const note = form.querySelector('#note'); if (note) note.classList.add('kt-note');
  stage.appendChild(form);

  // tabliczki z grafiki
  const sign = (cls, txt, href, x, y, w, h, tr, fs, ls) => { const a = document.createElement('a'); a.className = 'kt-sign ' + cls; a.href = href; a.innerHTML = txt; a.style.cssText = `left:${pc(x, IW)};top:${pc(y, IH)};width:${pc(w, IW)};height:${pc(h, IH)};transform:${tr};font-size:${cq(fs)};line-height:1.12;letter-spacing:${ls}`; stage.appendChild(a); return a; };
  const s1 = sign('ghost', 'Zobacz system', '#automatyzacje', 80, 616, 160, 44, 'rotate(-15.5deg)', 17, '.01em');
  s1.setAttribute('aria-label', 'Zobacz system automatyzacji');
  const s2 = sign('s2', 'Wybierz<br>pakiet', '#kontakt', 1236, 612, 118, 66, 'skewY(20deg)', 19.5, '.03em');
  if (box) box.remove();
  sec.querySelector('.wrap')?.remove();
  sec.appendChild(stage); sec.classList.add('kt');

  // ---------- zegar ----------
  const two = n => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date(), h = d.getHours(), m = two(d.getMinutes()), s = two(d.getSeconds()), h12 = (h % 12) || 12, ap = h < 12 ? 'AM' : 'PM';
    const dt = stage.querySelector('.kt-date'); if (dt) dt.textContent = `${two(d.getDate())}.${two(d.getMonth() + 1)}.${d.getFullYear()}`;
    const lc = stage.querySelector('.kt-loc'); if (lc) lc.textContent = `Local: ${two(h)}:${m} (${h12}:${m} ${ap})`;
    stage.querySelectorAll('.kt-tm').forEach(e => e.textContent = `${two(h)}:${m}:${s} (${h12}:${m} ${ap})`);
  };
  tick(); setInterval(() => { if (vis) tick(); }, 1000);

  // ---------- interakcje pól ----------
  let lastType = 0, focusF = null, sentAt = -9, okAt = -9, pkgAt = -9;
  const PULSES = [];
  const now = () => (performance.now() - t0) / 1000;
  const toHub = (name, d) => PULSES.push({ k: name, t0: now(), d: d || 1, rev: true });
  const toField = (name, d) => PULSES.push({ k: name, t0: now(), d: d || 1.1, rev: false });
  Object.values(fields).forEach(fd => {
    const { el, lab } = fd;
    const upd = () => el.classList.toggle('has', !!el.value && !(el.tagName === 'SELECT'));
    el.addEventListener('focus', () => { lab.classList.add('on'); focusF = el.name; toField(el.name, .9); });
    el.addEventListener('blur', () => { lab.classList.remove('on'); if (focusF === el.name) focusF = null; upd(); });
    el.addEventListener('input', () => { upd(); const t = now(); if (t - lastType > .28) { lastType = t; toHub(el.name, .85); } });
    el.addEventListener('change', () => { upd(); if (el.name === 'pakiet') { pkgAt = now(); toHub('pakiet', .8); } });
    upd();
  });
  const pk = fields.pakiet && fields.pakiet.el;
  const flashPkg = () => { if (!pk) return; pk.classList.remove('flash'); void pk.offsetWidth; pk.classList.add('flash'); pkgAt = now(); toField('pakiet', .9); };
  s2.addEventListener('click', e => {
    e.preventDefault(); if (!pk) return;
    if (innerWidth < 900) pk.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' });
    pk.focus({ preventScroll: innerWidth >= 900 }); flashPkg();
    try { pk.showPicker && pk.showPicker(); } catch (er) { }
  });
  document.querySelectorAll('[data-pkg]').forEach(b => b.addEventListener('click', () => setTimeout(flashPkg, 900)));
  form.addEventListener('submit', () => { sentAt = now(); Object.keys(fields).forEach((k, i) => setTimeout(() => toHub(k, .9), i * 70)); }, true);
  if (note) new MutationObserver(() => { if (/Dziękujemy/.test(note.textContent)) { okAt = now(); Object.keys(fields).forEach(k => { fields[k].el.classList.remove('has'); }); } }).observe(note, { childList: true, characterData: true, subtree: true });

  // ---------- warstwy z grafiki ----------
  const bgImg = new Image(); bgImg.src = '/img/kontakt-bg.avif';
  let glass = null, fib = null, sat = null, ready = false;
  const SKY = [];
  const FORMR = [770, 98, 1262, 580], TOWER = [1268, 85, 1425, 520];
  const inR = (x, y, r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
  const prep = () => {
    ready = true;
    const c = document.createElement('canvas'); c.width = IW; c.height = IH; const x = c.getContext('2d'); x.drawImage(bgImg, 0, 0);
    let d; try { d = x.getImageData(0, 0, IW, IH); } catch (e) { return; }
    const D = d.data;
    const mk = () => { const k = document.createElement('canvas'); k.width = IW; k.height = IH; const kx = k.getContext('2d'); return [k, kx, kx.createImageData(IW, IH)]; };
    const [gC, gX, gI] = mk(), [fC, fX, fI] = mk();
    for (let y = 0; y < IH; y++) for (let xx = 0; xx < IW; xx++) {
      const i = (y * IW + xx) * 4, r = D[i], g = D[i + 1], b = D[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = (r + g + b) / 3, s = mx - mn;
      const inBtn = xx > BTN[0] - 8 && xx < BTN[2] + 8 && y > BTN[1] - 8 && y < BTN[3] + 8;
      // szkło: jasne, mało nasycone (tory, ramki formularza, wieża)
      let ga = Math.max(0, Math.min(1, (L - 140) / 70)) * Math.max(0, Math.min(1, 1 - (s - 35) / 40));
      if (y < 95 || inBtn || (xx > 380 && xx < 770 && y < 330)) ga = 0;
      if (ga > 0) { gI.data[i] = Math.min(255, r + 30); gI.data[i + 1] = Math.min(255, g + 40); gI.data[i + 2] = 255; gI.data[i + 3] = ga * 255; }
      // światłowody: nasycone, kolorowe cienkie linie poza formularzem
      let fa = Math.max(0, Math.min(1, (s - 45) / 50)) * Math.max(0, Math.min(1, (mx - 90) / 60));
      if (y < 330 || inR(xx, y, FORMR) || inR(xx, y, TOWER) || inBtn) fa = 0;
      if (fa > 0) { fI.data[i] = Math.min(255, r + 60); fI.data[i + 1] = Math.min(255, g + 60); fI.data[i + 2] = Math.min(255, b + 60); fI.data[i + 3] = fa * 255; }
    }
    gX.putImageData(gI, 0, 0); fX.putImageData(fI, 0, 0); glass = gC; fib = fC;
    // Saturn
    const SX = 930, SW = 543, SH = 118;
    sat = document.createElement('canvas'); sat.width = SW; sat.height = SH;
    const sx = sat.getContext('2d'); const sd = sx.createImageData(SW, SH);
    for (let y = 0; y < SH; y++) for (let xx = 0; xx < SW; xx++) {
      const i = (y * IW + xx + SX) * 4, o = (y * SW + xx) * 4, L = (D[i] + D[i + 1] + D[i + 2]) / 3;
      const e = Math.min(1, xx / 50, (SH - y) / 25);
      sd.data[o] = D[i]; sd.data[o + 1] = D[i + 1]; sd.data[o + 2] = D[i + 2]; sd.data[o + 3] = 255 * Math.max(0, Math.min(1, (L - 45) / 90)) * Math.max(0, e);
    }
    sx.putImageData(sd, 0, 0);
    let tries = 0;
    while (SKY.length < 140 && tries++ < 6000) {
      const xx = Math.random() * IW | 0, y = Math.random() * IH | 0; let dark = true;
      if (inR(xx, y, FORMR) || inR(xx, y, TOWER)) continue;
      for (let dy = -6; dy <= 6 && dark; dy += 3) for (let dx = -6; dx <= 6; dx += 3) { const yy = Math.min(IH - 1, Math.max(0, y + dy)), x2 = Math.min(IW - 1, Math.max(0, xx + dx)), i = (yy * IW + x2) * 4; if (D[i] + D[i + 1] + D[i + 2] > 130) { dark = false; break; } }
      if (!dark) continue;
      SKY.push([xx, y, .25 + Math.random() * .75, Math.random() * 6.28, .5 + Math.random() * 1.8, Math.random() < .12]);
    }
  };
  const tmp = document.createElement('canvas'); tmp.width = IW; tmp.height = IH; const tc = tmp.getContext('2d');
  const tmpS = document.createElement('canvas'); tmpS.width = 543; tmpS.height = 118;

  // ---------- render ----------
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, mob = false, sc = 1, ox = 0, oy = 0;
  const ptr = { in: false, x: 0, y: 0 };
  const size = () => {
    const r = stage.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.6);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    mob = innerWidth < 900;
    if (!mob) { sc = W / IW; ox = 0; oy = 0; }
    else {
      sc = W / MCROP; const hr = hd.getBoundingClientRect();
      sec.style.setProperty('--kt-strip', (445 * sc).toFixed(0) + 'px');
      oy = hr.bottom - r.top + 4 - 250 * sc; ox = 0;
    }
  };
  const dot = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const DUST = Array.from({ length: 120 }, () => [Math.random() * IW, Math.random() * IH, Math.random(), Math.random() * 6.28]);
  let waveBoost = 0, shoot = null, nextShoot = 2.5, nextPing = 2.2, pingI = 0;
  const ORDER = ['imie', 'email', 'firma', 'pakiet', 'strona', 'wiadomosc'];
  // ścieżka światłowodu: piasta → lewa krawędź pola
  const pathPt = (k, u) => {
    const fd = fields[k]; const ex = fd ? fd.f.r[0] - 6 : 780, ey = fd ? fd.cy : 300;
    const p0 = [HUB[0] + 70, HUB[1] + 18], p1 = [690, 600], p2 = [745, ey + 40], p3 = [ex, ey];
    const v = 1 - u; return [0, 1].map(a => v * v * v * p0[a] + 3 * v * v * u * p1[a] + 3 * v * u * u * p2[a] + u * u * u * p3[a]);
  };
  const ring = (cx, cy, rx, ry, sp, n, col, lw, t) => {
    for (let k = 0; k < n; k++) {
      const a0 = t * sp + k * Math.PI * 2 / n;
      g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
      g.strokeStyle = col; g.lineWidth = lw * rx / ry * .45; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, rx, a0, a0 + .5); g.stroke(); g.restore();
    }
  };
  const draw = t => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#02030a'; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    if (!(bgImg.complete && bgImg.naturalWidth)) return;
    g.drawImage(bgImg, 0, 0, IW, IH);
    if (!ready) prep();
    g.globalCompositeOperation = 'lighter';
    // galaktyka i mgławice oddychają
    dot(712, 208, 150, `rgba(255,190,150,${(.04 + .035 * Math.sin(t * .6)).toFixed(3)})`);
    dot(716, 206, 44, `rgba(255,240,215,${(.06 + .05 * Math.sin(t * 1.2)).toFixed(3)})`);
    dot(560, 300, 110, `rgba(255,140,190,${(.035 + .035 * Math.sin(t * .45 + 1)).toFixed(3)})`);
    dot(240, 330, 80, `rgba(110,160,255,${(.04 + .04 * Math.sin(t * .7 + 2)).toFixed(3)})`);
    // Saturn: światło sunące po pierścieniu
    if (sat) {
      const sx = tmpS.getContext('2d'); sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, 543, 118); sx.drawImage(sat, 0, 0);
      sx.globalCompositeOperation = 'destination-in';
      const p = ((t * 55) % 900) - 180, lg = sx.createLinearGradient(p - 90, 0, p + 90, 40);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, 'rgba(0,0,0,.6)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      sx.fillStyle = lg; sx.fillRect(0, 0, 543, 118); g.drawImage(tmpS, 930, 0);
    }
    // gwiazdy
    SKY.forEach(([x, y, b, p, s, fl]) => {
      const v = b * (.5 + .5 * Math.sin(t * s + p)); if (v < .08) return;
      dot(x, y, 1.8 + 3 * v, `rgba(215,232,255,${(.8 * v).toFixed(3)})`);
      if (fl && v > .55) { g.fillStyle = `rgba(255,255,255,${((v - .55) * 1.6).toFixed(3)})`; const r = 3 + 8 * v; g.fillRect(x - r, y - .3, r * 2, .6); g.fillRect(x - .3, y - r, .6, r * 2); }
    });
    // pył kosmiczny
    DUST.forEach(d => {
      const dp = .3 + d[2] * .9; let x = (d[0] - t * 5 * dp) % IW; if (x < 0) x += IW;
      const y = d[1] + Math.sin(t * .25 + d[3]) * 3, a = (.2 + .3 * Math.sin(t * (1 + d[2]) + d[3])) * dp; if (a <= .02) return;
      if (inR(x, y, FORMR)) return;
      g.fillStyle = `rgba(190,215,255,${a.toFixed(3)})`; g.fillRect(x, y, .7 + d[2] * .9, .7 + d[2] * .9);
    });
    // spadające gwiazdy
    if (t > nextShoot && !shoot) { shoot = { x: 60 + Math.random() * 600, y: 10 + Math.random() * 110, a: .18 + Math.random() * .25, t0: t, L: 110 + Math.random() * 110 }; nextShoot = t + 5 + Math.random() * 6; }
    if (shoot) {
      const u = (t - shoot.t0) / 1.1; if (u > 1) shoot = null; else {
        const hx = shoot.x + Math.cos(shoot.a) * 420 * u, hy = shoot.y + Math.sin(shoot.a) * 420 * u, al = Math.sin(u * Math.PI);
        const lg = g.createLinearGradient(hx, hy, hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L);
        lg.addColorStop(0, `rgba(255,255,255,${al.toFixed(3)})`); lg.addColorStop(1, 'rgba(120,200,255,0)');
        g.strokeStyle = lg; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L); g.stroke();
        dot(hx, hy, 6, `rgba(220,240,255,${(.8 * al).toFixed(3)})`);
      }
    }
    // statek: światła pozycyjne
    if (Math.sin(t * 3) > .75) dot(312, 318, 3.5, 'rgba(255,90,90,.9)');
    if (Math.sin(t * 3 + 2.2) > .8) dot(286, 300, 3, 'rgba(120,255,220,.9)');
    const sent = t - sentAt < 2.5 ? 1 - (t - sentAt) / 2.5 : 0, ok = t - okAt < 3 ? 1 - (t - okAt) / 3 : 0;
    waveBoost = Math.max(waveBoost * .97, sent, ok);
    // fale danych po światłowodach (z piasty w stronę formularza) + połysk szkła
    if (fib) {
      tc.globalCompositeOperation = 'source-over'; tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, IW, IH); tc.drawImage(fib, 0, 0);
      tc.globalCompositeOperation = 'destination-in';
      tc.setTransform(1, 0, 0, .6, HUB[0], HUB[1]);
      const R = 1300, rg = tc.createRadialGradient(0, 0, 0, 0, 0, R), sp = 2.4 - waveBoost, stops = [];
      for (let n = 0; n < 3; n++) stops.push(((t / sp + n / 3) % 1) * R);
      stops.sort((a, b) => a - b);
      rg.addColorStop(0, 'rgba(0,0,0,0)');
      stops.forEach(r => { const a = Math.max(0, 1 - r / R * .7) * (.75 + .25 * waveBoost); const w = 90; [[r - w, 0], [r, a], [r + w * .35, 0]].forEach(([o, al]) => { if (o > 0 && o < R) rg.addColorStop(o / R, `rgba(0,0,0,${al.toFixed(3)})`); }); });
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = rg; tc.fillRect(-R, -R, R * 2, R * 2);
      tc.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = .9; g.drawImage(tmp, 0, 0); g.globalAlpha = 1;
    }
    if (glass) {
      tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, IW, IH); tc.drawImage(glass, 0, 0); tc.globalCompositeOperation = 'destination-in';
      const gp = ((t * 230) % 2700) - 500, lg = tc.createLinearGradient(gp - 120, 0, gp + 120, 260);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, 'rgba(0,0,0,.7)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = lg; tc.fillRect(0, 0, IW, IH); g.drawImage(tmp, 0, 0);
    }
    // piasta n8n: wirujące światła na pierścieniach i pulsujące ikony
    g.filter = 'blur(1.5px)';
    ring(459, 483, 70, 22, .9, 3, 'rgba(120,235,255,.55)', 3, t);
    ring(462, 530, 58, 18, -1.3, 4, 'rgba(70,240,230,.7)', 3, t);
    ring(463, 536, 112, 38, .5, 2, 'rgba(140,200,255,.45)', 3, t);
    g.filter = 'none';
    dot(460, 478, 26, `rgba(140,240,255,${(.18 + .14 * Math.sin(t * 2.6) + .3 * waveBoost).toFixed(3)})`);
    dot(462, 527, 30, `rgba(110,250,235,${(.2 + .16 * Math.sin(t * 2.6 + 1.5) + .3 * waveBoost).toFixed(3)})`);
    // znaczek n8n przy torze
    dot(198, 432, 16, `rgba(150,220,255,${(.08 + .08 * Math.sin(t * 1.7)).toFixed(3)})`);
    // e-mail: żywa fala
    {
      const [x0, y0, x1, y1] = F.email.r, cy = (y0 + y1) / 2, typing = focusF === 'email' ? 1 : 0, amp = 7 + 3 * Math.sin(t * .8) + 4 * typing;
      const hasV = fields.email && fields.email.el.value ? .35 : 1;
      const cols = ['255,90,170', '120,200,255', '90,255,210', '255,210,120', '170,120,255'];
      g.lineWidth = 1.1;
      cols.forEach((c, k) => {
        g.strokeStyle = `rgba(${c},${(.28 * hasV).toFixed(3)})`; g.beginPath();
        for (let x = x0 + 8; x <= x1 - 6; x += 4) {
          const u = (x - x0) / (x1 - x0), env = Math.sin(u * Math.PI);
          const y = cy + env * amp * Math.sin(u * 9 + t * (1.6 + k * .25) + k * 1.3);
          x === x0 + 8 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      });
    }
    // imię: miękkie światło przy awatarze
    dot(875, 150, 46, `rgba(120,190,255,${(.05 + .04 * Math.sin(t * 1.3) + (focusF === 'imie' ? .1 : 0)).toFixed(3)})`);
    // pakiet: kostka świeci, mocniej po wyborze
    const pkB = t - pkgAt < 1.6 ? 1 - (t - pkgAt) / 1.6 : 0;
    dot(1200, 222, 34, `rgba(110,170,255,${(.1 + .08 * Math.sin(t * 2) + .4 * pkB).toFixed(3)})`);
    // strona: pasek analizy w okienku przeglądarki
    {
      const hasU = fields.strona && fields.strona.el.value.length > 3;
      const bx0 = 1086, bx1 = 1169, by = 346;
      const fill = hasU ? bx0 + (bx1 - bx0) * Math.min(1, ((t * .5) % 1.4)) : 1141;
      if (hasU) { g.fillStyle = 'rgba(90,190,255,.55)'; g.fillRect(bx0, by - 2.5, fill - bx0, 5); }
      const sp = bx0 + ((t * 40) % (fill - bx0 + 20)) - 10;
      dot(Math.min(sp, fill), by, 8, 'rgba(200,240,255,.55)');
      [[1083, 301, 0], [1090, 301, 1], [1096, 301, 2]].forEach(([x, y, k]) => { if (Math.sin(t * 2 - k * .9) > .6) dot(x, y, 4, 'rgba(255,255,255,.5)'); });
    }
    // połączenia formularz → wieża: kropki danych
    [[1183, 301, 1262, 301], [1235, 333, 1262, 333], [1235, 341, 1262, 341]].forEach(([a, b, c], k) => {
      const u = ((t * .6 + k * .33) % 1), x = a + (c - a) * u;
      dot(x, b, 5, `rgba(120,255,235,${(.8 * Math.sin(u * Math.PI)).toFixed(3)})`);
      dot(a, b, 7, `rgba(120,255,235,${(.3 + .25 * Math.sin(t * 3 + k)).toFixed(3)})`);
    });
    // wiadomość: oddychające światło i „pisanie” w dymkach
    dot(1012, 487, 120, `rgba(255,200,150,${(.06 + .04 * Math.sin(t * .9) + (focusF === 'wiadomosc' ? .05 : 0)).toFixed(3)})`);
    const typingMsg = focusF === 'wiadomosc' ? 3.4 : 1.8;
    [[1153.3, 407.5], [1162.5, 410.8], [1172, 413.3]].forEach(([x, y], k) => { const v = Math.max(0, Math.sin(t * typingMsg - k * .7)); dot(x, y, 4.5, `rgba(255,255,255,${(.55 * v * v).toFixed(3)})`); });
    [[866.7, 444.2], [875.8, 442.5], [884, 440.8]].forEach(([x, y], k) => { const v = Math.max(0, Math.sin(t * 1.8 - k * .7 + 1.5)); dot(x, y, 4, `rgba(220,240,255,${(.5 * v * v).toFixed(3)})`); });
    // wieża: drony, tarcza, światła
    const okB = ok;
    g.filter = 'blur(.8px)';
    [[1311, 147], [1360, 147], [1316, 156], [1355, 157]].forEach(([x, y], k) => { g.save(); g.translate(x, y); g.scale(1, .35); g.rotate(t * 14 + k); g.strokeStyle = 'rgba(220,235,255,.35)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke(); g.restore(); });
    g.filter = 'none';
    if (Math.sin(t * 4) > .7) dot(1335, 160, 4, 'rgba(255,80,80,.95)');
    if (Math.sin(t * 4 + 3) > .7) dot(1336, 140, 3.5, 'rgba(110,255,200,.9)');
    dot(1340, 296, 30, `rgba(90,190,255,${(.12 + .1 * Math.sin(t * 1.6) + .5 * okB).toFixed(3)})`);
    [[1308, 230, 'rgba(255,150,230,'], [1349, 230, 'rgba(120,200,255,'], [1300, 357, 'rgba(120,200,255,'], [1365, 352, 'rgba(160,230,255,'], [1300, 445, 'rgba(120,255,235,'], [1388, 418, 'rgba(255,220,150,'], [1324, 480, 'rgba(120,210,255,']].forEach(([x, y, c], k) => {
      const v = .5 + .5 * Math.sin(t * (1.3 + k * .27) + k * 1.7); dot(x, y, 9 + 8 * okB, c + (.12 + .25 * v + .5 * okB).toFixed(3) + ')');
    });
    // zaczepka: impuls z piasty do kolejnego pola
    if (!mob && t > nextPing && !focusF) { nextPing = t + 3.4; toField(ORDER[pingI++ % ORDER.length], 1.2); }
    for (let n = PULSES.length - 1; n >= 0; n--) {
      const pu = PULSES[n]; let u = (t - pu.t0) / pu.d; if (u < 0) continue;
      if (u > 1) { PULSES.splice(n, 1); const fd = fields[pu.k]; if (fd && !pu.rev) dot(fd.f.r[0], fd.cy, 20, 'rgba(120,240,255,.6)'); else dot(HUB[0], HUB[1], 40, 'rgba(120,240,255,.35)'); continue; }
      if (pu.rev) u = 1 - u;
      for (let k = 0; k < 10; k++) { const v = pu.rev ? u + k * .018 : u - k * .018; if (v < 0 || v > 1) break; const [x, y] = pathPt(pu.k, v); dot(x, y, 5 - k * .4, `rgba(${k ? '90,220,255' : '230,255,255'},${(.95 - k * .09).toFixed(3)})`); }
    }
    // obrys pola, do którego dotarł impuls (świetlna ramka na canvasie)
    // przycisk: oddech światła pod spodem
    dot(1015, 572, 200, `rgba(120,160,255,${(.05 + .04 * Math.sin(t * 1.4) + .25 * sent).toFixed(3)})`);
    // światło za kursorem
    if (ptr.in && !mob) { const ix = (ptr.x - ox) / sc, iy = (ptr.y - oy) / sc; dot(ix, iy, 170, 'rgba(60,140,255,.07)'); dot(ix, iy, 46, 'rgba(120,220,255,.06)'); }
    g.globalCompositeOperation = 'source-over';
    if (mob) { // pasek sceny przechodzi płynnie w ciemny kosmos
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tp = oy, bt = oy + IH * sc;
      g.fillStyle = '#02030a'; g.fillRect(0, bt, W, H - bt);
      let fg = g.createLinearGradient(0, tp + 230 * sc, 0, tp + 330 * sc); fg.addColorStop(0, '#02030a'); fg.addColorStop(1, 'rgba(2,3,10,0)'); g.fillStyle = fg; g.fillRect(0, tp, W, 330 * sc);
      fg = g.createLinearGradient(0, bt - 60, 0, bt); fg.addColorStop(0, 'rgba(2,3,10,0)'); fg.addColorStop(1, '#02030a'); g.fillStyle = fg; g.fillRect(0, bt - 60, W, 61);
      g.globalCompositeOperation = 'lighter';
      DUST.forEach((d, i) => { const x = (d[0] / IW) * W, y = ((d[1] / IH) * H + i * 53) % H; if (y > tp + 300 * sc && y < bt) return; const a = .2 + .3 * Math.sin(t * (1 + d[2]) + d[3]); if (a > 0) { g.fillStyle = `rgba(200,220,255,${a.toFixed(3)})`; g.fillRect(x, y, 1.1, 1.1); } });
      g.globalCompositeOperation = 'source-over';
    }
  };

  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true; });
  stage.addEventListener('pointerleave', () => { ptr.in = false; });

  // ---------- pętla ----------
  let vis = false, raf = 0; const t0 = performance.now();
  const loop = n => { raf = 0; if (!vis) return; draw(RM ? 0 : (n - t0) / 1000); if (!RM) raf = requestAnimationFrame(loop); };
  const io = new IntersectionObserver(es => es.forEach(e => {
    vis = e.isIntersecting;
    if (vis) { sec.classList.add('kt-in'); tick(); if (!raf) raf = requestAnimationFrame(loop); }
  }), { threshold: [0, .1] });
  io.observe(stage);
  addEventListener('resize', () => { size(); if (vis && !raf) raf = requestAnimationFrame(loop); });
  bgImg.onload = () => { size(); if (vis && !raf) raf = requestAnimationFrame(loop); };
  size();
})();
