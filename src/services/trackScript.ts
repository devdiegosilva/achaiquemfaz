// Script de analytics do client, servido em GET /aqf.js e injetado por paginaSite.
// Vanilla JS, sem dependências. Tudo em try/catch — analytics quebrado nunca derruba
// a página. Ver README > "Analytics".
export const TRACK_JS = `(function () {
  "use strict";
  try {
    function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
    function semWww(h) { return h.indexOf("www.") === 0 ? h.slice(4) : h; }
    function uuid() {
      try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === "x" ? r : ((r & 0x3) | 0x8)).toString(16);
      });
    }

    var sid = lsGet("aqf_sid");
    if (!sid) { sid = uuid(); lsSet("aqf_sid", sid); }

    var attr = null;
    try { attr = JSON.parse(lsGet("aqf_attr") || "null"); } catch (e) {}
    if (!attr || !attr.utm_source) {
      var qs;
      try { qs = new URLSearchParams(window.location.search); } catch (e) { qs = { get: function () { return null; } }; }
      var ref = document.referrer || "";
      var src = qs.get("utm_source");
      if (!src) {
        var refHost = "";
        try { refHost = ref ? semWww(new URL(ref).hostname) : ""; } catch (e) {}
        if (refHost && refHost !== semWww(window.location.hostname)) src = refHost;
        else src = "direto";
      }
      attr = {
        utm_source: src,
        utm_medium: qs.get("utm_medium") || null,
        utm_campaign: qs.get("utm_campaign") || null,
        referrer: ref || null
      };
      lsSet("aqf_attr", JSON.stringify(attr));
    }

    function track(tipo, dados) {
      try {
        var payload = {
          tipo: tipo,
          session_id: sid,
          utm_source: attr.utm_source,
          utm_medium: attr.utm_medium,
          utm_campaign: attr.utm_campaign,
          referrer: attr.referrer,
          interno: lsGet("aqf_interno") === "1"
        };
        if (dados) for (var k in dados) if (k !== "tipo") payload[k] = dados[k];
        var body = JSON.stringify(payload);
        if (tipo === "whatsapp_clicado" && navigator.sendBeacon) {
          navigator.sendBeacon("/api/eventos", new Blob([body], { type: "text/plain" }));
        } else {
          fetch("/api/eventos", { method: "POST", body: body, keepalive: true });
        }
      } catch (e) {}
    }
    window.aqfTrack = track;

    try {
      if (window.__aqfEvento && window.__aqfEvento.tipo) track(window.__aqfEvento.tipo, window.__aqfEvento);
    } catch (e) {}

    document.addEventListener("click", function (e) {
      try {
        var t = e.target;
        var a = t && t.closest ? t.closest("a[data-wa]") : null;
        if (!a) return;
        track("whatsapp_clicado", {
          profissional_slug: a.getAttribute("data-wa") || null,
          contexto: a.getAttribute("data-wa-ctx") || null
        });
      } catch (err) {}
    }, true);
  } catch (e) {}
})();
`;
