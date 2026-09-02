// Identidade visual "ordem de serviço", na paleta creme/verde-floresta/coral — fixa,
// não muda com o tema escuro do sistema. Usada em duas cascas:
//   paginaTicket  -> landing/cadastro do fluxo WhatsApp (papel picotado, nº de chamado)
//   paginaSite    -> diretório público (/diretorio), com barra de navegação

const FONTES_E_GA = `
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9V8C587NK5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-9V8C587NK5');
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

const CSS_BASE = `
  :root {
    --backdrop: #e3d3b8;
    --paper: #fcf1e4;
    --paper-alt: #f6e7d3;
    --ink: #2e322c;
    --ink-muted: #756b5c;
    --stamp: #c04a1f;
    --stamp-ink: #fcf1e4;
    --work: #145c45;
    --work-deep: #0f4835;
    --paper-sink: #efe0c8;
    --line: #d9c9ab;
    --line-strong: #c2ae87;
    --shadow: rgba(30, 26, 16, 0.22);
    --font-display: "Big Shoulders Display", "Arial Narrow", sans-serif;
    --font-body: "Work Sans", system-ui, sans-serif;
    --font-mono: "IBM Plex Mono", "Courier New", monospace;
  }
  /* Identidade fixa em creme/verde/coral — não muda com o tema escuro do sistema. */
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--backdrop); color: var(--ink); font-family: var(--font-body); line-height: 1.55; -webkit-font-smoothing: antialiased; }
  .oficina { min-height: 100vh; display: flex; justify-content: center; padding: clamp(20px, 5vw, 56px) 16px; }
  .ticket { width: 100%; max-width: 720px; background: var(--paper); box-shadow: 0 18px 40px -12px var(--shadow), 0 2px 0 var(--line-strong); position: relative; }
  .perf { height: 15px; background-color: var(--paper); background-image: radial-gradient(circle at 10px 7px, var(--backdrop) 5px, transparent 5.6px); background-size: 20px 15px; background-repeat: repeat-x; }
  .tear { border: none; border-top: 2px dashed var(--line); margin: 0 clamp(20px, 6vw, 48px); position: relative; }
  .tear::before, .tear::after { content: ""; position: absolute; top: -5px; width: 9px; height: 9px; border-radius: 50%; background: var(--backdrop); border: 1.5px solid var(--line); }
  .tear::before { left: -9px; }
  .tear::after { right: -9px; }
  header.head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 22px clamp(20px, 6vw, 48px) 10px; flex-wrap: wrap; }
  .brand { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; letter-spacing: 0.02em; text-transform: uppercase; }
  .brand span { color: var(--work); }
  .meta-row { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .stamp-num { display: inline-block; font-variant-numeric: tabular-nums; }
  @keyframes subida { 0% { opacity: 0.25; transform: translateY(-7px); } 100% { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: no-preference) { .stamp-num.bump { animation: subida 0.4s ease-out; } }
  section { padding: clamp(28px, 6vw, 48px) clamp(20px, 6vw, 48px); }
  .hero { padding-top: 12px; }
  h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.1rem, 6vw, 3.1rem); line-height: 1.02; letter-spacing: -0.01em; margin: 0 0 18px; text-wrap: balance; max-width: 15ch; color: var(--work); }
  p.lede { font-size: 1.08rem; color: var(--ink-muted); max-width: 46ch; margin: 0 0 28px; }
  .stamp-btn { display: inline-block; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; letter-spacing: 0.03em; text-transform: uppercase; text-decoration: none; color: var(--stamp); background: transparent; border: 3px solid var(--stamp); padding: 13px 26px; border-radius: 3px; outline-offset: 4px; transform: rotate(-1.2deg); transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease; position: relative; }
  .stamp-btn::after { content: ""; position: absolute; inset: 4px; border: 1px solid var(--stamp); border-radius: 1px; pointer-events: none; }
  .stamp-btn:hover { background: var(--stamp); color: var(--stamp-ink); transform: rotate(-1.2deg) scale(1.03); }
  .stamp-btn:active { transform: rotate(-0.6deg) scale(0.97); }
  .stamp-btn:focus-visible { outline: 2px solid var(--work); }
  h2 { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.01em; margin: 0 0 22px; color: var(--work); }
  ol.ticket-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
  ol.ticket-list li { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: start; }
  ol.ticket-list .num { font-family: var(--font-mono); font-weight: 600; font-size: 1.6rem; color: var(--work); line-height: 1; padding-top: 2px; }
  ol.ticket-list p { margin: 0; padding-top: 4px; }
  ul.checklist { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
  ul.checklist li { display: flex; align-items: flex-start; gap: 12px; }
  ul.checklist li::before { content: "\\2713"; flex-shrink: 0; width: 18px; height: 18px; border: 1.5px solid var(--work); color: var(--work); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 2px; margin-top: 2px; }
  .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.76rem; letter-spacing: 0.02em; text-transform: uppercase; padding: 6px 10px; border: 1px solid var(--line-strong); background: var(--paper-alt); border-radius: 3px; }
  .chip .tick { width: 12px; height: 12px; border: 1.3px solid var(--work); border-radius: 2px; position: relative; flex-shrink: 0; }
  .chip .tick::after { content: ""; position: absolute; left: 2px; top: -1px; width: 4px; height: 7px; border: solid var(--work); border-width: 0 1.5px 1.5px 0; transform: rotate(40deg); }
  p.nota { color: var(--ink-muted); font-size: 0.92rem; margin: 0 0 8px; }
  .receipt { border: 1.5px solid var(--line-strong); padding: 18px 20px; margin-bottom: 20px; }
  .receipt-row, .receipt-total { display: flex; justify-content: space-between; align-items: baseline; font-family: var(--font-mono); }
  .receipt-row { font-size: 0.85rem; color: var(--ink-muted); padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px dashed var(--line); }
  .receipt-total { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .receipt-total .valor { font-family: var(--font-display); font-weight: 800; font-size: 2.1rem; letter-spacing: 0; text-transform: none; color: var(--stamp); }
  .receipt-total .valor small { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 500; color: var(--ink-muted); }
  footer.foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 18px clamp(20px, 6vw, 48px) 22px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-muted); }
  footer.foot a { color: var(--work); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
  footer.foot a:hover, footer.foot a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }
  footer.foot svg { flex-shrink: 0; }
  .msg { text-align: center; padding-top: clamp(48px, 12vw, 88px); padding-bottom: clamp(48px, 12vw, 88px); }
  @media (prefers-reduced-motion: reduce) { .stamp-btn { transition: none; } }
