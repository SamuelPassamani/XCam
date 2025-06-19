/**
 * ================================================================
 * XCam API Worker - xcam-api/index.js (Refatorado com Proxy de Mídia)
 * ================================================================
 *
 * Descrição geral:
 * Este arquivo implementa o Worker principal da API XCam. Ele atua como um hub de dados inteligente
 * e como um proxy de redirecionamento para streams de mídia, resolvendo problemas de CORS/Referer
 * e abstraindo a complexidade das fontes de dados.
 *
 * Funcionalidades principais:
 * - Roteamento avançado para múltiplos endpoints, incluindo:
 * - `/?user={username}`: Agregação de dados de perfil, live e grafo.
 * - `/?rec={username}`: Proxy para gravações via Google Apps Script.
 * - `/stream/{username}`: NOVO! Proxy de redirecionamento para streams HLS.
 * - E outros para filtragem e dados específicos.
 * - Segurança de acesso com lista de domínios permitidos (CORS).
 * - Arquitetura modular e de alta performance com chamadas paralelas.
 *
 * Autor original: Samuel Passamani
 * Refatoração e Documentação: Equipe XCam & Gemini
 * Última atualização: 2025-06-19
 * ================================================================
 */

// ===============================
// === Conversor JSON para CSV ===
// ===============================
function jsonToCsv(items) {
  if (!items || items.length === 0) return "";
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
  "https://xcam-beta.netlify.app",
  "https://playhls.com"
];

