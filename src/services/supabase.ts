import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { Fornecedor, PerfilDiretorio } from "../types";
import { gerarSlug, sufixoAleatorio } from "./slug";

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

// Categorias que já têm pelo menos um fornecedor ativo/trial cadastrado — usado tanto
// para a IA casar a demanda do cliente com categorias "outro" quanto para exibir na landing page.
export async function buscarCategoriasFornecedores(): Promise<string[]> {
  const trialValidoDesde = new Date(Date.now() - TRIAL_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("fornecedores")
    .select("categoria")
    .or(`status.eq.ativo,and(status.eq.trial,created_at.gte.${trialValidoDesde})`);

  if (error) throw error;
  return Array.from(new Set((data ?? []).map((f) => f.categoria as string)));
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

export async function removerFornecedor(fornecedorId: string): Promise<void> {
  const { error } = await supabase.from("fornecedores").delete().eq("id", fornecedorId);
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

// Usado pra distinguir um fornecedor respondendo a um aviso nosso de um demandante novo —
// não importa o status (ativo/inativo/trial), qualquer número já cadastrado como fornecedor
// não deve ser tratado como se estivesse pedindo um serviço.
export async function existeFornecedorComWhatsapp(whatsapp: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("fornecedores")
    .select("id")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

const JANELA_CONTEXTO_HORAS = 72;

// Retorna a conversa em aberto com esse demandante (aguardando resposta a uma pergunta de
// esclarecimento), desde que o último contato tenha sido há menos de JANELA_CONTEXTO_HORAS.
// Passado esse prazo, ou se não houver contexto pendente, retorna null (trata como demanda nova).
export async function buscarContextoPendenteDemandante(whatsapp: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("demandantes")
    .select("contexto_pendente, atualizado_em")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.contexto_pendente) return null;

  const horasDesdeUltimoContato = (Date.now() - new Date(data.atualizado_em).getTime()) / (1000 * 60 * 60);
  if (horasDesdeUltimoContato >= JANELA_CONTEXTO_HORAS) return null;

  return data.contexto_pendente as string;
}

// Cria/atualiza o registro do demandante. contextoPendente deve ser null quando a demanda
// foi resolvida (sucesso ou "não temos esse serviço"), ou o texto acumulado quando a IA
// ainda está esperando uma resposta de esclarecimento.
export async function salvarDemandante(whatsapp: string, nome: string | null, contextoPendente: string | null): Promise<void> {
  const { error } = await supabase
    .from("demandantes")
    .upsert(
      { whatsapp, nome, contexto_pendente: contextoPendente, atualizado_em: new Date().toISOString() },
      { onConflict: "whatsapp" }
    );
  if (error) throw error;
}

// ===========================================================================
// Diretório (/diretorio) — módulo em paralelo ao fluxo do WhatsApp.
// Um fornecedor só aparece no diretório quando publicado = true. É independente
// de status/trial (que controlam o disparo no WhatsApp).
// ===========================================================================

const CAMPOS_PERFIL =
  "id, nome, categoria, servicos, bairro, cidade, whatsapp, descricao, segmentos, slug, publicado, status, created_at";

export interface FiltrosDiretorio {
  categoria?: string;
  bairro?: string;
  segmento?: string;
  termo?: string;
  ordem?: "nome" | "recentes";
}

// Remove caracteres que quebram a sintaxe do filtro .or() do PostgREST.
function limparTermo(termo: string): string {
  return termo.replace(/[,()*:]/g, " ").trim().slice(0, 60);
}

export async function buscarPerfisPublicados(filtros: FiltrosDiretorio = {}): Promise<PerfilDiretorio[]> {
  let query = supabase.from("fornecedores").select(CAMPOS_PERFIL).eq("publicado", true);

  if (filtros.categoria) query = query.eq("categoria", filtros.categoria);
  if (filtros.bairro) query = query.ilike("bairro", `%${filtros.bairro}%`);
  if (filtros.segmento) query = query.contains("segmentos", [filtros.segmento]);

  const termo = filtros.termo ? limparTermo(filtros.termo) : "";
  if (termo) {
    query = query.or(`nome.ilike.*${termo}*,categoria.ilike.*${termo}*,descricao.ilike.*${termo}*`);
  }

  query =
    filtros.ordem === "recentes"
      ? query.order("created_at", { ascending: false })
      : query.order("nome");

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PerfilDiretorio[];
}

// Categorias que já têm pelo menos um perfil publicado — usado para montar o filtro da busca.
export async function buscarCategoriasPublicadas(): Promise<string[]> {
  const { data, error } = await supabase.from("fornecedores").select("categoria").eq("publicado", true);
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((f) => f.categoria as string)));
}

// Bairros que já têm pelo menos um perfil publicado — usado para o filtro da busca.
export async function buscarBairrosPublicados(): Promise<string[]> {
  const { data, error } = await supabase
    .from("fornecedores")
    .select("bairro")
    .eq("publicado", true)
    .not("bairro", "is", null);
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((f) => (f.bairro as string) ?? "").filter(Boolean)));
}

