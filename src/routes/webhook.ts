import { Router } from "express";
import { classificarDemanda } from "../services/ai";
import {
  buscarFornecedoresDisponiveis,
  buscarCategoriasFornecedores,
  registrarDemanda,
  registrarNotificacoes,
} from "../services/supabase";
import { enviarMensagemWhatsapp } from "../services/whatsapp";
import { consumirPendente, salvarPendente } from "../services/conversationState";
import { montarMensagemFornecedor } from "../services/mensagens";
import { CATEGORIAS_BASE, type MensagemRecebida } from "../types";

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

    const categoriasCadastradas = await buscarCategoriasFornecedores();
    const categoriasParaIA = Array.from(new Set([...Object.keys(CATEGORIAS_BASE), ...categoriasCadastradas]));

    const classificacao = await classificarDemanda(mensagemCompleta, categoriasParaIA);

    if (!classificacao.servicoDescrito) {
      salvarPendente(mensagem.telefone, { mensagemOriginal: mensagemCompleta });
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        classificacao.perguntaEsclarecimento ?? "Pode dar mais detalhes sobre o serviço que você precisa?"
      );
      return res.sendStatus(200);
    }

    if (!classificacao.categoriaEncontrada) {
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        `No momento não encontramos prestadores de ${classificacao.servicoDescrito} disponíveis. Vamos avisar assim que tivermos.`
      );
      return res.sendStatus(200);
    }

    const categoria = classificacao.categoriaEncontrada;
    const fornecedores = await buscarFornecedoresDisponiveis(categoria, classificacao.bairro ?? undefined);

    if (fornecedores.length === 0) {
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        `No momento não encontramos prestadores de ${categoria} disponíveis. Vamos avisar assim que tivermos.`
      );
      return res.sendStatus(200);
    }

    const demandaId = await registrarDemanda({
      demandanteNome: mensagem.nome,
      demandanteWhatsapp: mensagem.telefone,
      categoria,
      bairro: classificacao.bairro,
      mensagemOriginal: mensagemCompleta,
    });

    const bairroTexto = classificacao.bairro ? ` no bairro ${classificacao.bairro}` : "";
    const nomeDemandante = mensagem.nome ?? "Um cliente";

    await Promise.all(
      fornecedores.map((fornecedor) =>
        enviarMensagemWhatsapp(
          fornecedor.whatsapp,
          montarMensagemFornecedor(nomeDemandante, bairroTexto, mensagem.telefone, fornecedor.status === "trial")
        )
      )
    );

    await registrarNotificacoes(demandaId, fornecedores.map((f) => f.id));

    const nomesFornecedores = fornecedores.map((f) => f.nome).join(", ");
    await enviarMensagemWhatsapp(
      mensagem.telefone,
      `Encontramos ${fornecedores.length} prestador(es) de ${categoria} e avisamos: ${nomesFornecedores}. Eles devem entrar em contato em breve.`
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar webhook do WhatsApp:", error);
    return res.sendStatus(500);
  }
});
