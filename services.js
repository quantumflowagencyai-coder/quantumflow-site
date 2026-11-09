// Sekcja „Usługi”: szklane filary z hologramami usług, kamera przelatuje między nimi w rytmie przewijania.
import * as THREE from 'three';

const pin = document.getElementById('svc-pin');
const canvas = document.getElementById('svc-gl');
const tagsBox = document.getElementById('svc-tags');
const intro = document.querySelector('.svc-intro');
const steps = [...document.querySelectorAll('.svc-step')];
const dots = [...document.querySelectorAll('.svc-dots i')];
const counter = document.getElementById('svc-count');
const bar = document.getElementById('svc-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

const PILLARS = [
  { t: 'Nowa strona 3D', n: '01', c: 0x22d3ee, tex: 0, tile: 0 },
  { t: 'Redesign strony', n: '02', c: 0x3b82f6, tex: 0, tile: 1 },
  { t: 'Opieka i rozwój', n: '03', c: 0x2dd4bf, tex: 1, tile: 0 },
  { t: 'Automatyzacje AI', n: '04', c: 0xf5a524, tex: 1, tile: 1 },
];
const KEYS = [0, .22, .44, .66, .88]; // ujęcie ogólne + 4 filary

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { pin.classList.add('no-gl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x05050c, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050c, .028);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 200);

  // Środowisko do odbić metalu: ciemne studio z pasami światła w kolorach marki
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x070912, side: THREE.BackSide })));
  [[0x22d3ee, -9, 4, 0, 4], [0x3b82f6, 9, 3, 0, 4], [0xffffff, 0, 12, 0, 2.5], [0x2dd4bf, 0, 2, -12, 3]].forEach(([c, x, y, z, k]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  scene.environment = pmrem.fromScene(env, .04).texture;

  const loader = new THREE.TextureLoader();
  const texs = ['/img/svc-a.webp', '/img/svc-b.webp'].map(src => { const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; });

  // Miękka poświata (sprite)
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.18, 'rgba(255,255,255,.55)'); r.addColorStop(.5, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
  })();

  // ---------- Podłoga: siatka, kałuże światła pod filarami ----------
  const floorMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uP: { value: PILLARS.map(() => new THREE.Vector3()) }, uC: { value: PILLARS.map(p => new THREE.Color(p.c)) }, uA: { value: [0, 0, 0, 0] } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uP[4]; uniform vec3 uC[4]; uniform float uA[4]; varying vec3 vW;
      void main(){
        vec2 g = abs(fract(vW.xz*.5 - .5) - .5) / fwidth(vW.xz*.5);
        float line = 1. - min(min(g.x, g.y), 1.);
        float d0 = length(vW.xz);
        vec3 col = vec3(.13,.55,.9)*line*.16*smoothstep(26.,4.,d0);
        float ring = smoothstep(.06,0.,abs(fract(d0*.08 - uTime*.05) - .5))*smoothstep(24.,6.,d0)*.08;
        col += vec3(.2,.7,1.)*ring;
        for(int i=0;i<4;i++){
          float d = length(vW.xz - uP[i].xz);
          col += uC[i]*(exp(-d*d*.35)*(.25 + uA[i]*.9) + exp(-d*.55)*.06*(1.+uA[i]));
          col += uC[i]*smoothstep(.05,0.,abs(d-1.75))*(.12+uA[i]*.5);
        }
        float a = smoothstep(30.,6.,d0);
        gl_FragColor = vec4(col, a);
      }`
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  // ---------- Filary ----------
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa6bd, metalness: 1, roughness: .28, envMapIntensity: 1.1 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x2a3142, metalness: .9, roughness: .45 });
  const glassVS = `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; vN = normalMatrix*normal; gl_Position = projectionMatrix*mv; }`;
  const glassFS = `uniform vec3 uC; uniform float uA; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){
      float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
      float scan = smoothstep(.0,.9, sin(vUv.y*90. - uTime*3.)*.5 + .5)*.05;
      float sweep = smoothstep(.1,0.,abs(fract(vUv.y*.6 - uTime*.18) - .5))*.35;
      float ends = smoothstep(.12,0.,vUv.y) + smoothstep(.88,1.,vUv.y);
      float streak = smoothstep(.015,0.,abs(fract(vUv.x*2. + .13) - .5))*.25;
      vec3 col = mix(vec3(.75,.9,1.), uC, .55)*(f*(.55 + uA*.9) + scan + streak*.6) + uC*(sweep*(.25+uA*.6) + ends*(.35+uA*.8));
      float a = clamp(f*.7 + .05 + scan + sweep*.4 + ends*.5 + streak*.35, 0., 1.)*(.55 + uA*.45);
      gl_FragColor = vec4(col, a);
    }`;
  const holoFS = `uniform sampler2D uTex; uniform vec2 uOff; uniform vec3 uC; uniform float uA; uniform float uTime; uniform float uIn; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 uv = vUv;
      float glitch = step(.985, h(vec2(floor(uTime*12.), floor(uv.y*24.))))*(1.-uA*.6);
      uv.x += glitch*.03*(h(vec2(uTime)) - .5);
      vec3 t = texture2D(uTex, uOff + uv*vec2(.5,1.)).rgb;
      float lum = max(t.r, max(t.g, t.b));
      float a = smoothstep(.04, .3, lum);
      float scan = .82 + .18*sin(vUv.y*260. + uTime*6.);
      float reveal = 1. - smoothstep(uIn - .08, uIn, 1. - vUv.y);
      vec3 col = mix(t*(1.2 + uA*.5), uC*lum*1.6, .15 + (1.-uA)*.35)*scan;
      float edge = smoothstep(.0,.06,vUv.x)*smoothstep(1.,.94,vUv.x)*smoothstep(0.,.06,vUv.y)*smoothstep(1.,.94,vUv.y);
      gl_FragColor = vec4(col, a*edge*reveal*(.45 + uA*.55));
    }`;

  const pillars = PILLARS.map((P, i) => {
    const g = new THREE.Group(); scene.add(g);
    const col = new THREE.Color(P.c);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.5, .42, 64), metal); base.position.y = .21; g.add(base);
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.62, .14, 64), metalDark); base2.position.y = .07; g.add(base2);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.26, .34, 64), metal); cap.position.y = 4.92; g.add(cap);
    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.4, .12, 64), metalDark); capTop.position.y = 5.15; g.add(capTop);
    const ringMat = new THREE.MeshBasicMaterial({ color: col, toneMapped: false });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.17, .035, 12, 96), ringMat); ringA.rotation.x = Math.PI / 2; ringA.position.y = .45; g.add(ringA);
    const ringB = ringA.clone(); ringB.position.y = 4.73; g.add(ringB);
    const glassMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: col }, uA: { value: 0 }, uTime: { value: 0 } }, vertexShader: glassVS, fragmentShader: glassFS });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 4.3, 72, 1, true), glassMat); glass.position.y = 2.59; g.add(glass);
    // Wiązka światła od podstawy
    const beamMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uC: { value: col }, uA: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ float a = pow(1.-vUv.y, 2.2)*(.12 + uA*.3); gl_FragColor = vec4(uC*a, a); }` });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.55, 1.05, 4, 48, 1, true), beamMat); beam.position.y = 2.45; g.add(beam);
    // Hologram usługi
    const holoMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTex: { value: texs[P.tex] }, uOff: { value: new THREE.Vector2(P.tile * .5, 0) }, uC: { value: col }, uA: { value: 0 }, uTime: { value: 0 }, uIn: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: holoFS });
    const holo = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), holoMat); holo.position.y = 2.6; g.add(holo);
    // Poświata i światło
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .3 }));
    halo.scale.set(5.5, 7, 1); halo.position.y = 2.6; g.add(halo);
    const light = new THREE.PointLight(col, 6, 9, 1.6); light.position.set(0, 2.6, 1.6); g.add(light);
    // Etykieta HTML nad filarem
    const el = document.createElement('div'); el.className = 'svc-tag'; el.style.setProperty('--c', '#' + col.getHexString());
    el.innerHTML = `<small>${P.n}</small><b>${P.t}</b>`; tagsBox.appendChild(el);
    return { g, P, glassMat, beamMat, holoMat, holo, halo, ringMat, light, el, col, a: 0 };
  });

  // Unoszące się iskry wewnątrz filarów
  const SP = 70, spGeo = new THREE.BufferGeometry();
  const spPos = new Float32Array(SP * 4 * 3), spSeed = new Float32Array(SP * 4), spIdx = new Float32Array(SP * 4);
  for (let i = 0; i < SP * 4; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * .95;
    spPos.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3); spSeed[i] = Math.random(); spIdx[i] = Math.floor(i / SP);
  }
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  spGeo.setAttribute('aSeed', new THREE.BufferAttribute(spSeed, 1));
  spGeo.setAttribute('aIdx', new THREE.BufferAttribute(spIdx, 1));
  const spMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uP: { value: PILLARS.map(() => new THREE.Vector3()) }, uC: { value: PILLARS.map(p => new THREE.Color(p.c)) }, uA: { value: [0, 0, 0, 0] }, uPx: { value: 1 } },
    vertexShader: `attribute float aSeed; attribute float aIdx; uniform float uTime; uniform vec3 uP[4]; uniform vec3 uC[4]; uniform float uA[4]; uniform float uPx; varying vec3 vC; varying float vA;
      void main(){ int k = int(aIdx); vec3 p = position + uP[k];
        float y = fract(aSeed + uTime*(.06 + aSeed*.08)); p.y = .5 + y*4.1; p.x += sin(uTime + aSeed*30.)*.06;
        vC = uC[k]; vA = sin(y*3.14159)*(.35 + uA[k]*.65);
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (2. + aSeed*3.)*uPx*(9./-mv.z); }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if(d>.5) discard; gl_FragColor = vec4(vC*1.6, smoothstep(.5,0.,d)*vA); }` });
  scene.add(new THREE.Points(spGeo, spMat));

  // ---------- Tło: wstęga świetlnych linii i świecące kule na niciach ----------
  const ribbon = new THREE.Group(); scene.add(ribbon);
  {
    const L = 110, N = 220, pos = [], tt = [], cc = [];
    const c1 = new THREE.Color(0x22d3ee), c2 = new THREE.Color(0x3b82f6), c3 = new THREE.Color(0xe0f2fe), tmp = new THREE.Color();
    for (let l = 0; l < L; l++) {
      const ph = l / L, off = (Math.random() - .5) * .35, tw = Math.random() * .4;
      let prev = null;
      for (let j = 0; j <= N; j++) {
        const u = j / N * Math.PI * 2;
        const R = 7.5 + Math.sin(u * 2 + ph * 6.28) * 1.2 + off * 3;
        const x = Math.cos(u) * R, y = Math.sin(u) * R * .55 + Math.sin(u * 3 + ph * 4) * (.6 + tw);
        const z = Math.sin(u * 2 + ph * 3.14) * 2.2 + (ph - .5) * 3.2 + Math.cos(u * 5 + l) * .15;
        const cur = [x, y, z];
        if (prev) {
          pos.push(...prev, ...cur); tt.push((j - 1) / N + ph * .37, j / N + ph * .37);
          tmp.copy(c1).lerp(ph < .5 ? c2 : c3, Math.abs(Math.sin(u + ph * 3)) * .8); cc.push(tmp.r, tmp.g, tmp.b, tmp.r, tmp.g, tmp.b);
        }
        prev = cur;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aT', new THREE.Float32BufferAttribute(tt, 1));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { uTime: { value: 0 }, uO: { value: 1 } },
      vertexShader: `attribute float aT; varying float vT; varying vec3 vC; void main(){ vT = aT; vC = color; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; uniform float uO; varying float vT; varying vec3 vC; void main(){
        float pulse = pow(.5 + .5*sin(vT*40. - uTime*2.), 18.);
        gl_FragColor = vec4(vC, (.07 + pulse*.5)*uO); }` });
    ribbon.add(new THREE.LineSegments(geo, mat));
    ribbon.userData.mat = mat;
  }
  ribbon.position.set(15, 9.5, -27); ribbon.rotation.set(.35, -.5, .2);

  // Kule światła na niciach (jak w referencji)
  const orbs = new THREE.Group(); scene.add(orbs);
  const orbList = [];
  [[-12, 9, -16, 0x22d3ee], [-6, 12.5, -24, 0xbfe9ff], [3, 11, -18, 0x3b82f6], [-15, 4.5, -12, 0x2dd4bf], [16, 12, -20, 0xf5a524], [8, 14, -26, 0x22d3ee]].forEach(([x, y, z, c], i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(1.6); s.position.set(x, y, z); orbs.add(s);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    core.scale.setScalar(.45); core.position.copy(s.position); orbs.add(core);
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, y, z), new THREE.Vector3(x * .4 + 4, y + 3, z + 4), new THREE.Vector3(10, 2, -14));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }));
    orbs.add(line);
    orbList.push({ s, core, ph: i * 1.7 });
  });

  // Gwiazdy
  {
    const n = 1400, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(Math.random() - .5) * 110, Math.random() * 50 - 6, -10 - Math.random() * 60], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fd8ff, size: .09, transparent: true, opacity: .7, depthWrite: false })));
  }

  // ---------- Układ i kamera ----------
  let mobile = null, CAM;
  function layout() {
    const sp = mobile ? 3.4 : 5;
    pillars.forEach((p, i) => {
      const x = (i - 1.5) * sp, z = -Math.abs(i - 1.5) * (mobile ? .9 : 1.1) + .6;
      p.g.position.set(x, 0, z);
      floorMat.uniforms.uP.value[i].set(x, 0, z); spMat.uniforms.uP.value[i].set(x, 0, z);
    });
    // [kamX, kamY, kamZ, celX, celY, celZ, fov]
    const P = pillars.map(p => p.g.position);
    CAM = mobile ? [
      [0, 6, 30, 0, 5.1, 0, 50],
      ...P.map(v => [v.x * .92, 3.8, v.z + 11.5, v.x, 1.05, v.z, 46]),
    ] : [
      [0, 6.6, 24, 0, 5.8, 0, 40],
      ...P.map((v, i) => { const s = i % 2 ? -1 : 1; return [v.x + s * 1.3, 2.8, v.z + 11, v.x + s * 2.9, 2.5, v.z, 38]; }),
    ];
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    spMat.uniforms.uPx.value = renderer.getPixelRatio() * h / 900;
    const m = innerWidth < 760;
    if (m !== mobile) { mobile = m; layout(); }
  }
  resize(); addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '200px 0px' }).observe(pin);
  new IntersectionObserver(e => document.body.classList.toggle('svc-active', e[0].isIntersecting), { threshold: 0 }).observe(pin);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  const cam = new THREE.Vector3(0, 5.6, 34), look = new THREE.Vector3(0, 4, 0), camT = new THREE.Vector3(), lookT = new THREE.Vector3();
  let fov = 40;
  const v = new THREE.Vector3(), clock = new THREE.Clock();
  let last = -1, first = true;

  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = reduce ? 0 : clock.getElapsedTime();
    const r = pin.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));

    // Postęp kamery między ujęciami (z przytrzymaniem na każdym filarze)
    let seg = 0;
    for (let i = 0; i < KEYS.length - 1; i++) {
      const a = KEYS[i] + .045, b = KEYS[i + 1] - .045;
      if (p >= b) seg = i + 1; else if (p > a) { seg = i + ease((p - a) / (b - a)); break; } else { seg = i; break; }
    }
    const i0 = Math.min(KEYS.length - 2, Math.floor(seg)), f = seg - i0;
    const A = CAM[i0], B = CAM[i0 + 1];
    const arc = Math.sin(f * Math.PI); // łuk przelotu: kamera lekko się cofa i unosi między filarami
    const enter = ease(clamp((-r.top + innerHeight) / innerHeight)); // najazd przy wejściu w sekcję
    camT.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f + arc * 1.2, A[2] + (B[2] - A[2]) * f + arc * 2.6 + (1 - enter) * 10);
    lookT.set(A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f, A[5] + (B[5] - A[5]) * f);
    const fovT = A[6] + (B[6] - A[6]) * f + arc * 4;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camT.x += mouse.x * (mobile ? .4 : 1.1); camT.y -= mouse.y * .6;
    if (first) { cam.copy(camT); look.copy(lookT); fov = fovT; first = false; }
    cam.lerp(camT, .09); look.lerp(lookT, .09); fov += (fovT - fov) * .09;
    camera.position.copy(cam); camera.lookAt(look);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // Aktywny filar
    const stage = Math.round(seg);
    const wide = clamp(1 - seg); // 1 = ujęcie ogólne
    pillars.forEach((pl, i) => {
      const target = clamp(1 - Math.abs(seg - (i + 1)) * 1.6);
      pl.a += (target - pl.a) * .1;
      const a = pl.a, show = Math.max(a, wide * .55);
      pl.glassMat.uniforms.uA.value = a; pl.glassMat.uniforms.uTime.value = t + i * 1.3;
      pl.beamMat.uniforms.uA.value = a;
      const hu = pl.holoMat.uniforms; hu.uA.value = a; hu.uTime.value = t + i * 2.1;
      hu.uIn.value = Math.min(1.08, Math.max(hu.uIn.value, clamp(enter * 1.4 - .3 - i * .08) * 1.08));
      pl.holo.position.y = 2.6 + Math.sin(t * 1.1 + i) * .08;
      pl.holo.rotation.y = Math.sin(t * .5 + i) * .22;
      pl.holo.scale.setScalar(.92 + a * .14);
      pl.halo.material.opacity = .14 + a * .32 + Math.sin(t * 2 + i) * .03;
      pl.ringMat.color.copy(pl.col).multiplyScalar(.6 + a * 1.6 + Math.sin(t * 3 + i) * .1);
      pl.light.intensity = 3 + a * 10;
      floorMat.uniforms.uA.value[i] = a; spMat.uniforms.uA.value[i] = a;
      // etykieta nad filarem w ujęciu ogólnym
      v.set(pl.g.position.x, 5.55, pl.g.position.z).project(camera);
      pl.el.style.transform = `translate(${(v.x * .5 + .5) * r.width}px,${(-v.y * .5 + .5) * innerHeight}px)`;
      pl.el.style.opacity = clamp(wide * 1.6 - .3) * (v.z < 1 ? 1 : 0) * clamp(enter * 2 - 1) * (show > 0 ? 1 : 0);
    });
    floorMat.uniforms.uTime.value = t; spMat.uniforms.uTime.value = t;
    ribbon.rotation.z = .2 + t * .015; ribbon.userData.mat.uniforms.uTime.value = t; ribbon.userData.mat.uniforms.uO.value = 1 - wide * .6;
    orbList.forEach(o => { const k = 1 + Math.sin(t * 1.4 + o.ph) * .15; o.s.scale.setScalar(1.6 * k); });

    // Teksty
    const io = clamp(1 - seg * 2.2) * clamp(enter * 1.5 - .2);
    intro.style.opacity = io; intro.style.transform = `translateY(${(1 - io) * -30}px)`;
    intro.style.pointerEvents = io > .5 ? 'auto' : 'none';
    steps.forEach((el, i) => {
      const o = clamp(1 - Math.abs(seg - (i + 1)) * 2.4);
      const dy = (1 - o) * 26;
      el.style.opacity = o;
      el.style.transform = mobile ? `translateY(${dy}px)` : `translateY(calc(-50% + ${dy}px))`;
      el.style.pointerEvents = o > .5 ? 'auto' : 'none';
    });
    if (stage !== last) {
      last = stage; counter.textContent = '0' + stage;
      dots.forEach((d, i) => d.classList.toggle('on', i === stage));
    }
    bar.style.transform = `scaleX(${p})`;

    renderer.render(scene, camera);
  })();
}
