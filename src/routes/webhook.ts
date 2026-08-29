import { Router } from "express";
import { classificarDemanda } from "../services/ai";
import {
  buscarFornecedoresDisponiveis,
  buscarCategoriasFornecedores,
  buscarContextoPendenteDemandante,
  salvarDemandante,
  registrarDemanda,
  registrarNotificacoes,
} from "../services/supabase";
import { enviarMensagemWhatsapp } from "../services/whatsapp";
import { montarMensagemFornecedor } from "../services/mensagens";
import { CATEGORIAS_BASE, type MensagemRecebida } from "../types";

export const webhookRouter = Router();

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const contextoPendente = await buscarContextoPendenteDemandante(mensagem.telefone);
    const mensagemCompleta = contextoPendente ? `${contextoPendente}\n${mensagem.texto}` : mensagem.texto;

    const categoriasCadastradas = await buscarCategoriasFornecedores();
    const categoriasParaIA = Array.from(new Set([...Object.keys(CATEGORIAS_BASE), ...categoriasCadastradas]));

    const classificacao = await classificarDemanda(mensagemCompleta, categoriasParaIA);

    if (!classificacao.servicoDescrito) {
      // Ainda esperando esclarecimento — guarda o contexto pra próxima mensagem (válido por 72h).
      await salvarDemandante(mensagem.telefone, mensagem.nome, mensagemCompleta);
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        classificacao.perguntaEsclarecimento ?? "Pode dar mais detalhes sobre o serviço que você precisa?"
      );
      return res.sendStatus(200);
    }

    if (!classificacao.categoriaEncontrada) {
      // Demanda resolvida (sem fornecedor disponível) — zera o contexto.
      await salvarDemandante(mensagem.telefone, mensagem.nome, null);
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        `No momento não encontramos prestadores de ${classificacao.servicoDescrito} disponíveis. Vamos avisar assim que tivermos.`
      );
      return res.sendStatus(200);
    }

    const categoria = classificacao.categoriaEncontrada;
    const fornecedores = await buscarFornecedoresDisponiveis(categoria, classificacao.bairro ?? undefined);

    if (fornecedores.length === 0) {
      // Demanda resolvida (sem fornecedor disponível) — zera o contexto.
      await salvarDemandante(mensagem.telefone, mensagem.nome, null);
      await enviarMensagemWhatsapp(
        mensagem.telefone,
        `No momento não encontramos prestadores de ${categoria} disponíveis. Vamos avisar assim que tivermos.`
      );
      return res.sendStatus(200);
    }

    // Demanda resolvida com sucesso — zera o contexto.
    await salvarDemandante(mensagem.telefone, mensagem.nome, null);

    const demandaId = await registrarDemanda({
      demandanteNome: mensagem.nome,
      demandanteWhatsapp: mensagem.telefone,
      categoria,
      bairro: classificacao.bairro,
      mensagemOriginal: mensagemCompleta,
    });

    const bairroTexto = classificacao.bairro ? ` no bairro ${classificacao.bairro}` : "";
    const nomeDemandante = mensagem.nome ?? "Um cliente";

    // Envia um de cada vez, com um intervalo entre mensagens — disparar tudo de uma vez
    // pra vários números se parece com spam automatizado e é um dos gatilhos de bloqueio
    // de conta no WhatsApp.
    for (const fornecedor of fornecedores) {
      await enviarMensagemWhatsapp(
        fornecedor.whatsapp,
        montarMensagemFornecedor(nomeDemandante, bairroTexto, mensagem.telefone, fornecedor.status === "trial")
      );
      await aguardar(2000 + Math.random() * 2000);
    }

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
