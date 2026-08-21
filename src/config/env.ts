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
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  evolutionApiUrl: required("EVOLUTION_API_URL"),
  evolutionApiKey: required("EVOLUTION_API_KEY"),
  evolutionInstanceName: required("EVOLUTION_INSTANCE_NAME"),
  backendPublicUrl: required("BACKEND_PUBLIC_URL"),
  asaasApiUrl: process.env.ASAAS_API_URL ?? "https://api-sandbox.asaas.com/v3",
  asaasApiKey: required("ASAAS_API_KEY"),
  asaasWebhookToken: required("ASAAS_WEBHOOK_TOKEN"),
  assinaturaValorMensal: Number(process.env.ASSINATURA_VALOR_MENSAL ?? 97.9),
};
