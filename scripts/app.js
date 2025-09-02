// Load the shared header and wire up interactions
(async function loadHeader(){
const headerHolder = document.getElementById('header-holder');
if (!headerHolder) return;
const res = await fetch('/partials/header.html', { cache: 'no-cache' });
headerHolder.innerHTML = await res.text();


// Active tab based on path
const path = location.pathname;
const tabs = document.querySelectorAll('#top-tabs a');
tabs.forEach(a => {
const href = new URL(a.getAttribute('href'), location.origin).pathname;
if (href === path) a.setAttribute('aria-current','page');
});


// Client picker: persist across pages
const select = document.getElementById('client');
const KEY = 'docsapp:client';
const saved = localStorage.getItem(KEY);
if (saved) select.value = saved;
select.addEventListener('change', ()=>{
localStorage.setItem(KEY, select.value);
// optional: emit a custom event so pages can react
window.dispatchEvent(new CustomEvent('client:change', { detail: select.value }));
});


// Mobile aside toggle
const asideBtn = document.getElementById('aside-toggle');
const aside = document.getElementById('page-aside');
asideBtn?.addEventListener('click', ()=>{
const hidden = aside?.hasAttribute('hidden');
if (!aside) return;
if (hidden) { aside.removeAttribute('hidden'); } else { aside.setAttribute('hidden',''); }
asideBtn.setAttribute('aria-expanded', String(hidden));
});
})();


// Utility you can use on any page to read selected client
window.getSelectedClient = () => localStorage.getItem('docsapp:client')scripts/app.js
