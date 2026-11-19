'use strict';
// Santé de la carte elle-même : processeur, mémoire, réactivité, disque, base de données, MQTT, clients connectés.
// Un échantillon par minute, gardé 24 h en mémoire, et des alertes quand la carte souffre.
const fs = require('fs');
const path = require('path');
const { monitorEventLoopDelay } = require('perf_hooks');

function lireLimiteMemoire() {
  for (const f of ['/sys/fs/cgroup/memory.max', '/sys/fs/cgroup/memory/memory.limit_in_bytes']) {
    try { const v = fs.readFileSync(f, 'utf8').trim(); if (v !== 'max') { const n = Number(v); if (n > 0 && n < 2 ** 52) return n; } } catch { /* absent */ }
  }
  return null;
}

function creerSanteCarte({ dossier, fichierBase, version, sources }) {
  const delai = monitorEventLoopDelay({ resolution: 20 });
  delai.enable();
  const limiteMem = lireLimiteMemoire();
  let cpuAvant = process.cpuUsage(), tAvant = process.hrtime.bigint();
  const echantillons = []; // 24 h, un par minute
  let dernier = null;

  function echantillonner() {
    const t = process.hrtime.bigint(), cpu = process.cpuUsage(cpuAvant);
    const ecouleUs = Number(t - tAvant) / 1000;
    cpuAvant = process.cpuUsage(); tAvant = t;
    const mem = process.memoryUsage();
    const e = {
      heure: Date.now(),
      cpuPct: Math.round(((cpu.user + cpu.system) / ecouleUs) * 1000) / 10,
      memMo: Math.round(mem.rss / 1048576), tasMo: Math.round(mem.heapUsed / 1048576),
      latenceP99: Math.round(delai.percentile(99) / 1e6), latenceMax: Math.round(delai.max / 1e6),
    };
    delai.reset();
    try { Object.assign(e, sources.mqtt()); } catch { /* ignoré */ }
    echantillons.push(e);
    if (echantillons.length > 1440) echantillons.shift();
    dernier = e;
  }
  setInterval(echantillonner, 60000).unref();
  setTimeout(echantillonner, 5000).unref();

  function etat() {
    const e = dernier || {};
    let disque = null;
    try { const s = fs.statfsSync(dossier); disque = { libreGo: Math.round((s.bavail * s.bsize) / 1e8) / 10, totalGo: Math.round((s.blocks * s.bsize) / 1e8) / 10 }; } catch { /* Node trop ancien */ }
    let base = null;
    try {
      const b = sources.base ? sources.base() : {};
      const wal = fs.existsSync(fichierBase + '-wal') ? Math.round(fs.statSync(fichierBase + '-wal').size / 1048576) : 0;
      base = { ...b, walMo: wal };
    } catch { /* ignoré */ }
    const mqtt = sources.mqttEtat ? sources.mqttEtat() : {};
    const alertes = [];
    const ajout = (niveau, message) => alertes.push({ niveau, message });
    if (e.latenceP99 > 2000) ajout('critique', `Mapa się zawiesza: do ${(e.latenceP99 / 1000).toFixed(1)} s bez odpowiedzi (ostatnia minuta)`);
    else if (e.latenceP99 > 500) ajout('attention', `Mapa reaguje wolniej: opóźnienie do ${e.latenceP99} ms (ostatnia minuta)`);
    if (limiteMem && e.memMo > (limiteMem / 1048576) * 0.85) ajout('attention', `Pamięć prawie pełna: ${e.memMo} MB z dozwolonych ${Math.round(limiteMem / 1048576)} MB`);
    if (e.cpuPct > 80) ajout('attention', `Procesor mocno obciążony: ${e.cpuPct} % jednego rdzenia`);
    if (disque && disque.libreGo / disque.totalGo < 0.1) ajout('critique', `Dysk prawie pełny: wolne ${disque.libreGo} GB`);
    if (base && base.totalMo > 2048) ajout('attention', `Duża baza danych: ${base.totalMo} MB`);
    if (!mqtt.connecte) ajout('critique', 'Broker MQTT rozłączony');
    else if (mqtt.dernierMessage && Date.now() - mqtt.dernierMessage > 5 * 60000) ajout('attention', `Brak wiadomości MQTT od ${Math.round((Date.now() - mqtt.dernierMessage) / 60000)} min`);
    return {
      version, demarrage: Date.now() - Math.round(process.uptime() * 1000),
      limiteMemMo: limiteMem ? Math.round(limiteMem / 1048576) : null,
      dernier: e, disque, base, mqtt, clients: sources.clients ? sources.clients() : null,
      alertes, niveau: alertes.some((a) => a.niveau === 'critique') ? 'critique' : alertes.length ? 'attention' : 'ok',
      historique: echantillons.slice(-180),
    };
  }
  return { etat };
}

module.exports = { creerSanteCarte };
