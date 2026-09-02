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

// "Manaíra" -> "Manaíra, João Pessoa" · "João Pessoa" (cidade toda) -> "João Pessoa (cidade toda)"
function rotuloLocal(bairro: string | null | undefined): string {
  if (!bairro) return "";
  if (bairro === "João Pessoa") return "João Pessoa (cidade toda)";
  return `${bairro}, João Pessoa`;
}

function linkWhatsapp(whatsapp: string, nome: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const texto = `Olá, ${nome}! Vi seu perfil no Achaí Quem Faz e gostaria de um orçamento.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const ICONE_WA = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 0112 4zm4.6 10.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.7-.6 2.7.5 1.7 1.6 3.1 3.1 4.1 1 .7 2.2 1.1 3.4 1.1.9 0 1.7-.4 2.2-1 .2-.3.3-.7.2-1z"/></svg>`;
const ICONE_LUPA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;
const ICONE_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
const ICONE_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>`;
const SELO_VERIFICADO = `<span class="selo-verif" title="A Achaí Quem Faz confirmou o WhatsApp deste profissional">${ICONE_CHECK} Contato verificado</span>`;

// Ordem dos cards de categoria na home + emoji de cada uma.
const HOME_CATS = [
  "eletricista",
  "encanador",
  "pintor",
  "técnico em ar-condicionado",
  "diarista",
  "marceneiro",
  "chaveiro",
  "marido de aluguel",
  "jardineiro",
  "frete e mudança",
  "vidraceiro",
  "dedetizador",
];

const ICONES_CATEGORIA: Record<string, string> = {
  eletricista: "⚡",
  encanador: "🔧",
  pintor: "🎨",
  "técnico em ar-condicionado": "❄️",
  diarista: "🧹",
  marceneiro: "🪚",
  chaveiro: "🔑",
  "marido de aluguel": "🛠️",
  jardineiro: "🌿",
  "frete e mudança": "🚚",
  vidraceiro: "🪟",
  dedetizador: "🐜",
  pedreiro: "🧱",
  gesseiro: "🪛",
  telhadista: "🏠",
  piscineiro: "🏊",
  serralheiro: "🔩",
  "montador de móveis": "🪑",
  "técnico em eletrodomésticos": "🔌",
  antenista: "📡",
  passadeira: "👔",
  cozinheira: "🍳",
  babá: "🍼",
  "cuidador de idosos": "🤝",
};

function iconeCategoria(cat: string): string {
  return ICONES_CATEGORIA[cat] ?? "🔧";
}

const PASSOS = `
  <div class="steps3">
    <div class="stp"><span class="n">Passo 1</span><h3>Diga o que você precisa</h3><p>Informe o serviço e o seu bairro em João Pessoa.</p></div>
    <div class="stp"><span class="n">Passo 2</span><h3>Veja os profissionais</h3><p>Mostramos quem atende esse serviço na sua região.</p></div>
    <div class="stp"><span class="n">Passo 3</span><h3>Entre em contato</h3><p>Fale direto no WhatsApp do profissional, sem intermediário.</p></div>
  </div>
`;

// =====================================================================
// HOME  (GET /diretorio)
// =====================================================================
diretorioRouter.get("/", (_req, res) => {
  const catCards = HOME_CATS.map(
    (c) =>
      `<a class="cat" href="/busca?categoria=${encodeURIComponent(c)}"><span class="ic" aria-hidden="true">${iconeCategoria(c)}</span><span class="nm">${escaparHtml(rotuloCategoria(c))}</span></a>`
  ).join("");

  const secoes = `
    <section class="hero">
      <h1>Encontre quem faz o que você precisa.</h1>
      <p class="sub">Profissionais e empresas da sua região, prontos pra resolver o que você precisa em casa ou no condomínio.</p>
      <form class="searchpanel" method="GET" action="/busca" role="search">
        <label class="sp-field">
          ${ICONE_LUPA}
          <span class="col"><span class="lbl">O que você precisa?</span><input type="text" name="q" placeholder="Eletricista, encanador, pintor…" /></span>
        </label>
        <label class="sp-field">
          ${ICONE_PIN}
          <span class="col"><span class="lbl">Onde?</span><input type="text" name="bairro" placeholder="Seu bairro em João Pessoa…" /></span>
        </label>
        <button type="submit" class="btn btn-primary btn-lg">Encontrar</button>
      </form>
    </section>

    <section class="home-sec">
      <h2>O que você está procurando?</h2>
      <p class="lead">Serviços para casa e condomínio em João Pessoa.</p>
      <div class="cats">${catCards}</div>
    </section>

    <section class="home-sec" id="como-funciona">
      <h2>Como funciona</h2>
      <p class="lead">Do problema ao contato, em três passos.</p>
      ${PASSOS}
    </section>
  `;

  res.send(
    paginaSite({
      titulo: "Encontre quem faz o que você precisa",
      secoes,
      metaDescricao:
        "Encontre eletricistas, encanadores, diaristas, pintores e outros profissionais para casa e condomínio em João Pessoa. Contato direto no WhatsApp.",
    })
  );
});

// =====================================================================
// RESULTADOS  (GET /busca)
// =====================================================================
type FiltrosUrl = { q?: string; categoria?: string; bairro?: string; segmento?: string; ordem?: string };

function montarBusca(atuais: FiltrosUrl, mudancas: FiltrosUrl = {}): string {
  const merge: FiltrosUrl = { ...atuais, ...mudancas };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merge)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/busca?${s}` : "/busca";
}

