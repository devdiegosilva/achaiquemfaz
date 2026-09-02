// Identidade visual "ordem de serviço", na paleta creme/verde-floresta/coral — fixa,
// não muda com o tema escuro do sistema. Usada em duas cascas:
//   paginaTicket  -> landing/cadastro do fluxo WhatsApp (papel picotado, nº de chamado)
//   paginaSite    -> diretório público (/diretorio) — design system branco/SaaS (ver CSS_SITE)

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
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

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

// ============================================================================
// Design system do diretório (/diretorio) — base branca SaaS, verde primário,
// coral só em detalhe. Tema único claro, pintado explicitamente. Não afeta o
// fluxo WhatsApp (paginaTicket usa só CSS_BASE).
// ============================================================================
const CSS_SITE = `
  :root {
    --bg: #ffffff;
    --surface: #ffffff;
    --surface-2: #f6f7f6;
    --surface-3: #eef0ef;
    --border: #e4e6e4;
    --border-strong: #d2d5d2;
    --text: #18201c;
    --text-muted: #586159;
    --text-subtle: #838b84;
    --primary: #15654a;
    --primary-hover: #0f4f3a;
    --primary-weak: #e8f1ec;
    --on-primary: #ffffff;
    --accent: #c8461d;
    --success: #1a7f4f; --success-weak: #e6f4ec;
    --error: #c0392b;   --error-weak: #fbeae8;
    --warning: #b7791f; --warning-weak: #fbf1e0;
    --info: #2c6e9e;    --info-weak: #e7f1f8;
    --r-sm: 8px; --r-md: 10px; --r-lg: 14px; --r-pill: 999px;
    --shadow-sm: 0 1px 2px rgba(18,28,22,.06), 0 1px 3px rgba(18,28,22,.04);
    --shadow-md: 0 6px 16px -6px rgba(18,28,22,.12), 0 2px 6px rgba(18,28,22,.05);
    --font-head: "Bricolage Grotesque", "Work Sans", system-ui, sans-serif;
  }

  body:has(.site) { background: var(--surface-2); }
  .site { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); }
  .site a { color: var(--primary); text-decoration: none; }
  .site a:hover { text-decoration: underline; text-underline-offset: 2px; }
  /* links estilizados como botão: a cor do texto vem do próprio botão, não do link */
  .site a.btn-primary, .site a.btn-primary:hover { color: var(--on-primary); text-decoration: none; }
  .site a.btn-ghost, .site a.btn-ghost:hover { color: var(--text); text-decoration: none; }
  .site h1, .site h2, .site h3 { font-family: var(--font-head); font-weight: 700; letter-spacing: -0.02em; text-wrap: balance; margin: 0; color: var(--text); }
  .site :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 3px; }
  .site-main { flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; }
  .site-main.estreita { max-width: 620px; }
  .eyebrow { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--font-body); font-weight: 600; font-size: 0.95rem; line-height: 1.2; padding: 10px 18px; border-radius: var(--r-sm); border: 1px solid transparent; cursor: pointer; text-decoration: none; transition: background .14s, border-color .14s, color .14s; }
  .btn:hover { text-decoration: none; }
  .btn-primary { background: var(--primary); color: var(--on-primary); }
  .btn-primary:hover { background: var(--primary-hover); }
  .btn-ghost { background: var(--surface); color: var(--text); border-color: var(--border-strong); }
  .btn-ghost:hover { background: var(--surface-2); }
  .btn-sm { font-size: 0.86rem; padding: 8px 14px; }
  .btn-lg { font-size: 1rem; padding: 13px 22px; }
  .btn-block { width: 100%; }
  .btn svg { width: 18px; height: 18px; flex-shrink: 0; }
  .btn[hidden] { display: none; }

  /* ---- header ---- */
  .hd { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px clamp(16px, 4vw, 32px); border-bottom: 1px solid var(--border); background: var(--surface); }
  .hd-logo { font-family: var(--font-head); font-weight: 800; font-size: 1.12rem; letter-spacing: -0.02em; color: var(--text); display: inline-flex; align-items: center; gap: 9px; }
  .hd-logo:hover { text-decoration: none; }
  .hd-logo .mark { width: 24px; height: 24px; border-radius: 7px; background: var(--primary); color: #fff; display: grid; place-items: center; font-size: 0.8rem; }
  .hd-nav { display: flex; align-items: center; gap: 24px; font-size: 0.9rem; }
  .hd-nav > a { color: var(--text-muted); }
  .hd-nav > a:hover { color: var(--text); text-decoration: none; }
  .hd-menu { display: none; }
  .hd-menu > summary { list-style: none; border: 1px solid var(--border-strong); border-radius: var(--r-sm); padding: 7px 9px; cursor: pointer; display: grid; place-items: center; }
  .hd-menu > summary::-webkit-details-marker { display: none; }
  .hd-menu > summary svg { width: 18px; height: 18px; display: block; }
  .hd-pop { position: absolute; right: clamp(16px, 4vw, 32px); top: calc(100% + 6px); background: var(--surface); border: 1px solid var(--border-strong); border-radius: var(--r-md); box-shadow: var(--shadow-md); display: grid; padding: 6px; min-width: 200px; z-index: 30; }
  .hd-pop a { padding: 10px 12px; border-radius: var(--r-sm); color: var(--text); font-size: 0.92rem; }
  .hd-pop a:hover { background: var(--surface-2); text-decoration: none; }

  /* ---- footer ---- */
  .ft { background: var(--surface-2); border-top: 1px solid var(--border); padding: 26px clamp(16px, 4vw, 32px); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 0.84rem; color: var(--text-muted); }
  .ft a { color: var(--text-muted); }

  /* ---- home ---- */
  .hero { padding: clamp(44px, 8vw, 88px) clamp(16px, 4vw, 32px) clamp(34px, 5vw, 52px); text-align: center; background: linear-gradient(180deg, var(--surface-2), var(--bg)); border-bottom: 1px solid var(--border); }
  .hero h1 { font-size: clamp(2rem, 5.4vw, 3.3rem); line-height: 1.06; font-weight: 800; max-width: 17ch; margin: 0 auto 16px; }
  .hero .sub { font-size: clamp(1rem, 2vw, 1.16rem); color: var(--text-muted); max-width: 52ch; margin: 0 auto 30px; }
  .searchpanel { max-width: 720px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border-strong); border-radius: var(--r-lg); box-shadow: var(--shadow-md); display: flex; align-items: stretch; padding: 8px; gap: 8px; text-align: left; }
  .sp-field { flex: 1; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: var(--r-sm); min-width: 0; }
  .sp-field + .sp-field { border-left: 1px solid var(--border); border-radius: 0; }
  .sp-field svg { width: 18px; height: 18px; color: var(--text-subtle); flex-shrink: 0; }
  .sp-field .col { flex: 1; min-width: 0; }
  .sp-field .lbl { display: block; font-size: 0.66rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); }
  .sp-field input { border: none; background: none; font-family: inherit; font-size: 0.98rem; color: var(--text); width: 100%; padding: 2px 0 0; }
  .sp-field input:focus { outline: none; }
  .searchpanel .btn { flex-shrink: 0; }

  .home-sec { max-width: 1000px; margin: 0 auto; padding: clamp(40px, 6vw, 68px) clamp(16px, 4vw, 32px); }
  .home-sec + .home-sec { border-top: 1px solid var(--border); }
  .home-sec h2 { font-size: clamp(1.45rem, 3vw, 1.85rem); font-weight: 700; margin-bottom: 6px; }
  .home-sec .lead { color: var(--text-muted); margin-bottom: 26px; }
  .cats { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; }
  .cat { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface); transition: border-color .14s, background .14s; }
  .cat:hover { border-color: var(--primary); background: var(--primary-weak); text-decoration: none; }
  .cat .ic { font-size: 1.4rem; line-height: 1; }
  .cat .nm { font-weight: 600; font-size: 0.9rem; color: var(--text); }
  .steps3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .stp { padding-top: 16px; border-top: 2px solid var(--primary); }
  .stp .n { font-family: var(--font-mono); font-weight: 600; color: var(--primary); font-size: 0.82rem; }
  .stp h3 { font-family: var(--font-head); font-size: 1.02rem; font-weight: 700; margin: 6px 0; }
  .stp p { font-size: 0.9rem; color: var(--text-muted); }

  /* ---- resultados ---- */
  .rbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 12px clamp(16px, 4vw, 32px); border-bottom: 1px solid var(--border); background: var(--surface); }
  .rbar form.mini { display: flex; flex: 1; min-width: 240px; border: 1px solid var(--border-strong); border-radius: var(--r-sm); overflow: hidden; background: var(--surface); }
  .rbar .mini input { flex: 1; min-width: 0; border: none; padding: 9px 12px; font-family: inherit; font-size: 0.9rem; color: var(--text); background: var(--surface); }
  .rbar .mini input:focus { outline: none; background: var(--surface-2); }
  .rbar .mini input + input { border-left: 1px solid var(--border); }
  .rbar .mini button { border: none; background: var(--primary); color: #fff; padding: 0 18px; font-family: var(--font-body); font-weight: 600; font-size: 0.88rem; cursor: pointer; }
  .rhead { padding: 20px clamp(16px, 4vw, 32px) 0; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .rhead h1 { font-size: 1.28rem; font-weight: 700; }
  .rhead .srt { font-size: 0.84rem; color: var(--text-muted); }
  .rhead .srt a { font-weight: 500; color: var(--text-subtle); }
  .rhead .srt a[aria-current="true"] { color: var(--text); font-weight: 600; }
  .rlayout { display: grid; grid-template-columns: 244px 1fr; gap: 30px; padding: 20px clamp(16px, 4vw, 32px) 44px; }
  .flt { align-self: start; }
  .flt-acc > summary { list-style: none; }
  .flt-acc > summary::-webkit-details-marker { display: none; }
  .fg { border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 14px; }
  .fg:last-child { border: none; margin-bottom: 0; }
  .fg h3 { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); margin-bottom: 10px; }
  a.fopt { display: flex; align-items: center; gap: 9px; padding: 6px 0; font-size: 0.9rem; color: var(--text-muted); }
  a.fopt:hover { color: var(--text); text-decoration: none; }
  a.fopt[aria-current="true"] { color: var(--primary); font-weight: 600; }
  a.fopt .box { width: 15px; height: 15px; border: 1.5px solid var(--border-strong); border-radius: 4px; flex-shrink: 0; }
  a.fopt[aria-current="true"] .box { background: var(--primary); border-color: var(--primary); }
  a.fopt .cnt { margin-left: auto; font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-subtle); }

  .plist { display: grid; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); gap: 14px; }
  .pcard { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 16px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface); transition: border-color .14s, box-shadow .14s; }
  .pcard:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
  .card-link { position: absolute; inset: 0; border-radius: inherit; text-indent: -9999px; overflow: hidden; }
  .pcard-top { display: flex; align-items: center; gap: 12px; }
  .avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--primary-weak); color: var(--primary); display: grid; place-items: center; font-family: var(--font-head); font-weight: 700; font-size: 1.05rem; flex-shrink: 0; }
  .avatar.lg { width: 84px; height: 84px; font-size: 1.9rem; }
  .pcard .nm { font-weight: 700; font-size: 1rem; line-height: 1.25; }
  .pcard .ct { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-subtle); }
  .pcard .loc { font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
  .pcard .loc svg { width: 13px; height: 13px; color: var(--text-subtle); flex-shrink: 0; }
  .pcard .dsc { font-size: 0.87rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pcard .tags { display: flex; gap: 5px; flex-wrap: wrap; }
  .tag { font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-pill); padding: 2px 8px; }
  .tag.tag-verif { display: inline-flex; align-items: center; gap: 4px; color: var(--primary); background: var(--primary-weak); border-color: var(--primary); font-weight: 600; }
  .tag.tag-verif svg { width: 10px; height: 10px; }
  .selo-verif { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; color: var(--primary); background: var(--primary-weak); border: 1px solid var(--primary); border-radius: var(--r-pill); padding: 3px 10px; }
  .selo-verif svg { width: 12px; height: 12px; }
  .pcard .btn { margin-top: auto; position: relative; z-index: 1; }

  .pager { display: flex; justify-content: center; gap: 6px; margin-top: 26px; }
  .pager span, .pager a { font-family: var(--font-mono); font-size: 0.8rem; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-strong); border-radius: var(--r-sm); color: var(--text); }
  .pager a:hover { background: var(--surface-2); text-decoration: none; }
  .pager .on { background: var(--primary); color: #fff; border-color: var(--primary); }

  .empty { border: 1px dashed var(--border-strong); border-radius: var(--r-md); padding: 44px 24px; text-align: center; }
  .empty h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; }
  .empty p { font-size: 0.9rem; color: var(--text-muted); }
  .empty ul { list-style: none; padding: 0; margin: 16px 0 0; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .empty li a { font-size: 0.82rem; border: 1px solid var(--border-strong); border-radius: var(--r-pill); padding: 6px 13px; color: var(--text-muted); }
  .empty li a:hover { text-decoration: none; border-color: var(--primary); color: var(--primary); }

  /* ---- perfil ---- */
  .crumbs { padding: 16px clamp(16px, 4vw, 32px) 0; font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-subtle); }
  .crumbs a { color: var(--text-subtle); }
  .crumbs .sep { margin: 0 7px; opacity: 0.6; }
  .pdp { display: grid; grid-template-columns: 1fr 350px; gap: 38px; padding: 22px clamp(16px, 4vw, 32px) 40px; }
  .pdp-main { min-width: 0; }
  .pdp-id { display: flex; gap: 18px; align-items: center; }
  .pdp-id .selo-verif { margin-top: 9px; }
  .pdp h1 { font-size: clamp(1.7rem, 4vw, 2.2rem); font-weight: 800; margin: 4px 0 0; }
  .pdp .meta { display: flex; gap: 8px 18px; flex-wrap: wrap; font-size: 0.86rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 14px; }
  .pdp-sec { border-top: 1px solid var(--border); margin-top: 26px; padding-top: 22px; }
  .pdp-sec h2 { font-size: 1.12rem; font-weight: 700; margin-bottom: 12px; }
  .pdp-sec p.sobre { color: var(--text-muted); max-width: 62ch; margin: 0; white-space: pre-wrap; }
  .svcs { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px 18px; }
  .svcs div { display: flex; gap: 9px; align-items: baseline; font-size: 0.92rem; }
  .svcs div::before { content: "\\2713"; color: var(--primary); font-weight: 700; flex-shrink: 0; }
  .areas { display: flex; gap: 8px; flex-wrap: wrap; }

  .buybox { align-self: start; position: sticky; top: 24px; border: 1px solid var(--border-strong); border-radius: var(--r-lg); background: var(--surface); padding: 22px; box-shadow: var(--shadow-sm); }
  .buybox .lbl { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); }
  .buybox .nm { font-family: var(--font-head); font-weight: 700; font-size: 1.3rem; margin: 3px 0; }
  .buybox .sb { font-size: 0.84rem; color: var(--text-muted); margin-bottom: 16px; }
  .buybox .note { font-size: 0.78rem; color: var(--text-subtle); margin-top: 14px; line-height: 1.5; }
  .buybox .rep { display: inline-block; margin-top: 12px; font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-subtle); }
  .mobile-cta { display: none; }

  /* ---- responsivo ---- */
  @media (max-width: 900px) {
    .hd-nav { display: none; }
    .hd-menu { display: block; }
    .searchpanel { flex-direction: column; }
    .sp-field + .sp-field { border-left: none; border-top: 1px solid var(--border); border-radius: var(--r-sm); }
    .searchpanel .btn { width: 100%; }
    .steps3 { grid-template-columns: 1fr; }
    .rlayout { grid-template-columns: 1fr; }
    .flt-acc { border: 1px solid var(--border-strong); border-radius: var(--r-sm); padding: 2px 14px; background: var(--surface-2); }
    .flt-acc > summary { display: block; font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 0; cursor: pointer; }
    .flt-acc[open] > .fbody { max-height: 60vh; overflow-y: auto; padding-bottom: 10px; }
    .pdp { grid-template-columns: 1fr; }
    .pdp-id { align-items: flex-start; gap: 14px; }
    .pdp-id .avatar.lg { width: 60px; height: 60px; font-size: 1.4rem; }
    .buybox { display: none; }
    .mobile-cta { display: flex; position: sticky; bottom: 0; gap: 10px; padding: 12px 16px; background: var(--surface); border-top: 1px solid var(--border-strong); box-shadow: 0 -4px 14px -6px rgba(18,28,22,.12); z-index: 10; }
    .mobile-cta .btn { flex: 1; }
  }
  @media (min-width: 901px) {
    .flt-acc > summary { display: none; }
  }
`;

