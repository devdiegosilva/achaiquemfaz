// Estado de conversa em memória, por telefone. Suficiente para o MVP (processo único);
// se o backend passar a rodar em múltiplas instâncias, mover para Supabase/Redis.

interface EstadoPendente {
  mensagemOriginal: string;
}

const pendentes = new Map<string, EstadoPendente>();

export function salvarPendente(telefone: string, estado: EstadoPendente): void {
  pendentes.set(telefone, estado);
}

export function consumirPendente(telefone: string): EstadoPendente | null {
  const estado = pendentes.get(telefone);
  if (!estado) return null;
  pendentes.delete(telefone);
  return estado;
}
