/**
 * icons.js — small inline SVG icon set. Kept dependency-free so the
 * portfolio has zero external icon-font/CDN requests.
 */
const Icons = (function () {
  'use strict';
  const svg = (inner, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra ? ' ' + extra : ''}>${inner}</svg>`;

  const set = {
    github: svg('<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.1-.5 2V21"/>'),
    linkedin: svg('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10.5v6M7.5 7.5v.01M12 16.5v-3.6a2.4 2.4 0 0 1 4.8 0v3.6M12 13v3.5"/>'),
    telegram: svg('<path d="M21 4 3 11.5l6 2M21 4 15.5 20l-6.5-6.5M21 4 8.5 13.5"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>'),
    phone: svg('<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>'),
    pin: svg('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),
    download: svg('<path d="M12 3v12m0 0-4-4m4 4 4-4M4 19.5h16"/>'),
    arrow: svg('<path d="M5 12h14m0 0-5-5m5 5-5 5"/>'),
    sun: svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>'),
    chevronUp: svg('<path d="m6 15 6-6 6 6"/>'),
    chevronDown: svg('<path d="m6 9 6 6 6-6"/>'),
    layers: svg('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 9v0"/>'),
    smartphone: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18h2"/>'),
    server: svg('<rect x="3" y="4" width="18" height="6.5" rx="1.8"/><rect x="3" y="13.5" width="18" height="6.5" rx="1.8"/><path d="M7 7.2h.01M7 16.7h.01"/>'),
    shield: svg('<path d="M12 3.5 19 6v6c0 4.5-3 7.6-7 8.5-4-.9-7-4-7-8.5V6l7-2.5Z"/><path d="m9 12 2 2 4-4.2"/>'),
    star: svg('<path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3Z"/>'),
    fork: svg('<circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 8v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8M12 13v3"/>'),
    briefcase: svg('<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 12.5h18"/>'),
    graduation: svg('<path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z"/><path d="M6 11.7V17c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5.3"/>'),
    check: svg('<path d="m5 13 4 4 10-10"/>'),
    external: svg('<path d="M14 4h6v6M20 4 10 14M8 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>'),
    tool: svg('<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L20 6l-3-3-2.3 3.3Z"/>'),
    activity: svg('<path d="M3 12h4l2-7 4 14 2-7h6"/>'),
  };

  return {
    get(name) { return set[name] || ''; },
  };
})();