`;

const RODAPE = `
    <footer class="foot">
      <span>Achaí Quem Faz</span>
      <a href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="12" cy="12" r="4.3" stroke="currentColor" stroke-width="1.8"/>
          <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor"/>
        </svg>
        @achaiquemfaz
      </a>
      <span>João Pessoa · PB</span>
    </footer>`;

// Escapa texto vindo do banco (nome, descrição, bairro) antes de interpolar no HTML.
export function escaparHtml(valor: string | null | undefined): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escExtra(cssExtra: string): string {
  return cssExtra ? `\n  ${cssExtra}` : "";
}

function documento(titulo: string, cssExtra: string, corpo: string, metaDescricao?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${titulo} — Achaí Quem Faz</title>${
    metaDescricao ? `\n<meta name="description" content="${metaDescricao}" />` : ""
  }
${FONTES_E_GA}
<style>${CSS_BASE}${escExtra(cssExtra)}</style>
</head>
<body>
${corpo}
</body>
</html>`;
}

// Casca "ordem de serviço": papel kraft picotado, com nº de chamado que roda sozinho.
export function paginaTicket(titulo: string, secoes: string, cssExtra = ""): string {
  const corpo = `<div class="oficina">
  <main class="ticket">
    <div class="perf" aria-hidden="true"></div>
    <header class="head">
      <div class="brand">Achaí <span>Quem Faz</span></div>
      <div class="meta-row">
        <span class="stamp-num" id="ticketNum">Nº 0001</span>
        <span>Chamado via WhatsApp</span>
      </div>
    </header>
    ${secoes}
    <div class="perf" aria-hidden="true"></div>
${RODAPE}
  </main>
</div>
<script>
  (function () {
    var el = document.getElementById("ticketNum");
    if (!el) return;
    var n = 1;
    function render() { el.textContent = "Nº " + String(n).padStart(4, "0"); }
    render();
    setInterval(function () {
      n++;
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
      render();
    }, 4000);
  })();
</script>`;
  return documento(titulo, cssExtra, corpo);
}

