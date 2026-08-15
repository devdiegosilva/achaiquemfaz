import axios from "axios";
import { env } from "../config/env";
import { CATEGORIAS, type ClassificacaoDemanda } from "../types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `Você identifica qual categoria de prestador de serviço resolve o problema descrito por um usuário de WhatsApp em João Pessoa/PB.

Categorias válidas: ${CATEGORIAS.join(", ")}.

Responda APENAS com um JSON no formato:
{"categoria": "<uma das categorias válidas ou null>", "bairro": "<bairro mencionado pelo usuário ou null>", "perguntaEsclarecimento": "<pergunta curta e direta, ou null>"}

Regras:
- Se a mensagem já deixa claro o tipo de serviço, defina "categoria" e deixe "perguntaEsclarecimento" como null.
- Se estiver ambíguo, defina "categoria" como null e escreva UMA pergunta curta e direta em "perguntaEsclarecimento" para esclarecer.
- Extraia o bairro somente se o usuário o mencionar explicitamente na mensagem; caso contrário, deixe "bairro" como null (não pergunte pelo bairro).
- Nunca faça mais de uma pergunta por vez. Seja objetivo — o usuário quer resolver o problema rápido.`;

export async function classificarDemanda(mensagem: string): Promise<ClassificacaoDemanda> {
  const response = await axios.post(
    ANTHROPIC_URL,
    {
      model: "claude-sonnet-5",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
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
    categoria: parsed.categoria ?? null,
    bairro: parsed.bairro ?? null,
    perguntaEsclarecimento: parsed.perguntaEsclarecimento ?? null,
  };
}
