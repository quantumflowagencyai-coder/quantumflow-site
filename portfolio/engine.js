// QuantumFlow Portfolio engine: loader, Lenis + GSAP ScrollTrigger, sekwencje klatek przewijane scrollem,
// cząsteczki Three.js w kolorze akcentu, kinetyczna typografia, kalkulator. Wspólny dla 4 stron koncepcyjnych.
import * as THREE from '/three.module.min.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = getComputedStyle(document.documentElement);
const ACC = css.getPropertyValue('--acc').trim() || '#ff5a1f';
const DPR = Math.min(devicePixelRatio || 1, 2);
const LIGHT = document.documentElement.dataset.theme === 'light';

/* ---------- loader ---------- */
const loader = $('#loader'), lNum = $('#loader .l-num span'), lBar = $('#loader .l-bar i');
const tasks = []; let shown = 0, target = 0;
const LMAX = +(loader && loader.dataset.max) || 100;
const track = p => { tasks.push(p); p.finally(() => { target = tasks.filter(t => t.done).length; }); p.then(() => (p.done = true), () => (p.done = true)); return p; };
function loaderTick() {
  const real = tasks.length ? tasks.filter(t => t.done).length / tasks.length : 0;
  shown += (real * 100 - shown) * 0.12 + 0.25; shown = Math.min(shown, real * 100);
  const v = Math.round(shown);
  lNum.textContent = String(Math.round(v * LMAX / 100)).padStart(2, '0'); lBar.style.width = v + '%';
  if (real >= 1 && v >= 99) { lNum.textContent = String(LMAX); lBar.style.width = '100%'; setTimeout(start, 250); return; }
  requestAnimationFrame(loaderTick);
}

/* ---------- Lenis ---------- */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
  lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
}));

/* ---------- pigułka postępu ---------- */
const pc = $('.pill .pc'), pt = $('.pill .pt i');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const v = Math.round(s.progress * 100); pc.textContent = v + '%'; pt.style.width = v + '%'; } });
// pigułka chowa się na samej górze hero, żeby nie zasłaniać paska haseł
const pill = $('.pill'); const pillVis = () => pill && pill.classList.toggle('hid', scrollY < innerHeight * .25); pillVis(); addEventListener('scroll', pillVis, { passive: true });

/* ---------- cząsteczki Three.js ---------- */
let scrollVel = 0;
(function particles() {
  const cv = $('#pf-gl'); if (!cv) return;
  const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: 'high-performance' });
  r.setPixelRatio(DPR); r.setSize(innerWidth, innerHeight, false);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100); cam.position.z = 10;
  const N = innerWidth < 700 ? 900 : 2200, pos = new Float32Array(N * 3), sp = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 30; pos[i * 3 + 1] = (Math.random() - .5) * 20; pos[i * 3 + 2] = (Math.random() - .5) * 14; sp[i] = .2 + Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('sp', new THREE.BufferAttribute(sp, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: LIGHT ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, v: { value: 0 }, c: { value: new THREE.Color(ACC) }, px: { value: DPR } },
    vertexShader: `attribute float sp;uniform float t,v,px;varying float a;void main(){vec3 p=position;p.y=mod(p.y+t*.25*sp+v*sp*2.+10.,20.)-10.;p.x+=sin(t*.3*sp+p.y)*.3;vec4 m=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*m;gl_PointSize=px*(1.5+sp*2.4)*(10./-m.z);a=.25+.6*sp;}`,
    fragmentShader: `uniform vec3 c;varying float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(c,a*smoothstep(.5,0.,d));}`
  });
  scene.add(new THREE.Points(g, mat));
  addEventListener('resize', () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
  let acc = 0;
  gsap.ticker.add((t) => { acc += (scrollVel - acc) * .08; mat.uniforms.t.value = t; mat.uniforms.v.value += acc * .002; scrollVel *= .9; r.render(scene, cam); });
  if (lenis) lenis.on('scroll', e => { scrollVel = Math.max(-40, Math.min(40, e.velocity)); });
})();

// bez cząsteczek: prędkość scrolla liczona osobno (pasek haseł z niej korzysta)
if (!$('#pf-gl') && lenis) { lenis.on('scroll', ev => { scrollVel = Math.max(-40, Math.min(40, ev.velocity)); }); gsap.ticker.add(() => { scrollVel *= .9; }); }

/* ---------- hero ---------- */
const hv = $('.hero-media video');
if (hv) {
  track(new Promise(res => { hv.addEventListener('loadeddata', res, { once: true }); hv.addEventListener('error', res, { once: true }); setTimeout(res, 2500); }));
  hv.addEventListener('error', () => hv.remove(), true);
}
const hi = $('.hero-media img'); if (hi) track(hi.decode ? hi.decode().catch(() => { hi.style.display = 'none'; }) : Promise.resolve());
track(document.fonts ? document.fonts.ready : Promise.resolve());

/* ---------- sekwencje klatek ---------- */
function coverDraw(ctx, img, w, h, scale = 1) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * scale, dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}
function fallbackObject(ctx, w, h, p, kind) {
  // zastępczy obiekt 3D z punktów (dopóki nie ma klatek z Higgsfield)
  ctx.clearRect(0, 0, w, h);
  const R = Math.min(w, h) * .26, cx = w / 2, cy = h / 2, rot = p * Math.PI * 2, n = 1400;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963 + rot;
    let x = Math.cos(th) * rad, z = Math.sin(th) * rad, yy = y;
    if (kind === 'tower') { x *= .45; z *= .45; yy *= 1.5; }
    if (kind === 'burst') { const k = 1 + p * 2.6 * (0.5 + ((i * 7919) % 100) / 100); x *= k; yy *= k; z *= k; }
    const d = 1 / (2.4 - z), sx = cx + x * R * d * 2.2, sy = cy + yy * R * d * 2.2;
    ctx.globalAlpha = (kind === 'burst' ? 1 - p * .8 : 1) * (.25 + (z + 1) * .35);
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(sx, sy, (z + 1.6) * DPR, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function sequence(sec) {
  const cv = $('canvas', sec), ctx = cv.getContext('2d');
  const src = sec.dataset.src, count = +sec.dataset.count || 0, ext = sec.dataset.ext || 'webp', kind = sec.dataset.fallback || 'sphere';
  const frames = []; let ok = false, cur = 0, last = -1, progress = 0;
  const size = () => { cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; last = -1; draw(); };
  const draw = () => {
    if (ok) { const i = Math.min(count - 1, Math.round(progress * (count - 1))); let f = frames[i];
      if (!f || !f.complete || !f.naturalWidth) { for (let k = i; k >= 0; k--) if (frames[k] && frames[k].naturalWidth) { f = frames[k]; break; } }
      if (!f || (i === last)) return; last = i; ctx.clearRect(0, 0, cv.width, cv.height); coverDraw(ctx, f, cv.width, cv.height, +sec.dataset.scale || 1); }
    else fallbackObject(ctx, cv.width, cv.height, progress, kind);
  };
  if (count && src) {
    const url = i => `${src}/${String(i + 1).padStart(4, '0')}.${ext}`;
    const first = new Image(); first.src = url(0); frames[0] = first;
    track(new Promise(res => { first.onload = () => { ok = true; res(); size(); }; first.onerror = () => res(); }));
    // reszta klatek: ładowanie w tle, po kolei co 4. klatka, potem uzupełnienie
    const order = []; for (let s = 4; s >= 1; s = s / 2) for (let i = 0; i < count; i += s) if (!order.includes(i)) order.push(i); if (!order.includes(count - 1)) order.push(count - 1);
    let qi = 0; const pump = () => { for (let k = 0; k < 6 && qi < order.length; k++, qi++) { const i = order[qi]; if (frames[i]) continue; const im = new Image(); im.decoding = 'async'; im.src = url(i); im.onload = () => { if (Math.abs(i - Math.round(progress * (count - 1))) < 3) { last = -1; draw(); } }; frames[i] = im; } if (qi < order.length) setTimeout(pump, 60); };
    first.addEventListener('load', () => setTimeout(pump, 200));
  }
  addEventListener('resize', size); size();
  const words = $$('.sw', sec).map(el => ({ el, a: +el.dataset.in, b: +el.dataset.out }));
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => {
    progress = s.progress; draw();
    for (const w of words) { const t = progress < w.a ? 0 : progress > w.b ? 0 : Math.min(1, (progress - w.a) / .06, (w.b - progress) / .06); w.el.style.opacity = t; w.el.style.transform = `translateY(${(1 - t) * 40}px)`; }
    const hud = $('.seq-hud .cnt', sec); if (hud) hud.textContent = String(Math.round(progress * 100)).padStart(2, '0');
  } });
}
$$('.seq').forEach(sequence);

