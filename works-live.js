// Ożywione grafiki w sekcji „Realizacje”: efekty dorysowywane na ekranach paneli z works.js.
// Działa przez nakładkę na drawImage: gdy works.js rysuje grafikę projektu, zaraz po niej rysujemy jej animację.
// Ożywienie grafik projektów: efekty rysowane na wierzchu, we współrzędnych pliku 820×406
const TAU = Math.PI * 2;
const along = (pts, u) => { // punkt na łamanej dla u w [0,1]
  let L = 0; const seg = []; for (let k = 1; k < pts.length; k++) { const d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); seg.push(d); L += d; }
  let s = u * L; for (let k = 0; k < seg.length; k++) { if (s <= seg[k]) { const f = s / seg[k]; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]; } s -= seg[k]; }
  return pts[pts.length - 1];
};
const dot = (g, x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
const trail = (g, pts, u, col, len = .18, w = 1.6) => { // świecący impuls biegnący po linii
  for (let k = 0; k < 10; k++) { const v = u - k * len / 10; if (v < 0 || v > 1) continue; const [x, y] = along(pts, v); dot(g, x, y, w * (3 - k * .22), col.replace('A', (.9 - k * .085).toFixed(2))); }
};
const sweep = (g, t, y, h, sp = 160) => { const sx = -200 + ((t * sp) % 1300); const tg = g.createLinearGradient(sx - 60, 0, sx + 60, 0); tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(.5, 'rgba(200,240,255,.22)'); tg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = tg; g.fillRect(sx - 60, y, 120, h); };
const button = (g, t, x, y, r) => {
  g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.lineDashOffset = -t * 18;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.setLineDash([]);
  const pr = (t * .6) % 1; g.strokeStyle = `rgba(120,220,255,${(.5 * (1 - pr)).toFixed(3)})`; g.beginPath(); g.arc(x, y, r - 2 + pr * 18, 0, TAU); g.stroke();
};
const dust = (g, t, W, H) => { for (let k = 0; k < 26; k++) { const x = (k * 97.3 + t * (6 + k % 4)) % W, y = (k * 53.1 - t * (3 + k % 3) * 2 + 999) % H; g.fillStyle = `rgba(180,220,255,${(.18 + .18 * Math.sin(t * 2 + k)).toFixed(3)})`; g.fillRect(x, y, 1.2, 1.2); } };
const twinkle = (g, t, x, y, k, s = 1) => { const a = Math.max(0, Math.sin(t * 2.3 + k * 1.9)); if (a < .05) return; const r = (3 + 3 * a) * s; g.fillStyle = `rgba(255,255,255,${(.85 * a).toFixed(3)})`; g.fillRect(x - r, y - .4, r * 2, .8); g.fillRect(x - .4, y - r, .8, r * 2); dot(g, x, y, r * .9, `rgba(220,245,255,${(.6 * a).toFixed(3)})`); };
// wspólny układ grafik 720×352 (Nova, Volt, Aura, Aurum): panele po bokach, przycisk w prawym dolnym rogu
const tpl720 = (g, t, acc) => {
  // proces: zapalające się kroki i impulsy
  trail(g, [[147, 221], [262, 221]], (t * .35) % 1.15, acc.replace('A', 'A'), .3, 1.3);
  [147, 176, 205, 233, 262].forEach((x, k) => { if ((Math.floor(t * 2) % 5) === k) dot(g, x, 219, 9, 'rgba(120,230,255,.55)'); });
  // harmonogram: suwaki, linia „dziś”, kaskada zadań
  [[440, 469], [480, 513], [520, 575]].forEach(([a, b], k) => { const u = (t * .35 + k * .3) % 1; dot(g, a + (b - a) * u, 103, 4, 'rgba(140,255,220,.7)'); });
  const lx = 460 + ((t * 22) % 120); g.fillStyle = 'rgba(140,255,220,.35)'; g.fillRect(lx, 120, 1, 45); dot(g, lx, 120, 4, 'rgba(140,255,220,.7)');
  trail(g, [[462, 131], [510, 131], [510, 141], [525, 146], [545, 152], [560, 157], [578, 161]], (t * .3) % 1, 'rgba(120,255,200,A)', .3, 1.3);
  // analityka
  trail(g, [[470, 218], [480, 217], [490, 215], [500, 213], [505, 212], [515, 213], [525, 214], [535, 214], [545, 216]], (t * .35 + .5) % 1, 'rgba(180,240,255,A)', .3, 1.2);
  g.strokeStyle = 'rgba(120,230,255,.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(481, 251, 8, t * 2.4, t * 2.4 + 1.6); g.stroke();
  sweep(g, t, 40, 24, 140);
  button(g, t, 634, 301, 31);
  dust(g, t, 720, 352);
};
// Aurum: tło spod pierścionka (żeby można go było obracać) i pierścionek rysowany w 3D
const ringPatch = new Image(); ringPatch.src = 'data:image/webp;base64,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';
function drawRing(g, t, cx, cy, R) {
  const th = t * 1.25, ca = Math.cos(th), sa = Math.sin(th), tilt = .22, ct = Math.cos(tilt), st = Math.sin(tilt);
  const P3 = (x, y, z) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [cx + x1, cy - (y * ct - z1 * st), y * st + z1 * ct]; };
  const L = [-.45, .55, .7];
  const segs = [];
  for (let k = 0; k < 72; k++) {
    const f0 = k / 72 * TAU, f1 = (k + 1) / 72 * TAU, fm = (f0 + f1) / 2;
    if (Math.abs(Math.sin(fm) - 1) < .02) continue;
    [-2.6, 0, 2.6].forEach(off => { // dwie szyny obrączki i różowe złoto między nimi
      const a = P3(R * Math.cos(f0), R * Math.sin(f0), off), b = P3(R * Math.cos(f1), R * Math.sin(f1), off);
      const nx = Math.cos(fm) * ca, nz = -Math.cos(fm) * sa, ny = Math.sin(fm);
      const sh = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      segs.push({ a, b, z: (a[2] + b[2]) / 2 + (off === 0 ? .01 : 0), sh, fm, rose: off === 0 });
    });
  }
  const head = P3(0, R + 6, 0);
  const drawSeg = s => {
    const v = .2 + .8 * s.sh, sp = Math.pow(s.sh, 10) * 90;
    const r = s.rose ? 150 + 95 * v + sp : 95 + 150 * v + sp, gg = s.rose ? 95 + 90 * v + sp : 100 + 145 * v + sp, b = s.rose ? 80 + 80 * v + sp : 108 + 140 * v + sp;
    g.strokeStyle = `rgb(${Math.min(255, r) | 0},${Math.min(255, gg) | 0},${Math.min(255, b) | 0})`; g.lineWidth = s.rose ? 1.6 : 3.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s.a[0], s.a[1]); g.lineTo(s.b[0], s.b[1]); g.stroke();
  };
  g.globalCompositeOperation = 'lighter'; dot(g, cx, cy + R + 8, R * 1.4, 'rgba(120,240,255,.18)'); g.globalCompositeOperation = 'source-over';
  segs.filter(s => s.z < 0).sort((p, q) => p.z - q.z).forEach(drawSeg);
  // oprawa: aureola małych kamieni wokół dużego brylantu
  const halo = [];
  for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; halo.push(P3(Math.cos(a) * 13, R + 3, Math.sin(a) * 13)); }
  halo.filter(p => p[2] < 0).forEach(p => { g.fillStyle = 'rgba(200,215,230,.9)'; g.beginPath(); g.arc(p[0], p[1], 2.3, 0, TAU); g.fill(); });
  // brylant: korona, rondysta i pawilon z fasetami obracającymi się razem z pierścionkiem
  const hx = head[0], hy = head[1] - 4, gw = 11, tw = 6.5, ch = 6, ph = 10;
  const dg = g.createLinearGradient(hx - gw, hy - ch, hx + gw, hy + ph);
  dg.addColorStop(0, '#f4fbff'); dg.addColorStop(.35, '#cfe3f2'); dg.addColorStop(.55, '#ffffff'); dg.addColorStop(.8, '#9dbcd2'); dg.addColorStop(1, '#e8f4ff');
  g.fillStyle = dg; g.beginPath(); g.moveTo(hx - tw, hy - ch); g.lineTo(hx + tw, hy - ch); g.lineTo(hx + gw, hy); g.lineTo(hx, hy + ph); g.lineTo(hx - gw, hy); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(110,140,165,.75)'; g.lineWidth = .5; g.stroke();
  g.beginPath(); g.moveTo(hx - gw, hy); g.lineTo(hx + gw, hy); g.stroke();
  for (let k = 0; k < 8; k++) { const a = th + k * Math.PI / 4, c = Math.cos(a); if (Math.sin(a) < 0) continue;
    g.strokeStyle = `rgba(120,150,175,${(.35 + .4 * Math.sin(a)).toFixed(2)})`;
    g.beginPath(); g.moveTo(hx + c * tw, hy - ch); g.lineTo(hx + c * gw, hy); g.lineTo(hx, hy + ph); g.stroke(); }
  // krapy
  for (let k = 0; k < 4; k++) { const a = th + Math.PI / 4 + k * Math.PI / 2; if (Math.sin(a) < -.1) continue; const x = hx + Math.cos(a) * gw * .92;
    g.strokeStyle = 'rgb(225,225,232)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, hy + 3); g.lineTo(hx + Math.cos(a) * tw * 1.05, hy - ch - .8); g.stroke(); }
  halo.filter(p => p[2] >= 0).forEach(p => { g.fillStyle = 'rgba(248,252,255,1)'; g.beginPath(); g.arc(p[0], p[1], 2.5, 0, TAU); g.fill(); g.strokeStyle = 'rgba(150,170,190,.8)'; g.lineWidth = .5; g.stroke(); });
  segs.filter(s => s.z >= 0).sort((p, q) => p.z - q.z).forEach(drawSeg);
  // drobne kamienie na przedniej szynie
  g.globalCompositeOperation = 'lighter';
  segs.forEach((s, k) => { if (s.z > 2 && k % 6 === 0 && Math.sin(s.fm) > -.2) { const a = Math.max(0, Math.sin(t * 4 + k)); if (a > .6) dot(g, s.a[0], s.a[1], 3, `rgba(255,255,255,${(a - .6).toFixed(2)})`); } });
  twinkle(g, t, head[0] + 3, head[1] - 9, 0, 1.6); twinkle(g, t * 1.3, head[0] - 5, head[1] - 3, 2, 1.1);
  g.globalCompositeOperation = 'source-over';
}
const LIVE = {
  aurum(g, t) {
    const s = 720 / 1024;
    if (ringPatch.complete && ringPatch.naturalWidth) g.drawImage(ringPatch, 440 * s, 126 * s, 146 * s, 178 * s);
    drawRing(g, t, 360, 162, 31);
    g.globalCompositeOperation = 'lighter';
    // grawer: połysk przesuwający się po złotej płytce
    const gx = 214 + ((t * 30) % 70);
    const gr = g.createLinearGradient(gx - 10, 0, gx + 10, 0); gr.addColorStop(0, 'rgba(255,230,160,0)'); gr.addColorStop(.5, 'rgba(255,240,190,.55)'); gr.addColorStop(1, 'rgba(255,230,160,0)');
    g.fillStyle = gr; g.fillRect(gx - 10, 117, 20, 19);
    [[160, 108], [172, 120], [152, 128]].forEach(([x, y], k) => twinkle(g, t, x, y, k * 2, .8));
    [[140, 190], [210, 260]].forEach(([a, b], k) => { const u = (t * .4 + k * .5) % 1; dot(g, a + (b - a) * u, 149, 4, 'rgba(255,230,170,.7)'); });
    // fale na wodzie pod pierścionkiem
    for (let k = 0; k < 3; k++) { const pr = (t * .35 + k / 3) % 1; g.strokeStyle = `rgba(140,250,255,${(.35 * (1 - pr)).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(360, 196, 20 + pr * 55, (20 + pr * 55) * .3, 0, 0, TAU); g.stroke(); }
    tpl720(g, t, 'rgba(255,220,150,A)');
    g.globalCompositeOperation = 'source-over';
  },
  aura(g, t, shot) {
    // wirtualny spacer: zdjęcie pokoju w panelu „przybliża się” jak kamera idąca przez wnętrze
    if (shot) {
      const cyc = (t % 6) / 6, z = 1 + cyc * .55, bob = Math.sin(t * 5) * .6;
      const k = shot.width / 720, W = 68 / z, H = 43 / z, cxp = 166 + Math.sin(t * .4) * 6 * (z - 1), cyp = 118 + bob;
      g.save(); g.globalAlpha = cyc > .9 ? (1 - cyc) * 10 : cyc < .08 ? cyc / .08 : 1;
      g.drawImage(shot, (cxp - W / 2) * k, (cyp - H / 2) * k, W * k, H * k, 132, 97, 68, 43); g.restore();
    }
    g.globalCompositeOperation = 'lighter';
    // rzut: punkt „tu jesteś” z polem widzenia
    const pa = t * .7, px = 233 + Math.cos(pa) * 16, py = 117 + Math.sin(pa) * 8, dir = pa + Math.PI / 2;
    g.fillStyle = 'rgba(120,240,255,.22)'; g.beginPath(); g.moveTo(px, py); g.arc(px, py, 14, dir - .45, dir + .45); g.closePath(); g.fill();
    dot(g, px, py, 5, 'rgba(160,250,255,.9)');
    [[140, 175], [210, 260]].forEach(([a, b], k) => { const u = (t * .4 + k * .5) % 1; dot(g, a + (b - a) * u, 149, 4, 'rgba(140,255,230,.7)'); });
    // makieta hotelu: spacer wokół basenu, punkty widokowe, fale na wodzie
    const wa = t * .45, wx = 355 + Math.cos(wa) * 70, wy = 205 + Math.sin(wa) * 30, wd = Math.atan2(Math.cos(wa) * 30, -Math.sin(wa) * 70);
    g.fillStyle = 'rgba(140,240,255,.2)'; g.beginPath(); g.moveTo(wx, wy); g.arc(wx, wy, 22, wd - .5, wd + .5); g.closePath(); g.fill();
    for (let k = 1; k < 8; k++) { const b = wa - k * .09; dot(g, 355 + Math.cos(b) * 70, 205 + Math.sin(b) * 30, 3, `rgba(160,250,255,${(.5 - k * .06).toFixed(2)})`); }
    dot(g, wx, wy, 7, 'rgba(180,255,255,.9)');
    [[318, 125], [352, 112], [392, 128], [340, 158]].forEach(([x, y], k) => {
      const pr = (t * .5 + k * .25) % 1; g.strokeStyle = `rgba(233,184,114,${(.75 * (1 - pr)).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 2 + pr * 8, 0, TAU); g.stroke();
      dot(g, x, y, 4, 'rgba(255,215,150,.8)');
    });
    for (let k = 0; k < 3; k++) { const pr = (t * .3 + k / 3) % 1; g.strokeStyle = `rgba(150,250,255,${(.3 * (1 - pr)).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(352, 212, 15 + pr * 50, (15 + pr * 50) * .38, 0, 0, TAU); g.stroke(); }
    tpl720(g, t, 'rgba(255,215,150,A)');
    g.globalCompositeOperation = 'source-over';
  },
  nova(g, t) {
    g.globalCompositeOperation = 'lighter';
    // wybór mieszkania: pulsujące zaznaczenie i skan rzutu
    dot(g, 152, 117, 26, `rgba(60,255,140,${(.16 + .14 * Math.sin(t * 2.4)).toFixed(3)})`);
    const px = 206 + ((t * 24) % 66); g.fillStyle = 'rgba(140,240,255,.35)'; g.fillRect(px, 96, 1.2, 48); dot(g, px, 120, 10, 'rgba(140,240,255,.18)');
    [[140, 165], [210, 260]].forEach(([a, b], k) => { const u = (t * .4 + k * .5) % 1; dot(g, a + (b - a) * u, 149, 4, 'rgba(140,255,230,.7)'); });
    // makieta osiedla: zapalające się okna, skan i znacznik wybranego mieszkania
    for (let k = 0; k < 60; k++) {
      const x = 285 + (k * 73.7) % 140, y = 100 + (k * 41.3) % 150, a = Math.sin(t * (.6 + (k % 5) * .2) + k * 2.7);
      if (a > .55) { g.fillStyle = `rgba(255,220,140,${((a - .55) * 1.8).toFixed(3)})`; g.fillRect(x, y, 1.6, 1.6); dot(g, x + .8, y + .8, 3, `rgba(255,200,120,${((a - .55) * .8).toFixed(3)})`); }
    }
    const sy = 95 + ((t * 40) % 190);
    const sg = g.createLinearGradient(0, sy - 12, 0, sy + 12); sg.addColorStop(0, 'rgba(34,211,238,0)'); sg.addColorStop(.5, 'rgba(120,230,255,.16)'); sg.addColorStop(1, 'rgba(34,211,238,0)');
    g.fillStyle = sg; g.fillRect(280, sy - 12, 150, 24);
    const by = 160 + Math.sin(t * 2.2) * 4;
    const pr = (t * .7) % 1; g.strokeStyle = `rgba(60,255,160,${(.7 * (1 - pr)).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(362, 182, 6 + pr * 18, (6 + pr * 18) * .45, 0, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(60,255,160,.4)'; g.fillRect(361.5, by + 6, 1, 182 - by - 6);
    dot(g, 362, by, 10, 'rgba(60,255,160,.55)'); g.fillStyle = 'rgba(220,255,235,.95)'; g.beginPath(); g.arc(362, by, 2.6, 0, TAU); g.fill();
    tpl720(g, t, 'rgba(120,230,255,A)');
    g.globalCompositeOperation = 'source-over';
  },
  volt(g, t) {
    // konfigurator: zmiana koloru lakieru (na głównym aucie i miniaturze)
    const cols = ['rgba(220,40,40,', 'rgba(40,90,240,', 'rgba(200,200,215,', 'rgba(20,200,160,'];
    const ph = (t / 3) % cols.length, ci = Math.floor(ph), fr = ph - ci;
    const mix = Math.min(1, Math.max(0, (fr - .8) / .2));
    g.save(); g.globalCompositeOperation = 'hue';
    [[ci, 1 - mix], [(ci + 1) % cols.length, mix]].forEach(([c, a]) => { if (a < .02) return;
      g.fillStyle = cols[c] + (.85 * a).toFixed(3) + ')';
      g.beginPath(); g.ellipse(352, 168, 62, 30, -.32, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(166, 112, 34, 16, -.2, 0, TAU); g.fill(); });
    g.restore();
    g.globalCompositeOperation = 'lighter';
    // wybrany kolor na palecie
    const sw = [139, 163, 188, 200][ci]; g.strokeStyle = 'rgba(140,240,255,.9)'; g.lineWidth = 1; g.strokeRect(sw - 7, 129, 14, 11);
    [[140, 165], [210, 260]].forEach(([a, b], k) => { const u = (t * .4 + k * .5) % 1; dot(g, a + (b - a) * u, 149, 4, 'rgba(140,255,230,.7)'); });
    const px = 206 + ((t * 24) % 66); g.fillStyle = 'rgba(140,240,255,.35)'; g.fillRect(px, 100, 1.2, 42);
    // auto: błysk światła wzdłuż karoserii, reflektory, obrotowy pierścień platformy
    const u = (t * .32) % 1.4;
    trail(g, [[292, 182], [320, 170], [350, 160], [380, 150], [410, 140], [428, 135]], u, 'rgba(230,245,255,A)', .35, 2.2);
    const hl = .5 + .5 * Math.sin(t * 3);
    dot(g, 296, 178, 12, `rgba(200,235,255,${(.25 + .3 * hl).toFixed(3)})`);
    dot(g, 296, 178, 4, `rgba(255,255,255,${(.5 + .4 * hl).toFixed(3)})`);
    g.strokeStyle = 'rgba(80,200,255,.5)'; g.lineWidth = 1.2; g.setLineDash([10, 8]); g.lineDashOffset = -t * 30;
    g.beginPath(); g.ellipse(360, 196, 92, 34, -.28, 0, TAU); g.stroke(); g.setLineDash([]);
    const a0 = t * 1.1; dot(g, 360 + Math.cos(a0) * 92 * Math.cos(-.28) - Math.sin(a0) * 34 * Math.sin(-.28), 196 + Math.cos(a0) * 92 * Math.sin(-.28) + Math.sin(a0) * 34 * Math.cos(-.28), 8, 'rgba(120,220,255,.8)');
    dot(g, 360, 200, 80, `rgba(40,140,255,${(.06 + .05 * Math.sin(t * 1.6)).toFixed(3)})`);
    tpl720(g, t, 'rgba(120,230,255,A)');
    g.globalCompositeOperation = 'source-over';
  },
  medora(g, t) {
    g.globalCompositeOperation = 'lighter';
    // przed/po: linia porównania przesuwa się po zdjęciu „po”, na zębach błyski
    const cx = 232 + ((t * 26) % 80);
    const cg = g.createLinearGradient(cx - 8, 0, cx + 8, 0); cg.addColorStop(0, 'rgba(45,212,191,0)'); cg.addColorStop(.5, 'rgba(160,255,240,.45)'); cg.addColorStop(1, 'rgba(45,212,191,0)');
    g.fillStyle = cg; g.fillRect(cx - 8, 106, 16, 59);
    [[255, 128], [268, 133], [282, 131], [296, 126]].forEach(([x, y], k) => twinkle(g, t, x, y, k, .8));
    [[150, 207], [233, 287]].forEach(([a, b], k) => { const u = (t * .4 + k * .5) % 1; dot(g, a + (b - a) * u, 169, 4, 'rgba(120,255,230,.7)'); });
    // model szczęki: hologramowy skan i błyski na zębach
    const sy = 95 + ((t * 45) % 230);
    const sg = g.createLinearGradient(0, sy - 14, 0, sy + 14); sg.addColorStop(0, 'rgba(45,212,191,0)'); sg.addColorStop(.5, 'rgba(120,240,255,.2)'); sg.addColorStop(1, 'rgba(45,212,191,0)');
    g.fillStyle = sg; g.fillRect(318, sy - 14, 166, 28);
    g.fillStyle = 'rgba(160,250,255,.5)'; g.fillRect(318, sy - .5, 166, 1);
    [[345, 192], [372, 190], [396, 184], [420, 180], [440, 177], [463, 176], [355, 230], [378, 236], [400, 238], [425, 240], [450, 236], [470, 233]].forEach(([x, y], k) => twinkle(g, t, x, y, k * 1.3, .9));
    dot(g, 400, 210, 110, `rgba(45,212,191,${(.05 + .04 * Math.sin(t * 1.3)).toFixed(3)})`);
    // harmonogram: skan wierszy, migające gabinety, impuls po wykresie
    const row = Math.floor(t * 3) % 6, ry = 118 + row * 10.6;
    g.fillStyle = 'rgba(34,211,238,.16)'; g.fillRect(510, ry - 4, 62, 8);
    [[622, 110], [636, 110], [650, 108], [634, 147], [649, 147], [651, 125], [642, 137]].forEach(([x, y], k) => { if (Math.sin(t * 1.7 + k * 2.1) > .2) dot(g, x, y, 6, 'rgba(60,255,200,.5)'); });
    trail(g, [[590, 178], [600, 171], [605, 170], [610, 168], [616, 171], [620, 171], [625, 165], [630, 162], [636, 163], [640, 168], [643, 170], [648, 174], [662, 176]], (t * .3) % 1, 'rgba(90,255,200,A)', .3, 1.3);
    // asystent AI: impulsy między krokami procesu
    [[[167, 253], [290, 253]], [[204, 258], [204, 282]], [[221, 258], [221, 282]], [[248, 258], [248, 282]]].forEach((f, k) => trail(g, f, (t * .45 + k * .31) % 1.2, 'rgba(120,230,255,A)', .25, 1.2));
    [[167, 248], [204, 248], [240, 248], [272, 248], [290, 248]].forEach(([x, y], k) => { const on = (Math.floor(t * 2) % 5) === k; if (on) dot(g, x, y, 9, 'rgba(120,240,255,.55)'); });
    // analityka pacjentów
    trail(g, [[536, 247], [545, 246], [552, 247], [558, 246], [563, 245], [570, 242], [576, 243], [582, 241], [588, 238], [592, 241], [598, 244], [609, 245]], (t * .35 + .5) % 1, 'rgba(180,240,255,A)', .3, 1.2);
    g.strokeStyle = 'rgba(120,240,230,.8)'; g.lineWidth = 1.6; g.beginPath(); g.arc(548, 288, 8, t * 2.4, t * 2.4 + 1.6); g.stroke();
    dot(g, 512, 272, 10, `rgba(120,240,255,${(.25 + .2 * Math.sin(t * 2)).toFixed(3)})`);
    sweep(g, t, 40, 36);
    button(g, t, 734, 343, 35);
    dust(g, t, 820, 400);
    g.globalCompositeOperation = 'source-over';
  },
  ogien(g, t) {
    g.globalCompositeOperation = 'lighter';
    // ogień: migotanie płomieni i unoszące się iskry
    const fl = .55 + .25 * Math.sin(t * 9.3) + .15 * Math.sin(t * 23.7 + 1) + .1 * Math.sin(t * 4.1);
    dot(g, 236, 108, 62, `rgba(255,120,30,${(.34 * fl).toFixed(3)})`);
    dot(g, 228, 96, 30, `rgba(255,190,90,${(.4 * fl).toFixed(3)})`);
    dot(g, 205, 132, 40, `rgba(255,90,20,${(.12 + .08 * Math.sin(t * 6)).toFixed(3)})`);
    for (let k = 0; k < 52; k++) {
      const life = (t * (.32 + (k % 5) * .05) + k * .1379) % 1;
      const x = 196 + (k * 37) % 76 + Math.sin(t * 2.2 + k * 1.7) * 7 * life, y = 122 - life * (70 + (k % 4) * 12);
      if (y < 84) continue;
      const a = Math.sin(life * Math.PI) * (.55 + .45 * Math.sin(t * 15 + k));
      g.fillStyle = `rgba(255,${150 + (k % 3) * 35},60,${(a * .9).toFixed(3)})`; g.beginPath(); g.arc(x, y, .9 + (k % 3) * .5, 0, TAU); g.fill();
    }
    // ręka: oddychająca poświata i błysk przesuwający się w dół
    dot(g, 412, 230, 150, `rgba(120,200,255,${(.07 + .05 * Math.sin(t * 1.2)).toFixed(3)})`);
    const hy = 60 + ((t * 55) % 420);
    const hg = g.createLinearGradient(0, hy - 18, 0, hy + 18); hg.addColorStop(0, 'rgba(160,220,255,0)'); hg.addColorStop(.5, 'rgba(160,220,255,.16)'); hg.addColorStop(1, 'rgba(160,220,255,0)');
    g.fillStyle = hg; g.fillRect(335, hy - 18, 165, 36);
    // przewody od ręki do paneli: impulsy danych
    const wires = [[[332, 272], [318, 188], [286, 188]], [[468, 176], [489, 146], [506, 146]], [[460, 236], [506, 236]]];
    wires.forEach((w, k) => trail(g, w, ((t * .55 + k * .37) % 1.3), 'rgba(110,220,255,A)', .25, 1.4));
    // panel rezerwacji: skan wierszy i migające stoliki na planie sali
    const row = Math.floor(t * 3) % 6, ry = 112 + row * 11.6;
    g.fillStyle = 'rgba(34,211,238,.14)'; g.fillRect(522, ry - 4, 76, 8);
    [[624, 104], [648, 118], [668, 106], [640, 138], [681, 132], [660, 146]].forEach(([x, y], k) => {
      const on = Math.sin(t * 1.7 + k * 2.1) > .2; if (on) dot(g, x, y, 7, 'rgba(60,255,140,.45)');
    });
    const chart = [[613, 178], [620, 170], [626, 168], [631, 169], [636, 172], [641, 172], [645, 170], [650, 163], [655, 161], [663, 162], [668, 168], [672, 172], [675, 175], [687, 175]];
    trail(g, chart, (t * .3) % 1, 'rgba(90,255,160,A)', .3, 1.3);
    // analityka: impuls po wykresie, obracający się wskaźnik
    const wave = [[551, 251], [557, 252], [562, 254], [566, 253], [572, 254], [578, 251], [584, 251], [590, 249], [596, 249], [600, 250], [606, 250], [611, 248], [617, 250], [623, 252], [632, 251]];
    trail(g, wave, (t * .35 + .5) % 1, 'rgba(180,230,255,A)', .3, 1.2);
    g.strokeStyle = 'rgba(120,220,255,.75)'; g.lineWidth = 1.6; g.beginPath(); g.arc(562, 296, 9, t * 2.4, t * 2.4 + 1.6); g.stroke();
    // schemat procesu: impulsy po ścieżkach
    const flows = [[[150, 250], [240, 250], [240, 262], [262, 262]], [[205, 262], [205, 285], [238, 290]], [[238, 290], [262, 280], [287, 262]], [[152, 262], [152, 300], [230, 302]]];
    flows.forEach((f, k) => trail(g, f, (t * .45 + k * .29) % 1.2, 'rgba(120,200,255,A)', .22, 1.2));
    // tytuł: przesuwający się połysk
    const sx = -200 + ((t * 160) % 1300);
    const tg = g.createLinearGradient(sx - 60, 0, sx + 60, 0); tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(.5, 'rgba(200,240,255,.22)'); tg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = tg; g.fillRect(sx - 60, 28, 120, 38);
    // przycisk: wirujący pierścień i fala
    g.strokeStyle = 'rgba(120,220,255,.8)'; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.lineDashOffset = -t * 18;
    g.beginPath(); g.arc(770, 355, 36, 0, TAU); g.stroke(); g.setLineDash([]);
    const pr = (t * .6) % 1; g.strokeStyle = `rgba(120,220,255,${(.5 * (1 - pr)).toFixed(3)})`; g.beginPath(); g.arc(770, 355, 34 + pr * 18, 0, TAU); g.stroke();
    // drobny pył w powietrzu
    for (let k = 0; k < 26; k++) { const x = (k * 97.3 + t * (6 + k % 4)) % 820, y = (k * 53.1 - t * (3 + k % 3) * 2 + 999) % 406; g.fillStyle = `rgba(180,220,255,${(.18 + .18 * Math.sin(t * 2 + k)).toFixed(3)})`; g.fillRect(x, y, 1.2, 1.2); }
    g.globalCompositeOperation = 'source-over';
  }
};

const KEYS_LIVE = { 'case-ogien': 'ogien', 'case-medora': 'medora', 'case-nova': 'nova', 'case-volt': 'volt', 'case-aura': 'aura', 'case-aurum': 'aurum' };
const keyOf = img => { const m = /\/img\/(case-[a-z]+)\.avif/.exec(img.src || ''); return m ? KEYS_LIVE[m[1]] : null; };
const origDraw = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
  origDraw.call(this, img, ...a);
  if (a.length !== 4 || !(img instanceof HTMLImageElement)) return;
  const key = keyOf(img); if (!key || !LIVE[key]) return;
  const [dx, dy, dw, dh] = a;
  this.save(); this.translate(dx, dy); this.scale(dw / img.naturalWidth, dh / img.naturalHeight);
  try { LIVE[key](this, performance.now() / 1000, img); } finally { this.restore(); }
};
