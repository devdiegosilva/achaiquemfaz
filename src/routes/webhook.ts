import { Router } from "express";
import axios from "axios";
import { classificarDemanda } from "../services/ai";
import {
  buscarFornecedoresDisponiveis,
  buscarCategoriasFornecedores,
  buscarContextoPendenteDemandante,
  existeFornecedorComWhatsapp,
  salvarDemandante,
  registrarDemanda,
  registrarNotificacoes,
} from "../services/supabase";
import { enviarMensagemWhatsapp } from "../services/whatsapp";
import { montarMensagemFornecedor } from "../services/mensagens";
import { CATEGORIAS_BASE, type MensagemRecebida } from "../types";

export const webhookRouter = Router();

// Quantas perguntas de esclarecimento seguidas a IA pode fazer antes de desistir. Protege
// contra loop infinito quando o número do fornecedor é, na verdade, outro robô automático
// (ex: um menu de atendimento que responde "não entendi" pra qualquer mensagem nossa).
const LIMITE_ESCLARECIMENTOS = 3;

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

    // Quem já é fornecedor cadastrado (qualquer status) não é tratado como demandante —
    // provavelmente é uma resposta a um aviso nosso, e a conversa real acontece direto com
    // quem pediu o serviço, fora do bot.
    if (await existeFornecedorComWhatsapp(mensagem.telefone)) {
      return res.sendStatus(200);
    }

    // Diálogo acumulado até aqui (os dois lados: cliente e atendente/IA), rotulado por
    // linha pra IA não confundir uma pergunta nossa anterior com a descrição do problema.
    const dialogoAnterior = await buscarContextoPendenteDemandante(mensagem.telefone);
    const dialogoAtual = dialogoAnterior
      ? `${dialogoAnterior}\nCliente: ${mensagem.texto}`
      : `Cliente: ${mensagem.texto}`;

    const categoriasCadastradas = await buscarCategoriasFornecedores();
    const categoriasParaIA = Array.from(new Set([...Object.keys(CATEGORIAS_BASE), ...categoriasCadastradas]));

    const classificacao = await classificarDemanda(dialogoAtual, categoriasParaIA);

    if (!classificacao.servicoDescrito) {
      const tentativasAnteriores = dialogoAnterior ? (dialogoAnterior.match(/Atendente:/g) ?? []).length : 0;

      if (tentativasAnteriores >= LIMITE_ESCLARECIMENTOS) {
        // Já perguntamos demais sem entender — desiste e zera o contexto, em vez de insistir
        // pra sempre (evita loop infinito com um robô do outro lado, por exemplo).
        await salvarDemandante(mensagem.telefone, mensagem.nome, null);
        await enviarMensagemWhatsapp(
          mensagem.telefone,
          "Não consegui entender qual serviço você precisa. Se quiser tentar de novo, é só mandar outra mensagem descrevendo o que você precisa."
        );
        return res.sendStatus(200);
      }

      // Ainda esperando esclarecimento — guarda o diálogo completo (incluindo a pergunta que
      // a própria IA está mandando agora) pra próxima mensagem levar em conta (válido por 72h).
      const pergunta = classificacao.perguntaEsclarecimento ?? "Pode dar mais detalhes sobre o serviço que você precisa?";
      await salvarDemandante(mensagem.telefone, mensagem.nome, `${dialogoAtual}\nAtendente: ${pergunta}`);
      await enviarMensagemWhatsapp(mensagem.telefone, pergunta);
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
      mensagemOriginal: dialogoAtual,
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
    // Loga só status + corpo da resposta (nunca o objeto do axios inteiro): o objeto completo
    // inclui os headers da requisição, e isso vazava nossa x-api-key da Anthropic nos logs.
    if (axios.isAxiosError(error)) {
      console.error(
        "Erro ao processar webhook do WhatsApp:",
        error.response?.status,
        JSON.stringify(error.response?.data)
      );
    } else {
      console.error("Erro ao processar webhook do WhatsApp:", error);
    }
    return res.sendStatus(500);
  }
});
