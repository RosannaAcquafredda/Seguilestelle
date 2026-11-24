(function () {
  'use strict';

  var C = window.TLR_CONFIG;
  var area = document.querySelector('[data-tlr-programma]');
  if (!C || !area) { return; }

  var COMUNI = C.comuni || [];
  var COMUNE = {};
  COMUNI.forEach(function (c, i) { c.ordine = i; COMUNE[c.id] = c; });

  var RIDOTTO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TITOLO_PAGINA = document.title;

  /* ---------- utilità ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function plurale(n, uno, molti) { return n + ' ' + (n === 1 ? uno : molti); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function urlSicuro(u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|\/(?!\/)|\.\/)/i.test(u) ? u : '';
  }
  function soloUrl(x) { return typeof x === 'string' ? x : (x && (x.url || x.src)) || ''; }
  function nomeFile(u) {
    try { return decodeURIComponent(u.split('?')[0].split('/').filter(Boolean).pop() || u); } catch (e) { return u; }
  }

  /* HTML della descrizione: si tengono solo i tag di testo, si tolgono attributi, stili e script. */
  var TAG_OK = { P: 1, BR: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, H2: 1, H3: 1, H4: 1, UL: 1, OL: 1, LI: 1, A: 1, BLOCKQUOTE: 1 };
  var TAG_VIA = /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|TEMPLATE|NOSCRIPT|FORM|INPUT|BUTTON|SELECT|TEXTAREA|SVG|MATH|IMG|VIDEO|AUDIO)$/;
  function pulisci(html) {
    if (!html) { return ''; }
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    var radice = doc.body.firstElementChild;
    (function giro(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (f) {
        if (f.nodeType === 3) { return; }
        if (f.nodeType !== 1 || TAG_VIA.test(f.tagName)) { n.removeChild(f); return; }
        giro(f);
        if (!TAG_OK[f.tagName]) {
          while (f.firstChild) { n.insertBefore(f.firstChild, f); }
          n.removeChild(f);
          return;
        }
        var href = f.tagName === 'A' ? f.getAttribute('href') : null;
        Array.prototype.slice.call(f.attributes).forEach(function (a) { f.removeAttribute(a.name); });
        if (href && /^(https?:|mailto:|tel:)/i.test(href.trim())) {
          f.setAttribute('href', href.trim());
          if (/^https?:/i.test(href.trim())) { f.setAttribute('target', '_blank'); f.setAttribute('rel', 'noopener'); }
        }
      });
    })(radice);
    return radice.innerHTML;
  }
  /* Testo semplice con link e indirizzi email resi cliccabili (es. descrizione della rassegna). */
  function testoConLink(t) {
    return esc(t || '').trim()
      .replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '<a href="mailto:$1">$1</a>')
      .replace(/\r?\n/g, '<br>');
  }

  /* ---------- date ----------
   * L'elenco usa "07-11-2026 09:00" (ora locale italiana), le sessioni e la rassegna l'ISO in UTC.
   * Tutto viene portato a "parti" nell'ora di Roma: { y, m, d, h, mi }. */
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var FMT = null;
  try {
    FMT = new Intl.DateTimeFormat('it-IT', { timeZone: C.fuso || 'Europe/Rome', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  } catch (e) { FMT = null; }
  function partiDa(dt) {
    if (!FMT || !FMT.formatToParts) {
      return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours(), mi: dt.getMinutes() };
    }
    var o = {};
    FMT.formatToParts(dt).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: (+o.hour) % 24, mi: +o.minute };
  }
  function parti(s) {
    if (!s) { return null; }
    var m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/.exec(s);
    if (m) { return { y: +m[3], m: +m[2], d: +m[1], h: m[4] != null ? +m[4] : null, mi: m[5] != null ? +m[5] : null }; }
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) { return { y: +m[1], m: +m[2], d: +m[3], h: null, mi: null }; }
    var dt = new Date(s);
    return isNaN(dt.getTime()) ? null : partiDa(dt);
  }
  function chiaveGiorno(p) { return p.y * 10000 + p.m * 100 + p.d; }
  function chiave(p, fineGiornata) {
    if (!p) { return 0; }
    var hm = p.h == null ? (fineGiornata ? 2359 : 0) : p.h * 100 + p.mi;
    return chiaveGiorno(p) * 10000 + hm;
  }
  function giornoSett(p) { return GIORNI[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()]; }
  function dataLunga(p) { return giornoSett(p) + ' ' + p.d + ' ' + MESI[p.m - 1] + ' ' + p.y; }
  function ora(p) { return p && p.h != null ? pad(p.h) + ':' + pad(p.mi) : ''; }
  function isoAttr(p) { return p.y + '-' + pad(p.m) + '-' + pad(p.d) + (p.h != null ? 'T' + ora(p) : ''); }
  function periodo(da, a) {
    if (!da) { return { giorni: 'Data da definire', orari: '' }; }
    if (!a || chiaveGiorno(da) === chiaveGiorno(a)) {
      return { giorni: dataLunga(da), orari: ora(da) && ora(a) && ora(a) !== ora(da) ? ora(da) + '–' + ora(a) : ora(da) };
    }
    var inizio = da.d + (da.m !== a.m || da.y !== a.y ? ' ' + MESI[da.m - 1] : '') + (da.y !== a.y ? ' ' + da.y : '');
    return {
      giorni: 'dal ' + inizio + ' al ' + a.d + ' ' + MESI[a.m - 1] + ' ' + a.y,
      orari: ora(da) && ora(a) ? 'dalle ' + ora(da) + ' alle ' + ora(a) : ''
    };
  }
  function periodoHtml(da, a) {
    var p = periodo(da, a);
    return '<time datetime="' + (da ? isoAttr(da) : '') + '">' + esc(p.giorni) + '</time>' +
      (p.orari & false ? ' · <span class="tlr-ora">' + esc(p.orari) + '</span>' : '');
  }
  var ADESSO = chiave(partiDa(new Date()));
  function passato(ev) { return chiave(ev._fine || ev._inizio, true) < ADESSO; }

  /* ---------- API ---------- */

  function url(percorso, param) {
    var q = Object.keys(param).filter(function (k) { return param[k] != null && param[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(param[k]); }).join('&');
    return String(C.api.base || '').replace(/\/$/, '') + percorso + (q ? '?' + q : '');
  }
  function leggi(u) {
    return fetch(u, { headers: { Accept: 'application/json' }, credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) { throw new Error('HTTP ' + r.status); }
      return r.json();
    });
  }
  
  // Funzione per caricare i JSON locali basati su app_code
  var CACHE_JSON_LOCALI = {};
  function caricaJsonLocale(appCode) {
    if (CACHE_JSON_LOCALI[appCode]) {
      return Promise.resolve(CACHE_JSON_LOCALI[appCode]);
    }
    var url = 'assets/json/eventi_response_' + appCode + '.json';
    return leggi(url).then(function (data) {
      CACHE_JSON_LOCALI[appCode] = data;
      return data;
    });
  }
  
  function normalizza(ev, c) {
    ev._comune = c;
    ev._chiave = c.id + '/evento-' + ev.id;
    ev._inizio = parti(ev.inizio);
    ev._fine = parti(ev.fine);
    return ev;
  }
  function perData(x, y) { return chiave(x._inizio) - chiave(y._inizio) || chiave(x._fine, true) - chiave(y._fine, true); }

  var ELENCHI = {};
  function eventiComune(c) {
    if (!ELENCHI[c.id]) {
      // Carica gli eventi dal JSON locale invece dall'API
      var p = caricaJsonLocale(c.app_code).then(function (r) {
        // Il JSON locale ha la struttura { data: [...], meta: {...} }
        return (r.data || []);
      }).then(function (lista) {
        return lista.map(function (ev) { return normalizza(ev, c); }).sort(perData);
      });
      p.catch(function () { if (ELENCHI[c.id] === p) { delete ELENCHI[c.id]; } });
      ELENCHI[c.id] = p;
    }
    return ELENCHI[c.id];
  }

  var TUTTI = null;
  function tuttiGliEventi() {
    if (!TUTTI) {
      TUTTI = Promise.all(COMUNI.map(function (c) {
        return eventiComune(c).then(function (l) { return { c: c, l: l }; }, function (e) { return { c: c, errore: e }; });
      })).then(function (ris) {
        var visti = {}, eventi = [], errori = [];
        ris.forEach(function (r) {
          if (r.errore) { errori.push(r.c); return; }
          r.l.forEach(function (ev) {
            var k = (ev.app_code || r.c.app_code) + '|' + ev.id;
            if (visti[k]) { return; }
            visti[k] = true;
            eventi.push(ev);
          });
        });
        if (errori.length) { TUTTI = null; }
        return { eventi: eventi.sort(perData), errori: errori };
      });
    }
    return TUTTI;
  }

  var DETTAGLI = {};
  function dettaglio(c, id) {
    var k = c.id + '|' + id;
    if (!DETTAGLI[k]) {
      // Carica il dettaglio completo dal file JSON specifico: json-details/event_detail_response_{id}.json
      var p = leggi('./assets/json/json-details/event_detail_response_' + id + '.json')
        .then(function (r) {
          var evento = r.data;
          if (!evento || evento.id == null) { throw new Error('evento non trovato: ' + id); }
          return normalizza(evento, c);
        });
      p.catch(function () { if (DETTAGLI[k] === p) { delete DETTAGLI[k]; } });
      DETTAGLI[k] = p;
    }
    return DETTAGLI[k];
  }

  function categorieDi(eventi) {
    var mappa = {}, elenco = [];
    eventi.forEach(function (ev) {
      (ev.categories || []).forEach(function (cat) {
        if (!mappa[cat.id]) { mappa[cat.id] = { id: cat.id, name: cat.name, gruppo: cat.vocabulary_name, n: 0, futuri: 0 }; elenco.push(mappa[cat.id]); }
        mappa[cat.id].n++;
        if (!passato(ev)) { mappa[cat.id].futuri++; }
      });
    });
    return elenco.sort(function (x, y) { return String(x.name).localeCompare(String(y.name), 'it'); });
  }
  function haCategoria(ev, id) {
    return (ev.categories || []).some(function (cat) { return String(cat.id) === String(id); });
  }

  /* ---------- pezzi di pagina ---------- */

  function chipCategorie(cats, corrente) {
    if (!cats || !cats.length) { return ''; }
    return cats.map(function (cat) {
      var su = corrente != null && String(cat.id) === String(corrente);
      return '<li><a class="tlr-chip' + (su ? ' is-current' : '') + '" href="#categoria-' + esc(cat.id) + '"' +
        (su ? ' aria-current="true"' : '') + (cat.vocabulary_name ? ' title="' + esc(cat.vocabulary_name) + '"' : '') + '>' +
        esc(cat.name) + (cat.n != null ? ' <span class="tlr-chip-n">' + cat.n + '</span>' : '') + '</a></li>';
    }).join('');
  }
  function chipTag(tags) {
    return (tags || []).map(function (t) { return '<li><span class="tlr-chip is-tag">' + esc(t.name) + '</span></li>'; }).join('');
  }
  function luogoBreve(s) {
    if (!s) { return ''; }
    return [s.nome, s.citta].filter(function (x) { return x; }).map(esc).join(' · ');
  }
  function primaImmagine(ev) {
    var tutte = [].concat(ev.card_images || [], ev.hero_images || []).map(soloUrl).map(urlSicuro).filter(Boolean);
    return tutte[0] || '';
  }

  function schedaHtml(ev, opz) {
    var img = primaImmagine(ev);
    var h = '<li class="tlr-ev' + (passato(ev) ? ' is-passato' : '') + '">' +
      '<div class="tlr-ev-img' + (img ? '' : ' is-vuota') + '">' +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '') + '</div>' +
      '<div class="tlr-ev-tx">';
    if (opz.conComune) { h += '<p class="tlr-ev-tema">' + esc(ev._comune.nome) + '</p>'; }
    h += '<p class="tlr-ev-data">' + periodoHtml(ev._inizio, ev._fine) + '</p>' +
      '<h4 class="tlr-ev-tit"><a href="#' + esc(ev._chiave) + '">' + esc(ev.nome) + '</a></h4>';
    if (ev.sede) { h += '<p class="tlr-ev-luogo">' + luogoBreve(ev.sede) + '</p>'; }
    if (ev.rassegna && ev.rassegna.titolo) { h += '<p class="tlr-ev-rass">' + esc(ev.rassegna.titolo) + '</p>'; }
    var chips = chipCategorie(ev.categories, opz.categoria);
    if (chips) { h += '<ul class="tlr-filtri" aria-label="Categorie">' + chips + '</ul>'; }
    return h + '</div></li>';
  }

  function elencoHtml(eventi, opz) {
    var futuri = eventi.filter(function (ev) { return !passato(ev); });
    var vecchi = eventi.filter(passato).reverse();
    var h = '';
    if (!futuri.length) {
      h += '<p class="tlr-stato">' + (vecchi.length ? 'Nessun evento in programma al momento.' : 'Nessun evento pubblicato.') + '</p>';
    }
    var mesi = [], perMese = {};
    futuri.forEach(function (ev) {
      var p = ev._inizio, k = p ? p.y + '-' + pad(p.m) : 'nd';
      // un evento già iniziato ma non ancora finito va nel mese corrente
      if (p && chiave(p) < ADESSO) { var o = partiDa(new Date()); k = o.y + '-' + pad(o.m); }
      if (!perMese[k]) { perMese[k] = []; mesi.push(k); }
      perMese[k].push(ev);
    });
    mesi.forEach(function (k, i) {
      var nome = k === 'nd' ? 'Data da definire' : MESI[+k.slice(5) - 1] + ' ' + k.slice(0, 4);
      var idt = 'tlr-g-' + (opz.pre || 'm') + i;
      h += '<section class="tlr-gruppo" aria-labelledby="' + idt + '"><h3 class="tlr-gtit" id="' + idt + '">' +
        esc(nome.charAt(0).toUpperCase() + nome.slice(1)) + '</h3><ul class="tlr-evs">';
      perMese[k].forEach(function (ev) { h += schedaHtml(ev, opz); });
      h += '</ul></section>';
    });
    if (vecchi.length) {
      h += '<section class="tlr-gruppo tlr-gruppo--passati" aria-labelledby="tlr-g-passati">' +
        '<details' + (futuri.length ? '' : ' open') + '><summary class="tlr-gtit" id="tlr-g-passati">Eventi passati <span class="tlr-gtit-n">' + vecchi.length + '</span></summary>' +
        '<ul class="tlr-evs">';
      vecchi.forEach(function (ev) { h += schedaHtml(ev, opz); });
      h += '</ul></details></section>';
    }
    return h;
  }

  function contaHtml(eventi) {
    var f = eventi.filter(function (ev) { return !passato(ev); }).length;
    var v = eventi.length - f;
    return (f ? plurale(f, 'evento in programma', 'eventi in programma') : 'Nessun evento in programma') +
      (v ? ' · ' + plurale(v, 'passato', 'passati') : '');
  }
  function erroriHtml(errori) {
    if (!errori || !errori.length) { return ''; }
    return '<p class="tlr-stato is-errore">Non è stato possibile caricare gli eventi di: ' +
      errori.map(function (c) { return esc(c.nome); }).join(', ') + '. <a href="#" data-tlr-riprova>Riprova</a></p>';
  }
  function attesaHtml(occhiello, titolo) {
    return '<header class="tlr-vhead"><p class="tlr-occhiello">' + esc(occhiello) + '</p>' +
      '<h2 class="tlr-vtit" id="tlr-vtit" tabindex="-1">' + esc(titolo) + '</h2></header>' +
      '<p class="tlr-stato is-attesa" role="status">Caricamento degli eventi…</p>';
  }
  function erroreHtml(occhiello, titolo, testo) {
    return '<header class="tlr-vhead"><p class="tlr-occhiello">' + esc(occhiello) + '</p>' +
      '<h2 class="tlr-vtit" id="tlr-vtit" tabindex="-1">' + esc(titolo) + '</h2></header>' +
      '<p class="tlr-stato is-errore" role="alert">' + esc(testo) + ' <a href="#" data-tlr-riprova>Riprova</a></p>';
  }
  function navComuni(c) {
    var prec = COMUNI[(c.ordine - 1 + COMUNI.length) % COMUNI.length];
    var succ = COMUNI[(c.ordine + 1) % COMUNI.length];
    if (COMUNI.length < 2) { return ''; }
    return '<nav class="tlr-vnext" aria-label="Altri comuni">' +
      '<a class="tlr-vnext-a is-prev" href="#' + esc(prec.id) + '"><span class="tlr-vnext-k">Comune precedente</span>' +
      '<span class="tlr-vnext-v">' + esc(prec.nome) + '</span></a>' +
      '<a class="tlr-vnext-a is-next" href="#' + esc(succ.id) + '"><span class="tlr-vnext-k">Comune successivo</span>' +
      '<span class="tlr-vnext-v">' + esc(succ.nome) + '</span></a></nav>';
  }

  /* ---------- viste ---------- */

  function vistaTutti(r) {
    var h = '<header class="tlr-vhead"><p class="tlr-occhiello">Eventi in ' + plurale(COMUNI.length, 'comune', 'comuni') + '</p>' +
      '<h2 class="tlr-vtit" id="tlr-vtit" tabindex="-1">Tutti gli eventi</h2>' +
      '<p class="tlr-vconta">' + contaHtml(r.eventi) + '</p>';
    var cats = categorieDi(r.eventi);
    if (cats.length) { h += '<ul class="tlr-filtri tlr-filtri--testa" aria-label="Filtra per categoria">' + chipCategorie(cats) + '</ul>'; }
    return h + '</header>' + erroriHtml(r.errori) + elencoHtml(r.eventi, { conComune: true, pre: 't' });
  }

  function vistaComune(c, eventi) {
    var h = '<header class="tlr-vhead"><p class="tlr-occhiello">Eventi · ' + esc(c.prefisso || 'Comune di') + '</p>' +
      '<h2 class="tlr-vtit" id="tlr-vtit" tabindex="-1">' + esc(c.nome) + '</h2>' +
      '<p class="tlr-vconta">' + contaHtml(eventi) + '</p>';
    var cats = categorieDi(eventi);
    if (cats.length) {
      h += '<p class="tlr-filtri-k">Categorie di questo comune <span>(il filtro mostra gli eventi di tutti i comuni)</span></p>' +
        '<ul class="tlr-filtri tlr-filtri--testa" aria-label="Categorie">' + chipCategorie(cats) + '</ul>';
    }
    return h + '</header>' + elencoHtml(eventi, { conComune: false, pre: 'c' }) + navComuni(c);
  }

  function vistaCategoria(id, r) {
    var cats = categorieDi(r.eventi);
    var cat = cats.filter(function (x) { return String(x.id) === String(id); })[0];
    var eventi = r.eventi.filter(function (ev) { return haCategoria(ev, id); });
    var h = '<header class="tlr-vhead"><p class="tlr-occhiello">Eventi per categoria' + (cat && cat.gruppo ? ' · ' + esc(cat.gruppo) : '') + '</p>' +
      '<h2 class="tlr-vtit" id="tlr-vtit" tabindex="-1">' + esc(cat ? cat.name : 'Categoria') + '</h2>' +
      '<p class="tlr-vnota">In tutti i comuni</p>' +
      '<p class="tlr-vconta">' + contaHtml(eventi) + ' · <a href="#tutti">tutti gli eventi</a></p>';
    if (cats.length) { h += '<ul class="tlr-filtri tlr-filtri--testa" aria-label="Altre categorie">' + chipCategorie(cats, id) + '</ul>'; }
    h += '</header>' + erroriHtml(r.errori);
    if (!cat) { return h + '<p class="tlr-stato">Nessun evento in questa categoria.</p>'; }
    return h + elencoHtml(eventi, { conComune: true, categoria: id, pre: 'k' });
  }

  function documentiHtml(ev) {
    var docs = ev.other_docs || [];
    if (!Array.isArray(docs)) { docs = Object.keys(docs).map(function (k) { return docs[k]; }); }
    docs = docs.filter(function (d) { return d && urlSicuro(d.url); });
    if (!docs.length) { return ''; }
    var prog = function (d) { return /programm/i.test(d.name || ''); };
    docs.sort(function (a, b) { return (prog(b) ? 1 : 0) - (prog(a) ? 1 : 0); });
    var h = '<section class="tlr-gruppo" aria-labelledby="tlr-g-doc"><h3 class="tlr-gtit" id="tlr-g-doc">' +
      (docs.some(prog) ? 'Programma e documenti' : 'Documenti') + '</h3><ul class="tlr-doc">';
    docs.forEach(function (d) {
      var u = urlSicuro(d.url);
      var ext = (d.extension || (/\.(\w{2,5})(?:\?|$)/.exec(u) || [])[1] || 'file').slice(0, 4);
      h += '<li' + (prog(d) ? ' class="is-programma"' : '') + '><a href="' + esc(u) + '" target="_blank" rel="noopener">' +
        '<span class="tlr-doc-ext">' + esc(ext) + '</span>' +
        '<span class="tlr-doc-tx"><span class="tlr-doc-nome">' + esc(d.name || nomeFile(u)) + '</span>' +
        '<span class="tlr-doc-url">' + esc(u) + '</span></span></a></li>';
    });
    return h + '</ul></section>';
  }

  function sessioniHtml(ev) {
    var ss = (ev.sessioni || []).slice();
    var utili = ss.length > 1 || ss.some(function (s) { return s.descrizione || s.remoto; });
    if (!utili) { return ''; }
    ss.sort(function (a, b) { return (b.is_principale ? 1 : 0) - (a.is_principale ? 1 : 0) || chiave(parti(a.inizio)) - chiave(parti(b.inizio)); });
    var h = '<section class="tlr-gruppo" aria-labelledby="tlr-g-sess"><h3 class="tlr-gtit" id="tlr-g-sess">Sessioni</h3><ul class="tlr-sess">';
    ss.forEach(function (s) {
      var link = s.remoto && urlSicuro(s.link_remoto);
      h += '<li><p class="tlr-sess-ora">' + periodoHtml(parti(s.inizio), parti(s.fine)) + '</p>' +
        '<p class="tlr-sess-nome">' + esc(s.nome || ev.nome) + '</p>';
      var info = [];
      if (s.tipologia && s.tipologia.nome) { info.push(esc(s.tipologia.nome)); }
      if (s.remoto) { info.push(link ? '<a class="tlr-link-fuori" href="' + esc(link) + '" target="_blank" rel="noopener">Online</a>' : 'Online'); }
      if (info.length) { h += '<p class="tlr-sess-info">' + info.join(' · ') + '</p>'; }
      if (s.descrizione) { h += '<div class="tlr-sess-desc tlr-testo">' + pulisci(s.descrizione) + '</div>'; }
      h += '</li>';
    });
    return h + '</ul></section>';
  }

  function immaginiHtml(ev) {
    var visti = {}, imm = [];
    [].concat(ev.hero_images || [], ev.card_images || []).map(soloUrl).map(urlSicuro).forEach(function (u) {
      if (u && !visti[u]) { visti[u] = true; imm.push(u); }
    });
    if (!imm.length) { return ''; }
    var h = '<section class="tlr-gruppo" aria-labelledby="tlr-g-img"><h3 class="tlr-gtit" id="tlr-g-img">Immagini</h3><ul class="tlr-immagini">';
    imm.forEach(function (u, i) {
      h += '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' +
        '<img src="' + esc(u) + '" alt="Immagine ' + (i + 1) + ' dell’evento ' + esc(ev.nome) + '" loading="lazy" decoding="async">' +
        '</a></li>';
    });
    return h + '</ul></section>';
  }

  function sedeHtml(s) {
    if (!s) { return ''; }
    var lat = parseFloat(s.latitudine), lon = parseFloat(s.longitudine);
    var coord = isFinite(lat) && isFinite(lon) && (lat || lon);
    var riga2 = [s.cap, s.citta].filter(Boolean).join(' ') + (s.provincia ? ' (' + s.provincia + ')' : '');
    var dest = coord ? lat + ',' + lon : [s.indirizzo, s.cap, s.citta, s.nazione].filter(Boolean).join(' ');
    var h = '<section class="tlr-box" aria-labelledby="tlr-b-dove"><h3 class="tlr-box-tit" id="tlr-b-dove">Dove</h3>' +
      (s.nome ? '<p class="tlr-box-forte">' + esc(s.nome) + '</p>' : '') +
      (s.indirizzo ? '<p>' + esc(s.indirizzo) + '</p>' : '') +
      (riga2.trim() ? '<p>' + esc(riga2) + '</p>' : '') +
      (s.nazione ? '<p class="tlr-box-piccolo">' + esc(s.nazione) + '</p>' : '');
    if (coord) {
      var d = 0.008;
      var bbox = [lon - d * 1.6, lat - d, lon + d * 1.6, lat + d].join(',');
      h += '<div class="tlr-mappa"><iframe title="Mappa: ' + esc(s.nome || s.indirizzo || 'sede dell’evento') + '" loading="lazy" ' +
        'referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=' + encodeURIComponent(bbox) +
        '&amp;layer=mapnik&amp;marker=' + encodeURIComponent(lat + ',' + lon) + '"></iframe></div>';
    }
    if (dest.trim()) {
      h += '<a class="tlr-link-fuori" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(dest) +
        '" target="_blank" rel="noopener">Come arrivare</a>';
    }
    return h + '</section>';
  }

  function rassegnaHtml(r) {
    if (!r || !r.titolo) { return ''; }
    return '<section class="tlr-box" aria-labelledby="tlr-b-rass"><h3 class="tlr-box-tit" id="tlr-b-rass">Rassegna</h3>' +
      '<p class="tlr-box-forte">' + esc(r.titolo) + '</p>' +
      (r.inizio ? '<p class="tlr-box-piccolo">' + periodoHtml(parti(r.inizio), parti(r.fine)) + '</p>' : '') +
      (r.descrizione ? '<p class="tlr-box-testo">' + testoConLink(r.descrizione) + '</p>' : '') + '</section>';
  }

  function iscrizioneHtml(ev) {
    var link = urlSicuro(ev.manage_registrations);
    var richiesta = (ev.sessioni || []).some(function (s) { return s.tipologia && s.tipologia.richiede_registrazione; });
    if (!link && !richiesta) { return ''; }
    var aperta = !!Number(ev.iscrizione_possibile) || ev.iscrizione_possibile === true;
    var h = '<section class="tlr-box tlr-box--iscr" aria-labelledby="tlr-b-iscr"><h3 class="tlr-box-tit" id="tlr-b-iscr">Iscrizione</h3>';
    if (aperta && link) {
      h += '<p class="tlr-box-forte">Iscrizioni aperte</p><a class="tlr-bottone" href="' + esc(link) + '" target="_blank" rel="noopener">Iscriviti</a>';
    } else {
      h += '<p class="tlr-box-forte">Iscrizioni non disponibili</p>';
      if (link) { h += '<a class="tlr-link-fuori" href="' + esc(link) + '" target="_blank" rel="noopener">Gestisci la tua iscrizione</a>'; }
    }
    return h + '</section>';
  }

  function vistaEvento(ev, elenco) {
    var c = ev._comune;
    var cover = urlSicuro(soloUrl((ev.hero_images || [])[0])) || primaImmagine(ev);
    var p = periodo(ev._inizio, ev._fine);
    var h = '<header class="tlr-vhead"><p class="tlr-occhiello"><a href="#' + esc(c.id) + '">' + esc((c.prefisso || 'Comune di') + ' ' + c.nome) + '</a>' +
      (ev.rassegna && ev.rassegna.titolo ? ' · ' + esc(ev.rassegna.titolo) : '') + '</p>' +
      '<h2 class="tlr-vtit tlr-vtit--evento" id="tlr-vtit" tabindex="-1">' + esc(ev.nome) + '</h2>' +
      '<ul class="tlr-orari" aria-label="Quando">' +
      '<li><span class="tlr-orari-v tlr-orari-v--data">' + (ev._inizio ? '<time datetime="' + isoAttr(ev._inizio) + '">' : '') +
      esc(p.giorni.charAt(0).toUpperCase() + p.giorni.slice(1)) + (ev._inizio ? '</time>' : '') + '</span></li>' +
      (ev.modalita ? '<li><span class="tlr-orari-k">Modalità</span> <span class="tlr-orari-v">' + esc(ev.modalita.charAt(0).toUpperCase() + ev.modalita.slice(1)) + '</span></li>' : '') +
      (passato(ev) ? '<li class="is-passato"><span class="tlr-orari-v">Evento concluso</span></li>' : '') +
      '</ul>';
    var chips = chipCategorie(ev.categories) + chipTag(ev.tags);
    if (chips) { h += '<ul class="tlr-filtri tlr-filtri--testa" aria-label="Categorie e tag">' + chips + '</ul>'; }
    h += '</header>';

    if (cover) {
      h += '<figure class="tlr-det-cover"><img src="' + esc(cover) + '" alt="" decoding="async"></figure>';
    }
    h += '<div class="tlr-det-griglia"><div class="tlr-det-corpo">';
    var desc = pulisci(ev.descrizione);
    h += desc ? '<div class="tlr-testo tlr-det-testo">' + desc + '</div>' : '<p class="tlr-gnota">Descrizione non disponibile.</p>';
    h += documentiHtml(ev) + sessioniHtml(ev) + immaginiHtml(ev);
    if (ev.updated_at) {
      var agg = parti(ev.updated_at);
      if (agg) { h += '<p class="tlr-det-agg">Aggiornato ' + esc(dataLunga(agg)) + '</p>'; }
    }
    h += '</div><aside class="tlr-det-lato" aria-label="Informazioni pratiche">' +
      iscrizioneHtml(ev) + sedeHtml(ev.sede) + rassegnaHtml(ev.rassegna) + '</aside></div>';

    var i = -1;
    (elenco || []).forEach(function (x, n) { if (String(x.id) === String(ev.id)) { i = n; } });
    var prec = i > 0 ? elenco[i - 1] : null, succ = i > -1 && i < elenco.length - 1 ? elenco[i + 1] : null;
    h += '<nav class="tlr-vnext" aria-label="Altri eventi del comune">';
    h += prec ? '<a class="tlr-vnext-a is-prev" href="#' + esc(prec._chiave) + '"><span class="tlr-vnext-k">Evento precedente</span><span class="tlr-vnext-v">' + esc(prec.nome) + '</span></a>'
      : '<a class="tlr-vnext-a is-prev" href="#' + esc(c.id) + '"><span class="tlr-vnext-k">Torna all’elenco</span><span class="tlr-vnext-v">' + esc(c.nome) + '</span></a>';
    if (succ) { h += '<a class="tlr-vnext-a is-next" href="#' + esc(succ._chiave) + '"><span class="tlr-vnext-k">Evento successivo</span><span class="tlr-vnext-v">' + esc(succ.nome) + '</span></a>'; }
    return h + '</nav>';
  }

  /* ---------- menu ---------- */

  function nomeComuneHtml(c) {
    return '<span class="tlr-mv-pre">' + esc(c.prefisso || '') + ' </span><span class="tlr-mv-tema">' + esc(c.nome) + '</span>';
  }
  function menuTutti() {
    return '<ul class="tlr-menu tlr-menu--tutti"><li><a class="tlr-mv" href="#tutti" data-vista="tutti">' +
      '<span class="tlr-mv-t">Tutti gli eventi</span><span class="tlr-mv-c" data-tlr-conta="tutti" aria-hidden="true"></span></a></li></ul>';
  }
  function menuComuni() {
    var h = '<ul class="tlr-menu tlr-menu--comuni">';
    COMUNI.forEach(function (c) {
      h += '<li><a class="tlr-mv" href="#' + esc(c.id) + '" data-vista="' + esc(c.id) + '">' +
        '<span class="tlr-mv-t">' + nomeComuneHtml(c) + '</span>' +
        '<span class="tlr-mv-c" data-tlr-conta="' + esc(c.id) + '" aria-hidden="true"></span></a></li>';
    });
    return h + '</ul>';
  }
  function menuCategorie(cats) {
    if (!cats) { return '<p class="tlr-lato-attesa">Caricamento…</p>'; }
    if (!cats.length) { return '<p class="tlr-lato-attesa">Nessuna categoria.</p>'; }
    var h = '<ul class="tlr-menu tlr-menu--categorie">';
    cats.forEach(function (cat) {
      h += '<li><a class="tlr-mv" href="#categoria-' + esc(cat.id) + '" data-vista="categoria-' + esc(cat.id) + '"' +
        (cat.gruppo ? ' title="' + esc(cat.gruppo) + '"' : '') + '>' +
        '<span class="tlr-mv-t">' + esc(cat.name) + '</span><span class="tlr-mv-c" aria-hidden="true">' + (cat.futuri || '') + '</span></a></li>';
    });
    return h + '</ul>';
  }
  function testataHtml() {
    return COMUNI.map(function (c) {
      return '<li><a href="#' + esc(c.id) + '"><span class="tlr-tutte-k">' + esc(c.prefisso || '') + '</span> ' +
        '<span class="tlr-tutte-v">' + esc(c.nome) + '</span></a></li>';
    }).join('');
  }

  document.querySelectorAll('[data-tlr-menu="testata"]').forEach(function (el) { el.innerHTML = testataHtml(); });
  document.querySelectorAll('[data-tlr-menu="tutti"]').forEach(function (el) { el.innerHTML = menuTutti(); });
  document.querySelectorAll('[data-tlr-menu="comuni"]').forEach(function (el) { el.innerHTML = menuComuni(); });
  document.querySelectorAll('[data-tlr-menu="categorie"]').forEach(function (el) { el.innerHTML = menuCategorie(null); });

  var MENU_CORRENTE = null;
  function aggiornaMenu(id) {
    MENU_CORRENTE = id;
    document.querySelectorAll('.tlr-mv').forEach(function (a) {
      var su = a.getAttribute('data-vista') === id;
      a.classList.toggle('is-current', su);
      if (su) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }
  function caricaMenu() {
    tuttiGliEventi().then(function (r) {
      var futuri = function (l) { return l.filter(function (ev) { return !passato(ev); }).length; };
      var scrivi = function (k, n) {
        document.querySelectorAll('[data-tlr-conta="' + k + '"]').forEach(function (el) { el.textContent = n || ''; });
      };
      scrivi('tutti', futuri(r.eventi));
      COMUNI.forEach(function (c) {
        if (r.errori.indexOf(c) > -1) { return; }
        eventiComune(c).then(function (l) { scrivi(c.id, futuri(l)); });
      });
      document.querySelectorAll('[data-tlr-menu="categorie"]').forEach(function (el) { el.innerHTML = menuCategorie(categorieDi(r.eventi)); });
      if (MENU_CORRENTE) { aggiornaMenu(MENU_CORRENTE); }
    });
  }

  /* ---------- instradamento (hash) ----------
   *   #tutti                   tutti gli eventi
   *   #<comune>                eventi del comune
   *   #<comune>/evento-<id>    dettaglio evento
   *   #categoria-<id>          eventi della categoria, in tutti i comuni */

  function trova(id) {
    if (!id || id === 'tutti') { return { tipo: 'tutti', menu: 'tutti', nome: 'Tutti gli eventi' }; }
    if (COMUNE[id]) { return { tipo: 'comune', c: COMUNE[id], menu: id, nome: COMUNE[id].nome }; }
    var m = /^([a-z0-9-]+)\/evento-([\w-]+)$/i.exec(id);
    if (m && COMUNE[m[1]]) { return { tipo: 'evento', c: COMUNE[m[1]], id: m[2], menu: m[1], nome: COMUNE[m[1]].nome }; }
    m = /^categoria-([\w-]+)$/.exec(id);
    if (m) { return { tipo: 'categoria', id: m[1], menu: id, nome: 'Categoria' }; }
    return null;
  }

  var giro = 0;
  function titolo(nome) {
    document.title = nome + ' · ' + TITOLO_PAGINA;
    document.querySelectorAll('[data-tlr-corrente]').forEach(function (el) { el.textContent = nome; });
  }
  function mostra(id, scorri) {
    var v = trova(id);
    if (!v) { return false; }
    var mio = ++giro;
    var scrivi = function (html, nome) {
      if (mio !== giro) { return; }
      area.innerHTML = html;
      if (nome) { titolo(nome); }
    };
    area.setAttribute('data-vista', v.tipo);
    area.setAttribute('aria-busy', 'true');
    aggiornaMenu(v.menu);
    titolo(v.nome);

    var lavoro;
    if (v.tipo === 'tutti') {
      scrivi(attesaHtml('Eventi', 'Tutti gli eventi'));
      lavoro = tuttiGliEventi().then(function (r) { scrivi(vistaTutti(r)); });
    } else if (v.tipo === 'comune') {
      scrivi(attesaHtml('Eventi · ' + (v.c.prefisso || 'Comune di'), v.c.nome));
      lavoro = eventiComune(v.c).then(function (l) { scrivi(vistaComune(v.c, l)); }, function () {
        scrivi(erroreHtml('Eventi · ' + (v.c.prefisso || 'Comune di'), v.c.nome, 'Non è stato possibile caricare gli eventi.'));
      });
    } else if (v.tipo === 'categoria') {
      scrivi(attesaHtml('Eventi per categoria', 'Categoria'));
      lavoro = tuttiGliEventi().then(function (r) {
        var cat = categorieDi(r.eventi).filter(function (x) { return String(x.id) === String(v.id); })[0];
        scrivi(vistaCategoria(v.id, r), cat ? cat.name : 'Categoria');
      });
    } else {
      scrivi(attesaHtml((v.c.prefisso || 'Comune di') + ' ' + v.c.nome, 'Evento'));
      lavoro = Promise.all([
        dettaglio(v.c, v.id),
        eventiComune(v.c).catch(function () { return []; })
      ]).then(function (r) { scrivi(vistaEvento(r[0], r[1]), r[0].nome); }, function () {
        scrivi(erroreHtml((v.c.prefisso || 'Comune di') + ' ' + v.c.nome, 'Evento', 'Non è stato possibile caricare l’evento.'));
      });
    }
    lavoro.then(function () {
      if (mio !== giro) { return; }
      area.removeAttribute('aria-busy');
      var tit = document.getElementById('tlr-vtit');
      if (scorri && tit) { tit.focus({ preventScroll: true }); }
    }).catch(function (e) { if (window.console) { console.error('Eventi:', e); } });

    if (scorri) {
      var sezione = document.querySelector('[data-tlr-scorri]') || document.getElementById('programma') || area;
      sezione.scrollIntoView({ behavior: RIDOTTO ? 'auto' : 'smooth', block: 'start' });
    }
    return true;
  }
  function corrente() { return decodeURIComponent(location.hash.slice(1)); }

  window.addEventListener('hashchange', function () {
    var id = corrente();
    if (!id) { mostra('tutti', false); return; }
    mostra(id, true);
  });
  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('[data-tlr-riprova]');
    if (r) {
      e.preventDefault();
      TUTTI = null;
      mostra(corrente() || 'tutti', false);
      caricaMenu();
      return;
    }
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
    if (!location.hash || a.getAttribute('href') !== location.hash) { return; }
    if (mostra(corrente(), true)) { e.preventDefault(); }
  });

  var apri = document.querySelector('[data-tlr-apri]');
  var pannello = apri && document.getElementById(apri.getAttribute('aria-controls'));
  if (apri && pannello) {
    var aperto = function () { return apri.getAttribute('aria-expanded') === 'true'; };
    var imposta = function (si) {
      apri.setAttribute('aria-expanded', si ? 'true' : 'false');
      pannello.classList.toggle('is-open', si);
    };
    apri.addEventListener('click', function () {
      imposta(!aperto());
      if (aperto()) {
        var voce = pannello.querySelector('.tlr-mv.is-current') || pannello.querySelector('a');
        if (voce) { voce.focus(); }
      }
    });
    pannello.addEventListener('click', function (e) {
      if (e.target.closest('a')) { imposta(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && aperto()) { imposta(false); apri.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (aperto() && !pannello.contains(e.target) && !apri.contains(e.target)) { imposta(false); }
    });
  }

  var iniziale = corrente();
  if (!mostra(iniziale, !!(iniziale && trova(iniziale)))) { mostra('tutti', false); }
  caricaMenu();
  document.documentElement.classList.add('tlr-js');
})();

