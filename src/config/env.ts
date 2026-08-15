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
};
