import { supabase } from "./supabase";

export const TIPOS_EVENTO = ["busca", "perfil_visto", "whatsapp_clicado"] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

const CONTEXTOS = ["card_busca", "perfil"];
const REGEX_BOT = /bot|crawler|spider|headless|lighthouse|preview/i;

// ---- Rate limit em memória (janela fixa por IP) ----
// Reseta a cada deploy — aceitável para o volume do piloto.
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 60;
const contadores = new Map<string, { inicio: number; n: number }>();

export function podeRegistrar(ip: string): boolean {
  if (!ip) return false;
  const agora = Date.now();
  const atual = contadores.get(ip);
  if (!atual || agora - atual.inicio > JANELA_MS) {
    contadores.set(ip, { inicio: agora, n: 1 });
    if (contadores.size > 5000) {
      for (const [k, v] of contadores) if (agora - v.inicio > JANELA_MS) contadores.delete(k);
    }
    return true;
  }
  atual.n += 1;
  return atual.n <= MAX_POR_JANELA;
}

export function pareceBot(userAgent: string): boolean {
  return !userAgent || REGEX_BOT.test(userAgent);
}

function txt(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

// Insere um evento. Nunca lança — loga e segue.
export async function registrarEvento(payload: unknown, userAgent: string): Promise<void> {
  try {
    if (!payload || typeof payload !== "object") return;
    const p = payload as Record<string, unknown>;

    if (!TIPOS_EVENTO.includes(p.tipo as TipoEvento)) return;
    if (typeof p.session_id !== "string" || !p.session_id.trim()) return;

    const contexto = typeof p.contexto === "string" && CONTEXTOS.includes(p.contexto) ? p.contexto : null;
    const resultados =
      p.tipo === "busca" && typeof p.resultados_count === "number" && Number.isFinite(p.resultados_count)
        ? Math.max(0, Math.trunc(p.resultados_count))
        : null;

    const { error } = await supabase.from("eventos").insert({
      tipo: p.tipo,
      servico: txt(p.servico),
      bairro: txt(p.bairro),
      profissional_slug: txt(p.profissional_slug),
      resultados_count: resultados,
      contexto,
      session_id: String(p.session_id).slice(0, 64),
      utm_source: txt(p.utm_source, 200),
      utm_medium: txt(p.utm_medium, 200),
      utm_campaign: txt(p.utm_campaign, 200),
      referrer: txt(p.referrer, 500),
      user_agent: txt(userAgent, 400),
      interno: p.interno === true,
    });
    if (error) console.error("registrarEvento (insert):", error.message);
  } catch (e) {
    console.error("registrarEvento:", e);
  }
}