diretorioRouter.get("/busca", async (req, res) => {
  const q = str(req.query.q);
  const categoria = str(req.query.categoria);
  const bairro = str(req.query.bairro);
  const segmento = str(req.query.segmento);
  const ordem = str(req.query.ordem) === "recentes" ? "recentes" : "";
  const atuais: FiltrosUrl = { q, categoria, bairro, segmento, ordem };

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

  function grupo(
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
        return `<a class="fopt" href="${escaparHtml(montarBusca(atuais, mud))}"${ativo ? ' aria-current="true"' : ""}><span class="box" aria-hidden="true"></span>${escaparHtml(it.rotulo)}</a>`;
      })
      .join("");
    return `<div class="fg"><h3>${escaparHtml(titulo)}</h3>${linhas}</div>`;
  }

  const filtros = `
    <aside class="flt" aria-label="Filtros">
      <details class="flt-acc" open>
        <summary>Filtros</summary>
        <div class="fbody">
          ${grupo("Serviço", categoriasOrdenadas.map((c) => ({ valor: c, rotulo: rotuloCategoria(c) })), categoria, "categoria")}
          ${grupo("Bairro", bairrosOrdenados.map((b) => ({ valor: b, rotulo: b })), bairro, "bairro")}
          ${grupo("Atende", Object.keys(SEGMENTOS).map((s) => ({ valor: s, rotulo: rotuloSegmento(s) })), segmento, "segmento")}
        </div>
      </details>
    </aside>
  `;

  const n = perfis.length;
  const tituloResultado =
    `${n} ${n === 1 ? "profissional" : "profissionais"}` +
    (categoria ? ` de ${rotuloCategoria(categoria)}` : "") +
    (bairro ? ` em ${escaparHtml(bairro)}` : "") +
    (q && !categoria ? ` para “${escaparHtml(q)}”` : "");

  const ordAZ = !ordem;
  const srt = `Ordenar:
    <a href="${escaparHtml(montarBusca(atuais, { ordem: "" }))}"${ordAZ ? ' aria-current="true"' : ""}>Relevância</a> ·
    <a href="${escaparHtml(montarBusca(atuais, { ordem: "recentes" }))}"${!ordAZ ? ' aria-current="true"' : ""}>Mais recentes</a>`;

  const cards = perfis
    .map((p) => {
      const tags = [
        p.telefone_verificado ? `<span class="tag tag-verif">${ICONE_CHECK} Verificado</span>` : "",
        ...(p.segmentos ?? []).map((s) => `<span class="tag">${escaparHtml(rotuloSegmento(s))}</span>`),
      ]
        .filter(Boolean)
        .join("");
      return `
      <article class="pcard">
        <a class="card-link" href="/p/${escaparHtml(p.slug)}">Ver perfil de ${escaparHtml(p.nome)}</a>
        <div class="pcard-top">
          <span class="avatar" aria-hidden="true">${escaparHtml(iniciais(p.nome))}</span>
          <span><span class="nm">${escaparHtml(p.nome)}</span><br><span class="ct">${escaparHtml(rotuloCategoria(p.categoria))}</span></span>
        </div>
        ${p.bairro ? `<span class="loc">${ICONE_PIN} ${escaparHtml(rotuloLocal(p.bairro))}</span>` : ""}
        ${p.descricao ? `<p class="dsc">${escaparHtml(p.descricao)}</p>` : ""}
        ${tags ? `<div class="tags">${tags}</div>` : ""}
        <a class="btn btn-primary btn-block" data-wa="${escaparHtml(p.slug)}" data-wa-ctx="card_busca" href="${escaparHtml(linkWhatsapp(p.whatsapp, p.nome))}" target="_blank" rel="noopener">${ICONE_WA} Chamar no WhatsApp</a>
      </article>`;
    })
    .join("");

  const temFiltro = Boolean(q || categoria || bairro || segmento);
  const listagem = perfis.length
    ? `<div class="plist">${cards}</div>`
    : `<div class="empty">
        <h3>Nenhum profissional encontrado</h3>
        <p>${temFiltro ? "Não achamos ninguém com esses filtros." : "Ainda não há profissionais publicados. Volte em breve."}</p>
        ${
          temFiltro
            ? `<ul>
                <li><a href="/busca">Ver todos</a></li>
                ${bairro ? `<li><a href="${escaparHtml(montarBusca(atuais, { bairro: "" }))}">Buscar em toda João Pessoa</a></li>` : ""}
                ${categoria ? `<li><a href="${escaparHtml(montarBusca(atuais, { categoria: "" }))}">Tirar o filtro de serviço</a></li>` : ""}
              </ul>`
            : ""
        }
      </div>`;

  const secoes = `
    <div class="rbar">
      <form class="mini" method="GET" action="/busca" role="search">
        <input type="text" name="q" value="${escaparHtml(q)}" placeholder="Serviço" aria-label="Serviço" />
        <input type="text" name="bairro" value="${escaparHtml(bairro)}" placeholder="Bairro" aria-label="Bairro" />
        ${categoria ? `<input type="hidden" name="categoria" value="${escaparHtml(categoria)}" />` : ""}
        ${segmento ? `<input type="hidden" name="segmento" value="${escaparHtml(segmento)}" />` : ""}
        <button type="submit">Buscar</button>
      </form>
    </div>
    <div class="rhead">
      <h1>${tituloResultado}</h1>
      <span class="srt">${srt}</span>
    </div>
    <div class="rlayout">
      ${filtros}
      <div>${listagem}</div>
    </div>
  `;

  res.send(
    paginaSite({
      titulo: categoria ? `${rotuloCategoria(categoria)} em João Pessoa` : "Buscar profissionais",
      secoes,
      largura: "ampla",
      metaDescricao:
        "Profissionais para casa e condomínio em João Pessoa. Filtre por serviço e bairro e fale direto no WhatsApp.",
      evento: {
        tipo: "busca",
        servico: categoria || q || null,
        bairro: bairro || null,
        resultados_count: perfis.length,
      },
    })
  );
});

