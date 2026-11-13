/* Cookie consent: banner + settings popup. The choice is saved in localStorage ("cookieConsent").
   Any future script (analytics, ads) should check window.getConsent().analytics / .marketing
   or listen for the "consentchange" event before it loads anything. */
(function () {
  const KEY = 'cookieConsent';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const save = c => {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('consentchange', { detail: c }));
  };
  window.getConsent = () => read() || { necessary: true, analytics: false, marketing: false };

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const holder = document.createElement('div');
  holder.innerHTML = `
    <div class="ck-banner" id="ck-banner" role="region" aria-label="Cookie notice" hidden>
      <p>We use essential storage to make this site work. With your permission we would also use analytics and marketing cookies. See our <a href="cookies.html">Cookie Policy</a>.</p>
      <div class="ck-actions">
        <button class="btn" data-ck="accept">Accept all</button>
        <button class="btn btn-ghost" data-ck="reject">Reject all</button>
        <button class="btn btn-ghost" data-ck="settings">Settings</button>
      </div>
    </div>
    <div class="modal" id="ck-modal" hidden>
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="ck-title">
        <button class="modal-close" aria-label="Close" data-ck="close">&times;</button>
        <h3 id="ck-title">Cookie settings</h3>
        <p class="sub">Choose which cookies we may use. You can change this at any time.</p>
        <div class="ck-row"><div><strong>Strictly necessary</strong><small>Remembers your choices and keeps the site working. Always on.</small></div>
          <label class="switch"><input type="checkbox" checked disabled><span></span></label></div>
        <div class="ck-row"><div><strong>Analytics</strong><small>Helps us understand how the site is used.</small></div>
          <label class="switch"><input type="checkbox" id="ck-analytics"><span></span></label></div>
        <div class="ck-row"><div><strong>Marketing</strong><small>Used for advertising and measuring ads.</small></div>
          <label class="switch"><input type="checkbox" id="ck-marketing"><span></span></label></div>
        <div class="ck-modal-actions">
          <button class="btn btn-ghost" data-ck="save">Save choices</button>
          <button class="btn" data-ck="accept">Accept all</button>
        </div>
      </div>
    </div>`;
  document.body.append(...holder.children);

  const banner = document.getElementById('ck-banner');
  const modal = document.getElementById('ck-modal');
  const an = document.getElementById('ck-analytics');
  const mk = document.getElementById('ck-marketing');

  const choose = (a, m) => {
    save({ necessary: true, analytics: a, marketing: m, date: new Date().toISOString() });
    banner.hidden = true; modal.hidden = true;
  };
  function openSettings() {
    const c = window.getConsent();
    an.checked = !!c.analytics; mk.checked = !!c.marketing;
    modal.hidden = false; an.focus();
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-cookie-settings]');
    if (link) { e.preventDefault(); openSettings(); return; }
    const btn = e.target.closest('[data-ck]');
    if (!btn) { if (e.target === modal) modal.hidden = true; return; }
    const act = btn.dataset.ck;
    if (act === 'accept') choose(true, true);
    else if (act === 'reject') choose(false, false);
    else if (act === 'save') choose(an.checked, mk.checked);
    else if (act === 'settings') openSettings();
    else if (act === 'close') modal.hidden = true;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) modal.hidden = true; });

  if (!read()) banner.hidden = false;
})();