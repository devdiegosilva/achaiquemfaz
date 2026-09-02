// Lista de partida de categorias (chave = valor salvo no banco, valor = rótulo exibido).
// Fornecedores também podem escolher "Outro" no cadastro e digitar uma categoria livre,
// que passa a existir no sistema a partir do momento em que esse fornecedor fica ativo.
export const CATEGORIAS_BASE: Record<string, string> = {
  eletricista: "Eletricista",
  encanador: "Encanador",
  pedreiro: "Pedreiro",
  pintor: "Pintor",
  marceneiro: "Marceneiro",
  chaveiro: "Chaveiro",
  jardineiro: "Jardineiro",
  dedetizador: "Dedetizador",
  "técnico em eletrodomésticos": "Técnico em eletrodomésticos",
  gesseiro: "Gesseiro",
  vidraceiro: "Vidraceiro",
  serralheiro: "Serralheiro",
  "técnico em ar-condicionado": "Técnico em ar-condicionado",
  "técnico em informática": "Técnico em informática",
  "técnico em celular": "Técnico em celular",
  "montador de móveis": "Montador de móveis",
  telhadista: "Telhadista",
  piscineiro: "Piscineiro",
  antenista: "Antenista",
  "marido de aluguel": "Marido de aluguel",
  diarista: "Diarista",
  passadeira: "Passadeira",
  cozinheira: "Cozinheira",
  babá: "Babá",
  "cuidador de idosos": "Cuidador de idosos",
  manicure: "Manicure",
  cabeleireiro: "Cabeleireiro",
  barbeiro: "Barbeiro",
  esteticista: "Esteticista",
  massagista: "Massagista",
  fotógrafo: "Fotógrafo",
  costureira: "Costureira",
  "personal trainer": "Personal trainer",
  "professor particular": "Professor particular",
  mecânico: "Mecânico",
  "motorista particular": "Motorista particular",
  "frete e mudança": "Frete e mudança",
  "pet sitter": "Pet sitter / passeador de cães",
};

// Subconjunto de CATEGORIAS_BASE usado no diretório (/diretorio), cujo foco inicial é
// serviço para casa e condomínio. O fluxo do WhatsApp continua usando CATEGORIAS_BASE inteira.
export const CATEGORIAS_CASA_CONDOMINIO_KEYS = [
  "eletricista",
  "encanador",
  "pedreiro",
  "pintor",
  "marceneiro",
  "chaveiro",
  "jardineiro",
  "dedetizador",
  "técnico em eletrodomésticos",
  "gesseiro",
  "vidraceiro",
  "serralheiro",
  "técnico em ar-condicionado",
  "montador de móveis",
  "telhadista",
  "piscineiro",
  "antenista",
  "marido de aluguel",
  "diarista",
  "passadeira",
  "cozinheira",
  "babá",
  "cuidador de idosos",
  "frete e mudança",
] as const;

export const CATEGORIAS_CASA_CONDOMINIO: Record<string, string> = (() => {
  const mapa: Record<string, string> = {};
  for (const chave of CATEGORIAS_CASA_CONDOMINIO_KEYS) {
    mapa[chave] = CATEGORIAS_BASE[chave];
  }
  return mapa;
})();

export const SEGMENTOS: Record<string, string> = {
  casa: "Casa",
  condominio: "Condomínio",
};

export interface ClassificacaoDemanda {
  // Nome do serviço/profissional que a IA entendeu que o cliente precisa, em texto livre
  // (mesmo que ninguém cadastrado atenda essa categoria ainda).
  servicoDescrito: string | null;
  // Categoria de um fornecedor realmente cadastrado que corresponde ao serviço descrito,
  // copiada exatamente como está no banco. Null se a mensagem for ambígua ou se não
  // houver fornecedor para esse tipo de serviço.
  categoriaEncontrada: string | null;
  bairro: string | null;
  perguntaEsclarecimento: string | null;
}

export interface Fornecedor {
  id: string;
  nome: string;
  categoria: string;
  bairro: string | null;
  cidade: string;
  whatsapp: string;
  status: "ativo" | "inativo" | "trial";
}

// Perfil como aparece/é editado no diretório (/diretorio). Mesma linha da tabela
// fornecedores, recortada para o que o diretório usa.
export interface PerfilDiretorio {
  id: string;
  nome: string;
  categoria: string;
  servicos: string[];
  bairro: string | null;
  cidade: string;
  whatsapp: string;
  descricao: string | null;
  segmentos: string[];
  slug: string;
  publicado: boolean;
  status: "ativo" | "inativo" | "trial";
}

export interface MensagemRecebida {
  telefone: string;
  nome: string | null;
  texto: string;
}
