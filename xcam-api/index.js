/**
 * ================================================================
 * XCam API Worker - xcam-api/index.js
 * ================================================================
 * 
 * Descrição geral:
 * Este arquivo implementa o Worker principal da API XCam utilizando Cloudflare Workers para orquestrar, filtrar, transformar e servir dados públicos da plataforma CAM4 de forma flexível e segura.
 * 
 * Funcionalidades principais:
 * - Integração direta com múltiplos endpoints públicos do CAM4, reunindo dados de transmissões ao vivo (GraphQL), informações de stream e detalhes de perfil.
 * - Endpoints dinâmicos e inteligentes: permite consultas agregadas por usuário (?user=USERNAME), listagens filtradas, paginação e exportação em formatos JSON ou CSV.
 * - Implementa CORS dinâmico, restringindo requisições a domínios autorizados e reforçando a segurança de acesso.
 * - Otimização de desempenho: uso de fetch assíncrono paralelo para múltiplas fontes, minimizando latência e garantindo respostas rápidas.
 * - Modularidade e clareza: arquitetura separando responsabilidades em funções puras para fetch, filtros, formatação e tratamento de erros, seguindo Clean Architecture.
 *
 * Público-alvo:
 * - Sistemas e aplicações que demandam integração com dados públicos do CAM4, incluindo produtos da suíte XCam, dashboards, automações, análises e integrações externas.
 * 
 * Manutenção e escalabilidade:
 * - Estruturado para fácil extensão/modificação, permitindo inclusão de novos filtros, endpoints e integrações com mínimo impacto.
 * - Código documentado, com tratamento rigoroso de erros, mensagens claras e status HTTP apropriados para cada cenário.
 * 
 * Autor original: Samuel Passamani
 * Manutenção e evolução: Equipe XCam
 * Última atualização: 2025-06-09
 * ================================================================
 */

// ===============================
// === Conversor JSON para CSV ===
// ===============================
/**
 * Converte um array de objetos JSON para uma string CSV.
 * - Adiciona aspas duplas em strings que contenham vírgulas ou aspas.
 * - Garante escape correto de aspas duplas.
 * - Utilizado quando o parâmetro format=csv é informado na URL.
 * @param {Array<Object>} items - Lista de objetos para conversão.
 * @returns {string} CSV gerado.
 */
