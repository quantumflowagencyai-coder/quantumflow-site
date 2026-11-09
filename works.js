// Sekcja „Realizacje”: galeria 3D, przez którą przelatuje kamera. Każdy projekt to szklany panel z żywym podglądem strony.
import * as THREE from 'three';

const pin = document.getElementById('wrk-pin');
const canvas = document.getElementById('wrk-gl');
const panels = [...document.querySelectorAll('.wrk-panel')];
const dots = [...document.querySelectorAll('.wrk-dots i')];
const counter = document.getElementById('wrk-count');
const bar = document.getElementById('wrk-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
// Wygląd panelu z wezwaniem na końcu galerii (nadpisuje style z index.html)
document.head.insertAdjacentHTML('beforeend', '<style>.wrk-cta{bottom:3.5vh}.wrk-cta-box{max-width:860px;margin:0 auto;padding:24px 32px;border-color:rgba(34,211,238,.32);background:rgba(10,16,34,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}.wrk-cta-box h3{font-size:clamp(1.3rem,2.1vw,1.75rem)}.wrk-cta-box p{max-width:480px;font-size:.92rem}@media(max-width:760px){.wrk-cta{bottom:4vh}.wrk-cta-box{padding:24px 20px}}</style>');
const FONT = '"Space Grotesk", Inter, sans-serif';
const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';

// ---------- Projekty koncepcyjne (podgląd strony) ----------
const P = [
  { tag: 'RESTAURACJA', name: 'OGIEŃ & SÓL', domain: 'ogienisol.pl', bg: '#120b07', bg2: '#1f120a', fg: '#fff4e6', mut: '#bfa58c', acc: '#f59e0b', acc2: '#ef4444', font: SERIF,
    nav: ['Menu', 'Szef kuchni', 'Wydarzenia', 'Kontakt'], kick: 'KUCHNIA OGNIA · KRAKÓW', title: ['Smak, który', 'pamięta się długo.'], sub: 'Steki z pieca opalanego drewnem i lokalne wina.', cta: 'Zarezerwuj stolik',
    cards: ['Menu sezonowe', 'Kolacje degustacyjne', 'Imprezy firmowe'], form: 'Rezerwacja online', fields: ['Data', 'Godzina', 'Liczba gości'], art: 'plate', img: '/img/case-ogien.avif' },
  { tag: 'KLINIKA', name: 'MEDORA', domain: 'medora-klinika.pl', bg: '#f3f8fb', bg2: '#e3f1f6', fg: '#0b2530', mut: '#5b7a86', acc: '#14b8a6', acc2: '#0ea5e9', font: FONT, light: true,
    nav: ['Zabiegi', 'Lekarze', 'Cennik', 'Kontakt'], kick: 'STOMATOLOGIA ESTETYCZNA', title: ['Uśmiech, który', 'zaprojektujesz z nami.'], sub: 'Zobacz efekt leczenia w 3D, zanim usiądziesz na fotelu.', cta: 'Umów wizytę',
    cards: ['Implanty', 'Licówki', 'Ortodoncja'], form: 'Wolne terminy', fields: ['Zabieg', 'Lekarz', 'Termin'], art: 'molecule', img: '/img/case-medora.avif', imgBg: '#3e4a52' },
  { tag: 'DEWELOPER', name: 'NOVA RESIDENCE', domain: 'nova-residence.pl', bg: '#060b18', bg2: '#0c1630', fg: '#eef4ff', mut: '#8ea3c8', acc: '#3b82f6', acc2: '#22d3ee', font: FONT,
    nav: ['Inwestycja', 'Mieszkania', 'Lokalizacja', 'Kontakt'], kick: 'OSIEDLE · 4 BUDYNKI · 186 MIESZKAŃ', title: ['Wybierz mieszkanie', 'na modelu 3D.'], sub: 'Obróć budynek, kliknij piętro i sprawdź dostępność.', cta: 'Znajdź mieszkanie',
    cards: ['Model 3D osiedla', 'Plany mieszkań', 'Dostępność na żywo'], form: 'Wyszukiwarka', fields: ['Metraż', 'Pokoje', 'Piętro'], art: 'tower', img: '/img/case-nova.avif', imgBg: '#0e1318' },
  { tag: 'SALON SAMOCHODOWY', name: 'VOLT MOTORS', domain: 'voltmotors.pl', bg: '#0a0a0c', bg2: '#16161b', fg: '#f5f5f7', mut: '#9a9aa6', acc: '#ef4444', acc2: '#f97316', font: FONT,
    nav: ['Modele', 'Konfigurator', 'Jazda próbna', 'Serwis'], kick: 'AUTORYZOWANY SALON EV', title: ['Skonfiguruj auto', 'w przeglądarce.'], sub: 'Kolor, felgi i wnętrze w 3D. Jazda próbna w dwa kliknięcia.', cta: 'Konfiguruj',
    cards: ['Konfigurator 3D', 'Jazda próbna', 'Finansowanie'], form: 'Jazda próbna', fields: ['Model', 'Dzień', 'Telefon'], art: 'car', img: '/img/case-volt.avif', imgBg: '#0b1118' },
  { tag: 'HOTEL I SPA', name: 'AURA HOTEL & SPA', domain: 'aurahotel.pl', bg: '#140d1c', bg2: '#22142b', fg: '#fbf4ff', mut: '#b9a4c7', acc: '#e9b872', acc2: '#c084fc', font: SERIF,
    nav: ['Pokoje', 'SPA', 'Restauracja', 'Oferty'], kick: 'HOTEL · SPA · MAZURY', title: ['Odpoczynek zaczyna', 'się już na stronie.'], sub: 'Wirtualny spacer po hotelu i rezerwacja bez prowizji.', cta: 'Sprawdź pokoje',
    cards: ['Wirtualny spacer', 'Pakiety SPA', 'Rezerwacja direct'], form: 'Rezerwacja pobytu', fields: ['Przyjazd', 'Wyjazd', 'Goście'], art: 'pool', img: '/img/case-aura.avif', imgBg: '#0a1118' },
  { tag: 'SKLEP INTERNETOWY', name: 'AURUM', domain: 'aurum-bizuteria.pl', bg: '#0b0a08', bg2: '#17140e', fg: '#fdf8ee', mut: '#b3a68a', acc: '#f5c66b', acc2: '#f4a6c0', font: SERIF,
    nav: ['Kolekcje', 'Pierścionki', 'Prezenty', 'Koszyk (0)'], kick: 'BIŻUTERIA RĘCZNIE ROBIONA', title: ['Obejrzyj każdy', 'detal w 3D.'], sub: 'Obróć pierścionek, przybliż kamień, kup w minutę.', cta: 'Zobacz kolekcję',
    cards: ['Produkt w 360°', 'Grawer online', 'Szybki koszyk'], form: 'Twój koszyk', fields: ['Pierścionek Lumen', 'Grawer: „A&M”', 'Dostawa jutro'], art: 'ring', img: '/img/case-aurum.avif', imgBg: '#0a1118' },
];
const N = P.length;
const KEYS = [0, ...P.map((_, i) => .1 + i * .13), .94]; // ogół, 6 projektów, wezwanie
const SQ = 1.5; const SW = 960, SH = 600, BAR = 34, PH = 1720; // ekran, pasek przeglądarki, wysokość podstrony

const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const lines = (g, x, y, w, n, c, gap = 16) => { g.fillStyle = c; for (let i = 0; i < n; i++) { rr(g, x, y + i * gap, w * (i === n - 1 ? .6 : 1), 6, 3); g.fill(); } };
const alpha = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };

