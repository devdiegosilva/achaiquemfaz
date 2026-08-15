import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { Fornecedor } from "../types";

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

export async function buscarFornecedoresAtivos(categoria: string, bairro?: string): Promise<Fornecedor[]> {
  let query = supabase
    .from("fornecedores")
    .select("*")
    .eq("categoria", categoria)
    .eq("status", "ativo");

  if (bairro) {
    query = query.ilike("bairro", bairro);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function registrarDemanda(params: {
  demandanteNome: string | null;
  demandanteWhatsapp: string;
  categoria: string;
  bairro: string | null;
  mensagemOriginal: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("demandas")
    .insert({
      demandante_nome: params.demandanteNome,
      demandante_whatsapp: params.demandanteWhatsapp,
      categoria: params.categoria,
      bairro: params.bairro,
      mensagem_original: params.mensagemOriginal,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function registrarNotificacoes(demandaId: string, fornecedorIds: string[]): Promise<void> {
  if (fornecedorIds.length === 0) return;
  const { error } = await supabase.from("demandas_notificacoes").insert(
    fornecedorIds.map((fornecedorId) => ({ demanda_id: demandaId, fornecedor_id: fornecedorId }))
  );
  if (error) throw error;
}
