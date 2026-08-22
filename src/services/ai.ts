import axios from "axios";
import { env } from "../config/env";
import type { ClassificacaoDemanda } from "../types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function montarSystemPrompt(categoriasDisponiveis: string[]): string {
  const listaCategorias =
    categoriasDisponiveis.length > 0
      ? categoriasDisponiveis.map((c) => `"${c}"`).join(", ")
      : "(nenhuma categoria cadastrada ainda)";

  return `Você identifica qual tipo de prestador de serviço resolve o problema descrito por um usuário de WhatsApp em João Pessoa/PB.

Categorias de fornecedores cadastradas no sistema hoje: ${listaCategorias}.

Responda APENAS com um JSON no formato:
{"servicoDescrito": "<nome do serviço/profissional em português que resolve o problema, ou null>", "categoriaEncontrada": "<uma categoria da lista acima, copiada EXATAMENTE como está escrita, ou null>", "bairro": "<bairro mencionado pelo usuário ou null>", "perguntaEsclarecimento": "<pergunta curta e direta, ou null>"}

Regras:
- Se a mensagem deixa claro que tipo de profissional resolveria o problema, preencha "servicoDescrito" com esse nome (ex: "eletricista", "personal organizer"), mesmo que essa categoria não exista na lista.
- Se "servicoDescrito" corresponder ao mesmo tipo de profissional de alguma categoria da lista — mesmo que a palavra usada pelo cliente seja diferente (ex: "bombeiro hidráulico" e "encanador" são a mesma coisa) — copie o valor EXATO dessa categoria em "categoriaEncontrada". Caso nenhuma categoria da lista sirva, deixe "categoriaEncontrada" como null.
- Se a mensagem estiver ambígua e não der para saber que tipo de profissional resolve o problema, deixe "servicoDescrito" e "categoriaEncontrada" como null, e escreva UMA pergunta curta e direta em "perguntaEsclarecimento" para esclarecer.
- Se "servicoDescrito" já estiver claro mas não bater com nenhuma categoria da lista, NÃO pergunte mais detalhes — deixe "perguntaEsclarecimento" como null (não adianta perguntar, ainda não temos esse tipo de fornecedor).
- Extraia o bairro somente se o usuário o mencionar explicitamente na mensagem; caso contrário, deixe "bairro" como null (não pergunte pelo bairro).
- Nunca faça mais de uma pergunta por vez. Seja objetivo — o usuário quer resolver o problema rápido.`;
}

export async function classificarDemanda(mensagem: string, categoriasDisponiveis: string[]): Promise<ClassificacaoDemanda> {
  const response = await axios.post(
    ANTHROPIC_URL,
    {
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: montarSystemPrompt(categoriasDisponiveis),
      messages: [{ role: "user", content: mensagem }],
    },
    {
      headers: {
        "x-api-key": env.anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    }
  );

  const textoResposta: string = response.data.content[0].text;
  const parsed = JSON.parse(textoResposta);

  return {
    servicoDescrito: parsed.servicoDescrito ?? null,
    categoriaEncontrada: parsed.categoriaEncontrada ?? null,
    bairro: parsed.bairro ?? null,
    perguntaEsclarecimento: parsed.perguntaEsclarecimento ?? null,
  };
}
