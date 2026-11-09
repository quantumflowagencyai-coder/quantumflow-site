// Sekcja „Pakiety”: scena 1:1 z grafiki (tło kosmosu, szklane karty, ilustracje) ożywiona na canvasie i w CSS.
// Grafiki: img/pak-bg.avif (tło HD 2958×1408, układ współrzędnych 1479×704), img/pak-cards.avif (3 karty 315×378), img/pak-sprites.avif (satelita, miasto, dron).
(() => {
  const sec = document.getElementById('pakiety');
  if (!sec || sec.dataset.pk) return;
  sec.dataset.pk = '1';
  const IW = 1479, IH = 704, CW = 315, CH = 378;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CARDS = [{ k: 'start', x: 262, y: 251, gap: 5.7 }, { k: 'prem', x: 590, y: 251, gap: 3.5 }, { k: 'sig', x: 919, y: 251, gap: 5.55 }];
  const pc = (v, t) => (v / t * 100).toFixed(4) + '%';
  const chamfer = 'polygon(2.54% 0,97.46% 0,100% 2.12%,100% 97.88%,97.46% 100%,2.54% 100%,0 97.88%,0 2.12%)';

  const css = `
#pakiety.pk{padding:0;position:relative;background:#03040a;overflow:hidden;scroll-margin-top:76px}
#pakiety .pk-stage{position:relative;width:100%;aspect-ratio:${IW}/${IH};container-type:inline-size}
#pakiety .pk-bg{position:absolute;inset:0;width:100%;height:100%;display:block}
#pakiety .pk-head{position:absolute;left:${pc(263, IW)};top:0;width:40%;z-index:3;pointer-events:none}
#pakiety .pk-head .kicker{position:absolute;top:2.33cqw;left:0;margin:0;font-size:.74cqw;letter-spacing:.2em;color:#5eead4;white-space:nowrap}
#pakiety .pk-head h2{position:absolute;top:4.24cqw;left:-.12cqw;width:36cqw;margin:0;font-size:3.38cqw;line-height:1;color:#fff;letter-spacing:-.052em}
#pakiety .pk-head p{position:absolute;top:11.38cqw;left:0;margin:0;font-size:1.05cqw;color:#e8ebf7;white-space:nowrap}
#pakiety .pk-head .w{display:inline-block;opacity:0;transform:translateY(.6em);filter:blur(6px);transition:opacity .9s,transform .9s cubic-bezier(.2,.8,.2,1),filter .9s}
#pakiety.pk-in .pk-head .w{opacity:1;transform:none;filter:none}
#pakiety .pk-card{position:absolute;width:${pc(CW, IW)};aspect-ratio:${CW}/${CH};container-type:inline-size;perspective:1100px;z-index:2;cursor:pointer;opacity:0;transform:translateY(8%) scale(.94);transition:opacity 1.1s,transform 1.1s cubic-bezier(.2,.8,.2,1),filter .5s}
#pakiety.pk-in .pk-card{opacity:1;transform:none}
#pakiety .pk-card.dim{filter:brightness(.72) saturate(.85)}
#pakiety .pk-tilt{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.2,.8,.2,1)}
#pakiety .pk-card.hot .pk-tilt{transition:transform .12s linear}
#pakiety .pk-face{position:absolute;inset:0;background:url(/img/pak-cards.avif) 0 0/300% 100% no-repeat;clip-path:${chamfer}}
#pakiety .pk-glow{position:absolute;inset:-1px;clip-path:${chamfer};pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(120% 70% at 50% 110%,rgba(34,211,238,.22),transparent 60%)}
#pakiety .pk-card.hot .pk-glow,#pakiety .pk-card[data-k=prem] .pk-glow{opacity:1}
#pakiety .pk-card[data-k=prem] .pk-glow{animation:pkBreath 3.2s ease-in-out infinite}
#pakiety .pk-shadow{position:absolute;inset:4% 6% -4%;border-radius:8%;box-shadow:0 30px 70px -20px rgba(0,0,0,.8),0 0 60px -10px rgba(34,211,238,0);transition:box-shadow .5s;transform:translateZ(-1px)}
#pakiety .pk-card.hot .pk-shadow{box-shadow:0 40px 90px -20px rgba(0,0,0,.9),0 0 80px -6px rgba(34,211,238,.45)}
#pakiety .pk-card[data-k=prem] .pk-shadow{box-shadow:0 30px 80px -20px rgba(0,0,0,.85),0 0 70px -10px rgba(59,130,246,.55)}
#pakiety .pk-glare{position:absolute;inset:0;clip-path:${chamfer};pointer-events:none;mix-blend-mode:screen;opacity:0;transition:opacity .35s;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.2),rgba(150,220,255,.06) 28%,transparent 52%)}
#pakiety .pk-card.hot .pk-glare{opacity:1}
#pakiety .pk-run{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;filter:drop-shadow(0 0 .9cqw rgba(34,211,238,.9))}
#pakiety .pk-run path{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:110 1262;animation:pkRun 6s linear infinite;opacity:.55;transition:opacity .4s}
#pakiety .pk-run path+path{animation-delay:-3s}
#pakiety .pk-card.hot .pk-run path,#pakiety .pk-card[data-k=prem] .pk-run path{opacity:1}
#pakiety .pk-card.hot .pk-run path{animation-duration:2.6s}
#pakiety .pk-fx{position:absolute;left:-15%;top:-15%;width:130%;height:130%;pointer-events:none}
#pakiety .pk-sp{position:absolute;background:url(/img/pak-sprites.avif) no-repeat;pointer-events:none;will-change:transform}
#pakiety .pk-sat{left:55.24%;top:20.9%;width:42.54%;height:50.26%;background-size:297% 165.26%;background-position:0 0;animation:pkSat 7s ease-in-out infinite}
#pakiety .pk-city{left:49.84%;top:-.26%;width:56.51%;height:83.07%;background-size:223.6% 100%;background-position:62.73% 0;animation:pkCity 8s ease-in-out infinite}
#pakiety .pk-drone{left:61.9%;top:1.85%;width:24.76%;height:10.05%;background-size:510.3% 826.3%;background-position:100% 0;animation:pkDrone 3.4s ease-in-out infinite}
#pakiety .pk-sp::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 48%,transparent 60%) no-repeat;background-size:260% 100%;animation:pkShine 5s ease-in-out infinite;-webkit-mask:inherit;mask:inherit;-webkit-mask-image:url(/img/pak-sprites.avif);mask-image:url(/img/pak-sprites.avif);-webkit-mask-size:inherit;mask-size:inherit;-webkit-mask-position:inherit;mask-position:inherit;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;mix-blend-mode:screen}
#pakiety .pk-sat{-webkit-mask-size:297% 165.26%;mask-size:297% 165.26%;-webkit-mask-position:0 0;mask-position:0 0}
#pakiety .pk-city{-webkit-mask-size:223.6% 100%;mask-size:223.6% 100%;-webkit-mask-position:62.73% 0;mask-position:62.73% 0}
#pakiety .pk-drone{-webkit-mask-size:510.3% 826.3%;mask-size:510.3% 826.3%;-webkit-mask-position:100% 0;mask-position:100% 0}
#pakiety .pk-sat::after{-webkit-mask-size:297% 165.26%;mask-size:297% 165.26%;-webkit-mask-position:0 0;mask-position:0 0}
#pakiety .pk-city::after{-webkit-mask-size:223.6% 100%;mask-size:223.6% 100%;-webkit-mask-position:62.73% 0;mask-position:62.73% 0;animation-delay:-2s}
#pakiety .pk-drone::after{-webkit-mask-size:510.3% 826.3%;mask-size:510.3% 826.3%;-webkit-mask-position:100% 0;mask-position:100% 0;animation-delay:-1s}
#pakiety .pk-beam{position:absolute;left:30%;top:88%;width:40%;height:120%;background:linear-gradient(rgba(140,240,255,.35),transparent);clip-path:polygon(35% 0,65% 0,100% 100%,0 100%);opacity:.0;animation:pkBeam 3.4s ease-in-out infinite;pointer-events:none}
#pakiety .pk-t{position:absolute;left:9.2cqw;margin:0;color:#fff;pointer-events:none}
#pakiety .pk-t3{top:12.45cqw;font-size:6.55cqw;line-height:1.15;font-weight:700;letter-spacing:-.035em}
#pakiety .pk-tp{top:23.05cqw;width:86.5cqw;font-size:4.32cqw;line-height:6.05cqw;letter-spacing:-.028em;color:#dfe3f0}
#pakiety .pk-card[data-k=sig] .pk-tp{width:74cqw}
#pakiety .pk-tu{top:42.3cqw;list-style:none;padding:0;display:flex;flex-direction:column;font-size:4.32cqw;line-height:6.05cqw;letter-spacing:-.028em;color:#f1f3fa}
#pakiety .pk-tu li{display:flex;align-items:center;gap:1.75cqw;opacity:0;transform:translateX(-3cqw);transition:opacity .6s,transform .6s cubic-bezier(.2,.8,.2,1)}
#pakiety .pk-tu li::before{content:"✓";display:inline-block;width:3.6cqw;font-size:1.12em;color:#5eead4;font-weight:400;font-family:system-ui,sans-serif;transform:scale(0);transition:transform .5s cubic-bezier(.3,1.8,.5,1);text-shadow:0 0 1.6cqw rgba(94,234,212,.8)}
#pakiety.pk-in .pk-tu li{opacity:1;transform:none}
#pakiety.pk-in .pk-tu li::before{transform:scale(1)}
#pakiety .pk-card.hot .pk-tu li::before{animation:pkCheck 1.2s ease-in-out infinite}
#pakiety .pk-btn{position:absolute;left:8.9cqw;top:95.2cqw;width:81.9cqw;height:13.65cqw;padding:0;border:0;border-radius:999px;display:flex;align-items:center;justify-content:center;gap:0;font-size:4.05cqw;font-weight:600;letter-spacing:-.03em;color:#fff;background:transparent;box-shadow:none;overflow:hidden;isolation:isolate;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .35s,backdrop-filter .35s;letter-spacing:0;-webkit-tap-highlight-color:transparent}
#pakiety .pk-btn:hover,#pakiety .pk-card.hot .pk-btn{backdrop-filter:brightness(1.3) saturate(1.2);-webkit-backdrop-filter:brightness(1.3) saturate(1.2);box-shadow:0 0 0 1px rgba(150,230,255,.55),0 0 4cqw rgba(34,211,238,.55),0 2cqw 6cqw -1cqw rgba(34,211,238,.5)}
#pakiety .pk-card[data-k=prem] .pk-btn{color:#0a1626;animation:pkPulse 2.4s ease-in-out infinite}
#pakiety .pk-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%) no-repeat;background-size:250% 100%;background-position:200% 0;animation:pkSweep 3.6s ease-in-out infinite}
#pakiety .pk-btn i{font-style:normal;display:inline-block;width:0;opacity:0;transform:translateX(-2cqw);transition:width .3s,opacity .3s,transform .3s}
#pakiety .pk-btn:hover i,#pakiety .pk-card.hot .pk-btn i{width:5.5cqw;margin-left:1.5cqw;opacity:1;transform:none}
#pakiety .pk-rip{position:absolute;border-radius:50%;background:rgba(255,255,255,.5);transform:scale(0);animation:pkRip .7s ease-out forwards;pointer-events:none}
#pakiety .pk-badge{position:absolute;left:54.6cqw;top:5.08cqw;width:41.6cqw;height:8.9cqw;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:3.42cqw;font-weight:600;color:#0a1a2c;background:linear-gradient(90deg,#3b82f6,#22d3ee 55%,#2dd4bf);box-shadow:inset 0 0 0 .3cqw rgba(255,255,255,.35),0 0 3cqw rgba(34,211,238,.6);overflow:hidden;white-space:nowrap;pointer-events:none;animation:pkBadge 2.4s ease-in-out infinite}
#pakiety .pk-badge::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.7) 50%,transparent 65%) no-repeat;background-size:250% 100%;animation:pkSweep 3s ease-in-out infinite}
@keyframes pkRun{to{stroke-dashoffset:-1372}}
@keyframes pkBreath{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes pkSat{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(-1.2%,-3.2%) rotate(-2.4deg)}}
@keyframes pkCity{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6%)}}
@keyframes pkDrone{0%,100%{transform:translate(0,0) rotate(0)}30%{transform:translate(2%,-24%) rotate(2deg)}65%{transform:translate(-3%,-14%) rotate(-2.5deg)}}
@keyframes pkBeam{0%,100%{opacity:0}30%,65%{opacity:.8}}
@keyframes pkShine{0%,55%{background-position:120% 0}100%{background-position:-60% 0}}
@keyframes pkSweep{0%,45%{background-position:200% 0}100%{background-position:-100% 0}}
@keyframes pkPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,.0),0 0 3cqw rgba(34,211,238,.35)}50%{box-shadow:0 0 0 1.2cqw rgba(34,211,238,0),0 0 6cqw rgba(34,211,238,.75)}}
@keyframes pkBadge{0%,100%{box-shadow:inset 0 0 0 .3cqw rgba(255,255,255,.35),0 0 2cqw rgba(34,211,238,.45)}50%{box-shadow:inset 0 0 0 .3cqw rgba(255,255,255,.5),0 0 5cqw rgba(34,211,238,.9)}}
@keyframes pkCheck{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
@keyframes pkRip{to{transform:scale(1);opacity:0}}
@media (max-width:899px){
 #pakiety .pk-stage{aspect-ratio:auto;padding:84px 16px 70px}
 #pakiety .pk-head{position:relative;left:auto;width:auto;max-width:520px;margin:0 auto 34px;pointer-events:auto}
 #pakiety .pk-head .kicker,#pakiety .pk-head h2,#pakiety .pk-head p{position:static;width:auto;white-space:normal}
 #pakiety .pk-head .kicker{font-size:.74rem;margin-bottom:14px}
 #pakiety .pk-head h2{font-size:clamp(1.9rem,8.4vw,2.6rem);margin-bottom:14px}
 #pakiety .pk-head p{font-size:1rem}
 #pakiety .pk-card{position:relative;left:auto!important;top:auto!important;width:min(100%,380px);margin:0 auto 30px}
}
@media (prefers-reduced-motion:reduce){#pakiety *{animation:none!important}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- DOM ----------
  const head = sec.querySelector('.sec-head');
  const old = [...sec.querySelectorAll('.pkg')];
  const wrap = sec.querySelector('.wrap');
  const stage = document.createElement('div'); stage.className = 'pk-stage';
  const cv = document.createElement('canvas'); cv.className = 'pk-bg'; cv.setAttribute('aria-hidden', 'true');
  stage.appendChild(cv);
  const hd = document.createElement('div'); hd.className = 'pk-head';
  if (head) {
    head.classList.remove('reveal', 'in');
    [...head.children].forEach(n => hd.appendChild(n));
    const h2 = hd.querySelector('h2');
    if (h2) { let k = 0; h2.innerHTML = h2.textContent.trim().split(/\s+/).map(w => `<span class="w" style="transition-delay:${(k++ * .07).toFixed(2)}s">${w}</span>`).join(' '); }
  }
  stage.appendChild(hd);
  const runSVG = `<svg class="pk-run" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="pkg%" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#5eead4"/></linearGradient></defs><path stroke="url(#pkg%)" d="M10 2.5H305L312.5 10V368L305 375.5H10L2.5 368V10Z"/><path stroke="url(#pkg%)" d="M10 2.5H305L312.5 10V368L305 375.5H10L2.5 368V10Z"/></svg>`;
  const cards = CARDS.map((c, i) => {
    const o = old[i];
    const el = document.createElement('div'); el.className = 'pk-card'; el.dataset.k = c.k;
    el.style.left = pc(c.x, IW); el.style.top = pc(c.y, IH);
    el.style.transitionDelay = (.25 + i * .16) + 's';
    const tilt = document.createElement('div'); tilt.className = 'pk-tilt';
    tilt.innerHTML = `<div class="pk-shadow"></div><div class="pk-face" style="background-position:${i * 50}% 0"></div><div class="pk-glow"></div>`;
    if (c.k === 'start') tilt.insertAdjacentHTML('beforeend', '<div class="pk-sp pk-sat"></div>');
    if (c.k === 'sig') tilt.insertAdjacentHTML('beforeend', '<div class="pk-sp pk-city"></div><div class="pk-sp pk-drone"><div class="pk-beam"></div></div>');
    const fx = document.createElement('canvas'); fx.className = 'pk-fx'; tilt.appendChild(fx);
    tilt.insertAdjacentHTML('beforeend', runSVG.replace(/%/g, i) + '<div class="pk-glare"></div>');
    const h3 = o && o.querySelector('h3'), p = o && o.querySelector('.for'), ul = o && o.querySelector('ul'), a = o && o.querySelector('a');
    if (h3) { h3.className = 'pk-t pk-t3'; tilt.appendChild(h3); }
    if (p) { p.className = 'pk-t pk-tp'; tilt.appendChild(p); }
    if (ul) {
      ul.className = 'pk-t pk-tu'; ul.style.gap = c.gap + 'cqw';
      [...ul.children].forEach((li, j) => { li.style.transitionDelay = (.7 + i * .16 + j * .12) + 's'; });
      tilt.appendChild(ul);
    }
    if (a) { a.className = 'pk-btn'; a.insertAdjacentHTML('beforeend', '<i>→</i>'); tilt.appendChild(a); }
    if (c.k === 'prem') tilt.insertAdjacentHTML('beforeend', '<span class="pk-badge">Najczęściej wybierany</span>');
    el.appendChild(tilt); stage.appendChild(el);
    return { ...c, el, tilt, fx, a, hot: 0 };
  });
  if (wrap) wrap.remove();
  sec.appendChild(stage); sec.classList.add('pk');

  // ---------- obrazy ----------
  const bgImg = new Image(); bgImg.src = '/img/pak-bg.avif';
  const STARS = []; {
    const s = '468,222,1,1394,295,1,359,246,.9,21,402,.88,833,67,.85,199,594,.8,456,213,.76,656,680,.75,1400,349,.74,492,237,.69,1390,336,.68,357,680,.62,582,594,.61,886,45,.6,917,88,.6,447,246,.59,871,5,.58,1476,311,.56,1365,212,.55,793,43,.54,596,654,.53,51,326,.52,386,214,.51,310,636,.5,811,19,.49,56,62,.49,1345,202,.49,1253,306,.48,249,21,.46,140,497,.46,24,606,.46,571,659,.46,1172,224,.45,43,346,.45,852,67,.45,251,200,.45,1400,320,.45,549,22,.44,1354,443,.44,139,96,.43,1256,248,.43,806,93,.41,1253,215,.41,1309,231,.41,146,547,.41,560,4,.4,208,497,.4,1286,590,.39,886,99,.38,818,91,.37,1445,288,.37,1426,636,.37,28,64,.36,1359,227,.36,1259,327,.36,1381,443,.36,17,498,.36,1132,236,.35,1327,588,.35,10,175,.34,1375,224,.34,1432,360,.34,126,532,.34,164,539,.34,1429,253,.31,142,659,.31,1452,231,.3,111,250,.3,1352,522,.3,141,145,.29,1330,202,.29,1303,225,.29,1321,199,.28,1342,268,.28,49,337,.28,82,357,.28,1404,457,.28,1364,654,.28,82,696,.28'.split(',').map(Number);
    for (let k = 0; k < s.length; k += 3) STARS.push([s[k], s[k + 1], s[k + 2], Math.random() * 6.28, .6 + Math.random() * 1.6]);
  }
  // pył gwiezdny dryfujący w kilku warstwach (głębia)
  const DUST = Array.from({ length: 150 }, () => [Math.random() * IW, Math.random() * IH, Math.random(), Math.random() * 6.28]);
  // strumienie światła (współrzędne grafiki)
  const cub = (p0, p1, p2, p3) => t => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
  const STREAMS = [];
  [[390, '255,170,200'], [396, '255,190,140'], [402, '255,215,120'], [409, '230,160,255'], [418, '200,140,255'], [429, '170,140,255']].forEach(([y, c], k) => STREAMS.push({ f: cub([182, 346], [186, 372 + k * 3], [206, y], [262, y]), c, sp: .32 + k * .03, ph: k * .23 }));
  [[392, '255,200,110'], [420, '130,230,160'], [436, '70,215,200'], [446, '60,225,170'], [454, '90,170,255'], [464, '60,200,232'], [476, '50,190,154']].forEach(([y, c], k) => STREAMS.push({ f: cub([1236, y], [1282, y + 12], [1330, y + 18], [1336, 399]), c, sp: .3 + k * .025, ph: k * .19 }));
  [[740, 670, 1020, '255,180,90'], [795, 662, 1050, '80,220,200'], [810, 658, 1040, '90,240,170'], [830, 652, 995, '200,150,255'], [850, 648, 1060, '120,230,220']].forEach(([a, yb, b, c], k) => { const cy = 2 * yb - 627, m = (a + b) / 2; STREAMS.push({ f: cub([a, 627], [a + (m - a) * .55, cy], [b - (b - m) * .55, cy], [b, 627]), c, sp: .22 + k * .02, ph: k * .31 }); });

  // galaktyka: wycinek z miękką maską, lekko „wiruje” w swojej płaszczyźnie
  const GX = 737, GY = 225, GA = 250, GB = 90, GR = -.1;
  let gal = null, sat = null;
  const prep = () => {
    const K = bgImg.naturalWidth / IW; // grafika HD: współrzędne w układzie 1479×704 mnożone przez K
    gal = document.createElement('canvas'); gal.width = Math.round((GA * 2 + 20) * K); gal.height = gal.width;
    const g = gal.getContext('2d'); g.drawImage(bgImg, (GX - GA - 10) * K, (GY - GA - 10) * K, gal.width, gal.height, 0, 0, gal.width, gal.height);
    g.scale(K, K); g.globalCompositeOperation = 'destination-in';
    g.save(); g.translate(GA + 10, GA + 10); g.rotate(GR); g.scale(1, GB / GA);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, GA); rg.addColorStop(0, '#000'); rg.addColorStop(.5, '#000'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, GA, 0, 6.29); g.fill(); g.restore();
    sat = document.createElement('canvas'); sat.width = 540; sat.height = 196;
    const sg = sat.getContext('2d'); sg.drawImage(bgImg, 940 * K, 0, 540 * K, 196 * K, 0, 0, 540, 196);
    try {
      const id = sg.getImageData(0, 0, 540, 196), d = id.data;
      for (let y = 0; y < 196; y++) for (let x = 0; x < 540; x++) {
        const i = (y * 540 + x) * 4, l = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const e = Math.min(1, x / 60, (540 - x) / 30, (196 - y) / 30);
        d[i + 3] = Math.round(255 * Math.max(0, Math.min(1, (l - 55) / 90)) * Math.max(0, e));
      }
      sg.putImageData(id, 0, 0);
    } catch (e) { sat = null; }
  };
  const tmp = document.createElement('canvas'); tmp.width = 540; tmp.height = 196;

  // ---------- render tła ----------
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, mob = false, sc = 1, ox = 0, oy = 0;
  const ptr = { x: .5, y: .5, tx: .5, ty: .5, in: false, px: -999, py: -999 };
  const size = () => {
    const r = stage.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.6);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    mob = innerWidth < 900;
    if (!mob) { sc = W / IW; ox = 0; oy = 0; }
    else { sc = Math.max(W / (IW * .62), 1e-3); ox = W / 2 - 737 * sc; oy = 0; }
    cards.forEach(c => { c.fx.width = Math.round(c.el.offsetWidth * 1.3 * dpr); c.fx.height = Math.round(c.el.offsetHeight * 1.3 * dpr); });
  };
  const dot = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  let shoot = null, nextShoot = 2;
  const drawBg = t => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#03040a'; g.fillRect(0, 0, cv.width, cv.height);
    const par = mob ? 0 : 1;
    const bx = (ptr.x - .5) * -14 * par, by = (ptr.y - .5) * -8 * par;
    const z = 1.012 + .01 * Math.sin(t * .11);
    g.setTransform(dpr * sc * z, 0, 0, dpr * sc * z, dpr * (ox + bx - (z - 1) * IW * sc / 2), dpr * (oy + by - (z - 1) * IH * sc / 2));
    if (bgImg.complete && bgImg.naturalWidth) {
      g.drawImage(bgImg, 0, 0, IW, IH);
      if (!gal) prep();
      // wir galaktyki
      const ph = .045 * Math.sin(t * .16) + .02 * Math.sin(t * .057);
      g.save(); g.translate(GX, GY); g.rotate(GR); g.scale(1, GB / GA); g.rotate(ph); g.scale(1, GA / GB); g.rotate(-GR);
      g.drawImage(gal, -GA - 10, -GA - 10, GA * 2 + 20, GA * 2 + 20); g.restore();
      // oddech jądra galaktyk
      g.globalCompositeOperation = 'lighter';
      dot(GX, GY, 120, `rgba(255,200,160,${(.10 + .07 * Math.sin(t * .7)).toFixed(3)})`);
      dot(GX - 20, GY + 2, 40, `rgba(255,240,220,${(.16 + .1 * Math.sin(t * 1.3)).toFixed(3)})`);
      dot(1336, 324, 60, `rgba(150,180,255,${(.08 + .06 * Math.sin(t * .9 + 1)).toFixed(3)})`);
      // Saturn: światło przesuwające się po pierścieniu i tarczy
      if (sat) {
      const tc = tmp.getContext('2d'); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, 540, 196); tc.drawImage(sat, 0, 0);
      tc.globalCompositeOperation = 'destination-in';
      const sx = ((t * 55) % 900) - 180, lg = tc.createLinearGradient(sx - 90, 0, sx + 90, 60);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.5, 'rgba(0,0,0,.55)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = lg; tc.fillRect(0, 0, 540, 196);
      g.drawImage(tmp, 940, 0);
      }
    }
    g.globalCompositeOperation = 'lighter';
    // migoczące gwiazdy z grafiki
    STARS.forEach(([x, y, b, p, s]) => {
      const a = Math.max(0, Math.sin(t * s + p)); const v = b * a;
      if (v < .05) return;
      dot(x, y, 2.5 + 4 * v, `rgba(220,235,255,${(.75 * v).toFixed(3)})`);
      if (b > .55 && v > .5) { g.fillStyle = `rgba(255,255,255,${((v - .5) * 1.2).toFixed(3)})`; const r = 4 + 8 * v; g.fillRect(x - r, y - .35, r * 2, .7); g.fillRect(x - .35, y - r, .7, r * 2); }
    });
    // pył w trzech głębiach
    DUST.forEach(d => {
      const depth = .3 + d[2] * .9; let x = (d[0] - t * 4 * depth - bx * depth * 1.5) % IW; if (x < 0) x += IW;
      const y = d[1] + Math.sin(t * .2 + d[3]) * 3 - by * depth;
      const a = (.25 + .35 * Math.sin(t * (1 + d[2]) + d[3])) * depth; if (a <= .02) return;
      g.fillStyle = `rgba(190,215,255,${a.toFixed(3)})`; g.fillRect(x, y, .8 + d[2] * .9, .8 + d[2] * .9);
    });
    // spadające gwiazdy
    if (t > nextShoot && !shoot) { shoot = { x: 100 + Math.random() * 1200, y: 10 + Math.random() * 200, a: .25 + Math.random() * .25, t0: t, L: 120 + Math.random() * 120 }; nextShoot = t + 4 + Math.random() * 6; }
    if (shoot) {
      const u = (t - shoot.t0) / 1.1; if (u > 1) shoot = null; else {
        const hx = shoot.x + Math.cos(shoot.a) * 420 * u, hy = shoot.y + Math.sin(shoot.a) * 420 * u;
        const lg = g.createLinearGradient(hx, hy, hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L);
        const al = Math.sin(u * Math.PI); lg.addColorStop(0, `rgba(255,255,255,${al.toFixed(3)})`); lg.addColorStop(1, 'rgba(120,200,255,0)');
        g.strokeStyle = lg; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - Math.cos(shoot.a) * shoot.L, hy - Math.sin(shoot.a) * shoot.L); g.stroke();
        dot(hx, hy, 6, `rgba(220,240,255,${(.8 * al).toFixed(3)})`);
      }
    }
    // statki: silniki, światła pozycyjne
    const e1 = .55 + .3 * Math.sin(t * 7) + .15 * Math.sin(t * 17);
    dot(182, 345, 14, `rgba(255,190,150,${(.35 * e1).toFixed(3)})`); dot(182, 345, 5, `rgba(255,240,220,${(.6 * e1).toFixed(3)})`);
    if (Math.sin(t * 3.1) > .7) dot(203, 262, 5, 'rgba(255,90,90,.9)');
    if (Math.sin(t * 3.1 + 2) > .75) dot(150, 300, 4, 'rgba(120,255,200,.9)');
    const e2 = .6 + .4 * Math.sin(t * 2.2);
    dot(1338, 398, 18, `rgba(120,240,230,${(.3 * e2).toFixed(3)})`); dot(1338, 397, 6, `rgba(220,255,250,${(.6 * e2).toFixed(3)})`);
    if (Math.sin(t * 4 + 1) > .8) dot(1320, 385, 4, 'rgba(255,220,120,.9)');
    if (Math.sin(t * 4 + 3) > .8) dot(1356, 385, 4, 'rgba(255,220,120,.9)');
    // impulsy po strumieniach
    STREAMS.forEach(s => {
      for (let n = 0; n < 2; n++) {
        const u = (t * s.sp + s.ph + n * .5) % 1;
        for (let k = 0; k < 9; k++) { const v = u - k * .012; if (v < 0) break; const [x, y] = s.f(v); dot(x, y, 4.2 - k * .38, `rgba(${s.c},${(.85 - k * .09).toFixed(3)})`); }
      }
    });
    // światło za kursorem
    if (ptr.in && !mob) { const ix = (ptr.px - ox) / sc, iy = (ptr.py - oy) / sc; dot(ix, iy, 160, 'rgba(60,140,255,.07)'); dot(ix, iy, 50, 'rgba(120,220,255,.06)'); }
    g.globalCompositeOperation = 'source-over';
    if (mob) { // pod obrazem płynne przejście w ciemny kosmos
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bot = IH * sc; const fg = g.createLinearGradient(0, bot * .6, 0, bot); fg.addColorStop(0, 'rgba(3,4,10,0)'); fg.addColorStop(1, '#03040a');
      g.fillStyle = fg; g.fillRect(0, bot * .6, W, bot * .4 + 2);
      g.globalCompositeOperation = 'lighter';
      DUST.forEach((d, i) => { const x = (d[0] / IW) * W, y = bot + (d[1] / IH) * (H - bot) + ((i * 37) % 200); if (y > H) return; const a = .2 + .3 * Math.sin(t * (1 + d[2]) + d[3]); if (a > 0) { g.fillStyle = `rgba(200,220,255,${a.toFixed(3)})`; g.fillRect(x, y, 1.1, 1.1); } });
      g.globalCompositeOperation = 'source-over';
    }
  };

  // ---------- efekty na kartach ----------
  const drawFx = (c, t) => {
    const k = c.fx.getContext('2d'); const s = c.fx.width / (CW * 1.3);
    k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, c.fx.width, c.fx.height);
    k.setTransform(s, 0, 0, s, CW * .15 * s, CH * .15 * s); k.globalCompositeOperation = 'lighter';
    const d = (x, y, r, col) => { const gr = k.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); k.fillStyle = gr; k.fillRect(x - r, y - r, r * 2, r * 2); };
    const hot = c.hot ? 1.6 : 1;
    if (c.k === 'start') {
      // dane płyną z węzłów 3D/2D do karty Premium
      [[102.5, '200,220,255'], [115, '94,234,212']].forEach(([y, col], i) => {
        for (let n = 0; n < 2; n++) { const u = (t * .45 * hot + i * .3 + n * .5) % 1; const x = 257 + u * 80; const yy = y + (i ? u * 3 : 0); d(x, yy, 4, `rgba(${col},${(.9 * Math.sin(u * Math.PI)).toFixed(3)})`); }
        d(255.5, y, 6 + 2 * Math.sin(t * 3 + i), `rgba(${col},.45)`);
      });
      // iskry wokół satelity
      for (let n = 0; n < 6; n++) { const a = t * .8 + n * 1.05, r = 52 + 6 * Math.sin(t + n); const x = 240 + Math.cos(a) * r, y = 165 + Math.sin(a) * r * .45; d(x, y, 2.6, `rgba(160,230,255,${(.35 + .35 * Math.sin(t * 3 + n)).toFixed(3)})`); }
    }
    if (c.k === 'prem') {
      // budynek: ekrany, hologram, okna, skan
      const fl = (p, f = 5) => .55 + .45 * Math.sin(t * f + p) * Math.sin(t * f * 1.7 + p * 2);
      d(253, 128, 18, `rgba(80,255,170,${(.32 * fl(0)).toFixed(3)})`);
      d(241, 197, 24, `rgba(60,255,160,${(.35 * fl(1, 3)).toFixed(3)})`);
      d(230, 122, 12, `rgba(140,220,255,${(.4 * fl(2)).toFixed(3)})`);
      d(285, 214, 14, `rgba(120,170,255,${(.35 * fl(3, 4)).toFixed(3)})`);
      d(228, 236, 14, `rgba(90,140,255,${(.3 * fl(4, 2)).toFixed(3)})`);
      d(198, 222, 10, `rgba(255,170,120,${(.3 * fl(5, 6)).toFixed(3)})`);
      [[170, 117], [175, 135], [178, 154], [240, 268], [288, 100]].forEach(([x, y], i) => { if (Math.sin(t * 2.2 + i * 1.7) > .3) d(x, y, 9, 'rgba(120,230,255,.35)'); });
      const sy = 60 + ((t * 38 * hot) % 230); const sg = k.createLinearGradient(0, sy - 10, 0, sy + 10);
      sg.addColorStop(0, 'rgba(34,211,238,0)'); sg.addColorStop(.5, 'rgba(120,240,255,.16)'); sg.addColorStop(1, 'rgba(34,211,238,0)');
      k.fillStyle = sg; k.fillRect(155, sy - 10, 160, 20);
      for (let n = 0; n < 3; n++) { const u = (t * .5 + n / 3) % 1; d(195 + u * 40, 118 + n * 18 - u * 6, 3, `rgba(140,240,255,${(Math.sin(u * Math.PI) * .9).toFixed(3)})`); }
    }
    if (c.k === 'sig') {
      // tęcza w tle karty i światła platform
      for (let n = 0; n < 4; n++) { const u = (t * .12 + n * .25) % 1; const a = Math.PI * (1.1 + u * .5); d(150 + Math.cos(a) * 160, 260 + Math.sin(a) * 150, 5, `rgba(${['255,180,120', '160,255,200', '140,180,255', '230,160,255'][n]},${(.5 * Math.sin(u * Math.PI)).toFixed(3)})`); }
    }
  };

  // ---------- interakcje ----------
  const mobile = () => innerWidth < 900;
  cards.forEach(c => {
    const el = c.el;
    const set = (e) => {
      const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.tilt.style.transform = `translateZ(30px) rotateY(${((px - .5) * 14).toFixed(2)}deg) rotateX(${((.5 - py) * 12).toFixed(2)}deg) scale(1.035)`;
      c.tilt.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); c.tilt.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    };
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'touch') return; c.hot = 1; el.classList.add('hot'); cards.forEach(o => o !== c && o.el.classList.add('dim')); });
    el.addEventListener('pointermove', e => { if (e.pointerType === 'touch' || RM) return; set(e); });
    el.addEventListener('pointerleave', () => { c.hot = 0; el.classList.remove('hot'); c.tilt.style.transform = ''; cards.forEach(o => o.el.classList.remove('dim')); });
    el.addEventListener('click', e => {
      if (!c.a) return;
      const r = c.a.getBoundingClientRect(); const rp = document.createElement('span'); rp.className = 'pk-rip';
      const R = Math.max(r.width, r.height) * 1.2; rp.style.cssText = `width:${R * 2}px;height:${R * 2}px;left:${e.clientX - r.left - R}px;top:${e.clientY - r.top - R}px`;
      c.a.appendChild(rp); setTimeout(() => rp.remove(), 800);
      if (e.target.closest('.pk-btn')) return; // przycisk sam przewija do formularza
      c.a.click();
    });
  });
  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ptr.tx = (e.clientX - r.left) / r.width; ptr.ty = (e.clientY - r.top) / r.height; ptr.px = e.clientX - r.left; ptr.py = e.clientY - r.top; ptr.in = true; });
  stage.addEventListener('pointerleave', () => { ptr.in = false; ptr.tx = .5; ptr.ty = .5; });

  // ---------- pętla ----------
  let vis = false, raf = 0, t0 = performance.now();
  const loop = now => {
    raf = 0; if (!vis) return;
    const t = (now - t0) / 1000;
    ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06;
    drawBg(RM ? 0 : t); cards.forEach(c => drawFx(c, RM ? 0 : t));
    if (!RM) raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    vis = e.isIntersecting;
    if (vis) { if (e.intersectionRatio > 0) sec.classList.add('pk-in'); if (!raf) raf = requestAnimationFrame(loop); }
  }), { threshold: [0, .15] });
  io.observe(stage);
  addEventListener('resize', () => { size(); if (vis && !raf) raf = requestAnimationFrame(loop); });
  bgImg.onload = () => { gal = null; if (vis && !raf) raf = requestAnimationFrame(loop); };
  size();
})();
