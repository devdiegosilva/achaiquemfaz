import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import { buscarPerfisPublicados, buscarCategoriasPublicadas, buscarPerfilPorSlug } from "../services/supabase";
import { CATEGORIAS_BASE, CATEGORIAS_CASA_CONDOMINIO, SEGMENTOS, type PerfilDiretorio } from "../types";

export const diretorioRouter = Router();

function rotuloCategoria(categoria: string): string {
  return (
    CATEGORIAS_CASA_CONDOMINIO[categoria] ??
    CATEGORIAS_BASE[categoria] ??
    categoria.charAt(0).toUpperCase() + categoria.slice(1)
  );
}

function rotuloSegmento(segmento: string): string {
  return SEGMENTOS[segmento] ?? segmento;
}

function linkWhatsapp(whatsapp: string, nome: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const texto = `Olá, ${nome}! Vi seu perfil no Achaí Quem Faz e gostaria de um orçamento.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

const CSS_DIRETORIO = `
  .busca-form { display: grid; gap: 12px; margin: 8px 0 4px; }
  @media (min-width: 620px) { .busca-form { grid-template-columns: 1fr 1fr auto; align-items: end; } }
  .busca-form label { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); display: block; margin-bottom: 6px; }
  .busca-form select, .busca-form input {
    width: 100%; padding: 11px 12px; border: 1px solid var(--line-strong); background: var(--paper-alt);
    color: var(--ink); font-family: var(--font-body); font-size: 1rem; border-radius: 2px;
  }
  .busca-form button {
    font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
    background: var(--work); color: var(--stamp-ink); border: none; padding: 12px 22px; border-radius: 3px;
    cursor: pointer; font-size: 1rem;
  }
  .resultado-info { font-family: var(--font-mono); font-size: 0.8rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 14px; }
  .cards { display: grid; gap: 14px; }
  @media (min-width: 620px) { .cards { grid-template-columns: 1fr 1fr; } }
  .card { border: 1.5px solid var(--line-strong); background: var(--paper-alt); border-radius: 3px; padding: 18px 18px 16px; display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: inherit; }
  .card:hover { border-color: var(--work); }
  .card .card-nome { font-family: var(--font-display); font-weight: 700; font-size: 1.2rem; color: var(--work); }
  .card .card-cat { font-family: var(--font-mono); font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-muted); }
  .card .card-desc { font-size: 0.95rem; color: var(--ink); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .vazio { border: 1px dashed var(--line-strong); padding: 22px; text-align: center; color: var(--ink-muted); font-size: 0.95rem; }

  .perfil-cab { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
  .perfil-cab .cat { font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); }
  .perfil-meta { font-family: var(--font-mono); font-size: 0.85rem; color: var(--ink-muted); margin: 0 0 20px; }
  .perfil-desc { font-size: 1.05rem; white-space: pre-wrap; margin: 0 0 26px; }
  .wa-btn {
    display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700;
    font-size: 1.05rem; letter-spacing: 0.03em; text-transform: uppercase; text-decoration: none;
    color: var(--stamp-ink); background: var(--work); border: none; padding: 14px 26px; border-radius: 3px;
  }
  .wa-btn:hover { filter: brightness(1.08); }
  .voltar { display: inline-block; margin-bottom: 18px; font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--work); text-decoration: none; }
