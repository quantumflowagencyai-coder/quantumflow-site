// Generator 4 stron koncepcyjnych Portfolio (styl: czerń + jeden akcent). Uruchom: node _src/portfolio-gen.js
// Wynik: portfolio/<slug>.html. Media: portfolio/<slug>/ (hero.mp4/webm/webp, obrot/0001.webp…, przejscie/0001.webp…, g1–g7.webp)
const fs = require('fs');
const P = require('./portfolio-data.json');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (arr, cls = '') => arr.map((l, i) => `<span class="ln s${i + 1}"><span>${l}</span></span>`).join('');

for (const s of P.sites) {
  const m = `/portfolio/${s.slug}`;
  const cards = s.cards.map((c, i) => `
      <article class="card"><div class="card-in">
        <div class="card-img"><img src="${m}/g${i + 5}.webp" alt="${esc(c.alt)}" loading="lazy" width="1080" height="1350">${s.video && s.video.cards ? `<video class="card-vid" muted playsinline loop preload="none" aria-hidden="true" data-auto poster="${m}/g${i + 5}.webp"><source src="${m}/k${i + 1}.webm" type="video/webm"><source src="${m}/k${i + 1}.mp4" type="video/mp4"></video>` : ''}</div>
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
<div id="loader" role="status" aria-live="polite"><div class="l-txt">${esc(s.loader)}</div><div class="l-num"><span>00</span><b>/100</b></div><div class="l-bar"><i></i></div></div>
${s.noParticles ? '' : '<canvas id="pf-gl" aria-hidden="true"></canvas>\n<div class="beams" aria-hidden="true"><i></i><i></i><i></i></div>'}

<header class="pf-nav"><a class="pf-brand" href="#top">${esc(s.name)}</a><a class="pf-back" href="/#portfolio">← QuantumFlow</a></header>

<main id="tresc">
  <section class="hero${s.heroFrame ? ' hero--frame' : ''}" id="top" data-fx="${s.fx || ''}">
    <div class="hero-media" aria-hidden="true">
      <video muted loop playsinline preload="auto" poster="${m}/hero.webp"><source src="${m}/hero.webm" type="video/webm"><source src="${m}/hero.mp4" type="video/mp4"></video>
    </div>
    <canvas class="hero-fx" aria-hidden="true"></canvas>
    <div class="hero-spot" aria-hidden="true"></div>
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

  <section class="manifest wrap${s.video && s.video.manifest ? ' has-vid' : ''}">
    ${s.video && s.video.manifest ? `<div class="man-vid" aria-hidden="true"><video muted playsinline preload="none" data-once poster="${m}/manifest.webp"><source src="${m}/manifest.webm" type="video/webm"><source src="${m}/manifest.mp4" type="video/mp4"></video></div>` : ''}
    <div class="lbl"><b>03/</b> ${esc(s.manifestLbl)}</div>
    <p class="big" data-words>${esc(s.manifest)}</p>
  </section>

  <section class="cards-sec wrap" id="oferta">
    <div class="cards-head"><h2 class="giant" style="font-size:clamp(48px,8vw,150px)">${lines(s.cardsTitle)}</h2><span class="lbl"><b>04/</b> ${esc(s.cardsLbl)}</span></div>
    <div class="cards">${cards}
    </div>
  </section>

  <section class="seq short" data-src="${m}/przejscie" data-count="${s.frames.przejscie}" data-fallback="burst" data-scale="${s.transScale || 1}" aria-label="${esc(s.transLabel)}">
    <div class="seq-sticky">
      <canvas aria-hidden="true"></canvas>
      <div class="seq-hud"><span class="lbl"><b>05/</b> ${esc(s.transLabel)}</span><span class="lbl">(<span class="cnt">00</span>)</span></div>
      <div class="seq-words">${words(s.transWords)}</div>
    </div>
  </section>

  <section class="pano${s.video && s.video.panoZoom ? ' zoom' : ''}" aria-label="${esc(s.panoAlt)}">
    <img src="${m}/g4.webp" alt="${esc(s.panoAlt)}" loading="lazy" width="1920" height="1080">${s.video && s.video.pano ? `<video class="pano-vid" muted playsinline loop preload="none" aria-hidden="true" data-auto poster="${m}/g4.webp"><source src="${m}/pano.webm" type="video/webm"><source src="${m}/pano.mp4" type="video/mp4"></video>` : ''}
    ${s.video && s.video.panoZoom ? `<div class="knock" aria-hidden="true"><span>${s.pano.map(l => l.replace(/<[^>]+>/g, '')).join('<br>')}</span></div>` : ''}
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
  fs.writeFileSync(`portfolio/${s.slug}.html`, html);
  fs.mkdirSync(`portfolio/${s.slug}`, { recursive: true });
  console.log('portfolio/' + s.slug + '.html');
}
