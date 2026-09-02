import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { buscarPerfilPorToken, atualizarPerfilPorToken } from "../services/supabase";
import {
  CSS_FORM_DIRETORIO,
  opcoesCategoria,
  checkboxesSegmento,
  parseServicos,
  parseSegmentos,
} from "../services/diretorioCampos";
import type { PerfilDiretorio } from "../types";

export const diretorioEditarRouter = Router();

function paginaSemToken(): string {
  return paginaSite({
    titulo: "Link inválido",
    largura: "estreita",
    secoes: `<section class="msg"><h2>Link inválido ou expirado</h2><p class="lede" style="margin: 0 auto;">Confira se você copiou o endereço completo. Se precisar de um novo link, fale com a gente no Instagram <a href="https://instagram.com/achaiquemfaz">@achaiquemfaz</a>.</p></section>`,
  });
}

function paginaFormulario(perfil: PerfilDiretorio, token: string, opts: { erro?: string; salvo?: boolean } = {}): string {
  const servicosTexto = (perfil.servicos ?? []).join("\n");

  const secoes = `
    <section>
      <h1 style="max-width: none;">Seu perfil no diretório</h1>
      <p class="lede">Complete os dados abaixo. Enquanto "publicar" estiver desmarcado, seu perfil não aparece para ninguém.</p>
      ${opts.salvo ? `<p class="erro" style="color: var(--work); border-color: var(--work);">Perfil salvo!${perfil.publicado ? ` <a href="/diretorio/p/${escaparHtml(perfil.slug)}">Ver como ficou</a>` : ""}</p>` : ""}
      ${opts.erro ? `<p class="erro">${escaparHtml(opts.erro)}</p>` : ""}
      <form method="POST" action="/diretorio/editar">
        <input type="hidden" name="token" value="${escaparHtml(token)}" />

        <label>Nome</label>
        <input type="text" value="${escaparHtml(perfil.nome)}" disabled />
        <p class="ajuda">Para mudar o nome, fale com a gente pelo Instagram.</p>

        <label for="categoria">Serviço principal</label>
        <select id="categoria" name="categoria" required>${opcoesCategoria(perfil.categoria)}</select>

        <label for="servicos">O que você faz (um por linha)</label>
        <textarea id="servicos" name="servicos" placeholder="Ex:&#10;Instalação de chuveiro&#10;Troca de tomadas&#10;Reparo de vazamento">${escaparHtml(servicosTexto)}</textarea>

        <label for="descricao">Sobre você</label>
        <textarea id="descricao" name="descricao" placeholder="Conte sua experiência, anos de atuação, o que te diferencia.">${escaparHtml(perfil.descricao)}</textarea>

        <label for="bairro">Bairro onde atua</label>
        <input type="text" id="bairro" name="bairro" value="${escaparHtml(perfil.bairro)}" placeholder="Ex: Manaíra" />

        <label>Atende</label>
        <div class="checks">${checkboxesSegmento(perfil.segmentos ?? ["casa", "condominio"])}</div>

        <div class="publicar-box">
          <input type="checkbox" id="publicado" name="publicado" value="1"${perfil.publicado ? " checked" : ""} />
          <label for="publicado">Quero que meu perfil apareça no diretório público, com meu nome e WhatsApp visíveis para quem buscar um serviço.</label>
        </div>

        <button type="submit" class="stamp-btn">Salvar</button>
      </form>
    </section>
  `;

  return paginaSite({ titulo: "Editar perfil", secoes, cssExtra: CSS_FORM_DIRETORIO, largura: "estreita" });
}

diretorioEditarRouter.get("/", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) return res.status(400).send(paginaSemToken());

  const perfil = await buscarPerfilPorToken(token).catch(() => null);
  if (!perfil) return res.status(404).send(paginaSemToken());

  res.send(paginaFormulario(perfil, token));
});

diretorioEditarRouter.post("/", async (req, res) => {
  const { token, categoria, servicos, descricao, bairro, publicado } = req.body ?? {};

  if (typeof token !== "string" || !token) return res.status(400).send(paginaSemToken());

  const perfil = await buscarPerfilPorToken(token).catch(() => null);
  if (!perfil) return res.status(404).send(paginaSemToken());

  const segmentos = parseSegmentos(req.body?.segmentos);

  if (typeof categoria !== "string" || !categoria.trim()) {
    return res.status(400).send(paginaFormulario(perfil, token, { erro: "Escolha o serviço principal." }));
  }

  const campos = {
    categoria: categoria.trim(),
    descricao: typeof descricao === "string" && descricao.trim() ? descricao.trim() : null,
    servicos: parseServicos(servicos),
    bairro: typeof bairro === "string" && bairro.trim() ? bairro.trim() : null,
    segmentos,
    publicado: publicado === "1" || publicado === "on" || publicado === true,
  };

  const ok = await atualizarPerfilPorToken(token, campos).catch(() => false);
  if (!ok) {
    return res.status(500).send(paginaFormulario(perfil, token, { erro: "Não foi possível salvar agora. Tente de novo." }));
  }

  const atualizado = await buscarPerfilPorToken(token).catch(() => null);
  res.send(paginaFormulario(atualizado ?? { ...perfil, ...campos }, token, { salvo: true }));
});
