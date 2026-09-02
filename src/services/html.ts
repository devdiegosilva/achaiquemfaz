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

// Casca do diretório público: mesma folha, mas com barra de navegação em vez do nº de chamado.
export function paginaSite(opts: {
  titulo: string;
  secoes: string;
  cssExtra?: string;
  metaDescricao?: string;
}): string {
  const corpo = `<div class="oficina">
  <main class="ticket">
    <div class="perf" aria-hidden="true"></div>
    <header class="head">
      <a class="brand" href="/diretorio" style="text-decoration: none; color: inherit;">Achaí <span>Quem Faz</span></a>
      <div class="meta-row">
        <a href="/diretorio" style="color: var(--work); text-decoration: none;">Buscar</a>
        <a href="/diretorio/cadastro" style="color: var(--work); text-decoration: none;">Sou prestador</a>
      </div>
    </header>
    ${opts.secoes}
    <div class="perf" aria-hidden="true"></div>
${RODAPE}
  </main>
</div>`;
  return documento(opts.titulo, opts.cssExtra ?? "", corpo, opts.metaDescricao);
}
