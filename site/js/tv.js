/**
 * tv.js — "FIRAOL·TV", a TV-style viewer for live projects.
 *
 * Every project with a `live` block in site-content.json becomes a channel:
 *   "live": {
 *     "url": "https://example.com",
 *     "embed": false,                 // true → real interactive <iframe>
 *     "snapshots": { "desktop": "…webp", "mobile": "…webp" }
 *   }
 * Sites that send X-Frame-Options: DENY / CSP frame-ancestors can't be
 * framed, so they're shown as scrollable snapshots with an "Open live" CTA.
 * Flip `embed` to true once a site allows framing from firaol.dev.
 *
 * Any element with [data-tv-open] opens the set; its value is the channel
 * index (empty → first channel).
 */
const LiveTV = (function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TUNE_MS = reducedMotion ? 0 : 420;
  const OSD_MS = 2600;

  let channels = [];
  let current = 0;
  let device = 'desktop';
  let dialog, screen, viewport, osd, live, notice, url, controls, guide, staticCanvas;
  let osdTimer = 0, tuneTimer = 0, noiseFrame = 0;

  function hostOf(href) {
    try { return new URL(href).host; } catch (e) { return href; }
  }
  const pad = (n) => String(n + 1).padStart(2, '0');

  /* ---------------- Static noise between channels ---------------- */
  function startNoise() {
    if (!staticCanvas || reducedMotion) return;
    const ctx = staticCanvas.getContext('2d');
    const { width, height } = staticCanvas;
    const frame = ctx.createImageData(width, height);
    const px = new Uint32Array(frame.data.buffer);
    (function draw() {
      for (let i = 0; i < px.length; i++) {
        const v = (40 + Math.random() * 150) | 0;
        px[i] = 0xff000000 | (v << 16) | (v << 8) | v;
      }
      ctx.putImageData(frame, 0, 0);
      noiseFrame = requestAnimationFrame(draw);
    })();
  }
  function stopNoise() { cancelAnimationFrame(noiseFrame); }

  /* ---------------- Rendering ---------------- */
  function renderPicture() {
    const p = channels[current];
    viewport.scrollTop = 0;
    if (p.live.embed) {
      viewport.innerHTML = `<iframe src="${p.live.url}" title="${p.title} — live site" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
    } else {
      const shots = p.live.snapshots || {};
      const src = (device === 'mobile' && shots.mobile) || shots.desktop || shots.mobile || p.image;
      viewport.innerHTML = `<img src="${src}" alt="Snapshot of ${hostOf(p.live.url)} (${device} view)" decoding="async">`;
    }
  }

  function renderChrome() {
    const p = channels[current];
    const host = hostOf(p.live.url);
    const isLive = !!p.live.embed;

    osd.innerHTML = `
      <span class="tv__osd-ch">${pad(current)}</span>
      <span><span class="tv__osd-name">${p.title}</span><br><span class="tv__osd-sub">${host} · ${p.status}</span></span>
    `;
    live.dataset.mode = isLive ? 'live' : 'snapshot';
    live.querySelector('span').textContent = isLive ? 'LIVE' : 'SNAPSHOT';

    notice.hidden = isLive;
    notice.innerHTML = isLive ? '' : `<span>Snapshot preview — ${host} doesn't allow embedding.</span><a href="${p.live.url}" target="_blank" rel="noopener">Open live ${Icons.get('external')}</a>`;

    url.innerHTML = `${Icons.get('lock')}<span>${p.live.url.replace(/^https?:\/\//, '')}</span>`;
    controls.querySelector('[data-tv="visit"]').href = p.live.url;
    controls.querySelectorAll('[data-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === device)));
    guide.querySelectorAll('.tv__channel').forEach((b, i) => {
      if (i === current) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    const active = guide.children[current];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    clearTimeout(osdTimer);
    osd.classList.add('is-visible');
    osdTimer = setTimeout(() => osd.classList.remove('is-visible'), OSD_MS);
  }

  /* Switch channel: burst of static, swap the picture, then show the OSD. */
  function tune(index) {
    current = (index + channels.length) % channels.length;
    screen.dataset.device = device;
    clearTimeout(tuneTimer);
    screen.classList.add('is-tuning');
    startNoise();
    renderChrome();

    const finish = () => {
      stopNoise();
      screen.classList.remove('is-tuning');
    };
    tuneTimer = setTimeout(() => {
      renderPicture();
      const media = viewport.firstElementChild;
      // Hold the static until the picture is actually ready (or 2.5s max).
      if (media && !(media.complete)) {
        const done = () => { clearTimeout(fallback); finish(); };
        const fallback = setTimeout(done, 2500);
        media.addEventListener('load', done, { once: true });
        media.addEventListener('error', done, { once: true });
      } else {
        finish();
      }
    }, TUNE_MS);
  }

  /* ---------------- Open / close ---------------- */
  function open(index) {
    if (!channels.length || dialog.open) return;
    dialog.classList.remove('is-closing');
    dialog.showModal();
    document.body.classList.add('tv-open');
    if (!reducedMotion) {
      screen.classList.add('is-powering');
      screen.addEventListener('animationend', () => screen.classList.remove('is-powering'), { once: true });
    }
    // Phones get a portrait screen, so start them in mobile view.
    if (!dialog.dataset.used && window.matchMedia('(max-width: 720px)').matches) device = 'mobile';
    dialog.dataset.used = 'true';
    tune(index || 0);
    viewport.focus({ preventScroll: true });
  }

  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    };
    if (reducedMotion) return finish();
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', finish, { once: true });
  }

  function onClosed() {
    clearTimeout(osdTimer);
    clearTimeout(tuneTimer);
    stopNoise();
    document.body.classList.remove('tv-open');
    viewport.innerHTML = ''; // unload any iframe so it stops running
  }

  /* ---------------- Build UI ---------------- */
  function buildControls() {
    const btn = (action, icon, label, extra) =>
      `<button class="tv__btn" type="button" data-tv="${action}" aria-label="${label}" title="${label}"${extra || ''}>${Icons.get(icon)}</button>`;
    controls.innerHTML = [
      btn('prev', 'chevronLeft', 'Previous channel'),
      btn('next', 'chevronRight', 'Next channel'),
      '<span class="tv__sep" aria-hidden="true"></span>',
      btn('device', 'monitor', 'Desktop view', ' data-device="desktop" aria-pressed="true"'),
      btn('device', 'smartphone', 'Mobile view', ' data-device="mobile" aria-pressed="false"'),
      btn('reload', 'refresh', 'Reload'),
      '<span class="tv__sep" aria-hidden="true"></span>',
      `<a class="tv__visit" data-tv="visit" href="#" target="_blank" rel="noopener">${Icons.get('external')}<span>Visit site</span></a>`,
      btn('power', 'power', 'Power off'),
    ].join('');
    controls.querySelector('[data-tv="power"]').classList.add('tv__btn--power');
  }

  function buildGuide() {
    guide.innerHTML = channels.map((p, i) => `
      <button class="tv__channel" type="button" data-channel="${i}">
        <img src="${(p.live.snapshots && p.live.snapshots.desktop) || p.image}" alt="" loading="lazy" decoding="async">
        <span><span class="tv__channel-num">CH ${pad(i)}</span><span class="tv__channel-name">${p.title}</span></span>
      </button>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-tv-open]');
      if (!trigger) return;
      e.preventDefault();
      open(parseInt(trigger.getAttribute('data-tv-open'), 10) || 0);
    });

    controls.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tv]');
      if (!b) return;
      switch (b.dataset.tv) {
        case 'prev': tune(current - 1); break;
        case 'next': tune(current + 1); break;
        case 'reload': tune(current); break;
        case 'power': close(); break;
        case 'device':
          if (device !== b.dataset.device) { device = b.dataset.device; tune(current); }
          break;
      }
    });

    guide.addEventListener('click', (e) => {
      const b = e.target.closest('[data-channel]');
      if (b) tune(parseInt(b.dataset.channel, 10));
    });

    // Esc → animated power-off instead of an instant close.
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dialog.addEventListener('close', onClosed);
    // Clicking the dimmed backdrop (the dialog box itself, outside the set) closes.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

    dialog.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); tune(current + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); tune(current - 1); }
      else if (/^[1-9]$/.test(e.key) && +e.key <= channels.length) tune(+e.key - 1);
      else if (e.key === 'd' || e.key === 'D') { device = device === 'desktop' ? 'mobile' : 'desktop'; tune(current); }
    });
  }

  function init(liveProjects) {
    dialog = document.getElementById('tv');
    channels = (liveProjects || []).filter((p) => p.live && p.live.url);

    if (!dialog || !channels.length || typeof dialog.showModal !== 'function') {
      // No channels (or no <dialog> support): fall back to plain links.
      document.querySelectorAll('[data-tv-open]').forEach((el) => {
        const p = channels[parseInt(el.getAttribute('data-tv-open'), 10) || 0];
        if (p && el.tagName === 'A') { el.href = p.live.url; el.target = '_blank'; el.rel = 'noopener'; }
        el.removeAttribute('data-tv-open');
      });
      return;
    }

    screen = document.getElementById('tv-screen');
    viewport = document.getElementById('tv-viewport');
    osd = document.getElementById('tv-osd');
    live = document.getElementById('tv-live');
    notice = document.getElementById('tv-notice');
    url = document.getElementById('tv-url');
    controls = document.getElementById('tv-controls');
    guide = document.getElementById('tv-guide');
    staticCanvas = document.getElementById('tv-static');

    buildControls();
    buildGuide();
    bindEvents();
  }

  return { init, open, close };
})();
