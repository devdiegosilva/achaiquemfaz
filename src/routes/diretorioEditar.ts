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
    cssExtra: CSS_FORM_DIRETORIO,
    secoes: `<div class="formwrap" style="text-align:center;padding-top:56px">
      <h1>Link inválido ou expirado</h1>
      <p class="lead" style="margin:0 auto;max-width:44ch">Confira se você copiou o endereço completo. Se precisar de um novo link, fale com a gente no Instagram <a href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">@achaiquemfaz</a>.</p>
    </div>`,
  });
}

function paginaFormulario(perfil: PerfilDiretorio, token: string, opts: { erro?: string; salvo?: boolean } = {}): string {
  const servicosTexto = (perfil.servicos ?? []).join("\n");

  const secoes = `
    <div class="formwrap">
      <h1>Seu perfil no diretório</h1>
      <p class="lead">Complete os dados. Enquanto "publicar" estiver desmarcado, seu perfil não aparece para ninguém.</p>
      ${
        opts.salvo
          ? `<p class="form-ok">Perfil salvo!${perfil.publicado ? ` <a href="/diretorio/p/${escaparHtml(perfil.slug)}">Ver como ficou</a>` : ""}</p>`
          : ""
      }
      ${opts.erro ? `<p class="form-erro">${escaparHtml(opts.erro)}</p>` : ""}
      <form method="POST" action="/diretorio/editar">
        <input type="hidden" name="token" value="${escaparHtml(token)}" />

        <div class="fld">
          <label>Nome</label>
          <input type="text" value="${escaparHtml(perfil.nome)}" disabled />
          <p class="hint">Para mudar o nome, fale com a gente pelo Instagram.</p>
        </div>
        <div class="fld">
          <label for="categoria">Serviço principal</label>
          <select id="categoria" name="categoria" required>${opcoesCategoria(perfil.categoria)}</select>
        </div>
        <div class="fld">
          <label for="servicos">O que você faz — um por linha</label>
          <textarea id="servicos" name="servicos" placeholder="Instalação de chuveiro&#10;Troca de tomadas&#10;Reparo de vazamento">${escaparHtml(servicosTexto)}</textarea>
        </div>
        <div class="fld">
          <label for="descricao">Sobre você</label>
          <textarea id="descricao" name="descricao" placeholder="Sua experiência, anos de atuação, o que te diferencia.">${escaparHtml(perfil.descricao)}</textarea>
        </div>
        <div class="fld">
          <label for="bairro">Bairro onde atua</label>
          <input type="text" id="bairro" name="bairro" value="${escaparHtml(perfil.bairro)}" placeholder="Ex: Manaíra" />
        </div>
        <div class="fld">
          <label>Atende</label>
          <div class="chk-row">${checkboxesSegmento(perfil.segmentos ?? ["casa", "condominio"])}</div>
        </div>

        <div class="publicar-box">
          <input type="checkbox" id="publicado" name="publicado" value="1"${perfil.publicado ? " checked" : ""} />
          <label for="publicado">Quero que meu perfil apareça no diretório público, com meu nome e WhatsApp visíveis para quem buscar um serviço.</label>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:24px">Salvar</button>
      </form>
    </div>
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
