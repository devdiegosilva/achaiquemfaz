import { CATEGORIAS_BASE } from "../types";

// Tira acento, deixa minúsculo e colapsa espaços — usado só pra comparar.
function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Apelidos comuns que o fornecedor digita no "Não encontrei minha categoria" e que,
// na verdade, correspondem a uma categoria que já existe na lista. Chave = texto digitado
// (sem acento, minúsculo); valor = chave canônica de CATEGORIAS_BASE.
const SINONIMOS: Record<string, string> = {
  frete: "frete e mudança",
  "frete e mudanca": "frete e mudança",
  mudanca: "frete e mudança",
  mudancas: "frete e mudança",
  carreto: "frete e mudança",
  "frete e carreto": "frete e mudança",
  eletrica: "eletricista",
  "eletrica predial": "eletricista",
  "eletrica residencial": "eletricista",
  eletrotecnico: "eletricista",
  hidraulica: "encanador",
  "sistema hidraulico": "encanador",
  "bombeiro hidraulico": "encanador",
  "encanador e bombeiro hidraulico": "encanador",
  pintura: "pintor",
  "pintura residencial": "pintor",
  vidracaria: "vidraceiro",
  "cortina de vidro": "vidraceiro",
  "porta de vidro": "vidraceiro",
  "box de vidro": "vidraceiro",
  "fechamento de varanda": "vidraceiro",
  "ar condicionado": "técnico em ar-condicionado",
  "tecnico em ar condicionado": "técnico em ar-condicionado",
  climatizacao: "técnico em ar-condicionado",
  "instalacao de ar condicionado": "técnico em ar-condicionado",
  "maquina de lavar": "técnico em eletrodomésticos",
  "maquinas de lavar": "técnico em eletrodomésticos",
  "conserto de eletrodomesticos": "técnico em eletrodomésticos",
  "tecnico em eletrodomestico": "técnico em eletrodomésticos",
  faxineira: "diarista",
  "diarista e faxineira": "diarista",
  faxina: "diarista",
  "limpeza residencial": "diarista",
  "limpeza pos obra": "diarista",
  jardinagem: "jardineiro",
  "corte de grama": "jardineiro",
  marcenaria: "marceneiro",
  "montagem de moveis": "montador de móveis",
  "montador de moveis": "montador de móveis",
  "chaveiro 24h": "chaveiro",
  chave: "chaveiro",
  dedetizacao: "dedetizador",
  "controle de pragas": "dedetizador",
  gesso: "gesseiro",
  drywall: "gesseiro",
  "forro de gesso": "gesseiro",
};

// Índice: forma normalizada da chave e do rótulo de cada categoria conhecida -> chave canônica.
const INDICE_CONHECIDAS: Record<string, string> = {};
for (const [chave, rotulo] of Object.entries(CATEGORIAS_BASE)) {
  INDICE_CONHECIDAS[normalizarTexto(chave)] = chave;
  INDICE_CONHECIDAS[normalizarTexto(rotulo)] = chave;
}

// Recebe o texto livre digitado no cadastro/edição e devolve a categoria "canônica":
//  - se casar (ignorando acento e caixa) com uma categoria da lista ou com um sinônimo
//    conhecido, devolve a chave dessa categoria — assim o perfil fica "lincado" aos
//    cards da home e ao filtro da busca;
//  - senão, devolve o texto em minúsculas com espaços normalizados (categoria nova de fato).
export function normalizarCategoria(texto: string): string {
  const limpo = texto.toLowerCase().replace(/\s+/g, " ").trim();
  if (!limpo) return "";
  const base = normalizarTexto(limpo);
  if (INDICE_CONHECIDAS[base]) return INDICE_CONHECIDAS[base];
  const sinonimo = SINONIMOS[base];
  if (sinonimo && CATEGORIAS_BASE[sinonimo]) return sinonimo;
  return limpo;
}
