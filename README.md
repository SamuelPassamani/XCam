
<p align="center">
  <img src="https://drive.xcam.gay/0:/logo2.png" alt="XCam Logo" width="300"/>
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
