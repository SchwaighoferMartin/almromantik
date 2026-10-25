// Google-Analytics-ID hier eintragen (z. B. "G-ABC123"). Leer = Analytics bleibt aus.
const GA_ID = "";
// Galerie mit Großansicht
const data = document.getElementById("gallery-data");
if (data) {
  const pics = JSON.parse(data.textContent);
  let i = 0, lb, img, cap, last;
  const show = n => { i = (n + pics.length) % pics.length; img.src = pics[i].src; img.alt = pics[i].alt; cap.textContent = (i+1) + " / " + pics.length + " · " + pics[i].alt; };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; last && last.focus(); };
  lb = document.createElement("div"); lb.className = "lb"; lb.hidden = true; lb.setAttribute("role","dialog"); lb.setAttribute("aria-modal","true"); lb.setAttribute("aria-label","Fotos");
  lb.innerHTML = '<img alt=""><div class="lb-bar"><button type="button" data-a="prev">‹ Zurück</button><span></span><button type="button" data-a="next">Weiter ›</button><button type="button" data-a="close">Schließen ✕</button></div>';
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
  const root = document.currentScript ? document.currentScript.src.replace(/assets\/main\.js.*$/, "") : "";
  function loadGA(){
    if (!GA_ID || window.__gaLoaded) return; window.__gaLoaded = true;
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA_ID, { anonymize_ip: true });
  }
  function banner(){
    if (document.querySelector(".cc")) return;
    const d = document.createElement("div"); d.className = "cc"; d.setAttribute("role","dialog"); d.setAttribute("aria-label","Cookie-Einstellungen");
    d.innerHTML = '<h2>Darf ich mitzählen?</h2><p>Mit deiner Zustimmung verwenden wir Google Analytics, um zu sehen, wie viele Gäste unsere Seite besuchen. Ohne Zustimmung werden keine Statistik-Cookies gesetzt. Mehr dazu in der <a href="' + root + 'datenschutz/">Datenschutzerklärung</a>.</p><div class="row"><button type="button" class="btn btn-dark" data-c="deny">Nur notwendige</button><button type="button" class="btn btn-dark" data-c="allow">Statistik erlauben</button></div>';
    d.addEventListener("click", e => { const c = e.target.dataset.c; if (!c) return; set(c); d.remove(); if (c === "allow") loadGA(); else if (window.__gaLoaded) location.reload(); });
    document.body.appendChild(d);
  }
  document.querySelectorAll(".js-cookie-settings").forEach(b => b.addEventListener("click", banner));
  if (!GA_ID) return;              // solange keine ID eingetragen ist: kein Banner, kein Tracking
  const c = get();
  if (c === "allow") loadGA(); else if (c !== "deny") banner();
})();

// ---- Anfrageformular ----
document.querySelectorAll(".js-form").forEach(form => {
  const $ = n => form.querySelector(`[name="${n}"]`);
  const kids = $("kinder"), ages = form.querySelector(".js-kidages"), an = $("anreise"), ab = $("abreise");
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const iso = today.toISOString().slice(0,10); an.min = iso; ab.min = iso;
  const toggleAges = () => { ages.hidden = +kids.value === 0; ages.querySelector("input").required = +kids.value > 0; };
  kids.addEventListener("change", toggleAges); toggleAges();
  an.addEventListener("change", () => { if (an.value) { const d = new Date(an.value); d.setDate(d.getDate()+1); ab.min = d.toISOString().slice(0,10); } });
  const msg = form.querySelector(".form-msg");
  const setErr = (el, t) => { const e = el.closest(".field")?.querySelector(".err"); if (e) e.textContent = t; el.setAttribute("aria-invalid", t ? "true" : "false"); };
  form.addEventListener("submit", async e => {
    e.preventDefault(); let ok = true;
    [["vorname","Bitte gib deinen Vornamen ein."],["nachname","Bitte gib deinen Nachnamen ein."]].forEach(([n,t]) => { const v = $(n).value.trim(); setErr($(n), v ? "" : t); if (!v) ok = false; });
    const mail = $("email"); const mOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()); setErr(mail, mOk ? "" : "Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.at."); if (!mOk) ok = false;
    if (+kids.value > 0) { const a = $("kinderalter"); const v = a.value.trim(); setErr(a, v ? "" : "Bitte gib das Alter der Kinder an."); if (!v) ok = false; }
    const aOk = an.value && an.value >= iso; setErr(an, aOk ? "" : "Bitte wähle ein Anreisedatum ab heute."); if (!aOk) ok = false;
    const bOk = ab.value && an.value && ab.value > an.value; setErr(ab, bOk ? "" : "Die Abreise muss nach der Anreise liegen."); if (!bOk) ok = false;
    const ds = form.querySelector('[name="datenschutz"]'); const dsErr = form.querySelector(".js-dserr");
    dsErr.textContent = ds.checked ? "" : "Bitte stimm der Datenschutzerklärung zu, damit wir deine Anfrage bearbeiten können."; if (!ds.checked) ok = false;
    if (!ok) { form.querySelector('[aria-invalid="true"], .js-dserr:not(:empty)')?.scrollIntoView({block:"center", behavior:"smooth"}); return; }
    if (location.hostname.endsWith("github.io")) { msg.hidden = false; msg.textContent = "Testseite: Das Formular ist geprüft und funktioniert, sobald die Seite auf eurem Server liegt. Hier wird noch nichts verschickt."; return; }
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = "Wird gesendet …";
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form) }); const j = await r.json();
      msg.hidden = false; msg.textContent = j.ok ? "Danke! Deine Anfrage ist bei uns angekommen. Wir melden uns so schnell wie möglich persönlich bei dir." : "Das hat leider nicht geklappt. Bitte ruf uns an oder schreib an info@almromantik.at.";
      if (j.ok) form.reset(), toggleAges();
    } catch (_) { msg.hidden = false; msg.textContent = "Das hat leider nicht geklappt. Bitte ruf uns an oder schreib an info@almromantik.at."; }
    btn.disabled = false; btn.textContent = "Anfrage senden";
  });
});
