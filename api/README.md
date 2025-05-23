[![Netlify Status](https://api.netlify.com/api/v1/badges/b3bf1a04-7e16-40b3-8972-676895751821/deploy-status)](https://app.netlify.com/projects/xcam-api/deploys)

<p align="center">
  <img src="https://xcam.site.my.eu.org/0:/logo2.png" alt="XCam Web App Logo" width="180"/>
</p>

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
- **Versão atual implantada:** `XCam API V.19.1`

### ✅ Funcionalidades da rota `/`

- Filtros por query string: `country`, `orientation`, `tags`, `page`, `limit`
- Ordenação automática por número de viewers
- Suporte a exportação CSV (`?format=csv`)
- Cache automático com `caches.default`
- Filtros aplicados localmente após coleta dos dados do CAM4
- CORS dinâmico para domínios confiáveis como `xcam.gay`

🔎 **Nota:**  
O filtro `gender` é fixo na query original (`gender: "male"`). Quando passado via query string, ele não é reaplicado no lado do Worker.  
Isso é aceito como comportamento padrão da versão atual.

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

## 📘 Notas técnicas e boas práticas

- Modularização clara com funções reutilizáveis
- Uso de GraphQL via `fetch` para consulta ao CAM4
- Filtros aplicados em memória após coleta completa
- Exportação de dados em CSV com headers dinâmicos
- CORS dinâmico com origem validada
- Uso de cache interno do Worker para performance
- Respostas uniformes com tratamento de erros explícito

---

## 📌 Considerações

- Nenhuma chave secreta ou token sensível é versionado
- Documentação e status são atualizados em `deploy-check.md` e `CHANGELOG.md`
- Este diretório pode ser usado como ponto de partida para CI/CD da API pública

---

<p align="center">
  <strong>© XCam Web App — 2025</strong>
</p>