function jsonToCsv(items) {
  if (!items.length) return "";
  const headers = Object.keys(items[0]);
  const csvRows = items.map(item =>
    headers.map(h => {
      let val = item[h];
      if (val == null) val = "";
      else if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",")
  );
  return [headers.join(","), ...csvRows].join("\n");
}

// ========================================
// === Lista de domínios permitidos CORS ===
// ========================================
/**
 * Lista estática de domínios autorizados para requisições CORS.
 * Inclui domínios oficiais XCam, subdomínios e ambientes de testes.
 * Atualizar conforme contexto de deploy.
 */
const ALLOWED_ORIGINS = [
  "https://xcam.gay",
  "https://beta.xcam.gay",
  "https://player.xcam.gay",
  "https://db.xcam.gay",
  "https://modal.xcam.gay",
  "https://live.xcam.gay",
  "https://status.xcam.gay",
  "https://drive.xcam.gay",
  "https://samuelpassamani.github.io",
  "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev",
  "https://script.google.com",
  "https://script.googleusercontent.com",
  "https://web-sandbox.oaiusercontent.com",
  "https://persistent.oaistatic.com",
  "https://openai.com",
  "https://ab.chatgpt.com",
  "https://chatgpt.com",
  "https://cdn.oaistatic.com",
  "https://codepen.io",
  "https://cdpn.io",
  "https://cpwebassets.codepen.io",
  "https://netlify.app",
  "https://xcamgay.netlify.app",
  "https://xcam-modal.netlify.app",
  "https://xcam-db.netlify.app",
  "https://xcam-drive.netlify.app",
  "https://xcam-status.netlify.app",
  "https://xcam-player.netlify.app",
  "https://xcam-beta.netlify.app"
];

// ====================================
// === Headers dinâmicos para CORS  ===
// ====================================
/**
 * Gera headers CORS dinâmicos conforme origem da requisição.
 * - Permite apenas domínios da lista ALLOWED_ORIGINS.
 * - Inclui headers padrão para métodos e content-type.
 * @param {string} origin - Origem da requisição.
 * @returns {Object} Headers apropriados para resposta CORS.
 */
function getCorsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// =========================================================
// === Monta corpo GraphQL para listagem de transmissões ===
// =========================================================
/**
 * Gera o corpo da requisição GraphQL para buscar transmissões públicas do CAM4.
 * - Usa filtro de gênero "male" e ordena por "trending".
 * - Parâmetros offset e limit para paginação.
 * @param {number} offset - Offset/página inicial.
 * @param {number} limit - Limite máximo de resultados.
 * @returns {string} Corpo da requisição em formato JSON.
 */
function buildCam4Body(offset, limit) {
  return JSON.stringify({
    operationName: "getGenderPreferencePageData",
    variables: {
      input: {
        orderBy: "trending",
        filters: [],
        gender: "male",
        cursor: { first: limit, offset }
      }
    },
    query: `
      query getGenderPreferencePageData($input: BroadcastsInput) {
        broadcasts(input: $input) {
          total
          items {
            id
            username
            country
            sexualOrientation
            profileImageURL
            preview {
              src
              poster
            }
            viewers
            broadcastType
            gender
            tags {
              name
              slug
            }
          }
        }
      }
    `
  });
}

// ==================================================
// === Handler: Busca informações de perfil público ===
// ==================================================
/**
 * Realiza fetch dos dados de perfil público do usuário no CAM4.
 * Endpoint: /rest/v1.0/profile/${username}/info
 * @param {string} username - Nome do usuário CAM4.
 * @param {Object} corsHeaders - Headers CORS gerados dinamicamente.
 * @returns {Object} Dados de perfil ou erro.
 */
async function handleUserProfile(username, corsHeaders) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    return { error: "Falha ao buscar perfil", details: err.message };
  }
}

// ====================================================
// === Handler: Busca informações de stream ao vivo  ===
// ====================================================
/**
 * Realiza fetch das informações de stream ao vivo do usuário.
 * Endpoint: /rest/v1.0/profile/${username}/streamInfo
 * @param {string} username - Nome do usuário CAM4.
 * @param {Object} corsHeaders - Headers CORS.
 * @returns {Object} Dados de stream ou erro.
 */
async function handleLiveInfo(username, corsHeaders) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    return { error: "Falha ao buscar streamInfo", details: err.message };
  }
}

// =====================================================================
// === Handler: Busca e agrega todas as infos de um usuário específico ===
// =====================================================================
/**
 * Busca informações completas de um usuário a partir do parâmetro de query user.
 * Executa três requisições:
 *   1. Busca de transmissões públicas (GraphQL) e filtra pelo username.
 *   2. Busca detalhes de stream ao vivo.
 *   3. Busca detalhes de perfil público.
 * Agrega as três respostas em um único JSON.
 * @param {string} user - Nome do usuário a ser consultado.
 * @param {Object} corsHeaders - Headers CORS.
 * @returns {Response} Resposta HTTP JSON com dados agregados.
 */
