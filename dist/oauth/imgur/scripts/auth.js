// scripts/auth.js

/**
 * Função que será chamada ao carregar a página /oauth/callback.html.
 * Ela extrai o parâmetro `code` da URL (enviado pelo Imgur após o login)
 * e o envia para seu backend (Cloudflare Worker) para trocar pelo access_token.
 */
export function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  // Valida se o código de autorização está presente na URL
  if (!code) {
    alert("Erro: código de autorização ausente na URL.");
    window.location.href = "/"; // Redireciona de volta para o app
    return;
  }

  // Envia o código ao seu backend (Cloudflare Worker)
  fetch("https://xcam.aserio.workers.dev/imgur/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Token Imgur recebido:", data);

      // Aqui você pode:
      // - Armazenar em localStorage, se quiser manter no navegador
      // - Repassar para outro módulo
      // - Ou simplesmente redirecionar para o app principal

      // Exemplo: salvar o access_token no armazenamento local
      // localStorage.setItem("imgurToken", data.access_token);

      // Redireciona de volta para a home do app
      window.location.href = "/";
    })
    .catch(err => {
      console.error("Erro na troca de token com o Worker:", err);
      alert("Não foi possível completar a autenticação com o Imgur.");
      window.location.href = "/";
    });
}
