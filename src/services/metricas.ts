import { supabase } from "./supabase";

export interface EventoRow {
  criado_em: string;
  tipo: "busca" | "perfil_visto" | "whatsapp_clicado";
  servico: string | null;
  bairro: string | null;
  profissional_slug: string | null;
  resultados_count: number | null;
  contexto: "card_busca" | "perfil" | null;
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const LIMITE = 50000;

export async function buscarEventosPeriodo(desdeISO: string): Promise<{ eventos: EventoRow[]; truncado: boolean }> {
  const { data, error } = await supabase
    .from("eventos")
    .select("criado_em, tipo, servico, bairro, profissional_slug, resultados_count, contexto, session_id, utm_source, utm_medium, utm_campaign")
    .gte("criado_em", desdeISO)
    .eq("interno", false)
    .order("criado_em", { ascending: false })
    .limit(LIMITE);

  if (error) throw error;
  const eventos = (data ?? []) as unknown as EventoRow[];
  return { eventos, truncado: eventos.length >= LIMITE };
}

// ---- agregação ----

export interface LinhaDemanda {
  servico: string;
  bairro: string;
  buscas: number;
  sessoes: number;
}
export interface LinhaProfissional {
  slug: string;
  nome: string;
  categoria: string;
  perfis_vistos: number;
  cliques_card: number;
  cliques_perfil: number;
  cliques_total: number;
}
export interface LinhaOrigem {
  utm_source: string;
  utm_campaign: string;
  eventos: number;
  sessoes: number;
}

export interface Metricas {
  buscasEventos: number;
  buscasUnicas: number;
  buscasUnicasZero: number;
  buscasEventosZero: number;
  perfisVistos: number;
  cliquesCard: number;
  cliquesPerfil: number;
  cliquesTotal: number;
  taxaBuscaPerfil: number; // perfis_vistos / buscas_unicas
  taxaPerfilWhats: number; // cliques_total / perfis_vistos
  pctZeroUnica: number;
  pctZeroEventos: number;
  demandaNaoAtendida: LinhaDemanda[];
  demandaAtendida: LinhaDemanda[];
  profissionais: LinhaProfissional[];
  origens: LinhaOrigem[];
}

const chave = (e: { servico: string | null; bairro: string | null }) =>
  `${(e.servico ?? "—").toLowerCase()}${(e.bairro ?? "—").toLowerCase()}`;

function agruparDemanda(buscas: EventoRow[]): LinhaDemanda[] {
  const mapa = new Map<string, { servico: string; bairro: string; buscas: number; sessoes: Set<string> }>();
  for (const b of buscas) {
    const k = chave(b);
    let linha = mapa.get(k);
    if (!linha) {
      linha = { servico: b.servico ?? "—", bairro: b.bairro ?? "—", buscas: 0, sessoes: new Set() };
      mapa.set(k, linha);
    }
    linha.buscas += 1;
    linha.sessoes.add(b.session_id);
  }
  return Array.from(mapa.values())
    .map((l) => ({ servico: l.servico, bairro: l.bairro, buscas: l.buscas, sessoes: l.sessoes.size }))
    .sort((a, b) => b.sessoes - a.sessoes || b.buscas - a.buscas);
}

export function calcularMetricas(
  eventos: EventoRow[],
  publicados: Array<{ slug: string; nome: string; categoria: string }>
): Metricas {
  const buscas = eventos.filter((e) => e.tipo === "busca");
  const perfis = eventos.filter((e) => e.tipo === "perfil_visto");
  const cliques = eventos.filter((e) => e.tipo === "whatsapp_clicado");

  // Buscas únicas por sessão: tuplas distintas (session_id, servico, bairro).
  // Uma tupla é "sem resultado" quando o MAIOR resultados_count observado nela é 0.
  const tuplas = new Map<string, number>(); // tupla -> max resultados_count
  for (const b of buscas) {
    const k = `${b.session_id}${chave(b)}`;
    const atual = tuplas.get(k);
    const rc = b.resultados_count ?? 0;
    if (atual === undefined || rc > atual) tuplas.set(k, rc);
  }
  const buscasUnicas = tuplas.size;
  let buscasUnicasZero = 0;
  for (const rc of tuplas.values()) if (rc === 0) buscasUnicasZero += 1;

  const buscasEventosZero = buscas.filter((b) => (b.resultados_count ?? -1) === 0).length;

  const cliquesCard = cliques.filter((c) => c.contexto === "card_busca").length;
  const cliquesPerfil = cliques.filter((c) => c.contexto === "perfil").length;
  const cliquesTotal = cliques.length;

  const div = (a: number, b: number) => (b > 0 ? a / b : 0);

  const profissionais: LinhaProfissional[] = publicados
    .map((p) => {
      const pv = perfis.filter((e) => e.profissional_slug === p.slug).length;
      const cc = cliques.filter((e) => e.profissional_slug === p.slug && e.contexto === "card_busca").length;
      const cp = cliques.filter((e) => e.profissional_slug === p.slug && e.contexto === "perfil").length;
      return {
        slug: p.slug,
        nome: p.nome,
        categoria: p.categoria,
        perfis_vistos: pv,
        cliques_card: cc,
        cliques_perfil: cp,
        cliques_total: cc + cp,
      };
    })
    .sort((a, b) => a.cliques_total - b.cliques_total || a.perfis_vistos - b.perfis_vistos);

  const mapaOrigem = new Map<string, { utm_source: string; utm_campaign: string; eventos: number; sessoes: Set<string> }>();
  for (const e of eventos) {
    const s = e.utm_source ?? "—";
    const c = e.utm_campaign ?? "—";
    const k = `${s}${c}`;
    let linha = mapaOrigem.get(k);
    if (!linha) {
      linha = { utm_source: s, utm_campaign: c, eventos: 0, sessoes: new Set() };
      mapaOrigem.set(k, linha);
    }
    linha.eventos += 1;
    linha.sessoes.add(e.session_id);
  }
  const origens = Array.from(mapaOrigem.values())
    .map((l) => ({ utm_source: l.utm_source, utm_campaign: l.utm_campaign, eventos: l.eventos, sessoes: l.sessoes.size }))
    .sort((a, b) => b.eventos - a.eventos);

  return {
    buscasEventos: buscas.length,
    buscasUnicas,
    buscasUnicasZero,
    buscasEventosZero,
    perfisVistos: perfis.length,
    cliquesCard,
    cliquesPerfil,
    cliquesTotal,
    taxaBuscaPerfil: div(perfis.length, buscasUnicas),
    taxaPerfilWhats: div(cliquesTotal, perfis.length),
    pctZeroUnica: div(buscasUnicasZero, buscasUnicas),
    pctZeroEventos: div(buscasEventosZero, buscas.length),
    demandaNaoAtendida: agruparDemanda(buscas.filter((b) => (b.resultados_count ?? -1) === 0)),
    demandaAtendida: agruparDemanda(buscas.filter((b) => (b.resultados_count ?? 0) > 0)),
    profissionais,
    origens,
  };
}
