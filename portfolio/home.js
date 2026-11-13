// Sekcja Portfolio na stronie głównej: pętle wideo grają tylko, gdy karta jest widoczna.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vids = [...document.querySelectorAll('#portfolio video')];
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.25 });
  vids.forEach(v => io.observe(v));
}
