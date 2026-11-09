// Sekcja „Proces”: szklana platforma z 4 blokami (konsultacja, koncepcja 3D, wdrożenie, start), połączonymi rurami światła.
import * as THREE from 'three';

const pin = document.getElementById('prc-pin');
const canvas = document.getElementById('prc-gl');
const tagsBox = document.getElementById('prc-tags');
const panels = [...document.querySelectorAll('.prc-panel')];
const dots = [...document.querySelectorAll('.prc-dots i')];
const counter = document.getElementById('prc-count');
const bar = document.getElementById('prc-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

const STEPS = [
  { n: '01.', t: 'Konsultacja', d: ['Poznajemy firmę, klientów', 'i cele. Bezpłatnie.'] },
  { n: '02.', t: 'Koncepcja 3D', d: ['Projekt wizualny', 'i prototyp sceny.'] },
  { n: '03.', t: 'Wdrożenie', d: ['Budujemy stronę pod', 'telefony i Google.'] },
  { n: '04.', t: 'Start i wzrost', d: ['Publikujemy stronę', 'i mierzymy wyniki.'] },
];
const LINKS = ['Brief i analiza', 'Akceptacja projektu', 'Testy i publikacja'];
const KEYS = [0, .19, .37, .55, .73, .93]; // ogół, bloki 01–04, finał
const TOP = .5;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { pin.classList.add('no-gl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x04050b, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04050b, .014);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 300);

  // Światło i odbicia
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x070a16, side: THREE.BackSide })));
  [[0x22d3ee, -9, 5, 0, 4], [0x8b5cf6, 9, 4, 0, 3], [0xffffff, 0, 12, 0, 3], [0x3b82f6, 0, 3, -12, 3], [0xffffff, 0, 4, 12, 1.6]].forEach(([c, x, y, z, k]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  scene.environment = pmrem.fromScene(env, .04).texture;
  scene.add(new THREE.HemisphereLight(0xbfdcff, 0x0b1020, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(5, 12, 9); scene.add(sun);

  const loader = new THREE.TextureLoader();
  const galTex = loader.load('/img/agent-galaxy.webp'); galTex.colorSpace = THREE.SRGBColorSpace;

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,255,255,.5)'); r.addColorStop(.55, 'rgba(255,255,255,.1)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const run = () => { g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; };
    run(); if (document.fonts) document.fonts.ready.then(run);
    return t;
  };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const FONT = '"Space Grotesk", Inter, sans-serif';

  const basicVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  const fresnelVS = `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vec4 mv = viewMatrix*w; vV = -mv.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*mv; }`;
  const glassFS = `uniform vec3 uC; uniform float uO; uniform float uA; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
      vec3 col = mix(vec3(.6,.8,1.), uC, .45)*(f*(1.1 + uA*.8) + .03 + uA*.04);
      gl_FragColor = vec4(col, clamp(f*.8 + .05 + uA*.04, 0., 1.)*uO); }`;
  const glassMat = (c, o = 1) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uC: { value: new THREE.Color(c) }, uO: { value: o }, uA: { value: 0 } }, vertexShader: fresnelVS, fragmentShader: glassFS });

  const roundedRect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };
  const roundedBox = (w, h, d, r) => {
    const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), { depth: h, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 2, curveSegments: 10 });
    g.rotateX(-Math.PI / 2); return g;
  };
  const metal = new THREE.MeshStandardMaterial({ color: 0xa9b8cc, metalness: 1, roughness: .24, envMapIntensity: 1.3 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x161c2b, metalness: .85, roughness: .38 });

  // ---------- Kosmos pod szklaną platformą ----------
  const BW = 33, BD = 10.5;
  const deepMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: galTex }, uTime: { value: 0 } }, vertexShader: basicVS,
    fragmentShader: `uniform sampler2D uTex; uniform float uTime; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
      vec3 gal(vec2 uv, vec2 c, vec2 s, float tile, float rot){
        vec2 p = (uv - c)/s; float cs = cos(rot), sn = sin(rot); p = mat2(cs,-sn,sn,cs)*p; p += .5;
        if(p.x<0.||p.x>1.||p.y<0.||p.y>1.) return vec3(0.);
        return texture2D(uTex, vec2(tile*.5 + p.x*.5, p.y)).rgb; }
      void main(){
        vec2 uv = vUv;
        vec3 col = vec3(.008,.012,.03) + vec3(.02,.05,.12)*smoothstep(.8,.0,length((uv-.5)*vec2(1.,2.)));
        vec2 g = floor(uv*vec2(620.,200.)); float st = step(.996, h(g)); col += vec3(.7,.85,1.)*st*(.5+.5*sin(uTime*2.+h(g+3.)*40.));
        col += gal(uv, vec2(.12,.4), vec2(.13,.42), 0., uTime*.01)*1.1;
        col += gal(uv, vec2(.88,.6), vec2(.12,.4), 1., -uTime*.012)*1.1;
        col += gal(uv, vec2(.5,.25), vec2(.07,.22), 1., 1.4)*.6;
        gl_FragColor = vec4(col, 1.);
      }` });
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(BW + 1, BD + 1), deepMat);
  deep.rotation.x = -Math.PI / 2; deep.position.y = -.35; scene.add(deep);
  const boardGeo = new THREE.ExtrudeGeometry(roundedRect(BW, BD, 1.4), { depth: .7, bevelEnabled: true, bevelThickness: .12, bevelSize: .12, bevelSegments: 3, curveSegments: 20 });
  boardGeo.rotateX(-Math.PI / 2); boardGeo.translate(0, -.32, 0);
  scene.add(new THREE.Mesh(boardGeo, glassMat(0x7dd3fc, .9)));

  // ---------- Obwody świetlne ----------
  const lineMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aT; varying float vT; varying vec3 vC; void main(){ vT = aT; vC = color; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying float vT; varying vec3 vC; void main(){
      float p = pow(.5 + .5*sin(vT*.9 - uTime*2.4), 14.);
      gl_FragColor = vec4(vC*(1.+p*2.), .22 + p*.65); }` });
  const linePos = [], lineT = [], lineCol = [];
  const addLine = (pts, color, closed = false) => {
    const c = new THREE.Color(color); let acc = 0; const P = closed ? [...pts, pts[0]] : pts;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], d = a.distanceTo(b);
      linePos.push(a.x, a.y, a.z, b.x, b.y, b.z); lineT.push(acc, acc + d); acc += d;
      lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
  };
  const ring = (w, d, r, y, color, ox = 0, oz = 0) => addLine(roundedRect(w, d, r).getSpacedPoints(160).map(p => new THREE.Vector3(p.x + ox, y, -p.y + oz)), color, true);
  [0x7dd3fc, 0xe0f2fe, 0x38bdf8, 0xbae6fd].forEach((c, k) => ring(BW - 1.1 - k * .4, BD - 1.1 - k * .4, Math.max(.4, 1 - k * .2), TOP + .02, c));

  // ---------- Bloki ----------
  const BX = i => (i - 1.5) * 7.6;
  const W = 5.4, H = 1.9, D = 4.4, Y0 = TOP + .25, YT = Y0 + H + .05;
  const labelTex = S => canvasTex(1024, 330, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 260, 0); gr.addColorStop(0, '#60a5fa'); gr.addColorStop(1, '#22d3ee');
    g.fillStyle = gr; g.font = `700 112px ${FONT}`; g.textBaseline = 'alphabetic'; g.fillText(S.n, 44, 112);
    g.fillStyle = '#f1f5ff'; g.font = `700 64px ${FONT}`; g.fillText(S.t, 44, 192);
    g.fillStyle = '#9fb1d6'; g.font = `500 38px Inter, sans-serif`; S.d.forEach((l, i) => g.fillText(l, 46, 250 + i * 46));
  });
  const blocks = STEPS.map((S, i) => {
    const g = new THREE.Group(); g.position.set(BX(i), 0, 0); scene.add(g);
    const base = new THREE.Mesh(roundedBox(W + .5, .2, D + .5, .5), metalDark); base.position.y = TOP + .02; g.add(base);
    const baseRim = new THREE.Mesh(roundedBox(W + .62, .06, D + .62, .55), metal); baseRim.position.y = TOP + .19; g.add(baseRim);
    const core = new THREE.Mesh(roundedBox(W - .3, H - .3, D - .3, .3), new THREE.MeshStandardMaterial({ color: 0x0a1122, metalness: .6, roughness: .3, transparent: true, opacity: .78 }));
    core.position.y = Y0 + .15; g.add(core);
    const bodyGeo = roundedBox(W, H, D, .45);
    const body = glassMat(0x38bdf8, 1); const bodyMesh = new THREE.Mesh(bodyGeo, body); bodyMesh.position.y = Y0; g.add(bodyMesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 25), new THREE.LineBasicMaterial({ color: 0x9be8ff, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    edges.position.y = Y0; g.add(edges);
    // Górna tafla
    const deck = new THREE.Mesh(roundedBox(W - .2, .06, D - .2, .38), new THREE.MeshStandardMaterial({ color: 0x070d1c, metalness: .8, roughness: .18, emissive: 0x06182e, emissiveIntensity: .5 }));
    deck.position.y = YT; g.add(deck);
    ring(W - .45, D - .45, .3, YT + .08, 0x67e8f9, BX(i), 0);
    ring(W - .85, D - .85, .25, YT + .08, 0x38bdf8, BX(i), 0);
    // Szklana osłona nad makietą
    const shellGeo = roundedBox(W - .1, 2.9, D - .1, .42);
    const shell = new THREE.Mesh(shellGeo, glassMat(0x7dd3fc, .35)); shell.position.y = YT + .06; g.add(shell);
    const shellEdges = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo, 25), new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }));
    shellEdges.position.y = YT + .06; g.add(shellEdges);
    // Etykieta na froncie
    const lw = W * .9, lh = lw * 330 / 1024;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshBasicMaterial({ map: labelTex(S), transparent: true, depthWrite: false, toneMapped: false }));
    label.position.set(0, Y0 + H / 2 + .02, D / 2 + .08); g.add(label);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(W * .82, .04, .04), new THREE.MeshBasicMaterial({ color: 0x38bdf8, toneMapped: false }));
    strip.position.set(0, Y0 + .16, D / 2 + .08); g.add(strip);
    const light = new THREE.PointLight(0x7dd3fc, 3, 9, 1.6); light.position.set(0, YT + 2.6, 1.4); g.add(light);
    const dio = new THREE.Group(); dio.position.y = YT + .09; g.add(dio);
    return { g, body, edges, strip, light, dio, a: 0, update: null };
  });

  // Materiały makiet
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .1, ...o });
  const holoMat = (map, o = .95) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide });
  const glow = (color, s, op = .5) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op })); m.scale.set(s, s, 1); return m; };
  const holoPanel = (draw, w, h, cw = 512, ch = 320) => canvasTex(cw, ch, (g, W2, H2) => {
    rr(g, 6, 6, W2 - 12, H2 - 12, 34); g.fillStyle = 'rgba(14,30,60,.75)'; g.fill();
    g.lineWidth = 4; g.strokeStyle = 'rgba(125,211,252,.85)'; g.stroke(); draw(g, W2, H2);
  });

  // 01 · Konsultacja: stół, ludzie, notatki
  {
    const d = blocks[0].dio;
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .08, 56), std(0xdbe7f5, { roughness: .12, metalness: .2 }));
    table.scale.set(1.45, 1, .82); table.position.y = .64; d.add(table);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.14, .3, .6, 20), metal); leg.position.y = .3; d.add(leg);
    const suits = [0x1e293b, 0x334155, 0x1e3a5f, 0xcbd5e1, 0x0f172a, 0x475569];
    const skins = [0xf1c9a5, 0xc68c5f, 0xe8b88f, 0x8d5a3b, 0xf3d2b3, 0xd9a272];
    const hairs = [0x2b1d14, 0x111111, 0x6b4423, 0x1a1a1a, 0xc9a25a, 0x3b2a1e];
    const chairMat = std(0x0b0f19, { roughness: .5, metalness: .4 });
    const people = [];
    for (let k = 0; k < 6; k++) {
      const an = k / 6 * Math.PI * 2 + Math.PI / 6, x = Math.cos(an) * 1.95, z = Math.sin(an) * 1.18;
      const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = -an - Math.PI / 2; d.add(p);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(.46, .06, .44), chairMat); seat.position.set(0, .4, -.04); p.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(.46, .58, .06), chairMat); back.position.set(0, .7, -.27); back.rotation.x = -.12; p.add(back);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .38, 8), metal); post.position.set(0, .2, -.04); p.add(post);
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .3, 4, 12), std(suits[k])); torso.position.set(0, .8, -.06); p.add(torso);
      const legs = new THREE.Mesh(new THREE.BoxGeometry(.3, .1, .36), std(0x1f2937)); legs.position.set(0, .48, .12); p.add(legs);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.13, 20, 16), std(skins[k], { roughness: .6 })); head.position.set(0, 1.18, -.04); p.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(.137, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), std(hairs[k], { roughness: .8 })); hair.position.copy(head.position); hair.rotation.x = -.35; p.add(hair);
      const arms = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .34, 4, 8), std(suits[k])); arms.rotation.z = Math.PI / 2; arms.position.set(0, .78, .14); p.add(arms);
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(.26, .34), new THREE.MeshBasicMaterial({ color: 0xf8fafc })); paper.rotation.x = -Math.PI / 2; paper.position.set(.05, .69, .4); p.add(paper);
      people.push({ p, head, k });
    }
    const laptop = new THREE.Group(); laptop.position.set(0, .69, 0); d.add(laptop);
    const lscr = new THREE.Mesh(new THREE.PlaneGeometry(.6, .38), new THREE.MeshBasicMaterial({ map: canvasTex(256, 160, g => { const gr = g.createLinearGradient(0, 0, 256, 160); gr.addColorStop(0, '#1d4ed8'); gr.addColorStop(1, '#22d3ee'); g.fillStyle = gr; g.fillRect(0, 0, 256, 160); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(20, 24, 120, 14); g.fillRect(20, 50, 80, 10); g.fillRect(20, 110, 216, 30); }), toneMapped: false }));
    lscr.position.set(0, .2, -.1); lscr.rotation.x = -.2; laptop.add(lscr);
    const lbase = new THREE.Mesh(new THREE.BoxGeometry(.62, .02, .4), metal); lbase.position.set(0, .01, .1); laptop.add(lbase);
    // Hologramy rozmowy
    const notes = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .94), holoMat(holoPanel((g, w, h) => {
      g.strokeStyle = '#e0f2fe'; g.lineWidth = 8; g.lineJoin = 'round';
      rr(g, 46, 60, 120, 86, 18); g.stroke(); g.beginPath(); g.moveTo(80, 146); g.lineTo(70, 176); g.lineTo(108, 146); g.stroke();
      g.fillStyle = '#e0f2fe'; [84, 104, 124].forEach((y, i) => g.fillRect(70, y - 4, 72 - i * 18, 7));
      g.font = `700 54px ${FONT}`; g.fillText('Twoje cele', 196, 112);
      g.fillStyle = '#93c5fd'; g.font = `500 34px Inter, sans-serif`; g.fillText('notatki z rozmowy', 198, 162);
      [216, 250].forEach((y, i) => { g.fillStyle = 'rgba(147,197,253,.55)'; g.fillRect(50, y, 400 - i * 120, 12); });
    })));
    notes.position.set(-1.7, 2.05, -1.3); notes.rotation.y = .35; d.add(notes);
    const bubbleTex = canvasTex(256, 200, (g) => {
      g.fillStyle = 'rgba(34,211,238,.9)'; rr(g, 10, 10, 160, 100, 30); g.fill(); g.beginPath(); g.moveTo(40, 108); g.lineTo(30, 150); g.lineTo(80, 108); g.fill();
      g.fillStyle = 'rgba(96,165,250,.9)'; rr(g, 96, 80, 150, 92, 28); g.fill();
      g.fillStyle = '#04122a'; [50, 82].forEach(y => g.fillRect(36, y - 4, 100, 9)); g.fillStyle = '#e0f2fe'; [116, 144].forEach(y => g.fillRect(120, y, 96, 9));
    });
    const bubble = new THREE.Mesh(new THREE.PlaneGeometry(.95, .74), holoMat(bubbleTex, .95)); bubble.position.set(1.4, 2.15, -1.2); bubble.rotation.y = -.3; d.add(bubble);
    const tg = glow(0x7dd3fc, 3.6, .2); tg.position.set(0, .75, 0); d.add(tg);
    blocks[0].update = (t, a) => {
      people.forEach(({ p, head, k }) => { head.position.y = 1.18 + Math.sin(t * 2 + k * 1.7) * .012 * (1 + a * 2); head.rotation.y = Math.sin(t * .7 + k) * .25 * a; });
      notes.position.y = 2.05 + Math.sin(t * 1.1) * .06; notes.material.opacity = .45 + a * .5;
      bubble.position.y = 2.15 + Math.sin(t * 1.3 + 1) * .07; bubble.material.opacity = .35 + a * .6;
      tg.material.opacity = .08 + a * .22;
    };
  }

  // 02 · Koncepcja 3D: galaktyka, siatka, wieżowiec, drzewo, makieta
  {
    const d = blocks[1].dio;
    const grid = new THREE.GridHelper(4.6, 18, 0x22d3ee, 0x1e40af); grid.material.transparent = true; grid.material.opacity = .35; grid.material.depthWrite = false; grid.position.y = .01; grid.scale.z = .8; d.add(grid);
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTex: { value: galTex }, uA: { value: 0 } }, vertexShader: basicVS,
      fragmentShader: `uniform sampler2D uTex; uniform float uA; varying vec2 vUv; void main(){ vec2 p = vUv-.5; float r = length(p)*2.; if(r>1.) discard;
        vec3 c = texture2D(uTex, vec2(.5 + vUv.x*.5, vUv.y)).rgb; gl_FragColor = vec4(c*smoothstep(1.,.55,r)*(1.1 + uA*.8), 1.); }` }));
    const discG = new THREE.Group(); discG.position.set(.15, 1.05, -.25); discG.rotation.x = -1.15; d.add(discG); discG.add(disc);
    const NS = 900, sp = new Float32Array(NS * 3), sc = new Float32Array(NS * 3);
    const cA = new THREE.Color(0x8b5cf6), cB = new THREE.Color(0x22d3ee), cW = new THREE.Color(0xffffff), tmpC = new THREE.Color();
    for (let i = 0; i < NS; i++) {
      const arm = i % 2, r = Math.pow(Math.random(), .7) * 1.45, an = r * 3.1 + arm * Math.PI + (Math.random() - .5) * .6;
      sp.set([Math.cos(an) * r, Math.sin(an) * r, (Math.random() - .5) * .08], i * 3);
      tmpC.copy(r < .3 ? cW : (arm ? cA : cB)).lerp(cW, Math.random() * .3); sc.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    const spiral = new THREE.Points(sg, new THREE.PointsMaterial({ size: .045, vertexColors: true, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    discG.add(spiral);
    const core = glow(0xc4b5fd, 1.3, .7); discG.add(core);
    // Wieżowiec z siatki
    const tower = new THREE.Group(); tower.position.set(-1.55, 0, -.7); d.add(tower);
    const tPos = []; const TW = .78, TH = 2.6;
    for (let k = 0; k <= 12; k++) { const y = k / 12 * TH, s = TW / 2 * (1 - k / 12 * .18); [[-s, -s, s, -s], [s, -s, s, s], [s, s, -s, s], [-s, s, -s, -s]].forEach(([a, b, c, e]) => tPos.push(a, y, b, c, y, e)); }
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => tPos.push(sx * TW / 2, 0, sz * TW / 2, sx * TW / 2 * .82, TH, sz * TW / 2 * .82));
    const tg2 = new THREE.BufferGeometry(); tg2.setAttribute('position', new THREE.Float32BufferAttribute(tPos, 3));
    const towerLines = new THREE.LineSegments(tg2, new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    tower.add(towerLines);
    const towerFill = new THREE.Mesh(new THREE.CylinderGeometry(TW / 2 * .82 * Math.SQRT2, TW / 2 * Math.SQRT2, TH, 4, 1), glassMat(0x22d3ee, .5)); towerFill.rotation.y = Math.PI / 4; towerFill.position.y = TH / 2; tower.add(towerFill);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.05, .5, 8), new THREE.MeshBasicMaterial({ color: 0x67e8f9, toneMapped: false })); tip.position.y = TH + .25; tower.add(tip);
    // Drzewo low-poly
    const tree = new THREE.Group(); tree.position.set(1.65, 0, .9); d.add(tree);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, .7, 8), std(0x6b4a2f, { roughness: .8 })); trunk.position.y = .35; tree.add(trunk);
    const leafMat = std(0x22c55e, { roughness: .6, flatShading: true });
    [[0, .95, 0, .48], [.22, 1.25, .05, .34], [-.2, 1.2, -.08, .32], [0, 1.45, 0, .28]].forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leafMat); m.position.set(x, y, z); tree.add(m); });
    // Makieta strony
    const mock = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.02), holoMat(holoPanel((g, w, h) => {
      g.fillStyle = 'rgba(147,197,253,.9)'; g.fillRect(40, 40, 70, 14); [300, 360, 420].forEach(x => g.fillRect(x, 42, 40, 10));
      g.strokeStyle = 'rgba(103,232,249,.95)'; g.lineWidth = 4; rr(g, 40, 76, 432, 112, 14); g.stroke();
      g.beginPath(); g.arc(400, 132, 36, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#e0f2fe'; g.fillRect(64, 104, 200, 18); g.fillRect(64, 136, 140, 12);
      [40, 186, 332].forEach(x => { rr(g, x, 206, 132, 76, 12); g.stroke(); });
      g.fillStyle = '#e0f2fe'; g.font = `700 30px ${FONT}`; g.fillText('makieta', 360, 30 + 4);
    })));
    mock.position.set(1.55, 2.25, -1.25); mock.rotation.y = -.35; d.add(mock);
    blocks[1].update = (t, a) => {
      discG.rotation.z = 0; disc.rotation.z = -t * (.12 + a * .2); spiral.rotation.z = -t * (.18 + a * .3);
      disc.material.uniforms.uA.value = a; core.material.opacity = .35 + a * .45;
      towerLines.material.opacity = .4 + a * .55; tower.rotation.y = Math.sin(t * .3) * .1;
      mock.position.y = 2.25 + Math.sin(t * 1.2) * .06; mock.material.opacity = .4 + a * .55;
      tree.rotation.z = Math.sin(t * 1.4) * .02;
    };
  }

  // 03 · Wdrożenie: telefon z przewijaną stroną, wskaźnik szybkości, kod, pinezka
  {
    const d = blocks[2].dio;
    const phone = new THREE.Group(); phone.position.set(-.2, 1.42, .1); phone.rotation.set(-.12, .32, 0); d.add(phone);
    const pb = new THREE.ExtrudeGeometry(roundedRect(1.12, 2.24, .16), { depth: .1, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2, curveSegments: 10 });
    pb.translate(0, 0, -.1); phone.add(new THREE.Mesh(pb, std(0x0b0f19, { metalness: .9, roughness: .2 })));
    const pageTex = canvasTex(420, 1680, (g, w, h) => {
      g.fillStyle = '#060a17'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#22d3ee'; g.beginPath(); g.arc(44, 46, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = '#cbd5e1'; [300, 340, 380].forEach(x => g.fillRect(x - 14, 42, 26, 6));
      const hg = g.createRadialGradient(300, 260, 10, 300, 260, 200); hg.addColorStop(0, 'rgba(34,211,238,.9)'); hg.addColorStop(.5, 'rgba(59,130,246,.35)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = hg; g.fillRect(0, 80, w, 380);
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(300, 260, 90, 34, -.4, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#ffffff'; g.font = `700 50px ${FONT}`; g.fillText('Twoja nowa', 30, 410); g.fillText('strona 3D', 30, 466);
      g.fillStyle = '#94a3b8'; g.fillRect(30, 500, 300, 12); g.fillRect(30, 524, 220, 12);
      const bg = g.createLinearGradient(30, 0, 250, 0); bg.addColorStop(0, '#3b82f6'); bg.addColorStop(1, '#2dd4bf'); g.fillStyle = bg; rr(g, 30, 560, 220, 64, 32); g.fill();
      g.fillStyle = '#04122a'; g.font = `700 26px ${FONT}`; g.fillText('Bezpłatna wycena', 52, 601);
      for (let k = 0; k < 3; k++) { const y = 680 + k * 220; g.fillStyle = 'rgba(255,255,255,.06)'; rr(g, 30, y, 360, 190, 22); g.fill(); g.strokeStyle = 'rgba(125,211,252,.35)'; g.lineWidth = 2; g.stroke();
        g.fillStyle = ['#22d3ee', '#8b5cf6', '#2dd4bf'][k]; rr(g, 54, y + 26, 60, 60, 16); g.fill(); g.fillStyle = '#e2e8f0'; g.fillRect(54, y + 110, 220, 14); g.fillStyle = '#64748b'; g.fillRect(54, y + 138, 280, 10); g.fillRect(54, y + 158, 200, 10); }
      g.fillStyle = '#e2e8f0'; g.font = `700 64px ${FONT}`; g.fillText('100', 40, 1450); g.fillText('< 2 s', 220, 1450);
      g.fillStyle = '#64748b'; g.font = `500 22px Inter, sans-serif`; g.fillText('wydajność', 44, 1484); g.fillText('ładowanie', 224, 1484);
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 1560, w, 120);
    });
    pageTex.repeat.set(1, .5); pageTex.offset.set(0, .5);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 2.1), new THREE.MeshBasicMaterial({ map: pageTex, toneMapped: false }));
    screen.position.z = .035; phone.add(screen);
    const pglow = glow(0x38bdf8, 3.2, .25); pglow.position.set(0, 0, -.3); phone.add(pglow);
    // Wskaźnik szybkości
    const gauge = new THREE.Group(); gauge.position.set(1.55, 1.45, .55); gauge.rotation.y = -.35; d.add(gauge);
    const arcMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uFill: { value: 1 } }, vertexShader: basicVS,
      fragmentShader: `uniform float uFill; varying vec2 vUv; void main(){ float on = step(vUv.x, uFill); vec3 c = mix(vec3(.13,.83,.93), vec3(.2,.9,.5), vUv.x); gl_FragColor = vec4(mix(vec3(.08,.15,.3), c*1.6, on), .95); }` });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(.5, .055, 10, 90), arcMat); arc.rotation.z = Math.PI / 2; arc.scale.x = -1; gauge.add(arc);
    const gTxt = new THREE.Mesh(new THREE.PlaneGeometry(.8, .5), new THREE.MeshBasicMaterial({ map: canvasTex(256, 160, (g, w) => {
      g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = `700 84px ${FONT}`; g.fillText('100', w / 2, 92); g.fillStyle = '#86efac'; g.font = `600 30px Inter, sans-serif`; g.fillText('szybkość', w / 2, 140);
    }), transparent: true, depthWrite: false, toneMapped: false }));
    gTxt.position.z = .01; gauge.add(gTxt);
    // Panele kodu
    const codeTex = (lines) => holoPanel((g) => {
      g.font = `500 25px ui-monospace, Menlo, monospace`;
      lines.forEach(([txt, col, ind], i) => { g.fillStyle = col; g.fillText(txt, 40 + ind * 26, 66 + i * 38); });
    }, 0, 0, 512, 320);
    const code1 = new THREE.Mesh(new THREE.PlaneGeometry(1.45, .9), holoMat(codeTex([['<section class="hero">', '#7dd3fc', 0], ['<canvas id="scena-3d">', '#c4b5fd', 1], ['<h1>Twoja marka</h1>', '#e2e8f0', 1], ['<a class="cta">', '#86efac', 1], ['</section>', '#7dd3fc', 0], ['seo: ok · mobile: ok', '#fbbf24', 0]])));
    code1.position.set(-1.65, 2.3, -1.25); code1.rotation.y = .4; d.add(code1);
    const code2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .75), holoMat(codeTex([['scroll.on(() => {', '#7dd3fc', 0], ['kamera.leć();', '#c4b5fd', 1], ['scena.render();', '#e2e8f0', 1], ['});', '#7dd3fc', 0], ['build: 1.2 s ✓', '#86efac', 0]])));
    code2.position.set(.75, 2.75, -1.55); code2.rotation.y = -.15; d.add(code2);
    // Pinezka mapy
    const pinG = new THREE.Group(); pinG.position.set(-1.75, 0, 1.15); d.add(pinG);
    const pinMat = std(0x22d3ee, { emissive: 0x0891b2, emissiveIntensity: .8, roughness: .2 });
    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), pinMat); pinHead.position.y = .75; pinG.add(pinHead);
    const pinCone = new THREE.Mesh(new THREE.ConeGeometry(.2, .45, 24), pinMat); pinCone.rotation.x = Math.PI; pinCone.position.y = .5; pinG.add(pinCone);
    const pinDot = new THREE.Mesh(new THREE.SphereGeometry(.08, 16, 12), std(0xffffff)); pinDot.position.set(0, .75, .15); pinG.add(pinDot);
    const pulseRing = new THREE.Mesh(new THREE.RingGeometry(.2, .26, 40), new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    pulseRing.rotation.x = -Math.PI / 2; pulseRing.position.y = .02; pinG.add(pulseRing);
    let scroll = 0;
    blocks[2].update = (t, a, dt) => {
      scroll = (scroll + dt * (.05 + a * .07)) % 1.4;
      pageTex.offset.y = .5 - ease(clamp(scroll)) * .5;
      arcMat.uniforms.uFill.value = .15 + .85 * ease(clamp((t * .35) % 1.6));
      phone.position.y = 1.42 + Math.sin(t * .9) * .04;
      code1.material.opacity = .35 + a * .55; code2.material.opacity = .3 + a * .55;
      code1.position.y = 2.3 + Math.sin(t * 1.1) * .05; code2.position.y = 2.75 + Math.sin(t * 1.3 + 2) * .05;
      pinG.position.y = Math.sin(t * 2) * .06; const ph = (t * .7) % 1; pulseRing.scale.setScalar(1 + ph * 3); pulseRing.material.opacity = (1 - ph) * .9;
      pglow.material.opacity = .12 + a * .25;
    };
  }

  // 04 · Start i wzrost: słupki, linia trendu, rakieta, glob
  {
    const d = blocks[3].dio;
    const BCOL = [0xe2e8f0, 0xf87171, 0xfacc15, 0x4ade80, 0x22d3ee, 0x8b5cf6], BH = [.32, .55, .8, 1.1, 1.45, 1.9];
    const bars = BCOL.map((c, k) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(.36, 1, .36), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .35, roughness: .15, metalness: .1, transparent: true, opacity: .88 }));
      m.position.set(-1.95 + k * .52, 0, -.15 - k * .06); d.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); m.add(e);
      return m;
    });
    const tPts = BH.map((h, k) => new THREE.Vector3(-1.95 + k * .52, h + .35 + Math.sin(k * 1.7) * .05, .1 - k * .06));
    tPts.push(new THREE.Vector3(1.2, 2.55, -.3));
    const trendCurve = new THREE.CatmullRomCurve3(tPts);
    const trendMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uP: { value: 1 } }, vertexShader: basicVS,
      fragmentShader: `uniform float uP; varying vec2 vUv; void main(){ if(vUv.x > uP) discard; gl_FragColor = vec4(vec3(.9,.97,1.)*1.4, .95); }` });
    const trend = new THREE.Mesh(new THREE.TubeGeometry(trendCurve, 80, .03, 8), trendMat); d.add(trend);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(.1, .26, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
    const endT = trendCurve.getTangentAt(1); arrow.position.copy(trendCurve.getPointAt(1)); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endT); d.add(arrow);
    // Rakieta
    const rocket = new THREE.Group(); rocket.position.set(1.75, .55, .85); d.add(rocket);
    const prof = [[0, 0], [.17, .02], [.21, .2], [.22, .55], [.19, .8], [.12, .98], [0, 1.08]].map(([x, y]) => new THREE.Vector2(x, y));
    rocket.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 28), std(0xf8fafc, { roughness: .2, metalness: .2 })));
    const red = std(0xef4444, { roughness: .3 });
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.125, .26, 28), red); nose.position.y = 1.08; rocket.add(nose);
    for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.03, .34, .2), red); const an = k / 3 * Math.PI * 2; f.position.set(Math.cos(an) * .21, .16, Math.sin(an) * .21); f.rotation.y = -an; rocket.add(f); }
    const win = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), std(0x38bdf8, { emissive: 0x0ea5e9, emissiveIntensity: .8, metalness: .6, roughness: .1 })); win.position.set(0, .66, .2); rocket.add(win);
    const flame = glow(0xfdba74, .9, .9); flame.position.y = -.12; rocket.add(flame);
    const flame2 = glow(0xffffff, .45, .9); flame2.position.y = -.05; rocket.add(flame2);
    const NF = 120, fp = new Float32Array(NF * 3), fs = Array.from({ length: NF }, () => ({ s: Math.random(), a: Math.random() * 6.28, r: Math.random() }));
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    const fire = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xffb36b, size: .07, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })); rocket.add(fire);
    const smokeMat = std(0xe5e7eb, { roughness: 1 });
    [[0, .14, .42], [.3, .1, .3], [-.3, .1, .3], [.15, .12, -.3], [-.2, .1, -.25], [.42, .06, 0], [-.42, .06, .05]].forEach(([x, y, s]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s * .55, 1), smokeMat); m.position.set(1.75 + x, y + .05, .85 + (s > .35 ? .1 : 0)); d.add(m); });
    // Glob i status
    const globe = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(.42, 14, 10)), new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    globe.position.set(-1.6, 2.35, -1.2); d.add(globe);
    const gG = glow(0x22d3ee, 1.6, .35); gG.position.copy(globe.position); d.add(gG);
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .36), holoMat(canvasTex(420, 120, (g, w, h) => {
      rr(g, 4, 4, w - 8, h - 8, 54); g.fillStyle = 'rgba(14,30,60,.85)'; g.fill(); g.strokeStyle = 'rgba(134,239,172,.9)'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#4ade80'; g.beginPath(); g.arc(56, h / 2, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f1f5ff'; g.font = `700 46px ${FONT}`; g.textBaseline = 'middle'; g.fillText('Strona online', 92, h / 2 + 2);
    }), 1));
    badge.position.set(-.3, 2.95, -1.3); d.add(badge);
    let lift = 0;
    blocks[3].update = (t, a, dt) => {
      const grow = .35 + .65 * a;
      bars.forEach((b, k) => { const h = BH[k] * (grow + Math.sin(t * 1.5 + k) * .02); b.scale.y = h; b.position.y = h / 2; });
      trendMat.uniforms.uP.value = clamp(a * 1.4 - .2); arrow.visible = a > .7;
      lift += ((a > .6 ? .5 : 0) - lift) * .03;
      rocket.position.y = .55 + lift + Math.sin(t * 3) * .02;
      flame.scale.setScalar(.8 + Math.sin(t * 30) * .12 + a * .4); flame.material.opacity = .5 + a * .5;
      fs.forEach((f, k) => { f.s += dt * (1.2 + f.r); if (f.s > 1) { f.s = 0; f.a = Math.random() * 6.28; }
        const rad = f.s * .25 * f.r; fp[k * 3] = Math.cos(f.a) * rad; fp[k * 3 + 1] = -.08 - f.s * (.5 + lift); fp[k * 3 + 2] = Math.sin(f.a) * rad; });
      fg.attributes.position.needsUpdate = true; fire.material.opacity = .3 + a * .6;
      globe.rotation.y = t * .5; badge.position.y = 2.95 + Math.sin(t * 1.4) * .05; badge.material.opacity = .4 + a * .6;
    };
  }

  // ---------- Rury świetlne między blokami ----------
  const tubeMat = (c) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uC: { value: new THREE.Color(c) }, uL: { value: 1 } }, vertexShader: fresnelVS,
    fragmentShader: `uniform float uTime; uniform vec3 uC; uniform float uL; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.6);
        float p = pow(.5 + .5*sin(vUv.x*uL*1.2 - uTime*3.), 10.);
        vec3 col = uC*(f*1.3 + .12) + vec3(.7,.95,1.)*p*.5;
        gl_FragColor = vec4(col, clamp(f*.75 + .1 + p*.3, 0., 1.)); }` });
  const tubes = [], curves = [];
  const addTube = (pts, r, c) => {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const m = tubeMat(c); m.uniforms.uL.value = curve.getLength();
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 20), r, 12), m); scene.add(mesh);
    tubes.push(m); curves.push({ curve, len: curve.getLength(), color: new THREE.Color(c) }); return curve;
  };
  const yM = Y0 + .75, yL = TOP + .32;
  const mids = [];
  for (let i = 0; i < 3; i++) {
    const x0 = BX(i) + W / 2 + .05, x1 = BX(i + 1) - W / 2 - .05, xm = (x0 + x1) / 2;
    addTube([new THREE.Vector3(x0, yM, -1.1), new THREE.Vector3(xm - .5, yM + .1, -1.1), new THREE.Vector3(xm, yM + .7, -.9), new THREE.Vector3(xm + .5, yM + .1, -1.1), new THREE.Vector3(x1, yM, -1.1)], .16, 0x7dd3fc);
    addTube([new THREE.Vector3(x0, yM - .3, 1.0), new THREE.Vector3(xm, yM - .5, 1.25), new THREE.Vector3(x1, yM - .3, 1.0)], .12, 0x38bdf8);
    mids.push(new THREE.Vector3(xm, YT + 3.4, -.9));
  }
  // Wlot (konsultacja) i wylot (publikacja) wzdłuż przedniej krawędzi platformy
  addTube([new THREE.Vector3(-BW / 2 + .6, yL, 3.4), new THREE.Vector3(BX(0) - W / 2 - .3, yL, 3.4), new THREE.Vector3(BX(0) - W / 2 - .5, yL + .2, 1.4), new THREE.Vector3(BX(0) - W / 2 - .05, yM - .4, .2)], .14, 0x67e8f9);
  addTube([new THREE.Vector3(BX(3) + W / 2 + .05, yM - .4, .2), new THREE.Vector3(BX(3) + W / 2 + .5, yL + .2, 1.4), new THREE.Vector3(BX(3) + W / 2 + .3, yL, 3.4), new THREE.Vector3(BW / 2 - .6, yL, 3.4)], .14, 0x67e8f9);
  {
    const pts = [];
    for (let k = 0; k <= 16; k++) { const x = -BW / 2 + 1.5 + k / 16 * (BW - 3); pts.push(new THREE.Vector3(x, yL - .08, 3.95 + Math.sin(k * .8) * .08)); }
    addTube(pts, .09, 0x2563eb);
  }
  for (let i = 0; i < 4; i++) addTube([new THREE.Vector3(BX(i), yL - .1, D / 2 + .3), new THREE.Vector3(BX(i), yL - .1, 3.95)], .07, 0x2563eb);

  // Pulsy danych w rurach
  const NP = 120, pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pSize = new Float32Array(NP);
  const pState = Array.from({ length: NP }, (_, i) => ({ c: i % curves.length, s: Math.random(), v: .6 + Math.random() * .8 }));
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute('aS', new THREE.BufferAttribute(pSize, 1));
  const pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, uniforms: { uPx: { value: 1 } },
    vertexShader: `attribute float aS; uniform float uPx; varying vec3 vC; void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = aS*uPx*(16./-mv.z); }`,
    fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(vC*1.8 + .3, smoothstep(.5,0.,d)); }` });
  scene.add(new THREE.Points(pGeo, pMat));

  const linesGeo = new THREE.BufferGeometry();
  linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  linesGeo.setAttribute('aT', new THREE.Float32BufferAttribute(lineT, 1));
  linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
  scene.add(new THREE.LineSegments(linesGeo, lineMat));

  // Tło
  [[-34, 18, -60, 0, 28, .8], [36, 24, -75, 1, 32, -.4], [10, 34, -95, 0, 20, 2.1]].forEach(([x, y, z, tile, s, rot]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      uniforms: { uTex: { value: galTex }, uTile: { value: tile } }, vertexShader: basicVS,
      fragmentShader: `uniform sampler2D uTex; uniform float uTile; varying vec2 vUv; void main(){ vec3 c = texture2D(uTex, vec2(uTile*.5 + vUv.x*.5, vUv.y)).rgb; gl_FragColor = vec4(c*.8, 1.); }` }));
    m.position.set(x, y, z); m.lookAt(0, 4, 20); m.rotateZ(rot); scene.add(m);
  });
  {
    const n = 2000, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(Math.random() - .5) * 180, Math.random() * 80 - 14, -22 - Math.random() * 100], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfe3ff, size: .12, transparent: true, opacity: .75, depthWrite: false, fog: false })));
  }

  // Etykiety na rurach (HTML)
  const tags = LINKS.map(t => { const el = document.createElement('div'); el.className = 'prc-tag'; el.textContent = t; tagsBox.appendChild(el); return el; });

  // ---------- Ujęcia kamery ----------
  let mobile = null, CAM;
  function layout() {
    // [kamX, kamY, kamZ, celX, celY, celZ, fov]
    const side = [1, -1, 1, -1]; // 1: karta tekstu po prawej, blok po lewej
    CAM = mobile ? [
      [-30, 14, 26, .5, 1.2, 0, 50],
      ...[0, 1, 2, 3].map(i => [BX(i) + 1.4, 10, 15.5, BX(i), .3, 0, 54]),
      [27, 18, 25, 1, -2.4, 0, 56],
    ] : [
      [0, 10.5, 30, 0, 5.2, -1, 40],
      ...[0, 1, 2, 3].map(i => [BX(i) + side[i] * 1.8, 7.6, 14.5, BX(i) + side[i] * 3.4, 2.7, 0, 40]),
      [0, 16.5, 29, 0, .4, 0, 44],
    ];
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    pMat.uniforms.uPx.value = renderer.getPixelRatio() * h / 900;
    const m = innerWidth < 760;
    if (m !== mobile) { mobile = m; layout(); }
  }
  resize(); addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '200px 0px' }).observe(pin);
  new IntersectionObserver(e => document.body.classList.toggle('prc-active', e[0].isIntersecting), { threshold: 0 }).observe(pin);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  const cam = new THREE.Vector3(), look = new THREE.Vector3(), camT = new THREE.Vector3(), lookT = new THREE.Vector3(), v = new THREE.Vector3(), tmp = new THREE.Vector3();
  let fov = 40, last = -1, first = true, prevT = 0;
  const clock = new THREE.Clock();

  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = reduce ? 0 : clock.getElapsedTime(), dt = Math.min(.05, t - prevT); prevT = t;
    const r = pin.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    let seg = 0;
    for (let i = 0; i < KEYS.length - 1; i++) {
      const a = KEYS[i] + .035, b = KEYS[i + 1] - .035;
      if (p >= b) seg = i + 1; else if (p > a) { seg = i + ease((p - a) / (b - a)); break; } else { seg = i; break; }
    }
    const i0 = Math.min(KEYS.length - 2, Math.floor(seg)), f = seg - i0;
    const A = CAM[i0], B = CAM[i0 + 1];
    const arc = Math.sin(f * Math.PI);
    const enter = ease(clamp((-r.top + innerHeight) / innerHeight));
    camT.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f + arc * 1.8, A[2] + (B[2] - A[2]) * f + arc * 3 + (1 - enter) * 12);
    lookT.set(A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f, A[5] + (B[5] - A[5]) * f);
    const fovT = A[6] + (B[6] - A[6]) * f + arc * 3;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camT.x += mouse.x * (mobile ? .3 : 1.2); camT.y -= mouse.y * .6;
    if (first) { cam.copy(camT); look.copy(lookT); fov = fovT; first = false; }
    cam.lerp(camT, .09); look.lerp(lookT, .09); fov += (fovT - fov) * .09;
    camera.position.copy(cam); camera.lookAt(look);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    const stage = Math.round(seg);
    const wide = Math.max(clamp(1 - seg), clamp(seg - 4));
    blocks.forEach((b, i) => {
      const target = Math.max(clamp(1 - Math.abs(seg - (1 + i)) * 1.3), wide * .45);
      b.a += (target - b.a) * .08;
      b.body.uniforms.uA.value = b.a;
      b.edges.material.opacity = .3 + b.a * .6;
      b.strip.material.color.setRGB(.22, .74, .97).multiplyScalar(.5 + b.a * 1.8);
      b.light.intensity = 1.2 + b.a * 7;
      b.update(t, b.a, dt);
    });
    tubes.forEach(m => { m.uniforms.uTime.value = t; });
    lineMat.uniforms.uTime.value = t; deepMat.uniforms.uTime.value = t;

    pState.forEach((s, i) => {
      const C = curves[s.c];
      s.s += dt * s.v * 2.2 / Math.max(C.len, 1);
      if (s.s > 1) { s.s = 0; s.c = (s.c + 5) % curves.length; }
      curves[s.c].curve.getPointAt(clamp(s.s), tmp);
      pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
      const c = curves[s.c].color; pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
      pSize[i] = (2.4 + (i % 4) * .6) * Math.sin(clamp(s.s) * Math.PI);
    });
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; pGeo.attributes.aS.needsUpdate = true;

    tags.forEach((el, i) => {
      v.copy(mids[i]).project(camera);
      el.style.transform = `translate(${(v.x * .5 + .5) * r.width}px,${(-v.y * .5 + .5) * innerHeight}px)`;
      el.style.opacity = mobile ? 0 : clamp(wide * 1.6 - .3) * clamp(enter * 2 - 1);
    });
    panels.forEach(el => {
      const k = +el.dataset.k;
      const o = clamp(1 - Math.abs(seg - k) * 2.4) * (k === 0 ? clamp(enter * 1.5 - .2) : 1);
      el.style.opacity = o;
      el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.pointerEvents = o > .5 ? 'auto' : 'none';
      el.style.visibility = o > .01 ? 'visible' : 'hidden';
    });
    if (stage !== last) {
      last = stage; counter.textContent = '0' + stage;
      dots.forEach((d, i) => d.classList.toggle('on', i === stage));
    }
    bar.style.transform = `scaleX(${p})`;
    renderer.render(scene, camera);
  })();
}
