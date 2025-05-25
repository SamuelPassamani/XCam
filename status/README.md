# 📶 XCam Status V2.1

<img src="https://drive.xcam.gay/0:/logo2.png" alt="XCam Logo" width="180"/>

**XCam Status V2.1** é a central pública de monitoramento da infraestrutura da plataforma **XCam**. Projetado com foco em clareza, confiabilidade e identidade visual, ele oferece um panorama em tempo real do estado operacional dos principais serviços que compõem o ecossistema XCam.

---

## 🌐 URL Oficial

🔗 [https://status.xcam.gay](https://status.xcam.gay)

---

## ✨ Visão Geral

Esta ferramenta foi desenvolvida para:
- ✅ Monitorar os principais serviços do XCam de forma contínua e assíncrona.
- ✅ Exibir o status em tempo real, atualizando automaticamente a cada 30 segundos.
- ✅ Apresentar tudo com uma interface alinhada ao design do **XCam Beta App**, responsiva e acessível.

---

## 📊 Serviços Monitorados

| Serviço              | URL                          | Função Principal                                      |
|----------------------|-------------------------------|-------------------------------------------------------|
| Web App              | https://xcam.gay              | Domínio principal e interface pública do XCam         |
| Beta App             | https://beta.xcam.gay         | Interface experimental com recursos em testes         |
| API (Worker)         | https://api.xcam.gay          | Backend de dados da plataforma                        |
| Player               | https://player.xcam.gay       | Sistema de exibição e controle das transmissões       |
| Drive                | https://drive.xcam.gay        | Armazenamento distribuído de imagens e arquivos       |
| Status               | https://status.xcam.gay       | Esta própria página de status                         |

---

## 🧠 Como Funciona

- A cada 30 segundos, o script executa `fetch(..., { mode: 'no-cors' })` para testar a disponibilidade de cada endpoint.
- Cada bloco do painel responde dinamicamente com um badge:
  - 🟢 Online
  - 🔴 Offline
- Se ocorrer erro no `fetch()`, o serviço é marcado como indisponível.
- Utiliza `setInterval`, `async/await` e manipulação direta do DOM.
- Os elementos são animados com `fade-in`, `slide-up` e tooltips.

---

## 💡 Funcionalidades Visuais

- Layout modular baseado na estética do [XCam Beta App](https://beta.xcam.gay)
- Totalmente responsivo com `flexbox` e grade fluida
- Indicadores visuais de estado (bolinha colorida + status textual)
- Tooltips explicativos ao passar o mouse
- Compatível com dark mode

---

## 🚀 Como Publicar (Netlify)

### Método 1: Upload Manual
1. Acesse [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Solte `index.html` e `README.md`
3. O site estará online automaticamente

### Método 2: GitHub + CI/CD (Recomendado)
1. Crie um repositório (ex: `xcam-status`)
2. Faça `git push` com os arquivos
3. Conecte no Netlify com `New Site from Git`
4. Configure:
   - **Build Command**: *(vazio, é estático)*
   - **Publish Directory**: `.`

---

## 📁 Estrutura do Projeto

```
xcam/status/
├── index.html     ← Página principal de status
└── README.md      ← Documentação e instruções
```

---

## 📦 Tecnologias Utilizadas

- HTML5 + CSS3 + JavaScript (sem frameworks)
- Fetch API (modo silencioso para bypass de CORS)
- Layout adaptável (responsivo mobile-first)
- Animações com `@keyframes` e utilitários visuais
- Deploy automático com Netlify (CI opcional)

---

## 🛡 Segurança e Integridade

- O status é lido diretamente via HEAD requests sem autenticação
- Nenhum dado do usuário é coletado
- 100% frontend — sem backend, cookies ou rastreadores

---

## 🧾 Licença

Este projeto está sob a Licença MIT. Livre para uso, modificação e distribuição.

---

Feito com 🖤 por XCam — 2025