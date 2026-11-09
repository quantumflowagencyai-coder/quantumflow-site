// Wyostrzanie teł sekcji FAQ i Kontakt do 1080p: przy rysowaniu tła na canvasie grafika jest raz skalowana
// do 1920 px i wyostrzana maską wyostrzającą, potem używana z pamięci. Pliki grafik bez zmian.
(() => {
  const SRC = /\/img\/(faq|kontakt)-bg\.avif(\?|$)/;
  const proto = CanvasRenderingContext2D.prototype, orig = proto.drawImage;
  const cache = new WeakMap();
  const sharpen = img => {
    const TW = 1920, TH = Math.round(img.naturalHeight * TW / img.naturalWidth);
    const c = document.createElement('canvas'); c.width = TW; c.height = TH; const x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; orig.call(x, img, 0, 0, TW, TH);
    try {
      const b = document.createElement('canvas'); b.width = TW; b.height = TH; const bx = b.getContext('2d');
      bx.filter = 'blur(1.3px)'; if (bx.filter !== 'blur(1.3px)') return c;
      orig.call(bx, c, 0, 0);
      const o = x.getImageData(0, 0, TW, TH), d = o.data, bd = bx.getImageData(0, 0, TW, TH).data;
      for (let i = 0; i < d.length; i += 4) for (let k = i; k < i + 3; k++) { const df = d[k] - bd[k]; if (df > 2 || df < -2) d[k] = d[k] + df * .95; }
      x.putImageData(o, 0, 0);
    } catch (e) { }
    return c;
  };
  proto.drawImage = function (img, ...a) {
    if (a.length === 4 && img instanceof HTMLImageElement && img.naturalWidth && SRC.test(img.src)) {
      let s = cache.get(img); if (!s) { s = sharpen(img); cache.set(img, s); }
      this.imageSmoothingQuality = 'high';
      return orig.call(this, s, ...a);
    }
    return orig.call(this, img, ...a);
  };
})();
