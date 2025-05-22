# 📶 XCam Status Page — `https://status.xcam.gay`

Esta página exibe em tempo real o status de disponibilidade da infraestrutura principal da plataforma **XCam**: o frontend e a API pública.

---

## 📌 Subdomínio: `status.xcam.gay`

- Este projeto pode ser hospedado separadamente via **Netlify**
- O subdomínio deve ser configurado no painel DNS do **GoDaddy**
- CNAME → `seu-projeto-status.netlify.app`

---

## 📊 Verificações realizadas

| Serviço monitorado     | URL alvo                       | Intervalo |
|------------------------|--------------------------------|-----------|
| 🌐 Aplicativo Web      | https://xcam.gay               | 60s       |
| 🔌 API Pública (Worker)| https://api.xcam.gay           | 60s       |

---

## 🧪 Como funciona

- O arquivo `status.html` utiliza JavaScript nativo para realizar `fetch()` em cada serviço monitorado
- Exibe uma bolinha verde (🟢) para online ou vermelha (🔴) para offline
- O layout segue o design visual do frontend `XCam Web App`

---

## 📁 Estrutura do diretório

```
/status/
├── status.html     ← Página de status responsiva e dinâmica
└── README.md       ← Este arquivo com instruções técnicas e de deploy
```

---

## 🚀 Como fazer deploy no Netlify

1. Crie um novo site em [https://app.netlify.com](https://app.netlify.com)
2. Escolha o repositório do GitHub `SamuelPassamani/XCam`
3. Defina:
   - **Build command**: _(deixe em branco)_
   - **Publish directory**: `status`
4. Após o deploy, vá em `Domain Settings` e adicione o subdomínio: `status.xcam.gay`
5. No **GoDaddy**, aponte o DNS `CNAME` de `status.xcam.gay` para `nomedosite.netlify.app`

---

## ✅ Status e Atualização

- A página se atualiza automaticamente a cada minuto (`setInterval`)
- Um botão “Atualizar” também força a verificação manual

---

🛠 Desenvolvido com foco em monitoramento leve, sem backend, ideal para status page pública.