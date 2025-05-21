# XCam V.19 — Documentação Técnica da API

A versão 19 da API XCam oferece um endpoint REST otimizado para consulta de transmissões ao vivo. Esta documentação descreve os parâmetros disponíveis, exemplos de uso e respostas esperadas.

---

## 📡 Endpoint Principal

```
GET /
```

Retorna uma lista paginada de transmissões ao vivo, com suporte a múltiplos filtros e formatações.

---

## 🔎 Parâmetros de Query

| Parâmetro    | Tipo     | Obrigatório | Descrição                                                                 |
| ------------ | -------- | ----------- | ------------------------------------------------------------------------- |
| `page`       | Inteiro  | Não         | Número da página (padrão: 1)                                              |
| `limit`      | Inteiro  | Não         | Quantidade de resultados por página (padrão: 30, máximo interno: 300)     |
| `format`     | String   | Não         | Formato da resposta: `json` ou `csv` (padrão: `json`)                     |
| `gender`     | String   | Não         | Filtrar por gênero: `male`, `female`, `trans`, `couple`                   |
| `country`    | String   | Não         | Filtrar por país (código ISO 3166-1 alpha-2, ex: `br`, `us`, `de`)        |
| `minViewers` | Inteiro  | Não         | Retornar apenas transmissões com pelo menos esse número de espectadores   |
| `tags`       | String[] | Não         | Lista separada por vírgula de slugs de tags (ex: `feet,latina,big-ass`)   |

---

## 🧪 Exemplos de Uso

### Filtros com JSON:

```
GET https://xcam.moviele.workers.dev/v1/?gender=female&country=br&minViewers=100&tags=latina,feet&page=1&limit=10
```

### Top 50 transmissões em formato CSV:

```
GET https://xcam.moviele.workers.dev/v1/?format=csv&limit=50
```

---

## 📦 Resposta (JSON)

```json
{
  "broadcasts": {
    "total": 127,
    "page": 1,
    "totalPages": 5,
    "items": [
      {
        "XCamId": 1,
        "id": "abc123",
        "username": "model_brazil",
        "gender": "female",
        "country": "br",
        "sexualOrientation": "straight",
        "viewers": 325,
        "broadcastType": "live",
        "profileImageURL": "https://...",
        "preview": {
          "src": "https://...",
          "poster": "https://..."
        },
        "tags": [
          {"name": "Latina", "slug": "latina"},
          {"name": "Feet", "slug": "feet"}
        ]
      }
    ]
  },
  "filters": {
    "gender": "female",
    "country": "br",
    "minViewers": 100,
    "tags": ["latina", "feet"]
  }
}
```

---

## 📌 Notas Técnicas

- O filtro `tags` considera apenas os slugs das tags (ex: `big-ass`, `latina`).
- Todos os filtros são opcionais e podem ser combinados livremente.
- A paginação é controlada via `limit` e `page`.
- A exportação CSV é recomendada para uso em planilhas ou ferramentas de BI.

---

## 🔐 Segurança e CORS

- Apenas domínios definidos em `ALLOWED_ORIGINS` têm permissão para requisições diretas via navegador.
- O Worker simula navegação real para contornar bloqueios por WAF ao acessar a API GraphQL do CAM4.

---

## 🚀 Roadmap — XCam V.20+

- Cache inteligente com TTL customizável
- Nova rota `/featured` para destaques
- Autocompletar por `username`
- Busca textual em tags ou na descrição do perfil
- Novo filtro por `sexualOrientation`

---

> Documentação gerada automaticamente com base no código-fonte da versão XCam V.19