# 📶 XCam Status Page

<img src="https://xcam.site.my.eu.org/0:/logo2.png" alt="XCam Logo" width="200" />

Página pública de monitoramento da infraestrutura principal da plataforma **XCam**, com foco em simplicidade, clareza visual e atualização automática.

---

## 🌐 URL Oficial

🔗 Acesse diretamente: [https://status.xcam.gay](https://status.xcam.gay)

---

## 📂 Estrutura de Diretório

```
/xcam/status/
├── index.html       ← Página principal (status em tempo real)
└── README.md        ← Este documento com informações técnicas
```

---

## 🔧 Serviços Monitorados

| Serviço              | URL                     | Status |
|----------------------|--------------------------|--------|
| XCam Web App         | https://xcam.gay         | 🟢 / 🔴 |
| XCam API (Worker)    | https://api.xcam.gay     | 🟢 / 🔴 |

- Verificação automática a cada 30 segundos
- Indicadores visuais:
  - 🟢 Online
  - 🔴 Offline

---

## 🧠 Como Funciona

- A verificação usa `fetch()` com `mode: 'no-cors'` para evitar erros CORS
- O resultado é atualizado no DOM com base no `response.ok`
- Atualização manual via botão “🔄 Atualizar”
- Estilo adaptado do [XCam Web App](https://github.com/SamuelPassamani/XCam) com tema escuro e responsividade

---

## 🧩 Recursos Técnicos

- ✔️ Página estática (sem backend)
- ✔️ Atualização assíncrona com `async/await`
- ✔️ Layout com `flexbox`, responsivo para desktop e mobile
- ✔️ Compatível com navegadores modernos
- ✔️ HTML + CSS + JS organizados em único arquivo

---

## 🛠 Instalação e Deploy (Netlify)

1. Clone o repositório [SamuelPassamani/XCam](https://github.com/SamuelPassamani/XCam)
2. Acesse [https://app.netlify.com](https://app.netlify.com) e crie novo projeto
3. Configure:
   - **Base directory**: (deixe vazio)
   - **Publish directory**: `status`
   - **Build command**: (vazio)
4. Aponte o DNS do subdomínio `status.xcam.gay` no GoDaddy para o domínio Netlify (`*.netlify.app`) via CNAME

---

## 📘 Documentação Técnica da Página

- Verifica status do Web App e da API XCam
- Atualização a cada 30 segundos com fallback manual
- Exibe status com ícones coloridos (🟢/🔴)
- Layout moderno, minimalista e de alta legibilidade
- Código limpo com separação clara entre estrutura, estilo e lógica
- Projetado para manutenção fácil e futura expansão
- Totalmente estático, ideal para hospedagem gratuita
- Compatível com qualquer CDN ou host (Netlify, GitHub Pages, etc.)
- Reutilizável: pode ser adaptada para monitorar outros serviços

---

## 📌 Licença

Distribuído sob licença MIT – veja `LICENSE`.

---

📊 Desenvolvido com foco em monitoramento público, simplicidade e clareza.