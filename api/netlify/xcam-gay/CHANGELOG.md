# 📦 XCam API – Changelog

Registro de versões e alterações relevantes da API XCam.

---

## 🔖 Versão 2.0 – [2025-05-22]

### ✨ Novidades
- Nova estrutura de pastas organizadas:
  - `/api/netlify`: proxy reverso via Netlify para o Worker Cloudflare
  - `/api/oauth/imgur`: integração com OAuth2 do Imgur (auth.js + callback)
  - `/api/workers`: código do Worker principal (`index.js`)
- Redirecionamento global configurado (`netlify.toml`) com `status = 200` e `:splat`
- Documentações atualizadas: `README.md`, `deploy-check.md`
- Suporte completo à API:
  - `/` com paginação, CSV e filtros
  - `/user/<username>?section=info,streamInfo`
  - `/user/<username>/liveInfo`
- Compatibilidade com domínio personalizado: `https://api.xcam.gay`

### 🔧 Infraestrutura
- Deploy automático via Netlify
- CNAME configurado no GoDaddy
- Zero build process: publicação direta

---

## 📌 Observações
- Nenhum dado sensível incluso no repositório
- Código modular, documentado e pronto para escalar

---

🎉 *API XCam V.2.0 oficialmente implantada com fluxo completo de CI/CD e documentação técnica.*