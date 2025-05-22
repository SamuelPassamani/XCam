# 📡 XCam API — Documentação Técnica Central

Este diretório reúne os recursos e gateways que compõem a infraestrutura de APIs da plataforma XCam.  
Inclui proxy reverso com Netlify, Worker do Cloudflare e integração OAuth2 com o Imgur.

---

## 🔁 Gateway de API Pública (Netlify)

- **URL base:** [`https://api.xcam.gay`](https://api.xcam.gay)
- **Destino:** Redireciona todas as requisições para o Worker do Cloudflare.
- **Gerenciado por:** Netlify com domínio customizado e `netlify.toml`
- **Repositório:** Diretório [`/api/netlify`](./netlify)

### 🧭 Exemplo de redirecionamento
```
GET https://api.xcam.gay/user/kleotwink
→ Internamente redirecionado para:
GET https://xcam.aserio.workers.dev/user/kleotwink
```

---

## ⚙️ Cloudflare Worker (Core API)

- **URL direta:** [`https://xcam.aserio.workers.dev`](https://xcam.aserio.workers.dev)
- **Responsável por:**
  - Rota `/`: listagem paginada das transmissões ao vivo
  - Rota `/user/<username>`: informações de perfil
  - Rota `/user/<username>/liveInfo`: status da transmissão ao vivo
- **Formato de resposta:** JSON (ou CSV via `?format=csv`)
- **Versão atual implantada:** `XCam API V.20`

---

## 🖼️ Integração com Imgur (Upload de Imagens)

- **Finalidade:** Realizar upload via URL com autenticação segura
- **Base:** OAuth2 Imgur usando `auth.js` e `callback.html`
- **Local:** [`/api/oauth/imgur`](./oauth/imgur)
- **Scripts:**
  - `auth.js`: inicia autenticação via OAuth2
  - `callback.html`: handler do retorno autorizado do Imgur

---

## 🧩 Estrutura Geral

```
/api/
├── netlify/           → Gateway e proxy (Netlify + toml)
├── oauth/
│   └── imgur/         → Integração OAuth2 com Imgur
└── workers/           → Cloudflare Worker com rotas REST
```

---

## 📌 Considerações

- Nenhuma chave secreta ou token sensível é versionado
- Documentação e status são atualizados em `deploy-check.md` e `CHANGELOG.md`
- Este diretório pode ser usado como ponto de partida para CI/CD da API pública

---
🔐 Desenvolvido e mantido por Samuel Passamani — [xcam.gay](https://xcam.gay)