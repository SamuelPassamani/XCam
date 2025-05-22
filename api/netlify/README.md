# XCam API Gateway (Netlify Proxy)

Este diretório contém a configuração de roteamento da API do XCam via Netlify.

## Objetivo

Encaminhar todas as requisições feitas para `https://api.xcam.gay/` diretamente ao Worker da Cloudflare:
```
https://xcam.aserio.workers.dev/
```

## Estrutura

```
/api/netlify/
├── netlify.toml   # Configuração de proxy reverso
└── README.md      # Documentação técnica do gateway
```

## Deploy via Netlify

1. Conecte este repositório ao Netlify
2. Defina como publish directory: `api/netlify`
3. Configure o domínio personalizado: `api.xcam.gay`
4. Aponte no GoDaddy o CNAME de `api` para o domínio do Netlify

## Exemplo de requisição

```
GET https://api.xcam.gay/user/kleotwink
→ será roteado para:
GET https://xcam.aserio.workers.dev/user/kleotwink
```