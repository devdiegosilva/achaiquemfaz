import { Router } from "express";
import { paginaTicket } from "../services/html";
import { buscarCategoriasFornecedores } from "../services/supabase";
import { env } from "../config/env";
import { CATEGORIAS_BASE } from "../types";

export const landingRouter = Router();

function rotuloCategoria(categoria: string): string {
  return CATEGORIAS_BASE[categoria] ?? categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

landingRouter.get("/", async (_req, res) => {
  const categoriasCadastradas = await buscarCategoriasFornecedores().catch(() => [] as string[]);
  const categoriasParaExibir = Array.from(new Set([...Object.keys(CATEGORIAS_BASE), ...categoriasCadastradas])).sort(
    (a, b) => rotuloCategoria(a).localeCompare(rotuloCategoria(b), "pt-BR")
  );
  const chips = categoriasParaExibir
    .map((cat) => `<span class="chip"><span class="tick"></span>${rotuloCategoria(cat)}</span>`)
    .join("");
  const valor = env.assinaturaValorMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const secoes = `
    <section class="hero">
      <h1>Mais clientes pra você, direto no seu WhatsApp</h1>
      <p class="lede">A Achaí Quem Faz conecta você a quem precisa dos seus serviços em João Pessoa — sem site, sem anúncio, sem burocracia.</p>
      <a href="/cadastro" class="stamp-btn">Quero receber clientes</a>
    </section>

    <div class="tear" aria-hidden="true"></div>

    <section class="steps">
      <h2>Como funciona</h2>
      <ol class="ticket-list">
        <li><span class="num">01</span><p>Alguém perto de você manda uma mensagem no WhatsApp pedindo o serviço que você presta.</p></li>
        <li><span class="num">02</span><p>Nossa inteligência artificial identifica exatamente o tipo de profissional que a pessoa precisa.</p></li>
        <li><span class="num">03</span><p>Você recebe o contato direto no seu WhatsApp — é só responder e combinar o serviço.</p></li>
      </ol>
    </section>

    <div class="tear" aria-hidden="true"></div>

    <section class="beneficios">
      <h2>Por que assinar</h2>
      <ul class="checklist">
        <li>Contato já filtrado pela categoria certa — chega pronto pra você atender</li>
        <li>Sem comissão por serviço fechado: você paga um valor fixo por mês</li>
        <li>Não precisa criar site, perfil ou anúncio</li>
        <li>Atendimento local, perto de você</li>
        <li>Cancele quando quiser</li>
      </ul>
    </section>

    <div class="tear" aria-hidden="true"></div>

    <section class="categorias">
      <h2>Áreas atendidas</h2>
      <div class="chip-grid">${chips}</div>
      <p class="nota">Não achou a sua? No cadastro tem a opção "Outro" — atendemos qualquer tipo de serviço.</p>
    </section>

    <div class="tear" aria-hidden="true"></div>

    <section class="preco">
      <h2>Investimento</h2>
      <div class="receipt">
        <div class="receipt-row"><span>Assinatura Achaí Quem Faz</span><span>recorrência mensal</span></div>
        <div class="receipt-total"><span>Total</span><span class="valor">R$ ${valor}<small>&nbsp;/mês</small></span></div>
      </div>
      <p class="nota">Cobrança recorrente no cartão de crédito. Cancele quando quiser.</p>
      <a href="/cadastro" class="stamp-btn">Quero me cadastrar</a>
    </section>
  `;

  res.send(paginaTicket("Receba clientes no WhatsApp", secoes));
});
