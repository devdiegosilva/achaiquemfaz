import { Router } from "express";
import { classificarDemanda } from "../services/ai";
import { buscarFornecedoresAtivos, registrarDemanda, registrarNotificacoes } from "../services/supabase";
import { enviarMensagemWhatsapp } from "../services/whatsapp";
import { consumirPendente, salvarPendente } from "../services/conversationState";
import type { MensagemRecebida } from "../types";

export const webhookRouter = Router();

// Extrai telefone/nome/texto do payload de evento "messages.upsert" da Evolution API.
function extrairMensagem(body: any): MensagemRecebida | null {
  const data = body?.data;
  const texto: string | undefined = data?.message?.conversation ?? data?.message?.extendedTextMessage?.text;
  const remoteJid: string | undefined = data?.key?.remoteJid;

  if (!texto || !remoteJid || data?.key?.fromMe) return null;

  return {
    telefone: remoteJid.replace(/@s\.whatsapp\.net$/, ""),
    nome: data?.pushName ?? null,
    texto: texto.trim(),
  };
}

webhookRouter.post("/whatsapp", async (req, res) => {
  try {
    const mensagem = extrairMensagem(req.body);
    if (!mensagem) {
      return res.sendStatus(200);
    }

    const pendente = consumirPendente(mensagem.telefone);
    const mensagemCompleta = pendente ? `${pendente.mensagemOriginal}\n${mensagem.texto}` : mensagem.texto;

    const classificacao = await classificarDemanda(mensagemCompleta);

    if (!classificacao.categoria) {
      salvarPendente(mensagem.telefone, { mensagemOriginal: mensagemCompleta });
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        classificacao.perguntaEsclarecimento ?? "Pode dar mais detalhes sobre o serviço que você precisa?"
      );
      return res.sendStatus(200);
    }

    const fornecedores = await buscarFornecedoresAtivos(classificacao.categoria, classificacao.bairro ?? undefined);

    if (fornecedores.length === 0) {
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        `No momento não encontramos prestadores de ${classificacao.categoria} disponíveis. Vamos avisar assim que tivermos.`
      );
      return res.sendStatus(200);
    }

    const demandaId = await registrarDemanda({
      demandanteNome: mensagem.nome,
      demandanteWhatsapp: mensagem.telefone,
      categoria: classificacao.categoria,
      bairro: classificacao.bairro,
      mensagemOriginal: mensagemCompleta,
    });

    const bairroTexto = classificacao.bairro ? ` no bairro ${classificacao.bairro}` : "";
    const nomeDemandante = mensagem.nome ?? "Um cliente";

    await Promise.all(
      fornecedores.map((fornecedor) =>
        enviarMensagemWhatsapp(
          fornecedor.whatsapp,
          `${nomeDemandante} está à procura dos seus serviços${bairroTexto}. Entre em contato pelo WhatsApp ${mensagem.telefone}.`
        )
      )
    );

    await registrarNotificacoes(demandaId, fornecedores.map((f) => f.id));

    const nomesFornecedores = fornecedores.map((f) => f.nome).join(", ");
    await enviarMensagemWhatsapp(
      mensagem.telefone,
      `Encontramos ${fornecedores.length} prestador(es) de ${classificacao.categoria} e avisamos: ${nomesFornecedores}. Eles devem entrar em contato em breve.`
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar webhook do WhatsApp:", error);
    return res.sendStatus(500);
  }
});
