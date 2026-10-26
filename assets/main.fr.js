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