// Casca do diretório: header (logo + navegação), conteúdo e rodapé. A busca não fica
// mais no header — é elemento da home e barra própria na página de resultados.
export function paginaSite(opts: {
  titulo: string;
  secoes: string;
  cssExtra?: string;
  metaDescricao?: string;
  largura?: "ampla" | "estreita";
  // Evento de página para o analytics (/aqf.js) disparar no load. Ex:
  // { tipo: "busca", servico, bairro, resultados_count } ou { tipo: "perfil_visto", profissional_slug }.
  evento?: Record<string, unknown>;
}): string {
  const menuBurger = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`;

  // JSON seguro para dentro de <script>: neutraliza "<" (fecha-tag) e os separadores de
  // linha U+2028/U+2029 (válidos em JSON, quebram um <script>).
  const eventoJson = opts.evento
    ? Array.from(JSON.stringify(opts.evento), (ch) => {
        const code = ch.charCodeAt(0);
        return code === 0x3c || code === 0x2028 || code === 0x2029
          ? "\\u" + code.toString(16).padStart(4, "0")
          : ch;
      }).join("")
    : "";

  const corpo = `<div class="site">
  <header class="hd">
    <a class="hd-logo" href="/"><span class="mark" aria-hidden="true">A</span> Achaí Quem Faz</a>
    <nav class="hd-nav">
      <a href="/busca">Buscar</a>
      <a href="/#como-funciona">Como funciona</a>
      <a class="btn btn-primary btn-sm" href="/cadastro">Sou fornecedor</a>
    </nav>
    <details class="hd-menu">
      <summary aria-label="Abrir menu">${menuBurger}</summary>
      <div class="hd-pop">
        <a href="/busca">Buscar</a>
        <a href="/#como-funciona">Como funciona</a>
        <a href="/cadastro">Sou fornecedor</a>
      </div>
    </details>
  </header>
  <main class="site-main${opts.largura === "estreita" ? " estreita" : ""}">
    ${opts.secoes}
  </main>
  <footer class="ft">
    <span>Achaí Quem Faz · João Pessoa · PB</span>
    <span><a href="/cadastro">Sou fornecedor</a> · <a href="/#como-funciona">Como funciona</a> · <a href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">@achaiquemfaz</a></span>
  </footer>
</div>
${eventoJson ? `<script>window.__aqfEvento=${eventoJson};</script>` : ""}
<script src="/aqf.js" defer></script>`;

  return documento(opts.titulo, `${CSS_SITE}${opts.cssExtra ? `\n${opts.cssExtra}` : ""}`, corpo, opts.metaDescricao);
}
