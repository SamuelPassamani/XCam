/**
 * ============================================================================
 * XCam API Worker - index.js
 * ============================================================================
 * 
 * Descrição:
 * Este Worker é o backend principal da XCam API, fornecendo roteamento RESTful
 * e proxy seguro para dados públicos, streams de mídia HLS e geração de poster
 * seguro (frame de vídeo HLS) para players. Suporta recursividade em playlists
 * HLS, procura segmentos de mídia em múltiplos formatos (.ts, .aac, .m4s, .mp4)
 * e resolve problemas de CORS, Referer e Same-Origin Policy.
 * 
 * Funcionalidades principais:
 * - Roteamento RESTful e versionado para múltiplos endpoints.
 * - Proxy de redirecionamento para streams HLS (com 302).
 * - Proxy de conteúdo para segmento de mídia HLS, permitindo captura segura de poster via canvas.
 * - Integração com Google Apps Script para gravações.
 * - Consolidação de dados públicos agregados por usuário.
 * - Listagem dinâmica filtrável de transmissões públicas.
 * - Segurança via CORS dinâmico e restritivo.
 * - Estrutura modular, fácil de manter e expandir.
 * 
 * Autor: Samuel Passamani | Equipe XCam & Gemini
 * Última atualização: 2025-06-20
 * ============================================================================
 */

// ==========================
// == Conversor JSON para CSV ==
// ==========================
/**
 * Converte um array de objetos em CSV para exportação.
 * Retorna string vazia se array for vazio.
 */
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

// ===========================================
// == Lista de domínios permitidos para CORS ==
// ===========================================
const ALLOWED_ORIGINS = [
  "https://xcam.gay", "https://beta.xcam.gay", "https://player.xcam.gay",
  "https://db.xcam.gay", "https://modal.xcam.gay", "https://live.xcam.gay",
  "https://status.xcam.gay", "https://drive.xcam.gay",
  "https://samuelpassamani.github.io", "https://xcam-app.aserio.workers.dev",
  "https://xcam-api.aserio.workers.dev", "https://script.google.com",
  "https://script.googleusercontent.com", "https://web-sandbox.oaiusercontent.com",
  "https://persistent.oaistatic.com", "https://openai.com",
  "https://ab.chatgpt.com", "https://chatgpt.com", "https://cdn.oaistatic.com",
  "https://codepen.io", "https://cdpn.io", "https://cpwebassets.codepen.io",
  "https://netlify.app", "https://xcamgay.netlify.app", "https://xcam-modal.netlify.app",
  "https://xcam-db.netlify.app", "https://xcam-drive.netlify.app",
  "https://xcam-status.netlify.app", "https://xcam-player.netlify.app",
  "https://xcam-beta.netlify.app", "https://playhls.com"
];

// =====================================
// == Função utilitária para CORS ==
// =====================================
/**
 * Retorna headers dinâmicos de CORS de acordo com o Origin.
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

// ========================================================
// == Função para montar body do GraphQL da listagem CAM4 ==
// ========================================================
/**
 * Monta o payload para consulta GraphQL de transmissões públicas.
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
            preview { src poster }
            viewers
            broadcastType
            gender
            tags { name slug }
          }
        }
      }
    `
  });
}

// ====================================================
// == Handler: Busca informações públicas do perfil ==
// ====================================================
/**
 * Busca informações públicas de perfil do usuário via REST CAM4.
 */
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

// ===========================================================
// == Handler: Busca informações de stream ao vivo (live)  ==
// ===========================================================
/**
 * Busca informações da transmissão ao vivo do usuário via REST CAM4.
 */
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

// ===========================================================================
// == Handler: Agrega dados públicos consolidados de um usuário (multi-origem)
// ===========================================================================
/**
 * Busca dados GraphQL, liveInfo e profileInfo do usuário e retorna tudo junto.
 */
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

// ===============================================================================
// == Handler: Proxy Google Apps Script para gravações (rec.json do usuário)    ==
// ===============================================================================
/**
 * Encaminha requisição para um Google Apps Script que retorna gravações do usuário.
 */
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

