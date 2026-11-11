// Immersyjna sekcja 3D: kamera leci przez 4 sceny w rytmie przewijania.
import * as THREE from 'three';

const section = document.getElementById('immersja');
const canvas = document.getElementById('imm-gl');
const chapters = [...document.querySelectorAll('.imm-chapter')];
const dots = [...document.querySelectorAll('.imm-dots i')];
const counter = document.getElementById('imm-count');
const bar = document.getElementById('imm-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IMAGES = ['/img/scena1.avif', '/img/scena2.avif', '/img/scena3.avif', '/img/scena4.avif'];
const VIDEOS = ['/img/scena1', '/img/scena2', '/img/scena3', '/img/scena4'];
const saveData = !!(navigator.connection && navigator.connection.saveData);
const GAP = 11, VIEW = 4.6, ASPECT = 1408 / 768;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { section.classList.add('no-gl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x05050c, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05050c, 8, 30);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);

  const loader = new THREE.TextureLoader();
  const planes = IMAGES.map((src, i) => {
    const tex = loader.load(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTex: { value: tex }, uLin: { value: 0 }, uAlpha: { value: 0 }, uVel: { value: 0 }, uTime: { value: 0 }, uFocus: { value: 0 }, uBend: { value: 0 } },
      vertexShader: `
        uniform float uBend; uniform float uTime; varying vec2 vUv;
        void main(){ vUv = uv; vec3 p = position;
          p.z += sin(uv.x*3.14159)*uBend + sin(uv.y*6.0 + uTime*1.2)*0.03*abs(uBend*4.0);
          gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `
        uniform sampler2D uTex; uniform float uLin; uniform float uAlpha; uniform float uVel; uniform float uTime; uniform float uFocus; varying vec2 vUv;
        void main(){
          vec2 uv = vUv; vec2 c = uv - .5;
          uv = .5 + c*(1. - uFocus*.04);
          float s = uVel*.018;
          vec3 col = vec3(texture2D(uTex, uv + vec2(s,0.)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(s,0.)).b);
          float sweep = smoothstep(.12,0.,abs(vUv.x - fract(uTime*.12)*1.6 + .3 - vUv.y*.3));
          if (uLin > .5) col = mix(col/12.92, pow((col+.055)/1.055, vec3(2.4)), step(.04045, col));
          col += vec3(.25,.6,.9)*sweep*.18*uFocus;
          col *= .82 + uFocus*.25;
          float edge = smoothstep(0.,.07,vUv.x)*smoothstep(1.,.93,vUv.x)*smoothstep(0.,.1,vUv.y)*smoothstep(1.,.9,vUv.y);
          gl_FragColor = vec4(col, edge*uAlpha); }`
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / ASPECT, 48, 24), mat);
    mesh.position.z = -i * GAP;
    mesh.userData.side = i % 2 ? -1 : 1;
    scene.add(mesh);
    return mesh;
  });

  // Klipy wideo (Higgsfield): ładowane dopiero przy sekcji, gra tylko scena w centrum; obraz zostaje do pierwszej klatki
  const vids = (reduce || saveData) ? [] : planes.map((p, i) => {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    for (const [ext, type] of [['webm', 'video/webm; codecs="vp9"'], ['mp4', 'video/mp4']]) {
      const s = document.createElement('source'); s.src = `${VIDEOS[i]}.${ext}`; s.type = type; v.appendChild(s);
    }
    v.addEventListener('playing', () => {
      if (p.userData.vtex) return;
      const vt = new THREE.VideoTexture(v);
      vt.colorSpace = THREE.NoColorSpace; vt.minFilter = THREE.LinearFilter; vt.generateMipmaps = false;
      p.userData.vtex = vt;
      const m = p.material.uniforms; m.uTex.value = vt; m.uLin.value = 1;
    }, { once: true });
    return v;
  });
  const syncVideos = (on) => vids.forEach((v, i) => {
    const play = on && planes[i].material.uniforms.uFocus.value > .05;
    if (play && v.paused) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); }
    else if (!play && !v.paused) v.pause();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) syncVideos(false); });

  // Ramki świetlne za każdą sceną
  planes.forEach(p => {
    const f = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.04, 1.04 / ASPECT)),
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0 }));
    f.position.z = -0.02; p.add(f); p.userData.frame = f;
  });

  // Tunel cząsteczek
  const N = innerWidth < 760 ? 1200 : 2600;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const pal = [new THREE.Color(0x3b82f6), new THREE.Color(0x22d3ee), new THREE.Color(0x2dd4bf), new THREE.Color(0xf5b25b)];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 3.2 + Math.random() * 6;
    pos.set([Math.cos(a) * r, Math.sin(a) * r * .7, 8 - Math.random() * (GAP * 4 + 10)], i * 3);
    const c = pal[(Math.random() * pal.length) | 0]; col.set([c.r, c.g, c.b], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 32;
  const g = dot.getContext('2d'); const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 32, 32);
  const points = new THREE.Points(pg, new THREE.PointsMaterial({ size: .07, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(points);

  // Linie „obwodów” przelatujące obok kamery
  const lines = new THREE.Group();
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1, z = 6 - Math.random() * (GAP * 4 + 6), y = (Math.random() - .5) * 5;
    const x0 = side * (2.8 + Math.random() * 2), len = 1 + Math.random() * 3;
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0, y, z), new THREE.Vector3(x0 + side * len, y, z), new THREE.Vector3(x0 + side * (len + .6), y + (Math.random() > .5 ? .6 : -.6), z)]);
    lines.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: Math.random() > .7 ? 0xf5b25b : 0x3b82f6, transparent: true, opacity: .35 })));
  }
  scene.add(lines);

  let w = 1, h = 1;
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const vh = 2 * VIEW * Math.tan(THREE.MathUtils.degToRad(25)), vw = vh * camera.aspect;
    const pw = w < 760 ? vw * 1.45 : Math.min(vw * .82, vh * .8 * ASPECT);
    planes.forEach(p => p.scale.setScalar(pw));
  }
  resize(); addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  let visible = false, smooth = 0, lastSmooth = 0, vel = 0;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; document.body.classList.toggle('imm-active', visible); }, { threshold: 0 }).observe(section);

  const ease = t => t * t * (3 - 2 * t);
  function progress() {
    const r = section.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  }

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) { if (vids.length && !vids.every(v => v.paused)) syncVideos(false); return; }
    const t = reduce ? 0 : clock.elapsedTime;
    const target = progress() * (planes.length - 1);
    smooth += (target - smooth) * (reduce ? 1 : .085);
    const dt = Math.min(.1, Math.max(.001, clock.getDelta()));
    vel += (THREE.MathUtils.clamp((smooth - lastSmooth) / dt, -3, 3) - vel) * Math.min(1, dt * 8); lastSmooth = smooth;
    if (Math.abs(target - smooth) < .002) { smooth = target; }

    // Zatrzymanie przy każdej scenie: ruch skupia się między scenami
    const seg = Math.min(Math.floor(smooth), planes.length - 2), f = smooth - seg;
    const k = seg + ease(Math.min(1, Math.max(0, (f - .22) / .56)));
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;

    camera.position.set(mouse.x * .5, -mouse.y * .35 + Math.sin(t * .5) * .05, VIEW - k * GAP);
    camera.lookAt(mouse.x * .2, 0, camera.position.z - VIEW);
    camera.rotation.z = -vel * .02;

    planes.forEach((p, i) => {
      const d = p.position.z - (camera.position.z - VIEW); // 0 gdy scena w centrum
      const ad = Math.abs(d), m = p.material.uniforms;
      const focus = Math.max(0, 1 - ad / 3);
      m.uAlpha.value = d > 1.2 ? 0 : (d > 0 ? 1 - d / 1.2 : 1) * Math.min(1, Math.max(0, 1 - (-d - 2) / (GAP * 1.4)));
      m.uFocus.value = focus; m.uVel.value = THREE.MathUtils.clamp(vel, -1.5, 1.5); m.uTime.value = t;
      m.uBend.value = THREE.MathUtils.clamp(-vel * .25, -.6, .6) * (1 - focus * .5);
      p.rotation.y = p.userData.side * .32 * Math.min(1, ad / GAP) + mouse.x * .12 * focus;
      p.rotation.x = -mouse.y * .08 * focus;
      p.position.x = p.userData.side * .9 * Math.min(1, ad / GAP);
      p.userData.frame.material.opacity = focus * .35 * (m.uAlpha.value);
    });
    syncVideos(!document.hidden);
    points.rotation.z = t * .02;
    lines.position.x = Math.sin(t * .3) * .1;

    chapters.forEach((c, i) => {
      const o = Math.max(0, 1 - Math.abs(k - i) * 2.6);
      c.style.opacity = o.toFixed(3);
      c.style.transform = `translate3d(0,${((k - i) * -60).toFixed(1)}px,0)`;
      c.style.pointerEvents = o > .5 ? 'auto' : 'none';
    });
    const active = Math.round(k);
    dots.forEach((d, i) => d.classList.toggle('on', i === active));
    counter.textContent = String(active + 1).padStart(2, '0');
    bar.style.transform = `scaleX(${(smooth / (planes.length - 1)).toFixed(3)})`;
    renderer.render(scene, camera);
  })();
}
