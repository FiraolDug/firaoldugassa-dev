/**
 * content.js — loads data/site-content.json and renders every section.
 * Keeping content in JSON separates copy from markup and makes the whole
 * site trivially editable without touching HTML.
 */
const PortfolioContent = (function () {
  'use strict';

  async function loadContent() {
    // Primary source: JSON embedded directly in index.html. This means the
    // site works when opened straight from disk (double-clicked, no local
    // server) since it never needs a network/file fetch that the browser's
    // file:// CORS policy would otherwise block.
    const inline = document.getElementById('site-content-data');
    if (inline && inline.textContent.trim()) {
      try {
        return JSON.parse(inline.textContent);
      } catch (err) {
        console.error('Inline site content is not valid JSON, falling back to fetch:', err);
      }
    }

    // Fallback: fetch data/site-content.json. Only works when the site is
    // served over http(s) (e.g. `python3 -m http.server`, GitHub Pages,
    // Netlify) — browsers block fetch() of local files opened via file://.
    const res = await fetch('data/site-content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Unable to load site content (' + res.status + ')');
    return res.json();
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  /* ---------------- Navigation ---------------- */
  function renderNavigation(items) {
    const list = document.getElementById('nav-list');
    if (!list) return;
    list.innerHTML = items.map((item) => `<li><a class="nav__link" href="${item.href}">${item.label}</a></li>`).join('');
  }

  /* ---------------- Hero ---------------- */
  function renderHero(hero) {
    const eyebrow = document.getElementById('hero-eyebrow');
    if (eyebrow) eyebrow.innerHTML = `<span class="badge__dot badge__dot--pulse"></span>${hero.availability}`;
    setText('hero-greeting', hero.greeting);
    setText('hero-name', hero.name);
    setText('hero-role-static', hero.roleStatic);
    setText('hero-description', hero.description);

    const typing = document.getElementById('hero-typing');
    if (typing) typing.setAttribute('data-words', JSON.stringify(hero.typingWords));

    const meta = document.getElementById('hero-meta');
    if (meta) {
      meta.innerHTML = `
        <span class="hero__meta-item">${Icons.get('pin')}${hero.location}</span>
        <span class="hero__meta-item">${Icons.get('briefcase')}${hero.eyebrow}</span>
      `;
    }

    const actions = document.getElementById('hero-actions');
    if (actions) {
      actions.innerHTML = hero.actions.map((a) => {
        const cls = a.variant === 'primary' ? 'btn btn--primary' : a.variant === 'secondary' ? 'btn btn--secondary' : 'btn btn--ghost';
        const icon = a.tv ? Icons.get('tv') : a.download ? Icons.get('download') : a.variant === 'primary' ? Icons.get('arrow') : '';
        const extra = (a.download ? ' download' : '') + (a.tv ? ' data-tv-open' : '');
        return `<a class="${cls}" href="${a.href}"${extra}>${icon}<span>${a.label}</span></a>`;
      }).join('');
    }

    const socials = document.getElementById('hero-socials');
    if (socials) {
      socials.innerHTML = hero.socials.map((s) => `
        <a class="icon-btn" href="${s.href}"${s.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''} aria-label="${s.label}">${Icons.get(s.icon)}</a>
      `).join('');
    }

    // Console panel
    const c = hero.console;
    setText('console-status-label', c.label);
    const statusBadge = document.getElementById('console-status');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="badge__dot badge__dot--pulse"></span>${c.status}`;
    }
    const metrics = document.getElementById('console-metrics');
    if (metrics) {
      metrics.innerHTML = c.metrics.map((m) => `
        <div class="console__metric">
          <span class="console__metric-label">${m.label}</span>
          <span class="console__metric-value">${m.value}</span>
        </div>
      `).join('');
    }
    const log = document.getElementById('console-log');
    if (log) {
      log.innerHTML = c.log.map((line) => {
        const isPrompt = line.trim().startsWith('$');
        return `<span class="${isPrompt ? 'is-prompt' : 'is-out'}">${line}</span>`;
      }).join('');
    }
  }

  /* ---------------- Stats ---------------- */
  function renderStats(stats) {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    grid.innerHTML = stats.map((s) => `
      <div class="stat reveal">
        <div class="stat__value"><span class="stat-counter" data-target="${s.value}">0</span>${s.suffix || ''}</div>
        <div class="stat__label">${s.label}</div>
      </div>
    `).join('');
  }

  /* ---------------- About ---------------- */
  function renderAbout(about) {
    setText('about-eyebrow', about.eyebrow);
    setText('about-title', about.title);

    const headerResume = document.getElementById('header-resume');
    if (headerResume) headerResume.href = about.resumeHref;

    const grid = document.getElementById('about-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="about__text reveal">
        ${about.paragraphs.map((p) => `<p>${p}</p>`).join('')}
        <div class="about__highlights">
          ${about.highlights.map((h) => `
            <div class="about__highlight">
              <div class="about__highlight-icon">${Icons.get('check')}</div>
              <div>
                <h3>${h.title}</h3>
                <p>${h.detail}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="about__side reveal">
        <div class="focus-card card">
          <p class="focus-card__label">Focus</p>
          <h3>${about.focus.title}</h3>
          <p>${about.focus.description}</p>
          <a class="btn btn--primary" href="${about.resumeHref}" download>${Icons.get('download')}<span>${about.resumeLabel}</span></a>
        </div>
      </div>
    `;
  }

  /* ---------------- Skills ---------------- */
  function renderSkills(skills) {
    setText('skills-eyebrow', skills.eyebrow);
    setText('skills-title', skills.title);

    const grid = document.getElementById('skills-grid');
    if (grid) {
      grid.innerHTML = skills.categories.map((s) => `
        <div class="skill-card card reveal">
          <div class="skill-card__head">
            <div class="skill-card__icon">${Icons.get(s.icon)}</div>
            <div>
              <h3>${s.title}</h3>
              <p class="skill-card__meta">${s.meta}</p>
            </div>
          </div>
          <div class="skill-card__items">
            ${s.items.map((i) => `<span class="tag">${i}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    const tools = document.getElementById('tools-row');
    if (tools) {
      tools.innerHTML = `<span class="tools-row__label">${Icons.get('tool')}Also comfortable with</span>` +
        skills.tools.map((t) => `<span class="tag">${t}</span>`).join('');
    }
  }

  /* ---------------- Projects ---------------- */
  function hostOf(url) {
    try { return new URL(url).host; } catch (e) { return url; }
  }

  function renderFeatured(p) {
    const index = liveProjects.indexOf(p);
    return `
      <article class="feature-card card reveal">
        <button class="feature-card__screen" type="button" data-tv-open="${index}" aria-label="Watch ${p.title} live">
          <div class="feature-card__frame">
            <div class="feature-card__chrome"><i></i><i></i><i></i><span>${hostOf(p.live.url)}</span></div>
            <img src="${p.live.snapshots.desktop}" alt="" loading="lazy" decoding="async" width="1280" height="800">
          </div>
          <span class="feature-card__play">${Icons.get('play')}Watch live</span>
        </button>
        <div class="feature-card__body">
          <div class="feature-card__top">
            <span class="badge badge--good"><span class="badge__dot badge__dot--pulse"></span>${p.status}</span>
            <span class="meta-line">${p.period}</span>
          </div>
          <h3 class="feature-card__title">${p.title}</h3>
          <p class="meta-line"><b>${p.role}</b></p>
          <p class="feature-card__summary">${p.summary}</p>
          <ul class="check-list">${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
          <div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
          <div class="feature-card__actions">
            <button class="btn btn--primary btn--sm" type="button" data-tv-open="${index}">${Icons.get('tv')}<span>Watch live</span></button>
            <a class="btn btn--secondary btn--sm" href="${p.live.url}" target="_blank" rel="noopener">${Icons.get('external')}<span>Visit ${hostOf(p.live.url)}</span></a>
          </div>
        </div>
      </article>
    `;
  }

  function renderCard(p) {
    const link = p.links && p.links[0];
    return `
      <article class="project-card card reveal" data-category="${p.category}">
        <div class="project-card__media">
          <span class="badge project-card__status">${p.status}</span>
          <img src="${p.image}" alt="" loading="lazy" decoding="async" width="900" height="600">
        </div>
        <div class="project-card__body">
          <div class="project-card__top">
            <h3 class="project-card__title">${p.title}</h3>
            <span class="project-card__period">${p.period}</span>
          </div>
          <p class="project-card__summary">${p.summary}</p>
          <details class="project-card__more">
            <summary>Key highlights ${Icons.get('chevronDown')}</summary>
            <ul class="check-list">${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
          </details>
          <div class="project-card__foot">
            <div class="tag-row">${p.tags.slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join('')}</div>
            ${link ? `<a class="project-card__link" href="${link.href}" target="_blank" rel="noopener" aria-label="${p.title} on ${link.label}">${Icons.get('github')}${link.label}</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function initFilters(container, cards) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      container.querySelectorAll('.filter-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const scope = btn.dataset.filter;
      cards.forEach((card) => {
        card.hidden = !(scope === 'all' || card.dataset.category === scope);
        card.classList.add('reveal--visible');
      });
    });
  }

  // Projects with a `live` block become TV channels (see js/tv.js).
  let liveProjects = [];

  function renderProjects(projects) {
    setText('projects-eyebrow', projects.eyebrow);
    setText('projects-title', projects.title);
    setText('projects-desc', projects.description);

    // "active" acts as a publish flag: false hides a project entirely
    // without deleting its data.
    const visible = projects.items.filter((p) => p.active !== false);
    liveProjects = visible.filter((p) => p.live);
    const rest = visible.filter((p) => !p.featured);

    const featured = document.getElementById('projects-featured');
    if (featured) featured.innerHTML = visible.filter((p) => p.featured && p.live).map(renderFeatured).join('');

    const grid = document.getElementById('projects-grid');
    if (grid) grid.innerHTML = rest.map(renderCard).join('');

    const filters = document.getElementById('project-filters');
    if (filters && grid) {
      filters.innerHTML = projects.filters.map((f, i) => {
        const count = f.value === 'all' ? rest.length : rest.filter((p) => p.category === f.value).length;
        if (!count) return '';
        return `<button class="filter-btn" type="button" data-filter="${f.value}" aria-pressed="${i === 0}">${f.label}<span class="filter-btn__count">${count}</span></button>`;
      }).join('');
      initFilters(filters, grid.querySelectorAll('.project-card'));
    }
  }

  /* ---------------- GitHub section header ---------------- */
  function renderGithubHeader(gh) {
    setText('github-eyebrow', gh.eyebrow);
    setText('github-title', gh.title);
    setText('github-desc', gh.description);
  }

  /* ---------------- Experience / Education ---------------- */
  function renderTimeline(containerId, section) {
    setText(section.eyebrowId, section.data.eyebrow);
    setText(section.titleId, section.data.title);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = section.data.items.map((item) => `
      <div class="timeline-item card reveal">
        <div class="timeline-item__head">
          <div>
            <div class="timeline-item__role">${item.title}</div>
            <div class="timeline-item__company">${item.company}</div>
          </div>
          <span class="timeline-item__period">${item.period}${item.type ? ' · ' + item.type : ''}</span>
        </div>
        <ul class="check-list">
          ${item.points.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  function renderCertifications(list) {
    const grid = document.getElementById('certifications-grid');
    if (!grid || !list || !list.length) {
      const section = document.getElementById('certifications');
      if (section && (!list || !list.length)) section.style.display = 'none';
      return;
    }
    grid.innerHTML = list.map((c) => `
      <div class="cert-card card reveal">
        <div class="cert-card__icon">${Icons.get('graduation')}</div>
        <div>
          <h3>${c.title}</h3>
          <p>${c.issuer} &middot; ${c.period}</p>
        </div>
      </div>
    `).join('');
  }

  /* ---------------- Contact ---------------- */
  function renderContact(contact) {
    setText('contact-eyebrow', contact.eyebrow);
    setText('contact-title', contact.title);
    setText('contact-desc', contact.description);

    const channels = document.getElementById('contact-channels');
    if (channels) {
      channels.innerHTML = contact.channels.map((c) => {
        const tag = c.href ? 'a' : 'div';
        const hrefAttr = c.href ? ` href="${c.href}"` : '';
        return `
          <${tag} class="contact-channel"${hrefAttr}>
            <div class="contact-channel__icon">${Icons.get(c.icon)}</div>
            <div>
              <div class="contact-channel__label">${c.label}</div>
              <div class="contact-channel__value">${c.value.replace('@', '@<wbr>')}</div>
            </div>
          </${tag}>
        `;
      }).join('');
    }
  }

  /* ---------------- Footer ---------------- */
  function renderFooter(footer) {
    setText('footer-copy', `\u00A9 ${new Date().getFullYear()} ${footer.copy}`);
    const socials = document.getElementById('footer-socials');
    if (socials) {
      socials.innerHTML = footer.socials.map((s) => `
        <a class="icon-btn" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${Icons.get(s.label.toLowerCase())}</a>
      `).join('');
    }
  }

  function renderMeta(site) {
    if (site.title) document.title = site.title;
    const brandText = document.getElementById('brand-text');
    if (brandText && site.shortName) brandText.innerHTML = `${site.shortName}<span>.dev</span>`;
  }

  async function init() {
    const data = await loadContent();
    renderMeta(data.site);
    renderNavigation(data.navigation);
    renderHero(data.hero);
    renderStats(data.stats);
    renderGithubHeader(data.github);
    renderAbout(data.about);
    renderSkills(data.skills);
    renderProjects(data.projects);
    renderTimeline('experience-timeline', { data: data.experience, eyebrowId: 'experience-eyebrow', titleId: 'experience-title' });
    renderTimeline('education-timeline', { data: data.education, eyebrowId: 'education-eyebrow', titleId: 'education-title' });
    renderCertifications(data.education.certifications);
    renderContact(data.contact);
    renderFooter(data.footer);
    return data;
  }

  return { init, loadContent, getLiveProjects: () => liveProjects };
})();