// ===========================================================================
// == Handler: Proxy de redirecionamento para Streams HLS (302 Location)    ==
// ===========================================================================
/**
 * Proxy de redirecionamento seguro (302) para o HLS do usuário, preservando Referer.
 * Usado para players que não precisam acessar o conteúdo do vídeo via JavaScript.
 */
async function handleStreamProxy(username, type) {
  if (!username) {
    return new Response('Nome de usuário não especificado.', { status: 400 });
  }
  const streamInfo = await handleLiveInfo(username);
  if (streamInfo.error) {
    return new Response(JSON.stringify(streamInfo), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  let targetUrl;
  if (type === 'cdn' && streamInfo.cdnURL) {
    targetUrl = streamInfo.cdnURL;
  } else if (type === 'edge' && streamInfo.edgeURL) {
    targetUrl = streamInfo.edgeURL;
  } else {
    targetUrl = streamInfo.cdnURL || streamInfo.edgeURL;
  }
  if (!targetUrl) {
    return new Response(`Nenhuma URL de stream encontrada para o usuário ${username}.`, { status: 404 });
  }
  return Response.redirect(targetUrl, 302);
}

// ==========================================================================================
// == Função recursiva: busca o primeiro segmento de mídia em playlist HLS e sub-playlists ==
// ==========================================================================================
/**
 * Busca o primeiro segmento de mídia (ts, aac, m4s, mp4) em um manifesto HLS, 
 * seguindo sub-playlists se necessário (recursão limitada).
 * 
 * @param {string} m3u8Url - URL do manifesto HLS (.m3u8)
 * @param {string} username - Nome do usuário para referer
 * @param {number} maxDepth - Profundidade máxima de recursão
 * @returns {Promise<string|null>} - URL do segmento de mídia ou null
 */
async function findFirstMediaSegment(m3u8Url, username, maxDepth = 8) {
  if (maxDepth < 0) return null;
  const res = await fetch(m3u8Url, { headers: { referer: `https://pt.cam4.com/${username}` } });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

  // 1. Procura segmento de mídia comum (ts, aac, m4s, mp4)
  const seg = lines.find(l => /\.(ts|aac|m4s|mp4)(\?|$)/i.test(l));
  if (seg) {
    if (/^https?:\/\//.test(seg)) return seg;
    return new URL(seg, m3u8Url).href;
  }

  // 2. Procura todas as sub-playlists .m3u8 (não só a primeira!)
  const subplaylists = lines.filter(l => l.endsWith('.m3u8'));
  for (const subplaylist of subplaylists) {
    const nextUrl = /^https?:\/\//.test(subplaylist) ? subplaylist : new URL(subplaylist, m3u8Url).href;
    const found = await findFirstMediaSegment(nextUrl, username, maxDepth - 1);
    if (found) return found;
  }

  return null;
}

// =====================================================================================
// == Handler: Proxy seguro para segmento de mídia HLS (poster seguro para uso em canvas)
// =====================================================================================
/**
 * Busca o manifesto HLS do usuário, encontra o primeiro segmento de mídia suportado,
 * busca e retransmite com CORS permissivo.
 * Permite captura segura de frame pelo canvas do navegador do cliente.
 * Suporta segmentos .ts, .aac, .m4s, .mp4, sub-playlists e URLs absolutas ou relativas.
 */
// =====================
// Corrige: Busca robusta do HLS (tenta edgeURL e cdnURL)
// =====================
async function handlePosterSegmentProxy(username) {
  // 1. Busca informações de transmissão ao vivo
  const streamInfo = await handleLiveInfo(username);
  if (streamInfo.error) {
    return new Response(JSON.stringify({ error: "Usuário offline ou sem stream." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 2. Coleta todas as possíveis URLs de HLS
  const hlsUrls = [];
  if (streamInfo.edgeURL) hlsUrls.push({ url: streamInfo.edgeURL, type: "edge" });
  if (streamInfo.cdnURL) hlsUrls.push({ url: streamInfo.cdnURL, type: "cdn" });

  if (hlsUrls.length === 0) {
    return new Response(JSON.stringify({ error: "Nenhum URL de stream encontrada." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let foundSegment = null;
  let segmentUrl, lastError;

  // 3. Tenta cada HLS até encontrar um segmento válido
  for (const { url: hlsUrl, type } of hlsUrls) {
    try {
      segmentUrl = await findFirstMediaSegment(hlsUrl, username, 2);
      if (segmentUrl) {
        foundSegment = { segmentUrl, hlsUrl, type };
        break;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!foundSegment) {
    return new Response(JSON.stringify({ error: "Nenhum segmento de mídia encontrado no manifesto HLS." }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 4. Busca e retransmite o segmento com CORS universal
  const segRes = await fetch(foundSegment.segmentUrl, {
    headers: { referer: `https://pt.cam4.com/${username}` }
  });
  if (!segRes.ok) {
    return new Response(JSON.stringify({ error: "Falha ao buscar segmento de mídia." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 5. Detecta tipo mime pelo final do arquivo
  let mime = "video/MP2T";
  if (foundSegment.segmentUrl.endsWith('.aac')) mime = "audio/aac";
  if (foundSegment.segmentUrl.endsWith('.m4s')) mime = "video/iso.segment";
  if (foundSegment.segmentUrl.endsWith('.mp4')) mime = "video/mp4";
  return new Response(segRes.body, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": "inline; filename=\"poster" + foundSegment.segmentUrl.slice(-8) + "\"",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// =====================================================================
// == Worker principal: roteamento, filtros, respostas e erros globais ==
// =====================================================================
/**
 * Função principal do Worker: roteia requisições, executa filtros, trata erros.
 * Ordem de prioridade das rotas: 
 * 1. Poster seguro (proxy mídia HLS)
 * 2. Proxy de stream (redirecionamento)
 * 3. Proxy gravações via GAS
 * 4. Dados agregados do usuário
 * 5. Endpoints legados
 * 6. Listagem pública de transmissões
 * 7. Fallback 404
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);
    const pathname = url.pathname;

    // Pré-tratamento CORS para OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // === 1. POSTER SEGURO (Proxy para segmento de mídia HLS) ===
      if (pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/) && request.method === "GET") {
        const username = pathname.match(/^\/v1\/media\/poster\/([a-zA-Z0-9_]+)\/?$/)[1];
        return await handlePosterSegmentProxy(username);
      }

      // === 2. PROXY DE STREAM (Redirecionamento 302) ===
      const streamMatch = pathname.match(/^\/stream\/([a-zA-Z0-9_]+)\/?$/);
      if (streamMatch) {
        const username = streamMatch[1];
        const type = url.searchParams.get('type') || 'cdn';
        return await handleStreamProxy(username, type);
      }

      // === 3. PROXY PARA GRAVAÇÕES ===
      const recParam = url.searchParams.get("rec");
      if (recParam) {
        return await handleRecProxy(recParam, corsHeaders);
      }

      // === 4. DADOS CONSOLIDADOS DE USUÁRIO ===
      const userParam = url.searchParams.get("user");
      if (userParam) {
        return await handleUserFullInfo(userParam, corsHeaders);
      }

      // === 5. ENDPOINTS REST LEGADOS ===
      if (pathname.startsWith("/user/")) {
        const parts = pathname.split("/").filter(Boolean);
        const username = parts[1];
        if (parts[2] === "liveInfo") {
          const data = await handleLiveInfo(username);
          return new Response(JSON.stringify(data, null, 2), {
            headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const data = await handleUserProfile(username);
        return new Response(JSON.stringify(data, null, 2), {
          headers: { "Cache-Control": "no-store", ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // === 6. LISTAGEM DE TRANSMISSÕES PÚBLICAS (com filtros avançados) ===
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
        for (let offset = limit; offset < total && offset < 5000; offset += limit) {
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

      // === 7. FALLBACK: Endpoint não encontrado ===
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
 * ============================================================================
 * Fim do arquivo: xcam-api/index.js
 * 
 * Observação:
 * - Este Worker serve como gateway seguro XCam, centralizando lógica de proxy,
 *   agregação de dados externos, roteamento RESTful e aplicando boas práticas
 *   de arquitetura serverless, facilitando manutenções e futuras extensões.
 * - Para dúvidas, consulte a documentação Gemini/XCam ou contate o autor.
 * ============================================================================
 */