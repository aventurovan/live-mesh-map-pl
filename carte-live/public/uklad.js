'use strict';
// PL: nowy układ strony (komputer): górny pasek na całą szerokość, szyna sekcji z ikonami i podpisami po lewej,
// panel wysuwany po kliknięciu sekcji, pasek pakietów MeshCore na żywo na dole mapy.
// Telefon i tablet (do 900 px) zostają przy dotychczasowym układzie z szufladą.
(function () {
  const naKomputerze = () => window.matchMedia('(min-width: 901px)').matches;
  const t = (x) => (window.tr ? window.tr(x) : x);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function ulozUklad() {
    if (!naKomputerze() || document.body.classList.contains('uklad-nowy')) return;
    document.body.classList.add('uklad-nowy');
    const barre = document.querySelector('header.barre');
    const rech = document.querySelector('.recherche-lieu');
    const outils = document.querySelector('.outils');
    const groupes = document.querySelector('.panneau .groupes');
    if (barre && rech) barre.appendChild(rech);
    if (barre && outils) barre.appendChild(outils);
    if (groupes) {
      const szyna = document.createElement('nav');
      szyna.className = 'szyna';
      szyna.setAttribute('aria-label', 'Sekcje');
      document.body.appendChild(szyna);
      szyna.appendChild(groupes);
      // Kliknięcie sekcji: panel zwinięty → rozwiń; kliknięcie aktywnej sekcji przy otwartym panelu → zwiń
      groupes.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-groupe]');
        if (!b) return;
        const p = document.getElementById('panneau');
        if (!p) return;
        if (p.classList.contains('replie')) { const d = document.getElementById('deplier'); if (d) d.click(); }
        else if (b.classList.contains('actif')) { e.stopImmediatePropagation(); e.preventDefault(); const r = document.getElementById('replier'); if (r) r.click(); }
      }, true);
    }
  }

  // Pasek pakietów na żywo — na komputerze na dole mapy, na telefonie nad szufladą
  function dodajPasek() {
    if (document.querySelector('.pasek-pakietow')) return;
    const pasek = document.createElement('div');
    pasek.className = 'pasek-pakietow';
    pasek.innerHTML = '<button type="button" class="pp-na-zywo" title="Otwórz analizator pakietów">NA ŻYWO</button><div class="pp-lista" aria-live="off"><span class="pp-pusty">Czekam na pakiety…</span></div>';
    document.body.appendChild(pasek);
    pasek.querySelector('.pp-na-zywo').onclick = otworzAnalizator;
    pasek.querySelector('.pp-lista').onclick = otworzAnalizator;
  }

  function otworzAnalizator() {
    const p = document.getElementById('panneau');
    if (p && p.classList.contains('replie')) { const d = document.getElementById('deplier'); if (d) d.click(); }
    const g = document.querySelector('.groupes button[data-groupe="reseau"]'); if (g && !g.classList.contains('actif')) g.click();
    const o = document.querySelector('.onglets button[data-onglet="meshcore"]'); if (o && !o.hidden) o.click();
    setTimeout(() => { const s = document.querySelector('.sous-onglets-mc button[data-mc-vue="paquets"]'); if (s && !s.hidden) s.click(); }, 80);
  }

  // Wywoływane z meshcore.js dla każdego nowego pakietu (pierwszy odbiór)
  window.tickerPakietow = (m) => {
    if (!m || !m.premiere) return;
    const lista = document.querySelector('.pasek-pakietow .pp-lista');
    if (!lista) return;
    const pusty = lista.querySelector('.pp-pusty'); if (pusty) pusty.remove();
    const typ = typeof mcType === 'function' ? mcType(m.type) : { nom: m.type || '?', hex: '#999' };
    const kto = m.de && typeof mcNom === 'function' ? mcNom(m.de) : (m.expediteur && m.expediteur !== '…' ? m.expediteur : '');
    const czesci = [
      m.canal ? m.canal : null,
      m.sauts != null ? (m.sauts === 0 ? t('direct') : `${m.sauts} ${m.sauts === 1 ? 'skok' : m.sauts < 5 ? 'skoki' : 'skoków'}`) : null,
      m.snr != null ? `SNR ${String(Math.round(m.snr * 10) / 10).replace('.', ',')}` : null,
    ].filter(Boolean);
    const godz = new Date(m.heure || Date.now()).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const el = document.createElement('span');
    el.className = 'pp-pakiet nowy';
    el.innerHTML = `<i style="background:${esc(typ.hex)}"></i><span class="pp-godz">${godz}</span><b>${esc(t(typ.nom))}</b>${kto ? ` <span class="pp-kto">${esc(kto)}</span>` : ''}${czesci.length ? ` <span class="pp-info">· ${esc(czesci.join(' · '))}</span>` : ''}`;
    lista.prepend(el);
    setTimeout(() => el.classList.remove('nowy'), 1500);
    while (lista.children.length > 14) lista.lastElementChild.remove();
  };

  // Na start: kilka ostatnich pakietów z serwera, żeby pasek nie był pusty
  async function zasiejPasek() {
    try {
      const lista = document.querySelector('.pasek-pakietow .pp-lista');
      if (!lista || !lista.querySelector('.pp-pusty')) return;
      const r = await fetch('/api/mc/paquets?limite=8');
      if (!r.ok) return;
      const d = await r.json();
      const p = Array.isArray(d) ? d : (d.paquets || []);
      p.slice(0, 8).reverse().forEach((x) => window.tickerPakietow({ ...x, premiere: true }));
      lista.querySelectorAll('.nowy').forEach((e) => e.classList.remove('nowy'));
    } catch { /* bez paska startowego */ }
  }
  const start = () => { ulozUklad(); dodajPasek(); setTimeout(zasiejPasek, 2500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