// =====================================================================
// PERFIL  (GET /diretorio/p/:slug)
// =====================================================================
diretorioRouter.get("/p/:slug", async (req, res) => {
  const perfil = await buscarPerfilPorSlug(req.params.slug).catch(() => null);

  if (!perfil) {
    return res.status(404).send(
      paginaSite({
        titulo: "Perfil não encontrado",
        secoes: `<div style="padding:64px 24px;text-align:center">
          <h1 style="font-family:var(--font-head);font-weight:800;font-size:1.6rem">Perfil não encontrado</h1>
          <p style="color:var(--text-muted);margin-top:8px">Esse profissional não está mais publicado ou o endereço está errado.</p>
          <p style="margin-top:22px"><a class="btn btn-primary" href="/busca">Ver todos os profissionais</a></p>
        </div>`,
      })
    );
  }

  const servicos = (perfil.servicos ?? []).filter(Boolean);
  const segmentosTxt = (perfil.segmentos ?? []).map(rotuloSegmento).join(" e ");
  const localTxt = rotuloLocal(perfil.bairro) || perfil.cidade || "";
  const ano = perfil.created_at ? new Date(perfil.created_at).getFullYear() : null;
  const wa = linkWhatsapp(perfil.whatsapp, perfil.nome);

  const meta = [
    localTxt || "",
    segmentosTxt ? `Atende ${segmentosTxt.toLowerCase()}` : "",
    ano ? `No Achaí desde ${ano}` : "",
  ]
    .filter(Boolean)
    .map((t) => `<span>${escaparHtml(t)}</span>`)
    .join("");

  const secoes = `
    <nav class="crumbs">
      <a href="/">Início</a><span class="sep">/</span>
      <a href="/busca?categoria=${encodeURIComponent(perfil.categoria)}">${escaparHtml(rotuloCategoria(perfil.categoria))}</a><span class="sep">/</span>
      ${escaparHtml(perfil.nome)}
    </nav>
    <div class="pdp">
      <div class="pdp-main">
        <div class="pdp-id">
          <span class="avatar lg" aria-hidden="true">${escaparHtml(iniciais(perfil.nome))}</span>
          <div>
            <span class="eyebrow">${escaparHtml(rotuloCategoria(perfil.categoria))}</span>
            <h1>${escaparHtml(perfil.nome)}</h1>
            ${perfil.telefone_verificado ? SELO_VERIFICADO : ""}
          </div>
        </div>
        <div class="meta">${meta}</div>

        ${
          perfil.descricao
            ? `<div class="pdp-sec"><h2>Sobre</h2><p class="sobre">${escaparHtml(perfil.descricao)}</p></div>`
            : ""
        }
        ${
          servicos.length
            ? `<div class="pdp-sec"><h2>Serviços</h2><div class="svcs">${servicos
                .map((s) => `<div>${escaparHtml(s)}</div>`)
                .join("")}</div></div>`
            : ""
        }
        ${
          perfil.bairro || segmentosTxt
            ? `<div class="pdp-sec"><h2>Área de atendimento</h2><div class="areas">
                ${perfil.bairro ? `<span class="tag">${escaparHtml(perfil.bairro === "João Pessoa" ? "João Pessoa — cidade toda" : perfil.bairro)}</span>` : ""}
                ${(perfil.segmentos ?? []).map((s) => `<span class="tag">${escaparHtml(rotuloSegmento(s))}</span>`).join("")}
              </div></div>`
            : ""
        }
        <div class="pdp-sec"><h2>Como funciona</h2>${PASSOS}</div>
      </div>

      <aside class="buybox">
        <span class="lbl">Contato direto</span>
        <div class="nm">${escaparHtml(perfil.nome)}</div>
        <div class="sb">${escaparHtml(rotuloCategoria(perfil.categoria))}${perfil.bairro ? ` · ${escaparHtml(perfil.bairro === "João Pessoa" ? "cidade toda" : perfil.bairro)}` : ""}</div>
        <a class="btn btn-primary btn-block btn-lg" data-wa="${escaparHtml(perfil.slug)}" data-wa-ctx="perfil" href="${escaparHtml(wa)}" target="_blank" rel="noopener">${ICONE_WA} Chamar no WhatsApp</a>
        ${perfil.telefone_verificado ? `<p style="margin-top:12px">${SELO_VERIFICADO}</p>` : ""}
        <p class="note">A Achaí Quem Faz não intermedia pagamento nem execução do serviço. Combine tudo direto com o profissional.</p>
        <a class="rep" href="https://instagram.com/achaiquemfaz" target="_blank" rel="noopener">Algo errado neste perfil?</a>
      </aside>
    </div>
    <div class="mobile-cta">
      <a class="btn btn-primary btn-lg" data-wa="${escaparHtml(perfil.slug)}" data-wa-ctx="perfil" href="${escaparHtml(wa)}" target="_blank" rel="noopener">${ICONE_WA} Chamar no WhatsApp</a>
    </div>
  `;

  res.send(
    paginaSite({
      titulo: `${perfil.nome} — ${rotuloCategoria(perfil.categoria)}`,
      secoes,
      metaDescricao: `${perfil.nome}: ${rotuloCategoria(perfil.categoria)} em ${localTxt || "João Pessoa"}. Contato direto no WhatsApp pelo Achaí Quem Faz.`,
      evento: { tipo: "perfil_visto", profissional_slug: perfil.slug },
    })
  );
});
