// Google-Analytics-ID hier eintragen (z. B. "G-ABC123"). Leer = Analytics bleibt aus.
const GA_ID = "";
// Galerie mit Großansicht
const data = document.getElementById("gallery-data");
if (data) {
  const pics = JSON.parse(data.textContent);
  let i = 0, lb, img, cap, last;
  const show = n => { i = (n + pics.length) % pics.length; img.src = pics[i].src; img.alt = pics[i].alt; cap.textContent = (i+1) + " / " + pics.length + " · " + pics[i].alt; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; last && last.focus(); };
  lb = document.createElement("div"); lb.className = "lb"; lb.hidden = true; lb.setAttribute("role","dialog"); lb.setAttribute("aria-modal","true"); lb.setAttribute("aria-label","Photos");
  lb.innerHTML = '<img alt=""><div class="lb-bar"><button type="button" data-a="prev">‹ Retour</button><span></span><button type="button" data-a="next">Suivant ›</button><button type="button" data-a="close">Fermer ✕</button></div>';
  document.body.appendChild(lb); img = lb.querySelector("img"); cap = lb.querySelector("span");
  lb.addEventListener("click", e => { const a = e.target.dataset.a; if (a==="prev") show(i-1); else if (a==="next") show(i+1); else if (a==="close" || e.target===lb) close(); });
  document.addEventListener("keydown", e => { if (lb.hidden) return; if (e.key==="Escape") close(); if (e.key==="ArrowLeft") show(i-1); if (e.key==="ArrowRight") show(i+1); });
  let x0 = null; lb.addEventListener("touchstart", e => x0 = e.touches[0].clientX, {passive:true});
  lb.addEventListener("touchend", e => { if (x0===null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  document.querySelectorAll("#gallery button").forEach(b => b.addEventListener("click", () => { last = b; show(+b.dataset.i); lb.hidden = false; document.body.style.overflow = "hidden"; lb.querySelector('[data-a="close"]').focus(); }));
}

// ---- Cookie-Einwilligung (Opt-in) ----
// Google Analytics lädt NUR nach aktiver Zustimmung. Ablehnen ist gleich einfach wie Zustimmen.
(function(){
  const KEY = "alm-consent-v1";
  const get = () => { try { return localStorage.getItem(KEY); } catch(e) { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch(e) {} };
  const root = document.currentScript ? document.currentScript.src.replace(/assets\/main\.fr\.js.*$/, "") : "";
  function loadGA(){
    if (!GA_ID || window.__gaLoaded) return; window.__gaLoaded = true;
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA_ID, { anonymize_ip: true });
  }
  function banner(){
    if (document.querySelector(".cc")) return;
    const d = document.createElement("div"); d.className = "cc"; d.setAttribute("role","dialog"); d.setAttribute("aria-label","Paramètres des cookies");
    d.innerHTML = '<h2>Pouvons-nous compter votre visite ?</h2><p>Avec votre accord, nous utilisons Google Analytics pour savoir combien de personnes visitent notre site. Sans accord, aucun cookie statistique n’est déposé. Plus d’infos dans notre <a href="' + root + 'fr/datenschutz/">politique de confidentialité</a>.</p><div class="row"><button type="button" class="btn btn-dark" data-c="deny">Nécessaires uniquement</button><button type="button" class="btn btn-dark" data-c="allow">Autoriser les statistiques</button></div>';
    d.addEventListener("click", e => { const c = e.target.dataset.c; if (!c) return; set(c); d.remove(); if (c === "allow") loadGA(); else if (window.__gaLoaded) location.reload(); });
    document.body.appendChild(d);
  }
  document.querySelectorAll(".js-cookie-settings").forEach(b => b.addEventListener("click", banner));
  if (!GA_ID) return;              // solange keine ID eingetragen ist: kein Banner, kein Tracking
  const c = get();
  if (c === "allow") loadGA(); else if (c !== "deny") banner();
})();

// Burgermenü
(function () {
  var top = document.querySelector("header.top"), btn = top && top.querySelector(".menu-btn");
  if (!btn) return;
  function set(open) { top.classList.toggle("open", open); btn.setAttribute("aria-expanded", open ? "true" : "false"); }
  btn.addEventListener("click", function () { set(!top.classList.contains("open")); });
  top.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();

// ---- Buchungslink: HIER den Link der Buchungsmaschine eintragen. Leer = Buttons führen zur Seite /buchen/ ----
const BOOKING_URL = "";
if (BOOKING_URL) {
  document.querySelectorAll(".js-book").forEach(a => { a.href = BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll(".js-book-pending").forEach(e => e.hidden = true);
} else document.querySelectorAll('.js-book[href="#"]').forEach(a => a.href = "#kontakt");

// ---- Reiter Tiere ----
document.querySelectorAll('.tier-tabs').forEach(list => {
  const tabs = [...list.querySelectorAll('[role=tab]')];
  const show = t => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); };
  tabs.forEach((t, i) => { t.addEventListener('click', () => show(t)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; show(n); n.focus(); } }); });
});

// Anfrageformular
(function () {
  var T = {req: "Merci de remplir ce champ.", mail: "Merci d'indiquer une adresse e-mail valide.", dates: "Le départ doit être après l'arrivée.",
    ds: "Merci d'accepter la politique de confidentialité.", sending: "Envoi en cours …",
    ok: "Merci ! Votre demande nous est bien parvenue. Nous vous répondons d'ici quelques heures.",
    fail: "L'envoi a malheureusement échoué. Écrivez-nous à info@almromantik.at ou appelez le +43 664 11 44 926."};
  document.querySelectorAll(".js-form").forEach(function (f) {
    var today = new Date().toISOString().slice(0, 10);
    f.querySelectorAll('input[type="date"]').forEach(function (d) { d.min = today; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      function err(el, msg) { var s = el.parentNode.querySelector(".err"); if (s) s.textContent = msg || ""; if (msg) { ok = false; first = first || el; el.setAttribute("aria-invalid", "true"); } else el.removeAttribute("aria-invalid"); }
      f.querySelectorAll("input[required]:not([type=checkbox]),select[required]").forEach(function (el) { err(el, el.value.trim() ? "" : T.req); });
      var m = f.querySelector('[name="email"]'); if (m.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.value)) err(m, T.mail);
      var an = f.querySelector('[name="anreise"]'), ab = f.querySelector('[name="abreise"]');
      if (an.value && ab.value && ab.value <= an.value) err(ab, T.dates);
      var ds = f.querySelector('[name="datenschutz"]'), dse = f.querySelector(".js-dserr");
      dse.textContent = ds.checked ? "" : T.ds; if (!ds.checked) { ok = false; first = first || ds; }
      if (!ok) { first.focus(); return; }
      var btn = f.querySelector('button[type="submit"]'), msg = f.querySelector(".form-msg");
      btn.disabled = true; var lbl = btn.textContent; btn.textContent = T.sending;
      fetch(f.action, {method: "POST", body: new FormData(f), headers: {"Accept": "application/json"}})
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j.ok) throw 0; msg.textContent = T.ok; msg.hidden = false; f.reset(); })
        .catch(function () { msg.textContent = T.fail; msg.hidden = false; })
        .finally(function () { btn.disabled = false; btn.textContent = lbl; msg.setAttribute("tabindex", "-1"); msg.focus(); });
    });
  });
})();
