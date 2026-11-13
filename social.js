// Profile firmy w sieci: każdy wpis to ikona w stopce. Wpis bez adresu (url: '') nie jest pokazywany.
const SOCIAL = [
  { name: 'Facebook', url: 'https://www.facebook.com/quantumflow.ai.agency/', icon: '/img/social-facebook.webp' },
  { name: 'Instagram', url: 'https://www.instagram.com/quantumflowaiagency/', icon: '/img/social-instagram.webp' },
  { name: 'Profil Firmy w Google (Mapy Google)', url: 'https://share.google/zeEI3BiuIkQmRPPwX', icon: '/img/social-google.webp' }
].filter(s => s.url);
const css = document.createElement('style');
css.textContent = '#social{gap:12px!important;margin-top:14px!important}'
  + '#social .soc{display:block;width:64px;height:64px;border-radius:16px;overflow:hidden;border:1px solid rgba(148,197,255,.18);background:#0b0b18;box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}'
  + '#social .soc img{display:block;width:100%;height:100%;object-fit:cover}'
  + '#social .soc:hover,#social .soc:focus-visible{transform:translateY(-3px);border-color:rgba(34,211,238,.55);box-shadow:0 8px 24px rgba(34,211,238,.22)}'
  + '@media (prefers-reduced-motion:reduce){#social .soc{transition:none}#social .soc:hover{transform:none}}';
document.head.appendChild(css);
const box = document.getElementById('social');
if (box) SOCIAL.forEach(s => {
  const a = document.createElement('a');
  a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'soc';
  a.title = s.name; a.setAttribute('aria-label', s.name + ' (otwiera się w nowej karcie)');
  const img = document.createElement('img');
  img.src = s.icon; img.alt = ''; img.width = 64; img.height = 64; img.loading = 'lazy'; img.decoding = 'async';
  a.appendChild(img);
  box.appendChild(a);
});
const ld = document.createElement('script');
ld.type = 'application/ld+json';
ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': 'https://quantumflow.agency/#org', name: 'QuantumFlow AI Agency', url: 'https://quantumflow.agency/', sameAs: SOCIAL.map(s => s.url) });
document.head.appendChild(ld);
import('/pricing.js');
