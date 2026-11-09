// Sekcja „Automatyzacje n8n”: agent AI w centrum, dane płyną do niego i z niego w rytmie przewijania.
import * as THREE from 'three';

const pin = document.getElementById('aut-pin');
const canvas = document.getElementById('aut-gl');
const labelsBox = document.getElementById('aut-labels');
const steps = [...document.querySelectorAll('.aut-step')];
const stepDots = [...document.querySelectorAll('.aut-dots i')];
const counter = document.getElementById('aut-count');
const bar = document.getElementById('aut-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { pin.classList.add('no-gl'); }

// Węzły: grupa, etap pojawienia się, kierunek przepływu (in = do agenta, out = od agenta, both)
const NODES = [
  { g: 'trig', t: 'Formularz', s: 'nowe zapytanie', st: 0, dir: 'in', c: 0x22d3ee },
  { g: 'trig', t: 'E-mail', s: 'wiadomość klienta', st: 0, dir: 'in', c: 0x22d3ee },
  { g: 'trig', t: 'Harmonogram', s: 'codziennie 8:00', st: 0, dir: 'in', c: 0x22d3ee },
  { g: 'model', t: 'OpenAI', s: 'rozumowanie', st: 1, dir: 'both', c: 0x3b82f6 },
  { g: 'model', t: 'Claude', s: 'analiza i teksty', st: 1, dir: 'both', c: 0x3b82f6 },
  { g: 'model', t: 'Gemini', s: 'dane i obrazy', st: 1, dir: 'both', c: 0x3b82f6 },
  { g: 'tool', t: 'Pamięć', s: 'kontekst rozmów', st: 1, dir: 'both', c: 0x2dd4bf },
  { g: 'tool', t: 'Narzędzia', s: 'wywołania funkcji', st: 1, dir: 'both', c: 0x2dd4bf },
  { g: 'tool', t: 'Baza wektorowa', s: 'wiedza firmy', st: 1, dir: 'both', c: 0x2dd4bf },
  { g: 'out', t: 'Slack', s: 'powiadomienia', st: 2, dir: 'out', c: 0x60a5fa },
  { g: 'out', t: 'CRM', s: 'leady i klienci', st: 2, dir: 'out', c: 0x60a5fa },
  { g: 'out', t: 'Baza danych', s: 'zapis SQL', st: 2, dir: 'out', c: 0x60a5fa },
  { g: 'out', t: 'E-mail', s: 'odpowiedzi', st: 2, dir: 'out', c: 0x60a5fa },
  { g: 'out', t: 'API', s: 'dowolny system', st: 2, dir: 'out', c: 0x60a5fa },
  { g: 'out', t: 'Dokumenty', s: 'raporty i PDF', st: 2, dir: 'out', c: 0x60a5fa },
];

// Dwa układy: poziomy (desktop) i pionowy (telefon)
function layout(mobile) {
  const idx = g => NODES.filter(n => n.g === g);
  if (!mobile) {
    idx('trig').forEach((n, i) => { n.p = new THREE.Vector3(-2.8 + i * 2.8, -5.2, 0.5); n.side = 'B'; });
    idx('model').forEach((n, i) => { n.p = new THREE.Vector3(-7.6, 2.8 - i * 2.8, 0); n.side = 'L'; });
    idx('tool').forEach((n, i) => { n.p = new THREE.Vector3(-3.6 + i * 3.6, 4.9, -0.6); n.side = 'T'; });
    idx('out').forEach((n, i) => { n.p = new THREE.Vector3(7.6, 4.5 - i * 1.8, 0); n.side = 'R'; });
  } else {
    idx('trig').forEach((n, i) => { n.p = new THREE.Vector3(-2.6 + i * 2.6, 7.6, 0); n.side = 'B'; });
    idx('model').forEach((n, i) => { n.p = new THREE.Vector3(-2.6 + i * 2.6, 4.2, 0); n.side = 'B'; });
    idx('tool').forEach((n, i) => { n.p = new THREE.Vector3(-2.6 + i * 2.6, -3.3, 0); n.side = 'B'; });
    idx('out').forEach((n, i) => { n.p = new THREE.Vector3(-2.6 + (i % 3) * 2.6, i < 3 ? -6.2 : -8.4, 0); n.side = 'B'; });
  }
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - clamp(t), 3);
const easeBack = t => { t = clamp(t); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x05050c, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05050c, 18, 48);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  let mobile = innerWidth < 760;
  layout(mobile);

  // Miękka poświata (sprite)
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const glow = (color, size, op = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size); return s;
  };

  /* ---------- Rdzeń: agent AI ---------- */
  const core = new THREE.Group(); scene.add(core);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uThink: { value: 0 } },
    vertexShader: `uniform float uTime; uniform float uThink; varying vec3 vN; varying vec3 vV; varying float vW;
      void main(){ vec3 p = position; float w = sin(p.x*3.+uTime*2.)*sin(p.y*3.+uTime*1.7)*sin(p.z*3.+uTime*1.3);
        vW = w; p += normal*w*(.06+uThink*.1); vec4 mv = modelViewMatrix*vec4(p,1.);
        vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime; uniform float uThink; varying vec3 vN; varying vec3 vV; varying float vW;
      void main(){ float f = pow(1.-max(dot(vN,vV),0.),2.);
        vec3 a = vec3(.23,.51,.96), b = vec3(.13,.83,.93), c = vec3(.18,.83,.75);
        vec3 col = mix(a, b, .5+.5*sin(vW*4.+uTime));
        col = mix(col, c, f);
        col *= .25 + f*1.6 + uThink*.35;
        gl_FragColor = vec4(col, 1.); }`
  });
  const coreBall = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 40), coreMat); core.add(coreBall);
  const coreWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.9, 1)),
    new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .35 }));
  core.add(coreWire);
  const coreRings = [2.4, 2.8, 3.2].map((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, .012, 8, 160),
      new THREE.MeshBasicMaterial({ color: [0x22d3ee, 0x3b82f6, 0x2dd4bf][i], transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.set(1.1 + i * .4, i * .7, 0); core.add(m); return m;
  });
  const coreHalo = glow(0x3b82f6, 9, .45); core.add(coreHalo);

  /* ---------- Tło: siatka + gwiazdy ---------- */
  const grid = new THREE.GridHelper(80, 64, 0x1e3a8a, 0x0f1d3d);
  grid.material.transparent = true; grid.material.opacity = .35; grid.rotation.x = Math.PI / 2; grid.position.z = -8; scene.add(grid);
  const SN = mobile ? 700 : 1400, sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) sp.set([(Math.random() - .5) * 70, (Math.random() - .5) * 50, -6 - Math.random() * 20], i * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .09, map: glowTex, color: 0x9cc8ff, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  /* ---------- Węzły, połączenia i pakiety danych ---------- */
  const tubeMat = color => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uDraw: { value: 0 }, uOn: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uDraw; uniform float uOn; uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
      void main(){ float x = vUv.x; if (x > uDraw) discard;
        float flow = pow(fract(x*2.5 - uTime*.9), 10.);
        float head = smoothstep(.06, 0., uDraw - x) * step(uDraw, .995);
        float a = .22 + flow*1.2*uOn + head*1.5;
        gl_FragColor = vec4(uColor*(.7 + flow*1.6*uOn + head*2.), a); }`
  });

  const nodeGroup = new THREE.Group(); scene.add(nodeGroup);
  const links = [];
  function buildNodes() {
    nodeGroup.clear(); links.length = 0; labelsBox.innerHTML = '';
    NODES.forEach(n => {
      const g = new THREE.Group(); g.position.copy(n.p);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), new THREE.MeshBasicMaterial({ color: n.c }));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.42, .015, 8, 64), new THREE.MeshBasicMaterial({ color: n.c, transparent: true, opacity: .8 }));
      const halo = glow(n.c, 2.2, .7);
      g.add(orb, ring, halo); nodeGroup.add(g);
      n.obj = g; n.ring = ring; n.halo = halo;

      // Krzywa: zawsze w kierunku przepływu (in: węzeł → rdzeń, out: rdzeń → węzeł)
      const outer = n.p.clone(), edge = n.p.clone().setZ(0).normalize().multiplyScalar(1.5);
      const cp = Math.abs(outer.x) > Math.abs(outer.y) ? new THREE.Vector3(outer.x * .5, outer.y * .9, .8) : new THREE.Vector3(outer.x * .9, outer.y * .5, .8);
      const from = n.dir === 'out' ? edge : outer, to = n.dir === 'out' ? outer : edge;
      const curve = new THREE.QuadraticBezierCurve3(from, cp, to);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, mobile ? .03 : .022, 6, false), tubeMat(n.c));
      nodeGroup.add(tube);
      const packets = [0, .5].map(o => { const s = glow(n.c, .55, 0); s.userData.o = o; nodeGroup.add(s); return s; });
      // W obie strony (modele, narzędzia): pakiet wraca do agenta
      const back = n.dir === 'both' ? glow(0xffffff, .4, 0) : null; if (back) nodeGroup.add(back);
      links.push({ n, curve, tube, packets, back });

      const el = document.createElement('div');
      el.className = `aut-node aut-${n.side} aut-g-${n.g}`;
      el.innerHTML = `<b>${n.t}</b><span>${n.s}</span>`;
      labelsBox.appendChild(el); n.el = el;
    });
    const coreEl = document.createElement('div');
    coreEl.className = 'aut-core-label';
    coreEl.innerHTML = '<small>n8n</small><b>AI Agent</b>';
    labelsBox.appendChild(coreEl); core.userData.el = coreEl;
  }
  buildNodes();

  /* ---------- Kamera i etapy ---------- */
  // Etap: [x, y, z kamery, cel x, cel y]
  const CAM = {
    d: [[-3.5, -1.5, 14, -3.5, -2], [-3.2, 1.6, 15.5, -2.2, 1.2], [3.6, 1.4, 16, 2.6, 1], [1.5, -2.2, 24, 1.5, -2.6]],
    m: [[0, 1.5, 20, 0, 1.5], [0, 0, 22, 0, .3], [0, -6.5, 18, 0, -6.5], [0, -4, 42, 0, -4.6]],
  };
  const cam = new THREE.Vector3(0, 0, 30), look = new THREE.Vector3(), lookT = new THREE.Vector3(), camT = new THREE.Vector3();
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const m = innerWidth < 760;
    if (m !== mobile) { mobile = m; layout(mobile); buildNodes(); }
  }
  resize(); addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; document.body.classList.toggle('aut-active', visible); }, { threshold: 0 }).observe(pin);

  const STAGE = [0, .24, .5, .76]; // początek każdego etapu w postępie przewijania
  const centers = [.1, .37, .63, .9];
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  let lastStage = -1;

  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = reduce ? 0 : clock.getElapsedTime();
    const r = pin.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const stage = p < STAGE[1] ? 0 : p < STAGE[2] ? 1 : p < STAGE[3] ? 2 : 3;

    // Kamera: płynne przejście między ujęciami etapów
    const set = CAM[mobile ? 'm' : 'd'];
    const seg = clamp((p - .02) / .96) * 3, i0 = Math.min(2, Math.floor(seg)), f = ease((seg - i0) * 1.25);
    const A = set[i0], B = set[i0 + 1];
    const intro = ease(p / .1);
    camT.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, (A[2] + (B[2] - A[2]) * f) + (1 - intro) * 14);
    lookT.set(A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f, 0);
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camT.x += mouse.x * 1.2; camT.y -= mouse.y * .8;
    if (stage === 3) { const o = (p - STAGE[3]) / (1 - STAGE[3]); camT.x += Math.sin(o * 2.2) * (mobile ? .8 : 1.5); }
    cam.lerp(camT, .08); look.lerp(lookT, .08);
    camera.position.copy(cam); camera.lookAt(look);

    // Rdzeń
    const think = clamp((p - STAGE[1]) / .08) * (stage >= 1 ? 1 : 0);
    coreMat.uniforms.uTime.value = t; coreMat.uniforms.uThink.value = think;
    core.scale.setScalar(.4 + easeBack(p / .12) * .6);
    coreBall.rotation.y = t * .3; coreWire.rotation.y = -t * (.15 + think * .4); coreWire.rotation.x = t * .1;
    coreRings.forEach((m, i) => { m.rotation.z = t * (.3 + i * .15 + think * .6) * (i % 2 ? -1 : 1); });
    coreHalo.material.opacity = .35 + think * .25 + Math.sin(t * 3) * .05;

    // Węzły i połączenia
    links.forEach(L => {
      const n = L.n, start = STAGE[n.st] + (n.st === 0 ? .02 : 0);
      const k = NODES.filter(m => m.st === n.st).indexOf(n);
      const a = clamp((p - start - k * .012) / .08);
      const draw = clamp((p - start - .04 - k * .012) / .1);
      const on = stage >= n.st ? clamp((p - start - .1) / .05) : 0;
      n.obj.scale.setScalar(Math.max(.001, easeBack(a)));
      n.ring.rotation.x = t * 1.2 + k; n.ring.rotation.y = t * .8;
      n.halo.material.opacity = .35 + on * .45 + (n.st === stage ? Math.sin(t * 4 + k) * .12 : 0);
      const u = L.tube.material.uniforms; u.uDraw.value = draw; u.uOn.value = on; u.uTime.value = t;
      L.packets.forEach(s => {
        const q = (t * .45 + s.userData.o + k * .13) % 1;
        L.curve.getPointAt(q, v); s.position.copy(v); s.material.opacity = on * (draw >= 1 ? 1 : 0) * Math.sin(q * Math.PI);
      });
      if (L.back) {
        const q = 1 - ((t * .45 + .25 + k * .13) % 1);
        L.curve.getPointAt(q, v); L.back.position.copy(v); L.back.material.opacity = on * (draw >= 1 ? .8 : 0) * Math.sin(q * Math.PI);
      }

      // Etykieta HTML w miejscu węzła
      v.copy(n.p).project(camera);
      const x = (v.x * .5 + .5) * r.width, y = (-v.y * .5 + .5) * innerHeight;
      n.el.style.transform = `translate(${x}px,${y}px)`;
      n.el.style.opacity = a * (v.z < 1 ? 1 : 0);
      n.el.classList.toggle('on', on > .5);
    });
    v.set(0, -1.9 * core.scale.x, 0).project(camera);
    core.userData.el.style.transform = `translate(${(v.x * .5 + .5) * r.width}px,${(-v.y * .5 + .5) * innerHeight}px)`;
    core.userData.el.style.opacity = intro;
    core.userData.el.classList.toggle('on', think > .5);

    stars.rotation.z = t * .01;

    // Teksty etapów
    steps.forEach((el, i) => {
      let o = clamp((.14 - Math.abs(p - centers[i])) / .05);
      if (i === 0 && p < centers[0]) o = 1;
      if (i === 3 && p > centers[3]) o = 1;
      el.style.opacity = o; el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.pointerEvents = o > .5 ? 'auto' : 'none';
    });
    if (stage !== lastStage) {
      lastStage = stage; counter.textContent = '0' + (stage + 1);
      stepDots.forEach((d, i) => d.classList.toggle('on', i === stage));
    }
    bar.style.transform = `scaleX(${p})`;

    renderer.render(scene, camera);
  })();
}
