<p align="center">
  <img src="https://xcam.site.my.eu.org/0:/logo2.png" alt="XCam Logo" width="300"/>
</p>

# 📡 Plataforma Modular para Transmissões ao Vivo

XCam é uma plataforma moderna, modular e responsiva voltada à exibição de transmissões ao vivo, com foco em performance, organização de código, arquitetura limpa e escalabilidade.

---

## 📁 Estrutura Geral do Projeto

```
/XCam
├── dist/               # Frontend modular e responsivo
│   ├── beta/           # Versão mais recente do Web App (ES Modules)
│   └── cam/            # Player dedicado
│
├── api/                # Infraestrutura de API
│   ├── netlify/        # Proxy reverso Netlify → Worker Cloudflare
│   ├── oauth/imgur/    # Upload de imagem com OAuth2
│   └── workers/        # Worker principal da API pública
│
├── status/             # Página pública de status
├── README.md           # Documentação geral
└── CHANGELOG.md        # Registro técnico de versões
```

---

## 🧠 Tecnologias e Padrões

- Frontend: **HTML5 + CSS3 + JS (ES6 Modules)** sem frameworks pesados
- Backend/API: **Cloudflare Worker** com suporte a GraphQL + REST
- Gateway: **Netlify Redirect Proxy**
- Uploads: **Imgur API + OAuth2**
- Deploy: **CI/CD GitHub + Netlify + Cloudflare**

---

## 🔗 Links Oficiais

| Área         | Subdomínio                 | Destino                     |
|--------------|----------------------------|-----------------------------|
| Web App      | [xcam.gay](https://xcam.gay)        | Netlify Frontend           |
| API Pública  | [api.xcam.gay](https://api.xcam.gay) | Worker Cloudflare via Proxy|
| Status Page  | [status.xcam.gay](https://status.xcam.gay) | Netlify estático     |

---

## 🚀 Funcionalidades Principais

### 🔥 XCam Web App

- Carregamento dinâmico e filtrável de transmissões
- Scroll infinito, lazy loading e player modal
- Filtros: país, gênero, orientação, tags, número mínimo de viewers
- Multilíngue com tradução reversa (PT/EN)

### ⚙️ XCam API Pública

- Endpoint `/` com paginação, CSV, filtros dinâmicos:
  - `gender`, `country`, `orientation`, `minViewers`, `tags`
- Rota `/user/<username>` com info completa (profile + streamInfo)
- Rota `/user/<username>/liveInfo` com status da transmissão

### 🖼️ XCam Imgur API

- Upload de imagens via URL com autenticação segura (OAuth2)
- Callback automatizado (`callback.html`)
- Scripts gerenciados em `/api/oauth/imgur`

### 📶 Status Page

- Verifica disponibilidade de `xcam.gay` e `api.xcam.gay` a cada 60s
- Indicadores visuais (🟢 Online | 🔴 Offline)
- Responsiva e sem backend

---

## 📦 Última Versão

**`XCam V.2.0` — Maio de 2025**

- API completa com rotas REST + CSV
- Nova arquitetura de diretórios
- Deploy automatizado GitHub → Netlify
- Subdomínios dedicados ativos
- Página de status pública e funcional

---

## 📄 Documentação Técnica (por módulo)

### 🧭 API Gateway

```toml
[[redirects]]
  from = "/api/*"
  to = "https://xcam.aserio.workers.dev/:splat"
  status = 200
  force = true
```

### 📡 Worker API (Cloudflare)

- `/` → Lista paginada com filtros
- `/user/<username>?section=info,streamInfo`
- `/user/<username>/liveInfo`

🔗 [Documentação da API](https://api.xcam.gay)  
📁 [worker/index.js](./api/workers/index.js)

### 🖼️ OAuth2 com Imgur

- Auth URL: `https://api.imgur.com/oauth2/authorize`
- Callback: `/api/oauth/imgur/callback.html`

---

## 🧪 Exemplos de Uso

### JSON com filtros

```
GET https://api.xcam.gay/?country=br&tags=feet,latino
```

### Exportar CSV

```
GET https://api.xcam.gay/?format=csv&limit=50
```

### Info do modelo

```
GET https://api.xcam.gay/user/kleotwink
```

---

## 🧩 Deploy / CI-CD

- GitHub → Netlify: Web App + Status Page
- Cloudflare: Worker implantado manualmente
- DNS via GoDaddy apontado para `*.xcam.gay`

🔧 [Checklist de Deploy](./api/netlify/deploy-check.md)

---

## 📈 Status Monitor

Verifica:
- [xcam.gay](https://xcam.gay)
- [api.xcam.gay](https://api.xcam.gay)

📄 Página: [`status/status.html`](./status/status.html)

---

## 🧠 Créditos

**Autor:** Samuel Passamani  
**GitHub:** [github.com/SamuelPassamani](https://github.com/SamuelPassamani)  
**Domínio oficial:** [xcam.gay](https://xcam.gay)

> Projeto mantido com foco em performance, simplicidade e clareza.