// Statyczna długa podstrona (bez animowanej grafiki w hero)
function drawPage(p) {
  const c = document.createElement('canvas'); c.width = SW; c.height = PH; const g = c.getContext('2d');
  const bgG = g.createLinearGradient(0, 0, 0, PH); bgG.addColorStop(0, p.bg); bgG.addColorStop(.45, p.bg2); bgG.addColorStop(1, p.bg);
  g.fillStyle = bgG; g.fillRect(0, 0, SW, PH);
  // hero: poświata
  const rg = g.createRadialGradient(700, 300, 10, 700, 300, 420); rg.addColorStop(0, alpha(p.acc, p.light ? .22 : .28)); rg.addColorStop(1, alpha(p.acc, 0));
  g.fillStyle = rg; g.fillRect(0, 0, SW, 640);
  // nawigacja
  g.fillStyle = p.fg; g.font = `700 22px ${p.font}`; g.textBaseline = 'middle'; g.fillText(p.name, 44, 44);
  g.font = `500 14px ${FONT}`; g.fillStyle = p.mut;
  let nx = 470; p.nav.forEach(t => { g.fillText(t, nx, 44); nx += g.measureText(t).width + 30; });
  g.strokeStyle = alpha(p.fg, .12); g.beginPath(); g.moveTo(0, 82); g.lineTo(SW, 82); g.stroke();
  // treść hero
  g.fillStyle = p.acc; g.font = `600 13px ${FONT}`; g.fillText(p.kick.split('').join(String.fromCharCode(8202)), 44, 150);
  g.fillStyle = p.fg; g.font = `700 50px ${p.font}`; g.textBaseline = 'alphabetic';
  g.fillText(p.title[0], 44, 222); g.fillText(p.title[1], 44, 280);
  g.font = `400 17px ${FONT}`; g.fillStyle = p.mut; g.fillText(p.sub, 44, 326);
  const bg1 = g.createLinearGradient(44, 0, 260, 0); bg1.addColorStop(0, p.acc); bg1.addColorStop(1, p.acc2);
  g.fillStyle = bg1; rr(g, 44, 358, 210, 52, 26); g.fill();
  g.fillStyle = p.light ? '#fff' : '#0b0b0f'; g.font = `600 16px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(p.cta, 149, 385);
  g.strokeStyle = alpha(p.fg, .35); g.lineWidth = 1.5; rr(g, 268, 358, 150, 52, 26); g.stroke(); g.fillStyle = p.fg; g.fillText('Dowiedz się', 343, 385); g.textAlign = 'left';
  // pasek zaufania
  g.fillStyle = alpha(p.fg, .05); g.fillRect(0, 520, SW, 70);
  g.fillStyle = p.mut; g.font = `500 14px ${FONT}`;
  ['★ 4,9 w Google', 'Strona mobilna 100%', 'Wczytuje się < 1 s', 'Obsługa 24/7'].forEach((t, i) => g.fillText(t, 44 + i * 228, 555));
  // sekcja kart
  g.fillStyle = p.fg; g.font = `700 34px ${p.font}`; g.textBaseline = 'alphabetic'; g.fillText('Co znajdziesz na miejscu', 44, 680);
  p.cards.forEach((t, i) => {
    const x = 44 + i * 296, y = 720;
    g.fillStyle = alpha(p.fg, p.light ? .9 : .05); rr(g, x, y, 276, 300, 20); g.fill();
    g.strokeStyle = alpha(p.fg, .1); g.lineWidth = 1; g.stroke();
    const ig = g.createLinearGradient(x, y, x + 276, y + 160); ig.addColorStop(0, alpha(p.acc, .55)); ig.addColorStop(1, alpha(p.acc2, .25));
    g.fillStyle = ig; rr(g, x + 14, y + 14, 248, 150, 14); g.fill();
    g.fillStyle = alpha('#ffffff', .25); g.beginPath(); g.arc(x + 138, y + 89, 30 + i * 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = p.fg; g.font = `600 21px ${FONT}`; g.fillText(t, x + 20, y + 204);
    lines(g, x + 20, y + 228, 220, 3, alpha(p.fg, .18));
  });
  // sekcja formularza
  const fy = 1090;
  g.fillStyle = alpha(p.acc, p.light ? .1 : .08); rr(g, 44, fy, SW - 88, 330, 26); g.fill();
  g.strokeStyle = alpha(p.acc, .35); g.stroke();
  g.fillStyle = p.fg; g.font = `700 34px ${p.font}`; g.fillText(p.form, 84, fy + 70);
  lines(g, 84, fy + 104, 300, 3, alpha(p.fg, .2), 18);
  p.fields.forEach((t, i) => {
    const y = fy + 44 + i * 70;
    g.fillStyle = p.light ? '#fff' : alpha(p.fg, .07); rr(g, 470, y, 380, 52, 12); g.fill();
    g.strokeStyle = alpha(p.fg, .15); g.stroke();
    g.fillStyle = p.mut; g.font = `500 15px ${FONT}`; g.textBaseline = 'middle'; g.fillText(t, 490, y + 26); g.fillText('▾', 822, y + 26);
  });
  g.fillStyle = bg1; rr(g, 470, fy + 254, 380, 52, 26); g.fill();
  g.fillStyle = p.light ? '#fff' : '#0b0b0f'; g.textAlign = 'center'; g.font = `600 16px ${FONT}`; g.fillText(p.cta, 660, fy + 280); g.textAlign = 'left';
  // stopka
  g.textBaseline = 'alphabetic';
  g.strokeStyle = alpha(p.fg, .12); g.beginPath(); g.moveTo(44, 1500); g.lineTo(SW - 44, 1500); g.stroke();
  g.fillStyle = p.fg; g.font = `700 22px ${p.font}`; g.fillText(p.name, 44, 1550);
  [0, 1, 2].forEach(i => lines(g, 400 + i * 180, 1534, 120, 3, alpha(p.fg, .16), 18));
  g.fillStyle = p.mut; g.font = `400 13px ${FONT}`; g.fillText('Projekt koncepcyjny · QuantumFlow AI Agency', 44, 1650);
  return c;
}

// Animowana grafika w hero (współrzędne strony)
const AX = 540, AY = 100, AW = 380, AH = 400;
function drawArt(g, p, t, oy) {
  const cx = AX + AW / 2, cy = AY + AH / 2 - oy;
  if (cy < -260) return;
  g.save();
  if (p.art === 'plate') {
    const fl = g.createRadialGradient(cx, cy + 60, 10, cx, cy + 60, 220); fl.addColorStop(0, 'rgba(245,158,11,.55)'); fl.addColorStop(1, 'rgba(239,68,68,0)');
    g.fillStyle = fl; g.fillRect(cx - 230, cy - 200, 460, 440);
    g.fillStyle = '#efe6da'; g.beginPath(); g.ellipse(cx, cy + 40, 160, 62, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8ccbc'; g.beginPath(); g.ellipse(cx, cy + 40, 112, 42, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6b2f17'; g.beginPath(); g.ellipse(cx - 10, cy + 30, 72, 26, -.1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a1208'; g.lineWidth = 4; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(cx - 50 + i * 18, cy + 12); g.lineTo(cx - 30 + i * 18, cy + 48); g.stroke(); }
    g.fillStyle = '#4d7c0f'; [[50, 20], [62, 34], [40, 44]].forEach(([x, y]) => { g.beginPath(); g.ellipse(cx + x, cy + y, 12, 6, .6, 0, Math.PI * 2); g.fill(); });
    for (let i = 0; i < 7; i++) {
      const k = (t * .35 + i / 7) % 1, x = cx - 60 + i * 20 + Math.sin(t * 2 + i) * 10;
      g.strokeStyle = `rgba(255,240,225,${.35 * Math.sin(k * Math.PI)})`; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, cy + 10 - k * 160); g.bezierCurveTo(x + 14, cy - 10 - k * 160, x - 14, cy - 30 - k * 160, x, cy - 50 - k * 160); g.stroke();
    }
  } else if (p.art === 'molecule') {
    g.translate(cx, cy);
    const pts = [];
    for (let i = 0; i < 90; i++) {
      const phi = Math.acos(1 - 2 * (i + .5) / 90), th = Math.PI * (1 + Math.sqrt(5)) * i + t * .5;
      const x = Math.sin(phi) * Math.cos(th), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(th);
      pts.push([x * 150, y * 150, z]);
    }
    g.strokeStyle = 'rgba(20,184,166,.18)'; g.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < 44) { g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke(); }
    }
    pts.forEach(([x, y, z]) => { g.fillStyle = z > 0 ? '#0ea5e9' : 'rgba(20,184,166,.5)'; g.beginPath(); g.arc(x, y, 3 + z * 2.5, 0, Math.PI * 2); g.fill(); });
    for (let k = 0; k < 3; k++) { const r = ((t * 40 + k * 70) % 210); g.strokeStyle = `rgba(14,165,233,${.4 * (1 - r / 210)})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#fff'; rr(g, 70, 110, 150, 54, 14); g.fill(); g.fillStyle = '#0b2530'; g.font = `700 15px ${FONT}`; g.fillText('Wizyta: jutro 10:30', 84, 143);
  } else if (p.art === 'tower') {
    const floors = 3 + Math.floor((t * 1.6) % 9);
    const iso = (x, y, z) => [cx + (x - z) * 46, cy + 150 + (x + z) * 24 - y * 34];
    [[-1.4, 0, 9], [0, 0, 6], [1.4, 1, 7]].forEach(([bx, bz, max], bi) => {
      const h = bi === 0 ? Math.min(floors, max) : max;
      for (let f = 0; f < h; f++) {
        const a = iso(bx, f, bz), b = iso(bx + 1, f, bz), c = iso(bx + 1, f, bz + 1), d = iso(bx, f, bz + 1), a2 = iso(bx, f + 1, bz), b2 = iso(bx + 1, f + 1, bz), c2 = iso(bx + 1, f + 1, bz + 1), d2 = iso(bx, f + 1, bz + 1);
        g.fillStyle = 'rgba(59,130,246,.35)'; g.beginPath(); g.moveTo(...b); g.lineTo(...c); g.lineTo(...c2); g.lineTo(...b2); g.fill();
        g.fillStyle = 'rgba(34,211,238,.18)'; g.beginPath(); g.moveTo(...c); g.lineTo(...d); g.lineTo(...d2); g.lineTo(...c2); g.fill();
        g.strokeStyle = 'rgba(147,197,253,.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(...a2); g.lineTo(...b2); g.lineTo(...c2); g.lineTo(...d2); g.closePath(); g.stroke();
        const lit = Math.sin(f * 3.1 + bi * 2 + t * 1.5) > .3;
        g.fillStyle = lit ? 'rgba(253,230,138,.9)' : 'rgba(147,197,253,.25)';
        const m = iso(bx + 1, f + .35, bz + .3); g.fillRect(m[0] - 4, m[1] - 8, 8, 10);
        const m2 = iso(bx + .35, f + .35, bz + 1); g.fillRect(m2[0] - 4, m2[1] - 8, 8, 10);
      }
    });
    g.fillStyle = 'rgba(34,211,238,.95)'; rr(g, cx + 60, cy - 160, 130, 44, 12); g.fill();
    g.fillStyle = '#04111f'; g.font = `700 14px ${FONT}`; g.fillText('M 4.12 · wolne', cx + 74, cy - 132);
  } else if (p.art === 'car') {
    for (let i = 0; i < 14; i++) { const y = cy - 40 + (i * 23) % 150, x = cx + 220 - ((t * 420 + i * 97) % 520); g.strokeStyle = `rgba(239,68,68,${.15 + (i % 3) * .1})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + i * 3, y); g.stroke(); }
    g.translate(cx, cy + 40);
    const body = g.createLinearGradient(0, -80, 0, 30); body.addColorStop(0, '#f43f5e'); body.addColorStop(1, '#7f1d1d');
    g.fillStyle = body; g.beginPath(); g.moveTo(-170, 20); g.lineTo(-165, -18); g.quadraticCurveTo(-120, -36, -70, -40); g.quadraticCurveTo(-30, -84, 40, -82); g.quadraticCurveTo(100, -78, 130, -42); g.quadraticCurveTo(170, -36, 172, -6); g.lineTo(170, 20); g.closePath(); g.fill();
    g.fillStyle = 'rgba(15,23,42,.85)'; g.beginPath(); g.moveTo(-50, -42); g.quadraticCurveTo(-20, -74, 36, -74); g.quadraticCurveTo(84, -72, 108, -42); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-150, -6, 300, 2);
    const hl = g.createRadialGradient(168, -8, 2, 168, -8, 90); hl.addColorStop(0, 'rgba(255,255,255,.9)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(80, -100, 180, 180);
    [-100, 104].forEach(x => {
      g.fillStyle = '#0a0a0c'; g.beginPath(); g.arc(x, 22, 34, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#d4d4d8'; g.lineWidth = 3; g.beginPath(); g.arc(x, 22, 22, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 5; k++) { const a = t * 9 + k * 1.2566; g.beginPath(); g.moveTo(x, 22); g.lineTo(x + Math.cos(a) * 20, 22 + Math.sin(a) * 20); g.stroke(); }
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    ['#ef4444', '#e5e7eb', '#0ea5e9', '#111827'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(cx - 60 + i * 40, cy + 150, 12, 0, Math.PI * 2); g.fill(); if (i === Math.floor(t / 1.5) % 4) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(cx - 60 + i * 40, cy + 150, 17, 0, Math.PI * 2); g.stroke(); } });
  } else if (p.art === 'pool') {
    const sun = g.createRadialGradient(cx, cy - 40, 10, cx, cy - 40, 170); sun.addColorStop(0, 'rgba(253,224,171,.95)'); sun.addColorStop(.35, 'rgba(233,184,114,.5)'); sun.addColorStop(1, 'rgba(192,132,252,0)');
    g.fillStyle = sun; g.fillRect(cx - 200, cy - 220, 400, 380);
    g.fillStyle = '#fde3ab'; g.beginPath(); g.arc(cx, cy - 30, 58, Math.PI, 0); g.fill();
    for (let k = 0; k < 9; k++) {
      g.strokeStyle = `rgba(${k % 2 ? '192,132,252' : '233,184,114'},${.75 - k * .07})`; g.lineWidth = 2.5; g.beginPath();
      for (let x = -170; x <= 170; x += 8) { const y = cy - 22 + k * 18 + Math.sin(x * .04 + t * 2 + k) * (3 + k * .6); x === -170 ? g.moveTo(cx + x, y) : g.lineTo(cx + x, y); }
      g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,.92)'; rr(g, cx - 160, cy + 150, 200, 52, 14); g.fill();
    g.fillStyle = '#22142b'; g.font = `700 14px ${FONT}`; g.fillText('2 noce · SPA w cenie', cx - 146, cy + 182);
  } else if (p.art === 'ring') {
    g.translate(cx, cy);
    const sq = Math.cos(t * .9);
    const gold = g.createLinearGradient(-120, -60, 120, 60); gold.addColorStop(0, '#7c5a1d'); gold.addColorStop(.35, '#fde7a8'); gold.addColorStop(.6, '#c9973f'); gold.addColorStop(1, '#fff4cf');
    g.strokeStyle = gold; g.lineWidth = 22; g.beginPath(); g.ellipse(0, 30, 120 * Math.max(.18, Math.abs(sq)), 120, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#e0f2fe'; g.beginPath(); const sx = 0, sy = -96; g.moveTo(sx, sy - 34); g.lineTo(sx + 28, sy - 6); g.lineTo(sx, sy + 22); g.lineTo(sx - 28, sy - 6); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(sx, sy - 34); g.lineTo(sx + 10, sy - 6); g.lineTo(sx, sy + 22); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { const a = t * .8 + i, r = 150 + Math.sin(t * 2 + i) * 20, s = 4 + 3 * Math.sin(t * 4 + i * 2); g.fillStyle = `rgba(255,244,207,${.5 + .5 * Math.sin(t * 3 + i)})`; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r - s * 2); g.lineTo(Math.cos(a) * r + s * .6, Math.sin(a) * r); g.lineTo(Math.cos(a) * r, Math.sin(a) * r + s * 2); g.lineTo(Math.cos(a) * r - s * .6, Math.sin(a) * r); g.fill(); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = 'rgba(245,198,107,.95)'; rr(g, cx + 40, cy + 160, 150, 44, 22); g.fill();
    g.fillStyle = '#0b0a08'; g.font = `700 14px ${FONT}`; g.fillText('↻ Obróć w 3D', cx + 64, cy + 182);
  }
  g.restore();
}

// Ekran: pasek przeglądarki + przewijana podstrona + kursor
function makeScreen(p, i) {
  // ekran w 1,5× rozdzielczości (grafiki projektów HD); rysowanie dalej we współrzędnych 960×600
  const c = document.createElement('canvas'); c.width = SW * SQ; c.height = SH * SQ; const g = c.getContext('2d'); g.scale(SQ, SQ);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true;
  let page = null;
  const build = () => { page = drawPage(p); };
  build(); if (document.fonts) document.fonts.ready.then(() => { build(); draw(0); });
  let shot = null; // gotowa grafika projektu zamiast rysowanej podstrony
  if (p.img) { const im = new Image(); im.decoding = 'async'; im.onload = () => { shot = im; draw(0); }; im.src = p.img; }
  const VH = SH - BAR;
  const scrollAt = t => { // 13 s: hero, przewinięcie w dół, formularz, powrót
    const k = (t + i * 2.3) % 13;
    const s = k < 3.5 ? 0 : k < 6.5 ? ease((k - 3.5) / 3) * 560 : k < 8.2 ? 560 : k < 10.4 ? 560 + ease((k - 8.2) / 2.2) * (PH - VH - 560 - 90) : PH - VH - 90 - ease((k - 10.4) / 2.6) * (PH - VH - 90);
    return s;
  };
  function draw(t) {
    const oy = shot ? 0 : scrollAt(t);
    if (shot) { // grafika: dopasowana do ekranu, z powolnym „oddechem” i przesuwającym się skanem
      g.fillStyle = p.imgBg || '#000'; g.fillRect(0, BAR, SW, VH);
      const z = .975 + Math.sin(t * .35 + i) * .02, w = SW * z, h = w * shot.height / shot.width;
      g.save(); g.beginPath(); g.rect(0, BAR, SW, VH); g.clip();
      g.drawImage(shot, (SW - w) / 2, BAR + (VH - h) / 2, w, h);
      const sy = BAR + ((t * 70 + i * 90) % (VH + 120)) - 60, sg = g.createLinearGradient(0, sy - 50, 0, sy + 50);
      sg.addColorStop(0, 'rgba(34,211,238,0)'); sg.addColorStop(.5, 'rgba(34,211,238,.07)'); sg.addColorStop(1, 'rgba(34,211,238,0)');
      g.fillStyle = sg; g.fillRect(0, sy - 50, SW, 100); g.restore();
    } else {
      g.drawImage(page, 0, oy, SW, VH, 0, BAR, SW, VH);
      g.save(); g.beginPath(); g.rect(0, BAR, SW, VH); g.clip(); g.translate(0, BAR); drawArt(g, p, t, oy); g.restore();
    }
    // kursor
    const k = (t + i * 2.3) % 13;
    const mx = 300 + Math.sin(t * .7 + i) * 220, my = 300 + Math.cos(t * .5 + i * 2) * 140;
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my + 22); g.lineTo(mx + 6, my + 16); g.lineTo(mx + 15, my + 17); g.closePath(); g.fill(); g.stroke();
    if (k > 2.6 && k < 3.4) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(mx, my, (k - 2.6) * 40, 0, Math.PI * 2); g.stroke(); }
    // pasek przeglądarki
    g.fillStyle = p.light ? '#dfe7ec' : '#15171f'; g.fillRect(0, 0, SW, BAR);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((cl, j) => { g.fillStyle = cl; g.beginPath(); g.arc(20 + j * 18, BAR / 2, 5.5, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = p.light ? '#fff' : '#0b0c12'; rr(g, 300, 7, 360, 20, 10); g.fill();
    g.fillStyle = p.light ? '#475569' : '#9ca3af'; g.font = `500 12px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔒 ' + p.domain, 480, BAR / 2 + 1); g.textAlign = 'left';
    // pasek przewijania
    if (!shot) { g.fillStyle = alpha(p.fg, .25); rr(g, SW - 7, BAR + 4 + oy / PH * VH, 4, VH * VH / PH, 2); g.fill(); }
    tex.needsUpdate = true;
  }
  draw(0);
  return { tex, draw };
}

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { pin.classList.add('no-gl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x03040a, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040a, .0115);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 400);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x05070f, side: THREE.BackSide })));
  [[0x22d3ee, -10, 4, 0, 4], [0x3b82f6, 10, 4, 0, 4], [0xffffff, 0, 12, 0, 2.5], [0x2dd4bf, 0, 2, -12, 3]].forEach(([c, x, y, z, k]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  });
  scene.environment = pmrem.fromScene(env, .04).texture;
  scene.add(new THREE.HemisphereLight(0xbfdcff, 0x05070f, .6));

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.2, 'rgba(255,255,255,.45)'); r.addColorStop(.55, 'rgba(255,255,255,.08)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const glow = (color, s, o = 1) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.set(s, s, 1); return m; };
  const labelTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const run = () => { g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }; run(); if (document.fonts) document.fonts.ready.then(run); return t; };

  // ---------- Układ galerii ----------
  const GAP = 13, PW = 6.4, PHh = 4;
  const ZEND = -(N - 1) * GAP - 34;
  const slots = P.map((_, i) => { const s = i % 2 ? 1 : -1; return { s, x: s * 3.7, y: .2, z: -i * GAP, ry: -s * .34 }; });

  const frameVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  // Neonowa ramka: SDF zaokrąglonego prostokąta, gradient QF płynący po obwodzie
  const frameFS = `uniform float uT; uniform float uA; uniform float uH; uniform float uV; uniform vec2 uS; uniform vec2 uR; varying vec2 vUv;
    float sd(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.)) + min(max(q.x,q.y),0.) - r; }
    void main(){ vec2 p = (vUv - .5)*uS; float d = sd(p, uR, .22);
      float line = exp(-abs(d)*38.); float halo = exp(-max(d,0.)*3.2)*step(0.,d);
      float ang = atan(p.y, p.x); float flow = .55 + .45*sin(ang*2. - uT*1.6);
      vec3 c = mix(vec3(.23,.51,.96), vec3(.13,.83,.93), .5 + .5*sin(ang + uT*.8)); c = mix(c, vec3(.18,.83,.75), .5 + .5*sin(ang*3. - uT));
      float k = .25 + uA*.75 + uH*.6;
      float a = line*(.55 + .45*flow)*k*1.6 + halo*(.1 + uA*.35 + uH*.45)*flow;
      gl_FragColor = vec4(c*a*uV, 1.); }`;
  const glassVS = `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix*vec4(position,1.); vec4 mv = viewMatrix*w; vV = -mv.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*mv; }`;
  const glassFS = `uniform float uA; uniform float uV; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.4); vec3 c = vec3(.55,.8,1.)*(f*(.9 + uA*.8) + .02); gl_FragColor = vec4(c*uV, clamp(f*.7 + .04, 0., 1.)*uV); }`;
  const reflFS = `uniform sampler2D map; uniform float uO; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vec2(vUv.x, 1. - vUv.y)); float m = smoothstep(0., 1., vUv.y)*.32*uO; gl_FragColor = vec4(c.rgb*m, 1.); }`;

  const roundedShape = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const slabGeo = new THREE.ExtrudeGeometry(roundedShape(PW + .36, PHh + .36, .26), { depth: .16, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 3, curveSegments: 10 });
  slabGeo.translate(0, 0, -.14);
  const backGeo = new THREE.ShapeGeometry(roundedShape(PW + .3, PHh + .3, .24), 10);
  const screenGeo = new THREE.PlaneGeometry(PW, PHh);
  const FW = PW + 2.4, FH = PHh + 2.4;
  const frameGeo = new THREE.PlaneGeometry(FW, FH);
  const backMat = new THREE.MeshStandardMaterial({ color: 0x070a14, metalness: .85, roughness: .3 });

  const items = P.map((p, i) => {
    const sl = slots[i];
    const root = new THREE.Group(); root.position.set(sl.x, sl.y, sl.z); root.rotation.y = sl.ry; scene.add(root);
    const tilt = new THREE.Group(); root.add(tilt);
    const scr = makeScreen(p, i);
    const bMat = backMat.clone(); bMat.transparent = true; const back = new THREE.Mesh(backGeo, bMat); back.position.z = -.2; tilt.add(back);
    const frameMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uA: { value: 0 }, uH: { value: 0 }, uV: { value: 1 }, uS: { value: new THREE.Vector2(FW, FH) }, uR: { value: new THREE.Vector2(PW / 2 + .2, PHh / 2 + .2) } }, vertexShader: frameVS, fragmentShader: frameFS });
    const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.z = -.24; frame.renderOrder = 1; tilt.add(frame);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false, transparent: true }));
    screen.position.z = .02; screen.userData.i = i; tilt.add(screen);
    const glassMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uA: { value: 0 }, uV: { value: 1 } }, vertexShader: glassVS, fragmentShader: glassFS });
    const slab = new THREE.Mesh(slabGeo, glassMat); slab.renderOrder = 2; tilt.add(slab);
    // podpis nad panelem
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(PW, .5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, map: labelTex(1280, 100, (g, w, h) => {
      g.textAlign = 'left'; g.font = `600 40px ${FONT}`; g.textBaseline = 'middle'; g.fillStyle = '#7dd3fc'; g.fillText(`CASE 0${i + 1}`, 0, h / 2);
      const x0 = g.measureText(`CASE 0${i + 1}`).width + 28; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x0, h / 2 - 1, 40, 2);
      g.fillStyle = '#f1f5ff'; g.fillText(p.tag, x0 + 68, h / 2);
      g.textAlign = 'right'; g.fillStyle = '#7dd3fc'; g.fillText('↗', w - 4, h / 2);
    }) }));
    lab.position.set(0, PHh / 2 + .55, 0); tilt.add(lab);
    // odbicie na podłodze
    const refl = new THREE.Mesh(screenGeo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { map: { value: scr.tex }, uO: { value: 1 } }, vertexShader: frameVS, fragmentShader: reflFS }));
    // pozycję ustawia podłoga niżej
    root.add(refl);
    const halo = glow(new THREE.Color(p.acc), 9, .12); halo.position.z = -.8; root.add(halo);
    return { p, root, tilt, screen, bMat, lab, frameMat, glassMat, refl, halo, scr, a: 0, h: 0, rx: 0, ry: 0, vis: 1 };
  });

  // Podłoga: siatka linii i lustrzane odbicia
  const FLOOR = -2.9;
  items.forEach(it => { it.refl.position.y = 2 * FLOOR - it.root.position.y - it.root.position.y; it.refl.scale.y = 1; });
  const floorMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 } }, vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uT; varying vec3 vW; void main(){ vec2 g = abs(fract(vW.xz/2.) - .5)/fwidth(vW.xz/2.); float l = 1. - min(min(g.x,g.y),1.);
      float fade = smoothstep(26., 4., abs(vW.x)); float pulse = .5 + .5*sin(vW.z*.35 + uT*2.);
      vec3 c = mix(vec3(.13,.45,.95), vec3(.13,.83,.93), pulse); gl_FragColor = vec4(c*l*(.22 + pulse*.18)*fade, l*.5*fade); }` });
  floorMat.extensions = { derivatives: true };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 160), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR, ZEND / 2 + 10); scene.add(floor);
  const floorDark = new THREE.Mesh(new THREE.PlaneGeometry(90, 160), new THREE.MeshBasicMaterial({ color: 0x02030a, transparent: true, opacity: .55, depthWrite: false })); floorDark.rotation.x = -Math.PI / 2; floorDark.position.set(0, FLOOR - .01, ZEND / 2 + 10); scene.add(floorDark);

  // Portal QF na końcu galerii
  const portal = new THREE.Group(); portal.position.set(0, 2.4, ZEND); scene.add(portal);
  const ringMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uA: { value: 0 } }, vertexShader: frameVS,
    fragmentShader: `uniform float uT; uniform float uA; varying vec2 vUv; void main(){ float seg = step(.28, fract(vUv.x*96.)); float band = step(.18, vUv.y)*step(vUv.y, .82);
      float tri = step(.5, fract(vUv.x*48. + vUv.y*2.)); float flow = .6 + .4*sin(vUv.x*6.283*3. - uT*1.5);
      float edge = .75 + .25*smoothstep(.18, .5, abs(vUv.y - .5)); vec3 c = mix(vec3(.3,.62,1.), vec3(.72,.95,1.), (.5 + .5*flow)*tri + (1. - tri)*.35)*edge; float a = seg*band*(.7 + .3*flow)*(.75 + uA*.5);
      gl_FragColor = vec4(c*a*1.4, 1.); }` });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7.2, .55, 24, 220), ringMat); portal.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(8.6, .04, 8, 220), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); portal.add(ring2);
  const pGlow = glow(0x22d3ee, 34, .55); pGlow.position.z = -2; portal.add(pGlow);
  const pCore = glow(0x3b82f6, 14, .7); pCore.position.z = -1; portal.add(pCore);
  // Belka światła przez portal (jak w referencji)
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 60), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 } }, vertexShader: frameVS,
    fragmentShader: `uniform float uT; varying vec2 vUv; void main(){ float x = 1. - abs(vUv.x - .5)*2.; float a = pow(x, 3.)*smoothstep(0., .45, vUv.y)*(.75 + .25*sin(vUv.y*40. - uT*3.)); gl_FragColor = vec4(vec3(.55,.85,1.)*a*.8, 1.); }` }));
  beam.position.set(0, 30, -1.5); portal.add(beam);
  // Logo QF w środku portalu
  const emblem = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  new THREE.TextureLoader().load('/emblem-hero.webp', t => { t.colorSpace = THREE.SRGBColorSpace; emblem.material.map = t; emblem.material.needsUpdate = true; });
  emblem.material.opacity = .95; portal.add(emblem);

  // Galaktyka spiralna za portalem (rysowana proceduralnie, bez pliku graficznego)
  const galTex = (() => {
    const N2 = 2048, c = document.createElement('canvas'); c.width = c.height = N2; const g = c.getContext('2d');
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const C = N2 / 2;
    // poświata dysku
    let rg = g.createRadialGradient(C, C, 0, C, C, C * .95);
    rg.addColorStop(0, 'rgba(255,238,215,.16)'); rg.addColorStop(.08, 'rgba(230,220,230,.14)'); rg.addColorStop(.3, 'rgba(110,135,200,.12)'); rg.addColorStop(.65, 'rgba(50,70,140,.05)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, N2, N2);
    const pos = (spread, off = 0) => { const br = Math.floor(rnd() * 2), r = Math.pow(rnd(), .75) * C * .94 + 30; const th = br * Math.PI + Math.log(r / 40) * 1.5 + off + (rnd() - .5) * spread * (1.25 - r / C); return [C + Math.cos(th) * r + (rnd() - .5) * 30, C + Math.sin(th) * r + (rnd() - .5) * 30, r]; };
    const blob = (x, y, rad, col) => { const r2 = g.createRadialGradient(x, y, 0, x, y, rad); r2.addColorStop(0, col); r2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r2; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5200; i++) { const [x, y] = pos(1.1); blob(x, y, 14 + rnd() * 30, rnd() < .5 ? 'rgba(120,150,235,.05)' : 'rgba(175,195,250,.045)'); }
    for (let i = 0; i < 2600; i++) { const [x, y] = pos(.55); blob(x, y, 6 + rnd() * 12, 'rgba(200,218,255,.08)'); }
    for (let i = 0; i < 520; i++) { const [x, y] = pos(.5, .1); blob(x, y, 3 + rnd() * 7, rnd() < .7 ? 'rgba(255,120,190,.32)' : 'rgba(255,190,150,.26)'); }
    for (let i = 0; i < 7000; i++) { const [x, y] = pos(1.3); g.fillStyle = `rgba(225,235,255,${.25 + rnd() * .5})`; g.fillRect(x, y, rnd() < .9 ? 1 : 2, rnd() < .9 ? 1 : 2); }
    g.globalCompositeOperation = 'source-over';
    // ciemne pasy pyłu między ramionami
    for (let i = 0; i < 1600; i++) { const [x, y, r] = pos(.25, -.34); if (r > 90) blob(x, y, 12 + rnd() * 20, 'rgba(3,5,12,.10)'); }
    // pole gwiazd na całym tle
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(220,232,255,${.15 + rnd() * .55})`; g.fillRect(rnd() * N2, rnd() * N2, 1.4, 1.4); }
    g.globalCompositeOperation = 'lighter';
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const galMat = new THREE.MeshBasicMaterial({ map: galTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false, opacity: .35 });
  const galaxy = new THREE.Mesh(new THREE.PlaneGeometry(230, 230), galMat);
  galaxy.position.set(0, 2.4, ZEND - 52); galaxy.scale.y = .5; galaxy.rotation.z = -.12; scene.add(galaxy);
  // jasne gwiazdy z promieniami
  const flareTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(220,235,255,.5)'); r.addColorStop(1, 'rgba(200,220,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    [[128, 3], [3, 128]].forEach(([w, h]) => { const l = g.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(.5, 'rgba(255,255,255,.9)'); l.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(64 - w / 2, 64 - h / 2, w, h); });
    return new THREE.CanvasTexture(c);
  })();
  const flares = [[-26, 13, 1.8], [-20, 4, 1.2], [-17, 15, 1.4], [24, 9, 1.1], [19, 16, .9], [-30, -2, .8], [29, 3, 1]].map(([x, y, s]) => {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: 0xdcebff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 }));
    m.position.set(x, y, ZEND - 14); m.scale.setScalar(s * 2.4); m.userData.s = s; scene.add(m); return m;
  });

  // Gwiazdy i wirujące drobiny
  const STAR = 1800, sPos = new Float32Array(STAR * 3);
  for (let i = 0; i < STAR; i++) { sPos[i * 3] = (Math.random() - .5) * 160; sPos[i * 3 + 1] = Math.random() * 70 - 12; sPos[i * 3 + 2] = 30 - Math.random() * 170; }
  const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ size: .16, color: 0x9fdcff, transparent: true, opacity: .7, map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(stars);

  // Unoszące się szklane kostki
  const CUBES = 46;
  const cubeMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x0b1226, metalness: .9, roughness: .22, envMapIntensity: 1.4, transparent: true }), CUBES);
  const cubes = [];
  for (let i = 0; i < CUBES; i++) {
    const side = i % 2 ? 1 : -1;
    cubes.push({ x: side * (9 + Math.random() * 16), y: -1 + Math.random() * 12, z: 14 - Math.random() * (-ZEND + 20), s: .35 + Math.random() * 1.1, r: Math.random() * 6, v: (Math.random() - .5) * .5 });
  }
  scene.add(cubeMesh);
  const cubeEdge = new THREE.InstancedMesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false }), CUBES);
  scene.add(cubeEdge);
  const dummy = new THREE.Object3D();

  // ---------- Ujęcia kamery ----------
  let mobile = null, CAM;
  const nrm = i => new THREE.Vector3(Math.sin(slots[i].ry), 0, Math.cos(slots[i].ry));
  function layout() {
    const aspect = camera.aspect;
    CAM = [];
    if (mobile) {
      CAM.push([0, 5, 24, 0, -1.6, -26, 60]);
      slots.forEach((s, i) => {
        const n = nrm(i), fov = 50, hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * aspect);
        const d = (PW + .9) / 2 / Math.tan(hf / 2);
        CAM.push([s.x + n.x * d, s.y + .4 + n.y * d, s.z + n.z * d, s.x, s.y - 2.55, s.z, fov]);
      });
      CAM.push([0, -.4, ZEND + 34, 0, -.4, ZEND, 62]);
    } else {
      CAM.push([0, 4.6, 17, 0, -.6, -32, 48]);
      slots.forEach((s, i) => {
        const n = nrm(i);
        CAM.push([s.x + n.x * 11.8 - s.s * 1.2, s.y + .8, s.z + n.z * 11.8, s.x - s.s * 2.8, s.y - .1, s.z, 40]);
      });
      CAM.push([0, .5, ZEND + 27, 0, .5, ZEND, 46]);
    }
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    mobile = innerWidth < 760; layout();
  }
  resize(); addEventListener('resize', resize);

  let visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '200px 0px' }).observe(pin);
  new IntersectionObserver(e => document.body.classList.toggle('wrk-active', e[0].isIntersecting), { threshold: 0 }).observe(pin);

  // Najechanie: panel się przechyla i świeci
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, in: false };
  let hovered = -1, hu = 0, hv = 0;
  addEventListener('pointermove', e => {
    mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5;
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    mouse.in = e.target === canvas;
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { mouse.in = false; });
  canvas.addEventListener('click', () => {
    if (hovered < 0) return;
    const top = pin.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + KEYS[hovered + 1] * (pin.offsetHeight - innerHeight), behavior: 'smooth' });
  });

  const cam = new THREE.Vector3(), look = new THREE.Vector3(), camT = new THREE.Vector3(), lookT = new THREE.Vector3();
  let fov = 46, last = -1, first = true, prevT = 0, frame = 0;
  const clock = new THREE.Clock();
  const screens = items.map(it => it.screen);

  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    frame++;
    const t = reduce ? 0 : clock.getElapsedTime(), dt = Math.min(.05, t - prevT); prevT = t;
    const r = pin.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    let seg = 0;
    for (let i = 0; i < KEYS.length - 1; i++) {
      const a = KEYS[i] + .025, b = KEYS[i + 1] - .025;
      if (p >= b) seg = i + 1; else if (p > a) { seg = i + ease((p - a) / (b - a)); break; } else { seg = i; break; }
    }
    const i0 = Math.min(KEYS.length - 2, Math.floor(seg)), f = seg - i0;
    const A = CAM[i0], B = CAM[i0 + 1];
    const arc = Math.sin(f * Math.PI);
    const enter = ease(clamp((-r.top + innerHeight) / innerHeight));
    camT.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f + arc * .9, A[2] + (B[2] - A[2]) * f + arc * 2.2 + (1 - enter) * 10);
    lookT.set(A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f, A[5] + (B[5] - A[5]) * f);
    const fovT = A[6] + (B[6] - A[6]) * f + arc * 4;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camT.x += mouse.x * (mobile ? .2 : .9); camT.y -= mouse.y * .5;
    if (first) { cam.copy(camT); look.copy(lookT); fov = fovT; first = false; }
    const kl = 1 - Math.exp(-dt * 5.2); cam.lerp(camT, kl); look.lerp(lookT, kl); fov += (fovT - fov) * kl;
    camera.position.copy(cam); camera.lookAt(look);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // hover
    hovered = -1;
    if (mouse.in && !mobile) {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(screens, false)[0];
      if (hit) { hovered = hit.object.userData.i; hu = hit.uv.x - .5; hv = hit.uv.y - .5; }
    }
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';

    const stage = Math.round(seg);
    const wide = Math.max(clamp(1 - seg), clamp(seg - N));
    items.forEach((it, i) => {
      const act = clamp(1 - Math.abs(seg - (1 + i)) * 1.2);
      it.a += (Math.max(act, wide * .35) - it.a) * .08;
      const hv0 = hovered === i ? 1 : 0;
      it.h += (hv0 - it.h) * .1;
      const trx = hovered === i ? -hv * .32 : 0, tryy = hovered === i ? hu * .42 : 0;
      it.rx += (trx - it.rx) * .1; it.ry += (tryy - it.ry) * .1;
      it.tilt.rotation.set(it.rx + Math.sin(t * .6 + i) * .012, it.ry + Math.sin(t * .4 + i * 2) * .02, 0);
      it.tilt.position.y = Math.sin(t * .8 + i * 1.3) * .08;
      const sc = 1 + it.h * .04; it.tilt.scale.setScalar(sc);
      it.frameMat.uniforms.uT.value = t; it.frameMat.uniforms.uA.value = it.a; it.frameMat.uniforms.uH.value = it.h;
      it.glassMat.uniforms.uA.value = it.a + it.h;
      // panele tuż przed kamerą lub za nią gasną, żeby nie zasłaniały kadru
      const vis = clamp((cam.z - it.root.position.z - 3.5) / 3);
      it.vis = vis; it.root.visible = vis > .01;
      it.screen.material.opacity = vis; it.bMat.opacity = vis; it.lab.material.opacity = vis;
      it.screen.material.depthWrite = it.bMat.depthWrite = vis > .98;
      it.refl.material.uniforms.uO.value = vis;
      it.frameMat.uniforms.uV.value = vis; it.glassMat.uniforms.uV.value = vis;
      it.halo.material.opacity = (.08 + it.a * .22 + it.h * .2) * vis;
      // aktualizacja żywego podglądu: aktywny co klatkę, pozostałe rzadziej
      const near = Math.abs(seg - (1 + i)) < 1.4 || it.h > .05;
      if (!reduce && (near ? frame % 2 === 0 : frame % 8 === i % 8)) it.scr.draw(t);
    });
    floorMat.uniforms.uT.value = t;
    const pa = clamp(seg - (N - .6));
    ringMat.uniforms.uT.value = t; ringMat.uniforms.uA.value = pa;
    beam.material.uniforms.uT.value = t;
    ring.rotation.z = t * .05; ring2.rotation.z = -t * .03;
    pGlow.material.opacity = .4 + pa * .35;
    galMat.opacity = .25 + pa * .75; galaxy.rotation.z = -.12 + Math.sin(t * .05) * .03;
    cubeMesh.material.opacity = 1 - pa; cubeEdge.material.opacity = .14 * (1 - pa); cubeMesh.visible = cubeEdge.visible = pa < .98;
    flares.forEach((m, i) => { m.material.opacity = pa * (.75 + .25 * Math.sin(t * 1.3 + i * 2)); }); emblem.rotation.z = Math.sin(t * .3) * .05;
    stars.rotation.y = Math.sin(t * .02) * .02;
    cubes.forEach((c, i) => {
      dummy.position.set(c.x, c.y + Math.sin(t * .4 + i) * .4, c.z); dummy.rotation.set(c.r + t * c.v, c.r * 1.3 + t * c.v * .7, 0); dummy.scale.setScalar(c.s); dummy.updateMatrix();
      cubeMesh.setMatrixAt(i, dummy.matrix); cubeEdge.setMatrixAt(i, dummy.matrix);
    });
    cubeMesh.instanceMatrix.needsUpdate = true; cubeEdge.instanceMatrix.needsUpdate = true;

    panels.forEach(el => {
      const k = +el.dataset.k;
      const o = clamp(1 - Math.abs(seg - k) * 2.4) * (k === 0 ? clamp(enter * 1.5 - .2) : 1);
      el.style.opacity = o;
      el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.visibility = o > .01 ? 'visible' : 'hidden';
      el.classList.toggle('live', o > .5);
    });
    if (stage !== last) {
      last = stage; counter.textContent = '0' + stage;
      dots.forEach((d, i) => d.classList.toggle('on', i === stage));
    }
    bar.style.transform = `scaleX(${p})`;
    renderer.render(scene, camera);
  })();
}
