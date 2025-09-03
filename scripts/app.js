// /scripts/app.js

(async function loadHeader(){
  const holder = document.getElementById('header-holder');
  if (!holder) return;

  try {
    const res = await fetch('/partials/header.html', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    holder.innerHTML = await res.text();
  } catch (err) {
    console.error('Header partial failed to load:', err);
    // Visible fallback so you can still navigate & see it's working
    holder.innerHTML = `
      <div class="container nav" style="background:#0f1117;border-bottom:1px solid var(--ring)">
        <a href="/documentation.html" class="brand" style="display:flex;gap:.6rem;align-items:center">
          <span style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#7c3aed);display:inline-block"></span>
          <strong>DocsApp</strong>
        </a>
        <nav id="top-tabs" class="pill" aria-label="Primary">
          <a href="/documentation.html">Documentation</a>
          <a href="/checklist.html">Checklist</a>
        </nav>
        <div class="controls">
          <select class="client" id="client">
            <option>ABC Company</option>
            <option>Bluevale Farms</option>
            <option>Fort44 Inc.</option>
          </select>
          <button class="menu-toggle" id="aside-toggle" aria-controls="page-aside" aria-expanded="false">☰</button>
        </div>
      </div>`;
  }

  // Highlight active tab
  const path = location.pathname;
  document.querySelectorAll('#top-tabs a').forEach(a => {
    const href = new URL(a.getAttribute('href'), location.origin).pathname;
    if (href === path) a.setAttribute('aria-current','page');
  });

  // Persist selected client across pages
  const KEY = 'docsapp:client';
  const select = document.getElementById('client');
  if (select) {
    const saved = localStorage.getItem(KEY);
    if (saved) select.value = saved;
    select.addEventListener('change', () => {
      localStorage.setItem(KEY, select.value);
      window.dispatchEvent(new CustomEvent('client:change', { detail: select.value }));
    });
  }

  // Toggle sidebar on mobile
  const asideBtn = document.getElementById('aside-toggle');
  const aside = document.getElementById('page-aside');
  if (asideBtn && aside) {
    asideBtn.addEventListener('click', () => {
      const hidden = aside.hasAttribute('hidden');
      if (hidden) aside.removeAttribute('hidden'); else aside.setAttribute('hidden','');
      asideBtn.setAttribute('aria-expanded', String(hidden));
    });
  }
})();
