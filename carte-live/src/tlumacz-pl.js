// PL: tłumaczenie tekstów z kodu (po francusku) na polski po stronie serwera – ten sam słownik i te same reguły
// co public/langue.js w przeglądarce (dokładne wpisy, wzorce z „{}”, początki zdań, kawałki „A · B”).
// Dla eksportów czytanych poza mapą (np. alerty na meshcoresouth.pl), gdzie nie ma langue.js.
const fs = require('fs');
const path = require('path');

let gotowe = null;
function zaladuj() {
  if (gotowe) return gotowe;
  const exact = new Map(), motifs = new Map(), prefixes = [], memo = new Map();
  const echap = (s) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  let dico = {};
  try { dico = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'i18n-pl.json'), 'utf8')); } catch { /* bez słownika: tekst bez zmian */ }
  for (const [fr, pl] of Object.entries(dico)) {
    if (!pl) continue;
    if (fr.includes('{}')) {
      const parts = fr.split('{}');
      let src = '^' + echap(parts[0]);
      for (let i = 1; i < parts.length; i++) src += (parts[i - 1] === '' && i > 1 ? '()' : /[a-zà-ÿ]$/i.test(parts[i - 1]) ? '(\\S{0,12}?)' : '([\\s\\S]*?)') + echap(parts[i]);
      const cle = (parts[0].match(/^(\S+)\s/) || ['', ''])[1];
      if (!motifs.has(cle)) motifs.set(cle, []);
      motifs.get(cle).push({ re: new RegExp(src + '$'), en: pl, morceaux: parts.filter((x) => x.trim()), poids: fr.replace(/\{\}/g, '').length });
    } else {
      exact.set(fr, pl);
      if (fr.length >= 6 && /[a-zà-ÿ]$|[:…]$/i.test(fr)) prefixes.push(fr);
    }
  }
  for (const l of motifs.values()) l.sort((a, b) => b.poids - a.poids);
  prefixes.sort((a, b) => b.length - a.length);
  const norme = (s) => s.replace(/\s+/g, ' ').trim();
  const phraseFr = (v) => v.length > 20 && /[a-zà-ÿ]{3,}[ ’'][a-zà-ÿ]{2,} [a-zà-ÿ]{3,}/i.test(v);
  function remplir(en, g) {
    const t = g.map((v) => (v == null ? '' : traduire(v, true)));
    if (g.some((v, i) => v && t[i] === v && phraseFr(v))) return null;
    let k = 0;
    return en.replace(/\{(\d*)\}/g, (_, n) => { const v = t[n === '' ? k++ : Number(n)]; return v == null ? '' : v; });
  }
  function traduire(t, interne) {
    const s = norme(String(t));
    if (!s || !/[a-zà-ÿ]/i.test(s)) return t;
    if (memo.has(s)) return memo.get(s);
    let r = exact.get(s);
    if (r == null && s.length <= 800) {
      const premier = (s.match(/^\S+/) || [''])[0];
      for (const cle of [premier, '']) {
        const l = motifs.get(cle);
        if (!l) continue;
        for (const m of l) { if (s.length > m.poids + 160 || !m.morceaux.every((x) => s.includes(x))) continue; const g = m.re.exec(s); if (g) { r = remplir(m.en, g.slice(1)); if (r != null) break; } }
        if (r != null) break;
      }
    }
    if (r == null && !interne) {
      for (const p of prefixes) if (s.length > p.length + 1 && s.startsWith(p) && /^[\s:]*[A-Z0-9!«“"'(À-Ý]/.test(s.slice(p.length))) { r = exact.get(p) + s.slice(p.length); break; }
    }
    if (r == null && s.includes(' · ')) {
      const cz = s.split(' · '), tl = cz.map((c) => traduire(c, true));
      if (tl.some((x, i) => x !== cz[i])) r = tl.join(' · ');
    }
    if (r == null) r = t;
    if (memo.size > 5000) memo.clear();
    memo.set(s, r);
    return r;
  }
  gotowe = (t) => traduire(t);
  return gotowe;
}
module.exports = { tlumacz: (t) => zaladuj()(t) };
