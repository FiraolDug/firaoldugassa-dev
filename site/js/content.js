/**
 * content.js — loads data/site-content.json and renders every section.
 * Keeping content in JSON separates copy from markup and makes the whole
 * site trivially editable without touching HTML.
 */
const PortfolioContent = (function () {
  'use strict';

  async function loadContent() {
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
    setText('hero-eyebrow', hero.eyebrow);
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
        <span class="hero__meta-item">${Icons.get('activity')}${hero.availability}</span>
      `;
    }

    const actions = document.getElementById('hero-actions');
    if (actions) {
      actions.innerHTML = hero.actions.map((a) => {
        const cls = a.variant === 'primary' ? 'btn btn--primary' : a.variant === 'secondary' ? 'btn btn--secondary' : 'btn btn--ghost';
        const icon = a.download ? Icons.get('download') : a.variant === 'primary' ? Icons.get('arrow') : '';
        const dl = a.download ? ' download' : '';
        return `<a class="${cls}" href="${a.href}"${dl}>${icon}<span>${a.label}</span></a>`;
      }).join('');
    }

    const socials = document.getElementById('hero-socials');
    if (socials) {
      socials.innerHTML = hero.socials.map((s) => `
        <a class="btn--icon" href="${s.href}" target="${s.href.startsWith('http') ? '_blank' : '_self'}" rel="noopener" aria-label="${s.label}">${Icons.get(s.icon)}</a>
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
          <p class="focus-card__label">// focus</p>
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
          <div class="skill-bar"><div class="skill-bar__fill" data-level="${s.level}"></div></div>
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
  function renderProjects(projects) {
    setText('projects-eyebrow', projects.eyebrow);
    setText('projects-title', projects.title);
    setText('projects-desc', projects.description);

    const filters = document.getElementById('project-filters');
    if (filters) {
      filters.innerHTML = projects.filters.map((f, i) => `
        <button class="filter-btn${i === 0 ? ' filter-btn--active' : ''}" data-filter="${f.value}" role="tab" aria-selected="${i === 0}">${f.label}</button>
      `).join('');
    }

    const grid = document.getElementById('projects-grid');
    if (grid) {
      grid.innerHTML = projects.items.map((p) => `
        <article class="project-card card reveal" data-category="${p.category}">
          <div class="project-card__media">
            <span class="badge badge--good project-card__status"><span class="badge__dot"></span>${p.status}</span>
            <img src="${p.image}" alt="${p.title} cover graphic" loading="lazy" width="900" height="600">
          </div>
          <div class="project-card__body">
            <div class="project-card__top">
              <h3 class="project-card__title">${p.title}</h3>
              <span class="project-card__period">${p.period}</span>
            </div>
            <p class="project-card__role">${p.role}</p>
            <p class="project-card__summary">${p.summary}</p>
            <ul class="project-card__highlights">
              ${p.highlights.map((h) => `<li>${h}</li>`).join('')}
            </ul>
            <div class="project-card__tags">
              ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="project-card__links">
            ${p.links.map((l) => `<a class="btn btn--secondary btn--sm" href="${l.href}" target="_blank" rel="noopener">${Icons.get('github')}<span>${l.label}</span></a>`).join('')}
          </div>
        </article>
      `).join('');
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
          <span class="timeline-item__period">${item.period}${item.type ? ' &middot; ' + item.type : ''}</span>
        </div>
        <ul class="timeline-item__points">
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
              <div class="contact-channel__value">${c.value}</div>
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
        <a class="btn--icon" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${Icons.get(s.label.toLowerCase())}</a>
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

  return { init, loadContent };
})();
