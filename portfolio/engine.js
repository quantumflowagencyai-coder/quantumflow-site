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

/* ---------- start po loaderze ---------- */
let started = false;
function start() {
  if (started) return; started = true;
  loader.classList.add('done'); if (lenis) lenis.start();
  if (hv) hv.play().catch(() => {});
  if (reduce) return;
  gsap.from('.hero .giant .ln>span', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: .09, delay: .15 });
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
  $$('.pano img').forEach(i => gsap.fromTo(i, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: i.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // stopka
  $$('.pf-foot .huge').forEach(h => gsap.from(h, { yPercent: 40, opacity: 0, ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: h, start: 'top 95%' } }));
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
