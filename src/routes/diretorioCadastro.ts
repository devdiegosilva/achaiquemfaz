import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { criarPerfilDiretorio } from "../services/supabase";
import { env } from "../config/env";
import {
  CSS_FORM_DIRETORIO,
  opcoesCategoria,
  checkboxesSegmento,
  parseServicos,
  parseSegmentos,
  somenteDigitos,
} from "../services/diretorioCampos";

export const diretorioCadastroRouter = Router();

function paginaFormulario(erro?: string, valores: Record<string, string> = {}): string {
  const v = (campo: string) => escaparHtml(valores[campo] ?? "");

  const secoes = `
    <section>
      <h1 style="max-width: none;">Cadastre seu serviço</h1>
      <p class="lede">Apareça para quem procura profissionais para casa e condomínio em João Pessoa. O cliente fala com você direto no WhatsApp.${
        env.diretorioExigeAssinatura ? "" : " Grátis durante o lançamento."
      }</p>
      ${erro ? `<p class="erro">${escaparHtml(erro)}</p>` : ""}
      <form method="POST" action="/diretorio/cadastro">
        <label for="nome">Nome (como o cliente vai te ver)</label>
        <input type="text" id="nome" name="nome" value="${v("nome")}" required />

        <label for="whatsapp">WhatsApp</label>
        <div class="campo-tel">
          <span class="ddi">+55</span>
          <input type="tel" id="whatsapp" name="whatsapp" inputmode="numeric" value="${v("whatsapp")}" placeholder="(83) 99999-9999" required />
        </div>

        <label for="email">E-mail (opcional, para recados nossos)</label>
        <input type="email" id="email" name="email" value="${v("email")}" />

        <label for="categoria">Serviço principal</label>
        <select id="categoria" name="categoria" required>
          <option value="">Selecione...</option>
          ${opcoesCategoria(valores.categoria ?? "")}
        </select>

        <label for="servicos">O que você faz (um por linha, opcional)</label>
        <textarea id="servicos" name="servicos" placeholder="Ex:&#10;Instalação de chuveiro&#10;Troca de tomadas">${v("servicos")}</textarea>

        <label for="descricao">Sobre você (opcional)</label>
        <textarea id="descricao" name="descricao" placeholder="Experiência, anos de atuação, o que te diferencia.">${v("descricao")}</textarea>

        <label for="bairro">Bairro onde atua</label>
        <input type="text" id="bairro" name="bairro" value="${v("bairro")}" placeholder="Ex: Manaíra" />

        <label>Atende</label>
        <div class="checks">${checkboxesSegmento(["casa", "condominio"])}</div>

        <button type="submit" class="stamp-btn">Cadastrar</button>
      </form>
    </section>
    <script>
      document.getElementById("whatsapp").addEventListener("input", function () {
        var v = this.value.replace(/\\D/g, "").slice(0, 11);
        if (v.length > 10) v = v.replace(/(\\d{2})(\\d{5})(\\d{4})/, "($1) $2-$3");
        else if (v.length > 6) v = v.replace(/(\\d{2})(\\d{4})(\\d{0,4})/, "($1) $2-$3");
        else if (v.length > 2) v = v.replace(/(\\d{2})(\\d{0,5})/, "($1) $2");
        this.value = v;
      });
    </script>
  `;

  return paginaSite({ titulo: "Cadastre seu serviço", secoes, cssExtra: CSS_FORM_DIRETORIO, largura: "estreita" });
}

function paginaSucesso(nome: string, slug: string, publicado: boolean, linkEdicao: string): string {
  const secoes = `
    <section class="msg" style="text-align: left;">
      <h2>Pronto, ${escaparHtml(nome)}!</h2>
      <p class="lede" style="margin: 0 0 24px;">
        ${
          publicado
            ? `Seu perfil já está no ar: <a href="/diretorio/p/${escaparHtml(slug)}">ver perfil</a>.`
            : "Recebemos seu cadastro. Ele entra no ar assim que for revisado."
        }
      </p>
      <p class="nota" style="margin-bottom: 8px;">Guarde este link — é por ele que você edita ou tira seu perfil do ar depois. Ele é só seu, não compartilhe:</p>
      <div class="receipt" style="word-break: break-all; font-family: var(--font-mono); font-size: 0.85rem;">
        ${escaparHtml(linkEdicao)}
      </div>
      <p><a class="stamp-btn" href="${escaparHtml(linkEdicao)}">Abrir meu perfil para editar</a></p>
    </section>
  `;
  return paginaSite({ titulo: "Cadastro recebido", secoes, cssExtra: CSS_FORM_DIRETORIO, largura: "estreita" });
}

diretorioCadastroRouter.get("/", (_req, res) => {
  res.send(paginaFormulario());
});

diretorioCadastroRouter.post("/", async (req, res) => {
  const body = req.body ?? {};
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const whatsappBruto = typeof body.whatsapp === "string" ? body.whatsapp : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const categoria = typeof body.categoria === "string" ? body.categoria.trim() : "";
  const bairro = typeof body.bairro === "string" ? body.bairro.trim() : "";
  const descricao = typeof body.descricao === "string" ? body.descricao.trim() : "";

  const valores: Record<string, string> = {
    nome,
    whatsapp: whatsappBruto,
    email,
    categoria,
    bairro,
    descricao,
    servicos: typeof body.servicos === "string" ? body.servicos : "",
  };

  const whatsappDigitos = somenteDigitos(whatsappBruto);

  if (!nome || !categoria || whatsappDigitos.length < 10 || whatsappDigitos.length > 11) {
    return res
      .status(400)
      .send(paginaFormulario("Preencha nome, WhatsApp válido (com DDD) e o serviço principal.", valores));
  }

  try {
    const { slug, editToken } = await criarPerfilDiretorio({
      nome,
      categoria,
      servicos: parseServicos(body.servicos),
      bairro: bairro || null,
      cidade: "João Pessoa",
      whatsapp: `55${whatsappDigitos}`,
      email: email || null,
      descricao: descricao || null,
      segmentos: parseSegmentos(body.segmentos),
      // Lançamento: publica na hora. Quando exigir assinatura, entra despublicado
      // e só vai ao ar após o pagamento (a implementar).
      publicado: !env.diretorioExigeAssinatura,
    });

    const linkEdicao = `${env.backendPublicUrl}/diretorio/editar?token=${editToken}`;
    return res.send(paginaSucesso(nome, slug, !env.diretorioExigeAssinatura, linkEdicao));
  } catch (error) {
    console.error("Erro ao cadastrar perfil no diretório:", error);
    return res
      .status(500)
      .send(paginaFormulario("Não foi possível concluir o cadastro agora. Tente novamente em instantes.", valores));
  }
});
