import { Router } from "express";
import { paginaSite, escaparHtml } from "../services/html";
import {
  buscarPerfisPublicados,
  buscarCategoriasPublicadas,
  buscarBairrosPublicados,
  buscarPerfilPorSlug,
} from "../services/supabase";
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

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "");
  return letras.toUpperCase() || "?";
}

function linkWhatsapp(whatsapp: string, nome: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const texto = `Olá, ${nome}! Vi seu perfil no Achaí Quem Faz e gostaria de um orçamento.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

type FiltrosUrl = { q?: string; categoria?: string; bairro?: string; segmento?: string; ordem?: string };

// Monta uma URL /diretorio preservando os filtros atuais, com os ajustes de `mudancas`.
function montarUrl(atuais: FiltrosUrl, mudancas: FiltrosUrl = {}): string {
  const merge: FiltrosUrl = { ...atuais, ...mudancas };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merge)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/diretorio?${s}` : "/diretorio";
}

const ICONE_WA = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 0112 4zm4.6 10.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.7-.6 2.7.5 1.7 1.6 3.1 3.1 4.1 1 .7 2.2 1.1 3.4 1.1.9 0 1.7-.4 2.2-1 .2-.3.3-.7.2-1z"/></svg>`;

diretorioRouter.get("/", async (req, res) => {
  const q = str(req.query.q);
  const categoria = str(req.query.categoria);
  const bairro = str(req.query.bairro);
  const segmento = str(req.query.segmento);
  const ordem = str(req.query.ordem) === "recentes" ? "recentes" : "";
  const atuais = { q, categoria, bairro, segmento, ordem };

  const [perfis, categoriasPublicadas, bairrosPublicados] = await Promise.all([
    buscarPerfisPublicados({
      termo: q || undefined,
      categoria: categoria || undefined,
      bairro: bairro || undefined,
      segmento: segmento || undefined,
      ordem: ordem === "recentes" ? "recentes" : "nome",
    }).catch(() => [] as PerfilDiretorio[]),
    buscarCategoriasPublicadas().catch(() => [] as string[]),
    buscarBairrosPublicados().catch(() => [] as string[]),
  ]);

  const categoriasOrdenadas = Array.from(new Set(categoriasPublicadas)).sort((a, b) =>
    rotuloCategoria(a).localeCompare(rotuloCategoria(b), "pt-BR")
  );
  const bairrosOrdenados = Array.from(new Set(bairrosPublicados)).sort((a, b) => a.localeCompare(b, "pt-BR"));

  // ---- barra de busca (select de categoria) ----
  const categoriasParaSelect = categoriasOrdenadas.map((c) => ({ valor: c, rotulo: rotuloCategoria(c) }));

  // ---- filtros laterais ----
  function grupoLinks(
    titulo: string,
    itens: Array<{ valor: string; rotulo: string }>,
    ativoAtual: string,
    chave: "categoria" | "bairro" | "segmento"
  ): string {
    if (itens.length === 0) return "";
    const linhas = itens
      .map((it) => {
        const ativo = it.valor === ativoAtual;
        const mud: FiltrosUrl = {};
        mud[chave] = ativo ? "" : it.valor;
        const href = montarUrl(atuais, mud);
        return `<a class="fopt" href="${escaparHtml(href)}"${ativo ? ' aria-current="true"' : ""}><span class="marca"></span>${escaparHtml(it.rotulo)}</a>`;
      })
      .join("");
    return `<div class="fgrupo"><h3>${escaparHtml(titulo)}</h3>${linhas}</div>`;
  }

  const filtros = `
    <aside class="filtros" aria-label="Filtros">
      <details class="filtros-acc" open>
        <summary>Filtros</summary>
        <div>
          ${grupoLinks(
            "Serviço",
            categoriasParaSelect,
            categoria,
            "categoria"
          )}
          ${grupoLinks(
            "Bairro",
            bairrosOrdenados.map((b) => ({ valor: b, rotulo: b })),
            bairro,
            "bairro"
          )}
          ${grupoLinks(
            "Atende",
            Object.keys(SEGMENTOS).map((s) => ({ valor: s, rotulo: rotuloSegmento(s) })),
            segmento,
            "segmento"
          )}
        </div>
      </details>
    </aside>
  `;

  // ---- chips de filtro ativo ----
  const chips: string[] = [];
  if (q) chips.push(`<a class="chip-filtro" href="${escaparHtml(montarUrl(atuais, { q: "" }))}">“${escaparHtml(q)}” <span aria-hidden="true">×</span></a>`);
  if (categoria) chips.push(`<a class="chip-filtro" href="${escaparHtml(montarUrl(atuais, { categoria: "" }))}">${escaparHtml(rotuloCategoria(categoria))} <span aria-hidden="true">×</span></a>`);
  if (bairro) chips.push(`<a class="chip-filtro" href="${escaparHtml(montarUrl(atuais, { bairro: "" }))}">${escaparHtml(bairro)} <span aria-hidden="true">×</span></a>`);
  if (segmento) chips.push(`<a class="chip-filtro" href="${escaparHtml(montarUrl(atuais, { segmento: "" }))}">${escaparHtml(rotuloSegmento(segmento))} <span aria-hidden="true">×</span></a>`);

  const ordAZ = !ordem;
  const sortLinks = `Ordenar:
    <a href="${escaparHtml(montarUrl(atuais, { ordem: "" }))}" style="${ordAZ ? "font-weight:600;color:var(--ink)" : ""}">A–Z</a> ·
    <a href="${escaparHtml(montarUrl(atuais, { ordem: "recentes" }))}" style="${!ordAZ ? "font-weight:600;color:var(--ink)" : ""}">Recentes</a>`;

  const subbar = `
    <div class="subbar">
      <nav class="crumbs"><a href="/diretorio">Início</a>${categoria ? `<span class="sep">/</span><span>${escaparHtml(rotuloCategoria(categoria))}</span>` : ""}</nav>
      ${chips.length ? `<div class="chips">${chips.join("")}</div>` : ""}
      <span class="count">${perfis.length} prestador(es)</span>
      <span class="sortsel" style="border:none;background:none;padding:0;color:var(--ink-muted)">${sortLinks}</span>
    </div>
  `;

  // ---- grade ----
  const cards = perfis
    .map((p) => {
      const segs = (p.segmentos ?? [])
        .map((s) => `<span class="seg">${escaparHtml(rotuloSegmento(s))}</span>`)
        .join("");
      return `
      <article class="card">
        <a class="card-stretch" href="/diretorio/p/${escaparHtml(p.slug)}">Ver perfil de ${escaparHtml(p.nome)}</a>
        <div class="card-head">
          <span class="monogram" aria-hidden="true">${escaparHtml(iniciais(p.nome))}</span>
          <span class="card-id"><span class="card-name">${escaparHtml(p.nome)}</span><span class="card-cat">${escaparHtml(rotuloCategoria(p.categoria))}</span></span>
        </div>
        ${p.bairro ? `<div class="card-loc">${escaparHtml(p.bairro)}</div>` : ""}
        ${p.descricao ? `<p class="card-desc">${escaparHtml(p.descricao)}</p>` : ""}
        ${segs ? `<div class="card-segs">${segs}</div>` : ""}
        <a class="wa" href="${escaparHtml(linkWhatsapp(p.whatsapp, p.nome))}" target="_blank" rel="noopener">${ICONE_WA} Chamar no WhatsApp</a>
      </article>`;
    })
    .join("");

  const temFiltro = Boolean(q || categoria || bairro || segmento);
  const listagem = perfis.length
    ? `<div class="grid">${cards}</div>`
    : `<div class="vazio">${
        temFiltro
          ? "Nenhum prestador encontrado com esses filtros. Tente ampliar a busca."
          : "Ainda não há prestadores publicados. Volte em breve."
      }</div>`;

  const secoes = `
    ${subbar}
    <div class="body">
      ${filtros}
      <div>${listagem}</div>
    </div>
  `;

  res.send(
    paginaSite({
      titulo: categoria ? `${rotuloCategoria(categoria)} em João Pessoa` : "Serviços para casa e condomínio",
      secoes,
      metaDescricao:
        "Diretório de prestadores de serviço para casa e condomínio em João Pessoa: eletricista, encanador, diarista, pintor e mais. Contato direto no WhatsApp.",
      busca: { categorias: categoriasParaSelect, categoriaAtual: categoria, termoAtual: q },
    })
  );
});