export async function buscarPerfilPorSlug(slug: string): Promise<PerfilDiretorio | null> {
  const { data, error } = await supabase
    .from("fornecedores")
    .select(CAMPOS_PERFIL)
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as PerfilDiretorio | null) ?? null;
}

// Usado pela tela de edição via magic link — traz o perfil mesmo despublicado.
export async function buscarPerfilPorToken(token: string): Promise<PerfilDiretorio | null> {
  const { data, error } = await supabase
    .from("fornecedores")
    .select(CAMPOS_PERFIL)
    .eq("edit_token", token)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as PerfilDiretorio | null) ?? null;
}

export async function atualizarPerfilPorToken(
  token: string,
  campos: {
    categoria: string;
    descricao: string | null;
    servicos: string[];
    bairro: string | null;
    segmentos: string[];
    publicado: boolean;
  }
): Promise<boolean> {
  const { data, error } = await supabase
    .from("fornecedores")
    .update(campos)
    .eq("edit_token", token)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

// Cria um perfil novo direto pelo diretório (auto-cadastro). Entra como status 'inativo'
// (não recebe disparo no WhatsApp); publicado conforme o parâmetro.
export async function criarPerfilDiretorio(params: {
  nome: string;
  categoria: string;
  servicos: string[];
  bairro: string | null;
  cidade: string;
  whatsapp: string;
  email: string | null;
  descricao: string | null;
  segmentos: string[];
  publicado: boolean;
}): Promise<{ id: string; slug: string; editToken: string }> {
  const slugBase = gerarSlug(params.nome);

  // Tenta inserir com um slug único; em caso de colisão (código 23505), tenta de novo
  // com outro sufixo aleatório.
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const slug = tentativa === 0 ? slugBase : `${slugBase}-${sufixoAleatorio()}`;
    const { data, error } = await supabase
      .from("fornecedores")
      .insert({
        nome: params.nome,
        categoria: params.categoria,
        servicos: params.servicos,
        bairro: params.bairro,
        cidade: params.cidade,
        whatsapp: params.whatsapp,
        email: params.email,
        descricao: params.descricao,
        segmentos: params.segmentos,
        publicado: params.publicado,
        status: "inativo",
        slug,
      })
      .select("id, slug, edit_token")
      .single();

    if (!error) {
      return { id: data.id as string, slug: data.slug as string, editToken: data.edit_token as string };
    }
    if ((error as { code?: string }).code !== "23505") throw error;
  }

  throw new Error("Não foi possível gerar um slug único para o perfil");
}

// ---- Painel /diretorio/admin ----

export interface PerfilAdmin extends PerfilDiretorio {
  email: string | null;
  edit_token: string;
  created_at: string;
}

export async function listarPerfisAdmin(): Promise<PerfilAdmin[]> {
  const { data, error } = await supabase
    .from("fornecedores")
    .select(`${CAMPOS_PERFIL}, email, edit_token, created_at`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PerfilAdmin[];
}

export async function definirPublicado(id: string, publicado: boolean): Promise<void> {
  const { error } = await supabase.from("fornecedores").update({ publicado }).eq("id", id);
  if (error) throw error;
}
