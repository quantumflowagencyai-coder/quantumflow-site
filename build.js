// Build QuantumFlow: index.html z _src (CSS/JS do plików, SEO/GEO, stopka, schema), fonty i three.js z npm -> public/
const fs = require('fs'), path = require('path');
const OUT = 'public', SKIP = new Set(['public', 'node_modules', '_src', 'build.js', 'package.json', 'package-lock.json', 'vercel.json', '.vercel']);
const must = (c, m) => { if (!c) throw new Error('BUILD FAIL: ' + m); };
const rd = f => fs.readFileSync(f, 'utf8');
const once = (s, a, b) => { must(s.split(a).length === 2, 'once: ' + a.slice(0, 60)); return s.replace(a, () => b); };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT + '/fonts', { recursive: true });
for (const n of fs.readdirSync('.')) if (!SKIP.has(n) && !n.startsWith('.')) fs.cpSync(n, path.join(OUT, n), { recursive: true });

// fonty + three
const FS = 'node_modules/@fontsource-variable/';
for (const [pkg, name] of [['inter', 'inter'], ['space-grotesk', 'space-grotesk']])
  for (const sub of ['latin', 'latin-ext']) fs.copyFileSync(`${FS}${pkg}/files/${pkg}-${sub}-wght-normal.woff2`, `${OUT}/fonts/${name}-${sub}.woff2`);
fs.copyFileSync('node_modules/three/build/three.module.min.js', OUT + '/three.module.min.js');

let src = rd('_src/index.orig.html');

// 1) CSS -> styles.css
const s0 = src.indexOf('<style>\n'), s1 = src.indexOf('</style>', s0);
let css = src.slice(s0 + 8, s1);
css = once(css, 'input:focus,textarea:focus,select:focus{outline:none;border-color:var(--violet)}',
  'input:focus,textarea:focus,select:focus{border-color:var(--violet)}\ninput:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;border-color:var(--violet)}');
const UR_LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const UR_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';
let fonts = '';
for (const [fam, file, w] of [['Inter', 'inter', '300 600'], ['Space Grotesk', 'space-grotesk', '400 700']])
  for (const [sub, ur] of [['latin-ext', UR_EXT], ['latin', UR_LAT]])
    fonts += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/fonts/${file}-${sub}.woff2) format('woff2');unicode-range:${ur}}\n`;
fs.writeFileSync(OUT + '/styles.css', fonts + css + rd('_src/extra.css'));
src = src.slice(0, s0) + '<link rel="stylesheet" href="/styles.css">' + src.slice(s1 + 8);

// 2) fonty i preload
src = once(src, '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', '');
src = src.replace(/<link href="https:\/\/fonts.googleapis.com\/css2[^>]*>\n/, '');
must(!src.includes('fonts.googleapis'), 'google fonts');
src = once(src, '<link rel="stylesheet" href="/styles.css">', rd('_src/head.html') + '<link rel="stylesheet" href="/styles.css">');

// 3) skrypty inline -> pliki
const i0 = src.indexOf('<script>\n// Adres, na który ma trafiać formularz.'), i1 = src.indexOf('</script>', i0);
must(i0 > 0, 'main script');
fs.writeFileSync(OUT + '/main.js', src.slice(i0 + 9, i1));
src = src.slice(0, i0) + '<script src="/main.js"></script>' + src.slice(i1 + 9);
const m0 = src.indexOf("<script type=\"module\">\nimport * as THREE from 'three';"), m1 = src.indexOf('</script>', m0);
must(m0 > 0, 'hero script');
fs.writeFileSync(OUT + '/hero.js', src.slice(m0 + 23, m1));
src = src.slice(0, m0) + '<script type="module" src="/hero.js"></script>' + src.slice(m1 + 9);

// 4) three lokalnie
src = once(src, '{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}', '{"imports":{"three":"/three.module.min.js"}}');

// 5) nagłówek, linki, dostępność
src = src.replace('<body>\n', '<body>\n<a class="skip-link" href="#main-content">Przejdź do treści</a>\n');
src = src.replace('<main>', '<main id="main-content" tabindex="-1">');
for (const [a, b] of JSON.parse(rd('_src/replace.json'))) src = once(src, a, b);

// 6) stopka
const f0 = src.indexOf('<footer>'), f1 = src.indexOf('</footer>') + 9;
src = src.slice(0, f0) + rd('_src/footer.html').trim() + src.slice(f1);

// 7) JSON-LD
const J = '<script type="application/ld+json">';
const j0 = src.indexOf(J), j1 = src.indexOf('</script>', j0);
const faq = JSON.parse(src.slice(j0 + J.length, j1))['@graph'].find(x => x['@type'] === 'FAQPage');
faq['@id'] = 'https://quantumflow.agency/#faq';
const blocks = [...JSON.parse(rd('_src/schema.json')), { '@context': 'https://schema.org', ...faq }];
src = src.slice(0, j0) + blocks.map(b => J + JSON.stringify(b) + '</script>').join('\n') + src.slice(j1 + 9);
fs.writeFileSync(OUT + '/index.html', src);

// 8) kontakt.js: lokalizacja Sanok
let k = rd('_src/kontakt.orig.js');
for (const [a, b] of [['>WARSZAWA<', '>SANOK<'], ['52.23 N  21.01 E', '49.56 N  22.21 E'], ['52°13′N 21°00′E', '49°33′N 22°12′E']]) k = once(k, a, b);
fs.writeFileSync(OUT + '/kontakt.js', k);
// 9) podstrony: robots bez max-snippet, skip link #main-content (idempotentne)
for (const n of fs.readdirSync(OUT)) if (n.endsWith('.html') && n !== 'index.html') {
  const p = path.join(OUT, n);
  fs.writeFileSync(p, rd(p).replace(', max-snippet:-1', '').replaceAll('"#tresc"', '"#main-content"').replaceAll('id="tresc"', 'id="main-content"'));
}
console.log('build ok', fs.readdirSync(OUT).length, 'plików');
