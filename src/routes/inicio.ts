import { Router } from "express";
import { paginaTicket } from "../services/html";

export const inicioRouter = Router();

const LINK_WHATSAPP_DEMANDANTE = "https://wa.me/message/JKSOPHFGSDGPB1";

const CSS_INICIO = `
  .opcoes { display: grid; gap: 16px; margin-top: 32px; }
  @media (min-width: 560px) { .opcoes { grid-template-columns: 1fr 1fr; } }
  .opcao {
    display: flex; flex-direction: column; gap: 8px; padding: 32px 20px;
    border: 3px solid var(--stamp); border-radius: 4px; text-decoration: none; text-align: center;
    transition: transform 0.15s ease, background 0.15s ease;
  }
  .opcao:hover { background: var(--stamp); transform: translateY(-2px); }
  .opcao:hover .opcao-label, .opcao:hover .opcao-sub { color: var(--stamp-ink); }
  .opcao-label { font-family: var(--font-display); font-weight: 800; font-size: 1.35rem; text-transform: uppercase; letter-spacing: 0.02em; color: var(--stamp); }
  .opcao-sub { font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .opcao-fornecedor { border-color: var(--work); }
  .opcao-fornecedor .opcao-label { color: var(--work); }
  .opcao-fornecedor:hover { background: var(--work); }
  @media (prefers-reduced-motion: reduce) { .opcao { transition: none; } }
`;

inicioRouter.get("/", (_req, res) => {
  const secoes = `
    <section class="hero">
      <h1>O que você precisa hoje?</h1>
      <p class="lede">A Achaí Quem Faz conecta quem precisa de um serviço a quem sabe fazer, direto pelo WhatsApp, em João Pessoa.</p>
      <div class="opcoes">
        <a href="${LINK_WHATSAPP_DEMANDANTE}" target="_blank" rel="noopener" class="opcao opcao-cliente">
          <span class="opcao-label">Preciso de um serviço</span>
          <span class="opcao-sub">Fale agora no WhatsApp</span>
        </a>
        <a href="/fornecedores" class="opcao opcao-fornecedor">
          <span class="opcao-label">Quero oferecer meus serviços</span>
          <span class="opcao-sub">Receba clientes pelo WhatsApp</span>
        </a>
      </div>
    </section>
  `;

  res.send(paginaTicket("O que você precisa hoje?", secoes, CSS_INICIO));
});