`;

diretorioRouter.get("/", async (req, res) => {
  const categoria = typeof req.query.categoria === "string" ? req.query.categoria : "";
  const bairro = typeof req.query.bairro === "string" ? req.query.bairro.trim() : "";
  const segmento = typeof req.query.segmento === "string" ? req.query.segmento : "";

  const [perfis, categoriasPublicadas] = await Promise.all([
    buscarPerfisPublicados({
      categoria: categoria || undefined,
      bairro: bairro || undefined,
      segmento: segmento || undefined,
    }).catch(() => [] as PerfilDiretorio[]),
    buscarCategoriasPublicadas().catch(() => [] as string[]),
  ]);

  // Só oferece no filtro categorias que têm alguém publicado.
  const categoriasFiltro = Array.from(new Set(categoriasPublicadas)).sort((a, b) =>
    rotuloCategoria(a).localeCompare(rotuloCategoria(b), "pt-BR")
  );

  const opcoesCategoria = categoriasFiltro
    .map((c) => `<option value="${escaparHtml(c)}"${c === categoria ? " selected" : ""}>${escaparHtml(rotuloCategoria(c))}</option>`)
    .join("");

  const opcoesSegmento = Object.keys(SEGMENTOS)
    .map((s) => `<option value="${s}"${s === segmento ? " selected" : ""}>${escaparHtml(rotuloSegmento(s))}</option>`)
    .join("");

  const cards = perfis
    .map(
      (p) => `
      <a class="card" href="/diretorio/p/${escaparHtml(p.slug)}">
        <span class="card-nome">${escaparHtml(p.nome)}</span>
        <span class="card-cat">${escaparHtml(rotuloCategoria(p.categoria))}${p.bairro ? ` · ${escaparHtml(p.bairro)}` : ""}</span>
        ${p.descricao ? `<span class="card-desc">${escaparHtml(p.descricao)}</span>` : ""}
      </a>`
    )
    .join("");

  const temFiltro = Boolean(categoria || bairro || segmento);

  const listagem = perfis.length
    ? `<div class="cards">${cards}</div>`
    : `<div class="vazio">${
        temFiltro
          ? "Nenhum prestador encontrado com esses filtros. Tente ampliar a busca."
          : "Ainda não há prestadores publicados. Volte em breve."
      }</div>`;

  const secoes = `
    <section class="hero" style="padding-bottom: 12px;">
      <h1>Serviços para casa e condomínio em João Pessoa</h1>
      <p class="lede">Encontre eletricistas, encanadores, diaristas e outros profissionais perto de você. O contato é direto no WhatsApp do prestador.</p>
    </section>
    <section style="padding-top: 8px;">
      <form class="busca-form" method="GET" action="/diretorio">
        <div>
          <label for="categoria">Serviço</label>
          <select id="categoria" name="categoria">
            <option value="">Todos os serviços</option>
            ${opcoesCategoria}
          </select>
        </div>
        <div>
          <label for="bairro">Bairro</label>
          <input type="text" id="bairro" name="bairro" value="${escaparHtml(bairro)}" placeholder="Ex: Manaíra" />
        </div>
        <div>
          <label for="segmento">Tipo</label>
          <select id="segmento" name="segmento">
            <option value="">Casa e condomínio</option>
            ${opcoesSegmento}
          </select>
        </div>
        <button type="submit" style="grid-column: 1 / -1;">Buscar</button>
      </form>
      <p class="resultado-info">${perfis.length} prestador(es) encontrado(s)</p>
      ${listagem}
    </section>
  `;

  res.send(
    paginaSite({
      titulo: "Serviços para casa e condomínio",
      secoes,
      cssExtra: CSS_DIRETORIO,
      metaDescricao:
        "Diretório de prestadores de serviço para casa e condomínio em João Pessoa: eletricista, encanador, diarista, pintor e mais. Contato direto no WhatsApp.",
    })
  );
});

diretorioRouter.get("/p/:slug", async (req, res) => {
  const perfil = await buscarPerfilPorSlug(req.params.slug).catch(() => null);

  if (!perfil) {
    return res.status(404).send(
      paginaSite({
        titulo: "Perfil não encontrado",
        secoes: `<section class="msg"><h2>Perfil não encontrado</h2><p class="lede" style="margin: 0 auto;">Esse prestador não está mais publicado ou o endereço está errado.</p><p style="margin-top: 24px;"><a class="stamp-btn" href="/diretorio">Ver todos</a></p></section>`,
      })
    );
  }

  const servicos = (perfil.servicos ?? []).filter(Boolean);
  const segmentosTxt = (perfil.segmentos ?? []).map(rotuloSegmento).join(" e ");
  const localTxt = [perfil.bairro, perfil.cidade].filter(Boolean).join(", ");

  const secoes = `
    <section class="hero" style="padding-bottom: 8px;">
      <a class="voltar" href="/diretorio">&larr; Voltar para a busca</a>
      <div class="perfil-cab">
        <span class="cat">${escaparHtml(rotuloCategoria(perfil.categoria))}</span>
        <h1 style="margin-bottom: 6px;">${escaparHtml(perfil.nome)}</h1>
      </div>
      <p class="perfil-meta">${escaparHtml(localTxt)}${segmentosTxt ? ` · Atende ${escaparHtml(segmentosTxt)}` : ""}</p>
      ${perfil.descricao ? `<p class="perfil-desc">${escaparHtml(perfil.descricao)}</p>` : ""}
      ${
        servicos.length
          ? `<div class="chip-grid">${servicos
              .map((s) => `<span class="chip"><span class="tick"></span>${escaparHtml(s)}</span>`)
              .join("")}</div>`
          : ""
      }
      <p style="margin-top: 22px;">
        <a class="wa-btn" href="${escaparHtml(linkWhatsapp(perfil.whatsapp, perfil.nome))}" target="_blank" rel="noopener">
          Chamar no WhatsApp
        </a>
      </p>
      <p class="nota" style="margin-top: 14px;">O contato é feito diretamente entre você e o prestador. A Achaí Quem Faz não intermedeia pagamento nem execução do serviço.</p>
    </section>
  `;

  res.send(
    paginaSite({
      titulo: `${perfil.nome} — ${rotuloCategoria(perfil.categoria)}`,
      secoes,
      cssExtra: CSS_DIRETORIO,
      metaDescricao: `${perfil.nome}: ${rotuloCategoria(perfil.categoria)} em ${localTxt || "João Pessoa"}. Contato direto no WhatsApp pelo Achaí Quem Faz.`,
    })
  );
});
