import { messages } from "https://xcam.gay/messages.js";

// Função para obter mensagem no idioma ativo
export function t(key, lang = "pt") {
  const keys = key.split(".");
  let msg = messages[lang];

  for (const k of keys) {
    if (msg && typeof msg === "object") {
      msg = msg[k];
    } else {
      return key; // fallback: retorna a key se não encontrar
    }
  }
  return msg || key;
}