// ====================================
// === Headers dinâmicos para CORS  ===
// ====================================
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
async function handleUserProfile(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/info`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4 Profile: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`Falha ao buscar perfil para ${username}:`, err.message);
    return { error: "Falha ao buscar perfil", details: err.message };
  }
}

// ====================================================
// === Handler: Busca informações de stream ao vivo  ===
// ====================================================
async function handleLiveInfo(username) {
  const apiUrl = `https://pt.cam4.com/rest/v1.0/profile/${username}/streamInfo`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: `https://pt.cam4.com/${username}`
      }
    });
    if (!response.ok) throw new Error(`Erro CAM4 StreamInfo: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`Falha ao buscar streamInfo para ${username}:`, err.message);
    return { error: "Falha ao buscar streamInfo", details: err.message };
  }
}

// =====================================================================
// === Handler: Busca e agrega todas as infos de um usuário específico ===
// =====================================================================
async function handleUserFullInfo(user, corsHeaders) {
  const limit = 300;
  let graphData = null;

  try {
    const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apollographql-client-name": "CAM4-client",
        "apollographql-client-version": "25.5.15-113220utc"
      },
      body: buildCam4Body(0, limit)
    });
    if (firstRes.ok) {
      const firstJson = await firstRes.json();
      const allItems = firstJson?.data?.broadcasts?.items || [];
      graphData = allItems.find(item => item.username === user) || null;
    } else {
      graphData = { error: "Erro inicial CAM4", details: firstRes.status };
    }
  } catch (err) {
    graphData = { error: "Falha na consulta GraphQL", details: err.message };
  }

  const [streamInfo, profileInfo] = await Promise.all([
    handleLiveInfo(user),
    handleUserProfile(user)
  ]);

  return new Response(JSON.stringify({
    user,
    graphData,
    streamInfo,
    profileInfo
  }, null, 2), {
    headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
  });
}

// =====================================================================
// === Handler: Proxy Google Apps Script para rec.json do usuário    ====
// =====================================================================
async function handleRecProxy(username, corsHeaders) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbz6cucO0SvdNSbnlFrUCR9nvh4FCDzMCp138iaRyiuDDWQ9JfPvFlmeevhHUtn0soc_IQ/exec?rec=" + encodeURIComponent(username);
  try {
    const response = await fetch(GAS_URL, {
      redirect: 'follow',
      headers: { 'accept': 'application/json' }
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": contentType, "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao consultar rec.json via GAS", details: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// ===============================================================
// === NOVO! Handler: Proxy de Redirecionamento para Streams HLS ===
// ===============================================================
/**
 * Implementa a lógica de proxy de redirecionamento.
 * Busca o streamInfo de um usuário e retorna uma resposta HTTP 302
 * com a URL real do stream no cabeçalho 'Location'.
 * @param {string} username - O nome de usuário para buscar o stream.
 * @param {string} type - O tipo de stream ('cdn' ou 'edge').
 * @returns {Promise<Response>}
 */
async function handleStreamProxy(username, type) {
  if (!username) {
    return new Response('Nome de usuário não especificado.', { status: 400 });
  }

  // 1. Busca as informações da live para obter a URL do stream.
  const streamInfo = await handleLiveInfo(username);

  if (streamInfo.error) {
    return new Response(JSON.stringify(streamInfo), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Determina qual URL usar (cdn ou edge).
  let targetUrl;
  if (type === 'cdn' && streamInfo.cdnURL) {
    targetUrl = streamInfo.cdnURL;
  } else if (type === 'edge' && streamInfo.edgeURL) {
    targetUrl = streamInfo.edgeURL;
  } else {
    // Fallback para a primeira URL disponível se o tipo especificado não existir.
    targetUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  }

  if (!targetUrl) {
    return new Response(`Nenhuma URL de stream encontrada para o usuário ${username}.`, { status: 404 });
  }

  // 3. Retorna um redirecionamento 302.
  // O navegador do cliente seguirá automaticamente para a `targetUrl`.
  return Response.redirect(targetUrl, 302);
}

// ===============================================================
// === Worker principal: roteamento, filtros, respostas e erros ===
// ===============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // ===============================================
      // === ROTEADOR PRINCIPAL: Ordem de Prioridade ===
      // ===============================================

      // ROTA 1 (NOVA): Proxy de Stream /stream/{username}
      const streamMatch = pathname.match(/^\/stream\/([a-zA-Z0-9_]+)\/?$/);
      if (streamMatch) {
        const username = streamMatch[1];
        const type = url.searchParams.get('type') || 'cdn'; // cdn como padrão
        return await handleStreamProxy(username, type);
      }
      
      // ROTA 2: Proxy para gravações /?rec={username}
      const recParam = url.searchParams.get("rec");
      if (recParam) {
        return await handleRecProxy(recParam, corsHeaders);
      }

      // ROTA 3: Agregação completa de dados /?user={username}
      const userParam = url.searchParams.get("user");
      if (userParam) {
        return await handleUserFullInfo(userParam, corsHeaders);
      }

      // ROTA 4: Endpoints REST legados /user/...
      if (pathname.startsWith("/user/")) {
        const parts = pathname.split("/").filter(Boolean);
        const username = parts[1];
        if (parts[2] === "liveInfo") { // /user/{username}/liveInfo
          const data = await handleLiveInfo(username);
          return new Response(JSON.stringify(data, null, 2), {
            headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        // /user/{username}
        const data = await handleUserProfile(username);
        return new Response(JSON.stringify(data, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // ROTA 5 (DEFAULT): Lista de transmissões públicas com filtros
      if (pathname === '/') {
        const format = url.searchParams.get("format") || "json";
        const pageNumber = parseInt(url.searchParams.get("page") || "1", 10) || 1;
        const pageSize = parseInt(url.searchParams.get("limit") || "30", 10);
        const genderFilter = url.searchParams.get("gender");
        const countryFilter = url.searchParams.get("country");
        const orientationFilter = url.searchParams.get("orientation");
        const tagsFilter = url.searchParams.get("tags")?.split(",").map(t => t.trim().toLowerCase()) || [];

        const limit = 300;
        const firstRes = await fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
          method: "POST",
          headers: { "content-type": "application/json", "apollographql-client-name": "CAM4-client", "apollographql-client-version": "25.5.15-113220utc" },
          body: buildCam4Body(0, limit)
        });

        if (!firstRes.ok) throw new Error(`Erro inicial CAM4: ${firstRes.status}`);
        const firstJson = await firstRes.json();
        const total = firstJson?.data?.broadcasts?.total || 0;
        const firstItems = firstJson?.data?.broadcasts?.items || [];
        
        const fetchTasks = [];
        for (let offset = limit; offset < total && offset < 5000; offset += limit) { // Adicionado um limite de segurança de 5000 itens
          fetchTasks.push(fetch("https://pt.cam4.com/graph?operation=getGenderPreferencePageData&ssr=false", {
            method: "POST",
            headers: { "content-type": "application/json", "apollographql-client-name": "CAM4-client", "apollographql-client-version": "25.5.15-113220utc" },
            body: buildCam4Body(offset, limit)
          }).then(r => r.ok ? r.json() : Promise.resolve({ data: { broadcasts: { items: [] } } })));
        }

        const results = await Promise.all(fetchTasks);
        let allItems = results.flatMap(r => r?.data?.broadcasts?.items || []).concat(firstItems);

        const sortedItems = allItems.sort((a, b) => (b.viewers || 0) - (a.viewers || 0)).map((item, index) => ({ XCamId: index + 1, ...item }));
        
        let filteredItems = sortedItems;
        if (genderFilter) filteredItems = filteredItems.filter(b => b.gender === genderFilter);
        if (countryFilter) filteredItems = filteredItems.filter(b => b.country?.toLowerCase() === countryFilter.toLowerCase());
        if (orientationFilter) filteredItems = filteredItems.filter(b => b.sexualOrientation?.toLowerCase() === orientationFilter.toLowerCase());
        if (tagsFilter.length > 0) filteredItems = filteredItems.filter(b => b.tags && b.tags.some(tag => tagsFilter.includes(tag.slug?.toLowerCase())));

        const totalFiltered = filteredItems.length;
        const totalPages = Math.ceil(totalFiltered / pageSize);
        const pagedItems = filteredItems.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        const responseData = { broadcasts: { total: totalFiltered, page: pageNumber, totalPages, items: pagedItems } };
        
        if (format.toLowerCase() === "csv") {
          return new Response(jsonToCsv(pagedItems), {
            headers: { ...corsHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="broadcasts_page${pageNumber}.csv"` }
          });
        }
        
        return new Response(JSON.stringify(responseData, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Rota não mapeada
      return new Response(JSON.stringify({ error: "Endpoint não encontrado." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      // Tratamento de erro global
      console.error("Erro fatal no Worker:", err);
      return new Response(JSON.stringify({ error: "Erro interno do servidor", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

/**
 * === Fim do código ===
 * Nota: Este Worker Cloudflare atua como middleware inteligente entre clientes e a API pública do CAM4, centralizando e enriquecendo a experiência de consumo de dados em diversos contextos da plataforma XCam.
 *
 * Funcionalidades principais:
 * - Permite consultas agregadas e customizadas por usuário, utilizando o parâmetro user na URL para retornar dados consolidados de múltiplas fontes (GraphQL/broadcasts, /streamInfo, /info).
 * - Oferece listagem dinâmica de transmissões ao vivo, com suporte a filtros avançados (gênero, país, orientação sexual, tags) e paginação eficiente.
 * - Suporta exportação de resultados em múltiplos formatos, incluindo JSON (default) e CSV, facilitando integrações com sistemas de BI, automações e análises externas.
 * - Implementa CORS dinâmico e restritivo, garantindo que apenas domínios autorizados possam consumir a API, elevando o nível de segurança e controle de acesso em ambientes distribuídos.
 * - Novo endpoint: ?rec={username} integrado ao Google Apps Script.
 * - Novo endpoint: /stream/{username} para proxy de redirecionamento de mídia HLS.
 *
 * Arquitetura e design:
 * - O código é altamente modular, com funções separadas para manipulação de requisições, construção de bodies GraphQL, tratamento de erros, filtros e formatação de respostas.
 * - Utiliza requisições assíncronas em paralelo sempre que possível, minimizando o tempo de resposta e otimizando recursos do ambiente serverless do Cloudflare Workers.
 * - Toda a lógica de tratamento de erros retorna mensagens claras e status HTTP apropriados, facilitando debugging e integração com sistemas externos.
 *
 * Boas práticas e escalabilidade:
 * - Estruturado segundo princípios de Clean Architecture, priorizando legibilidade, manutenibilidade e reuso.
 * - Fácil de estender para novos endpoints ou integrações futuras, bastando adicionar novos handlers ou filtros.
 * - Serve como blueprint para projetos que demandam orquestração de múltiplos serviços externos, controle de segurança via CORS e flexibilidade de formatos de resposta em ambientes serverless.
 *
 * Recomenda-se o uso deste worker como camada de API Gateway para produtos XCam e aplicações integradas, otimizando o consumo de dados do CAM4 de forma segura, performática e escalável.
 * === Fim do código ===
 */