/* ---------- hero: efekty ---------- */
const hero = $('.hero'), FX = hero ? hero.dataset.fx : '';
const ACC2 = css.getPropertyValue('--acc2').trim() || ACC;
const finePtr = matchMedia('(pointer:fine)').matches;
const mouse = { x: innerWidth * .6, y: innerHeight * .45, vx: 0, vy: 0, on: false };
addEventListener('pointermove', e => { mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y; mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
const heroH1 = hero && $('h1.giant', hero);
let heroChars = [], introDone = false;
if (heroH1) {
  // litery w spanach (słowa nie łamią się w środku); czytnik ekranu dostaje całość z aria-label
  heroH1.setAttribute('aria-label', heroH1.textContent.replace(/\s+/g, ' ').trim());
  $$('.ln', heroH1).forEach(l => l.setAttribute('aria-hidden', 'true'));
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 1) return walk(c);
    if (c.nodeType !== 3) return;
    const f = document.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(' ')); return; }
      const wd = document.createElement('span'); wd.className = 'wd';
      for (const ch of part) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; wd.appendChild(s); }
      f.appendChild(wd);
    });
    c.replaceWith(f);
  });
  walk(heroH1);
  heroChars = $$('.ch', heroH1);
}
const hexRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const [ar, ag, ab] = hexRgb(ACC), [br, bg, bb] = hexRgb(ACC2);
const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
const rnd = (a, b) => a + Math.random() * (b - a);

