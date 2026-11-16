'use strict';
// PL: rozszerzone statystyki dla strony meshcoresouth.pl/statystyki.php
// - rekordy (najdłuższe łącze, najlepszy SNR na łączu ≥ 10 km, najdłuższa trasa) za dobę, 7 dni, 30 dni i od początku
// - nowe węzły, kanały publiczne, aktywne rejony, pokrycie strefy
// - historia: jedna linijka podsumowania na dzień (plik statystyki-dzienne.json, do 2 lat), mapa cieplna tydzień × godzina
const fs = require('fs');
const path = require('path');

const STREFA = 'Europe/Warsaw';
const DZIEN = 86400000;
const fmtDzien = new Intl.DateTimeFormat('sv-SE', { timeZone: STREFA, year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtGodz = new Intl.DateTimeFormat('en-GB', { timeZone: STREFA, hour: '2-digit', hourCycle: 'h23', weekday: 'short' });
const DNI_TYG = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
const dzienPL = (t) => fmtDzien.format(new Date(t));
function godzinaPL(t) {
  const c = Object.fromEntries(fmtGodz.formatToParts(new Date(t)).map((p) => [p.type, p.value]));
  return { h: Number(c.hour) % 24, d: DNI_TYG[c.weekday] ?? 0 };
}
// Początek doby (północ czasu polskiego) zawierającej chwilę t
function poczatekDnia(t) {
  const d = dzienPL(t);
  let s = Date.parse(d + 'T00:00:00Z') - 3 * 3600000;
  while (dzienPL(s) !== d) s += 1800000;
  return s;
}

// Miejscowości do grupowania aktywnych węzłów w rejony (Południe Polski i okolice)
const MIASTA = [
  ['Katowice', 50.259, 19.021], ['Bielsko-Biała', 49.822, 19.044], ['Kraków', 50.062, 19.937], ['Opole', 50.675, 17.921],
  ['Wrocław', 51.107, 17.038], ['Gliwice', 50.294, 18.672], ['Rybnik', 50.098, 18.546], ['Częstochowa', 50.811, 19.120],
  ['Tychy', 50.123, 18.987], ['Żywiec', 49.686, 19.192], ['Cieszyn', 49.749, 18.633], ['Nowy Sącz', 49.625, 20.692],
  ['Nowy Targ', 49.477, 20.032], ['Zakopane', 49.299, 19.950], ['Tarnów', 50.012, 20.989], ['Wadowice', 49.883, 19.493],
  ['Oświęcim', 50.034, 19.211], ['Jelenia Góra', 50.904, 15.719], ['Wałbrzych', 50.771, 16.284], ['Legnica', 51.207, 16.155],
  ['Racibórz', 50.092, 18.219], ['Kędzierzyn-Koźle', 50.349, 18.226], ['Nysa', 50.474, 17.334], ['Sosnowiec', 50.286, 19.104],
  ['Zawiercie', 50.488, 19.418], ['Myślenice', 49.834, 19.938], ['Bochnia', 49.969, 20.430], ['Chrzanów', 50.135, 19.403],
  ['Pszczyna', 49.978, 18.954], ['Jastrzębie-Zdrój', 49.958, 18.592], ['Kłodzko', 50.435, 16.661], ['Głogów', 51.664, 16.084],
  ['Lubin', 51.401, 16.201], ['Bolesławiec', 51.262, 15.570], ['Brzeg', 50.861, 17.469], ['Kluczbork', 50.973, 18.218],
  ['Gorlice', 49.655, 21.160], ['Limanowa', 49.706, 20.422], ['Sucha Beskidzka', 49.741, 19.588], ['Wisła', 49.655, 18.860],
  ['Ustroń', 49.721, 18.811], ['Mikołów', 50.170, 18.904], ['Zabrze', 50.325, 18.786], ['Bytom', 50.348, 18.916],
  ['Dąbrowa Górnicza', 50.322, 19.187], ['Jaworzno', 50.205, 19.274], ['Żory', 50.045, 18.700], ['Wodzisław Śląski', 50.004, 18.462],
  ['Lubliniec', 50.669, 18.684], ['Olkusz', 50.281, 19.565], ['Świdnica', 50.844, 16.488], ['Ostrawa (CZ)', 49.820, 18.262],
];

function odlKm(a, b) {
  const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
}

function creerStatystyki({ db, config, liczPokrycie, journal = () => {} }) {
  const plik = path.join(path.dirname(config.fichierBase), 'statystyki-dzienne.json');
  let magazyn = { dni: {} };
  try { magazyn = JSON.parse(fs.readFileSync(plik, 'utf8')); if (!magazyn.dni) magazyn.dni = {}; } catch { /* pierwszy start */ }
  const zapisz = () => { try { fs.writeFileSync(plik + '.tmp', JSON.stringify(magazyn)); fs.renameSync(plik + '.tmp', plik); } catch (e) { journal('[Statystyki] zapis:', e.message); } };

  const q = {
    noeuds: db.prepare('SELECT cle, nom, role, lat, lon, premier_vu, dernier_vu FROM mc_noeuds'),
    liens: db.prepare(`SELECT a, b, source, snr, nb, premier_vu, dernier_vu FROM mc_liens WHERE dernier_vu >= ? AND premier_vu < ? AND source IN ('rf', 'trace', 'voisinage', 'chemin')`),
    skoki: db.prepare('SELECT de, sauts, heure FROM mc_paquets WHERE heure >= ? AND heure < ? AND sauts IS NOT NULL AND sauts < 64 ORDER BY sauts DESC, heure DESC LIMIT 1'),
    pakietyCzas: db.prepare('SELECT heure FROM mc_paquets WHERE heure >= ? AND heure < ?'),
    licz: db.prepare('SELECT COUNT(*) n FROM mc_paquets WHERE heure >= ? AND heure < ?'),
    kanaly: db.prepare(`SELECT COALESCE(canal, '') canal, COUNT(*) nb FROM mc_paquets WHERE type = 'GRP_TXT' AND heure >= ? AND heure < ? GROUP BY canal ORDER BY nb DESC`),
    nadawcy: db.prepare('SELECT DISTINCT de FROM mc_paquets WHERE heure >= ? AND heure < ? AND de IS NOT NULL'),
    najstarszy: db.prepare('SELECT MIN(heure) t FROM mc_paquets'),
    trasy: db.prepare('SELECT de, chemin, sauts, heure FROM mc_paquets WHERE heure >= ? AND heure < ? AND sauts >= 2 AND sauts < 64 AND chemin IS NOT NULL ORDER BY sauts DESC, heure DESC LIMIT 400'),
  };

  // ---- Najdłuższe łącza i trasy (do wizualizacji na mapie) ----
  const punkt = (n) => ({ nazwa: n.nom || n.cle.slice(0, 8), cle: n.cle, lat: +n.lat.toFixed(5), lon: +n.lon.toFixed(5) });
  function topLaczaOkna(od, doT, ile = 10) {
    const wezly = new Map(q.noeuds.all().map((n) => [n.cle, n]));
    const lista = [];
    for (const l of q.liens.all(od, doT)) {
      const a = wezly.get(l.a), b = wezly.get(l.b);
      if (!a || !b || a.lat == null || b.lat == null) continue;
      if (l.source === 'chemin' && (l.nb || 0) < 3) continue;
      const km = odlKm(a, b);
      if (km > (config.lienDistanceMaxKm || 120) || km < 1) continue;
      lista.push({ km: Math.round(km * 10) / 10, snr: l.snr != null ? Math.round(l.snr * 10) / 10 : null, zrodlo: l.source, a: punkt(a), b: punkt(b), czas: l.dernier_vu });
    }
    return lista.sort((x, y) => y.km - x.km).slice(0, ile);
  }
  // Trasa pakietu: nadawca → kolejne repeatery z prefiksów ścieżki (jednoznaczny albo najbliższy poprzedniemu punktowi)
  function topTrasyOkna(od, doT, ile = 10) {
    const wezly = q.noeuds.all();
    const mapa = new Map(wezly.map((n) => [n.cle, n]));
    const rpt = wezly.filter((n) => n.lat != null && ['repeteur', 'salon'].includes(n.role));
    const maxSkok = config.lienDistanceMaxKm || 120;
    const wyniki = [];
    for (const r of q.trasy.all(od, doT)) {
      let hopy; try { hopy = JSON.parse(r.chemin); } catch { continue; }
      if (!Array.isArray(hopy) || hopy.length < 2) continue;
      const pkt = [];
      const nad = mapa.get(r.de);
      if (nad && nad.lat != null) pkt.push(punkt(nad));
      let zle = false;
      for (const h of hopy) {
        const pref = String(h).toUpperCase();
        let c = rpt.filter((n) => n.cle.toUpperCase().startsWith(pref));
        if (!c.length) continue;
        const ost = pkt[pkt.length - 1];
        if (c.length > 1) { if (!ost) continue; c = [c.reduce((m, n) => (odlKm(ost, n) < odlKm(ost, m) ? n : m))]; }
        const p = punkt(c[0]);
        if (ost && ost.cle === p.cle) continue;
        if (ost && odlKm(ost, p) > maxSkok) { zle = true; break; }
        pkt.push(p);
      }
      if (zle || pkt.length < 3) continue;
      let km = 0; for (let i = 1; i < pkt.length; i++) km += odlKm(pkt[i - 1], pkt[i]);
      wyniki.push({ km: Math.round(km * 10) / 10, skoki: r.sauts, od: nad ? { nazwa: nad.nom || nad.cle.slice(0, 8), cle: nad.cle } : null, punkty: pkt, czas: r.heure, klucz: (r.de || '') + '|' + r.chemin });
    }
    const uniq = new Map();
    for (const w of wyniki) { const k = w.punkty.map((p) => p.cle.slice(0, 8)).join('>'); if (!uniq.has(k) || uniq.get(k).km < w.km) uniq.set(k, w); }
    return [...uniq.values()].sort((x, y) => y.km - x.km).slice(0, ile).map(({ klucz, ...w }) => w);
  }
  let cacheTop = { t: 0, dni: 0, v: null };
  function najdluzsze(dni = 30) {
    dni = Math.min(Math.max(Math.round(dni) || 30, 1), 365);
    if (cacheTop.v && cacheTop.dni === dni && Date.now() - cacheTop.t < 5 * 60000) return cacheTop.v;
    const teraz = Date.now(), od = teraz - dni * DZIEN;
    const okno = Math.min(dni, 7);
    let lacza = topLaczaOkna(teraz - okno * DZIEN, teraz + 1, 20), trasy = topTrasyOkna(teraz - okno * DZIEN, teraz + 1, 20);
    if (dni > 7) {
      const granica = dzienPL(od);
      for (const [d, v] of Object.entries(magazyn.dni)) { if (d < granica) continue; lacza = lacza.concat(v.topLacza || []); trasy = trasy.concat(v.topTrasy || []); }
    }
    const uL = new Map();
    for (const l of lacza) { const k = [l.a.cle, l.b.cle].sort().join('|'); if (!uL.has(k) || uL.get(k).czas < l.czas) uL.set(k, l); }
    const uT = new Map();
    for (const t of trasy) { const k = t.punkty.map((p) => p.cle.slice(0, 8)).join('>'); if (!uT.has(k) || uT.get(k).czas < t.czas) uT.set(k, t); }
    const v = { dni, lacza: [...uL.values()].sort((x, y) => y.km - x.km).slice(0, 10), trasy: [...uT.values()].sort((x, y) => y.km - x.km).slice(0, 10) };
    cacheTop = { t: Date.now(), dni, v };
    return v;
  }

  // ---- Rekordy w oknie [od, do) prosto z bazy (pakiety i łącza z ostatnich dni) ----
  function rekordyOkna(od, doT) {
    const wezly = new Map(q.noeuds.all().map((n) => [n.cle, n]));
    const opis = (n) => (n ? { nazwa: n.nom || n.cle.slice(0, 8), cle: n.cle } : null);
    let lacze = null, snr = null;
    for (const l of q.liens.all(od, doT)) {
      const a = wezly.get(l.a), b = wezly.get(l.b);
      if (!a || !b || a.lat == null || b.lat == null) continue;
      if (l.source === 'chemin' && (l.nb || 0) < 3) continue; // łącze z samych prefiksów ścieżki: dopiero gdy powtórzone
      const km = odlKm(a, b);
      if (km > (config.lienDistanceMaxKm || 120)) continue;
      if (!lacze || km > lacze.km) lacze = { km: Math.round(km * 10) / 10, a: opis(a), b: opis(b), czas: l.dernier_vu };
      if (l.snr != null && km >= 10 && (!snr || l.snr > snr.snr)) snr = { snr: Math.round(l.snr * 10) / 10, km: Math.round(km * 10) / 10, a: opis(a), b: opis(b), czas: l.dernier_vu };
    }
    const s = q.skoki.get(od, doT);
    const skoki = s ? { skoki: s.sauts, od: opis(wezly.get(s.de)) || (s.de ? { nazwa: s.de.slice(0, 8), cle: null } : null), czas: s.heure } : null;
    return { lacze, snr, skoki };
  }
  const lepszy = (a, b, k) => (!a ? b : !b ? a : (b[k] > a[k] ? b : a));
  function polacz(lista) {
    return lista.reduce((r, x) => ({ lacze: lepszy(r.lacze, x && x.lacze, 'km'), snr: lepszy(r.snr, x && x.snr, 'snr'), skoki: lepszy(r.skoki, x && x.skoki, 'skoki') }), { lacze: null, snr: null, skoki: null });
  }

  // ---- Podsumowanie jednego dnia (zapisywane na stałe) ----
  function podsumujDzien(start) {
    const koniec = start + DZIEN + 2 * 3600000; // doba ma 23–25 h przy zmianie czasu: koniec = następna północ
    const nastepny = poczatekDnia(koniec);
    const godziny = new Array(24).fill(0);
    for (const r of q.pakietyCzas.all(start, nastepny)) godziny[godzinaPL(r.heure).h]++;
    const wezly = new Map(q.noeuds.all().map((n) => [n.cle, n]));
    const nadawcy = q.nadawcy.all(start, nastepny).map((r) => r.de);
    const kanaly = q.kanaly.all(start, nastepny);
    return {
      pakiety: godziny.reduce((t, x) => t + x, 0),
      godziny,
      aktywne: nadawcy.length,
      repeatery: nadawcy.filter((c) => (wezly.get(c) || {}).role === 'repeteur').length,
      nowe: [...wezly.values()].filter((n) => n.premier_vu >= start && n.premier_vu < nastepny).length,
      kanaly: kanaly.reduce((t, k) => t + k.nb, 0),
      rekordy: rekordyOkna(start, nastepny),
      topLacza: topLaczaOkna(start, nastepny, 10),
      topTrasy: topTrasyOkna(start, nastepny, 10),
      pokrycie: null,
    };
  }

  // Zapis brakujących dni (tylko zakończonych); do 7 dni wstecz, bo tyle trzyma baza pakietów
  function uzupelnij() {
    const dzis = poczatekDnia(Date.now());
    const t0 = q.najstarszy.get().t;
    if (!t0) return;
    let zmiana = false;
    for (let k = 7; k >= 1; k--) {
      const s = poczatekDnia(dzis - k * DZIEN + 3600000);
      if (s + DZIEN <= t0) continue; // przed startem mapy
      const d = dzienPL(s);
      if (magazyn.dni[d] && !magazyn.dni[d].topLacza) { // dni zapisane przed dodaniem warstwy rekordów
        try { const k = poczatekDnia(s + DZIEN + 2 * 3600000); magazyn.dni[d].topLacza = topLaczaOkna(s, k, 10); magazyn.dni[d].topTrasy = topTrasyOkna(s, k, 10); zmiana = true; } catch { /* pomiń */ }
      }
      if (magazyn.dni[d]) continue;
      try { magazyn.dni[d] = podsumujDzien(s); zmiana = true; journal(`[Statystyki] podsumowanie ${d}: ${magazyn.dni[d].pakiety} pakietów`); } catch (e) { journal('[Statystyki]', d, e.message); }
    }
    // pokrycie wpisujemy do dnia wczorajszego (liczone raz na dobę)
    const wczoraj = dzienPL(dzis - 3600000);
    if (magazyn.dni[wczoraj] && magazyn.dni[wczoraj].pokrycie == null && pokrycie) { magazyn.dni[wczoraj].pokrycie = { pct: pokrycie.pct, km2: pokrycie.km2, rpt: pokrycie.rpt }; zmiana = true; }
    // przechowujemy 2 lata
    const granica = dzienPL(Date.now() - 730 * DZIEN);
    for (const d of Object.keys(magazyn.dni)) if (d < granica) { delete magazyn.dni[d]; zmiana = true; }
    if (!magazyn.od) { magazyn.od = t0; zmiana = true; }
    if (zmiana) zapisz();
  }

  // ---- Pokrycie strefy: ciężkie obliczenie, co 6 h ----
  let pokrycie = null;
  function odswiezPokrycie() {
    try { const r = liczPokrycie(); if (r) { pokrycie = { pct: r.pctZone, km2: Math.round(r.surfaceZoneKm2 || r.surfaceKm2 || 0), rpt: (r.sites || []).length, czas: Date.now() }; uzupelnij(); } } catch (e) { journal('[Statystyki] pokrycie:', e.message); }
  }

  // ---- Bieżące dodatki do statystyki.json ----
  let cache = { t: 0, v: null };
  function biezace() {
    if (Date.now() - cache.t < 60000 && cache.v) return cache.v;
    const teraz = Date.now();
    const wezly = q.noeuds.all();
    const od = magazyn.od || q.najstarszy.get().t || teraz;
    const dni = Object.entries(magazyn.dni);
    const z = (ileDni) => dni.filter(([d]) => d >= dzienPL(teraz - ileDni * DZIEN)).map(([, v]) => v.rekordy);
    const r24 = rekordyOkna(teraz - DZIEN, teraz + 1), r7 = rekordyOkna(teraz - 7 * DZIEN, teraz + 1);
    const rekordy = { doba: r24, tydzien: r7, miesiac: polacz([r7, ...z(30)]), zawsze: polacz([r7, ...dni.map(([, v]) => v.rekordy), magazyn.zawsze || null]) };
    // Nowe węzły
    const nowe24 = wezly.filter((n) => n.premier_vu >= teraz - DZIEN), nowe7 = wezly.filter((n) => n.premier_vu >= teraz - 7 * DZIEN);
    const noweRpt = nowe7.filter((n) => n.role === 'repeteur').sort((a, b) => b.premier_vu - a.premier_vu).slice(0, 12).map((n) => ({ nazwa: n.nom || n.cle.slice(0, 8), cle: n.cle, od: n.premier_vu }));
    // Kanały publiczne: tylko liczby, bez treści
    const kanaly = q.kanaly.all(teraz - DZIEN, teraz + 1).map((k) => ({ kanal: k.canal && !/^[0-9a-f]{2}$/i.test(k.canal) ? k.canal : null, nb: k.nb }));
    const kanalyRazem = kanaly.reduce((t, k) => t + k.nb, 0);
    const kanalyNazwane = new Map();
    for (const k of kanaly) { const n = k.kanal || 'kanały prywatne (zaszyfrowane)'; kanalyNazwane.set(n, (kanalyNazwane.get(n) || 0) + k.nb); }
    // Rejony: aktywne (24 h) węzły z pozycją przypisane do najbliższej miejscowości (do 30 km)
    const rejony = new Map();
    for (const n of wezly) {
      if (n.lat == null || !(n.dernier_vu >= teraz - DZIEN)) continue;
      let best = null, bd = 30;
      for (const [nazwa, lat, lon] of MIASTA) { const d = odlKm(n, { lat, lon }); if (d < bd) { bd = d; best = nazwa; } }
      if (!best) continue;
      const r = rejony.get(best) || { rejon: best, wezly: 0, repeatery: 0 };
      r.wezly++; if (n.role === 'repeteur') r.repeatery++;
      rejony.set(best, r);
    }
    const v = {
      od,
      rekordy,
      nowe: { doba: nowe24.length, tydzien: nowe7.length, repeatery: noweRpt },
      kanaly: { doba: kanalyRazem, lista: [...kanalyNazwane.entries()].map(([kanal, nb]) => ({ kanal, nb })).sort((a, b) => b.nb - a.nb).slice(0, 8) },
      rejony: [...rejony.values()].sort((a, b) => b.wezly - a.wezly || b.repeatery - a.repeatery).slice(0, 10),
      pokrycie,
    };
    cache = { t: teraz, v };
    return v;
  }

  // ---- Historia: dni + mapa cieplna (ostatnie 28 dni; bieżący tydzień prosto z bazy) ----
  function historia() {
    const teraz = Date.now();
    const lista = Object.entries(magazyn.dni).sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([d, v]) => ({ dzien: d, pakiety: v.pakiety, aktywne: v.aktywne, repeatery: v.repeatery, nowe: v.nowe, kanaly: v.kanaly, pokrycie: v.pokrycie }));
    const cieplo = Array.from({ length: 7 }, () => new Array(24).fill(0));
    const ile = Array.from({ length: 7 }, () => 0);
    const dzisStart = poczatekDnia(teraz);
    // dni zapisane (bez ostatnich 7, które liczymy z bazy)
    const granica7 = dzienPL(dzisStart - 7 * DZIEN + 3600000), granica28 = dzienPL(dzisStart - 28 * DZIEN + 3600000);
    for (const [d, v] of Object.entries(magazyn.dni)) {
      if (d < granica28 || d >= granica7 || !v.godziny) continue;
      const dt = godzinaPL(Date.parse(d + 'T12:00:00Z')).d;
      ile[dt]++; v.godziny.forEach((n, h) => { cieplo[dt][h] += n; });
    }
    const t7 = poczatekDnia(dzisStart - 7 * DZIEN + 3600000);
    const widziane = new Set();
    for (const r of q.pakietyCzas.all(t7, dzisStart)) { const g = godzinaPL(r.heure); cieplo[g.d][g.h]++; widziane.add(dzienPL(r.heure)); }
    for (const d of widziane) ile[godzinaPL(Date.parse(d + 'T12:00:00Z')).d]++;
    const srednia = cieplo.map((w, d) => w.map((n) => (ile[d] ? Math.round((n / ile[d]) * 10) / 10 : 0)));
    return { od: magazyn.od || null, dni: lista.slice(-730), cieplo: { srednia, dniTygodnia: ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'], dni: ile } };
  }

  // Rekordy „od początku” zachowujemy też przy czyszczeniu starych dni
  function utrwalZawsze() {
    const r = polacz([magazyn.zawsze || null, ...Object.values(magazyn.dni).map((v) => v.rekordy)]);
    magazyn.zawsze = r;
  }

  setTimeout(() => { try { uzupelnij(); utrwalZawsze(); zapisz(); } catch (e) { journal('[Statystyki]', e.message); } }, 20000);
  setInterval(() => { try { uzupelnij(); utrwalZawsze(); } catch (e) { journal('[Statystyki]', e.message); } }, 30 * 60000);
  // pokrycie: pierwsze po 5 min (teren może się jeszcze wczytywać), potem co 6 h
  setInterval(() => { if (!pokrycie || Date.now() - pokrycie.czas > 6 * 3600000) odswiezPokrycie(); }, 10 * 60000);

  return { biezace, historia, najdluzsze, podsumujDzien, uzupelnij, odswiezPokrycie };
}

module.exports = { creerStatystyki, poczatekDnia, dzienPL };
