// Generator 4 stron koncepcyjnych Portfolio (styl: czerń + jeden akcent). Uruchom: node _src/portfolio-gen.js
// Wynik: portfolio/<slug>.html. Media: portfolio/<slug>/ (hero.mp4/webm/webp, obrot/0001.webp…, przejscie/0001.webp…, g1–g7.webp)
const fs = require('fs');
const P = require('./portfolio-data.json');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (arr, cls = '') => arr.map((l, i) => `<span class="ln s${i + 1}"><span>${l}</span></span>`).join('');

for (const s of P.sites) {
  const m = `/portfolio/${s.slug}`;
  const cards = s.cards.map((c, i) => `
      <article class="card"><div class="card-in">${s.lux ? `<span class="acc-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>` : ''}
        <div class="card-img">${s.tower ? `<img class="plan" src="${m}/p${i + 1}.webp" alt="Rzut: ${esc(c.t)}" loading="lazy" width="1080" height="1350"><img class="render" src="${m}/r${i + 1}.webp" alt="${esc(c.alt)}" loading="lazy" width="1080" height="1350"><span class="pr-tog" aria-hidden="true"><i>Rzut</i><i>Wizualizacja</i></span>` : ''}<img src="${m}/g${i + 5}.webp" alt="${esc(c.alt)}" loading="lazy" width="1080" height="1350">${s.video && s.video.cards ? `<video class="card-vid" muted playsinline loop preload="none" aria-hidden="true" data-auto poster="${m}/g${i + 5}.webp"><source src="${m}/k${i + 1}.webm" type="video/webm"><source src="${m}/k${i + 1}.mp4" type="video/mp4"></video>` : ''}</div>
        <div class="card-b"><div><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></div><span class="pr">${esc(c.p)}</span></div>
      </div></article>`).join('');
  const words = (ws) => ws.map(w => `<div class="sw ${w.pos}" data-in="${w.in}" data-out="${w.out}"><div class="lbl">${w.lbl}</div><div class="giant">${lines(w.l)}</div></div>`).join('');
  const calc = s.calc;
  const marq = (s.marq || []).map(w => `<span>${esc(w)}</span><i>✦</i>`).join('');
  const html = `<!doctype html>
<html lang="pl"${s.theme ? ` data-theme="${s.theme}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(s.name)}: ${esc(s.title)} | Portfolio QuantumFlow</title>
<meta name="description" content="${esc(s.desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://quantumflow.agency/portfolio/${s.slug}">
<meta property="og:title" content="${esc(s.name)}: koncepcja strony 3D od QuantumFlow">
<meta property="og:description" content="${esc(s.desc)}">
<meta property="og:image" content="https://quantumflow.agency${m}/hero.webp">
<meta name="theme-color" content="${s.theme === 'light' ? '#f6eee4' : '#050505'}">
<link rel="icon" href="/emblem.webp">
<link rel="preload" href="/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/portfolio/fonts.css">
<link rel="stylesheet" href="/portfolio/portfolio.css">
<style>:root{--acc:${s.acc};--acc2:${s.acc2}}${s.extraCss || ''}</style>
</head>
<body>
<a class="skip" href="#tresc">Przejdź do treści</a>
<div id="loader" role="status" aria-live="polite"${s.tower ? ` data-max="${s.tower.floors}"` : ''}><div class="l-txt">${esc(s.loader)}</div><div class="l-num"><span>00</span><b>/100</b></div><div class="l-bar"><i></i></div></div>
${s.noParticles ? '' : '<canvas id="pf-gl" aria-hidden="true"></canvas>\n<div class="beams" aria-hidden="true"><i></i><i></i><i></i></div>'}

<header class="pf-nav"><a class="pf-brand" href="#top">${esc(s.name)}</a><a class="pf-back" href="/#portfolio">← QuantumFlow</a></header>

<main id="tresc">
  <section class="hero${s.heroFrame ? ' hero--frame' : ''}${s.lux ? ' hero--liquid' : ''}${s.tower ? ' hero--blueprint' : ''}" id="top" data-fx="${s.fx || ''}">
    <div class="hero-media" aria-hidden="true">
      <video muted loop playsinline preload="auto" poster="${m}/hero.webp"><source src="${m}/hero.webm" type="video/webm"><source src="${m}/hero.mp4" type="video/mp4"></video>${s.lux ? '<canvas class="hero-gl"></canvas>' : ''}
    </div>
    <canvas class="hero-fx" aria-hidden="true"></canvas>
    <div class="hero-spot" aria-hidden="true"></div>
    ${s.lux ? '<div class="pearl-drop" aria-hidden="true"></div>' : ''}
    ${s.heroFrame ? `<div class="hero-over" aria-hidden="true">${esc(s.name)}</div>` : ''}
    <div class="hero-top"><span class="lbl"><b>01/</b> ${esc(s.kicker)}</span><span class="lbl">${esc(s.city)}</span></div>
    <h1 class="giant">${lines(s.hero)}</h1>
    <div class="hero-meta"><p class="lead">${esc(s.lead)}</p><a class="btn" href="#cta">${esc(s.cta)}</a></div>
    <div class="hero-marq" aria-hidden="true"><div class="mq-track">${marq}${marq}</div></div>
  </section>

  <section class="seq" data-src="${m}/obrot" data-count="${s.frames.obrot}" data-fallback="${s.fallback}" aria-label="${esc(s.seqLabel)}">
    <div class="seq-sticky">
      <div class="glow" aria-hidden="true"></div>
      <canvas aria-hidden="true"></canvas>
      <div class="seq-hud"><span class="lbl"><b>02/</b> ${esc(s.seqLabel)}</span><span class="lbl">(<span class="cnt">00</span>)</span></div>
      <div class="seq-words">${words(s.seqWords)}</div>
    </div>
  </section>

  <section class="manifest wrap${s.video && s.video.manifest ? ' has-vid' : ''}${s.lux ? ' scan' : ''}">
    ${s.video && s.video.manifest ? `<div class="man-vid" aria-hidden="true"><video muted playsinline preload="none" data-once poster="${m}/manifest.webp"><source src="${m}/manifest.webm" type="video/webm"><source src="${m}/manifest.mp4" type="video/mp4"></video></div>` : ''}
    <div class="lbl"><b>03/</b> ${esc(s.manifestLbl)}</div>
    <p class="big" data-words>${esc(s.manifest)}</p>
  </section>

  <section class="cards-sec wrap" id="oferta">
    <div class="cards-head"><h2 class="giant" style="font-size:clamp(48px,8vw,150px)">${lines(s.cardsTitle)}</h2><span class="lbl"><b>04/</b> ${esc(s.cardsLbl)}</span></div>
    <div class="cards${s.lux ? ' cards--acc' : ''}${s.tower ? ' cards--plan' : ''}">${cards}
    </div>
  </section>

  <section class="seq short${s.lux ? ' dust' : ''}" data-src="${m}/przejscie" data-count="${s.frames.przejscie}" data-fallback="burst" data-scale="${s.transScale || 1}" aria-label="${esc(s.transLabel)}">
    <div class="seq-sticky">
      <canvas aria-hidden="true"></canvas>
      <div class="seq-hud"><span class="lbl"><b>05/</b> ${esc(s.transLabel)}</span><span class="lbl">(<span class="cnt">00</span>)</span></div>
      <div class="seq-words">${words(s.transWords)}</div>
    </div>
  </section>

  <section class="pano${s.video && s.video.panoZoom ? ' zoom' : ''}${s.lux ? ' iris' : ''}" aria-label="${esc(s.panoAlt)}">
    <img src="${m}/g4.webp" alt="${esc(s.panoAlt)}" loading="lazy" width="1920" height="1080">${s.video && s.video.pano ? `<video class="pano-vid" muted playsinline loop preload="none" aria-hidden="true" data-auto poster="${m}/g4.webp"><source src="${m}/pano.webm" type="video/webm"><source src="${m}/pano.mp4" type="video/mp4"></video>` : ''}
    ${s.video && s.video.panoZoom ? `<div class="knock" aria-hidden="true"><span>${s.pano.map(l => l.replace(/<[^>]+>/g, '')).join('<br>')}</span></div>` : ''}
    ${s.lux ? '<div class="iris-ring" aria-hidden="true"></div>' : ''}
    <h2 class="giant">${lines(s.pano)}</h2>
  </section>

  <section class="calc-sec wrap" id="cta">
    <div class="cards-head"><h2 class="giant" style="font-size:clamp(48px,8vw,150px)">${lines(calc.title)}</h2><span class="lbl"><b>06/</b> ${esc(calc.lbl)}</span></div>
    <div class="calc" data-base="${calc.base}">
      <div class="glass"><div>
        ${calc.ranges.map(r => `<label for="${r.id}">${esc(r.l)} <span data-for="${r.id}"></span></label><input type="range" id="${r.id}" min="${r.min}" max="${r.max}" step="${r.step || 1}" value="${r.v}"${r.unit ? ` data-unit="${r.unit}"` : ''}${r.mult ? ' data-mult="1"' : ''} data-suf="${esc(r.suf || '')}">`).join('\n        ')}
        ${calc.groups.map(g => `<label>${esc(g.l)}</label><div class="opts"${g.single ? ' data-single' : ''}>${g.o.map((o, i) => `<button type="button" aria-pressed="${g.single ? (i === 0) : !!o.on}"${o.add ? ` data-add="${o.add}"` : ''}${o.x ? ` data-x="${o.x}"` : ''}>${esc(o.t)}</button>`).join('')}</div>`).join('\n        ')}
      </div></div>
      <div class="glass"><div class="calc-sum">
        <div><div class="lbl">${esc(calc.sumLbl)}</div><div class="total" aria-live="polite">0 zł</div><p class="lead" style="margin-top:14px">${esc(calc.note)}</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="/kontakt">${esc(calc.btn)}</a><a class="btn ghost" href="/#portfolio">Inne projekty</a></div>
      </div></div>
    </div>
  </section>
</main>

<footer class="pf-foot wrap">
  <div class="row"><div>${esc(s.footAddr)}<br><span class="concept">Koncepcja demonstracyjna. Marka i dane są fikcyjne.</span></div>
  <div>Strona 3D zaprojektowana przez <a href="/">QuantumFlow AI Agency</a><br>Chcesz taką dla swojej firmy? <a href="/kontakt">Napisz do nas</a></div></div>
  <div class="huge" aria-hidden="true">${esc(s.name)}</div>
</footer>

<div class="pill" aria-hidden="true"><span class="pl">${esc(s.name)}</span><span class="pt"><i></i></span><span class="pc">0%</span><a href="#cta">${esc(s.pillCta)}</a></div>

<script src="/vendor/gsap.min.js"></script>
<script src="/vendor/ScrollTrigger.min.js"></script>
<script src="/vendor/lenis.min.js"></script>
<script type="module" src="/portfolio/engine.js"></script>
</body>
</html>
`;
  let out = html;
  if (s.tower) {
    const T = s.tower;
    out = out.replace(/\/100<\/b>/, `/${T.floors}</b>`);
    const journey = `  <section class="seq journey" data-src="${m}/podroz" data-count="${T.journey.count}" data-fallback="tower" data-ext="webp" aria-label="${esc(s.seqLabel)}" data-floors='${JSON.stringify(T.journey.floors)}' data-fmax="${T.floors}" data-hmax="${T.height}">
    <div class="seq-sticky">
      <canvas aria-hidden="true"></canvas>
      <div class="seq-hud"><span class="lbl"><b>02/</b> ${esc(s.seqLabel)}</span><span class="lbl jr-coord">54°21′N · 18°39′E</span></div>
      <div class="lift" aria-hidden="true"><div class="lift-shaft">${Array.from({ length: T.floors + 1 }, (_, i) => `<i${i % 4 === 0 ? ' class="big"' : ''}></i>`).join('')}<b class="lift-car"></b></div><div class="lift-read"><span class="lbl">Piętro</span><strong class="lift-fl">00</strong><span class="lbl lift-h">0,0 m</span></div></div>
      <div class="seq-words">${words(s.seqWords)}</div>
      <div class="jr-bar" aria-hidden="true"><i></i></div>
    </div>
  </section>
`;
    out = out.replace(/  <section class="seq" data-src[\s\S]*?<\/section>\n/, () => journey);
    const st = T.build.map((b, i) => `<figure class="bd-st" data-pct="${b.pct}" data-lbl="${esc(b.lbl)}" data-date="${esc(b.date)}"><img src="${m}/${b.img}.webp" alt="${esc(b.alt)}" loading="lazy" width="1920" height="1080"></figure>`).join('');
    const nodes = T.build.map((b, i) => `<li><b>${esc(b.date)}</b><span>${esc(b.lbl)}</span></li>`).join('');
    const build = `  <section class="build" aria-label="Postęp budowy">
    <div class="bd-sticky">
      ${st}
      <div class="bd-line" aria-hidden="true"></div>
      <div class="bd-hud"><span class="lbl"><b>05/</b> Budowa na żywo</span><span class="lbl bd-date">${esc(T.build[0].date)}</span></div>
      <div class="bd-read"><div class="lbl bd-lbl">${esc(T.build[0].lbl)}</div><div class="bd-pct"><span>0</span><b>%</b></div><div class="lbl">zaawansowania prac</div></div>
      <ol class="bd-tl">${nodes}</ol>
      ${T.cam ? `<figure class="bd-cam" aria-label="${esc(T.cam.alt)}"><video data-auto muted loop playsinline preload="none" poster="${m}/${T.cam.src}.webp"><source src="${m}/${T.cam.src}.webm" type="video/webm"><source src="${m}/${T.cam.src}.mp4" type="video/mp4"></video><figcaption><span class="lbl"><i></i>Na żywo · ${esc(T.cam.lbl)}</span><span class="lbl bd-time">--:--:--</span></figcaption></figure>` : ''}
    </div>
  </section>
`;
    const fl = `  <section class="floors wrap" id="pietra" aria-label="Wybór piętra">
    <div class="cards-head"><h2 class="giant" style="font-size:clamp(48px,8vw,150px)"><span class="ln s1"><span>Wybierz</span></span><span class="ln s2"><span><span class="acc">piętro</span></span></span></h2><span class="lbl"><b>06/</b> Najedź na budynek</span></div>
    <div class="fl-grid">
      <div class="fl-pic"><img src="${m}/${T.pick.img}.webp" alt="Wieża MONOLIT, wybór piętra" loading="lazy" width="1920" height="1080"><svg class="fl-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" data-box='${JSON.stringify(T.pick.box)}' data-floors="${T.floors}"></svg></div>
      <div class="fl-info glass"><div>
        <div class="lbl">Piętro</div><div class="fl-n">--</div>
        <dl><div><dt>Apartamenty</dt><dd class="fl-u">--</dd></div><div><dt>Wolne</dt><dd class="fl-f">--</dd></div><div><dt>Cena od</dt><dd class="fl-p">--</dd></div><div><dt>Widok</dt><dd class="fl-v">--</dd></div></dl>
        <a class="btn" href="#cta">Zapytaj o piętro</a>
      </div></div>
    </div>
  </section>
`;
    out = out.replace(/  <section class="seq short[\s\S]*?<\/section>\n/, () => build + fl);
    const dn = `  <section class="daynight" aria-label="${esc(s.panoAlt)}">
    <div class="dn-sticky">
      <img class="dn-day" src="${m}/w1.webp" alt="${esc(s.panoAlt)} w dzień" loading="lazy" width="1920" height="1080">
      <img class="dn-night" src="${m}/w2.webp" alt="${esc(s.panoAlt)} nocą" loading="lazy" width="1920" height="1080">
      <div class="dn-hud"><span class="lbl"><b>07/</b> Widok z 32. piętra</span><span class="dn-clock">12:00</span></div>
      <h2 class="giant">${lines(s.pano)}</h2>
      <div class="dn-tog" role="group" aria-label="Pora dnia"><button type="button" data-v="0" aria-pressed="true">Dzień</button><button type="button" data-v="1" aria-pressed="false">Noc</button><i></i></div>
    </div>
  </section>
`;
    out = out.replace(/  <section class="pano[\s\S]*?<\/section>\n/, () => dn);
  }
  fs.writeFileSync(`portfolio/${s.slug}.html`, out);
  fs.mkdirSync(`portfolio/${s.slug}`, { recursive: true });
  console.log('portfolio/' + s.slug + '.html');
}
