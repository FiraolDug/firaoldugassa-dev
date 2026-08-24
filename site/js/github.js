/**
 * github.js — pulls live profile + repository data from the public GitHub
 * REST API (no auth, no build step) and renders it into the "GitHub"
 * section. Falls back to a static, honest message if the network call
 * fails (offline preview, rate limiting, sandboxed environments, etc.)
 * rather than showing fabricated numbers.
 */
const GithubPanel = (function () {
  'use strict';

  const LANG_COLORS = {
    Dart: '#00B4AB', JavaScript: '#f1e05a', TypeScript: '#3178c6', Java: '#b07219',
    Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', Kotlin: '#A97BFF',
    Swift: '#F05138', Shell: '#89e051', C: '#555555', 'C++': '#f34b7d',
    Go: '#00ADD8', Ruby: '#701516', PHP: '#4F5D95', Vue: '#41b883',
  };

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} mo ago`;
    return `${Math.floor(months / 12)} yr ago`;
  }

  function renderSkeleton() {
    const profile = document.getElementById('gh-profile');
    const list = document.getElementById('gh-repo-list');
    if (profile) {
      profile.innerHTML = `
        <div class="gh-profile__head">
          <div class="skeleton" style="width:3.4rem;height:3.4rem;border-radius:50%;"></div>
          <div style="flex:1">
            <div class="skeleton" style="width:70%;height:1rem;margin-bottom:.5rem;"></div>
            <div class="skeleton" style="width:45%;height:.8rem;"></div>
          </div>
        </div>
        <div class="skeleton" style="width:100%;height:2.5rem;"></div>
        <div class="gh-profile__stats">
          ${[0,1,2].map(() => '<div class="skeleton" style="height:3.4rem;border-radius:14px;"></div>').join('')}
        </div>
      `;
    }
    if (list) {
      list.innerHTML = [0,1,2,3].map(() => '<div class="skeleton" style="height:5.4rem;border-radius:14px;"></div>').join('');
    }
  }

  function renderProfile(user, repoCount, starTotal) {
    const profile = document.getElementById('gh-profile');
    if (!profile) return;
    profile.innerHTML = `
      <div class="gh-profile__head">
        <div class="gh-profile__avatar"><img src="${user.avatar_url}&s=120" alt="${user.login} GitHub avatar" loading="lazy"></div>
        <div>
          <div class="gh-profile__name">${user.name || user.login}</div>
          <div class="gh-profile__handle">@${user.login}</div>
        </div>
      </div>
      ${user.bio ? `<p class="gh-profile__bio">${user.bio}</p>` : ''}
      <div class="gh-profile__stats">
        <div class="gh-profile__stat"><b>${repoCount}</b><span>Repos</span></div>
        <div class="gh-profile__stat"><b>${user.followers}</b><span>Followers</span></div>
        <div class="gh-profile__stat"><b>${starTotal}</b><span>Stars</span></div>
      </div>
      <a class="btn btn--secondary btn--sm" href="${user.html_url}" target="_blank" rel="noopener">${Icons.get('github')}<span>View profile</span></a>
    `;
  }

  function renderRepos(repos) {
    const list = document.getElementById('gh-repo-list');
    if (!list) return;
    if (!repos.length) {
      list.innerHTML = `<p class="gh-note">No public repositories returned by the API.</p>`;
      return;
    }
    list.innerHTML = repos.map((r) => `
      <a class="gh-repo" href="${r.html_url}" target="_blank" rel="noopener">
        <div class="gh-repo__row1">
          <span class="gh-repo__name"><span>/</span> ${r.name}</span>
          <span class="gh-repo__meta">
            ${r.language ? `<span class="gh-repo__meta-item"><span class="gh-repo__lang-dot" style="background:${LANG_COLORS[r.language] || '#8b93ab'}"></span>${r.language}</span>` : ''}
            <span class="gh-repo__meta-item">${Icons.get('star')}${r.stargazers_count}</span>
            <span class="gh-repo__meta-item">${Icons.get('fork')}${r.forks_count}</span>
          </span>
        </div>
        <p class="gh-repo__desc">${r.description ? r.description : 'Updated ' + timeAgo(r.pushed_at)}</p>
      </a>
    `).join('');
  }

  function renderFallback(fallback, reason) {
    const profile = document.getElementById('gh-profile');
    const list = document.getElementById('gh-repo-list');
    if (profile) {
      profile.innerHTML = `
        <div class="gh-profile__head">
          <div class="gh-profile__avatar" style="display:grid;place-items:center;color:var(--amber);font-family:var(--font-mono);">FD</div>
          <div>
            <div class="gh-profile__name">Firaol Dugassa</div>
            <div class="gh-profile__handle">@FiraolDug</div>
          </div>
        </div>
        <div class="gh-profile__stats">
          <div class="gh-profile__stat"><b>${fallback.repos}</b><span>Repos</span></div>
          <div class="gh-profile__stat"><b>${fallback.followers}</b><span>Followers</span></div>
          <div class="gh-profile__stat"><b>${fallback.stars}</b><span>Stars</span></div>
        </div>
        <a class="btn btn--secondary btn--sm" href="https://github.com/FiraolDug" target="_blank" rel="noopener">${Icons.get('github')}<span>View on GitHub</span></a>
      `;
    }
    if (list) {
      list.innerHTML = `<p class="gh-note">${fallback.note}${reason ? ' (' + reason + ')' : ''}</p>`;
    }
  }

  async function init(config) {
    renderSkeleton();
    const username = config.username;
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
      ]);
      if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API responded with an error');
      const user = await userRes.json();
      let repos = await reposRes.json();
      if (!Array.isArray(repos)) throw new Error('Unexpected repos payload');

      repos = repos.filter((r) => !r.fork);
      const starTotal = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      const topRepos = [...repos]
        .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
        .slice(0, 6);

      renderProfile(user, user.public_repos, starTotal);
      renderRepos(topRepos);
    } catch (err) {
      renderFallback(config.fallback, err && err.message);
    }
  }

  return { init };
})();