(function () {
  'use strict';
  var RIDOTTO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-tlr-scorrevole]').forEach(function (box) {
    var riga = box.querySelector('[data-tlr-riga]') || box.querySelector('[tabindex]');
    if (!riga) { return; }
    var lista = /^(UL|OL)$/.test(riga.tagName) ? riga : riga.firstElementChild;
    if (!lista) { return; }
    var voci = lista.children;
    var prec = box.querySelector('[data-tlr-passo="-1"]');
    var succ = box.querySelector('[data-tlr-passo="1"]');
    var pollice = box.querySelector('[data-tlr-avanzamento] > span') || box.querySelector('.tlr-concetti-barra > span');
    var attesa = false;

    function passo() {
      return voci.length > 1 ? voci[1].offsetLeft - voci[0].offsetLeft : riga.clientWidth;
    }
    function aggiorna() {
      attesa = false;
      var max = riga.scrollWidth - riga.clientWidth;
      box.classList.toggle('is-fermo', max <= 1);
      box.classList.toggle('is-fine', max > 1 && riga.scrollLeft >= max - 1);
      if (prec) { prec.disabled = riga.scrollLeft <= 1; }
      if (succ) { succ.disabled = riga.scrollLeft >= max - 1; }
      if (pollice && riga.scrollWidth) {
        var quota = riga.clientWidth / riga.scrollWidth;
        var punto = max > 0 ? riga.scrollLeft / max : 0;
        pollice.style.width = (quota * 100) + '%';
        pollice.style.transform = 'translateX(' + (punto * (1 / quota - 1) * 100) + '%)';
      }
    }
    function piuTardi() {
      if (!attesa) { attesa = true; window.requestAnimationFrame(aggiorna); }
    }
    [prec, succ].forEach(function (btn) {
      if (!btn) { return; }
      btn.addEventListener('click', function () {
        var verso = parseInt(btn.getAttribute('data-tlr-passo'), 10);
        riga.scrollBy({ left: verso * passo(), behavior: RIDOTTO ? 'auto' : 'smooth' });
      });
    });

    var giu = null, trascinato = false;
    riga.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || box.classList.contains('is-fermo')) { return; }
      giu = { x: e.clientX, sl: riga.scrollLeft };
      trascinato = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!giu) { return; }
      var dx = e.clientX - giu.x;
      if (!trascinato && Math.abs(dx) > 5) {
        trascinato = true;
        riga.classList.add('is-trascinata');
      }
      if (trascinato) { riga.scrollLeft = giu.sl - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (!giu) { return; }
      giu = null;
      if (trascinato) {
        riga.classList.remove('is-trascinata');
        var vicina = Math.round(riga.scrollLeft / passo()) * passo();
        riga.scrollTo({ left: vicina, behavior: RIDOTTO ? 'auto' : 'smooth' });
      }
    });
    riga.addEventListener('click', function (e) {
      if (trascinato) { e.preventDefault(); e.stopPropagation(); trascinato = false; }
    }, true);
    riga.addEventListener('dragstart', function (e) { e.preventDefault(); });

    riga.addEventListener('scroll', piuTardi, { passive: true });
    window.addEventListener('resize', piuTardi);
    aggiorna();
    box.classList.add('is-pronto');
  });
})();
