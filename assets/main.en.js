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
  lb.innerHTML = '<img alt=""><div class="lb-bar"><button type="button" data-a="prev">‹ Back</button><span></span><button type="button" data-a="next">Next ›</button><button type="button" data-a="close">Close ✕</button></div>';
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
  const root = document.currentScript ? document.currentScript.src.replace(/assets\/main\.en\.js.*$/, "") : "";
  function loadGA(){
    if (!GA_ID || window.__gaLoaded) return; window.__gaLoaded = true;
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA_ID, { anonymize_ip: true });
  }
  function banner(){
    if (document.querySelector(".cc")) return;
    const d = document.createElement("div"); d.className = "cc"; d.setAttribute("role","dialog"); d.setAttribute("aria-label","Cookie settings");
    d.innerHTML = '<h2>May we count your visit?</h2><p>With your consent we use Google Analytics to see how many guests visit our site. Without consent, no statistics cookies are set. More in our <a href="' + root + 'en/datenschutz/">privacy policy</a>.</p><div class="row"><button type="button" class="btn btn-dark" data-c="deny">Necessary only</button><button type="button" class="btn btn-dark" data-c="allow">Allow statistics</button></div>';
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

// ---- Buchungslinks: HIER eintragen. Leer = Buttons führen zur Anfrage bzw. Seite /buchen/ ----
const BOOKING_URL = "https://atuab4-07-06-02.officialbookings.com/";  // Schmiedsipplhof über Seekda (Urlaub am Bauernhof), Stand 27.10.2026
const HUETTE_URL = "";  // Almhütte: Link der neuen Plattform folgt
const IS_HUT = document.body.classList.contains("huette");
document.querySelectorAll(".js-book").forEach(a => {
  const hut = IS_HUT || a.classList.contains("js-hut");
  const url = hut ? HUETTE_URL : BOOKING_URL;
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
  else if (hut && IS_HUT) a.href = "#anfrage";
  else if (a.getAttribute("href") === "#") a.href = "#kontakt";
});
document.querySelectorAll(".js-book-pending").forEach(e => { e.hidden = !!(IS_HUT ? HUETTE_URL : BOOKING_URL); });

// ---- Reiter Tiere ----
document.querySelectorAll('.tier-tabs').forEach(list => {
  const tabs = [...list.querySelectorAll('[role=tab]')];
  const show = t => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); };
  tabs.forEach((t, i) => { t.addEventListener('click', () => show(t)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; show(n); n.focus(); } }); });
});

// Anfrageformular
(function () {
  var T = {req: "Please fill in.", mail: "Please enter a valid email address.", dates: "Departure must be after arrival.",
    ds: "Please accept the privacy policy.", sending: "Sending …",
    ok: "Thank you! We have received your enquiry and will get back to you within a few hours.",
    fail: "Sorry, sending failed. Please email us at info@almromantik.at or call +43 664 11 44 926."};
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
