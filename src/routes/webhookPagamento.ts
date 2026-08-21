import { Router } from "express";
import { env } from "../config/env";
import { ativarFornecedorPorId, ativarFornecedorPorAsaasCustomerId } from "../services/supabase";

export const webhookPagamentoRouter = Router();

webhookPagamentoRouter.post("/pagamento", async (req, res) => {
  const tokenRecebido = req.header("asaas-access-token");
  if (tokenRecebido !== env.asaasWebhookToken) {
    return res.sendStatus(401);
  }

  try {
    const { event, payment } = req.body ?? {};

    if (event === "PAYMENT_CONFIRMED" && payment) {
      const fornecedorId: string | undefined = payment.externalReference;
      const asaasCustomerId: string | undefined = payment.customer;

      let ativado = false;
      if (fornecedorId && asaasCustomerId) {
        ativado = await ativarFornecedorPorId(fornecedorId, asaasCustomerId);
      }
      if (!ativado && asaasCustomerId) {
        ativado = await ativarFornecedorPorAsaasCustomerId(asaasCustomerId);
      }
      if (!ativado) {
        console.error("Webhook de pagamento confirmado sem fornecedor correspondente:", { fornecedorId, asaasCustomerId });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao processar webhook de pagamento:", error);
    return res.sendStatus(500);
  }
});