// CSS do diretório (formato marketplace). Injetado só pelas páginas do site,
// não pesa nas páginas de "ticket" do fluxo WhatsApp.
const CSS_SITE = `
  .site { min-height: 100vh; display: flex; flex-direction: column; background: var(--backdrop); }
  .site-top {
    position: sticky; top: 0; z-index: 20;
    background: var(--work-deep); color: var(--paper);
    display: flex; align-items: center; gap: 16px;
    padding: 12px clamp(14px, 4vw, 28px);
  }
  .site-logo {
    font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; line-height: 0.95;
    text-transform: uppercase; letter-spacing: 0.01em; color: var(--paper);
    text-decoration: none; white-space: nowrap;
  }
  .site-logo span { display: block; font-size: 0.72rem; letter-spacing: 0.2em; color: #f0b8a3; }
  .site-search { flex: 1; display: flex; min-width: 0; background: var(--paper); border-radius: 4px; overflow: hidden; border: 2px solid transparent; }
  .site-search:focus-within { border-color: #c9871f; }
  .site-search select {
    border: none; background: var(--paper-sink); color: var(--ink);
    font-family: var(--font-mono); font-size: 0.78rem; padding: 0 8px;
    border-right: 1px solid var(--line-strong); max-width: 150px; cursor: pointer;
  }
  .site-search input {
    flex: 1; min-width: 0; border: none; padding: 11px 13px;
    font-family: var(--font-body); font-size: 0.98rem; color: var(--ink); background: var(--paper);
  }
  .site-search input::placeholder { color: var(--ink-muted); }
  .site-search button { border: none; background: var(--stamp); color: var(--paper); padding: 0 17px; display: flex; align-items: center; cursor: pointer; }
  .site-search button svg { width: 19px; height: 19px; }
  .site-top-right { display: flex; align-items: center; gap: 14px; white-space: nowrap; }
  .site-loc { font-family: var(--font-mono); font-size: 0.7rem; line-height: 1.2; color: #e6d7c2; display: flex; align-items: center; gap: 6px; }
  .site-loc strong { color: var(--paper); font-weight: 600; }
  .site-prest {
    font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
    font-size: 0.9rem; color: var(--paper); text-decoration: none;
    border: 1.5px solid rgba(252, 241, 228, 0.5); padding: 7px 12px; border-radius: 3px;
  }
  .site-prest:hover { background: rgba(252, 241, 228, 0.12); }
  .site-main { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; }
  .site-main.estreita { max-width: 640px; }
  .site-foot {
    background: var(--work-deep); color: #dcccb4;
    font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
    padding: 18px clamp(14px, 4vw, 28px); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .site-foot a { color: #f0b8a3; text-decoration: none; }

  .subbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px clamp(14px, 4vw, 28px); background: var(--paper-alt); border-bottom: 1px solid var(--line-strong); }
  .crumbs { font-family: var(--font-mono); font-size: 0.74rem; color: var(--ink-muted); letter-spacing: 0.03em; }
  .crumbs a { text-decoration: none; color: var(--work); }
  .crumbs .sep { margin: 0 7px; opacity: 0.6; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip-filtro { display: inline-flex; align-items: center; gap: 7px; background: var(--paper); border: 1px solid var(--line-strong); border-radius: 999px; padding: 4px 6px 4px 12px; font-size: 0.8rem; text-decoration: none; color: var(--ink); }
  .chip-filtro span { background: var(--paper-sink); color: var(--ink-muted); width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; line-height: 1; }
  .subbar .count { margin-left: auto; font-family: var(--font-mono); font-size: 0.76rem; color: var(--ink-muted); }
  .sortsel { font-family: var(--font-mono); font-size: 0.76rem; padding: 7px 10px; border: 1px solid var(--line-strong); background: var(--paper); color: var(--ink); border-radius: 3px; }

  .body { display: grid; grid-template-columns: 232px 1fr; gap: 28px; padding: 22px clamp(14px, 4vw, 28px) 40px; }
  .filtros { align-self: start; }
  .filtros-acc > summary { display: none; }
  .filtros-acc[open] { display: block; }
  .fgrupo { border-bottom: 1px solid var(--line); padding: 2px 0 14px; margin-bottom: 14px; }
  .fgrupo:last-child { border-bottom: none; }
  .fgrupo h3 { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); margin: 0 0 10px; }
  a.fopt { display: flex; align-items: center; gap: 9px; padding: 5px 0; font-size: 0.9rem; text-decoration: none; color: var(--ink); }
  a.fopt:hover { color: var(--work); }
  a.fopt[aria-current="true"] { color: var(--work); font-weight: 600; }
  a.fopt .marca { width: 13px; height: 13px; border: 1.5px solid var(--line-strong); border-radius: 3px; flex-shrink: 0; }
  a.fopt[aria-current="true"] .marca { border-color: var(--work); background: var(--work); }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(228px, 1fr)); gap: 16px; }
  .card { position: relative; display: flex; flex-direction: column; gap: 9px; background: var(--paper); border: 1px solid var(--line-strong); border-radius: 5px; padding: 16px 16px 15px; color: var(--ink); transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease; }
  .card:hover { transform: translateY(-3px); border-color: var(--work); box-shadow: 0 12px 24px -14px var(--shadow); }
  .card-stretch { position: absolute; inset: 0; border-radius: inherit; text-indent: -9999px; overflow: hidden; }
  .card-stretch:focus-visible { outline: 2px solid var(--work); outline-offset: 2px; }
  .card .wa { position: relative; z-index: 1; }
  .card-head { display: flex; align-items: center; gap: 11px; }
  .card-id { display: flex; flex-direction: column; min-width: 0; }
  .monogram { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; background: var(--work); color: var(--paper); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; }
  .monogram.big { width: 88px; height: 88px; font-size: 2.1rem; }
  .card-name { display: block; font-weight: 600; font-size: 1rem; line-height: 1.2; overflow-wrap: anywhere; }
  .card-cat { display: block; font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); margin-top: 2px; }
  .card-loc { font-size: 0.85rem; color: var(--ink-muted); }
  .card-desc { font-size: 0.88rem; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-segs { display: flex; gap: 5px; flex-wrap: wrap; }
  .seg { font-family: var(--font-mono); font-size: 0.63rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-muted); border: 1px solid var(--line); border-radius: 2px; padding: 2px 6px; }
  .wa { margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--work); color: var(--paper); text-decoration: none; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.95rem; padding: 10px 12px; border: none; border-radius: 3px; cursor: pointer; transition: background 0.14s ease; }
  .wa:hover { background: var(--work-deep); }
  .wa svg { width: 16px; height: 16px; }

  .pager { display: flex; justify-content: center; gap: 6px; margin-top: 26px; }
  .pager span, .pager a { font-family: var(--font-mono); font-size: 0.8rem; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--line-strong); border-radius: 3px; text-decoration: none; color: var(--ink); }
  .pager .on { background: var(--work); color: var(--paper); border-color: var(--work); }
  .vazio { border: 1px dashed var(--line-strong); border-radius: 4px; padding: 40px 22px; text-align: center; color: var(--ink-muted); font-size: 0.95rem; }

  .pdp { padding: 26px clamp(14px, 4vw, 28px) 44px; display: grid; grid-template-columns: 1fr 330px; gap: 34px; }
  .pdp-main { min-width: 0; }
  .pdp-id { display: flex; gap: 18px; align-items: center; margin-bottom: 8px; }
  .pdp h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.8rem, 5vw, 2.15rem); line-height: 1; margin: 0 0 6px; color: var(--work-deep); text-wrap: balance; }
  .pdp .kicker { font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--stamp); margin-bottom: 4px; }
  .pdp-meta { margin: 16px 0 0; font-size: 0.88rem; color: var(--ink-muted); font-family: var(--font-mono); display: flex; gap: 8px 16px; flex-wrap: wrap; }
  .pdp-sec { border-top: 1px solid var(--line); padding-top: 20px; margin-top: 24px; }
  .pdp-sec h2 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; font-size: 1.15rem; color: var(--work-deep); margin: 0 0 12px; }
  .pdp-sec p.sobre { font-size: 0.98rem; max-width: 60ch; margin: 0; white-space: pre-wrap; }
  .svc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px 16px; }
  .svc { display: flex; gap: 8px; align-items: baseline; font-size: 0.92rem; }
  .svc::before { content: "\\2713"; flex-shrink: 0; color: var(--work); font-weight: 700; font-size: 0.9rem; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .step .num { font-family: var(--font-mono); font-weight: 600; color: var(--stamp); font-size: 0.9rem; }
  .step p { margin: 4px 0 0; font-size: 0.86rem; color: var(--ink-muted); }
  .buybox { align-self: start; position: sticky; top: 84px; border: 1.5px solid var(--line-strong); border-radius: 6px; background: var(--paper-alt); padding: 20px; }
  .bb-label { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-muted); }
  .bb-name { font-family: var(--font-display); font-weight: 700; font-size: 1.4rem; color: var(--work-deep); margin: 3px 0 2px; }
  .bb-sub { font-size: 0.84rem; color: var(--ink-muted); margin-bottom: 16px; }
  .buybox .wa { width: 100%; font-size: 1.05rem; padding: 13px; }
  .bb-note { margin-top: 14px; font-size: 0.8rem; color: var(--ink-muted); border: 1px dashed var(--line-strong); border-radius: 4px; padding: 10px 12px; background: var(--paper); }
  .bb-report { display: block; margin-top: 12px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink-muted); }

  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; }
    .filtros-acc { border: 1px solid var(--line-strong); border-radius: 4px; padding: 2px 14px; background: var(--paper-alt); }
    .filtros-acc > summary { display: block; font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 10px 0; cursor: pointer; }
    .filtros-acc[open] > div { max-height: 280px; overflow-y: auto; margin-bottom: 8px; }
    .pdp { grid-template-columns: 1fr; }
    .buybox { position: static; }
    .steps { grid-template-columns: 1fr; }
  }
  @media (max-width: 620px) {
    .site-top { flex-wrap: wrap; }
    .site-search { order: 3; flex-basis: 100%; }
    .site-search select { display: none; }
    .site-prest { display: none; }
  }
`;

