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

/* ---------- loader ---------- */
const loader = $('#loader'), lNum = $('#loader .l-num span'), lBar = $('#loader .l-bar i');
const tasks = []; let shown = 0, target = 0;
const track = p => { tasks.push(p); p.finally(() => { target = tasks.filter(t => t.done).length; }); p.then(() => (p.done = true), () => (p.done = true)); return p; };
function loaderTick() {
  const real = tasks.length ? tasks.filter(t => t.done).length / tasks.length : 0;
  shown += (real * 100 - shown) * 0.12 + 0.25; shown = Math.min(shown, real * 100);
  const v = Math.round(shown);
  lNum.textContent = String(v).padStart(2, '0'); lBar.style.width = v + '%';
  if (real >= 1 && v >= 99) { lNum.textContent = '100'; lBar.style.width = '100%'; setTimeout(start, 250); return; }
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
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
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
      ctx.globalCompositeOperation = 'lighter';
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
    mqx(-nx * 40); mqy(-ny * 26);
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
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
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
  loader.classList.add('done'); if (lenis) lenis.start();
  if (hv) hv.play().catch(() => {});
  if (reduce) return;
  heroIntro();
  gsap.from('.hero .lbl, .hero p.lead, .hero .btn', { opacity: 0, y: 20, duration: 1, stagger: .06, delay: .6 });
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
    gsap.to($$('.w', b), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: b, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  // karty
  $$('.cards').forEach(c => gsap.from($$('.card', c), { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: c, start: 'top 80%' } }));
  // panorama: paralaksa
  $$('.pano img, .pano-vid').forEach(i => gsap.fromTo(i, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: i.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // stopka
  $$('.pf-foot .huge').forEach(h => gsap.from(h, { yPercent: 40, opacity: 0, ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: h, start: 'top 95%' } }));
}


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
