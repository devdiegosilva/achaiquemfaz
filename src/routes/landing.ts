import { Router } from "express";
import { paginaBase } from "../services/html";
import { buscarCategoriasFornecedores } from "../services/supabase";
import { CATEGORIAS_BASE } from "../types";

export const landingRouter = Router();

function rotuloCategoria(categoria: string): string {
  return CATEGORIAS_BASE[categoria] ?? categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

const CSS_EXTRA = `
  .container { max-width: 680px; }
  header.hero { text-align: center; padding: 64px 0 40px; }
  header.hero h1 { font-size: 2rem; line-height: 1.25; margin-bottom: 16px; }
  header.hero p.subtitle { font-size: 1.05rem; max-width: 480px; margin: 0 auto 32px; }
  a.cta { max-width: 320px; margin-left: auto; margin-right: auto; }
  section { margin-top: 56px; }
  section h2 { font-size: 1.3rem; margin-bottom: 24px; text-align: center; }
  .steps { display: grid; gap: 20px; }
  .step { display: flex; gap: 16px; align-items: flex-start; background: #171a21; border: 1px solid #262a33; border-radius: 10px; padding: 16px; }
  .step .numero { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: #22c55e; color: #08130b; font-weight: bold; display: flex; align-items: center; justify-content: center; }
  .step p { margin: 0; }
  ul.beneficios { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
  ul.beneficios li { background: #171a21; border: 1px solid #262a33; border-radius: 10px; padding: 14px 16px; }
  ul.beneficios li::before { content: "✓ "; color: #22c55e; font-weight: bold; }
  .categorias { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .categorias span { background: #1a1d24; border: 1px solid #333; border-radius: 999px; padding: 6px 14px; font-size: 0.9rem; }
  .preco { text-align: center; background: #171a21; border: 1px solid #262a33; border-radius: 12px; padding: 32px 24px; }
  .preco .valor { font-size: 2.4rem; font-weight: bold; margin: 8px 0; }
  .preco .valor span { font-size: 1rem; font-weight: normal; color: #9aa0a6; }
  footer { text-align: center; color: #9aa0a6; margin-top: 64px; font-size: 0.85rem; }
`;

landingRouter.get("/", async (_req, res) => {
  const categoriasCadastradas = await buscarCategoriasFornecedores().catch(() => [] as string[]);
  const categoriasParaExibir = Array.from(new Set([...Object.keys(CATEGORIAS_BASE), ...categoriasCadastradas])).sort(
    (a, b) => rotuloCategoria(a).localeCompare(rotuloCategoria(b), "pt-BR")
  );
  const categorias = categoriasParaExibir.map((cat) => `<span>${rotuloCategoria(cat)}</span>`).join("");

  const corpo = `
      <header class="hero">
        <h1>Mais clientes pra você, direto no seu WhatsApp</h1>
        <p class="subtitle">A Ache Fornecedores conecta você a quem precisa dos seus serviços em João Pessoa — sem site, sem anúncio, sem burocracia.</p>
        <a href="/cadastro" class="cta">Quero receber clientes</a>
      </header>

      <section>
        <h2>Como funciona</h2>
        <div class="steps">
          <div class="step">
            <span class="numero">1</span>
            <p>Alguém perto de você manda uma mensagem no WhatsApp pedindo o serviço que você presta.</p>
          </div>
          <div class="step">
            <span class="numero">2</span>
            <p>Nossa inteligência artificial identifica exatamente o tipo de profissional que a pessoa precisa.</p>
          </div>
          <div class="step">
            <span class="numero">3</span>
            <p>Você recebe o contato direto no seu WhatsApp — é só responder e combinar o serviço.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Por que assinar</h2>
        <ul class="beneficios">
          <li>Contato já filtrado pela categoria certa — chega pronto pra você atender</li>
          <li>Sem comissão por serviço fechado: você paga um valor fixo por mês</li>
          <li>Não precisa criar site, perfil ou anúncio</li>
          <li>Atendimento local, perto de você</li>
          <li>Cancele quando quiser</li>
        </ul>
      </section>

      <section>
        <h2>Áreas atendidas</h2>
        <div class="categorias">${categorias}</div>
        <p class="subtitle" style="margin-top: 16px; margin-bottom: 0;">Não achou a sua? No cadastro tem a opção "Outro" — atendemos qualquer tipo de serviço.</p>
      </section>

      <section class="preco">
        <h2>Investimento</h2>
        <p class="valor">R$ 97,90<span>/mês</span></p>
        <p class="subtitle">Assinatura recorrente no cartão de crédito. Cancele quando quiser.</p>
        <a href="/cadastro" class="cta">Quero me cadastrar</a>
      </section>

      <footer>
        <p>Ache Fornecedores — João Pessoa/PB</p>
      </footer>
  `;

  res.send(paginaBase("Receba clientes no WhatsApp", corpo, CSS_EXTRA));
});
