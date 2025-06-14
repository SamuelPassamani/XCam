<p align="center">
  <img src="https://xcam.gay/src/logo.svg" alt="XCam Logo" width="300"/>
</p>

# 📦 XCam v2.0 – Plataforma Modular para Transmissões ao Vivo

XCam Web App: [![Netlify Status](https://api.netlify.com/api/v1/badges/ded26182-8393-4141-ab43-7ba4c85cc568/deploy-status)](https://app.netlify.com/projects/xcamgay/deploys)  
XCam Beta: [![Netlify Status](https://api.netlify.com/api/v1/badges/a275d640-eef5-44cd-bebd-dd4301f59428/deploy-status)](https://app.netlify.com/projects/xcam-beta/deploys)  
XCam API: [![Netlify Status](https://api.netlify.com/api/v1/badges/b3bf1a04-7e16-40b3-8972-676895751821/deploy-status)](https://app.netlify.com/projects/xcam-api/deploys)  
XCam Drive: [![Netlify Status](https://api.netlify.com/api/v1/badges/03b67a1e-db8a-493b-bfc7-d6f494ce2396/deploy-status)](https://app.netlify.com/projects/xcam-drive/deploys)  
XCam Status: [![Netlify Status](https://api.netlify.com/api/v1/badges/1672f90b-0206-4302-988e-de804cc49dc0/deploy-status)](https://app.netlify.com/projects/xcam-status/deploys)

---

## 📁 Estrutura Geral do Projeto

```
/XCam
├── dist/                 # Frontend modular e responsivo
│   ├── beta/             # Web App moderno com ES Modules
│   ├── cam/              # Player dedicado
│   ├── chat/             # Integração de chat
│   └── user/             # Perfil público
│
├── api/
│   ├── workers/          # Cloudflare Worker com API pública
│   ├── oauth/imgur/      # Upload de imagem via OAuth2 (Imgur)
│   └── netlify/          # Proxy reverso Netlify → Worker
│
├── drive/                # Repositório público de arquivos e mídia (CDN leve)
├── status/               # Página pública de status
├── README.md             # Documentação geral
└── CHANGELOG.md          # Histórico técnico de versões
```

---

## 🧠 Tecnologias e Arquitetura

- **Frontend:** HTML5, TailwindCSS (CDN), JavaScript (ESModules)
- **Back-end:** Cloudflare Workers (serverless)
- **API CAM4:** GraphQL com filtros dinâmicos
- **CORS e Cache:** controle completo via Worker
- **Internacionalização:** i18n.js e fallback multilíngue
- **Acessibilidade:** ARIA, navegação por teclado
- **Assets públicos:** via `/drive` com links diretos

---

## 🗂️ Armazenamento Público – `/drive`

A pasta `/drive` serve arquivos estáticos via `https://drive.xcam.gay/`. Pode conter:

- Logos, banners, vídeos e imagens públicas
- Exportações técnicas e arquivos de integração
- Recursos acessados dinamicamente no front-end

---

## 🚀 API Pública

Exemplo:
```
GET https://api.xcam.gay/?page=1&limit=30&format=json&gender=male
```

---

## 📌 Histórico de Versões

1. **v1.0** – Estrutura modular inicial
2. **v1.5** – Integração com API CAM4
3. **v2.0** – CORS fixado, cache controlado, API pública robusta

---

## 👨‍💻 Autor

Desenvolvido por **Samuel Passamani**  
📧 contato@xcam.gay  
🌐 Idealizador do XCam e da arquitetura escalável deste sistema.

---

## 🧩 Detalhamento Técnico Avançado

### 🔧 Cloudflare Worker (`index.js`)
- Estrutura modular e função principal `fetch()`
- Suporte a `GET`, `POST`, `OPTIONS` (preflight)
- Lista de domínios CORS autorizados controlada por `ALLOWED_ORIGINS`
- `Access-Control-Allow-Origin` dinâmico e sem duplicações
- `Cache-Control: no-store` para rotas que exigem dados atualizados
- `fetchTasks` paralelos para paginação GraphQL CAM4
- Ordenação local por número de viewers (`broadcasts.sort`)
- Filtros aplicados localmente: gênero, país, orientação, tags
- Respostas em JSON e CSV com headers apropriados
- Logging leve preparado para debug (comentado por padrão)

### 🌐 Netlify
- `netlify.toml` com redirecionamentos e headers customizados
- Deploy por branch (`xcam-main`, `xcam-beta`, `xcam-api`)
- HTTPS automático, cache estático controlado via headers
- Suporte a subdomínios independentes (Web App, Drive, Status)
- Ideal para integração com GitHub Actions e webhooks de build

### 🎯 Modularização do Front-end
- Separação por arquivos: `filters.js`, `main.js`, `carousel.js`, `i18n.js`, etc.
- `DOMContentLoaded` usado corretamente para iniciar componentes
- Elementos DOM verificados antes de manipulação (evita `null`)
- Grade de transmissões gerenciada via `broadcasts.js`
- Eventos desacoplados, via `addEventListener` e funções nomeadas
- Uso de `data-*` attributes para tradução dinâmica
- CSS mínimo, extensível com Tailwind CLI futuro
- Atualização da grade via `refreshBroadcasts()` e scroll infinito

### 🛡️ Segurança e Estabilidade
- CORS dinâmico com fallback seguro (`Access-Control-Allow-Origin: null`)
- Workers sem dependência externa
- Sem banco de dados (dados puxados da CAM4 via API)
- Nenhum dado sensível trafegado
- Estrutura limpa, sem uso de bibliotecas pesadas ou frameworks



---

## 🧪 Linguagens e Tecnologias Utilizadas

### 🖥️ HTML5
- Utilizado em todas as views do front-end
- Estrutura semântica com tags apropriadas: `<main>`, `<section>`, `<header>`, `<footer>`
- Uso extensivo de `data-*` para internacionalização e controle dinâmico de atributos
- Carregamento assíncrono de scripts com `type="module"`

### 🎨 CSS3 (via Tailwind CDN)
- Utilizado para estilização base do front-end (beta)
- `cdn.tailwindcss.com` para desenvolvimento ágil e leve
- Padrões responsivos baseados em `flex`, `grid`, `max-w`, `hidden`, `block`
- Estilo personalizado adicional via `style.css` local
- Preparado para futura migração ao PostCSS ou Tailwind CLI

### 📜 JavaScript (ES Modules)
- Código moderno estruturado com `import` e `export`
- Separação clara de responsabilidades por arquivo (UI, dados, filtros, internacionalização)
- Utilização de `async/await`, `fetch`, `try/catch`, `Map`, `Set`, e `localStorage`
- Compatível com navegadores modernos (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Integração com APIs externas como CAM4 GraphQL

### ☁️ JavaScript (Cloudflare Worker)
- Executado em edge computing (V8)
- Script `index.js` implementa `fetch()` com roteamento de endpoints
- Uso de `Request`, `Response`, `URL`, `Headers`, e `caches.default`
- Manipulação de JSON, CSV, e headers HTTP manualmente
- Otimizado para latência mínima, sem dependências externas

