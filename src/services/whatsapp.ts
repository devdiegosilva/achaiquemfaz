import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: env.evolutionApiUrl,
  headers: { apikey: env.evolutionApiKey },
});

export async function enviarMensagemWhatsapp(telefone: string, texto: string): Promise<void> {
  await client.post(`/message/sendText/${env.evolutionInstanceName}`, {
    number: telefone,
    text: texto,
  });
}
