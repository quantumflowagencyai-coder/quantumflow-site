// Sekcja FAQ: scena 1:1 z grafiki (kosmos, Saturn, szklany system paneli z piastą n8n), ożywiona na canvasie i w CSS.
// Grafika: img/faq-bg.avif (1479×704, tekst z makiety usunięty, pytania to HTML nałożony w miejscu tekstu).
(() => {
  const sec = document.getElementById('faq');
  if (!sec || sec.dataset.fq) return;
  sec.dataset.fq = '1';
  const IW = 1479, IH = 704;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cq = v => (v / IW * 100).toFixed(3) + 'cqw';
  const HUB = [806, 500];
  // obrys ekranu panelu (hit area) + geometria tekstu: x,y lewy górny róg, a = pochylenie (deg), fs, lh, w (px grafiki)
  const P = [
    { q: [[158, 404], [316, 356], [322, 536], [168, 560]], t: [177, 403, -11.9, 13.2, 18.5, 132] },
    { q: [[370, 330], [521, 300], [524, 470], [376, 495]], t: [379, 344, -12.9, 12.2, 16, 140] },
    { q: [[562, 266], [705, 235], [708, 415], [568, 440]], t: [574, 286, -13.4, 11.6, 14.6, 124] },
    { q: [[785, 165], [907, 188], [908, 382], [788, 370]], t: [792, 180, 17.1, 11.6, 15.8, 112] },
    { q: [[930, 210], [1065, 238], [1068, 442], [933, 420]], t: [947, 235, 19.5, 11.6, 15.8, 112] },
    { q: [[1095, 270], [1220, 300], [1222, 485], [1098, 462]], t: [1104, 285, 18, 11.6, 15.5, 112] },
    { q: [[1255, 330], [1405, 355], [1408, 520], [1258, 505]], t: [1269, 336, 18.3, 12.2, 17.5, 128] }
  ];
  const bbox = q => { const xs = q.map(p => p[0]), ys = q.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };

  const css = `
#faq.fq{padding:0;position:relative;background:#02030a;overflow:hidden;scroll-margin-top:76px}
#faq .fq-stage{position:relative;width:100%;aspect-ratio:${IW}/${IH};container-type:inline-size}
#faq .fq-bg{position:absolute;inset:0;width:100%;height:100%;display:block}
#faq .fq-head{position:absolute;left:${cq(150)};top:0;width:45cqw;z-index:3;pointer-events:none}
#faq .fq-head .kicker{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#faq .fq-head h2{position:absolute;top:${cq(76)};left:0;margin:0;font-size:${cq(50)};line-height:${cq(46)};color:#fff;letter-spacing:-.03em;font-weight:700;text-shadow:0 2px 18px rgba(0,0,0,.5)}
#faq .fq-head p{position:absolute;top:${cq(234)};left:${cq(2)};margin:0;font-size:${cq(17)};line-height:${cq(20)};color:#e9ecf6;letter-spacing:-.01em;text-shadow:0 1px 10px rgba(0,0,0,.7)}
#faq .fq-head .w{display:inline-block;opacity:0;transform:translateY(.5em);filter:blur(6px);transition:opacity .9s,transform .9s cubic-bezier(.2,.8,.2,1),filter .9s}
#faq.fq-in .fq-head .w{opacity:1;transform:none;filter:none}
#faq .fq-list{position:absolute;inset:0;z-index:2;pointer-events:none}
#faq .fq-p{position:absolute;padding:0;margin:0;border:0;background:none;cursor:pointer;pointer-events:auto;color:#fff;font:inherit;text-align:left;-webkit-tap-highlight-color:transparent}
#faq .fq-sheen{position:absolute;inset:0;background:linear-gradient(115deg,rgba(150,230,255,0) 30%,rgba(150,230,255,.22) 48%,rgba(150,230,255,0) 62%) no-repeat;background-size:260% 100%;background-position:160% 0;opacity:0;transition:opacity .4s;pointer-events:none}
#faq .fq-p:hover .fq-sheen,#faq .fq-p:focus-visible .fq-sheen,#faq .fq-p.ping .fq-sheen{opacity:1;animation:fqSheen 1.3s ease-out}
#faq .fq-p::after{content:"";position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,rgba(34,211,238,.16),transparent 70%);opacity:0;transition:opacity .35s;pointer-events:none}
#faq .fq-p:hover::after,#faq .fq-p:focus-visible::after,#faq .fq-p[aria-expanded=true]::after{opacity:1}
#faq .fq-q{position:absolute;transform-origin:0 0;font-family:Inter,system-ui,sans-serif;font-weight:400;color:#f2f5fb;letter-spacing:-.012em;text-shadow:0 0 8px rgba(0,0,0,.35);pointer-events:none}
#faq .fq-q .w{display:inline-block;opacity:0;transform:translateY(.4em);transition:opacity .6s,transform .6s cubic-bezier(.2,.8,.2,1)}
#faq.fq-in .fq-q .w{opacity:1;transform:none}
#faq .fq-p:hover .fq-q,#faq .fq-p[aria-expanded=true] .fq-q{color:#fff;text-shadow:0 0 10px rgba(94,234,212,.55)}
#faq .fq-num{display:none}
#faq .fq-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:visible}
#faq .fq-lines polygon{fill:none;stroke:url(#fqg);stroke-width:2;stroke-linejoin:round;stroke-dasharray:90 900;opacity:0;transition:opacity .35s;filter:drop-shadow(0 0 5px rgba(34,211,238,.95))}
#faq .fq-lines polygon.on{opacity:1;animation:fqRun 2.4s linear infinite}
#faq .fq-lines polygon.ping{opacity:1;animation:fqRun 1.4s linear}
#faq .fq-lines polygon.open{opacity:1;stroke-dasharray:none;stroke-width:1.6;animation:fqGlow 1.8s ease-in-out infinite}
#faq .fq-sign{position:absolute;z-index:3;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-weight:700;text-transform:uppercase;transform-origin:50% 50%;text-shadow:0 1px 2px rgba(20,30,50,.5);transition:text-shadow .3s,color .3s}
#faq .fq-sign::before{content:"";position:absolute;inset:-14% -6%;border-radius:999px;background:radial-gradient(closest-side,rgba(94,234,212,.35),transparent);opacity:0;transition:opacity .35s;animation:fqSign 3.2s ease-in-out infinite}
#faq .fq-sign:hover{color:#e9fffb;text-shadow:0 0 12px rgba(94,234,212,.9),0 0 3px rgba(255,255,255,.8)}
#faq .fq-sign:hover::before{opacity:1;animation:none}
#faq .fq-dim{position:absolute;inset:0;z-index:4;background:radial-gradient(70% 80% at 50% 45%,rgba(2,4,12,.35),rgba(2,4,12,.72));opacity:0;pointer-events:none;transition:opacity .45s}
#faq.fq-open .fq-dim{opacity:1;pointer-events:auto}
#faq .fq-card{position:absolute;z-index:5;width:31cqw;padding:1.5cqw 1.7cqw 1.4cqw;border-radius:1.3cqw;color:#e8ecf6;background:linear-gradient(160deg,rgba(18,30,56,.9),rgba(6,10,24,.93));border:1px solid rgba(120,220,255,.35);box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 2.5cqw 6cqw -1cqw rgba(0,0,0,.8),0 0 4cqw -.5cqw rgba(34,211,238,.45);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0;transform:scale(.35);pointer-events:none;transition:opacity .35s,transform .55s cubic-bezier(.2,.9,.25,1.05);overflow:hidden}
#faq .fq-card.on{opacity:1;transform:none;pointer-events:auto}
#faq .fq-card::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#22d3ee,#3b82f6,transparent);animation:fqScan 3s linear infinite}
#faq .fq-ct{display:flex;align-items:center;gap:.8cqw;font-size:.78cqw;letter-spacing:.2em;color:#5eead4;margin:0 0 .7cqw}
#faq .fq-ct i{font-style:normal;flex:1;height:1px;background:linear-gradient(90deg,rgba(94,234,212,.5),transparent)}
#faq .fq-card h3{margin:0 2.2cqw .8cqw 0;font-size:1.32cqw;line-height:1.25;color:#fff;letter-spacing:-.01em}
#faq .fq-ans p{margin:0;font-size:1.02cqw;line-height:1.6;color:#c9d1e4}
#faq .fq-ans p .w{opacity:0;transition:opacity .25s}
#faq .fq-ans p .w.on{opacity:1}
#faq .fq-ans>div[hidden]{display:none}
#faq .fq-x{position:absolute;right:1cqw;top:1cqw;width:2.2cqw;height:2.2cqw;border-radius:50%;border:1px solid rgba(150,220,255,.3);background:rgba(255,255,255,.04);color:#cfe9ff;font-size:1.3cqw;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .25s,transform .25s}
#faq .fq-x:hover{background:rgba(34,211,238,.2);transform:rotate(90deg)}
#faq .fq-ft{display:flex;align-items:center;justify-content:space-between;gap:1cqw;margin-top:1.1cqw;padding-top:.9cqw;border-top:1px solid rgba(150,200,255,.12)}
#faq .fq-nav{display:flex;gap:.5cqw}
#faq .fq-nav button{width:2.3cqw;height:2.3cqw;border-radius:50%;border:1px solid rgba(150,220,255,.3);background:rgba(255,255,255,.04);color:#e6f6ff;font-size:1.1cqw;cursor:pointer;transition:background .25s,border-color .25s}
#faq .fq-nav button:hover{background:rgba(34,211,238,.22);border-color:#22d3ee}
#faq .fq-cta{font-size:.98cqw;font-weight:600;color:#06121f;text-decoration:none;padding:.65cqw 1.2cqw;border-radius:999px;background:linear-gradient(90deg,#3b82f6,#22d3ee 60%,#2dd4bf);box-shadow:0 0 2cqw rgba(34,211,238,.45);white-space:nowrap;transition:transform .25s,box-shadow .25s}
#faq .fq-cta:hover{transform:translateY(-2px);box-shadow:0 0 3cqw rgba(34,211,238,.75)}
@keyframes fqRun{to{stroke-dashoffset:-990}}
@keyframes fqGlow{0%,100%{opacity:.65}50%{opacity:1}}
@keyframes fqSheen{from{background-position:160% 0}to{background-position:-60% 0}}
@keyframes fqSign{0%,70%,100%{opacity:0}82%{opacity:.8}}
@keyframes fqScan{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@media (max-width:899px){
 #faq .fq-stage{aspect-ratio:auto;padding:80px 16px 64px}
 #faq .fq-head{position:relative;left:auto;width:auto;max-width:560px;margin:0 auto;pointer-events:auto}
 #faq .fq-head h2,#faq .fq-head p{position:static;width:auto}
 #faq .fq-head h2{font-size:clamp(1.9rem,8.4vw,2.6rem);line-height:1.08;margin-bottom:14px}
 #faq .fq-head p{font-size:1rem;line-height:1.5}
 #faq .fq-head br{display:none}
 #faq .fq-list{position:relative;inset:auto;max-width:560px;margin:calc(47.6vw + 10px) auto 0;display:flex;flex-direction:column;gap:12px;pointer-events:auto}
 #faq .fq-p{position:relative;left:auto!important;top:auto!important;width:auto!important;height:auto!important;clip-path:none!important;padding:18px 48px 18px 18px;border-radius:16px;background:linear-gradient(160deg,rgba(26,38,64,.75),rgba(8,12,26,.85));border:1px solid rgba(140,210,255,.22);box-shadow:0 10px 30px -12px rgba(0,0,0,.8)}
 #faq .fq-p::before{content:"+";position:absolute;right:18px;top:50%;transform:translateY(-50%);color:#22d3ee;font-size:1.5rem;line-height:1;transition:transform .3s}
 #faq .fq-p[aria-expanded=true]::before{transform:translateY(-50%) rotate(45deg)}
 #faq .fq-q{position:static;transform:none!important;width:auto!important;font-size:1rem!important;line-height:1.4!important;font-weight:500}
 #faq .fq-num{display:block;font-size:.7rem;letter-spacing:.2em;color:#5eead4;margin-bottom:6px}
 #faq .fq-lines,#faq .fq-sign,#faq .fq-dim{display:none}
 #faq .fq-card{position:relative;left:auto!important;top:auto!important;width:auto;padding:18px;border-radius:16px;transform:none;opacity:1;display:none;margin-top:-4px}
 #faq .fq-card.on{display:block;animation:fqDrop .45s cubic-bezier(.2,.8,.2,1)}
 #faq .fq-ct{font-size:.7rem;margin-bottom:8px}
 #faq .fq-card h3{display:none}
 #faq .fq-ans p{font-size:.98rem}
 #faq .fq-x{display:none}
 #faq .fq-ft{margin-top:14px;padding-top:12px}
 #faq .fq-nav button{width:36px;height:36px;font-size:1rem}
 #faq .fq-cta{font-size:.9rem;padding:10px 16px}
}
@keyframes fqDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#faq *{animation:none!important;transition:none!important}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- DOM ----------
  const head = sec.querySelector('.sec-head');
  const items = [...sec.querySelectorAll('.faq-item')];
  const wrap = sec.querySelector('.wrap');
  const stage = document.createElement('div'); stage.className = 'fq-stage';
  const cv = document.createElement('canvas'); cv.className = 'fq-bg'; cv.setAttribute('aria-hidden', 'true');
  stage.appendChild(cv);
  const words = (el, delay0, step) => { let k = 0; el.innerHTML = el.innerHTML.split(/(<br>)/).map(seg => seg === '<br>' ? ' <br>' : seg.trim().split(/\s+/).map(w => `<span class="w" style="transition-delay:${(delay0 + k++ * step).toFixed(2)}s">${w}</span>`).join(' ')).join(''); };
  const hd = document.createElement('div'); hd.className = 'fq-head';
  if (head) {
    head.classList.remove('reveal', 'in');
    [...head.children].forEach(n => hd.appendChild(n));
    const h2 = hd.querySelector('h2'), p = hd.querySelector('p');
    if (h2) { h2.innerHTML = 'Najczęstsze pytania<br>o strony 3D<br>i automatyzacje AI.'; words(h2, 0, .07); }
    if (p) { p.innerHTML = 'Krótko o cenach, czasie realizacji, szybkości,<br>SEO i bezpieczeństwie danych.'; words(p, .5, .03); }
  }
  stage.appendChild(hd);

  // obrysy paneli
  const svgNS = 'http://www.w3.org/2000/svg';
  const lines = document.createElementNS(svgNS, 'svg'); lines.setAttribute('class', 'fq-lines'); lines.setAttribute('viewBox', `0 0 ${IW} ${IH}`); lines.setAttribute('preserveAspectRatio', 'none'); lines.setAttribute('aria-hidden', 'true');
  lines.innerHTML = '<defs><linearGradient id="fqg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#5eead4"/></linearGradient></defs>' + P.map(p => `<polygon points="${p.q.map(v => v.join(',')).join(' ')}"/>`).join('');
  stage.appendChild(lines);
  const polys = [...lines.querySelectorAll('polygon')];

  const list = document.createElement('div'); list.className = 'fq-list';
  const card = document.createElement('div'); card.className = 'fq-card'; card.id = 'fq-card'; card.setAttribute('role', 'region'); card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<div class="fq-ct"><span class="fq-n">01 / 07</span><i></i></div><button class="fq-x" type="button" aria-label="Zamknij odpowiedź">×</button><h3></h3><div class="fq-ans"></div><div class="fq-ft"><div class="fq-nav"><button type="button" class="fq-prev" aria-label="Poprzednie pytanie">‹</button><button type="button" class="fq-next" aria-label="Następne pytanie">›</button></div><a class="fq-cta" href="#kontakt">Zapytaj o swoją stronę →</a></div>';
  const ans = card.querySelector('.fq-ans');
  const panels = P.map((p, i) => {
    const it = items[i];
    const qText = it ? it.querySelector('summary').textContent.trim() : '';
    const aP = it ? it.querySelector('p') : null;
    const [x0, y0, x1, y1] = bbox(p.q), bw = x1 - x0, bh = y1 - y0;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fq-p';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'fq-card');
    b.style.cssText = `left:${(x0 / IW * 100).toFixed(3)}%;top:${(y0 / IH * 100).toFixed(3)}%;width:${(bw / IW * 100).toFixed(3)}%;height:${(bh / IH * 100).toFixed(3)}%;clip-path:polygon(${p.q.map(([x, y]) => `${((x - x0) / bw * 100).toFixed(2)}% ${((y - y0) / bh * 100).toFixed(2)}%`).join(',')})`;
    const [tx, ty, ta, fs, lh, tw] = p.t;
    b.innerHTML = `<span class="fq-sheen"></span><span class="fq-num">${String(i + 1).padStart(2, '0')}</span><span class="fq-q" style="left:${((tx - x0) / bw * 100).toFixed(2)}%;top:${((ty - y0) / bh * 100).toFixed(2)}%;width:${cq(tw)};font-size:${cq(fs)};line-height:${cq(lh)};transform:skewY(${ta}deg)">${qText}</span>`;
    words(b.querySelector('.fq-q'), .9 + i * .12, .04);
    list.appendChild(b);
    const a = document.createElement('div'); a.hidden = true; if (aP) a.appendChild(aP); ans.appendChild(a);
    return { b, q: qText, a, i, cx: (p.q[0][0] + p.q[1][0] + p.q[2][0] + p.q[3][0]) / 4, cy: (p.q[0][1] + p.q[1][1] + p.q[2][1] + p.q[3][1]) / 4, bx: (p.q[2][0] + p.q[3][0]) / 2, by: (p.q[2][1] + p.q[3][1]) / 2 };
  });
  stage.appendChild(list);
  // przyciski-tabliczki z grafiki
  const sign = (txt, href, x, y, w, h, tr, fs, ls) => { const a = document.createElement('a'); a.className = 'fq-sign'; a.href = href; a.innerHTML = txt; a.style.cssText = `left:${(x / IW * 100).toFixed(3)}%;top:${(y / IH * 100).toFixed(3)}%;width:${(w / IW * 100).toFixed(3)}%;height:${(h / IH * 100).toFixed(3)}%;transform:${tr};font-size:${cq(fs)};line-height:1.15;letter-spacing:${ls}`; stage.appendChild(a); return a; };
  sign('Zobacz system', '#automatyzacje', 78, 612, 156, 36, 'rotate(-15deg)', 16.2, '.01em');
  sign('Zadaj<br>pytanie', '#kontakt', 1222, 598, 118, 62, 'skewY(21deg)', 15.5, '.02em');
  const dim = document.createElement('div'); dim.className = 'fq-dim'; stage.appendChild(dim);
  stage.appendChild(card);
  if (wrap) wrap.remove();
  sec.appendChild(stage); sec.classList.add('fq');

  // ---------- otwieranie odpowiedzi ----------
  const mobile = () => innerWidth < 900;
  let open = -1, typeT = 0;
  const typeIn = el => {
    clearInterval(typeT); const p = el.querySelector('p'); if (!p) return;
    if (!p.dataset.w) { p.dataset.w = 1; p.innerHTML = p.textContent.split(/(\s+)/).map(w => /\s/.test(w) ? w : `<span class="w">${w}</span>`).join(''); }
    const ws = [...p.querySelectorAll('.w')]; ws.forEach(w => w.classList.remove('on'));
    if (RM) { ws.forEach(w => w.classList.add('on')); return; }
    let k = 0; typeT = setInterval(() => { for (let n = 0; n < 2 && k < ws.length; n++) ws[k++].classList.add('on'); if (k >= ws.length) clearInterval(typeT); }, 28);
  };
  const place = pn => {
    if (mobile()) { pn.b.after(card); card.style.left = card.style.top = ''; return; }
    stage.appendChild(card);
    const W = stage.clientWidth, H = stage.clientHeight, s = W / IW;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x = pn.cx * s - cw / 2, y = pn.cy * s - ch / 2;
    x = Math.max(.012 * W, Math.min(W - cw - .012 * W, x)); y = Math.max(.012 * W, Math.min(H - ch - .012 * W, y));
    card.style.left = x + 'px'; card.style.top = y + 'px';
    card.style.transformOrigin = `${pn.cx * s - x}px ${pn.cy * s - y}px`;
  };
  const show = (i, from) => {
    if (i < 0) i = panels.length - 1; if (i >= panels.length) i = 0;
    panels.forEach((p, k) => { p.a.hidden = k !== i; p.b.setAttribute('aria-expanded', k === i ? 'true' : 'false'); polys[k].classList.toggle('open', k === i); });
    const pn = panels[i]; open = i;
    card.querySelector('.fq-n').textContent = `${String(i + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
    card.querySelector('h3').textContent = pn.q;
    const was = card.classList.contains('on');
    if (!was) { card.classList.remove('on'); place(pn); void card.offsetWidth; }
    else place(pn);
    card.classList.add('on'); sec.classList.add('fq-open');
    typeIn(pn.a); burst(i);
    if (from !== 'nav' && mobile()) setTimeout(() => pn.b.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }), 60);
  };
  const close = () => {
    if (open < 0) return; const pn = panels[open]; open = -1;
    card.classList.remove('on'); sec.classList.remove('fq-open');
    panels.forEach((p, k) => { p.b.setAttribute('aria-expanded', 'false'); polys[k].classList.remove('open'); });
    if (!mobile()) pn.b.focus({ preventScroll: true });
  };
  panels.forEach((pn, i) => {
    pn.b.addEventListener('click', () => { open === i ? close() : show(i); });
    pn.b.addEventListener('pointerenter', e => { if (e.pointerType === 'touch') return; hot = i; polys[i].classList.add('on'); });
    pn.b.addEventListener('pointerleave', () => { if (hot === i) hot = -1; polys[i].classList.remove('on'); });
  });
  card.querySelector('.fq-x').addEventListener('click', close);
  card.querySelector('.fq-prev').addEventListener('click', () => show(open - 1, 'nav'));
  card.querySelector('.fq-next').addEventListener('click', () => show(open + 1, 'nav'));
  card.querySelector('.fq-cta').addEventListener('click', () => close());
  dim.addEventListener('click', close);
  addEventListener('keydown', e => {
    if (open < 0) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(open + 1, 'nav');
    else if (e.key === 'ArrowLeft') show(open - 1, 'nav');
  });

  // ---------- warstwy z grafiki ----------
  const bgImg = new Image(); bgImg.src = '/img/faq-bg.avif';
  let glass = null, leds = null, sat = null, ready = false;
  const SKY = [];
  const GL = '1373,510,1,157,292,1,295,471,.99,426,409,.99,169,321,.96,649,543,.96,527,521,.95,281,450,.94,1398,452,.94,405,513,.93,479,395,.93,289,480,.93,72,636,.93,326,486,.91,211,321,.9,258,460,.9,1276,457,.89,625,698,.89,398,445,.88,320,593,.88,152,560,.87,749,592,.87,609,702,.87,1236,296,.86,821,578,.86,353,568,.86,948,450,.86,335,379,.86,278,475,.86,70,650,.86,633,562,.86,406,467,.86,403,603,.86,1229,490,.86,166,483,.85,222,488,.85,244,465,.84,745,574,.84,222,585,.84,295,497,.83'.split(',').map(Number);
  const GLINTS = []; for (let k = 0; k < GL.length; k += 3) GLINTS.push([GL[k], GL[k + 1], GL[k + 2], Math.random() * 6.28, .5 + Math.random() * .9]);
  const inQuad = (x, y) => P.some(p => { let c = false; const q = p.q; for (let i = 0, j = 3; i < 4; j = i++) { const [xi, yi] = q[i], [xj, yj] = q[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; });
  const prep = () => {
    const c = document.createElement('canvas'); c.width = IW; c.height = IH; const x = c.getContext('2d'); x.drawImage(bgImg, 0, 0);
    let d; try { d = x.getImageData(0, 0, IW, IH); } catch (e) { ready = true; return; }
    const D = d.data;
    const mk = () => { const k = document.createElement('canvas'); k.width = IW; k.height = IH; const kx = k.getContext('2d'); return [k, kx, kx.createImageData(IW, IH)]; };
    const [gC, gX, gI] = mk(), [lC, lX, lI] = mk();
    for (let y = 0; y < IH; y++) for (let xx = 0; xx < IW; xx++) {
      const i = (y * IW + xx) * 4, r = D[i], g = D[i + 1], b = D[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = (r + g + b) / 3, s = mx - mn;
      let ga = Math.max(0, Math.min(1, (L - 150) / 70)) * Math.max(0, Math.min(1, 1 - (s - 30) / 40));
      if (y < 150 || (xx > 500 && xx < 790 && y < 268 && !(xx > 555 && y > 228))) ga = 0;
      if (ga > 0) { gI.data[i] = Math.min(255, r + 30); gI.data[i + 1] = Math.min(255, g + 40); gI.data[i + 2] = 255; gI.data[i + 3] = ga * 255; }
      const la = Math.max(0, Math.min(1, (Math.min(g, b) - r - 25) / 40)) * Math.max(0, Math.min(1, (L - 80) / 50));
      if (la > 0 && y > 150) { lI.data[i] = r; lI.data[i + 1] = g; lI.data[i + 2] = b; lI.data[i + 3] = la * 255; }
    }
    gX.putImageData(gI, 0, 0); lX.putImageData(lI, 0, 0); glass = gC; leds = lC;
    // Saturn: maska jasności
    sat = document.createElement('canvas'); sat.width = 540; sat.height = 170;
    const sx = sat.getContext('2d'); const sd = sx.createImageData(540, 170);
    for (let y = 0; y < 170; y++) for (let xx = 0; xx < 540; xx++) {
      const i = (y * IW + xx + 939) * 4, o = (y * 540 + xx) * 4, L = (D[i] + D[i + 1] + D[i + 2]) / 3;
      const e = Math.min(1, xx / 60, (540 - xx) / 20, (170 - y) / 30);
      sd.data[o] = D[i]; sd.data[o + 1] = D[i + 1]; sd.data[o + 2] = D[i + 2]; sd.data[o + 3] = 255 * Math.max(0, Math.min(1, (L - 50) / 90)) * Math.max(0, e);
    }
    sx.putImageData(sd, 0, 0);
    // gwiazdy: losowe punkty w ciemnym niebie
    let tries = 0;
    while (SKY.length < 150 && tries++ < 6000) {
      const xx = Math.random() * IW | 0, y = Math.random() * IH | 0; let dark = true;
      for (let dy = -6; dy <= 6 && dark; dy += 3) for (let dx = -6; dx <= 6; dx += 3) { const yy = Math.min(IH - 1, Math.max(0, y + dy)), x2 = Math.min(IW - 1, Math.max(0, xx + dx)), i = (yy * IW + x2) * 4; if (D[i] + D[i + 1] + D[i + 2] > 140) { dark = false; break; } }
      if (!dark || inQuad(xx, y)) continue;
      SKY.push([xx, y, .25 + Math.random() * .75, Math.random() * 6.28, .5 + Math.random() * 1.8, Math.random() < .12]);
    }
    ready = true;
  };
  const tmp = document.createElement('canvas'); tmp.width = IW; tmp.height = IH; const tc = tmp.getContext('2d');
  const tmpS = document.createElement('canvas'); tmpS.width = 540; tmpS.height = 170;

  // ---------- render ----------
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, mob = false, sc = 1, ox = 0, oy = 0, hot = -1;
  const ptr = { in: false, x: 0, y: 0 };
  const size = () => {
    const r = stage.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.6);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    mob = innerWidth < 900;
    if (!mob) { sc = W / IW; ox = 0; oy = 0; }
    else { const lr = list.getBoundingClientRect(); sc = W / IW; ox = 0; oy = Math.max(0, lr.top - r.top - IH * sc - 6); }
    if (open >= 0) place(panels[open]);
  };
  const dot = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const DUST = Array.from({ length: 130 }, () => [Math.random() * IW, Math.random() * IH, Math.random(), Math.random() * 6.28]);
  const PULSES = []; // impulsy z piasty do paneli
  const burst = i => { const pn = panels[i]; for (let n = 0; n < 3; n++) PULSES.push({ i, t0: (performance.now() - t0) / 1000 + n * .12, d: .9 }); waveBoost = 1; };
  let waveBoost = 0, shoot = null, nextShoot = 2.5, nextPing = 3, pingI = 0;
  const pathPt = (pn, u) => { // krzywa od piasty do podstawy panelu
    const [hx, hy] = HUB, mx = (hx + pn.bx) / 2, my = Math.max(hy, pn.by) + 40;
    const v = 1 - u; return [v * v * hx + 2 * v * u * mx + u * u * pn.bx, v * v * hy + 2 * v * u * my + u * u * pn.by];
  };
  const drawBg = t => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#02030a'; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    if (!(bgImg.complete && bgImg.naturalWidth)) return;
    g.drawImage(bgImg, 0, 0, IW, IH);
    if (!ready) prep();
    g.globalCompositeOperation = 'lighter';
    // galaktyka: oddychające jądro i mgławica
    dot(730, 214, 150, `rgba(255,190,150,${(.035 + .03 * Math.sin(t * .6)).toFixed(3)})`);
    dot(733, 212, 46, `rgba(255,240,215,${(.06 + .05 * Math.sin(t * 1.2)).toFixed(3)})`);
    dot(560, 190, 90, `rgba(255,120,170,${(.04 + .04 * Math.sin(t * .45 + 1)).toFixed(3)})`);
    dot(1290, 230, 70, `rgba(120,170,255,${(.05 + .05 * Math.sin(t * .7 + 2)).toFixed(3)})`);
    // Saturn: światło sunące po pierścieniu i tarczy
    if (sat) {
      const sx = tmpS.getContext('2d'); sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, 540, 170); sx.drawImage(sat, 0, 0);
      sx.globalCompositeOperation = 'destination-in';
      const p = ((t * 50) % 880) - 170, lg = sx.createLinearGradient(p - 90, 0, p + 90, 50);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, 'rgba(0,0,0,.6)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      sx.fillStyle = lg; sx.fillRect(0, 0, 540, 170); g.drawImage(tmpS, 939, 0);
    }
    // gwiazdy
    SKY.forEach(([x, y, b, p, s, fl]) => {
      const v = b * (.5 + .5 * Math.sin(t * s + p)); if (v < .08) return;
      dot(x, y, 1.8 + 3 * v, `rgba(215,232,255,${(.8 * v).toFixed(3)})`);
      if (fl && v > .55) { g.fillStyle = `rgba(255,255,255,${((v - .55) * 1.6).toFixed(3)})`; const r = 3 + 8 * v; g.fillRect(x - r, y - .3, r * 2, .6); g.fillRect(x - .3, y - r, .6, r * 2); }
    });
    // pył
    DUST.forEach(d => {
      const dp = .3 + d[2] * .9; let x = (d[0] - t * 5 * dp) % IW; if (x < 0) x += IW;
      const y = d[1] + Math.sin(t * .25 + d[3]) * 3, a = (.22 + .3 * Math.sin(t * (1 + d[2]) + d[3])) * dp; if (a <= .02) return;
      g.fillStyle = `rgba(190,215,255,${a.toFixed(3)})`; g.fillRect(x, y, .7 + d[2] * .9, .7 + d[2] * .9);
    });
    // spadające gwiazdy
    if (t > nextShoot && !shoot) { shoot = { x: 80 + Math.random() * 900, y: 10 + Math.random() * 120, a: .2 + Math.random() * .25, t0: t, L: 110 + Math.random() * 110 }; nextShoot = t + 5 + Math.random() * 6; }
    if (shoot) {
      const u = (t - shoot.t0) / 1.1; if (u > 1) shoot = null; else {
        const hx = shoot.x + Math.cos(shoot.a) * 420 * u, hy = shoot.y + Math.sin(shoot.a) * 420 * u, al = Math.sin(u * Math.PI);
        const lg = g.createLinearGradient(hx, hy, hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L);
        lg.addColorStop(0, `rgba(255,255,255,${al.toFixed(3)})`); lg.addColorStop(1, 'rgba(120,200,255,0)');
        g.strokeStyle = lg; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L); g.stroke();
        dot(hx, hy, 6, `rgba(220,240,255,${(.8 * al).toFixed(3)})`);
      }
    }
    // statek po lewej: światła pozycyjne
    if (Math.sin(t * 3) > .75) dot(210, 318, 4, 'rgba(255,90,90,.9)');
    if (Math.sin(t * 3 + 2.2) > .8) dot(160, 330, 3.5, 'rgba(120,255,220,.9)');
    // fale energii z piasty po szklanych torach + przelatujący połysk
    if (glass) {
      tc.globalCompositeOperation = 'source-over'; tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, IW, IH); tc.drawImage(glass, 0, 0);
      tc.globalCompositeOperation = 'destination-in';
      tc.setTransform(1, 0, 0, .5, HUB[0], HUB[1]);
      const R = 1500, rg = tc.createRadialGradient(0, 0, 0, 0, 0, R), sp = 1.9, stops = [];
      for (let n = 0; n < 4; n++) { const r = ((t / sp + n / 4) % 1) * R; stops.push(r); }
      stops.sort((a, b) => a - b);
      rg.addColorStop(0, 'rgba(0,0,0,0)');
      stops.forEach(r => { const a = Math.max(0, 1 - r / R) * (.7 + .3 * waveBoost); const w = 70; [[r - w, 0], [r, a], [r + w * .4, 0]].forEach(([o, al]) => { if (o > 0 && o < R) rg.addColorStop(o / R, `rgba(0,0,0,${al.toFixed(3)})`); }); });
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = rg; tc.fillRect(-R, -R, R * 2, R * 2);
      tc.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = .55; g.drawImage(tmp, 0, 0); g.globalAlpha = 1;
      // ukośny połysk szkła
      tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, IW, IH); tc.drawImage(glass, 0, 0); tc.globalCompositeOperation = 'destination-in';
      const gp = ((t * 210) % 2600) - 500, lg = tc.createLinearGradient(gp - 120, 0, gp + 120, 260);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, 'rgba(0,0,0,.75)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = lg; tc.fillRect(0, 0, IW, IH); g.drawImage(tmp, 0, 0);
      waveBoost *= .97;
    }
    // diody i turkusowe akcenty
    if (leds) { g.globalAlpha = .35 + .3 * Math.sin(t * 2.1); g.drawImage(leds, 0, 0); g.globalAlpha = 1; }
    // piasta n8n: wirujące światła na pierścieniach
    const ring = (cx, cy, rx, ry, sp, n, col, lw) => {
      for (let k = 0; k < n; k++) {
        const a0 = t * sp + k * Math.PI * 2 / n;
        g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
        g.strokeStyle = col; g.lineWidth = lw * rx / ry * .45; g.lineCap = 'round';
        g.beginPath(); g.arc(0, 0, rx, a0, a0 + .55); g.stroke(); g.restore();
      }
    };
    g.filter = 'blur(1.5px)';
    ring(801, 452, 74, 27, .9, 3, 'rgba(120,235,255,.55)', 3);
    ring(805, 512, 63, 22, -1.3, 4, 'rgba(70,240,230,.7)', 3);
    ring(805, 516, 101, 37, .55, 2, 'rgba(140,200,255,.45)', 3);
    g.filter = 'none';
    dot(812, 458, 26, `rgba(140,240,255,${(.18 + .14 * Math.sin(t * 2.6)).toFixed(3)})`);
    dot(809, 510, 30, `rgba(110,250,235,${(.2 + .16 * Math.sin(t * 2.6 + 1.5)).toFixed(3)})`);
    // iskry na szkle
    GLINTS.forEach(([x, y, b, p, s]) => {
      const v = Math.max(0, Math.sin(t * s + p)) ** 6 * b; if (v < .05) return;
      dot(x, y, 3 + 6 * v, `rgba(230,250,255,${(.8 * v).toFixed(3)})`);
      g.fillStyle = `rgba(255,255,255,${(.9 * v).toFixed(3)})`; const r = 4 + 10 * v; g.fillRect(x - r, y - .35, r * 2, .7); g.fillRect(x - .35, y - r, .7, r * 2);
    });
    // zaczepka: co kilka sekund impuls do kolejnego panelu
    if (!mob && open < 0 && t > nextPing) {
      nextPing = t + 3.2; const k = pingI++ % panels.length;
      PULSES.push({ i: k, t0: t, d: 1.1 });
      setTimeout(() => { polys[k].classList.add('ping'); panels[k].b.classList.add('ping'); setTimeout(() => { polys[k].classList.remove('ping'); panels[k].b.classList.remove('ping'); }, 1400); }, 1000);
    }
    if (hot >= 0 && Math.random() < .06) PULSES.push({ i: hot, t0: t, d: .8 });
    for (let n = PULSES.length - 1; n >= 0; n--) {
      const pu = PULSES[n], u = (t - pu.t0) / pu.d; if (u < 0) continue; if (u > 1) { PULSES.splice(n, 1); if (!mob) dot(panels[pu.i].bx, panels[pu.i].by, 22, 'rgba(120,240,255,.5)'); continue; }
      const pn = panels[pu.i];
      for (let k = 0; k < 10; k++) { const v = u - k * .018; if (v < 0) break; const [x, y] = pathPt(pn, v); dot(x, y, 5 - k * .4, `rgba(${k ? '90,220,255' : '230,255,255'},${(.95 - k * .09).toFixed(3)})`); }
    }
    // światło za kursorem
    if (ptr.in && !mob) { const ix = (ptr.x - ox) / sc, iy = (ptr.y - oy) / sc; dot(ix, iy, 170, 'rgba(60,140,255,.07)'); dot(ix, iy, 46, 'rgba(120,220,255,.06)'); }
    g.globalCompositeOperation = 'source-over';
    if (mob) { // pod sceną płynne przejście w ciemny kosmos
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const top = oy, bot = oy + IH * sc;
      let fg = g.createLinearGradient(0, top, 0, top + 40); fg.addColorStop(0, '#02030a'); fg.addColorStop(1, 'rgba(2,3,10,0)'); g.fillStyle = fg; g.fillRect(0, top - 1, W, 41);
      fg = g.createLinearGradient(0, bot - 50, 0, bot); fg.addColorStop(0, 'rgba(2,3,10,0)'); fg.addColorStop(1, '#02030a'); g.fillStyle = fg; g.fillRect(0, bot - 50, W, 51);
      g.globalCompositeOperation = 'lighter';
      DUST.forEach((d, i) => { const x = (d[0] / IW) * W, y = ((d[1] / IH) * H + i * 53) % H; if (y > top - 10 && y < bot) return; const a = .2 + .3 * Math.sin(t * (1 + d[2]) + d[3]); if (a > 0) { g.fillStyle = `rgba(200,220,255,${a.toFixed(3)})`; g.fillRect(x, y, 1.1, 1.1); } });
      g.globalCompositeOperation = 'source-over';
    }
  };

  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true; });
  stage.addEventListener('pointerleave', () => { ptr.in = false; });

  // ---------- pętla ----------
  let vis = false, raf = 0; const t0 = performance.now();
  const loop = now => {
    raf = 0; if (!vis) return;
    drawBg(RM ? 0 : (now - t0) / 1000);
    if (!RM) raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    vis = e.isIntersecting;
    if (vis) { sec.classList.add('fq-in'); if (!raf) raf = requestAnimationFrame(loop); }
  }), { threshold: [0, .12] });
  io.observe(stage);
  addEventListener('resize', () => { size(); if (vis && !raf) raf = requestAnimationFrame(loop); });
  bgImg.onload = () => { size(); if (vis && !raf) raf = requestAnimationFrame(loop); };
  size();
})();
