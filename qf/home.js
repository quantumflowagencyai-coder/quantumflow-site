// QuantumFlow – strona główna: showreel w hero, Lenis + GSAP ScrollTrigger, sekcje w stylu portfolio.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WIDE = matchMedia('(min-width: 861px)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const hasG = window.gsap && window.ScrollTrigger;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  if (hasG) gsap.registerPlugin(ScrollTrigger);

  // ---------- Lenis ----------
  let lenis = null;
  if (!RM && window.Lenis && hasG) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const goTo = (target, off = 0) => {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.6 }); else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); closeMenu(); goTo(id, id === '#portfolio' ? 0 : -10);
    history.replaceState(null, '', id);
  });

  // ---------- nagłówek, menu ----------
  const hd = $('.hd'), menu = $('#menu'), burger = $('#burger');
  function closeMenu() { if (!menu.classList.contains('open')) return; menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('scrolled', y > 40);
    hd.classList.toggle('hide', y > innerHeight * 1.2 && y > lastY + 2 && !menu.classList.contains('open'));
    if (y < lastY - 2) hd.classList.remove('hide');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- loader + wejście hero ----------
  const ld = $('#ld'), ldN = $('#ld-n'), ldBar = $('#ld-bar'), vid = $('#reel-v');
  let seen = false; try { seen = sessionStorage.getItem('qf-ld') === '1'; sessionStorage.setItem('qf-ld', '1'); } catch (e) { }
  const intro = () => {
    if (!hasG || RM) return;
    gsap.from('.hero-h .ln>span', { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: .09 });
    gsap.from('.hero-top, .hero-lead, .reel-idx, .hero-scroll', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', delay: .35, stagger: .08 });
    gsap.from('#reel-v', { scale: 1.25, duration: 2.2, ease: 'expo.out' });
  };
  if (RM || seen || !ld) { ld && ld.classList.add('gone'); intro(); }
  else {
    if (lenis) lenis.stop();
    const t0 = performance.now(); let p = 0, ready = false;
    const mark = () => { ready = true; };
    if (vid.readyState >= 3) mark(); else { vid.addEventListener('canplay', mark, { once: true }); setTimeout(mark, 2600); }
    (function tick() {
      const el = performance.now() - t0, goal = ready ? 100 : Math.min(88, el / 22);
      p += (goal - p) * (ready && el > 900 ? .2 : .08);
      const v = Math.round(p); ldN.textContent = String(v).padStart(3, '0'); ldBar.style.transform = `scaleX(${p / 100})`;
      if (v >= 100) { ld.classList.add('out'); setTimeout(() => ld.classList.add('gone'), 1150); lenis && lenis.start(); setTimeout(intro, 250); return; }
      requestAnimationFrame(tick);
    })();
  }

  // ---------- showreel: który projekt jest na ekranie ----------
  const SEG = [
    { name: 'EMBER', cat: 'steakhouse', url: 'ember', pa: '#e9461b' },
    { name: 'LUMÉ', cat: 'klinika estetyczna', url: 'lume', pa: '#ff9ec0' },
    { name: 'IRONCLAD', cat: 'siłownia premium', url: 'ironclad', pa: '#c6ff2e' },
    { name: 'MONOLIT', cat: 'deweloper', url: 'monolit', pa: '#f5b54a' },
  ];
  const lis = $$('#reel-idx li'), bars = lis.map(l => $('a>i>i', l));
  const reel = $('#reel'), reelUrl = $('#reel-url'), reelName = $('#reel-name'), reelCat = $('#reel-cat'), stage = $('.hero-stage');
  let cur = -1;
  const host = location.host || 'quantumflow.agency';
  (function sync() {
    requestAnimationFrame(sync);
    if (!vid || !vid.duration) return;
    const t = vid.currentTime, segLen = vid.duration / 4, i = clamp(Math.floor(t / segLen), 0, 3);
    if (i !== cur) {
      cur = i; const s = SEG[i];
      lis.forEach((l, k) => l.classList.toggle('on', k === i));
      bars.forEach((b, k) => { if (k !== i) b.style.transform = `scaleX(${k < i ? 1 : 0})`; });
      reelUrl.textContent = `${host}/portfolio/${s.url}`; reelName.textContent = s.name; reelCat.textContent = s.cat;
      stage.style.setProperty('--pa', s.pa);
    }
    bars[i].style.transform = `scaleX(${((t - i * segLen) / segLen).toFixed(3)})`;
  })();
  if (vid) { vid.play().catch(() => { }); }
  // klik w okno po zmniejszeniu otwiera aktualny projekt
  reel.addEventListener('click', () => { if (reel.classList.contains('win') && cur >= 0) location.href = '/portfolio/' + SEG[cur].url; });

  // ---------- scroll hero: film zamyka się w oknie przeglądarki ----------
  if (hasG && !RM) {
    const box = () => {
      const w = innerWidth, h = innerHeight, mob = w < 861;
      const ww = mob ? w - 32 : Math.min(w * .64, 1240), wh = ww * 9 / 16;
      const x = (w - ww) / 2, y = Math.max(mob ? 90 : 96, (h - wh) / 2 - (mob ? 0 : 10));
      return { t: y, r: x, b: Math.max(0, h - y - wh), l: x };
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-pin', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true,
        onUpdate: st => { reel.classList.toggle('win', st.progress > .5); document.body.classList.toggle('past-hero', st.progress > .6); },
      },
    });
    tl.fromTo(reel, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: () => { const b = box(); return `inset(${b.t}px ${b.r}px ${b.b}px ${b.l}px round 18px)`; }, ease: 'power2.inOut', duration: 1 }, 0)
      .to('.reel-shade', { opacity: .25, duration: .8 }, 0)
      .fromTo('.reel-bar', { opacity: 0 }, { opacity: 1, duration: .3 }, .62)
      .to('.hero-h .ln:nth-child(1)', { xPercent: -38, opacity: 0, duration: .7, ease: 'power2.in' }, 0)
      .to('.hero-h .ln:nth-child(2)', { xPercent: 22, opacity: 0, duration: .7, ease: 'power2.in' }, .02)
      .to('.hero-h .ln:nth-child(3)', { xPercent: 34, opacity: 0, duration: .7, ease: 'power2.in' }, .04)
      .to('.hero-top, .hero-foot, .hero-scroll', { y: 50, opacity: 0, duration: .4, ease: 'power2.in' }, 0)
      .fromTo('.hero-after', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .3 }, .75)
      .fromTo('.hero-win-t', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, .7)
      .to({}, { duration: .35 });
    // pasek przeglądarki stoi na górnej krawędzi docelowego okna
    const placeBar = () => { const b = box(); $('.reel-bar').style.cssText += `;top:${b.t}px;left:${b.l}px;right:${b.r}px;transform:none;border-radius:18px 18px 0 0`; };
    const placeT = () => { const b = box(), t = $('#hero-win-t'); t.style.top = Math.max(76, b.t - (innerWidth < 861 ? 56 : 70)) + 'px'; };
    placeBar(); placeT(); addEventListener('resize', () => { placeBar(); placeT(); });
    if (FINE) reel.addEventListener('pointerenter', () => reel.classList.contains('win') && cursor.big('Otwórz'));
    if (FINE) reel.addEventListener('pointerleave', () => cursor.small());
  }

  // ---------- kursor ----------
  const curEl = $('#cur');
  const cursor = {
    big(t) { curEl.querySelector('span').textContent = t; curEl.classList.add('big'); },
    small() { curEl.classList.remove('big'); },
  };
  if (FINE && !RM) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; curEl.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => curEl.classList.remove('on'));
    (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; curEl.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
    // nad showroomem portfolio ma własny kursor
    const pf = $('#portfolio'); pf && pf.addEventListener('pointerenter', () => curEl.classList.remove('on'));
    $$('.reel-idx a').forEach(a => { a.addEventListener('pointerenter', () => cursor.big('Zobacz')); a.addEventListener('pointerleave', () => cursor.small()); });
  }

  // ---------- pigułka postępu ----------
  const pill = $('#pill'), pillBar = $('#pill-bar'), pillP = $('#pill-p'), pillSec = $('#pill-sec');
  const NAMES = { manifest: 'Manifest', uslugi: 'Usługi', portfolio: 'Portfolio', automatyzacje: 'Automatyzacje', proces: 'Proces', pakiety: 'Pakiety', faq: 'FAQ', kontakt: 'Kontakt' };
  const secs = Object.keys(NAMES).map(id => $('#' + id)).filter(Boolean);
  const links = $$('#menu a');
  const pillUpd = () => {
    const max = document.documentElement.scrollHeight - innerHeight, p = clamp(scrollY / max, 0, 1);
    pillBar.style.transform = `scaleX(${p})`; pillP.textContent = Math.round(p * 100) + '%';
    pill.classList.toggle('on', scrollY > innerHeight * 1.6 && scrollY < max - 200);
    let act = null; for (const s of secs) if (s.getBoundingClientRect().top < innerHeight * .45) act = s;
    const nm = act ? NAMES[act.id] : 'QuantumFlow';
    if (pillSec.textContent !== nm) pillSec.textContent = nm;
    links.forEach(a => a.classList.toggle('on', !!act && a.getAttribute('href') === '#' + act.id));
  };
  addEventListener('scroll', pillUpd, { passive: true }); pillUpd();

  // ---------- marquee (prędkość rośnie przy szybkim scrollu) ----------
  const rows = $$('.mq-row');
  if (rows.length && !RM) {
    const st = rows.map((r, i) => ({ el: $('.mq-t', r), dup: null, x: 0, dir: i % 2 ? 1 : -1 }));
    st.forEach(s => { const c = s.el.cloneNode(true); s.el.after(c); s.dup = c; });
    let vel = 0, ly = scrollY;
    (function loop() {
      const dy = scrollY - ly; ly = scrollY; vel += (Math.abs(dy) - vel) * .1;
      st.forEach(s => {
        const w = s.el.offsetWidth; if (!w) return;
        s.x += s.dir * (0.6 + vel * .35);
        if (s.x <= -w) s.x += w; if (s.x > 0) s.x -= w;
        s.el.style.transform = s.dup.style.transform = `translate3d(${s.x}px,0,0)`;
      });
      requestAnimationFrame(loop);
    })();
  }

  // ---------- manifest: słowa zapalają się przy scrollu ----------
  const man = $('#man-t');
  if (man) {
    const wrapWords = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    wrapWords(man);
    const ws = $$('.w', man);
    if (hasG && !RM) ScrollTrigger.create({ trigger: man, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: s => { const k = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < k)); } });
    else ws.forEach(w => w.classList.add('on'));
  }
  // liczniki
  $$('.stat b[data-c]').forEach(b => {
    if (!hasG || RM) return;
    const end = +b.dataset.c, suf = b.dataset.s || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'expo.out', onUpdate: () => { b.textContent = Math.round(o.v) + suf; } }) });
  });

  // ---------- odsłony: nagłówki słowo po słowie, bloki od dołu ----------
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    $$('.sec-head h2, .giant, .pfh-head h2, .faq-side h2, .ct-side h2, .cta-box h3').forEach(h => {
      const walk = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; } const o = document.createElement('span'); o.className = 'lnw'; const c = document.createElement('span'); c.className = 'ch'; c.textContent = p; o.appendChild(c); f.appendChild(o); });
          n.replaceWith(f);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
      walk(h); h.classList.add('splt');
      $$('.ch', h).forEach((c, i) => c.style.transitionDelay = (i * 45) + 'ms');
      io.observe(h);
    });
    $$('.sec-lead, .svc-row, .uc, .stages li, .pk-card, .faq-item, .ct-form, .ct-tel, .ct-mail, .stat, .cta-box, .pfh-head p, .sub-h').forEach((el, i) => {
      el.classList.add('rv'); el.style.transitionDelay = ((i % 3) * 90) + 'ms'; io.observe(el);
    });
  }

  // ---------- usługi: podgląd wideo za kursorem ----------
  const prev = $('#svc-prev');
  if (prev && FINE && !RM && WIDE) {
    const pv = $('video', prev); let px = 0, py = 0, tx = 0, ty = 0, src = '';
    $$('.svc-row').forEach(r => {
      r.addEventListener('pointerenter', () => {
        const s = r.dataset.v; if (s && s !== src) { src = s; pv.innerHTML = `<source src="${s}.webm" type="video/webm"><source src="${s}.mp4" type="video/mp4">`; pv.load(); }
        pv.play().catch(() => { }); prev.classList.add('on');
      });
      r.addEventListener('pointerleave', () => { prev.classList.remove('on'); });
    });
    addEventListener('pointermove', e => { tx = e.clientX + 150; ty = e.clientY; }, { passive: true });
    (function loop() { px += (tx - px) * .12; py += (ty - py) * .12; prev.style.left = px + 'px'; prev.style.top = py + 'px'; requestAnimationFrame(loop); })();
  }

  // ---------- automatyzacje: tor poziomy + przewód n8n ----------
  const aut = $('#automatyzacje'), track = $('#aut-track');
  if (aut && track) {
    if (!hasG || RM || !WIDE) aut.classList.add('flat');
    else {
      const pin = $('#aut-pin'), nodes = $$('.aut-node', track), wire = $('#aut-wire'), pOff = $('#aut-path'), pOn = $('#aut-path-on'), bar = $('#aut-bar'), log = $('#aut-log');
      let len = 0, head = 0, nodeLen = [], inView = false;
      const build = () => {
        const tr = track.getBoundingClientRect();
        wire.setAttribute('viewBox', `0 0 ${tr.width} ${tr.height}`);
        const pts = nodes.map(n => { const r = $('.node', n).getBoundingClientRect(); return [r.left - tr.left + r.width / 2, r.top - tr.top + r.height / 2]; });
        const intro = $('.aut-intro', track).getBoundingClientRect();
        pts.unshift([intro.right - tr.left - 40, tr.height / 2]);
        let d = `M${pts[0][0]},${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; }
        pOff.setAttribute('d', d); pOn.setAttribute('d', d);
        len = pOn.getTotalLength(); pOn.style.strokeDasharray = len; pOn.style.strokeDashoffset = len - head;
        // długość przewodu, na której leży każdy węzeł
        nodeLen = pts.slice(1).map(([x, y]) => { let best = 0, bd = 1e9; for (let l = 0; l <= len; l += 4) { const q = pOn.getPointAtLength(l), dd = (q.x - x) ** 2 + (q.y - y) ** 2; if (dd < bd) { bd = dd; best = l; } } return best; });
      };
      const dist = () => track.scrollWidth - innerWidth;
      const HOLD = .12;
      // paczki danych płynące po przewodzie
      const NS = 'http://www.w3.org/2000/svg', TAGS = ['mail', 'lead', 'PDF', 'CRM', 'Slack', 'API', 'AI'];
      const packs = TAGS.map((t, i) => {
        const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pk');
        g.innerHTML = `<circle r="9" class="pk-halo"/><circle r="3.6" class="pk-dot"/><text y="-16" text-anchor="middle">${t}</text>`;
        wire.appendChild(g); return { g, off: i / TAGS.length, last: -1 };
      });
      // log wykonania
      const term = document.createElement('div'); term.className = 'aut-term'; term.setAttribute('aria-hidden', 'true');
      term.innerHTML = '<div class="aut-term-h"><i></i><i></i><i></i><span>n8n · executions</span></div><ol></ol>';
      $('.aut-stage').appendChild(term);
      const tlist = $('ol', term);
      const MSG = [
        ['01', 'Wyzwalacz', ['nowy mail od klienta', 'formularz: zapytanie o wycenę', 'harmonogram 08:00']],
        ['02', 'Agent AI', ['klasyfikacja: lead gorący', 'odczyt faktury PDF', 'odpowiedź z bazy wiedzy']],
        ['03', 'Akcje', ['wpis w CRM + Slack', 'arkusz zaktualizowany', 'mail do klienta wysłany']],
        ['04', 'Efekt', ['gotowe w 0,8 s', 'oszczędzone 12 min pracy', 'raport w skrzynce']],
      ];
      let mi = 0;
      const hit = i => {
        const n = nodes[i]; n.classList.remove('hit'); void n.offsetWidth; n.classList.add('hit');
        const [no, name, opts] = MSG[i], li = document.createElement('li');
        li.innerHTML = `<b>✓ ${no}</b> ${name} <span>· ${opts[mi++ % opts.length]}</span>`;
        tlist.prepend(li); while (tlist.children.length > 3) tlist.lastChild.remove();
      };
      let t0 = performance.now();
      (function flow(now) {
        requestAnimationFrame(flow);
        if (!inView || head < 30) { packs.forEach(p => p.g.style.opacity = 0); return; }
        const t = (now - t0) / 1000, span = head + 60;
        packs.forEach(p => {
          const s = ((t * 260 + p.off * span) % span) - 30;
          if (s < 0 || s > head) { p.g.style.opacity = 0; p.last = s; return; }
          const q = pOn.getPointAtLength(s);
          p.g.setAttribute('transform', `translate(${q.x.toFixed(1)},${q.y.toFixed(1)})`);
          p.g.style.opacity = Math.min(1, (head - s) / 40, (s + 30) / 40);
          nodeLen.forEach((L, i) => { if (p.last < L && s >= L) hit(i); });
          p.last = s;
        });
      })(t0);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true,
          onRefresh: build,
          onToggle: s => { inView = s.isActive; term.classList.toggle('on', s.isActive); },
          onUpdate: s => {
            const p = clamp((s.progress - HOLD) / (1 - HOLD), 0, 1);
            head = len * clamp(p * 1.08, 0, 1); pOn.style.strokeDashoffset = len - head;
            bar.style.transform = `scaleX(${s.progress})`;
            nodes.forEach((n, i) => n.classList.toggle('on', head >= nodeLen[i] - 20));
            const k = nodes.filter(n => n.classList.contains('on')).length;
            log.textContent = k ? `workflow.run() · węzeł ${k}/4 · ${Math.round(80 + p * 1400)} ms` : 'workflow.run() · czeka na zdarzenie';
          },
        },
      });
      tl.to({}, { duration: HOLD }).to(track, { x: () => -dist(), ease: 'none', duration: 1 - HOLD });
      build();
    }
  }
  // światło pod kursorem na kartach
  $$('.uc').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));

  // ---------- proces: wielka cyfra zmienia się z krokiem ----------
  const steps = $$('.prc-step'), nums = $$('#prc-num span'), pline = $('#prc-line');
  const setStep = i => { steps.forEach((s, k) => s.classList.toggle('on', k === i)); nums.forEach((n, k) => { n.classList.toggle('on', k === i); n.classList.toggle('up', k < i); }); if (pline) pline.style.transform = `scaleX(${(i + 1) / steps.length})`; };
  if (steps.length) {
    setStep(0);
    if (hasG && !RM) steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 60%', end: 'bottom 60%', onToggle: e => e.isActive && setStep(i) }));
    else steps.forEach(s => s.classList.add('on'));
  }

  // ---------- FAQ: płynne rozwijanie ----------
  $$('.faq-item').forEach(d => {
    const sum = $('summary', d), body = $('.faq-a', d);
    sum.addEventListener('click', e => {
      if (!hasG || RM) return;
      e.preventDefault();
      if (d.open) { gsap.to(body, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; } }); }
      else { d.open = true; gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: .6, ease: 'power3.out', onComplete: () => { body.style.height = ''; ScrollTrigger.refresh(); } }); }
    });
  });

  // ---------- kontakt: wielkie „Porozmawiajmy” jedzie z scrollem ----------
  if (hasG && !RM) gsap.fromTo('.ct-giant span', { xPercent: 0 }, { xPercent: -60, ease: 'none', scrollTrigger: { trigger: '#kontakt', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ---------- formularz (Web3Forms) ----------
  window.CONTACT_EMAIL = 'kontakt@quantumflow.agency';
  $$('[data-pkg]').forEach(b => b.addEventListener('click', () => { const s = $('#pakiet'); if (s) s.value = b.dataset.pkg; }));
  const WEB3FORMS_KEY = '789d4741-7b3d-4764-9f67-f0b87280563c';
  const form = $('#form');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]'), d = Object.fromEntries(new FormData(form)), note = $('#note');
    if (d._honey) return;
    btn.disabled = true; note.textContent = 'Wysyłamy…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: 'Zapytanie ze strony: ' + (d.firma || d.imie), from_name: 'QuantumFlow – formularz', replyto: d.email, 'Imię': d.imie, 'E-mail': d.email, 'Firma': d.firma, 'Pakiet': d.pakiet, 'Obecna strona': d.strona, 'Wiadomość': d.wiadomosc }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.message || res.status);
      form.reset(); note.textContent = 'Dziękujemy! Odpowiemy w ciągu 24 godzin.';
    } catch (err) {
      console.warn('Formularz:', err);
      note.innerHTML = `Nie udało się wysłać. Napisz bezpośrednio: <a href="mailto:${window.CONTACT_EMAIL}">${window.CONTACT_EMAIL}</a>`;
    } finally { btn.disabled = false; }
  });

  // ---------- stopka: rok + profile w sieci ----------
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  const SOCIAL = [
    { name: 'Facebook', url: 'https://www.facebook.com/quantumflow.ai.agency/', icon: '/img/social-facebook.webp' },
    { name: 'Instagram', url: 'https://www.instagram.com/quantumflowaiagency/', icon: '/img/social-instagram.webp' },
    { name: 'Profil Firmy w Google (Mapy Google)', url: 'https://share.google/zeEI3BiuIkQmRPPwX', icon: '/img/social-google.webp' },
  ];
  const sbox = $('#social');
  sbox && SOCIAL.forEach(s => {
    const a = document.createElement('a'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'soc'; a.title = s.name; a.setAttribute('aria-label', s.name + ' (otwiera się w nowej karcie)');
    const i = document.createElement('img'); i.src = s.icon; i.alt = ''; i.width = 56; i.height = 56; i.loading = 'lazy'; i.decoding = 'async'; a.appendChild(i); sbox.appendChild(a);
  });

  // przeliczenie po załadowaniu fontów i mediów
  if (hasG) { addEventListener('load', () => ScrollTrigger.refresh()); document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh()); }
})();
