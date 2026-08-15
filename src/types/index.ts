export const CATEGORIAS = [
  "eletricista",
  "encanador",
  "pedreiro",
  "pintor",
  "marceneiro",
  "chaveiro",
  "jardineiro",
  "diarista",
  "dedetizador",
  "tecnico_eletrodomesticos",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export interface ClassificacaoDemanda {
  categoria: Categoria | null;
  bairro: string | null;
  perguntaEsclarecimento: string | null;
}

export interface Fornecedor {
  id: string;
  nome: string;
  categoria: string;
  bairro: string;
  cidade: string;
  whatsapp: string;
  status: "ativo" | "inativo";
}

export interface MensagemRecebida {
  telefone: string;
  nome: string | null;
  texto: string;
}