async function handleUserFullInfo(user, corsHeaders) {
  const limit = 300;
  // 1. Busca inicial dos broadcasts (transmissões ao vivo)
  const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "apollographql-client-name": "CAM4-client",
      "apollographql-client-version": "25.5.15-113220utc"
    },
    body: buildCam4Body(0, limit)
  });

  // Validação da resposta da API CAM4
  if (!firstRes.ok) {
    return new Response(JSON.stringify({ error: "Erro inicial CAM4", details: firstRes.status }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const firstJson = await firstRes.json();
  const allItems = firstJson?.data?.broadcasts?.items || [];

  // 2. Filtro pelo username exato (case-sensitive)
  const graphData = allItems.find(item => item.username === user);

  if (!graphData) {
    return new Response(JSON.stringify({ error: "Usuário não encontrado no CAM4 (broadcasts)", user }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // 3. Busca paralela dos detalhes de stream e perfil
  const [streamInfo, profileInfo] = await Promise.all([
    handleLiveInfo(user, corsHeaders),
    handleUserProfile(user, corsHeaders)
  ]);

  // 4. Monta resposta única com todas as informações
  return new Response(JSON.stringify({
    user,
    graphData,    // Dados públicos do usuário (GraphQL)
    streamInfo,   // Dados de stream ao vivo
    profileInfo   // Detalhes do perfil
  }, null, 2), {
    headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
  });
}

// ===============================================================
// === Worker principal: roteamento, filtros, respostas e erros ===
// ===============================================================
/**
 * Worker principal responsável por:
 * - Tratar requisições OPTIONS (CORS preflight)
 * - Roteamento dos endpoints dinâmicos:
 *    - /?user=USERNAME: agrega dados de 3 fontes (GraphQL, streamInfo, info)
 *    - /user/:username/liveInfo: retorna apenas dados de transmissão ao vivo
 *    - /user/:username: retorna apenas dados de perfil público
 *    - Demais rotas: retorna lista paginada/filtrada de transmissões públicas
 * - Tratamento de erros e formatação de respostas
 * - Suporte a exportação em CSV via query param (format=csv)
 */
export default {
  async fetch(request, env, ctx) {
    // =========================
    // === Preparação inicial===
    // =========================
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    // =========================
    // === Preflight CORS    ===
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // =============================================
    // === Novo endpoint: consulta agregada ?user ===
    // =============================================
    const userParam = url.searchParams.get("user");
    if (userParam) {
      // Retorna dados agregados (GraphQL, streamInfo, info)
      return await handleUserFullInfo(userParam, corsHeaders);
    }

    // ==========================================================
    // === Endpoints REST compatíveis com padrão antigo /user/ ===
    // ==========================================================
    if (pathname.startsWith("/user/") && pathname.endsWith("/liveInfo")) {
      // Exemplo: /user/NOME/liveInfo
      const parts = pathname.split("/").filter(Boolean);
      return new Response(JSON.stringify(await handleLiveInfo(parts[1], corsHeaders), null, 2), {
        headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (pathname.startsWith("/user/")) {
      // Exemplo: /user/NOME
      const username = pathname.split("/")[2];
      return new Response(JSON.stringify(await handleUserProfile(username, corsHeaders), null, 2), {
        headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ===========================================================
    // === Lista de transmissões públicas com filtros e paginação =
    // ===========================================================
    try {
      // Extração dos filtros de query string
      const format = url.searchParams.get("format") || "json";
      const pageNumber = parseInt(url.searchParams.get("page") || "1", 10) || 1;
      const pageSize = parseInt(url.searchParams.get("limit") || "30", 10);

      // Filtros opcionais: gender, country, orientation, tags
      const genderFilter = url.searchParams.get("gender");
      const countryFilter = url.searchParams.get("country");
      const orientationFilter = url.searchParams.get("orientation");
      const tagsFilter = url.searchParams.get("tags")?.split(",").map(t => t.trim().toLowerCase()) || [];

      // ===============================
      // === Busca principal GraphQL ===
      // ===============================
      const limit = 300;
      const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "apollographql-client-name": "CAM4-client",
          "apollographql-client-version": "25.5.15-113220utc"
        },
        body: buildCam4Body(0, limit)
      });

      if (!firstRes.ok) throw new Error(`Erro inicial CAM4: ${firstRes.status}`);
      const firstJson = await firstRes.json();
      const total = firstJson?.data?.broadcasts?.total || 0;
      const firstItems = firstJson?.data?.broadcasts?.items || [];

      // Busca adicional para paginação além do primeiro batch (se necessário)
      const fetchTasks = [];
      for (let offset = limit; offset < total; offset += limit) {
        fetchTasks.push(fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "apollographql-client-name": "CAM4-client",
            "apollographql-client-version": "25.5.15-113220utc"
          },
          body: buildCam4Body(offset, limit)
        }).then(r => r.json()));
      }

      // Aguarda todas as páginas
      const results = await Promise.all(fetchTasks);
      const allItems = results.flatMap(r => r?.data?.broadcasts?.items || []).concat(firstItems);

      // Ordena por número de viewers e adiciona identificador sequencial
      const sortedItems = allItems
        .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
        .map((item, index) => ({ XCamId: index + 1, ...item }));

      // Aplica os filtros locais informados na query string
      let filteredItems = sortedItems;
      if (genderFilter) {
        filteredItems = filteredItems.filter(b => b.gender === genderFilter);
      }
      if (countryFilter) {
        filteredItems = filteredItems.filter(b => b.country?.toLowerCase() === countryFilter.toLowerCase());
      }
      if (orientationFilter) {
        filteredItems = filteredItems.filter(b => b.sexualOrientation?.toLowerCase() === orientationFilter.toLowerCase());
      }
      if (tagsFilter.length > 0) {
        filteredItems = filteredItems.filter(b =>
          b.tags && b.tags.some(tag => tagsFilter.includes(tag.slug?.toLowerCase()))
        );
      }

      // Paginação dos resultados filtrados
      const totalFiltered = filteredItems.length;
      const totalPages = Math.ceil(totalFiltered / pageSize);
      const pagedItems = filteredItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      // Monta objeto final de resposta
      const responseData = {
        broadcasts: {
          total: totalFiltered,
          page: pageNumber,
          totalPages,
          items: pagedItems
        }
      };

      // Responde em CSV ou JSON conforme formato solicitado
      const finalResponse = format.toLowerCase() === "csv"
        ? new Response(jsonToCsv(pagedItems), {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="broadcasts_page${pageNumber}.csv"`
            }
          })
        : new Response(JSON.stringify(responseData, null, 2), {
            headers: { "Cache-Control": "no-store",  ...corsHeaders, "Content-Type": "application/json" }
          });
      return finalResponse;

    } catch (err) {
      // Tratamento global de erros para falhas de fetch, parsing ou lógica.
      return new Response(JSON.stringify({ error: "Erro ao obter dados", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
// === Fim do código ===
// Nota: Este Worker Cloudflare atua como middleware inteligente entre clientes e a API pública do CAM4, centralizando e enriquecendo a experiência de consumo de dados em diversos contextos da plataforma XCam.
//
// Funcionalidades principais:
// - Permite consultas agregadas e customizadas por usuário, utilizando o parâmetro user na URL para retornar dados consolidados de múltiplas fontes (GraphQL/broadcasts, /streamInfo, /info).
// - Oferece listagem dinâmica de transmissões ao vivo, com suporte a filtros avançados (gênero, país, orientação sexual, tags) e paginação eficiente.
// - Suporta exportação de resultados em múltiplos formatos, incluindo JSON (default) e CSV, facilitando integrações com sistemas de BI, automações e análises externas.
// - Implementa CORS dinâmico e restritivo, garantindo que apenas domínios autorizados possam consumir a API, elevando o nível de segurança e controle de acesso em ambientes distribuídos.
//
// Arquitetura e design:
// - O código é altamente modular, com funções separadas para manipulação de requisições, construção de bodies GraphQL, tratamento de erros, filtros e formatação de respostas.
// - Utiliza requisições assíncronas em paralelo sempre que possível, minimizando o tempo de resposta e otimizando recursos do ambiente serverless do Cloudflare Workers.
// - Toda a lógica de tratamento de erros retorna mensagens claras e status HTTP apropriados, facilitando debugging e integração com sistemas externos.
//
// Boas práticas e escalabilidade:
// - Estruturado segundo princípios de Clean Architecture, priorizando legibilidade, manutenibilidade e reuso.
// - Fácil de estender para novos endpoints ou integrações futuras, bastando adicionar novos handlers ou filtros.
// - Serve como blueprint para projetos que demandam orquestração de múltiplos serviços externos, controle de segurança via CORS e flexibilidade de formatos de resposta em ambientes serverless.
//
// Recomenda-se o uso deste worker como camada de API Gateway para produtos XCam e aplicações integradas, otimizando o consumo de dados do CAM4 de forma segura, performática e escalável.
// === Fim do código ===