// Casca do diretório: barra de busca fixa no topo (formato marketplace), conteúdo
// central e rodapé. paginaTicket (fluxo WhatsApp) continua intocada.
export function paginaSite(opts: {
  titulo: string;
  secoes: string;
  cssExtra?: string;
  metaDescricao?: string;
  largura?: "ampla" | "estreita";
  busca?: {
    categorias: Array<{ valor: string; rotulo: string }>;
    categoriaAtual?: string;
    termoAtual?: string;
  };
}): string {
  const cats = opts.busca?.categorias ?? [];
  const catAtual = opts.busca?.categoriaAtual ?? "";
  const opcoesCat = cats
    .map(
      (c) =>
        `<option value="${escaparHtml(c.valor)}"${c.valor === catAtual ? " selected" : ""}>${escaparHtml(c.rotulo)}</option>`
    )
    .join("");

  const iconeBusca = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;

  const corpo = `<div class="site">
  <header class="site-top">
    <a class="site-logo" href="/diretorio">Achaí<span>Quem Faz</span></a>
    <form class="site-search" method="GET" action="/diretorio" role="search">
      <select name="categoria" aria-label="Serviço">
        <option value="">Todos os serviços</option>
        ${opcoesCat}
      </select>
      <input type="text" name="q" value="${escaparHtml(opts.busca?.termoAtual ?? "")}" placeholder="Buscar eletricista, encanador, diarista…" />
      <button type="submit" aria-label="Buscar">${iconeBusca}</button>
    </form>
    <div class="site-top-right">
      <span class="site-loc">Atende em&nbsp;<strong>João Pessoa · PB</strong></span>
      <a class="site-prest" href="/diretorio/cadastro">Sou prestador</a>
    </div>
  </header>
  <main class="site-main${opts.largura === "estreita" ? " estreita" : ""}">
    ${opts.secoes}
  </main>
  <footer class="site-foot">
    <span>Achaí Quem Faz · João Pessoa · PB</span>
    <span><a href="/diretorio/cadastro">Sou prestador</a> &nbsp;·&nbsp; <a href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">@achaiquemfaz</a></span>
  </footer>
</div>`;

  return documento(opts.titulo, `${CSS_SITE}${opts.cssExtra ? `\n${opts.cssExtra}` : ""}`, corpo, opts.metaDescricao);
}