const heroFx = (function () {
  const cv = hero && $('.hero-fx', hero); if (!cv || reduce) return null;
  const ctx = cv.getContext('2d'), small = innerWidth < 700;
  let W = 0, H = 0, top = 0, visible = true, t0 = performance.now();
  const size = () => { W = cv.width = hero.clientWidth * DPR; H = cv.height = hero.clientHeight * DPR; };
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hero);
  const P = [], extra = [];
  const local = () => [mouse.x * DPR, (mouse.y - top) * DPR];

  // ---- EMBER: żar i iskry unoszące się z ognia ----
  const ember = {
    n: small ? 70 : 150,
    spawn(x, y, vx, vy, big) { return { x: x ?? rnd(0, W), y: y ?? H + rnd(0, 40), vx: vx ?? rnd(-.3, .3) * DPR, vy: vy ?? -rnd(.6, 2.2) * DPR, s: rnd(.6, big ? 3.2 : 2.2) * DPR, life: 1, decay: rnd(.002, .006), ph: rnd(0, 7), heat: Math.random() }; },
    init() { for (let i = 0; i < this.n; i++) { const p = this.spawn(); p.y = rnd(0, H); P.push(p); } },
    burst(x, y, n = 40) { for (let i = 0; i < n; i++) { const a = rnd(-Math.PI, 0), v = rnd(2, 9) * DPR; extra.push(Object.assign(this.spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, true), { decay: rnd(.01, .025), fr: .97 })); } },
    step(t) {
      ctx.globalCompositeOperation = LIGHT ? 'source-over' : 'lighter';
      const [mx, my] = local();
      if (mouse.on && Math.hypot(mouse.vx, mouse.vy) > 6 && extra.length < 260) for (let k = 0; k < 2; k++) extra.push(Object.assign(this.spawn(mx, my, mouse.vx * .15 * DPR + rnd(-1, 1), mouse.vy * .15 * DPR - rnd(1, 3), true), { decay: rnd(.015, .03), fr: .965 }));
      const all = P.concat(extra);
      for (const p of all) {
        p.vx += Math.sin(t * .8 + p.y * .006) * .03 * DPR;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy), R = 160 * DPR;
        if (mouse.on && d < R) { const f = (1 - d / R) * .6; p.vx += dx / d * f; p.vy += dy / d * f - f * .4; }
        if (p.fr) { p.vx *= p.fr; p.vy = p.vy * p.fr - .04 * DPR; } else { p.vx *= .985; p.vy = Math.max(p.vy * .995, -4 * DPR); }
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        const fl = .55 + .45 * Math.sin(t * 9 + p.ph), a = Math.max(0, Math.min(1, p.life)) * fl;
        const r = Math.round(br + (ar - br) * p.heat), g = Math.round(bg + (ag - bg) * p.heat), b = Math.round(bb + (ab - bb) * p.heat);
        ctx.strokeStyle = rgba(r, g, b, a); ctx.lineWidth = p.s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
        ctx.fillStyle = rgba(r, g, b, a * .12); ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 5, 0, 7); ctx.fill();
      }
      for (let i = P.length - 1; i >= 0; i--) if (P[i].life <= 0 || P[i].y < -30) P[i] = this.spawn();
      for (let i = extra.length - 1; i >= 0; i--) if (extra[i].life <= 0) extra.splice(i, 1);
      // żar u dołu
      const g = ctx.createLinearGradient(0, H, 0, H * .6); g.addColorStop(0, rgba(ar, ag, ab, .16 + .05 * Math.sin(t * 2.3))); g.addColorStop(1, rgba(ar, ag, ab, 0));
      ctx.fillStyle = g; ctx.fillRect(0, H * .6, W, H * .4);
    }
  };

  // ---- LUMÉ: perłowe, opalizujące bąbelki i błysk ----
  const sprite = (rim) => { const c = document.createElement('canvas'), S = 256; c.width = c.height = S; const x = c.getContext('2d');
    let g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.02)'); g.addColorStop(.62, rgba(...rim, .06)); g.addColorStop(.86, rgba(...rim, .38)); g.addColorStop(.95, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(S / 2, S / 2, S / 2, 0, 7); x.fill();
    g = x.createRadialGradient(S * .36, S * .32, 0, S * .36, S * .32, S * .2); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(S * .36, S * .32, S * .2, 0, 7); x.fill(); return c; };
  const pearls = {
    init() {
      this.sp = [sprite([ar, ag, ab]), sprite([br, bg, bb]), sprite([170, 210, 255])];
      for (let i = 0; i < (small ? 16 : 30); i++) P.push({ x: rnd(0, W), y: rnd(0, H), z: rnd(.25, 1), r: rnd(14, 74) * DPR, ph: rnd(0, 7), k: i % 3, vy: rnd(.15, .5) * DPR });
      for (let i = 0; i < (small ? 40 : 90); i++) extra.push({ x: rnd(0, W), y: rnd(0, H), ph: rnd(0, 7), s: rnd(.5, 1.6) * DPR });
    },
    step(t) {
      ctx.globalCompositeOperation = 'screen';
      const px = (mouse.x / innerWidth - .5) * 60 * DPR, py = (mouse.y / innerHeight - .5) * 40 * DPR, [mx, my] = local();
      for (const p of P) {
        p.y -= p.vy * p.z; p.x += Math.sin(t * .5 + p.ph) * .25 * DPR;
        if (p.y < -p.r * 2) { p.y = H + p.r * 2; p.x = rnd(0, W); }
        const x = p.x + px * p.z, y = p.y + py * p.z, d = Math.hypot(x - mx, y - my), near = mouse.on ? Math.max(0, 1 - d / (220 * DPR)) : 0;
        const r = p.r * (1 + .06 * Math.sin(t * 1.3 + p.ph) + near * .25);
        ctx.globalAlpha = (.35 + .55 * p.z) * (.8 + near * .4);
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * .4 + p.ph) * .6); ctx.drawImage(this.sp[p.k], -r, -r, r * 2, r * 2); ctx.restore();
      }
      ctx.globalAlpha = 1;
      for (const s of extra) { const a = Math.max(0, Math.sin(t * 2 + s.ph)) ** 6; if (a < .02) continue;
        ctx.fillStyle = `rgba(255,255,255,${a * .9})`; ctx.beginPath(); ctx.arc(s.x + px * .3, s.y + py * .3, s.s * (1 + a), 0, 7); ctx.fill();
        ctx.fillRect(s.x + px * .3 - s.s * 5 * a, s.y + py * .3 - .5, s.s * 10 * a, 1); }
      // przesuwające się perłowe światło
      const sx = ((t * .08) % 1.6 - .3) * W, g = ctx.createLinearGradient(sx - W * .25, 0, sx + W * .25, H);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, rgba(br, bg, bb, .07)); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },
    burst() {}
  };

  // ---- IRONCLAD: pył magnezji, skaner, uderzenie ----
  const chalk = {
    init() { for (let i = 0; i < (small ? 120 : 260); i++) P.push({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-.15, .15) * DPR, vy: rnd(-.12, .05) * DPR, s: rnd(.4, 1.8) * DPR, a: rnd(.08, .4), ph: rnd(0, 7) }); },
    puff(x, y, vx, vy, n, sp = 1) { for (let i = 0; i < n && extra.length < 500; i++) { const a = rnd(0, 7), v = rnd(.2, 2.6) * DPR * sp; extra.push({ x, y, vx: Math.cos(a) * v + vx, vy: Math.sin(a) * v + vy, s: rnd(1, 4.5) * DPR, life: 1, decay: rnd(.008, .02), lime: Math.random() < .3 }); } },
    burst(x, y, n = 160) { this.puff(x, y, 0, -1 * DPR, n, 3.2); this.flash = 1; },
    step(t) {
      ctx.globalCompositeOperation = 'source-over';
      const [mx, my] = local();
      if (mouse.on && Math.hypot(mouse.vx, mouse.vy) > 4) this.puff(mx, my, mouse.vx * .08 * DPR, mouse.vy * .08 * DPR, 3);
      for (const p of P) { p.x += p.vx + Math.sin(t * .3 + p.ph) * .1; p.y += p.vy; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.fillStyle = `rgba(240,240,232,${p.a * (.7 + .3 * Math.sin(t + p.ph))})`; ctx.fillRect(p.x, p.y, p.s, p.s); }
      for (let i = extra.length - 1; i >= 0; i--) { const p = extra[i]; p.vx *= .955; p.vy = p.vy * .955 + .015 * DPR; p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.s += .05 * DPR;
        if (p.life <= 0) { extra.splice(i, 1); continue; }
        ctx.fillStyle = p.lime ? rgba(ar, ag, ab, p.life * .5) : `rgba(245,245,238,${p.life * .35})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); }
      // skaner: pozioma linia w kolorze akcentu
      const ph = (t * .28) % 1, y = ph * H * 1.3 - H * .15, g = ctx.createLinearGradient(0, y - 90 * DPR, 0, y);
      g.addColorStop(0, rgba(ar, ag, ab, 0)); g.addColorStop(1, rgba(ar, ag, ab, .14)); ctx.fillStyle = g; ctx.fillRect(0, y - 90 * DPR, W, 90 * DPR);
      ctx.fillStyle = rgba(ar, ag, ab, .7); ctx.fillRect(0, y, W, 1.2 * DPR);
      for (let k = 0; k < 6; k++) { const xx = ((k * 0.173 + t * .05) % 1) * W; ctx.fillRect(xx, y - 3 * DPR, 26 * DPR, 6 * DPR * .4); }
      if (this.flash > 0) { ctx.fillStyle = rgba(ar, ag, ab, this.flash * .22); ctx.fillRect(0, 0, W, H); this.flash -= .04; }
    }
  };

  // ---- MONOLIT: złote linie planu, wymiary, świetlny przelot ----
  const blueprint = {
    grid: 0, seg() {
      const G = this.grid, hor = Math.random() < .55, cols = Math.floor(W / G), rows = Math.floor(H / G);
      const x = Math.floor(rnd(0, cols)) * G, y = Math.floor(rnd(1, rows)) * G, len = Math.floor(rnd(2, 7)) * G * (Math.random() < .5 ? -1 : 1);
      return { x, y, hor, len, p: 0, hold: 0, life: 1, sp: rnd(.006, .014), lab: Math.random() < .35 ? (Math.abs(len) / G * rnd(2.8, 3.4)).toFixed(1) + ' m' : '', z: rnd(.4, 1) };
    },
    init() { this.grid = (small ? 56 : 84) * DPR; for (let i = 0; i < (small ? 12 : 22); i++) { const s = this.seg(); s.p = Math.random(); P.push(s); }
      for (let i = 0; i < (small ? 40 : 90); i++) extra.push({ x: rnd(0, W), y: rnd(0, H), vy: rnd(.1, .45) * DPR, s: rnd(.5, 1.8) * DPR, ph: rnd(0, 7) }); },
    burst() { this.sweep = 1; },
    step(t) {
      ctx.globalCompositeOperation = 'lighter';
      const px = (mouse.x / innerWidth - .5) * 30 * DPR, py = (mouse.y / innerHeight - .5) * 20 * DPR, G = this.grid;
      // delikatna siatka
      ctx.strokeStyle = rgba(ar, ag, ab, .045); ctx.lineWidth = 1;
      ctx.beginPath(); for (let x = (px * .3) % G; x < W; x += G) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = (py * .3) % G; y < H; y += G) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
      ctx.font = `${10 * DPR}px "Space Grotesk",sans-serif`; ctx.textBaseline = 'bottom';
      for (let i = 0; i < P.length; i++) { const s = P[i];
        if (s.p < 1) s.p = Math.min(1, s.p + s.sp); else if (s.hold < 1) s.hold += .006; else s.life -= .015;
        if (s.life <= 0) { P[i] = this.seg(); continue; }
        const e = 1 - Math.pow(1 - s.p, 3), ox = px * s.z, oy = py * s.z, x0 = s.x + ox, y0 = s.y + oy;
        const x1 = s.hor ? x0 + s.len * e : x0, y1 = s.hor ? y0 : y0 + s.len * e;
        ctx.strokeStyle = rgba(ar, ag, ab, .5 * s.life * s.z); ctx.lineWidth = 1.2 * DPR;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        // znaczniki końców
        ctx.beginPath(); if (s.hor) { ctx.moveTo(x0, y0 - 5 * DPR); ctx.lineTo(x0, y0 + 5 * DPR); } else { ctx.moveTo(x0 - 5 * DPR, y0); ctx.lineTo(x0 + 5 * DPR, y0); } ctx.stroke();
        if (s.p < 1) { ctx.fillStyle = rgba(br, bg, bb, .95); ctx.beginPath(); ctx.arc(x1, y1, 2.2 * DPR, 0, 7); ctx.fill(); ctx.fillStyle = rgba(ar, ag, ab, .2); ctx.beginPath(); ctx.arc(x1, y1, 9 * DPR, 0, 7); ctx.fill(); }
        else if (s.lab) { ctx.fillStyle = rgba(br, bg, bb, .6 * s.life); ctx.fillText(s.lab, (x0 + x1) / 2 + 6 * DPR, (y0 + y1) / 2 - 4 * DPR); }
      }
      for (const d of extra) { d.y -= d.vy; if (d.y < 0) { d.y = H; d.x = rnd(0, W); } const a = .25 + .25 * Math.sin(t * 1.5 + d.ph); ctx.fillStyle = rgba(br, bg, bb, a); ctx.beginPath(); ctx.arc(d.x + px * .5, d.y + py * .5, d.s, 0, 7); ctx.fill(); }
      // złoty przelot światła (co ~7 s i po wejściu tytułu)
      const cyc = (t % 7) / 7, k = this.sweep > 0 ? 1 - this.sweep : cyc; if (this.sweep > 0) this.sweep -= .012;
      if (k < .5) { const sx = (k / .5) * (W * 1.6) - W * .3, g = ctx.createLinearGradient(sx - W * .18, 0, sx + W * .18, H * .35);
        g.addColorStop(0, rgba(ar, ag, ab, 0)); g.addColorStop(.5, rgba(br, bg, bb, .12)); g.addColorStop(1, rgba(ar, ag, ab, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    }
  };

  const E = { embers: ember, pearls, chalk, blueprint }[FX]; if (!E) return null;
  E.init();
  gsap.ticker.add(() => {
    if (!visible) return;
    top = hero.getBoundingClientRect().top;
    const t = (performance.now() - t0) / 1000;
    ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    E.step(t); mouse.vx *= .5; mouse.vy *= .5;
  });
  return E;
})();

/* płynne hero (LUMÉ): film rysowany w WebGL z falami od kropli, odsłanianie falą, skurcz w perłę przy scrollu */
const liquid = (function () {
  if (!hero || !hero.classList.contains('hero--liquid') || reduce || innerWidth <= 860) return null;
  const cv = $('.hero-gl', hero), vid = $('.hero-media video', hero); if (!cv || !vid) return null;
  const gl = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false }); if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision highp float;varying vec2 v;
uniform sampler2D tx;uniform vec2 res,vres;uniform float t,rev,pearl,ready;uniform vec3 acc,acc2,bg;uniform vec4 dr[10];
vec2 cover(vec2 u){float ra=res.x/res.y,va=vres.x/vres.y;vec2 s=ra>va?vec2(1.,va/ra):vec2(ra/va,1.);return (u-.5)*s+.5;}
vec3 vidc(vec2 u){u=clamp(u,.001,.999);return mix(bg,texture2D(tx,cover(u)).rgb,ready);}
void main(){
  vec2 asp=vec2(res.x/res.y,1.),uv=v,off=vec2(0.);float hl=0.;
  for(int i=0;i<10;i++){vec4 d=dr[i];float age=t-d.z;if(d.w<=0.||age<0.||age>5.)continue;
    vec2 dd=(uv-d.xy)*asp;float r=length(dd),fr=age*.32,x=r-fr;
    float w=sin(x*70.)*exp(-x*x*260.)*exp(-age*.9)*d.w;off+=dd/(r+1e-4)*w*.011;hl+=max(w,0.)*.35;}
  vec2 c=mix(vec2(.5),vec2(.73,.5),pearl);float R=mix(rev*1.25*asp.x,.2,pearl);
  vec2 q=(uv-c)*asp;float dist=length(q),edge=R-dist;
  float lens=pearl*.42*(1.-clamp(dist*dist/(R*R),0.,1.));vec2 u2=c+(uv-c)*(1.-lens)+off;
  vec3 col=vec3(vidc(u2+off*.25).r,vidc(u2).g,vidc(u2-off*.25).b)+acc2*hl;
  float m=smoothstep(-.003,.003,edge);
  float ring=exp(-abs(edge)*70.)*(rev<.999?1.:pearl*.9);
  vec2 hq=q/max(R,1e-3)-vec2(-.34,.38);float spec=exp(-dot(hq,hq)*9.)*pearl*.75;
  float rim=pearl*smoothstep(.72,1.,dist/max(R,1e-3))*.55;
  vec3 o=mix(bg,col,m)+acc*ring*.9+(vec3(1.)*spec+acc2*rim)*m;
  gl_FragColor=vec4(o,1.);}`));
  gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const U = n => gl.getUniformLocation(pr, n), u = { res: U('res'), vres: U('vres'), t: U('t'), rev: U('rev'), pearl: U('pearl'), ready: U('ready'), acc: U('acc'), acc2: U('acc2'), bg: U('bg'), dr: U('dr') };
  const col = h => hexRgb(h).map(x => x / 255);
  const bgc = css.getPropertyValue('--bg').trim() || '#3d2b33';
  gl.uniform3fv(u.acc, col(ACC)); gl.uniform3fv(u.acc2, col(ACC2)); gl.uniform3fv(u.bg, col(bgc));
  const drops = new Float32Array(40); let di = 0;
  const S = { rev: 0, pearl: 0 }, t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;
  const drop = (x, y, a) => { drops.set([x, y, now(), a], di * 4); di = (di + 1) % 10; };
  const size = () => { const w = hero.clientWidth, h = hero.clientHeight; cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(u.res, cv.width, cv.height); };
  addEventListener('resize', size); size();
  let ready = 0, lx = -1, ly = -1, lt = 0;
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, tt = performance.now();
    if (Math.hypot(x - lx, y - ly) > 70 && tt - lt > 90 && S.rev > .95 && S.pearl < .05) { drop(x / r.width, 1 - y / r.height, .32); lx = x; ly = y; lt = tt; } });
  hero.addEventListener('pointerdown', e => { const r = hero.getBoundingClientRect(); if (S.rev > .95 && S.pearl < .05) drop((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 1); });
  gsap.ticker.add(() => {
    if (hero.getBoundingClientRect().bottom < 0) return;
    if (vid.readyState >= 2) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid); if (!ready) gl.uniform2f(u.vres, vid.videoWidth, vid.videoHeight); ready = Math.min(1, ready + .05); }
    gl.uniform1f(u.ready, ready); gl.uniform1f(u.t, now()); gl.uniform1f(u.rev, S.rev); gl.uniform1f(u.pearl, S.pearl); gl.uniform4fv(u.dr, drops);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
  hero.classList.add('liq-on');
  return { S, drop };
})();
// wejście: perłowa kropla spada, fala odsłania film, litery wyostrzają się jak w obiektywie
function liquidIntro() {
  const d = $('.pearl-drop', hero), others = $$('.hero-top .lbl, .hero p.lead, .hero .btn', hero), mq = $('.hero-marq', hero);
  gsap.set(heroChars, { opacity: 0, filter: 'blur(22px)', scale: 1.35, yPercent: 10 });
  gsap.set(others, { opacity: 0, y: 24 }); gsap.set(mq, { opacity: 0 });
  gsap.timeline()
    .fromTo(d, { y: -60, opacity: 1 }, { y: hero.clientHeight * .5, duration: 1, ease: 'power2.in' }, .2)
    .to(d, { scaleY: .55, scaleX: 1.5, duration: .08, ease: 'power1.out' })
    .add(() => { liquid.drop(.5, .5, 1.6); setTimeout(() => liquid.drop(.5, .5, .8), 260); })
    .to(d, { opacity: 0, scale: 2.4, duration: .35, ease: 'power2.out' })
    .to(liquid.S, { rev: 1, duration: 2.6, ease: 'expo.out' }, '<')
    .to(heroChars, { opacity: 1, filter: 'blur(0px)', scale: 1, yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: { each: .045, from: 'center' },
      onComplete: () => { introDone = true; gsap.set(heroChars, { clearProps: 'filter' }); } }, '<.25')
    .to(others, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .07 }, '<.6')
    .to(mq, { opacity: 1, duration: 1 }, '<.3');
}
// scroll: film kurczy się w lśniącą perłę, tytuł rozmywa się
function liquidScroll() {
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: 1, pin: true, refreshPriority: 1 } })
    .to(liquid.S, { pearl: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .to(heroChars, { opacity: 0, filter: 'blur(14px)', xPercent: -30, ease: 'power1.in', duration: .45, stagger: { each: .01, from: 'end' } }, 0)
    .to($$('.hero-top, .hero-meta, .hero-marq', hero), { y: -50, opacity: 0, ease: 'power1.in', duration: .35 }, 0)
    .to($('.hero-spot', hero), { opacity: 0, duration: .4 }, 0);
}

/* światło kursora, paralaksa, magnetyczne litery, pasek haseł, wyjście przy scrollu */
if (hero && !reduce) {
  const spot = $('.hero-spot', hero), media = $('.hero-media', hero), lns = $$('.ln', heroH1 || hero);
  let sx = .6, sy = .45;
  const mqx = gsap.quickTo(media, 'x', { duration: 1.4, ease: 'power3' }), mqy = gsap.quickTo(media, 'y', { duration: 1.4, ease: 'power3' });
  gsap.set(media, { scale: 1.06 });
  const lq = lns.map(l => gsap.quickTo(l, 'x', { duration: 1.2, ease: 'power3' }));
  const cq = heroChars.map(c => [gsap.quickTo(c, 'y', { duration: .5, ease: 'power3' }), gsap.quickTo(c, 'rotation', { duration: .6, ease: 'power3' })]);
  gsap.ticker.add(() => {
    const r = hero.getBoundingClientRect(); if (r.bottom < 0) return;
    const t = performance.now() / 1000;
    let tx, ty;
    if (mouse.on && finePtr) { tx = (mouse.x - r.left) / r.width; ty = (mouse.y - r.top) / r.height; }
    else { tx = .55 + Math.sin(t * .35) * .3; ty = .5 + Math.sin(t * .5 + 1) * .25; }
    sx += (tx - sx) * .08; sy += (ty - sy) * .08;
    if (spot) { spot.style.setProperty('--mx', (sx * 100).toFixed(2) + '%'); spot.style.setProperty('--my', (sy * 100).toFixed(2) + '%'); }
    const nx = sx - .5, ny = sy - .5;
    if (!hero.classList.contains('hero--frame') && !liquid) { mqx(-nx * 40); mqy(-ny * 26); }
    lq.forEach((q, i) => q(nx * (14 + i * 14)));
    if (introDone && finePtr && mouse.on) {
      const R = 180;
      heroChars.forEach((c, i) => { const b = c.getBoundingClientRect(), dx = b.left + b.width / 2 - mouse.x, dy = b.top + b.height / 2 - mouse.y, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / R);
        cq[i][0](-f * b.height * .14); cq[i][1](f * (dx < 0 ? -6 : 6)); });
    }
  });
  // pasek haseł: prędkość rośnie przy scrollu
  const track = $('.hero-marq .mq-track', hero);
  if (track) { const tw = gsap.to(track, { xPercent: -50, ease: 'none', duration: 36, repeat: -1 });
    gsap.ticker.add(() => { const v = Math.min(6, 1 + Math.abs(scrollVel) * .25); tw.timeScale(tw.timeScale() + (v * (scrollVel < -1 ? -1 : 1) - tw.timeScale()) * .1); }); }
  // wyjście z hero przy scrollu: zoom filmu, tytuł odjeżdża
  const vid = $('video, img', media);
  if (hero.classList.contains('hero--frame') && innerWidth > 860) {
    // hero w ramce: przypięty, ramka z filmem rozlewa się na cały ekran, na końcu wielka nazwa
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=120%', scrub: 1, pin: true, refreshPriority: 1 } })
      .fromTo(media, { clipPath: 'inset(15vh 3vw 22vh 56vw round 28px)' }, { clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)', ease: 'power2.inOut', duration: .6 }, 0)
      .fromTo(vid, { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .to(heroH1, { xPercent: -12, opacity: 0, ease: 'power1.in', duration: .4 }, 0)
      .to($$('.hero-top, .hero-meta, .hero-marq', hero), { y: -50, opacity: 0, ease: 'power1.in', duration: .35 }, 0)
      .fromTo($('.hero-over', hero), { opacity: 0, scale: .82, letterSpacing: '.1em' }, { opacity: 1, scale: 1, letterSpacing: '-.05em', ease: 'expo.out', duration: .4 }, .55)
      .to($('.hero-over', hero), { opacity: 0, yPercent: -30, ease: 'power1.in', duration: .15 }, .9)
      .to($('.hero-fx', hero), { opacity: .5, ease: 'none', duration: 1 }, 0);
  } else if (liquid) liquidScroll();
  else gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to(vid, { scale: 1.22, ease: 'none' }, 0)
    .to(heroH1, { yPercent: -18, scale: .94, opacity: .1, transformOrigin: '0% 100%', ease: 'none' }, 0)
    .to($$('.hero-top, .hero-meta', hero), { y: -70, opacity: 0, ease: 'none' }, 0)
    .to($('.hero-fx', hero), { opacity: .3, ease: 'none' }, 0);
}
function heroIntro() {
  if (!heroChars.length) return;
  gsap.from(heroChars, { yPercent: 120, rotationX: -95, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .035, delay: .15,
    onComplete: () => {
      introDone = true;
      const b = heroH1.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      if (FX === 'chalk') gsap.fromTo(heroH1, { x: -10 }, { x: 0, duration: .5, ease: 'elastic.out(1,.25)' });
      if (heroFx) heroFx.burst((b.left + b.width * .4) * DPR, (b.bottom - hr.top - b.height * .15) * DPR);
    } });
  // jeden złoty/perłowy błysk przechodzący przez litery
  if (FX === 'blueprint' || FX === 'pearls') gsap.fromTo(heroChars, { color: ACC2 }, { color: '', duration: .9, ease: 'power2.out', stagger: .04, delay: 1.2, clearProps: 'color' });
}

/* ---------- start po loaderze ---------- */
let started = false;
function start() {
  if (started) return; started = true;
  const framed = !reduce && hero && hero.classList.contains('hero--frame') && innerWidth > 860;
  if (lenis) lenis.start();
  if (hv) hv.play().catch(() => {});
  if (!framed) loader.classList.add('done');
  if (reduce) return;
  if (framed) { cinematicIntro(); return; }
  if (liquid) { liquidIntro(); return; }
  if (hero && hero.classList.contains('hero--blueprint')) { blueprintIntro(); return; }
  heroIntro();
  gsap.from('.hero .lbl, .hero p.lead, .hero .btn', { opacity: 0, y: 20, duration: 1, stagger: .06, delay: .6 });
}
// wejście kinowe (hero w ramce): licznik odjeżdża, kurtyna loadera zjeżdża w górę,
// ramka z filmem otwiera się z cienkiej żarzącej się linii, potem litery i reszta
function cinematicIntro() {
  const media = $('.hero-media', hero), vid = $('video, img', media), FRAME = 'inset(15vh 3vw 22vh 56vw round 28px)';
  const line = document.createElement('div'); line.className = 'intro-line'; hero.appendChild(line);
  loader.style.transition = 'none';
  gsap.set(media, { clipPath: 'inset(56.5vh 3vw 43.5vh 56vw round 2px)' });
  gsap.set(vid, { scale: 1.55 });
  gsap.set(heroChars, { yPercent: 120, rotationX: -95, opacity: 0 });
  gsap.set($$('.hero-top .lbl, .hero p.lead, .hero .btn', hero), { opacity: 0, y: 24 });
  gsap.set($('.hero-marq', hero), { yPercent: 120, opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
  tl.to('#loader .l-num, #loader .l-txt', { yPercent: -60, opacity: 0, duration: .7, ease: 'power3.in', stagger: .05 })
    .to('#loader .l-bar', { scaleX: 0, transformOrigin: '100% 50%', duration: .5, ease: 'power3.in' }, '<')
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1 }, '-=.25')
    .add(() => loader.classList.add('done'))
    // żarząca się linia rysuje się w miejscu ramki
    .fromTo(line, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: .9, ease: 'expo.out' }, '-=.55')
    // ramka otwiera się z linii w górę i w dół, film się „uspokaja”
    .to(media, { clipPath: FRAME, duration: 1.4 }, '-=.35')
    .to(line, { opacity: 0, duration: .5, ease: 'power2.out' }, '<.15')
    .to(vid, { scale: 1.15, duration: 2.2, ease: 'expo.out' }, '<')
    .to(heroChars, { yPercent: 0, rotationX: 0, opacity: 1, duration: 1.3, ease: 'expo.out', stagger: .03,
      onComplete: () => { introDone = true; } }, '<.35')
    .to($$('.hero-top .lbl, .hero p.lead, .hero .btn', hero), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .07 }, '<.5')
    .to($('.hero-marq', hero), { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, '<.2')
    .add(() => line.remove());
}
requestAnimationFrame(loaderTick);
setTimeout(start, 9000); // awaryjnie

if (!reduce) {
  // tytuły sekcji
  $$('main .giant').forEach(g => { if (g.closest('.hero') || g.closest('.sw')) return;
    gsap.from($$('.ln>span', g), { yPercent: 110, ease: 'expo.out', duration: 1.3, stagger: .08, scrollTrigger: { trigger: g, start: 'top 85%' } }); });
  // manifest: słowa zapalają się przy scrollu
  $$('.big[data-words]').forEach(b => {
    b.innerHTML = b.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span> `).join('');
    if (!b.closest('.scan')) gsap.to($$('.w', b), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: b, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  // karty
  $$('.cards').forEach(c => gsap.from($$('.card', c), { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: c, start: 'top 80%' } }));
  // panorama: paralaksa
  $$('.pano:not(.zoom) img, .pano:not(.zoom) .pano-vid').forEach(i => gsap.fromTo(i, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: i.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // stopka
  $$('.pf-foot .huge').forEach(h => gsap.from(h, { yPercent: 40, opacity: 0, ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: h, start: 'top 95%' } }));
}



/* LUMÉ: skaner w manifeście (linia światła wyostrza słowa, które przeskanowała) */
if (!reduce) $$('.manifest.scan .big').forEach(b => {
  const line = document.createElement('div'); line.className = 'scanline'; line.setAttribute('aria-hidden', 'true'); b.appendChild(line);
  const ws = $$('.w', b);
  ScrollTrigger.create({ trigger: b, start: 'top 72%', end: 'bottom 38%', scrub: .4, onUpdate: s => {
    const h = b.offsetHeight, y = s.progress * h;
    line.style.transform = `translateY(${y}px)`; line.style.opacity = s.progress > .01 && s.progress < .99 ? 1 : 0;
    for (const w of ws) { const wy = w.offsetTop + w.offsetHeight * .5, d = wy - y, k = Math.max(0, Math.min(1, .5 - d / (w.offsetHeight * 1.1)));
      w.style.opacity = .14 + .86 * k; w.style.filter = k >= 1 ? 'none' : `blur(${((1 - k) * 6).toFixed(2)}px)`; w.classList.toggle('lit', Math.abs(d) < w.offsetHeight * .55); }
  } });
});

/* LUMÉ: harmonijka zabiegów (przypięta; scroll otwiera kolejne panele, film gra tylko w otwartym) */
$$('.cards--acc').forEach(box => {
  const cs = $$('.card', box), vs = cs.map(c => $('video', c));
  vs.forEach(v => v && v.removeAttribute('data-auto'));
  if (reduce || innerWidth <= 860) { vs.forEach(v => v && v.setAttribute('data-auto', '')); return; }
  let cur = -1;
  const open = i => { if (i === cur) return; cur = i; cs.forEach((c, k) => c.classList.toggle('on', k === i));
    vs.forEach((v, k) => { if (!v) return; if (k === i) { v.preload = 'auto'; v.currentTime = 0; v.play().then(() => v.classList.add('on')).catch(() => {}); } else v.pause(); }); };
  open(0);
  cs.forEach((c, i) => { c.addEventListener('pointerenter', () => open(i)); c.addEventListener('click', () => open(i)); });
  ScrollTrigger.create({ trigger: box.closest('.cards-sec'), start: 'top top', end: '+=140%', pin: true, scrub: true,
    onUpdate: s => open(Math.min(cs.length - 1, Math.floor(s.progress * cs.length * .999))),
    onLeave: () => vs.forEach(v => v && v.pause()), onLeaveBack: () => vs.forEach(v => v && v.pause()),
    onEnter: () => { const v = vs[cur]; v && v.play().catch(() => {}); }, onEnterBack: () => { const v = vs[cur]; v && v.play().catch(() => {}); } });
});

/* LUMÉ: napis rozpada się w pył razem z perłą */
if (!reduce) $$('.seq.dust').forEach(sec => {
  const chs = [];
  $$('.sw .giant .ln>span', sec).forEach(sp => { const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 1) return walk(c); if (c.nodeType !== 3) return;
    const f = document.createDocumentFragment(); for (const ch of c.textContent) { if (ch === ' ') { f.appendChild(document.createTextNode(' ')); continue; } const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; f.appendChild(s); chs.push(s); } c.replaceWith(f); }); walk(sp); });
  const dir = chs.map(() => [rnd(-1, 1) * 260, rnd(-1.2, .3) * 220, rnd(-60, 60)]);
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => {
    const k = Math.max(0, Math.min(1, (s.progress - .45) / .38)), e = k * k;
    chs.forEach((c, i) => { const [x, y, r] = dir[i], kk = Math.max(0, Math.min(1, e * 1.4 - (i / chs.length) * .4));
      c.style.transform = `translate(${x * kk}px,${y * kk}px) rotate(${r * kk}deg) scale(${1 - kk * .4})`; c.style.filter = kk ? `blur(${(kk * 12).toFixed(1)}px)` : ''; c.style.opacity = 1 - kk; });
  } });
});

/* LUMÉ: przesłona w panoramie (pierścień światła otwiera gabinet, napis rozsuwa się) */
if (!reduce) $$('.pano.iris').forEach(p => {
  const img = $('img', p), ring = $('.iris-ring', p), h = $('.giant', p);
  const hyp = () => Math.hypot(p.clientWidth, p.clientHeight) / 2 + 20;
  gsap.set(img, { clipPath: 'circle(0px at 50% 50%)', scale: 1.3 });
  gsap.timeline({ scrollTrigger: { trigger: p, start: 'top top', end: '+=150%', scrub: 1, pin: true, invalidateOnRefresh: true } })
    .fromTo(ring, { width: 6, height: 6, opacity: 1 }, { width: () => hyp() * 2, height: () => hyp() * 2, ease: 'power2.in', duration: 1 }, 0)
    .to(img, { clipPath: () => `circle(${hyp()}px at 50% 50%)`, ease: 'power2.in', duration: 1 }, 0)
    .to(img, { scale: 1, ease: 'none', duration: 1.2 }, 0)
    .to(ring, { opacity: 0, duration: .15 }, .9)
    .fromTo(h, { letterSpacing: '-.05em', opacity: 1, filter: 'blur(0px)' }, { letterSpacing: '.35em', opacity: 0, filter: 'blur(10px)', ease: 'power1.in', duration: .6 }, .05);
});


/* ================= MONOLIT: efekty dewelopera ================= */
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
const plFmt = n => n.toLocaleString('pl-PL');

/* wejście: rysunek techniczny wieży kreśli się liniami, potem budynek „wyrasta” od dołu */
function blueprintIntro() {
  loader.classList.add('done');
  const w = hero.clientWidth, h = hero.clientHeight, wide = w > 860;
  const L = wide ? w * .6 : w * .56, R = wide ? w * .73 : w * .86, T = h * .1, B = h * .86, F = 32;
  const svg = svgEl('svg', { class: 'bp', viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true' }); hero.appendChild(svg);
  const g = svgEl('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': 1 }, svg);
  const lines = [];
  const ln = (x1, y1, x2, y2, cls) => lines.push(svgEl('line', { x1, y1, x2, y2, class: cls || '' }, g));
  ln(w * .04, B, w * .96, B, 'gr');
  ln(L, B, L, T, 'st'); ln(R, B, R, T, 'st'); ln(L, T, R, T, 'st');
  for (let i = 1; i < F; i++) { const y = B - (B - T) * i / F; ln(L, y, R, y, 'fl'); }
  for (let i = 1; i < 6; i++) { const x = L + (R - L) * i / 6; ln(x, T, x, B, 'fn'); }
  // wymiar wysokości
  const dx = R + (wide ? 46 : 18); ln(dx, B, dx, T, 'dm'); ln(dx - 8, B, dx + 8, B, 'dm'); ln(dx - 8, T, dx + 8, T, 'dm');
  // dźwig
  const cx = L - (wide ? 70 : 26), cy = T - 34;
  ln(cx, B, cx, cy, 'cr'); ln(cx + 10, B, cx + 10, cy, 'cr');
  ln(cx - (wide ? 110 : 50), cy, cx + (wide ? 260 : 120), cy, 'cr'); ln(cx - (wide ? 110 : 50), cy + 10, cx + (wide ? 260 : 120), cy + 10, 'cr');
  ln(cx + 5, cy - 40, cx - (wide ? 110 : 50), cy, 'cr'); ln(cx + 5, cy - 40, cx + (wide ? 260 : 120), cy, 'cr');
  ln(cx + (wide ? 200 : 90), cy + 10, cx + (wide ? 200 : 90), cy + 90, 'cr');
  const tx = (x, y, s, cls) => { const t = svgEl('text', { x, y, class: 'bp-t ' + (cls || '') }, svg); t.textContent = s; return t; };
  const labels = [tx(dx + 12, (T + B) / 2, '118,00 m', 'v'), tx(R + 8, T - 8, '+118.00'), tx(R + 8, B - 8, '±0.00'), tx(L, B + 22, 'MONOLIT · RZUT A-01 · 1:500'), tx(L, T - 14, '32 KONDYGNACJE')];
  lines.forEach(l => { const len = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value) || 1; l.style.strokeDasharray = len; l.style.strokeDashoffset = len; });
  const media = $('.hero-media', hero), scan = document.createElement('div'); scan.className = 'bp-scan'; hero.appendChild(scan);
  const others = $$('.hero-top .lbl, .hero p.lead, .hero .btn', hero), mq = $('.hero-marq', hero);
  gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(heroChars, { scaleY: 0, transformOrigin: '50% 100%', opacity: 0 });
  gsap.set(others, { opacity: 0, y: 20 }); gsap.set(mq, { opacity: 0 }); gsap.set(labels, { opacity: 0 });
  const fl = lines.filter(l => l.classList.contains('fl'));
  gsap.timeline()
    .to(lines.filter(l => !l.classList.contains('fl')), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .03 }, .1)
    .to(fl, { strokeDashoffset: 0, duration: .5, ease: 'power2.out', stagger: { each: .025, from: 'start' } }, .4)
    .to(labels, { opacity: 1, duration: .5, stagger: .08 }, 1)
    .fromTo(scan, { top: '100%', opacity: 1 }, { top: '0%', duration: 1.7, ease: 'power3.inOut' }, 1.6)
    .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power3.inOut' }, '<')
    .to(svg, { opacity: .14, duration: 1.4, ease: 'power2.out' }, '<.6')
    .to(scan, { opacity: 0, duration: .3 }, '>-.2')
    .to(heroChars, { scaleY: 1, opacity: 1, duration: .9, ease: 'expo.out', stagger: .035, onComplete: () => { introDone = true; } }, '<-.6')
    .to(others, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .07 }, '<.4')
    .to(mq, { opacity: 1, duration: 1 }, '<.3')
    .add(() => scan.remove());
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { svg.style.transform = `translateY(${-s.progress * 120}px)`; } });
}

/* celownik architekta z współrzędnymi */
if (!reduce && finePtr && $('.hero--blueprint')) {
  const xh = document.createElement('div'); xh.className = 'xh'; xh.setAttribute('aria-hidden', 'true'); xh.innerHTML = '<i class="xh-h"></i><i class="xh-v"></i><span class="xh-t"></span>'; document.body.appendChild(xh);
  const t = $('.xh-t', xh), qx = gsap.quickTo(xh, 'x', { duration: .25, ease: 'power3' }), qy = gsap.quickTo(xh, 'y', { duration: .25, ease: 'power3' });
  addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); xh.classList.add('on'); t.textContent = `X ${(e.clientX / innerWidth * 240).toFixed(1)} · Y ${((1 - e.clientY / innerHeight) * 118).toFixed(1)} m`; }, { passive: true });
  document.addEventListener('pointerleave', () => xh.classList.remove('on'));
}

/* podróż: winda z licznikiem pięter i wysokości */
$$('.seq.journey').forEach(sec => {
  const pts = JSON.parse(sec.dataset.floors || '[[0,0],[1,0]]'), fmax = +sec.dataset.fmax || 32, hmax = +sec.dataset.hmax || 118;
  const car = $('.lift-car', sec), fl = $('.lift-fl', sec), hh = $('.lift-h', sec), bar = $('.jr-bar i', sec), ticks = $$('.lift-shaft i', sec);
  const at = p => { for (let i = 1; i < pts.length; i++) if (p <= pts[i][0]) { const [a, fa] = pts[i - 1], [b, fb] = pts[i], k = (p - a) / Math.max(1e-6, b - a), e = k * k * (3 - 2 * k); return fa + (fb - fa) * e; } return pts[pts.length - 1][1]; };
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => {
    const f = at(s.progress), n = Math.round(f);
    car.style.bottom = (f / fmax * 100) + '%'; fl.textContent = String(n).padStart(2, '0');
    hh.textContent = (f / fmax * hmax).toFixed(1).replace('.', ',') + ' m'; bar.style.transform = `scaleX(${s.progress})`;
    ticks.forEach((t, i) => t.classList.toggle('on', i <= n));
  } });
});

/* budowa na żywo: ten sam kadr, wieża rośnie przy przewijaniu */
$$('.build').forEach(sec => {
  const st = $$('.bd-st', sec), line = $('.bd-line', sec), pct = $('.bd-pct span', sec), lbl = $('.bd-lbl', sec), date = $('.bd-date', sec), nodes = $$('.bd-tl li', sec), n = st.length;
  st.forEach((f, i) => { if (i) f.style.clipPath = 'inset(100% 0 0 0)'; });
  const upd = p => {
    const seg = Math.min(n - 1 - 1e-6, p * (n - 1)), i = Math.floor(seg), f = seg - i, e = f < .15 ? 0 : f > .85 ? 1 : (f - .15) / .7;
    st.forEach((fig, k) => { fig.style.clipPath = k <= i ? 'inset(0 0 0 0)' : k === i + 1 ? `inset(${((1 - e) * 100).toFixed(2)}% 0 0 0)` : 'inset(100% 0 0 0)'; });
    line.style.top = ((1 - e) * 100) + '%'; line.style.opacity = e > 0 && e < 1 ? 1 : 0;
    const a = +st[i].dataset.pct, b = +st[i + 1].dataset.pct; pct.textContent = Math.round(a + (b - a) * e);
    const cur = st[e > .5 ? i + 1 : i]; lbl.textContent = cur.dataset.lbl; date.textContent = cur.dataset.date;
    nodes.forEach((li, k) => li.classList.toggle('on', k <= (e > .5 ? i + 1 : i)));
  };
  upd(0);
  if (reduce) { st.forEach(f => (f.style.clipPath = 'inset(0 0 0 0)')); upd(1); return; }
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=260%', pin: true, scrub: true, onUpdate: s => upd(s.progress) });
});

/* wybór piętra: pasy na budynku, panel z danymi */
$$('.fl-svg').forEach(svg => {
  const box = JSON.parse(svg.dataset.box), F = +svg.dataset.floors, sec = svg.closest('.floors');
  const n = $('.fl-n', sec), u = $('.fl-u', sec), fr = $('.fl-f', sec), pr = $('.fl-p', sec), v = $('.fl-v', sec);
  const x1 = box.x1 * 1000, x2 = box.x2 * 1000, t = box.top * 1000, b = box.bottom * 1000, hgt = (b - t) / F;
  const strips = [];
  for (let f = 1; f <= F; f++) { const y = b - f * hgt; strips.push(svgEl('rect', { x: x1, y: y + hgt * .08, width: x2 - x1, height: hgt * .84, class: 'fl-r', 'data-f': f }, svg)); }
  let cur = 0;
  const show = f => { if (f === cur) return; cur = f; strips.forEach((r, k) => r.classList.toggle('on', k === f - 1));
    const units = f >= 31 ? 1 : f >= 21 ? 3 : 4, free = Math.max(0, units - ((f * 7) % 3)), price = f >= 31 ? 4900000 : 689000 + (f - 1) * 36000;
    n.textContent = String(f).padStart(2, '0'); u.textContent = units === 1 ? '1 penthouse' : units + ' apartamenty'; fr.textContent = free ? String(free) : 'sprzedane';
    pr.textContent = plFmt(price) + ' zł'; v.textContent = f < 8 ? 'Ogród i rzeka' : f < 20 ? 'Motława, Stare Miasto' : 'Panorama Gdańska i zatoki';
    gsap.fromTo(n, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .4, ease: 'power3.out' }); };
  strips.forEach(r => { r.addEventListener('pointerenter', () => show(+r.dataset.f)); r.addEventListener('pointerdown', () => show(+r.dataset.f)); });
  show(18);
  if (!reduce) ScrollTrigger.create({ trigger: sec, start: 'top 60%', once: true, onEnter: () => { const o = { f: 1 }; gsap.to(o, { f: 18, duration: 1.8, ease: 'power2.inOut', onUpdate: () => show(Math.round(o.f)) }); } });
});

/* karty mieszkań: rzut 2D przechodzi w wizualizację od miejsca kursora */
$$('.cards--plan .card').forEach(c => {
  const img = $('.card-img', c), r = $('.render', c); if (!r) return;
  const st = { r: 0 }; let x = 50, y = 50;
  const draw = () => { r.style.clipPath = `circle(${st.r}% at ${x}% ${y}%)`; img.classList.toggle('rend', st.r > 40); };
  draw();
  const go = to => gsap.to(st, { r: to, duration: to ? 1.1 : .7, ease: to ? 'power3.inOut' : 'power3.out', onUpdate: draw });
  const pos = e => { const b = img.getBoundingClientRect(); x = (e.clientX - b.left) / b.width * 100; y = (e.clientY - b.top) / b.height * 100; };
  c.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; pos(e); go(150); });
  c.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; pos(e); go(0); });
  c.addEventListener('click', e => { if (e.pointerType === 'mouse') return; pos(e); go(st.r > 40 ? 0 : 150); });
});

/* rzut rysuje się sam: kreska biegnie wzdłuż ścian (BFS po jasnych pikselach), złota końcówka pióra, potem metryka */
function planDraw(c, i) {
  const pl = $('.plan', c); if (!pl || reduce) return; pl.loading = 'eager';
  const W = 540, H = 675, cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'plan-cv';
  pl.after(cv); pl.style.opacity = 0;
  const tag = document.createElement('span'); tag.className = 'plan-tag lbl'; tag.innerHTML = `<b>A-0${i + 1}</b> · 1:100 · <em>0%</em>`;
  $('.card-img', c).appendChild(tag);
  const pct = $('em', tag);
  let ready = null;
  const prep = () => ready || (ready = (pl.decode ? pl.decode() : Promise.resolve()).catch(() => {}).then(() => {
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(pl, 0, 0, W, H);
    const src = ctx.getImageData(0, 0, W, H), d = src.data, N = W * H;
    const on = new Uint8Array(N), dist = new Int32Array(N).fill(-1);
    for (let p = 0; p < N; p++) { const q = p * 4; if (d[q] * .3 + d[q + 1] * .59 + d[q + 2] * .11 > 46) on[p] = 1; }
    const qu = new Int32Array(N); let max = 0;
    const bfs = (seed, base) => { let h = 0, t = 0; qu[t++] = seed; dist[seed] = base;
      while (h < t) { const p = qu[h++], x = p % W, y = (p / W) | 0, nd = dist[p] + 1;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const n = yy * W + xx;
          if (on[n] && dist[n] < 0) { dist[n] = nd; if (nd > max) max = nd; qu[t++] = n; } } } };
    // start: najdłuższa ściana zaczyna się w lewym górnym rogu, reszta elementów dołącza w trakcie
    let first = -1; for (let s = 0; s < W + H && first < 0; s++) for (let x = 0; x <= s; x++) { const y = s - x; if (x < W && y < H && on[y * W + x]) { first = y * W + x; break; } }
    if (first >= 0) bfs(first, 0);
    const mainMax = max || 1;
    for (let p = 0; p < N; p++) if (on[p] && dist[p] < 0) { const y = (p / W) | 0; bfs(p, Math.round(mainMax * (.08 + .5 * y / H) )); }
    ctx.clearRect(0, 0, W, H);
    return { ctx, d, dist, max: Math.max(max, 1), out: ctx.createImageData(W, H) };
  }));
  ScrollTrigger.create({ trigger: c, start: 'top 75%', once: true, onEnter: () => prep().then(S => {
    const { ctx, d, dist, out } = S, o = out.data, N = W * H, st = { t: 0 };
    const frame = () => {
      const t = st.t * S.max;
      for (let p = 0; p < N; p++) { const k = dist[p], q = p * 4;
        if (k < 0 || k > t) { o[q + 3] = 0; continue; }
        const g = t - k;
        if (g < 14 && st.t < 1) { const a = 1 - g / 14; o[q] = 255; o[q + 1] = 200 + 40 * a; o[q + 2] = 120 + 80 * a; o[q + 3] = 255; }
        else { o[q] = d[q]; o[q + 1] = d[q + 1]; o[q + 2] = d[q + 2]; o[q + 3] = 255; } }
      ctx.putImageData(out, 0, 0); pct.textContent = Math.round(st.t * 100) + '%';
    };
    gsap.to(st, { t: 1, duration: 2.6 + i * .25, delay: i * .18, ease: 'power1.inOut', onUpdate: frame, onComplete: () => {
      frame(); gsap.to(pl, { opacity: 1, duration: .5 }); gsap.to(cv, { opacity: 0, duration: .5 }); tag.classList.add('done'); pct.textContent = 'gotowe'; } });
  }) });
}
$$('.cards--plan .card').forEach(planDraw);

/* widok z okna: dzień przechodzi w noc przy przewijaniu, zegar i przełącznik */
$$('.daynight').forEach(sec => {
  const night = $('.dn-night', sec), clock = $('.dn-clock', sec), bt = $$('.dn-tog button', sec), knob = $('.dn-tog i', sec);
  const upd = p => { const k = Math.max(0, Math.min(1, (p - .15) / .7)); night.style.opacity = k;
    const mins = 12 * 60 + Math.round(k * 600 / 10) * 10; clock.textContent = `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
    const isN = k > .5; bt[0].setAttribute('aria-pressed', String(!isN)); bt[1].setAttribute('aria-pressed', String(isN)); knob.style.transform = `translateX(${k * 100}%)`; };
  upd(0);
  if (reduce) { bt.forEach(b => b.addEventListener('click', () => upd(+b.dataset.v))); return; }
  const stt = ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: true, onUpdate: s => upd(s.progress) });
  gsap.fromTo($('.dn-day', sec), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: '+=140%', scrub: true } });
  bt.forEach(b => b.addEventListener('click', () => { const y = stt.start + (stt.end - stt.start) * (+b.dataset.v ? .9 : .1); lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: 'smooth' }); }));
});

