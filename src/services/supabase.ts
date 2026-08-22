import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { Fornecedor } from "../types";

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

const TRIAL_DIAS = 30;

// Retorna fornecedores "ativo" (assinantes pagos) e "trial" (cadastrados manualmente,
// recebem demandas de graça pelos primeiros TRIAL_DIAS dias a partir do cadastro).
export async function buscarFornecedoresDisponiveis(categoria: string, bairro?: string): Promise<Fornecedor[]> {
  const trialValidoDesde = new Date(Date.now() - TRIAL_DIAS * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("fornecedores")
    .select("*")
    .eq("categoria", categoria)
    .or(`status.eq.ativo,and(status.eq.trial,created_at.gte.${trialValidoDesde})`);

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

export async function criarFornecedorPendente(params: {
  nome: string;
  categoria: string;
  bairro: string;
  cidade: string;
  whatsapp: string;
  email: string;
  cpfCnpj: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("fornecedores")
    .insert({
      nome: params.nome,
      categoria: params.categoria,
      bairro: params.bairro,
      cidade: params.cidade,
      whatsapp: params.whatsapp,
      email: params.email,
      cpf_cnpj: params.cpfCnpj,
      status: "inativo",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function salvarAsaasCheckoutId(fornecedorId: string, checkoutId: string): Promise<void> {
  const { error } = await supabase.from("fornecedores").update({ asaas_checkout_id: checkoutId }).eq("id", fornecedorId);
  if (error) throw error;
}

export async function ativarFornecedorPorId(fornecedorId: string, asaasCustomerId: string | null): Promise<boolean> {
  const { data, error } = await supabase
    .from("fornecedores")
    .update(asaasCustomerId ? { status: "ativo", asaas_customer_id: asaasCustomerId } : { status: "ativo" })
    .eq("id", fornecedorId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function ativarFornecedorPorAsaasCustomerId(asaasCustomerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("fornecedores")
    .update({ status: "ativo" })
    .eq("asaas_customer_id", asaasCustomerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

// Chamado quando o Asaas avisa que uma cobrança da assinatura venceu sem pagamento.
export async function desativarFornecedorPorAsaasCustomerId(asaasCustomerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("fornecedores")
    .update({ status: "inativo" })
    .eq("asaas_customer_id", asaasCustomerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
