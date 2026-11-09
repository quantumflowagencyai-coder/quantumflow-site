// Sekcja „Orkiestracja n8n”: szklana płyta z obwodami światła, 6 kostek usług, 3 moduły wdrożenia i hologram agenta AI.
import * as THREE from 'three';

const pin = document.getElementById('orc-pin');
const canvas = document.getElementById('orc-gl');
const tagsBox = document.getElementById('orc-tags');
const panels = [...document.querySelectorAll('.orc-panel')];
const dots = [...document.querySelectorAll('.orc-dots i')];
const counter = document.getElementById('orc-count');
const bar = document.getElementById('orc-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

const CUBES = [
  { t: 'Obsługa klienta AI', c: 0xfb923c, icon: ['M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z', 'M8 11h8M8 14h5'] },
  { t: 'Leady do CRM', c: 0x3b82f6, icon: ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2', 'M13 7a4 4 0 11-8 0 4 4 0 018 0z', 'M19 8v6M22 11h-6'] },
  { t: 'Dane z dokumentów', c: 0x8b5cf6, icon: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6M8 13h8M8 17h5'] },
  { t: 'Raporty', c: 0xd946ef, icon: ['M3 3v18h18', 'M7 15l4-4 3 3 6-7'] },
  { t: 'Chatbot z wiedzą', c: 0x22c55e, icon: ['M20 5c0 1.66-3.58 3-8 3S4 6.66 4 5s3.58-3 8-3 8 1.34 8 3z', 'M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6'] },
  { t: 'Integracje', c: 0x2dd4bf, icon: ['M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7', 'M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7'] },
];
const MODULES = [{ n: '01', t: 'Audyt procesów' }, { n: '02', t: 'Budowa i testy' }, { n: '03', t: 'Wdrożenie i opieka' }];
const KEYS = [0, .16, .32, .48, .64, .8, .96]; // ogół, kostki 1–3, kostki 4–6, moduł 01, 02, 03, CTA
const TOP = .5; // wysokość górnej powierzchni płyty

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { pin.classList.add('no-gl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x04050b, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04050b, .018);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 260);

  // Odbicia dla metalu
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x060812, side: THREE.BackSide })));
  [[0x22d3ee, -9, 5, 0, 4], [0x8b5cf6, 9, 4, 0, 3], [0xffffff, 0, 12, 0, 2.6], [0x3b82f6, 0, 3, -12, 3]].forEach(([c, x, y, z, k]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  scene.environment = pmrem.fromScene(env, .04).texture;

  const loader = new THREE.TextureLoader();
  const galTex = loader.load('/img/agent-galaxy.webp'); galTex.colorSpace = THREE.SRGBColorSpace;
  const robotTex = loader.load('/img/agent-robot.webp'); robotTex.colorSpace = THREE.SRGBColorSpace;

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,255,255,.5)'); r.addColorStop(.55, 'rgba(255,255,255,.1)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();

  const basicVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  const fresnelVS = `varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
    void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mv = viewMatrix*w; vV = -mv.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*mv; }`;

  const roundedRect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };

  // ---------- Głęboki kosmos pod szklaną płytą ----------
  const deepMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: galTex }, uTime: { value: 0 } },
    vertexShader: basicVS,
    fragmentShader: `uniform sampler2D uTex; uniform float uTime; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
      vec3 gal(vec2 uv, vec2 c, float s, float tile, float rot){
        vec2 p = (uv - c)/s; float cs = cos(rot), sn = sin(rot); p = mat2(cs,-sn,sn,cs)*p; p += .5;
        if(p.x<0.||p.x>1.||p.y<0.||p.y>1.) return vec3(0.);
        return texture2D(uTex, vec2(tile*.5 + p.x*.5, p.y)).rgb; }
      void main(){
        vec2 uv = vUv;
        vec3 col = vec3(.008,.012,.03) + vec3(.02,.05,.12)*smoothstep(.9,.0,length(uv-.5));
        vec2 g = floor(uv*420.); float st = step(.996, h(g)); col += vec3(.7,.85,1.)*st*(.5+.5*sin(uTime*2.+h(g+3.)*40.));
        col += gal(uv, vec2(.18,.32), .26, 0., uTime*.01)*1.1;
        col += gal(uv, vec2(.83,.66), .24, 1., -uTime*.012)*1.1;
        col += gal(uv, vec2(.72,.22), .14, 0., 1.4)*.7;
        col += gal(uv, vec2(.3,.78), .13, 1., 2.2)*.7;
        gl_FragColor = vec4(col, 1.);
      }`
  });
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(26, 15), deepMat);
  deep.rotation.x = -Math.PI / 2; deep.position.y = -.35; scene.add(deep);

  // ---------- Szklana płyta ----------
  const BW = 23, BD = 13.5;
  const boardGeo = new THREE.ExtrudeGeometry(roundedRect(BW, BD, 1.6), { depth: .7, bevelEnabled: true, bevelThickness: .12, bevelSize: .12, bevelSegments: 3, curveSegments: 20 });
  boardGeo.rotateX(-Math.PI / 2); boardGeo.translate(0, -.32, 0);
  const glassFS = `uniform vec3 uC; uniform float uO; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
    void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.4);
      vec3 col = mix(vec3(.55,.75,1.), uC, .4)*(f*1.1 + .04);
      gl_FragColor = vec4(col, clamp(f*.75 + .06, 0., 1.)*uO); }`;
  const boardMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uC: { value: new THREE.Color(0x7dd3fc) }, uO: { value: 1 } }, vertexShader: fresnelVS, fragmentShader: glassFS });
  scene.add(new THREE.Mesh(boardGeo, boardMat));
  // Krawędź płyty: metalowa obwódka
  const metal = new THREE.MeshStandardMaterial({ color: 0x9fb0c8, metalness: 1, roughness: .26, envMapIntensity: 1.2 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x1b2232, metalness: .85, roughness: .4 });

  // ---------- Obwody świetlne (linie z pulsami) ----------
  const lineMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: `attribute float aT; varying float vT; varying vec3 vC; void main(){ vT = aT; vC = color; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; uniform float uBoost; varying float vT; varying vec3 vC; void main(){
      float p = pow(.5 + .5*sin(vT*.9 - uTime*2.4), 14.);
      gl_FragColor = vec4(vC*(1.+p*2.), .22 + p*.65 + uBoost*.15); }` });
  const linePos = [], lineT = [], lineCol = [], paths = [];
  const addPath = (pts, color, closed = false, travel = true) => {
    const c = new THREE.Color(color); let acc = 0;
    const P = closed ? [...pts, pts[0]] : pts;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], d = a.distanceTo(b);
      linePos.push(a.x, a.y, a.z, b.x, b.y, b.z); lineT.push(acc, acc + d); acc += d;
      lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    if (travel) paths.push({ P, len: acc, color: c });
  };
  // Pierścienie wokół płyty
  const ringColors = [0x7dd3fc, 0xe0f2fe, 0x38bdf8, 0xfde68a, 0x7dd3fc, 0xbae6fd];
  for (let k = 0; k < 6; k++) {
    const inset = .55 + k * .2;
    const pts = roundedRect(BW - inset * 2, BD - inset * 2, Math.max(.4, 1.6 - inset * .6)).getSpacedPoints(220).map(p => new THREE.Vector3(p.x, TOP + .02, -p.y));
    addPath(pts, ringColors[k], true, k % 2 === 0);
  }

  // ---------- Kostki usług ----------
  const iconTex = (paths2d, col) => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},.55)`); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    g.save(); g.translate(68, 68); g.scale(5, 5);
    g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.shadowColor = '#' + col.getHexString(); g.shadowBlur = 4;
    paths2d.forEach(d => g.stroke(new Path2D(d))); g.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const cubeFS = `uniform vec3 uC; uniform float uA; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
    void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.6);
      vec2 e = min(vUv, 1.-vUv); float edge = smoothstep(.07, .0, min(e.x, e.y));
      float sweep = smoothstep(.12, 0., abs(fract(vUv.y*.7 + vUv.x*.3 - uTime*.25) - .5));
      float top = step(.9, vN.y);
      vec3 col = uC*(.3 + f*1.3 + edge*(1.4 + uA*1.6) + sweep*(.15 + uA*.35)) + vec3(1.)*edge*.35*(.5+uA) + vec3(.8,.9,1.)*top*.08;
      gl_FragColor = vec4(col, clamp(.32 + f*.5 + edge*.7 + sweep*.12, 0., 1.)*(.75 + uA*.25)); }`;
  const coreFS = `uniform vec3 uC; uniform float uA; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
    void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC*(.25 + uA*.5)*f, 1.); }`;
  const cubes = CUBES.map((C, i) => {
    const g = new THREE.Group(); scene.add(g);
    const col = new THREE.Color(C.c);
    const S = 1.9;
    const shellMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: col }, uA: { value: 0 }, uTime: { value: 0 } }, vertexShader: fresnelVS, fragmentShader: cubeFS });
    const shell = new THREE.Mesh(new THREE.BoxGeometry(S, S, S), shellMat); g.add(shell);
    const coreMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: col }, uA: { value: 0 } }, vertexShader: fresnelVS, fragmentShader: coreFS });
    const core = new THREE.Mesh(new THREE.BoxGeometry(S * .62, S * .62, S * .62), coreMat); g.add(core);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(S, S, S)), new THREE.LineBasicMaterial({ color: col.clone().lerp(new THREE.Color(1, 1, 1), .5), transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    g.add(edges);
    const icon = new THREE.Mesh(new THREE.PlaneGeometry(S * .78, S * .78), new THREE.MeshBasicMaterial({ map: iconTex(C.icon, col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    icon.position.z = S / 2 + .01; g.add(icon);
    const iconTop = icon.clone(); iconTop.rotation.x = -Math.PI / 2; iconTop.position.set(0, S / 2 + .01, 0); g.add(iconTop);
    // Cokół
    const base = new THREE.Mesh(new THREE.BoxGeometry(S * 1.12, .16, S * 1.12), metalDark); base.position.y = TOP + .08; scene.add(base);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .3 }));
    halo.scale.set(4.6, 4.6, 1); scene.add(halo);
    const el = document.createElement('div'); el.className = 'orc-tag'; el.style.setProperty('--c', '#' + col.getHexString());
    el.textContent = C.t; tagsBox.appendChild(el);
    return { g, core, shellMat, coreMat, edges, icon, base, halo, el, col, a: 0, S };
  });

  // ---------- Moduły wdrożenia ----------
  const modTex = (M) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 300; const g = c.getContext('2d');
    const draw = () => {
      g.clearRect(0, 0, 1024, 300);
      const gr = g.createLinearGradient(0, 0, 260, 0); gr.addColorStop(0, '#60a5fa'); gr.addColorStop(1, '#22d3ee');
      g.fillStyle = gr; g.font = '700 150px "Space Grotesk", Inter, sans-serif'; g.textBaseline = 'alphabetic';
      g.fillText(M.n, 60, 160);
      g.fillStyle = '#e8eeff'; g.font = '600 76px "Space Grotesk", Inter, sans-serif';
      g.fillText(M.t, 60, 262);
      t.needsUpdate = true;
    };
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    draw(); if (document.fonts) document.fonts.ready.then(draw);
    return t;
  };
  const modGlassFS = `uniform vec3 uC; uniform float uA; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
    void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.);
      vec2 e = min(vUv, 1.-vUv); float edge = smoothstep(.04, .0, min(e.x, e.y));
      float sweep = smoothstep(.08, 0., abs(fract(vUv.x*.5 - uTime*.15) - .5));
      vec3 col = mix(vec3(.7,.85,1.), uC, .5)*(f*.9 + edge*(.6 + uA*1.2) + sweep*(.06 + uA*.25));
      gl_FragColor = vec4(col, clamp(f*.6 + .08 + edge*.6 + sweep*.1, 0., 1.)); }`;
  const modules = MODULES.map((M, i) => {
    const g = new THREE.Group(); scene.add(g);
    const W = 5.8, H = 1.55, D = 2.5;
    const col = new THREE.Color(0x38bdf8);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(W - .3, H - .3, D - .3), new THREE.MeshStandardMaterial({ color: 0x0b1222, metalness: .7, roughness: .35, transparent: true, opacity: .82 }));
    g.add(inner);
    const glassMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: col }, uA: { value: 0 }, uTime: { value: 0 } }, vertexShader: fresnelVS, fragmentShader: modGlassFS });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), glassMat));
    // Metalowe zaciski po bokach (jak złącza w referencji)
    [-1, 1].forEach(s => {
      const clampM = new THREE.Mesh(new THREE.BoxGeometry(.2, H * .82, D * .9), metal); clampM.position.x = s * (W / 2 + .06); g.add(clampM);
    });
    const label = new THREE.Mesh(new THREE.PlaneGeometry(W * .86, W * .86 * 300 / 1024), new THREE.MeshBasicMaterial({ map: modTex(M), transparent: true, depthWrite: false, toneMapped: false }));
    label.position.set(0, 0, D / 2 + .02); g.add(label);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(W * .8, .05, .05), new THREE.MeshBasicMaterial({ color: col, toneMapped: false }));
    strip.position.set(0, -H / 2 + .12, D / 2 + .03); g.add(strip);
    const light = new THREE.PointLight(0x38bdf8, 4, 8, 1.6); light.position.set(0, 1.6, 1.8); g.add(light);
    return { g, glassMat, strip, light, a: 0, W, H, D };
  });
  // Szyny łączące moduły
  const rails = [];
  for (let i = 0; i < 2; i++) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(1, .26, .9), metal); scene.add(r); rails.push(r);
  }

  // ---------- Panel CTA (szklana tafla z przyciskiem-klejnotem) ----------
  const ctaGroup = new THREE.Group(); scene.add(ctaGroup);
  const ctaMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uC: { value: new THREE.Color(0x22d3ee) }, uA: { value: 0 }, uTime: { value: 0 } }, vertexShader: fresnelVS, fragmentShader: modGlassFS });
  const ctaSlab = new THREE.Mesh(new THREE.BoxGeometry(17.5, .32, 2.6), ctaMat); ctaGroup.add(ctaSlab);
  const pillGeo = new THREE.ExtrudeGeometry(roundedRect(3.6, 1.0, .5), { depth: .22, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 3, curveSegments: 16 });
  pillGeo.rotateX(-Math.PI / 2);
  const gemMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: .3, roughness: .2, emissive: 0x22d3ee, emissiveIntensity: .35 });
  const gem = new THREE.Mesh(pillGeo, gemMat); gem.position.set(5.6, .12, 0); ctaGroup.add(gem);
  const gemGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x22d3ee, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .4 }));
  gemGlow.scale.set(6, 2.4, 1); gemGlow.position.set(5.6, .5, 0); ctaGroup.add(gemGlow);

  // ---------- Chipy n8n po bokach płyty ----------
  const chipTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    const draw = () => {
      g.clearRect(0, 0, 256, 128); g.fillStyle = '#0b1020'; g.fillRect(0, 0, 256, 128);
      g.strokeStyle = '#e2e8f0'; g.lineWidth = 6; g.fillStyle = '#e2e8f0';
      [[46, 64], [96, 46], [96, 82], [146, 64]].forEach(([x, y], k) => { g.beginPath(); g.arc(x - 16, y, 9, 0, Math.PI * 2); k === 0 ? g.fill() : g.stroke(); });
      g.beginPath(); g.moveTo(39, 64); g.lineTo(71, 46); g.moveTo(39, 64); g.lineTo(71, 82); g.moveTo(89, 46); g.lineTo(121, 64); g.moveTo(89, 82); g.lineTo(121, 64); g.stroke();
      g.font = '700 46px "Space Grotesk", Inter, sans-serif'; g.textBaseline = 'middle'; g.fillText('n8n', 150, 66);
      t.needsUpdate = true;
    };
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; draw(); if (document.fonts) document.fonts.ready.then(draw); return t;
  })();
  const chips = [];
  [[-BW / 2 - .1, -2.2, 1], [-BW / 2 - .1, 2.6, 1], [BW / 2 + .1, -2.2, -1], [BW / 2 + .1, 2.6, -1]].forEach(([x, z, s]) => {
    const g = new THREE.Group(); g.position.set(x + s * .9, TOP + .2, z); scene.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .36, 1.1), metalDark));
    const top = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: chipTex, toneMapped: false })); top.rotation.x = -Math.PI / 2; top.position.y = .185; g.add(top);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(2.3, .46, 1.2), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: new THREE.Color(0x7dd3fc) }, uO: { value: .8 } }, vertexShader: fresnelVS, fragmentShader: glassFS }));
    g.add(gl); chips.push(g);
  });

  // ---------- Hologram agenta AI ----------
  const robotMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTex: { value: robotTex }, uTime: { value: 0 }, uIn: { value: 0 }, uO: { value: 1 } },
    vertexShader: basicVS,
    fragmentShader: `uniform sampler2D uTex; uniform float uTime; uniform float uIn; uniform float uO; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec2 uv = vUv;
        float gl = step(.986, h(vec2(floor(uTime*10.), floor(uv.y*30.))));
        uv.x += gl*.025*(h(vec2(uTime)) - .5);
        vec4 t = texture2D(uTex, uv);
        float scan = .78 + .22*sin(vUv.y*340. - uTime*5.);
        float reveal = smoothstep(uIn - .06, uIn, vUv.y) ; reveal = 1. - reveal;
        float line = smoothstep(.012, 0., abs(vUv.y - uIn))*step(uIn, 1.);
        vec3 col = mix(t.rgb*1.25, vec3(.35,.85,1.)*dot(t.rgb, vec3(.33)), .35)*scan;
        gl_FragColor = vec4(col + vec3(.4,.9,1.)*line*t.a*2., t.a*reveal*.95*uO + line*t.a*.6);
      }` });
  const ROBOT_H = 10.5;
  const robot = new THREE.Mesh(new THREE.PlaneGeometry(ROBOT_H * 256 / 272, ROBOT_H), robotMat); scene.add(robot);
  const projMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uA: { value: 0 } }, vertexShader: basicVS,
    fragmentShader: `uniform float uA; varying vec2 vUv; void main(){ float a = pow(1.-vUv.y, 1.6)*.22*uA; gl_FragColor = vec4(vec3(.3,.8,1.)*a, a); }` });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 1.2, 6.5, 48, 1, true), projMat); scene.add(beam);
  const projector = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, .22, 48), metal); scene.add(projector);
  const projRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, .04, 10, 80), new THREE.MeshBasicMaterial({ color: 0x67e8f9, toneMapped: false })); projRing.rotation.x = Math.PI / 2; scene.add(projRing);

  // ---------- Pulsy danych biegnące po obwodach ----------
  const linesGeo = new THREE.BufferGeometry();
  const commitLines = () => {
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    linesGeo.setAttribute('aT', new THREE.Float32BufferAttribute(lineT, 1));
    linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
  };
  scene.add(new THREE.LineSegments(linesGeo, lineMat));
  const NP = 140, pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pSize = new Float32Array(NP);
  const pState = Array.from({ length: NP }, () => ({ path: 0, s: Math.random(), v: .05 + Math.random() * .08 }));
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('aS', new THREE.BufferAttribute(pSize, 1));
  const pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uPx: { value: 1 } },
    vertexShader: `attribute float aS; uniform float uPx; varying vec3 vC; void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = aS*uPx*(16./-mv.z); }`,
    fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(vC*1.8, smoothstep(.5,0.,d)); }` });
  scene.add(new THREE.Points(pGeo, pMat));
  const along = (P, s, out) => {
    let d = s;
    for (let i = 1; i < P.length; i++) { const l = P[i - 1].distanceTo(P[i]); if (d <= l) return out.lerpVectors(P[i - 1], P[i], d / Math.max(l, 1e-4)); d -= l; }
    return out.copy(P[P.length - 1]);
  };

  // Tło: odległe galaktyki i gwiazdy
  [[-30, 16, -60, 0, 26, .8], [34, 22, -70, 1, 30, -.4], [12, 30, -90, 0, 18, 2.1]].forEach(([x, y, z, tile, s, rot]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      uniforms: { uTex: { value: galTex }, uTile: { value: tile } }, vertexShader: basicVS,
      fragmentShader: `uniform sampler2D uTex; uniform float uTile; varying vec2 vUv; void main(){ vec3 c = texture2D(uTex, vec2(uTile*.5 + vUv.x*.5, vUv.y)).rgb; gl_FragColor = vec4(c*.8, 1.); }` }));
    m.position.set(x, y, z); m.rotation.z = rot; m.lookAt(0, 4, 20); scene.add(m);
  });
  {
    const n = 1800, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(Math.random() - .5) * 160, Math.random() * 70 - 12, -20 - Math.random() * 90], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfe3ff, size: .12, transparent: true, opacity: .75, depthWrite: false, fog: false })));
  }

  // ---------- Układ, ścieżki i ujęcia kamery ----------
  const cubeX = i => (i - 2.5) * 3.3, CUBE_Z = -3.2;
  const modX = i => (i - 1) * 6.9, MOD_Z = 1.0;
  const CTA_Z = 4.75;
  cubes.forEach((c, i) => {
    c.g.position.set(cubeX(i), TOP + .16 + c.S / 2 + .15, CUBE_Z);
    c.base.position.set(cubeX(i), TOP + .08, CUBE_Z);
    c.halo.position.set(cubeX(i), TOP + 1.2, CUBE_Z);
  });
  modules.forEach((m, i) => m.g.position.set(modX(i), TOP + m.H / 2 + .02, MOD_Z));
  rails.forEach((r, i) => { r.position.set((modX(i) + modX(i + 1)) / 2, TOP + .55, MOD_Z); r.scale.x = 6.9 - 5.8 - .7; });
  ctaGroup.position.set(0, TOP + .18, CTA_Z);
  const RZ = -9.2;
  robot.position.set(0, TOP + ROBOT_H / 2, RZ);
  beam.position.set(0, TOP + 3.1, RZ + .2); projector.position.set(0, TOP - .1, RZ + .2); projRing.position.set(0, TOP + .03, RZ + .2);
  // Ścieżki: kostka → moduł (ortogonalne, po kilka równoległych torów)
  const y0 = TOP + .02, V = (x, z) => new THREE.Vector3(x, y0, z);
  cubes.forEach((c, i) => {
    const m = Math.floor(i / 2), xm = modX(m) + (i % 2 ? .9 : -.9), xc = cubeX(i);
    for (let k = -1; k <= 1; k++) {
      const o = k * .14;
      addPath([V(xc + o, CUBE_Z + 1.1), V(xc + o, -1.15 + o), V(xm + o, -1.15 + o), V(xm + o, MOD_Z - 1.25)], c.col.getHex(), false, k === 0);
    }
  });
  // moduły → CTA
  modules.forEach((m, i) => { for (let k = -1; k <= 1; k++) addPath([V(modX(i) + k * .16, MOD_Z + 1.25), V(modX(i) + k * .16, CTA_Z - 1.3)], 0x7dd3fc, false, k === 0); });
  // chipy → pierścienie
  [[-1, -2.2], [-1, 2.6], [1, -2.2], [1, 2.6]].forEach(([s, z]) => { for (let k = -1; k <= 1; k++) addPath([V(s * (BW / 2 - .2), z + k * .15), V(s * (BW / 2 - 1.8), z + k * .15)], 0xbae6fd, false, false); });
  // projektor hologramu → kostki
  for (let k = -2; k <= 2; k++) addPath([V(k * .22, -6.6), V(k * .22, -5.2), V(k * 3.3, -4.8), V(k * 3.3, CUBE_Z - 1.05)], 0x67e8f9, false, k === 0);
  commitLines();
  pState.forEach((s, i) => { s.path = i % paths.length; s.s = Math.random(); });

  let mobile = null, CAM;
  function layout() {
    // [kamX, kamY, kamZ, celX, celY, celZ, fov]
    CAM = mobile ? [
      [0, 8.6, 29, 0, 5.4, -4, 58],
      [cubeX(1), 13.5, 10, cubeX(1), -1.6, -3.6, 62],
      [cubeX(4), 13.5, 10, cubeX(4), -1.6, -3.6, 62],
      [modX(0), 12, 17, modX(0), -1, MOD_Z, 52],
      [modX(1), 12, 17, modX(1), -1, MOD_Z, 52],
      [modX(2), 12, 17, modX(2), -1, MOD_Z, 52],
      [0, 27, 21, 0, -5, 1.2, 60],
    ] : [
      [-1.5, 8.6, 25, -3.2, 5.3, -3, 42],
      [cubeX(1), 7.6, 5.6, cubeX(1), .6, -3.4, 46],
      [cubeX(4), 7.6, 5.6, cubeX(4), .6, -3.4, 46],
      [modX(0) + 4, 9.5, 16, modX(0) + 5, .4, MOD_Z, 34],
      [modX(1) - 4, 9.5, 16, modX(1) - 5, .4, MOD_Z, 34],
      [modX(2) - 4, 9.5, 16, modX(2) - 5, .4, MOD_Z, 34],
      [0, 15, 17, 0, -1.2, 1.6, 44],
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
  new IntersectionObserver(e => document.body.classList.toggle('orc-active', e[0].isIntersecting), { threshold: 0 }).observe(pin);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  const cam = new THREE.Vector3(), look = new THREE.Vector3(), camT = new THREE.Vector3(), lookT = new THREE.Vector3(), v = new THREE.Vector3(), tmp = new THREE.Vector3();
  let fov = 42, last = -1, first = true, prevT = 0;
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
    camT.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f + arc * 1.6, A[2] + (B[2] - A[2]) * f + arc * 2.4 + (1 - enter) * 12);
    lookT.set(A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f, A[5] + (B[5] - A[5]) * f);
    const fovT = A[6] + (B[6] - A[6]) * f + arc * 3;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camT.x += mouse.x * (mobile ? .3 : 1.2); camT.y -= mouse.y * .6;
    if (first) { cam.copy(camT); look.copy(lookT); fov = fovT; first = false; }
    cam.lerp(camT, .09); look.lerp(lookT, .09); fov += (fovT - fov) * .09;
    camera.position.copy(cam); camera.lookAt(look);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    const stage = Math.round(seg);
    const wide = Math.max(clamp(1 - seg), clamp(seg - 5)); // ujęcia ogólne: start i finał
    // Kostki: grupa 1–3 na etapie 1, 4–6 na etapie 2
    cubes.forEach((c, i) => {
      const grp = i < 3 ? 1 : 2;
      const target = Math.max(clamp(1 - Math.abs(seg - grp) * 1.4), clamp(1 - Math.abs(seg - (3 + Math.floor(i / 2))) * 1.6) * .6, wide * .35);
      c.a += (target - c.a) * .1;
      const a = c.a;
      c.shellMat.uniforms.uA.value = a; c.shellMat.uniforms.uTime.value = t + i * .7;
      c.coreMat.uniforms.uA.value = a;
      c.g.position.y = TOP + .16 + c.S / 2 + .15 + Math.sin(t * 1.2 + i * .9) * .08 + a * .25;
      c.g.rotation.y = Math.sin(t * .4 + i) * .12 + a * .0;
      c.core.rotation.set(t * .5 + i, t * .7 + i, 0);
      c.halo.material.opacity = .12 + a * .45;
      c.edges.material.opacity = .45 + a * .55;
      v.set(cubeX(i), TOP + c.S + 1.25, CUBE_Z).project(camera);
      c.el.style.transform = `translate(${(v.x * .5 + .5) * r.width}px,${(-v.y * .5 + .5) * innerHeight}px)`;
      c.el.style.opacity = mobile ? 0 : clamp(clamp(1 - seg) * 1.8 - .4) * clamp(enter * 2 - 1);
    });
    modules.forEach((m, i) => {
      const target = Math.max(clamp(1 - Math.abs(seg - (3 + i)) * 1.5), wide * .3);
      m.a += (target - m.a) * .1;
      m.glassMat.uniforms.uA.value = m.a; m.glassMat.uniforms.uTime.value = t + i;
      m.strip.material.color.setRGB(.22, .74, .97).multiplyScalar(.5 + m.a * 1.8);
      m.light.intensity = 1.5 + m.a * 9;
    });
    const ctaA = clamp(seg - 5);
    ctaMat.uniforms.uA.value = .1 + ctaA * .35; ctaMat.uniforms.uTime.value = t;
    gemMat.emissiveIntensity = .3 + ctaA * .5 + Math.sin(t * 3) * .08; gemGlow.material.opacity = .25 + ctaA * .5 + Math.sin(t * 3) * .05;
    // Hologram agenta: pojawia się przy wejściu, przygasa przy zbliżeniach
    robotMat.uniforms.uTime.value = t;
    robotMat.uniforms.uIn.value = Math.min(1.05, Math.max(robotMat.uniforms.uIn.value, enter * 1.25 - .15));
    robotMat.uniforms.uO.value = .45 + wide * .55;
    robot.position.y = TOP + ROBOT_H / 2 + Math.sin(t * .8) * .1;
    projMat.uniforms.uA.value = .5 + wide * .5;
    projRing.material.color.setRGB(.4, .9, .98).multiplyScalar(1 + Math.sin(t * 3) * .3);
    projRing.visible = beam.visible = projector.visible = wide > .02;
    lineMat.uniforms.uTime.value = t; lineMat.uniforms.uBoost.value = wide;
    deepMat.uniforms.uTime.value = t;

    // Pulsy danych
    pState.forEach((s, i) => {
      const P = paths[s.path];
      s.s += dt * s.v * (8 / Math.max(P.len, 1)) * 6;
      if (s.s > 1) { s.s = 0; s.path = (s.path + 7) % paths.length; }
      along(paths[s.path].P, s.s * paths[s.path].len, tmp);
      pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y + .03; pPos[i * 3 + 2] = tmp.z;
      const c = paths[s.path].color; pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
      pSize[i] = (2.2 + (i % 5) * .5) * Math.sin(s.s * Math.PI);
    });
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; pGeo.attributes.aS.needsUpdate = true;

    // Teksty
    panels.forEach(el => {
      const k = +el.dataset.k;
      const o = clamp(1 - Math.abs(seg - k) * 2.4) * (k === 0 ? clamp(enter * 1.5 - .2) : 1);
      const dy = (1 - o) * 24;
      el.style.opacity = o;
      el.style.transform = `translateY(${dy}px)`;
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