/* filmy: pętle grają tylko na ekranie, manifest odtwarza się raz po wejściu */
if (!reduce) {
  const vids = $$('video[data-auto], video[data-once]');
  vids.forEach(v => v.addEventListener('playing', () => v.classList.add('on'), { once: true }));
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target;
    if (e.isIntersecting) { if (v.dataset.once !== undefined) { if (!v.dataset.done) { v.dataset.done = 1; v.preload = 'auto'; v.play().catch(() => {}); } } else { v.preload = 'auto'; v.play().catch(() => {}); } }
    else if (v.dataset.auto !== undefined) v.pause(); }), { threshold: .3 });
  vids.forEach(v => io.observe(v));
  $$('.man-vid video').forEach(v => gsap.fromTo(v, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: v.closest('.manifest'), start: 'top bottom', end: 'bottom top', scrub: true } }));
}


/* przelot przez litery: film w napisie, napis rośnie aż przelatujemy przez niego */
if (!reduce) $$('.pano.zoom').forEach(p => {
  const k = $('.knock', p), v = $('.pano-vid', p) || $('img', p);
  gsap.timeline({ scrollTrigger: { trigger: p, start: 'top top', end: '+=170%', scrub: 1, pin: true } })
    .fromTo(k, { scale: 1 }, { scale: 32, ease: 'power3.in', duration: 1 }, 0)
    .to(k, { opacity: 0, ease: 'none', duration: .22 }, .78)
    .fromTo(v, { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0);
});
/* karty: przechył 3D i odblask za kursorem */
if (!reduce && matchMedia('(pointer:fine)').matches) $$('.card').forEach(c => {
  if (c.closest('.cards--acc')) return;
  const inn = $('.card-in', c); if (!inn) return;
  const g = document.createElement('i'); g.className = 'glare'; inn.appendChild(g);
  const rx = gsap.quickTo(inn, 'rotationX', { duration: .7, ease: 'power3' }), ry = gsap.quickTo(inn, 'rotationY', { duration: .7, ease: 'power3' });
  c.addEventListener('pointermove', ev => { const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    rx((.5 - y) * 10); ry((x - .5) * 12); g.style.setProperty('--gx', x * 100 + '%'); g.style.setProperty('--gy', y * 100 + '%'); g.style.opacity = 1; });
  c.addEventListener('pointerleave', () => { rx(0); ry(0); g.style.opacity = 0; });
});

/* ---------- kalkulator ---------- */
$$('.calc').forEach(c => {
  const out = $('.total', c), base = +c.dataset.base || 0, fmt = n => Math.round(n).toLocaleString('pl-PL') + ' zł';
  const calc = () => {
    let t = base, mult = 1;
    $$('input[type=range]', c).forEach(r => { const v = +r.value; $(`[data-for="${r.id}"]`, c).textContent = v + (r.dataset.suf || '');
      if (r.dataset.unit) t += v * +r.dataset.unit; if (r.dataset.mult) mult *= v; });
    $$('.opts button[aria-pressed=true]', c).forEach(b => { t += +b.dataset.add || 0; if (b.dataset.x) mult *= +b.dataset.x; });
    out.textContent = fmt(t * mult);
  };
  $$('.opts', c).forEach(g => $$('button', g).forEach(b => b.addEventListener('click', () => {
    if (g.dataset.single !== undefined) $$('button', g).forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', g.dataset.single !== undefined ? 'true' : String(b.getAttribute('aria-pressed') !== 'true')); calc(); })));
  $$('input', c).forEach(i => i.addEventListener('input', calc)); calc();
});

/* brakujące grafiki kart: zostaw gradient zastępczy */
$$('.card-img img, .pano img').forEach(i => i.addEventListener('error', () => { i.style.visibility = 'hidden'; }));
