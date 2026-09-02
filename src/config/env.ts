import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),

  // Essenciais (diretório).
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  backendPublicUrl: required("BACKEND_PUBLIC_URL"),

  // Diretório (/diretorio). Enquanto false, o cadastro no diretório é gratuito
  // (sem checkout Asaas) — pensado para o período de lançamento / cold start.
  diretorioExigeAssinatura: (process.env.DIRETORIO_EXIGE_ASSINATURA ?? "false") === "true",
  // Chave de acesso ao painel /diretorio/admin. Se vazia, o painel fica indisponível.
  adminChave: process.env.ADMIN_CHAVE ?? "",

  // ── Fluxo WhatsApp (DESATIVADO em 2026-09-02) ────────────────────────────────
  // Opcionais agora — a instância Evolution API pode ser desligada e estas variáveis
  // removidas da Railway sem quebrar o boot. Voltar a `required(...)` se o fluxo
  // WhatsApp for reativado (ver comentário em src/index.ts).
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  evolutionApiUrl: process.env.EVOLUTION_API_URL ?? "",
  evolutionApiKey: process.env.EVOLUTION_API_KEY ?? "",
  evolutionInstanceName: process.env.EVOLUTION_INSTANCE_NAME ?? "",
  asaasApiUrl: process.env.ASAAS_API_URL ?? "https://api-sandbox.asaas.com/v3",
  asaasApiKey: process.env.ASAAS_API_KEY ?? "",
  asaasWebhookToken: process.env.ASAAS_WEBHOOK_TOKEN ?? "",
  assinaturaValorMensal: Number(process.env.ASSINATURA_VALOR_MENSAL ?? 97.9),
};