diretorioRouter.get("/p/:slug", async (req, res) => {
  const perfil = await buscarPerfilPorSlug(req.params.slug).catch(() => null);

  if (!perfil) {
    return res.status(404).send(
      paginaSite({
        titulo: "Perfil não encontrado",
        secoes: `<div class="pdp"><div class="pdp-main"><div class="pdp-sec" style="border:none"><h1 style="font-family:var(--font-display);color:var(--work-deep)">Perfil não encontrado</h1><p>Esse prestador não está mais publicado ou o endereço está errado.</p><p style="margin-top:18px"><a class="wa" style="display:inline-flex" href="/diretorio">Ver todos os prestadores</a></p></div></div></div>`,
      })
    );
  }

  const servicos = (perfil.servicos ?? []).filter(Boolean);
  const segmentosTxt = (perfil.segmentos ?? []).map(rotuloSegmento).join(" e ");
  const localTxt = [perfil.bairro, perfil.cidade].filter(Boolean).join(", ");
  const ano = perfil.created_at ? new Date(perfil.created_at).getFullYear() : null;

  const meta = [
    localTxt ? `◦ ${escaparHtml(localTxt)}` : "",
    segmentosTxt ? `◦ Atende ${escaparHtml(segmentosTxt)}` : "",
    ano ? `◦ No Achaí desde ${ano}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const secoes = `
    <div class="subbar">
      <nav class="crumbs"><a href="/diretorio">Início</a><span class="sep">/</span><a href="/diretorio?categoria=${encodeURIComponent(perfil.categoria)}">${escaparHtml(rotuloCategoria(perfil.categoria))}</a><span class="sep">/</span><span>${escaparHtml(perfil.nome)}</span></nav>
    </div>
    <div class="pdp">
      <div class="pdp-main">
        <div class="pdp-id">
          <span class="monogram big" aria-hidden="true">${escaparHtml(iniciais(perfil.nome))}</span>
          <div>
            <div class="kicker">${escaparHtml(rotuloCategoria(perfil.categoria))}</div>
            <h1>${escaparHtml(perfil.nome)}</h1>
          </div>
        </div>
        <div class="pdp-meta">${meta}</div>

        ${
          perfil.descricao
            ? `<div class="pdp-sec"><h2>Sobre</h2><p class="sobre">${escaparHtml(perfil.descricao)}</p></div>`
            : ""
        }

        ${
          servicos.length
            ? `<div class="pdp-sec"><h2>Serviços</h2><div class="svc-grid">${servicos
                .map((s) => `<div class="svc">${escaparHtml(s)}</div>`)
                .join("")}</div></div>`
            : ""
        }

        <div class="pdp-sec">
          <h2>Como funciona</h2>
          <div class="steps">
            <div class="step"><span class="num">01</span><p>Você acha o profissional na busca por serviço e bairro.</p></div>
            <div class="step"><span class="num">02</span><p>Chama direto no WhatsApp dele, sem intermediário.</p></div>
            <div class="step"><span class="num">03</span><p>Combina preço, data e forma de pagamento com ele.</p></div>
          </div>
        </div>
      </div>

      <aside class="buybox">
        <div class="bb-label">Contato direto</div>
        <div class="bb-name">${escaparHtml(perfil.nome)}</div>
        <div class="bb-sub">${escaparHtml(rotuloCategoria(perfil.categoria))}${perfil.bairro ? ` · ${escaparHtml(perfil.bairro)}` : ""}</div>
        <a class="wa" href="${escaparHtml(linkWhatsapp(perfil.whatsapp, perfil.nome))}" target="_blank" rel="noopener">${ICONE_WA} Chamar no WhatsApp</a>
        <p class="bb-note">A Achaí Quem Faz não intermedia pagamento nem execução do serviço. Combine tudo direto com o prestador.</p>
        <a class="bb-report" href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">Algo errado neste perfil? Fale com a gente</a>
      </aside>
    </div>
  `;

  res.send(
    paginaSite({
      titulo: `${perfil.nome} — ${rotuloCategoria(perfil.categoria)}`,
      secoes,
      metaDescricao: `${perfil.nome}: ${rotuloCategoria(perfil.categoria)} em ${localTxt || "João Pessoa"}. Contato direto no WhatsApp pelo Achaí Quem Faz.`,
    })
  );
});
